import { authService } from './authService';
import { tokenManager } from '../tokenManager';
import { ApiResponse } from '../../types/api';

export interface Activity {
  id: string;
  user_id: string;
  type: 'task_created' | 'task_updated' | 'task_completed' | 'channel_created' | 'user_joined' | 'file_uploaded' | 'message_sent' | 'announcement';
  title: string;
  description: string;
  metadata: any;
  related_id?: string;
  channel_id?: string;
  created_at: string;
  user?: {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
  };
}

export interface ActivityListResponse {
  success: boolean;
  data: Activity[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  timestamp: string;
}

export interface ActivityFilter {
  type?: string[];
  channel_id?: string;
  user_id?: string;
  limit?: number;
  offset?: number;
  from_date?: string;
  to_date?: string;
}

/**
 * Activity API Service
 * Handles all activity-related API operations with authentication
 */
class ActivityService {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3001/api/v1';
  }

  /**
   * Check if using mock authentication in development
   */
  private async isUsingMockAuth(): Promise<boolean> {
    const token = await authService.getAccessToken();
    return token?.startsWith('dev-') || false;
  }

  /**
   * Get mock API response for development
   */
  private async getMockApiResponse(endpoint: string, config: RequestInit): Promise<any> {
    console.log('🎭 Using mock activity response for:', endpoint);
    
    // Mock activity data
    const mockActivities: Activity[] = [
      {
        id: 'activity-1',
        user_id: 'dev-user-id',
        type: 'task_created',
        title: 'New Task Created',
        description: 'Created task "Review quarterly reports"',
        metadata: { taskId: 'task-1', taskTitle: 'Review quarterly reports' },
        related_id: 'task-1',
        channel_id: 'channel-1',
        created_at: new Date().toISOString(),
        user: {
          id: 'dev-user-id',
          name: 'Alexander Johnson',
          email: 'ceo@seeddata.com',
          avatar_url: undefined
        }
      },
      {
        id: 'activity-2',
        user_id: 'dev-user-id',
        type: 'task_updated',
        title: 'Task Progress Updated',
        description: 'Updated progress on "Security protocols" to 25%',
        metadata: { taskId: 'task-2', progress: 25 },
        related_id: 'task-2',
        channel_id: 'channel-1',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        user: {
          id: 'dev-user-id',
          name: 'Alexander Johnson',
          email: 'ceo@seeddata.com',
          avatar_url: undefined
        }
      },
      {
        id: 'activity-3',
        user_id: 'dev-user-id',
        type: 'announcement',
        title: 'Company Update',
        description: 'Shared important company news with all teams',
        metadata: { announcement: 'Q3 results announced' },
        channel_id: 'general',
        created_at: new Date(Date.now() - 7200000).toISOString(),
        user: {
          id: 'dev-user-id',
          name: 'Alexander Johnson',
          email: 'ceo@seeddata.com',
          avatar_url: undefined
        }
      }
    ];

    // Return appropriate mock response based on endpoint
    if (endpoint.includes('/activities')) {
      return {
        success: true,
        data: mockActivities,
        pagination: {
          total: mockActivities.length,
          limit: 50,
          offset: 0,
          hasMore: false
        },
        timestamp: new Date().toISOString()
      };
    }

    // Default response
    return {
      success: true,
      data: [],
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Make authenticated API request
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      
      // Get the access token from authService
      const accessToken = await tokenManager.getCurrentToken();
      
      const config: RequestInit = {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
          ...options.headers,
        },
      };

      console.log('🔄 ActivityService request:', {
        endpoint,
        url,
        hasToken: !!accessToken,
        tokenLength: accessToken ? accessToken.length : 0,
        headers: config.headers
      });

      return await authService.withAuth(async () => {
        const response = await fetch(url, config);
        
        if (!response.ok) {
          let errorData: any = {};
          try {
            errorData = await response.json();
          } catch {
            // Ignore JSON parsing errors for error responses
          }
          
          const error = new Error(
            errorData.message || 
            errorData.error?.message || 
            `HTTP ${response.status}: ${response.statusText}`
          );
          
          throw error;
        }
        
        return response.json();
      });
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      
      throw new Error('Unknown error occurred');
    }
  }

  /**
   * Get activities with filters and pagination
   */
  async getActivities(filters?: ActivityFilter): Promise<ActivityListResponse> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v.toString()));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    const queryString = params.toString();
    const endpoint = `/activities${queryString ? `?${queryString}` : ''}`;
    
    return this.makeRequest<ActivityListResponse>(endpoint);
  }

  /**
   * Get user's activities
   */
  async getUserActivities(userId?: string, limit: number = 50): Promise<ActivityListResponse> {
    const filters: ActivityFilter = {
      limit,
    };

    if (userId) {
      filters.user_id = userId;
    }

    return this.getActivities(filters);
  }

  /**
   * Get channel activities
   */
  async getChannelActivities(channelId: string, limit: number = 50): Promise<ActivityListResponse> {
    return this.getActivities({
      channel_id: channelId,
      limit,
    });
  }

  /**
   * Get activities by type
   */
  async getActivitiesByType(
    types: string[], 
    limit: number = 50
  ): Promise<ActivityListResponse> {
    return this.getActivities({
      type: types,
      limit,
    });
  }

  /**
   * Get recent activities
   */
  async getRecentActivities(limit: number = 20): Promise<ActivityListResponse> {
    return this.getActivities({
      limit,
    });
  }

  /**
   * Create activity (usually called from backend on events)
   */
  async createActivity(activityData: {
    type: string;
    title: string;
    description: string;
    metadata?: any;
    related_id?: string;
    channel_id?: string;
  }): Promise<ApiResponse<Activity>> {
    return this.makeRequest<ApiResponse<Activity>>('/activities', {
      method: 'POST',
      body: JSON.stringify(activityData),
    });
  }
}

export const activityService = new ActivityService();