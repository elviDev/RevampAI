import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  ZoomIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../contexts/ThemeContext';
import { useQuickActions } from '../../contexts/QuickActionsContext';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { ThreadView } from './ThreadView';
import { EmojiReactions } from './EmojiReactions';

export interface ChatMessage {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    role: string;
    isOnline: boolean;
  };
  timestamp: Date;
  type: 'text' | 'image' | 'file' | 'system' | 'mention' | 'reply';
  replyTo?: string; // parent message ID
  mentions?: string[]; // mentioned user IDs
  reactions?: MessageReaction[];
  attachments?: MessageAttachment[];
  edited?: boolean;
  editedAt?: Date;
  thread?: ChatMessage[]; // threaded replies
  channelId: string;
}

export interface MessageReaction {
  emoji: string;
  users: string[]; // user IDs who reacted
  count: number;
}

export interface MessageAttachment {
  id: string;
  name: string;
  type: 'image' | 'document' | 'video' | 'audio';
  url: string;
  size: number;
  thumbnail?: string;
}

export interface ChatChannel {
  id: string;
  name: string;
  description?: string;
  type: 'project' | 'task' | 'team' | 'direct' | 'announcement';
  members: string[]; // user IDs
  isPrivate: boolean;
  createdBy: string;
  createdAt: Date;
  lastActivity: Date;
  unreadCount: number;
  pinnedMessages: string[]; // message IDs
}

interface ChatChannelProps {
  channel: ChatChannel;
  messages: ChatMessage[];
  currentUserId: string;
  onSendMessage: (content: string, mentions?: string[], attachments?: File[]) => void;
  onReplyToMessage: (messageId: string, content: string) => void;
  onReactToMessage: (messageId: string, emoji: string) => void;
  onEditMessage: (messageId: string, newContent: string) => void;
  onDeleteMessage: (messageId: string) => void;
  onMentionUser: (userId: string) => void;
  onLoadMoreMessages?: () => void;
  onTypingStart?: () => void;
  onTypingStop?: () => void;
}

