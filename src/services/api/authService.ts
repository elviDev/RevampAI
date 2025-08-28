import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform } from 'react-native';
import type { User, AuthTokens } from '../../types/auth';

// Detect if running on physical device vs emulator/simulator
const getAPIBaseURL = () => {
  if (__DEV__) {
    // Development mode
    if (Platform.OS === 'android') {
      // Check if running on emulator (10.0.2.2 is emulator's host)
      // For physical devices, use your computer's local IP
      return 'http://192.168.1.5:3000'; // Your computer's IP address
    } else if (Platform.OS === 'ios') {
      // iOS simulator can use localhost
      return 'http://localhost:3000';
    }
  }
  // Production URL would go here
  return 'http://192.168.1.5:3000'; // Fallback to your computer's IP
};

const API_BASE_URL = getAPIBaseURL();

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: 'ceo' | 'manager' | 'staff';
  department?: string;
  job_title?: string;
  phone?: string;
}

interface PasswordResetRequest {
  email: string;
}

interface PasswordResetConfirmRequest {
  token: string;
  newPassword: string;
}

interface RefreshTokenRequest {
  refreshToken: string;
}

interface AuthResponse {
  success: boolean;
  data: AuthTokens & {
    user: User;
  };
}

interface ApiErrorResponse {
  error: {
    message: string;
    code: string;
  };
}

class AuthService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const token = await this.getAccessToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (
      token &&
      !endpoint.includes('refresh') &&
      !endpoint.includes('login') &&
      !endpoint.includes('register')
    ) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle error response format from backend
        throw new Error(data.message || data.error?.message || 'Request failed');
      }

      return data;
    } catch (error: any) {
      // Better error logging
      if (error.message === 'Network request failed') {
        console.error('Network error - Backend server may not be running');
        console.error('Ensure backend is running on:', API_BASE_URL);
        throw new Error('Cannot connect to server. Please ensure the backend is running.');
      }
      console.error('API Request failed:', error);
      throw error;
    }
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    console.log('Attempting login with:', credentials.email);
    console.log('API URL:', `${API_BASE_URL}/api/v1/auth/login`);
    
    const response = await this.makeRequest<AuthResponse>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    console.log('Login response:', response);

    if (response.success && response.data) {
      // Store tokens with simplified structure
      await this.storeTokens({
        accessToken: response.data.token || response.data.accessToken,
        refreshToken: response.data.refreshToken || response.data.token,
        expiresIn: 7 * 24 * 60 * 60 // 7 days in seconds
      });
    }

    return response;
  }

  async register(
    userData: RegisterRequest,
  ): Promise<{ success: boolean; data: { user: User; message: string } }> {
    const response = await this.makeRequest<any>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    // Store tokens if registration includes auto-login
    if (response.success && response.data?.token) {
      await this.storeTokens({
        accessToken: response.data.token,
        refreshToken: response.data.refreshToken || response.data.token,
        expiresIn: 7 * 24 * 60 * 60
      });
    }

    return response;
  }

  async logout(): Promise<void> {
    try {
      await this.makeRequest('/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.warn('Logout request failed, proceeding with local logout');
    } finally {
      await this.clearTokens();
    }
  }

  async requestPasswordReset(
    email: string,
  ): Promise<{ success: boolean; message: string }> {
    const response = await this.makeRequest<{
      success: boolean;
      message: string;
    }>('/api/v1/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });

    return response;
  }

  async resetPassword(
    token: string,
    password: string,
  ): Promise<{ success: boolean; message: string }> {
    const response = await this.makeRequest<{
      success: boolean;
      message: string;
    }>('/api/v1/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });

    return response;
  }

  async refreshToken(): Promise<AuthTokens> {
    const refreshToken = await this.getRefreshToken();

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.makeRequest<{
      success: boolean;
      data: AuthTokens;
    }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });

    if (response.success) {
      await this.storeTokens(response.data);
      return response.data;
    }

    throw new Error('Token refresh failed');
  }

  async getCurrentUser(): Promise<{ success: boolean; data: { user: User } }> {
    const response = await this.makeRequest<{
      success: boolean;
      data: { user: User };
    }>('/api/v1/users/profile');
    return response;
  }

  async verifyEmail(
    token: string,
  ): Promise<{ success: boolean; message: string }> {
    const response = await this.makeRequest<{
      success: boolean;
      message: string;
    }>(`/auth/verify-email/${token}`);
    return response;
  }

  // Token management
  private async storeTokens(tokens: AuthTokens): Promise<void> {
    try {
      await AsyncStorage.multiSet([
        ['accessToken', tokens.accessToken],
        ['refreshToken', tokens.refreshToken],
        ['tokenExpiresAt', (Date.now() + tokens.expiresIn * 1000).toString()],
      ]);
    } catch (error) {
      console.error('Failed to store tokens:', error);
      throw error;
    }
  }

  async getAccessToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const expiresAt = await AsyncStorage.getItem('tokenExpiresAt');

      if (!token || !expiresAt) {
        return null;
      }

      // Check if token is expired
      if (Date.now() >= parseInt(expiresAt, 10)) {
        // Try to refresh token
        try {
          const newTokens = await this.refreshToken();
          return newTokens.accessToken;
        } catch (error) {
          await this.clearTokens();
          return null;
        }
      }

      return token;
    } catch (error) {
      console.error('Failed to get access token:', error);
      return null;
    }
  }

  private async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('refreshToken');
    } catch (error) {
      console.error('Failed to get refresh token:', error);
      return null;
    }
  }

  async clearTokens(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        'accessToken',
        'refreshToken',
        'tokenExpiresAt',
      ]);
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  }

  async isTokenValid(): Promise<boolean> {
    try {
      const token = await this.getAccessToken();
      return !!token;
    } catch (error) {
      return false;
    }
  }

  // Auto-refresh token wrapper
  async withAuth<T>(apiCall: () => Promise<T>): Promise<T> {
    try {
      return await apiCall();
    } catch (error: any) {
      if (
        error.message?.includes('401') ||
        error.message?.includes('Unauthorized')
      ) {
        try {
          await this.refreshToken();
          return await apiCall();
        } catch (refreshError) {
          await this.clearTokens();
          throw new Error('Session expired. Please login again.');
        }
      }
      throw error;
    }
  }
}

export const authService = new AuthService();
