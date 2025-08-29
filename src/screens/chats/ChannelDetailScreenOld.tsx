import React, { useRef } from 'react';
import {
  View,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { ChannelHeader } from '../../components/chat/ChannelHeader';
import { ChannelActions } from '../../components/chat/ChannelActions';
import { MessageListContainer } from '../../components/chat/MessageListContainer';
import { ChannelInputContainer } from '../../components/chat/ChannelInputContainer';
import { ChannelModalsContainer } from '../../components/chat/ChannelModalsContainer';
import { useChannelState } from '../../hooks/useChannelState';
import { useMessageActions } from '../../hooks/useMessageActions';
import { useWebSocket } from '../../services/websocketService';
import { useToast } from '../../contexts/ToastContext';
import { RootState } from '../../store/store';
import type { MainStackParamList } from '../../navigation/MainNavigator';

type ChannelDetailScreenProps = NativeStackScreenProps<MainStackParamList, 'ChannelDetailScreen'>;

export const ChannelDetailScreen: React.FC<ChannelDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const { channelId, channelName, members } = route.params;
  const insets = useSafeAreaInsets();
  
  // Get current user from auth state
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const currentUserId = currentUser?.id || 'unknown_user';
  const currentUserName = currentUser?.username || 'Unknown User';
  
  const { isConnected } = useWebSocket();
  const { showError, showSuccess, showInfo } = useToast();

  // Use custom hooks for state management
  const [channelState, channelActions] = useChannelState(channelId, currentUserId);
  
  const {
    // Message state
    messages,
    isLoadingMessages,
    isLoadingMoreMessages,
    hasMoreMessages,
    messageError,
    typingUsers,
    
    // Channel state
    channelStats,
    actualChannelMembers,
    isLoadingMembers,
    
    // Modal state
    showSummaryModal,
    showKeyPointsModal,
    showTaskIntegration,
    showEmojiPicker,
    channelSummary,
    isGeneratingSummary,
    isCreatingTasks,
    
    // Reply/Edit state
    replyingTo,
    editingMessage,
  } = channelState;

  const {
    // Actions
    loadMessages,
    loadMoreMessages,
    setReplyingTo,
    setEditingMessage,
    setShowSummaryModal,
    setShowKeyPointsModal,
    setShowTaskIntegration,
    setShowEmojiPicker,
    generateSummary,
  } = channelActions;

  // Use message actions hook
  const {
    handleSendMessage,
    handleEditMessage,
    handleDeleteMessage,
    handleReaction,
    handleSendVoiceMessage,
    handleAttachFile,
    handleStartTyping,
    handleStopTyping,
  } = useMessageActions(
    channelId,
    currentUserId,
    currentUserName,
    (message) => {
      // This would be handled by the useChannelState hook
      console.log('Optimistic message added:', message);
    },
    replyingTo,
    editingMessage,
    setReplyingTo,
    setEditingMessage
  );

  // Enhanced members for UI consistency - use actual channel members if available
  const enhancedMembers = (actualChannelMembers.length > 0 ? actualChannelMembers : members || []).map((member, index) => ({
    id: member?.id || member?.user_id || `member_${index}`,
    name: member?.name || member?.user_name || `User ${index + 1}`,
    role: member?.role || 'Member',
    avatar: member?.avatar || member?.user_avatar || member?.name?.charAt(0) || member?.user_name?.charAt(0) || undefined,
    isOnline: member?.isOnline || true,
  }));

  // Message wrapper functions to handle different signatures
  const handleSendMessageWrapper = (content: string) => {
    handleSendMessage(content, 'text');
  };

  const handleAttachFileWrapper = (file: any) => {
    if (file?.uri && file?.name) {
      handleAttachFile(file.uri, file.name);
    }
  };

  const handleAttachImageWrapper = (image: any) => {
    if (image?.uri && image?.name) {
      handleAttachFile(image.uri, image.name);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    if (showEmojiPicker) {
      handleReaction(showEmojiPicker, emoji);
      setShowEmojiPicker(null);
    }
  };

  const handleShareSummary = () => {
    showSuccess('Meeting summary shared with team');
    setShowSummaryModal(false);
  };

  const handleCreateTasksFromSummary = () => {
    showSuccess('Tasks created from action items');
    setShowSummaryModal(false);
  };

  const handleCreateTaskFromKeyPoints = (taskData: any) => {
    showSuccess(`Task "${taskData.title}" created`);
    setShowKeyPointsModal(false);
  };
  }));

  // Load channel statistics
  const loadChannelStats = async () => {
    try {
      console.log('🔄 Loading channel stats for:', channelId);
      const stats = await channelService.getChannelStats(channelId);
      console.log('✅ Channel stats loaded:', stats);
      
      setChannelStats({
        messageCount: stats.messageCount,
        fileCount: stats.fileCount,
      });
    } catch (error) {
      console.error('❌ Failed to load channel stats:', error);
      setChannelStats({ messageCount: 0, fileCount: 0 });
    }
  };

  // Load actual channel members from API
  const loadChannelMembers = async () => {
    try {
      setIsLoadingMembers(true);
      console.log('🔄 Loading channel members for:', channelId);
      
      const membersResponse = await channelService.getChannelMembers(channelId, { limit: 50 });
      const actualMembers = membersResponse?.data?.map((member: any) => ({
        id: member.user_id,
        user_id: member.user_id, // Keep both for compatibility
        name: member.user_name || 'Unknown User',
        user_name: member.user_name, // Keep both for compatibility
        avatar: member.user_avatar || member.user_name?.charAt(0) || '?',
        user_avatar: member.user_avatar, // Keep both for compatibility
        role: member.role,
        isOnline: member.is_online || false,
      })) || [];
      
      console.log('✅ Channel members loaded:', actualMembers.length, 'members');
      setActualChannelMembers(actualMembers);
    } catch (error: any) {
      console.error('❌ Failed to load channel members:', error);
      
      // Handle permission errors gracefully
      if (error?.statusCode === 403 || error?.message?.includes('403')) {
        console.log(`📝 Channel "${channelName}" members not accessible (private/restricted access)`);
        showInfo('Unable to load member details for this channel');
      } else {
        console.warn('Failed to fetch members for channel:', channelName, error?.message || error);
        // Keep using the passed members as fallback
        setActualChannelMembers(members || []);
      }
    } finally {
      setIsLoadingMembers(false);
    }
  };

  // Load messages on mount and join channel
  useEffect(() => {
    // Reset state when channel changes
    setMessages([]);
    setPagination(prev => ({ ...prev, offset: 0 }));
    setHasMoreMessages(true);
    setMessageError(null);
    
    loadMessages();
    loadChannelStats(); // Load channel statistics
    loadChannelMembers(); // Load actual channel members
    
    // Join channel for real-time updates
    if (isConnected) {
      joinChannel(channelId);
      console.log('🔗 Joined channel for real-time updates:', channelId);
    }

    // Leave channel on cleanup
    return () => {
      if (isConnected) {
        leaveChannel(channelId);
        console.log('🔚 Left channel:', channelId);
      }
    };
  }, [channelId, isConnected]);

  // Handle WebSocket reconnection
  useEffect(() => {
    if (isConnected) {
      joinChannel(channelId);
      console.log('🔄 Rejoined channel after reconnection:', channelId);
    }
  }, [isConnected]);

  /**
   * Transform backend message format to frontend Message format
   */
  const transformWebSocketMessage = (backendMsg: any): Message => {
    return {
      id: backendMsg.id,
      type: mapMessageType(backendMsg.message_type || backendMsg.messageType),
      content: backendMsg.content,
      voiceTranscript: backendMsg.transcription,
      audioUri: backendMsg.voice_data?.audio_url,
      fileUrl: backendMsg.attachments?.[0]?.url,
      fileName: backendMsg.attachments?.[0]?.filename,
      sender: {
        id: backendMsg.sender?.id || backendMsg.user_id || backendMsg.userId,
        name: backendMsg.sender?.name || backendMsg.user_name || backendMsg.userName || 'Unknown User',
        avatar: backendMsg.sender?.avatar || backendMsg.user_avatar,
        role: backendMsg.sender?.role || backendMsg.user_role || backendMsg.userRole || 'staff',
      },
      timestamp: new Date(backendMsg.timestamp || backendMsg.created_at),
      reactions: transformReactions(backendMsg.reactions),
      replies: [], // TODO: Load replies when needed
      mentions: Array.isArray(backendMsg.mentions) ? backendMsg.mentions : [],
      isEdited: backendMsg.is_edited || backendMsg.isEdited || false,
      connectedTo: backendMsg.reply_to || backendMsg.replyTo,
      aiSummary: backendMsg.ai_context?.summary,
      taskAssignments: [],
    };
  };

  const mapMessageType = (backendType: string): Message['type'] => {
    switch (backendType) {
      case 'text': return 'text';
      case 'voice': return 'voice';
      case 'file': return 'file';
      case 'image': return 'image';
      case 'system': return 'system';
      case 'command_result': return 'system';
      case 'ai_response': return 'system';
      default: return 'text';
    }
  };

  const transformReactions = (backendReactions: any): Message['reactions'] => {
    if (!backendReactions || typeof backendReactions !== 'object') {
      return [];
    }

    if (Array.isArray(backendReactions)) {
      return backendReactions;
    }

    return Object.entries(backendReactions).map(([emoji, users]) => ({
      emoji,
      users: Array.isArray(users) ? users : [],
      count: Array.isArray(users) ? users.length : 0,
    }));
  };

  /**
   * Update reactions array with add/remove operations
   */
  const updateReaction = (
    currentReactions: Message['reactions'], 
    emoji: string, 
    userId: string, 
    action: 'add' | 'remove'
  ): Message['reactions'] => {
    const existingReactionIndex = currentReactions.findIndex(r => r.emoji === emoji);
    
    if (action === 'add') {
      if (existingReactionIndex >= 0) {
        // Add user to existing reaction if not already there
        const existingReaction = currentReactions[existingReactionIndex];
        if (!existingReaction.users.includes(userId)) {
          const updatedReactions = [...currentReactions];
          updatedReactions[existingReactionIndex] = {
            ...existingReaction,
            users: [...existingReaction.users, userId],
            count: existingReaction.count + 1,
          };
          return updatedReactions;
        }
        return currentReactions;
      } else {
        // Create new reaction
        return [
          ...currentReactions,
          {
            emoji,
            users: [userId],
            count: 1,
          },
        ];
      }
    } else {
      // Remove action
      if (existingReactionIndex >= 0) {
        const existingReaction = currentReactions[existingReactionIndex];
        const updatedUsers = existingReaction.users.filter(u => u !== userId);
        
        if (updatedUsers.length === 0) {
          // Remove entire reaction if no users left
          return currentReactions.filter((_, index) => index !== existingReactionIndex);
        } else {
          // Update reaction with reduced user count
          const updatedReactions = [...currentReactions];
          updatedReactions[existingReactionIndex] = {
            ...existingReaction,
            users: updatedUsers,
            count: updatedUsers.length,
          };
          return updatedReactions;
        }
      }
      return currentReactions;
    }
  };

  // Set up WebSocket event listeners for real-time messages
  useEffect(() => {
    const handleMessageSent = (event: MessageEvent) => {
      if (event.channelId === channelId && event.message) {
        console.log('📨 Received new message via WebSocket:', event);
        const newMessage = transformWebSocketMessage(event.message);
        
        setMessages(prev => {
          // If this is our own message, replace the optimistic version
          const optimisticIndex = prev.findIndex(msg => 
            msg.isOptimistic && 
            msg.sender.id === currentUserId && 
            msg.content === newMessage.content &&
            Math.abs(new Date(msg.timestamp).getTime() - new Date(newMessage.timestamp).getTime()) < 5000 // Within 5 seconds
          );

          if (optimisticIndex !== -1) {
            // Replace optimistic message with real message
            const updatedMessages = [...prev];
            updatedMessages[optimisticIndex] = { ...newMessage, isOptimistic: false };
            return updatedMessages;
          }

          // Check if message already exists to avoid duplicates
          if (prev.some(msg => msg.id === newMessage.id)) {
            return prev;
          }

          // Add new message and maintain chronological order
          const updatedMessages = [...prev, newMessage];
          return updatedMessages.sort((a, b) => 
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );
        });

        // Auto-scroll to bottom for new messages (but not for our own optimistic ones)
        const isOwnMessage = event.message.sender.id === currentUserId;
        if (!isOwnMessage) {
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }
      }
    };

    const handleMessageUpdated = (event: MessageEvent) => {
      if (event.channelId === channelId && event.message) {
        console.log('✏️ Message updated via WebSocket:', event);
        const updatedMessage = transformWebSocketMessage(event.message);
        setMessages(prev =>
          prev.map(msg =>
            msg.id === event.messageId
              ? { ...msg, ...updatedMessage, isEdited: true }
              : msg
          )
        );
      }
    };

    const handleMessageDeleted = (event: MessageEvent) => {
      if (event.channelId === channelId) {
        console.log('🗑️ Message deleted via WebSocket:', event);
        setMessages(prev => prev.filter(msg => msg.id !== event.messageId));
      }
    };

    const handleMessageReactionAdded = (event: MessageReactionEvent) => {
      if (event.channelId === channelId) {
        console.log('👍 Reaction added via WebSocket:', event);
        setMessages(prev =>
          prev.map(msg =>
            msg.id === event.messageId
              ? {
                  ...msg,
                  reactions: updateReaction(msg.reactions, event.emoji, event.userId, 'add'),
                }
              : msg
          )
        );
      }
    };

    const handleMessageReactionRemoved = (event: MessageReactionEvent) => {
      if (event.channelId === channelId) {
        console.log('👎 Reaction removed via WebSocket:', event);
        setMessages(prev =>
          prev.map(msg =>
            msg.id === event.messageId
              ? {
                  ...msg,
                  reactions: updateReaction(msg.reactions, event.emoji, event.userId, 'remove'),
                }
              : msg
          )
        );
      }
    };

    // Add event listeners
    webSocketService.on('message_sent', handleMessageSent);
    webSocketService.on('message_updated', handleMessageUpdated);
    webSocketService.on('message_deleted', handleMessageDeleted);
    webSocketService.on('message_reaction_added', handleMessageReactionAdded);
    webSocketService.on('message_reaction_removed', handleMessageReactionRemoved);

    // Typing event handlers
    const handleTypingStart = (event: {
      channelId: string;
      userId: string;
      userName: string;
      timestamp: string;
    }) => {
      if (event.channelId !== channelId || event.userId === currentUserId) return;

      console.log('✏️ User started typing:', event.userName);

      setTypingUsers(prev => {
        const existing = prev.find(u => u.userId === event.userId);
        if (existing) {
          return prev.map(u => 
            u.userId === event.userId 
              ? { ...u, isTyping: true, lastTypingTime: Date.now() }
              : u
          );
        } else {
          return [...prev, {
            userId: event.userId,
            userName: event.userName,
            isTyping: true,
            lastTypingTime: Date.now(),
          }];
        }
      });

      // Auto-stop typing after 3 seconds if no stop event
      setTimeout(() => {
        setTypingUsers(current => 
          current.map(u => 
            u.userId === event.userId && (Date.now() - (u.lastTypingTime || 0)) >= 2900
              ? { ...u, isTyping: false }
              : u
          ).filter(u => u.isTyping || (Date.now() - (u.lastTypingTime || 0)) < 5000) // Remove old entries
        );
      }, 3000);
    };

    const handleTypingStop = (event: {
      channelId: string;
      userId: string;
      userName: string;
      timestamp: string;
    }) => {
      if (event.channelId !== channelId || event.userId === currentUserId) return;

      console.log('⏹️ User stopped typing:', event.userName);

      setTypingUsers(prev => 
        prev.map(u => 
          u.userId === event.userId 
            ? { ...u, isTyping: false }
            : u
        ).filter(u => u.isTyping || (Date.now() - (u.lastTypingTime || 0)) < 2000) // Keep recent entries briefly
      );
    };

    // Add typing event listeners
    webSocketService.on('channel_typing_start', handleTypingStart);
    webSocketService.on('channel_typing_stop', handleTypingStop);

    // Cleanup event listeners
    return () => {
      webSocketService.off('message_sent', handleMessageSent);
      webSocketService.off('message_updated', handleMessageUpdated);
      webSocketService.off('message_deleted', handleMessageDeleted);
      webSocketService.off('message_reaction_added', handleMessageReactionAdded);
      webSocketService.off('message_reaction_removed', handleMessageReactionRemoved);
      webSocketService.off('channel_typing_start', handleTypingStart);
      webSocketService.off('channel_typing_stop', handleTypingStop);
    };
  }, [channelId, currentUserId]);

  const loadMessages = async (loadMore: boolean = false) => {
    if (loadMore && (!hasMoreMessages || isLoadingMoreMessages)) {
      return;
    }

    try {
      if (loadMore) {
        setIsLoadingMoreMessages(true);
      } else {
        setIsLoadingMessages(true);
        setMessageError(null);
      }
      
      const currentOffset = loadMore ? pagination.offset + pagination.limit : 0;
      console.log('🔄 Loading messages for channel:', channelId, { 
        loadMore, 
        currentOffset, 
        hasMoreMessages,
        isLoadingMoreMessages,
        totalMessages: messages.length,
        channelName
      });
      
      const response = await messageService.getChannelMessages(channelId, {
        limit: pagination.limit,
        offset: currentOffset,
      });

      if (response.success && response.data.messages) {
        const newMessages = response.data.messages;
        
        // Sort messages in ascending order by timestamp (oldest first, newest last)
        const sortedMessages = newMessages.sort((a, b) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

        if (loadMore) {
          // For pagination, prepend older messages to the beginning
          // Since backend returns DESC order, newer pages have older messages
          setMessages(prev => {
            const combined = [...sortedMessages, ...prev];
            // Remove duplicates based on message ID
            const unique = combined.filter((msg, index, arr) => 
              arr.findIndex(m => m.id === msg.id) === index
            );
            // Sort the entire list to maintain chronological order (oldest to newest)
            return unique.sort((a, b) => 
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            );
          });
        } else {
          // Initial load - set all messages in chronological order (oldest to newest)
          setMessages(sortedMessages);
        }

        // Update pagination info
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination.total,
          offset: currentOffset,
        }));
        
        setHasMoreMessages(response.data.pagination.hasMore);
        
        console.log('✅ Messages loaded successfully:', {
          newMessages: sortedMessages.length,
          totalMessages: loadMore ? messages.length + sortedMessages.length : sortedMessages.length,
          hasMore: response.data.pagination.hasMore,
          offset: currentOffset,
        });

        // Auto-scroll to bottom only on initial load
        if (!loadMore) {
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: false });
          }, 100);
        }
      } else {
        console.warn('⚠️ No messages received from API');
        if (!loadMore) {
          setMessages([]);
        }
      }
    } catch (error) {
      console.error('❌ Error loading messages:', error);
      
      // Get more detailed error information
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const detailedError = `Failed to load messages: ${errorMessage}`;
      
      // Check token status for debugging
      import('../../services/tokenManager').then(({ tokenManager }) => {
        tokenManager.getTokenInfo().then((tokenInfo: any) => {
          console.log('🔍 Token debugging info:', tokenInfo);
        });
      });
      
      setMessageError(detailedError);
      
      if (!loadMore) {
        setMessages([]);
      }
    } finally {
      setIsLoadingMessages(false);
      setIsLoadingMoreMessages(false);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Generate optimistic message ID
    const optimisticMessageId = `temp_${Date.now()}`;
    const mentions = extractMentions(text);

    try {
      if (editingMessage) {
        // Update existing message via API
        console.log('✏️ Editing message:', editingMessage.id);
        const response = await messageService.editMessage(channelId, editingMessage.id, text);
        
        if (response.success) {
          setMessages(prev =>
            prev.map(msg =>
              msg.id === editingMessage.id
                ? { ...msg, content: text, isEdited: true }
                : msg,
            ),
          );
          setEditingMessage(null);
        }
      } else if (replyingTo) {
        // Add optimistic reply to UI immediately
        const optimisticReply = {
          id: optimisticMessageId,
          content: text,
          sender: { 
            id: currentUserId, 
            name: currentUser?.name || 'You' 
          },
          timestamp: new Date(),
          reactions: [],
        };

        setMessages(prev =>
          prev.map(msg =>
            msg.id === replyingTo.id
              ? { 
                  ...msg, 
                  replies: [...msg.replies, optimisticReply],
                  replyCount: (msg.replyCount || 0) + 1,
                  lastReplyTimestamp: new Date()
                }
              : msg
          )
        );

        // Send thread reply via API
        console.log('💬 Sending thread reply to message:', replyingTo.id);
        const response = await messageService.sendReply(channelId, replyingTo.id, {
          content: text,
          message_type: 'text',
          mentions,
        });

        if (response.success) {
          console.log('✅ Thread reply sent successfully');
          
          // Replace optimistic message with real one when WebSocket update arrives
          // Clear reply state
          setReplyingTo(null);
          
          // Send push notifications to channel members (except sender)
          try {
            await notificationService.sendChannelNotification({
              channelId,
              senderId: currentUserId,
              senderName: currentUser?.name || 'Someone',
              message: text,
              type: 'thread_reply',
              parentMessageId: replyingTo.id
            });
          } catch (notifError) {
            console.warn('Failed to send push notification:', notifError);
          }
        } else {
          // Remove optimistic message on failure
          setMessages(prev =>
            prev.map(msg =>
              msg.id === replyingTo.id
                ? {
                    ...msg,
                    replies: msg.replies.filter(reply => reply.id !== optimisticMessageId),
                    replyCount: Math.max(0, (msg.replyCount || 1) - 1)
                  }
                : msg
            )
          );
        }
      } else {
        // Add optimistic message to UI immediately
        const optimisticMessage: Message = {
          id: optimisticMessageId,
          type: 'text',
          content: text,
          sender: { 
            id: currentUserId, 
            name: currentUser?.name || 'You', 
            role: currentUser?.role || 'Member',
            avatar: currentUser?.avatar_url
          },
          timestamp: new Date(),
          reactions: [],
          replies: [],
          mentions,
          isEdited: false,
          isOptimistic: true, // Flag to identify optimistic messages
        };

        setMessages(prev => [...prev, optimisticMessage]);

        // Auto-scroll to bottom immediately
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 50);

        // Send new message via API
        console.log('📤 Sending new message');
        const response = await messageService.sendMessage(channelId, {
          content: text,
          message_type: 'text',
          mentions,
        });

        if (response.success) {
          console.log('✅ Message sent successfully');
          
          // Update message count
          setChannelStats(prev => ({
            ...prev,
            messageCount: prev.messageCount + 1,
          }));

          // Send push notifications to all channel members except sender
          try {
            await notificationService.sendChannelNotification({
              channelId,
              senderId: currentUserId,
              senderName: currentUser?.name || 'Someone',
              message: text,
              type: 'new_message'
            });
          } catch (notifError) {
            console.warn('Failed to send push notification:', notifError);
          }

          // The WebSocket will handle replacing the optimistic message with the real one
        } else {
          // Remove optimistic message on failure
          setMessages(prev => prev.filter(msg => msg.id !== optimisticMessageId));
          showError('Failed to send message. Please try again.');
        }
      }

      // Auto-scroll to bottom after sending
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);

    } catch (error) {
      console.error('❌ Error sending message:', error);
      
      // Remove optimistic message on error
      if (!editingMessage) {
        setMessages(prev => prev.filter(msg => msg.id !== optimisticMessageId));
      }
      
      showError('Failed to send message. Please try again.');
    }
  };

  const handleSendVoiceMessage = (audioUri: string, transcript?: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'voice',
      content: 'Voice message',
      voiceTranscript: transcript,
      audioUri,
      sender: { id: 'current_user', name: 'You', role: 'Member' },
      timestamp: new Date(),
      reactions: [],
      replies: [],
      mentions: transcript ? extractMentions(transcript) : [],
      isEdited: false,
    };

    if (replyingTo) {
      // Add as reply to existing message
      setMessages(prev =>
        prev.map(msg =>
          msg.id === replyingTo.id
            ? {
                ...msg,
                replies: [
                  ...msg.replies,
                  {
                    id: newMessage.id,
                    content: newMessage.content,
                    sender: { id: 'current_user', name: 'You' },
                    timestamp: new Date(),
                    reactions: [],
                  },
                ],
              }
            : msg,
        ),
      );
      setReplyingTo(null);
    } else {
      setMessages(prev => [...prev, newMessage]);
    }
    
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleAttachFile = (file: any) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'text',
      content: `📎 ${file.name || 'File attachment'}`,
      sender: { id: 'current_user', name: 'You', role: 'Member' },
      timestamp: new Date(),
      reactions: [],
      replies: [],
      mentions: [],
      isEdited: false,
    };

    // Add file properties
    (newMessage as any).fileUri = file.uri;
    (newMessage as any).fileName = file.name;
    (newMessage as any).fileType = file.type;

    if (replyingTo) {
      // Add as reply to existing message
      setMessages(prev =>
        prev.map(msg =>
          msg.id === replyingTo.id
            ? {
                ...msg,
                replies: [
                  ...msg.replies,
                  {
                    id: newMessage.id,
                    content: newMessage.content,
                    sender: { id: 'current_user', name: 'You' },
                    timestamp: new Date(),
                    reactions: [],
                  },
                ],
              }
            : msg,
        ),
      );
      setReplyingTo(null);
    } else {
      setMessages(prev => [...prev, newMessage]);
    }
    
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const extractMentions = (text: string): string[] => {
    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    let match;
    while ((match = mentionRegex.exec(text)) !== null) {
      mentions.push(match[1]);
    }
    return mentions;
  };

  const handleReaction = (messageId: string, emoji: string) => {
    setMessages(prev =>
      prev.map(msg => {
        if (msg.id === messageId) {
          const existingReaction = msg.reactions.find(r => r.emoji === emoji);
          
          if (existingReaction) {
            if (existingReaction.users.includes('current_user')) {
              // Remove reaction
              const updatedUsers = existingReaction.users.filter(u => u !== 'current_user');
              if (updatedUsers.length === 0) {
                return {
                  ...msg,
                  reactions: msg.reactions.filter(r => r.emoji !== emoji),
                };
              } else {
                return {
                  ...msg,
                  reactions: msg.reactions.map(r =>
                    r.emoji === emoji
                      ? { ...r, users: updatedUsers, count: updatedUsers.length }
                      : r,
                  ),
                };
              }
            } else {
              // Add reaction
              return {
                ...msg,
                reactions: msg.reactions.map(r =>
                  r.emoji === emoji
                    ? {
                        ...r,
                        users: [...r.users, 'current_user'],
                        count: r.count + 1,
                      }
                    : r,
                ),
              };
            }
          } else {
            // New reaction
            return {
              ...msg,
              reactions: [
                ...msg.reactions,
                {
                  emoji,
                  users: ['current_user'],
                  count: 1,
                },
              ],
            };
          }
        }
        return msg;
      }),
    );
  };

  const handleReply = (message: Message) => {
    if (message.replyCount && message.replyCount > 0) {
      // Navigate to thread screen for existing thread
      navigation.navigate('ThreadScreen', {
        parentMessage: message,
        channelId,
        channelName,
        members,
        onUpdateMessage: (messageId: string, replies: any[]) => {
          setMessages(prev =>
            prev.map(msg =>
              msg.id === messageId 
                ? { 
                    ...msg, 
                    replyCount: replies.length,
                    lastReplyTimestamp: replies.length > 0 ? replies[replies.length - 1].timestamp : undefined
                  } 
                : msg
            )
          );
        },
      });
    } else {
      // Start reply for new thread
      setReplyingTo({
        id: message.id,
        content: message.content,
        sender: message.sender.name,
      });
    }
  };

  const handleEdit = (message: Message) => {
    setEditingMessage({
      id: message.id,
      content: message.content,
    });
  };

  const handleGenerateSummary = async () => {
    setIsGeneratingSummary(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockSummary: ChannelSummary = {
      id: Date.now().toString(),
      title: `${channelName} Discussion Summary`,
      keyPoints: [
        'Project requirements discussion initiated',
        'Team agreed to focus on core features first',
        'Backend API approach decided (REST over GraphQL)',
        'Design wireframes to be created by Lisa',
        'Updated requirements shared for review',
      ],
      decisions: [
        'Use REST API for simplicity and maintainability',
        'Prioritize core features in initial development',
        'Lisa to create wireframes for main user flow',
      ],
      actionItems: [
        {
          id: 'task1',
          title: 'Create wireframes for main user flow',
          assigneeId: '3',
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          priority: 'high',
        },
        {
          id: 'task2',
          title: 'Design REST API structure',
          assigneeId: '2',
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          priority: 'medium',
        },
      ],
      participants: ['Sarah', 'Mike', 'Lisa', 'Alex', 'Emma', 'You'],
      duration: '2 hours',
      generatedAt: new Date(),
    };

    setChannelSummary(mockSummary);
    setIsGeneratingSummary(false);
    setShowSummaryModal(true);
  };

  const handleCreateTasks = async () => {
    setIsCreatingTasks(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsCreatingTasks(false);
    // Show task integration instead of key points modal
    setShowTaskIntegration(true);
  };



  const handleNavigateToReference = (type: string, id: string) => {
    // Handle navigation to different types of references
    switch (type) {
      case 'user':
        navigation.navigate('UserProfile', { userId: id });
        break;
      case 'channel':
        // For now, alert since we don't have a channel list screen
        showInfo(`Navigate to channel: ${id}`);
        break;
      case 'message':
        // Scroll to message or show it highlighted
        const messageIndex = messages.findIndex(msg => msg.id === id);
        if (messageIndex !== -1) {
          flatListRef.current?.scrollToIndex({ index: messageIndex, animated: true });
        }
        break;
      case 'task':
        navigation.navigate('TaskDetailScreen', { taskId: id });
        break;
      default:
        break;
    }
  };

  const handleNavigateToUser = (userId: string) => {
    navigation.navigate('UserProfile', { userId });
  };

  // Typing handlers
  const handleStartTyping = () => {
    if (isConnected) {
      startChannelTyping(channelId);
    }
  };

  const handleStopTyping = () => {
    if (isConnected) {
      stopChannelTyping(channelId);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <ChatMessage
      message={item}
      onReply={() => handleReply(item)}
      onReaction={(emoji) => handleReaction(item.id, emoji)}
      onEdit={item.sender.id === currentUserId ? () => handleEdit(item) : undefined}
      onShowEmojiPicker={() => setShowEmojiPicker(item.id)}
      onNavigateToUser={handleNavigateToUser}
      onNavigateToReference={handleNavigateToReference}
      isOwnMessage={item.sender.id === currentUserId}
    />
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
        <StatusBar barStyle="dark-content" backgroundColor="white" />

        {/* Header */}
        <ChannelHeader
          channelName={channelName}
          members={enhancedMembers}
          messageCount={channelStats.messageCount}
          fileCount={channelStats.fileCount}
          onBack={() => navigation.goBack()}
          onMembersPress={() => {
            showInfo(`Channel has ${enhancedMembers.length} members${isLoadingMembers ? ' (loading...)' : ''}`);
          }}
          onStatsPress={() => {
            showInfo(`Channel has ${channelStats.messageCount} messages and ${channelStats.fileCount} files`);
          }}
        />

        {/* AI Actions */}
        <ChannelActions
          onGenerateSummary={handleGenerateSummary}
          onCreateTasks={handleCreateTasks}
          isGeneratingSummary={isGeneratingSummary}
          isCreatingTasks={isCreatingTasks}
        />

        {/* Messages */}
        {isLoadingMessages ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-gray-500 mb-2">Loading messages...</Text>
            {__DEV__ && (
              <Text className="text-xs text-gray-400 mt-2">Channel: {channelId}</Text>
            )}
          </View>
        ) : messageError ? (
          <View className="flex-1 items-center justify-center p-4">
            <Text className="text-red-500 text-center mb-4">{messageError}</Text>
            <Text 
              className="text-blue-500 underline" 
              onPress={() => loadMessages(false)}
            >
              Tap to retry
            </Text>
            {__DEV__ && (
              <Text className="text-xs text-gray-400 mt-4">Channel: {channelId}</Text>
            )}
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 20, paddingTop: 10 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            onRefresh={() => loadMessages(true)}
            refreshing={isLoadingMoreMessages}
            scrollEventThrottle={16}
            maintainVisibleContentPosition={{
              minIndexForVisible: 0,
              autoscrollToTopThreshold: 10,
            }}
            ListHeaderComponent={
              hasMoreMessages && isLoadingMoreMessages ? (
                <View className="py-4 items-center">
                  <Text className="text-gray-500">Loading more messages...</Text>
                </View>
              ) : hasMoreMessages ? (
                <View className="py-2 items-center">
                  <Text className="text-gray-400 text-sm">Pull down to load more messages</Text>
                </View>
              ) : null
            }
            ListEmptyComponent={() => (
              <View className="flex-1 items-center justify-center p-8">
                <Text className="text-gray-500 text-lg mb-2">No messages yet</Text>
                <Text className="text-gray-400 text-center">
                  Be the first to send a message in #{channelName}
                </Text>
                {__DEV__ && (
                  <View className="mt-4 p-2 bg-gray-100 rounded">
                    <Text className="text-xs text-gray-600">Debug Info:</Text>
                    <Text className="text-xs text-gray-600">Channel: {channelId}</Text>
                    <Text className="text-xs text-gray-600">Messages: {messages.length}</Text>
                    <Text className="text-xs text-gray-600">Has More: {hasMoreMessages.toString()}</Text>
                    <Text className="text-xs text-gray-600">WebSocket: {isConnected ? 'Connected' : 'Disconnected'}</Text>
                  </View>
                )}
              </View>
            )}
          />
        )}

        {/* Input */}
        {/* Typing Indicators */}
        <SimpleTypingIndicators
          typingUsers={typingUsers}
          currentUserId={currentUserId}
        />

        <ChannelInput
          onSendMessage={handleSendMessage}
          onSendVoiceMessage={handleSendVoiceMessage}
          onAttachFile={handleAttachFile}
          onAttachImage={handleAttachFile}
          onStartTyping={handleStartTyping}
          onStopTyping={handleStopTyping}
          placeholder={`Message #${channelName}`}
          replyingTo={replyingTo}
          onCancelReply={() => setReplyingTo(null)}
          editingMessage={editingMessage}
          onCancelEdit={() => setEditingMessage(null)}
        />

        {/* Emoji Picker */}
        <EmojiReactionPicker
          visible={!!showEmojiPicker}
          onClose={() => setShowEmojiPicker(null)}
          onEmojiSelect={(emoji) => {
            if (showEmojiPicker) {
              handleReaction(showEmojiPicker, emoji);
              setShowEmojiPicker(null);
            }
          }}
          title="React to Message"
        />


        {/* Meeting Summary Modal */}
        <MeetingSummaryModal
          visible={showSummaryModal}
          summary={channelSummary}
          onClose={() => setShowSummaryModal(false)}
          onShare={() => {
            showSuccess('Meeting summary shared with team');
            setShowSummaryModal(false);
          }}
          onCreateTasks={() => {
            showSuccess('Tasks created from action items');
            setShowSummaryModal(false);
          }}
        />

        {/* Key Points Modal */}
        <KeyPointsModal
          visible={showKeyPointsModal}
          messages={messages}
          onClose={() => setShowKeyPointsModal(false)}
          onCreateTask={(taskData) => {
            showSuccess(`Task "${taskData.title}" created`);
            setShowKeyPointsModal(false);
          }}
        />

        {/* Channel Task Integration */}
        <ChannelTaskIntegration
          channelId={channelId}
          channelName={channelName}
          members={enhancedMembers.map(m => m.id)}
          visible={showTaskIntegration}
          onClose={() => setShowTaskIntegration(false)}
          initialTaskData={{
            title: 'AI-Generated Task from Discussion',
            description: 'Task created from channel conversation analysis',
            priority: 'medium',
          }}
        />
            </View>
    </KeyboardAvoidingView>
  );
};