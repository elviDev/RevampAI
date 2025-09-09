import { tokenManager } from '../tokenManager';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3001/api/v1';

export class VoiceService {
  static async processVoiceCommand(transcript: string): Promise<any> {
    try {
      const token = await tokenManager.getToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }

      console.log(`🎤 VoiceService: Processing voice command: "${transcript.substring(0, 50)}..."`);

      const response = await fetch(`${API_BASE_URL}/voice/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          transcript: transcript,
          language: 'en-US'
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('❌ VoiceService: API error:', result);
        throw new Error(result.error || 'Failed to process voice command');
      }

      console.log('✅ VoiceService: Command processed successfully', {
        intent: result.command?.intent,
        actionCount: result.command?.actions?.length,
        processingTime: result.metrics?.processingTime
      });

      return {
        success: result.success,
        command: result.command,
        executionResult: result.executionResult,
        metrics: result.metrics,
        // Legacy format for backward compatibility
        intent: result.command?.intent,
        actions: result.command?.actions?.map((action: any) => action.description || action.type) || []
      };
    } catch (error) {
      console.error('❌ VoiceService: Error processing voice command:', error);
      
      // Fallback to local processing for now
      console.log('🔄 VoiceService: Falling back to local processing');
      const intent = this.parseIntent(transcript);
      
      return {
        success: true,
        intent,
        actions: this.generateActions(intent),
        isLocalFallback: true
      };
    }
  }

  static async getVoiceServiceHealth(): Promise<any> {
    try {
      const token = await tokenManager.getToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_BASE_URL}/voice/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return await response.json();
    } catch (error) {
      console.error('VoiceService: Health check failed:', error);
      throw error;
    }
  }

  private static parseIntent(transcript: string) {
    const lowerTranscript = transcript.toLowerCase();
    
    if (lowerTranscript.includes('create channel')) {
      return {
        type: 'create_channel',
        parameters: this.extractChannelParameters(transcript),
      };
    }
    
    if (lowerTranscript.includes('assign task')) {
      return {
        type: 'assign_task',
        parameters: this.extractTaskParameters(transcript),
      };
    }
    
    if (lowerTranscript.includes('schedule meeting')) {
      return {
        type: 'schedule_meeting',
        parameters: this.extractMeetingParameters(transcript),
      };
    }
    
    return {
      type: 'unknown',
      parameters: {},
    };
  }

  private static extractChannelParameters(transcript: string) {
    // Extract channel name, members, etc. from transcript
    const channelNameMatch = transcript.match(/channel\s+(?:for\s+)?(.+?)(?:\s+add|$)/i);
    const channelName = channelNameMatch?.[1] || 'New Channel';
    
    const members = [];
    if (transcript.includes('lead designer')) members.push('Lead Designer');
    if (transcript.includes('engineering lead')) members.push('Engineering Lead');
    if (transcript.includes('pm') || transcript.includes('product manager')) members.push('PM');
    if (transcript.includes('myself')) members.push('Myself');
    
    return {
      name: channelName,
      members,
      category: 'Projects',
    };
  }

  private static extractTaskParameters(transcript: string) {
    // Extract task details from transcript
    return {
      title: 'New Task',
      assignee: 'Team Member',
      priority: 'medium',
    };
  }

  private static extractMeetingParameters(transcript: string) {
    // Extract meeting details from transcript
    return {
      title: 'Team Meeting',
      attendees: [],
      duration: 60,
    };
  }

  private static generateActions(intent: any) {
    switch (intent.type) {
      case 'create_channel':
        return [
          'Create channel with specified parameters',
          'Add members to channel',
          'Set up project breakdown',
          'Send notifications to members',
        ];
      case 'assign_task':
        return [
          'Create task',
          'Assign to team member',
          'Set priority and due date',
          'Send notification',
        ];
      case 'schedule_meeting':
        return [
          'Create meeting event',
          'Add attendees',
          'Send calendar invites',
          'Set reminders',
        ];
      default:
        return ['Process general command'];
    }
  }
}