import { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { messageService } from '../services/api/messageService';
import { channelService } from '../services/api/channelService';
import { notificationService } from '../services/notificationService';
import { useWebSocket, webSocketService } from '../services/websocketService';
import { useToast } from '../contexts/ToastContext';
import { RootState } from '../store/store';
import type { Message, ChannelSummary } from '../types/chat';

export interface ChannelState {
  // Messages
  messages: Message[];
  isLoadingMessages: boolean;
  isLoadingMoreMessages: boolean;
  hasMoreMessages: boolean;
  messageError: string | null;
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };

  // Typing
  typingUsers: Array<{
    userId: string;
    userName: string;
    isTyping: boolean;
    lastTypingTime?: number;
  }>;

  // Message actions
  replyingTo: {
    id: string;
    content: string;
    sender: string;
    threadRoot?: string;
  } | null;
  editingMessage: {
    id: string;
    content: string;
  } | null;

  // Modals and UI state
  showSummaryModal: boolean;
  showKeyPointsModal: boolean;
  showEmojiPicker: string | null;
  showTaskIntegration: boolean;
  channelSummary: ChannelSummary | null;
  isGeneratingSummary: boolean;
  isCreatingTasks: boolean;

  // Channel info
  channelStats: {
    messageCount: number;
    fileCount: number;
  };
  actualChannelMembers: any[];
  isLoadingMembers: boolean;
}

export interface ChannelActions {
  // Message actions
  setReplyingTo: (message: { id: string; content: string; sender: string; threadRoot?: string } | null) => void;
  setEditingMessage: (message: { id: string; content: string } | null) => void;
  addOptimisticMessage: (message: Omit<Message, 'id'>) => void;
  
  // Loading messages
  loadMessages: () => Promise<void>;
  loadMoreMessages: () => Promise<void>;
  
  // Modal controls
  setShowSummaryModal: (show: boolean) => void;
  setShowKeyPointsModal: (show: boolean) => void;
  setShowEmojiPicker: (messageId: string | null) => void;
  setShowTaskIntegration: (show: boolean) => void;
  
  // Channel operations
  loadChannelStats: () => Promise<void>;
  loadChannelMembers: () => Promise<void>;
  generateSummary: () => Promise<void>;
}

