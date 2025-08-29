import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { ChatMessage } from '../../components/chat/ChatMessage';
import { EnhancedChannelInput } from '../../components/chat/EnhancedChannelInput';
import { SimpleTypingIndicators } from '../../components/chat/SimpleTypingIndicators';
import { useWebSocket, webSocketService } from '../../services/websocketService';
import { useToast } from '../../contexts/ToastContext';
import { messageService } from '../../services/api/messageService';
import type { Message } from '../../types/chat';
import type { MainStackParamList } from '../../navigation/MainNavigator';

type ThreadScreenProps = NativeStackScreenProps<
  MainStackParamList,
  'ThreadScreen'
>;

export const ThreadScreen: React.FC<ThreadScreenProps> = ({
  navigation,
  route,
}) => {
  const { parentMessage, channelId, channelName, members, onUpdateMessage } = route.params;
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const { isConnected, joinChannel, leaveChannel } = useWebSocket();
  const { showError, showSuccess } = useToast();

  // State
  const [threadMessages, setThreadMessages] = useState<Message[]>([]);
  const [currentUserId] = useState('current_user');
  const [typingUsers, setTypingUsers] = useState<Array<{
    userId: string;
    userName: string;
    isTyping: boolean;
  }>>([]);
  
  // Loading states
  const [isLoadingThread, setIsLoadingThread] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [threadError, setThreadError] = useState<string | null>(null);
  
  // Pagination
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 50,
    offset: 0,
  });

  // Load thread messages on mount
  useEffect(() => {
    loadThreadMessages();
    
    // Join channel for real-time updates
    if (isConnected) {
      joinChannel(channelId);
    }

    return () => {
      if (isConnected) {
        leaveChannel(channelId);
      }
    };
  }, [channelId, parentMessage.id, isConnected]);

  // WebSocket event listeners for real-time thread updates
  useEffect(() => {
    const handleMessageSent = (event: any) => {
      if (event.channelId === channelId && event.message) {
        // Check if this is a reply to our thread
        const threadRoot = parentMessage.threadRoot || parentMessage.id;
        if (event.message.thread_root === threadRoot || event.message.reply_to === parentMessage.id) {
          console.log('📨 New thread reply received:', event);
          
          const newMessage: Message = {
            id: event.message.id,
            type: 'text',
            content: event.message.content,
            sender: {
              id: event.message.user_id,
              name: event.message.user_name || 'Unknown User',
              avatar: event.message.user_avatar,
              role: event.message.user_role || 'staff',
            },
            timestamp: new Date(event.message.created_at),
            reactions: [],
            replies: [],
            mentions: event.message.mentions || [],
            isEdited: event.message.is_edited || false,
            connectedTo: event.message.reply_to,
            threadRoot: event.message.thread_root,
          };

          setThreadMessages(prev => {
            if (prev.some(msg => msg.id === newMessage.id)) {
              return prev;
            }
            const updated = [...prev, newMessage];
            return updated.sort((a, b) => 
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            );
          });

          // Auto-scroll to bottom for new replies
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }
      }
    };

    // Add event listeners
    webSocketService.on('message_sent', handleMessageSent);

    return () => {
      webSocketService.off('message_sent', handleMessageSent);
    };
  }, [channelId, parentMessage.id, parentMessage.threadRoot]);

  const loadThreadMessages = async (loadMore: boolean = false) => {
    if (loadMore && (!hasMoreMessages || isLoadingMore)) {
      return;
    }

    try {
      if (loadMore) {
        setIsLoadingMore(true);
      } else {
        setIsLoadingThread(true);
        setThreadError(null);
      }
      
      const currentOffset = loadMore ? pagination.offset + pagination.limit : 0;
      console.log('🧵 Loading thread messages:', { 
        parentMessageId: parentMessage.id,
        currentOffset,
        loadMore
      });
      
      const response = await messageService.getThreadMessages(channelId, parentMessage.id, {
        limit: pagination.limit,
        offset: currentOffset,
      });

      if (response.success) {
        const replies = response.data.replies;
        
        // Sort replies chronologically (oldest first)
        const sortedReplies = replies.sort((a, b) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

        if (loadMore) {
          setThreadMessages(prev => {
            const combined = [...prev, ...sortedReplies];
            // Remove duplicates
            const unique = combined.filter((msg, index, arr) => 
              arr.findIndex(m => m.id === msg.id) === index
            );
            return unique.sort((a, b) => 
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            );
          });
        } else {
          setThreadMessages(sortedReplies);
        }

        setPagination(prev => ({
          ...prev,
          total: response.data.pagination.total,
          offset: currentOffset,
        }));
        
        setHasMoreMessages(response.data.pagination.hasMore);
        
        // Auto-scroll to bottom on initial load
        if (!loadMore) {
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: false });
          }, 100);
        }
      }
    } catch (error) {
      console.error('❌ Error loading thread messages:', error);
      setThreadError('Failed to load thread messages');
    } finally {
      setIsLoadingThread(false);
      setIsLoadingMore(false);
    }
  };

  const handleSendReply = async (text: string) => {
    if (!text.trim()) return;

    try {
      console.log('💬 Sending thread reply:', { text, parentMessage: parentMessage.id });
      
      const response = await messageService.sendReply(channelId, parentMessage.id, {
        content: text,
        message_type: 'text',
        mentions: extractMentions(text),
      });

      if (response.success) {
        console.log('✅ Thread reply sent successfully');
        // WebSocket will handle adding the message to UI
        
        // Update parent message reply count
        if (onUpdateMessage) {
          onUpdateMessage(parentMessage.id, threadMessages);
        }
        
        // Auto-scroll to bottom after sending
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    } catch (error) {
      console.error('❌ Error sending thread reply:', error);
      showError('Failed to send reply. Please try again.');
    }
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

  const handleTypingChange = useCallback((users: Array<{
    userId: string;
    userName: string;
    isTyping: boolean;
  }>) => {
    setTypingUsers(users);
  }, []);

  const renderThreadMessage = ({ item }: { item: Message }) => (
    <ChatMessage
      message={item}
      onReply={() => {}} // No nested threading for now
      onReaction={(emoji) => {
        // Handle reactions in thread
        console.log('Thread message reaction:', item.id, emoji);
      }}
      onEdit={item.sender.id === currentUserId ? () => {} : undefined}
      onShowEmojiPicker={() => {}}
      onNavigateToUser={() => {}}
      onNavigateToReference={() => {}}
      isOwnMessage={item.sender.id === currentUserId}
    />
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
        <StatusBar barStyle="dark-content" backgroundColor="white" />

        {/* Thread Header */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
              <MaterialIcon name="arrow-back" size={24} color="#374151" />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-gray-900">Thread</Text>
              <Text className="text-sm text-gray-500">#{channelName}</Text>
            </View>
          </View>
        </View>

        {/* Parent Message */}
        <View className="border-b border-gray-100 bg-gray-50">
          <ChatMessage
            message={parentMessage}
            onReply={() => {}} // Disabled in thread view
            onReaction={() => {}}
            onShowEmojiPicker={() => {}}
            onNavigateToUser={() => {}}
            onNavigateToReference={() => {}}
            isOwnMessage={parentMessage.sender.id === currentUserId}
          />
        </View>

        {/* Thread Messages */}
        <View className="flex-1">
          {isLoadingThread ? (
            <View className="flex-1 items-center justify-center">
              <Text className="text-gray-500">Loading thread...</Text>
            </View>
          ) : threadError ? (
            <View className="flex-1 items-center justify-center p-4">
              <Text className="text-red-500 text-center mb-4">{threadError}</Text>
              <TouchableOpacity 
                onPress={() => loadThreadMessages()}
                className="bg-blue-500 px-4 py-2 rounded-lg"
              >
                <Text className="text-white font-medium">Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={threadMessages}
              renderItem={renderThreadMessage}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingBottom: 20, paddingTop: 10 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              onRefresh={() => loadThreadMessages(true)}
              refreshing={isLoadingMore}
              ListEmptyComponent={() => (
                <View className="flex-1 items-center justify-center p-8">
                  <MaterialIcon name="forum" size={48} color="#D1D5DB" />
                  <Text className="text-gray-500 text-lg mb-2 mt-4">No replies yet</Text>
                  <Text className="text-gray-400 text-center">
                    Be the first to reply to this message
                  </Text>
                </View>
              )}
              ListHeaderComponent={
                threadMessages.length > 0 ? (
                  <View className="px-4 py-2">
                    <Text className="text-gray-500 text-sm text-center">
                      {threadMessages.length} {threadMessages.length === 1 ? 'reply' : 'replies'}
                    </Text>
                  </View>
                ) : null
              }
            />
          )}
        </View>

        {/* Typing Indicators */}
        <SimpleTypingIndicators
          typingUsers={typingUsers}
          currentUserId={currentUserId}
        />

        {/* Thread Reply Input */}
        <EnhancedChannelInput
          onSendMessage={handleSendReply}
          onSendVoiceMessage={(audioUri, transcript) => {
            // Handle voice replies
            console.log('Voice reply:', { audioUri, transcript });
          }}
          onAttachFile={() => {
            // Handle file attachments in thread
            console.log('Attach file to thread');
          }}
          onAttachImage={() => {
            // Handle image attachments in thread
            console.log('Attach image to thread');
          }}
          placeholder={`Reply to ${parentMessage.sender.name}...`}
          replyingTo={null}
          editingMessage={null}
        />
      </View>
    </KeyboardAvoidingView>
  );
};