export const ChatChannel: React.FC<ChatChannelProps> = ({
  channel,
  messages,
  currentUserId,
  onSendMessage,
  onReplyToMessage,
  onReactToMessage,
  onEditMessage,
  onDeleteMessage,
  onMentionUser,
  onLoadMoreMessages,
  onTypingStart,
  onTypingStop,
}) => {
  const { theme } = useTheme();
  const { showNotification } = useQuickActions();
  
  const scrollViewRef = useRef<ScrollView>(null);
  
  const [selectedMessage, setSelectedMessage] = useState<ChatMessage | null>(null);
  const [showThread, setShowThread] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // Animation values
  const messageAnimation = useSharedValue(0);
  const threadAnimation = useSharedValue(0);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }

    messageAnimation.value = withSpring(1, {
      damping: 15,
      stiffness: 100,
    });
  }, [messages]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: messageAnimation.value,
    transform: [{ scale: interpolate(messageAnimation.value, [0, 1], [0.95, 1]) }],
  }));

  const threadAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(threadAnimation.value, [0, 1], [300, 0]) }],
    opacity: threadAnimation.value,
  }));

  const handleMessagePress = (message: ChatMessage) => {
    if (message.thread && message.thread.length > 0) {
      setSelectedMessage(message);
      setShowThread(true);
      threadAnimation.value = withTiming(1, { duration: 300 });
    }
  };

  const handleStartThread = (message: ChatMessage) => {
    setSelectedMessage(message);
    setShowThread(true);
    threadAnimation.value = withTiming(1, { duration: 300 });
  };

  const handleCloseThread = () => {
    threadAnimation.value = withTiming(0, { duration: 200 });
    setTimeout(() => {
      setShowThread(false);
      setSelectedMessage(null);
    }, 200);
  };

  const handleReaction = (messageId: string, emoji: string) => {
    onReactToMessage(messageId, emoji);
    showNotification('Reaction added!', 'success');
  };

  const handleMessageAction = (action: 'reply' | 'edit' | 'delete' | 'pin', message: ChatMessage) => {
    switch (action) {
      case 'reply':
        handleStartThread(message);
        break;
      case 'edit':
        if (message.author.id === currentUserId) {
          // Simple alert for now, could be replaced with custom modal
          Alert.alert(
            'Edit Message',
            'Message editing functionality available in full chat system!',
            [{ text: 'OK' }]
          );
        }
        break;
      case 'delete':
        if (message.author.id === currentUserId) {
          Alert.alert(
            'Delete Message',
            'Are you sure you want to delete this message?',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Delete',
                style: 'destructive',
                onPress: () => onDeleteMessage(message.id),
              },
            ]
          );
        }
        break;
      case 'pin':
        showNotification('Message pinning feature coming soon!', 'info');
        break;
    }
  };

  const renderHeader = () => (
    <Animated.View
      entering={FadeInDown.duration(600)}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: getChannelColor(channel.type),
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
          }}
        >
          <MaterialIcon
            name={getChannelIcon(channel.type)}
            size={18}
            color={theme.colors.text.onPrimary}
          />
        </View>
        
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: 'bold',
              color: theme.colors.text.primary,
            }}
          >
            {channel.name}
          </Text>
          {channel.description && (
            <Text
              style={{
                fontSize: 12,
                color: theme.colors.text.secondary,
              }}
            >
              {channel.description}
            </Text>
          )}
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <TouchableOpacity
          onPress={() => showNotification('Channel info coming soon!', 'info')}
          style={{
            padding: 8,
            borderRadius: 12,
            backgroundColor: theme.colors.primary + '20',
          }}
        >
          <MaterialIcon
            name="info-outline"
            size={20}
            color={theme.colors.primary}
          />
        </TouchableOpacity>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.colors.success + '20',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
          }}
        >
          <MaterialCommunityIcon
            name="account-group"
            size={14}
            color={theme.colors.success}
          />
          <Text
            style={{
              fontSize: 11,
              fontWeight: '600',
              color: theme.colors.success,
              marginLeft: 4,
            }}
          >
            {channel.members.length}
          </Text>
        </View>
      </View>
    </Animated.View>
  );

  const renderTypingIndicator = () => {
    if (typingUsers.length === 0) return null;

    return (
      <Animated.View
        entering={FadeInUp.duration(300)}
        style={{
          paddingHorizontal: 16,
          paddingVertical: 8,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.colors.surface,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 12,
          }}
        >
          <MaterialCommunityIcon
            name="dots-horizontal"
            size={16}
            color={theme.colors.primary}
          />
          <Text
            style={{
              fontSize: 12,
              color: theme.colors.text.secondary,
              marginLeft: 8,
            }}
          >
            {typingUsers.length === 1
              ? `${typingUsers[0]} is typing...`
              : `${typingUsers.length} people are typing...`}
          </Text>
        </View>
      </Animated.View>
    );
  };

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'project':
        return 'work';
      case 'task':
        return 'assignment';
      case 'team':
        return 'group';
      case 'direct':
        return 'person';
      case 'announcement':
        return 'campaign';
      default:
        return 'chat';
    }
  };

  const getChannelColor = (type: string) => {
    switch (type) {
      case 'project':
        return theme.colors.primary;
      case 'task':
        return theme.colors.accent;
      case 'team':
        return theme.colors.success;
      case 'direct':
        return theme.colors.warning;
      case 'announcement':
        return theme.colors.error;
      default:
        return theme.colors.secondary;
    }
  };

  const groupMessagesByDate = (messages: ChatMessage[]) => {
    const groups: { [key: string]: ChatMessage[] } = {};
    
    messages.forEach((message) => {
      const dateKey = message.timestamp.toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });

    return Object.entries(groups).map(([date, msgs]) => ({ date, messages: msgs }));
  };

  const renderDateSeparator = (date: string) => (
    <View
      style={{
        alignItems: 'center',
        marginVertical: 16,
      }}
    >
      <View
        style={{
          backgroundColor: theme.colors.surface,
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: theme.colors.border,
        }}
      >
        <Text
          style={{
            fontSize: 12,
            fontWeight: '600',
            color: theme.colors.text.secondary,
          }}
        >
          {new Date(date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {renderHeader()}

      <Animated.View style={[{ flex: 1 }, animatedStyle]}>
        <ScrollView
          ref={scrollViewRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          onScroll={({ nativeEvent }) => {
            // Load more messages when scrolling to top
            if (nativeEvent.contentOffset.y < 100 && onLoadMoreMessages && !isLoadingMessages) {
              setIsLoadingMessages(true);
              onLoadMoreMessages();
              setTimeout(() => setIsLoadingMessages(false), 1000);
            }
          }}
          scrollEventThrottle={16}
        >
          {isLoadingMessages && (
            <View
              style={{
                alignItems: 'center',
                paddingVertical: 16,
              }}
            >
              <MaterialCommunityIcon
                name="loading"
                size={24}
                color={theme.colors.primary}
              />
            </View>
          )}

          {messages.length === 0 ? (
            <Animated.View
              entering={FadeInUp.duration(600)}
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 60,
              }}
            >
              <MaterialCommunityIcon
                name="message-outline"
                size={64}
                color={theme.colors.text.secondary}
              />
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: theme.colors.text.primary,
                  marginTop: 16,
                  marginBottom: 8,
                }}
              >
                Start the conversation
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  color: theme.colors.text.secondary,
                  textAlign: 'center',
                  maxWidth: 280,
                }}
              >
                Be the first to share an update, ask a question, or start a discussion
              </Text>
            </Animated.View>
          ) : (
            groupMessagesByDate(messages).map(({ date, messages: dayMessages }, groupIndex) => (
              <View key={date}>
                {renderDateSeparator(date)}
                {dayMessages.map((message, index) => (
                  <Animated.View
                    key={message.id}
                    entering={FadeInUp.delay(index * 50).duration(400)}
                  >
                    <MessageBubble
                      message={message}
                      isOwnMessage={message.author.id === currentUserId}
                      showAvatar={true}
                      onPress={() => handleMessagePress(message)}
                      onLongPress={(action) => handleMessageAction(action, message)}
                      onReaction={(emoji) => handleReaction(message.id, emoji)}
                      onMention={onMentionUser}
                    />
                    
                    {message.reactions && message.reactions.length > 0 && (
                      <EmojiReactions
                        reactions={message.reactions}
                        onReactionPress={(emoji: string) => handleReaction(message.id, emoji)}
                      />
                    )}
                  </Animated.View>
                ))}
              </View>
            ))
          )}

          {renderTypingIndicator()}
        </ScrollView>

        <MessageInput
          onSendMessage={onSendMessage}
          onTypingStart={onTypingStart}
          onTypingStop={onTypingStop}
          channelMembers={channel.members}
          placeholder={`Message #${channel.name}`}
        />
      </Animated.View>

      {/* Thread View Modal */}
      {showThread && selectedMessage && (
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              width: '75%',
              backgroundColor: theme.colors.background,
              borderLeftWidth: 1,
              borderLeftColor: theme.colors.border,
              shadowColor: theme.colors.shadows.neutral,
              shadowOffset: { width: -4, height: 0 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 8,
            },
            threadAnimatedStyle,
          ]}
        >
          <ThreadView
            parentMessage={selectedMessage}
            onClose={handleCloseThread}
            onReply={(content: string) => onReplyToMessage(selectedMessage.id, content)}
            currentUserId={currentUserId}
          />
        </Animated.View>
      )}
    </KeyboardAvoidingView>
  );
};