export const useChannelState = (channelId: string): [ChannelState, ChannelActions] => {
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const currentUserId = currentUser?.id || 'unknown_user';
  const { showError, showSuccess, showInfo } = useToast();

  // Refs to prevent concurrent API calls
  const loadingMessagesRef = useRef(false);
  const loadingMoreMessagesRef = useRef(false);
  const loadingStatsRef = useRef(false);
  const loadingMembersRef = useRef(false);

  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<Array<{
    userId: string;
    userName: string;
    isTyping: boolean;
    lastTypingTime?: number;
  }>>([]);
  const [replyingTo, setReplyingTo] = useState<{
    id: string;
    content: string;
    sender: string;
    threadRoot?: string;
  } | null>(null);
  const [editingMessage, setEditingMessage] = useState<{
    id: string;
    content: string;
  } | null>(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [showKeyPointsModal, setShowKeyPointsModal] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isCreatingTasks, setIsCreatingTasks] = useState(false);
  const [channelSummary, setChannelSummary] = useState<ChannelSummary | null>(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLoadingMoreMessages, setIsLoadingMoreMessages] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [messageError, setMessageError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 50,
    offset: 0,
  });
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const [showTaskIntegration, setShowTaskIntegration] = useState(false);
  const [channelStats, setChannelStats] = useState<{
    messageCount: number;
    fileCount: number;
  }>({ messageCount: 0, fileCount: 0 });
  const [actualChannelMembers, setActualChannelMembers] = useState<any[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);

  // Load messages
  const loadMessages = useCallback(async () => {
    if (!channelId || loadingMessagesRef.current) return;
    
    try {
      loadingMessagesRef.current = true;
      setIsLoadingMessages(true);
      setMessageError(null);
      
      console.log(`[useChannelState] Loading messages for channel: ${channelId}`);
      
      const response = await messageService.getChannelMessages(channelId, {
        limit: pagination.limit,
        offset: 0,
      });
      
      console.log(`[useChannelState] Loaded ${response.data.messages.length} messages`);
      
      if (response.success && response.data) {
        // Sort messages chronologically (oldest to newest)
        const sortedMessages = response.data.messages.sort((a, b) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        setMessages(sortedMessages);
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination?.total || response.data.messages.length,
          offset: response.data.messages.length,
        }));
        setHasMoreMessages((response.data.pagination?.total || 0) > response.data.messages.length);
      }
    } catch (error: any) {
      console.error('[useChannelState] Error loading messages:', error);
      const errorMessage = error?.message || 'Failed to load messages';
      setMessageError(errorMessage);
      showError(errorMessage);
    } finally {
      loadingMessagesRef.current = false;
      setIsLoadingMessages(false);
    }
  }, [channelId, pagination.limit, showError]);

  // Load more messages
  const loadMoreMessages = useCallback(async () => {
    if (!hasMoreMessages || !channelId || loadingMoreMessagesRef.current) return;
    
    try {
      loadingMoreMessagesRef.current = true;
      setIsLoadingMoreMessages(true);
      
      const response = await messageService.getChannelMessages(channelId, {
        limit: pagination.limit,
        offset: pagination.offset,
      });
      
      if (response.success && response.data) {
        // Sort new messages and merge with existing ones
        const sortedNewMessages = response.data.messages.sort((a, b) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        
        setMessages(prev => {
          // Merge and sort all messages
          const allMessages = [...prev, ...sortedNewMessages];
          return allMessages.sort((a, b) => 
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );
        });
        
        setPagination(prev => ({
          ...prev,
          offset: prev.offset + response.data.messages.length,
        }));
        setHasMoreMessages(pagination.offset + response.data.messages.length < pagination.total);
      }
    } catch (error: any) {
      console.error('[useChannelState] Error loading more messages:', error);
      showError(error?.message || 'Failed to load more messages');
    } finally {
      loadingMoreMessagesRef.current = false;
      setIsLoadingMoreMessages(false);
    }
  }, [channelId, pagination, hasMoreMessages, showError]);

  // Add optimistic message
  const addOptimisticMessage = useCallback((message: Omit<Message, 'id'>) => {
    const optimisticMessage: Message = {
      ...message,
      id: `temp_${Date.now()}`,
      isOptimistic: true,
    };
    
    // Add to the end of the messages array (newest at bottom)
    setMessages(prev => [...prev, optimisticMessage]);
  }, []);

  // Load channel stats
  const loadChannelStats = useCallback(async () => {
    if (loadingStatsRef.current) return;
    
    try {
      loadingStatsRef.current = true;
      const stats = await channelService.getChannelStats(channelId);
      setChannelStats({
        messageCount: stats.messageCount || 0,
        fileCount: stats.fileCount || 0,
      });
    } catch (error) {
      console.error('[useChannelState] Error loading channel stats:', error);
    } finally {
      loadingStatsRef.current = false;
    }
  }, [channelId]);

  // Load channel members
  const loadChannelMembers = useCallback(async () => {
    if (loadingMembersRef.current) return;
    
    try {
      loadingMembersRef.current = true;
      setIsLoadingMembers(true);
      const response = await channelService.getChannelMembers(channelId);
      
      if (response.success && response.data) {
        setActualChannelMembers(response.data);
      }
    } catch (error) {
      console.error('[useChannelState] Error loading channel members:', error);
    } finally {
      loadingMembersRef.current = false;
      setIsLoadingMembers(false);
    }
  }, [channelId]);

  // Generate summary
  const generateSummary = useCallback(async () => {
    try {
      setIsGeneratingSummary(true);
      showInfo('Generating meeting summary...');
      
      // For now, create a mock summary
      const mockSummary: ChannelSummary = {
        id: `summary_${channelId}_${Date.now()}`,
        title: 'Channel Discussion Summary',
        keyPoints: [
          'Discussed project milestones and timelines',
          'Reviewed team performance metrics',
          'Planned upcoming sprint activities'
        ],
        decisions: [
          'Agreed to move forward with the current timeline',
          'Approved budget allocation for Q4'
        ],
        actionItems: [
          {
            id: 'action_1',
            title: 'Follow up on pending tasks',
            assigneeId: currentUserId,
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            priority: 'medium'
          }
        ],
        participants: [currentUserId],
        duration: '1 hour',
        generatedAt: new Date(),
      };
      
      setChannelSummary(mockSummary);
      setShowSummaryModal(true);
      showSuccess('Meeting summary generated successfully');
    } catch (error: any) {
      console.error('[useChannelState] Error generating summary:', error);
      showError(error?.message || 'Failed to generate summary');
    } finally {
      setIsGeneratingSummary(false);
    }
  }, [channelId, currentUserId, messages.length, showInfo, showSuccess, showError]);

  // Initial load - only run once when channelId changes
  useEffect(() => {
    let isMounted = true;
    
    const initializeChannel = async () => {
      if (!channelId || !isMounted) return;
      
      console.log(`[useChannelState] Initializing channel: ${channelId}`);
      
      // Reset all loading refs
      loadingMessagesRef.current = false;
      loadingStatsRef.current = false;
      loadingMembersRef.current = false;
      
      // Load messages
      if (!loadingMessagesRef.current) {
        try {
          loadingMessagesRef.current = true;
          setIsLoadingMessages(true);
          setMessageError(null);
          
          const messageResponse = await messageService.getChannelMessages(channelId, {
            limit: 50,
            offset: 0,
          });
          
          if (messageResponse.success && messageResponse.data && isMounted) {
            // Sort messages chronologically (oldest to newest)
            const sortedMessages = messageResponse.data.messages.sort((a, b) => 
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            );
            setMessages(sortedMessages);
            setPagination({
              total: messageResponse.data.pagination?.total || messageResponse.data.messages.length,
              limit: 50,
              offset: messageResponse.data.messages.length,
            });
            setHasMoreMessages((messageResponse.data.pagination?.total || 0) > messageResponse.data.messages.length);
          }
        } catch (error: any) {
          console.error('[useChannelState] Error loading messages:', error);
          if (isMounted) {
            setMessageError(error?.message || 'Failed to load messages');
            showError(error?.message || 'Failed to load messages');
          }
        } finally {
          loadingMessagesRef.current = false;
          if (isMounted) {
            setIsLoadingMessages(false);
          }
        }
      }
      
      // Load channel stats
      if (!loadingStatsRef.current) {
        try {
          loadingStatsRef.current = true;
          const stats = await channelService.getChannelStats(channelId);
          if (isMounted) {
            setChannelStats({
              messageCount: stats.messageCount || 0,
              fileCount: stats.fileCount || 0,
            });
          }
        } catch (error) {
          console.error('[useChannelState] Error loading channel stats:', error);
        } finally {
          loadingStatsRef.current = false;
        }
      }
      
      // Load channel members
      if (!loadingMembersRef.current) {
        try {
          loadingMembersRef.current = true;
          setIsLoadingMembers(true);
          const memberResponse = await channelService.getChannelMembers(channelId);
          
          if (memberResponse.success && memberResponse.data && isMounted) {
            setActualChannelMembers(memberResponse.data);
          }
        } catch (error) {
          console.error('[useChannelState] Error loading channel members:', error);
        } finally {
          loadingMembersRef.current = false;
          if (isMounted) {
            setIsLoadingMembers(false);
          }
        }
      }
      
      console.log(`[useChannelState] Channel initialization complete: ${channelId}`);
    };
    
    initializeChannel();
    
    return () => {
      isMounted = false;
      // Reset loading refs on cleanup
      loadingMessagesRef.current = false;
      loadingStatsRef.current = false;
      loadingMembersRef.current = false;
    };
  }, [channelId, showError]); // Only depend on channelId and showError

  // WebSocket event listeners for real-time updates
  useEffect(() => {
    if (!channelId) return;

    console.log(`[useChannelState] Setting up WebSocket listeners for channel: ${channelId}`);

    // Handle new messages
    const handleMessageSent = (event: any) => {
      if (event.channelId === channelId && event.message) {
        console.log('📨 New message received via WebSocket:', event);
        
        // Transform the message to our format
        const newMessage: Message = {
          id: event.message.id || event.messageId,
          type: event.message.message_type || 'text',
          content: event.message.content,
          sender: {
            id: event.message.user_id,
            name: event.message.user_name || event.userName || 'Unknown User',
            avatar: event.message.user_avatar,
            role: event.message.user_role || 'staff',
          },
          timestamp: new Date(event.message.created_at || event.timestamp),
          reactions: event.message.reactions || [],
          replies: [],
          mentions: event.message.mentions || [],
          isEdited: event.message.is_edited || false,
          connectedTo: event.message.reply_to,
          threadRoot: event.message.thread_root,
        };

        // Add message to state
        setMessages(prev => {
          // Check if message already exists to avoid duplicates
          if (prev.some(msg => msg.id === newMessage.id)) {
            return prev;
          }
          
          // Remove optimistic messages that are likely to be replaced by this real message
          // We'll be more conservative and only remove very recent optimistic messages
          const now = new Date(newMessage.timestamp).getTime();
          const filteredMessages = prev.filter(msg => {
            if (!msg.isOptimistic) return true; // Keep all non-optimistic messages
            
            // Keep optimistic messages that are more than 10 seconds old or have very different content
            const msgTime = new Date(msg.timestamp).getTime();
            const timeDiff = Math.abs(now - msgTime);
            const contentMatch = msg.content.trim().toLowerCase() === newMessage.content.trim().toLowerCase();
            
            return timeDiff > 10000 || !contentMatch;
          });
          
          // Add new message at the end (newest at bottom)
          const updatedMessages = [...filteredMessages, newMessage];
          
          // Sort to maintain chronological order (oldest to newest)
          return updatedMessages.sort((a, b) => 
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );
        });

        // Update message count in stats
        setChannelStats(prev => ({
          ...prev,
          messageCount: prev.messageCount + 1,
        }));
      }
    };

    // Handle message updates
    const handleMessageUpdated = (event: any) => {
      if (event.channelId === channelId && event.message) {
        console.log('✏️ Message updated via WebSocket:', event);
        
        setMessages(prev =>
          prev.map(msg =>
            msg.id === event.messageId
              ? {
                  ...msg,
                  content: event.message.content,
                  isEdited: true,
                  timestamp: new Date(event.message.updated_at || msg.timestamp),
                }
              : msg
          )
        );
      }
    };

    // Handle message deletions
    const handleMessageDeleted = (event: any) => {
      if (event.channelId === channelId) {
        console.log('🗑️ Message deleted via WebSocket:', event);
        
        setMessages(prev => prev.filter(msg => msg.id !== event.messageId));
        
        // Update message count in stats
        setChannelStats(prev => ({
          ...prev,
          messageCount: Math.max(0, prev.messageCount - 1),
        }));
      }
    };

    // Register event listeners
    webSocketService.on('message_sent', handleMessageSent);
    webSocketService.on('message_updated', handleMessageUpdated);
    webSocketService.on('message_deleted', handleMessageDeleted);

    // Cleanup function
    return () => {
      console.log(`[useChannelState] Cleaning up WebSocket listeners for channel: ${channelId}`);
      webSocketService.off('message_sent', handleMessageSent);
      webSocketService.off('message_updated', handleMessageUpdated);
      webSocketService.off('message_deleted', handleMessageDeleted);
    };
  }, [channelId]);

  const state: ChannelState = {
    messages,
    isLoadingMessages,
    isLoadingMoreMessages,
    hasMoreMessages,
    messageError,
    pagination,
    typingUsers,
    replyingTo,
    editingMessage,
    showSummaryModal,
    showKeyPointsModal,
    showEmojiPicker,
    showTaskIntegration,
    channelSummary,
    isGeneratingSummary,
    isCreatingTasks,
    channelStats,
    actualChannelMembers,
    isLoadingMembers,
  };

  const actions: ChannelActions = {
    setReplyingTo,
    setEditingMessage,
    addOptimisticMessage,
    loadMessages,
    loadMoreMessages,
    setShowSummaryModal,
    setShowKeyPointsModal,
    setShowEmojiPicker,
    setShowTaskIntegration,
    loadChannelStats,
    loadChannelMembers,
    generateSummary,
  };

  return [state, actions];
};
