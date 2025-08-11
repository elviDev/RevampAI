import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Image,
  Alert,
  Linking,
} from 'react-native';
import Animated, {
  FadeIn,
  ZoomIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../contexts/ThemeContext';
import { ChatMessage } from './ChatChannel';

interface MessageBubbleProps {
  message: ChatMessage;
  isOwnMessage: boolean;
  showAvatar?: boolean;
  onPress?: () => void;
  onLongPress?: (action: 'reply' | 'edit' | 'delete' | 'pin') => void;
  onReaction?: (emoji: string) => void;
  onMention?: (userId: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwnMessage,
  showAvatar = true,
  onPress,
  onLongPress,
  onReaction,
  onMention,
}) => {
  const { theme } = useTheme();
  
  const [showActions, setShowActions] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);
  
  // Animation values
  const pressAnimation = useSharedValue(1);
  const actionsAnimation = useSharedValue(0);

  const animatedPressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressAnimation.value }],
  }));

  const animatedActionsStyle = useAnimatedStyle(() => ({
    opacity: actionsAnimation.value,
    transform: [{ scale: actionsAnimation.value }],
  }));

  const handlePressIn = () => {
    pressAnimation.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    pressAnimation.value = withSpring(1);
  };

  const handleLongPress = () => {
    setShowActions(true);
    actionsAnimation.value = withSpring(1);
  };

  const handleActionPress = (action: 'reply' | 'edit' | 'delete' | 'pin') => {
    setShowActions(false);
    actionsAnimation.value = withTiming(0);
    onLongPress?.(action);
  };

  const handleQuickReaction = (emoji: string) => {
    onReaction?.(emoji);
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    
    return timestamp.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'image':
        return 'image';
      case 'file':
        return 'attachment';
      case 'system':
        return 'info';
      case 'mention':
        return 'alternate-email';
      case 'reply':
        return 'reply';
      default:
        return null;
    }
  };

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'mention':
        return theme.colors.warning;
      case 'system':
        return theme.colors.info || theme.colors.primary;
      case 'reply':
        return theme.colors.accent;
      default:
        return theme.colors.text.secondary;
    }
  };

  const parseMentions = (content: string, mentions?: string[]) => {
    if (!mentions || mentions.length === 0) return content;
    
    let parsedContent = content;
    mentions.forEach((userId) => {
      // In a real app, you'd get the username from the userId
      const username = `user_${userId}`;
      parsedContent = parsedContent.replace(
        new RegExp(`@${userId}\\b`, 'g'),
        `@${username}`
      );
    });
    
    return parsedContent;
  };

  const renderAvatar = () => {
    if (!showAvatar) return null;

    return (
      <TouchableOpacity
        onPress={() => onMention?.(message.author.id)}
        style={{
          marginRight: 8,
          marginTop: 4,
        }}
      >
        <View style={{ position: 'relative' }}>
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.accent]}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: 'bold',
                color: theme.colors.text.onPrimary,
              }}
            >
              {message.author.avatar}
            </Text>
          </LinearGradient>
          
          {message.author.isOnline && (
            <View
              style={{
                position: 'absolute',
                bottom: -1,
                right: -1,
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: theme.colors.success,
                borderWidth: 2,
                borderColor: theme.colors.background,
              }}
            />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderAttachments = () => {
    if (!message.attachments || message.attachments.length === 0) return null;

    return (
      <View style={{ marginTop: 8 }}>
        {message.attachments.map((attachment) => (
          <TouchableOpacity
            key={attachment.id}
            onPress={() => {
              if (attachment.type === 'image') {
                setShowFullImage(true);
              } else {
                Linking.openURL(attachment.url).catch(() => {
                  Alert.alert('Error', 'Could not open attachment');
                });
              }
            }}
            style={{
              backgroundColor: theme.colors.surface,
              borderRadius: 12,
              padding: 8,
              marginBottom: 4,
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {attachment.type === 'image' ? (
                <Image
                  source={{ uri: attachment.thumbnail || attachment.url }}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    marginRight: 8,
                  }}
                />
              ) : (
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    backgroundColor: theme.colors.primary + '20',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 8,
                  }}
                >
                  <MaterialIcon
                    name={attachment.type === 'document' ? 'description' : 'attachment'}
                    size={16}
                    color={theme.colors.primary}
                  />
                </View>
              )}
              
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '600',
                    color: theme.colors.text.primary,
                  }}
                  numberOfLines={1}
                >
                  {attachment.name}
                </Text>
                <Text
                  style={{
                    fontSize: 10,
                    color: theme.colors.text.secondary,
                  }}
                >
                  {(attachment.size / 1024 / 1024).toFixed(1)} MB
                </Text>
              </View>

              <MaterialIcon
                name="download"
                size={16}
                color={theme.colors.text.secondary}
              />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderMessageActions = () => {
    if (!showActions) return null;

    return (
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: -40,
            right: isOwnMessage ? 16 : undefined,
            left: isOwnMessage ? undefined : 60,
            backgroundColor: theme.colors.surface,
            borderRadius: 20,
            paddingHorizontal: 8,
            paddingVertical: 4,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            borderWidth: 1,
            borderColor: theme.colors.border,
            shadowColor: theme.colors.shadows.neutral,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 8,
            zIndex: 1000,
          },
          animatedActionsStyle,
        ]}
      >
        {/* Quick reactions */}
        <TouchableOpacity
          onPress={() => handleQuickReaction('👍')}
          style={{
            padding: 4,
            borderRadius: 12,
          }}
        >
          <Text style={{ fontSize: 16 }}>👍</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => handleQuickReaction('❤️')}
          style={{
            padding: 4,
            borderRadius: 12,
          }}
        >
          <Text style={{ fontSize: 16 }}>❤️</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => handleQuickReaction('😂')}
          style={{
            padding: 4,
            borderRadius: 12,
          }}
        >
          <Text style={{ fontSize: 16 }}>😂</Text>
        </TouchableOpacity>

        <View
          style={{
            width: 1,
            height: 20,
            backgroundColor: theme.colors.border,
            marginHorizontal: 4,
          }}
        />

        {/* Actions */}
        <TouchableOpacity
          onPress={() => handleActionPress('reply')}
          style={{
            padding: 6,
            borderRadius: 12,
          }}
        >
          <MaterialIcon
            name="reply"
            size={16}
            color={theme.colors.text.secondary}
          />
        </TouchableOpacity>

        {isOwnMessage && (
          <TouchableOpacity
            onPress={() => handleActionPress('edit')}
            style={{
              padding: 6,
              borderRadius: 12,
            }}
          >
            <MaterialIcon
              name="edit"
              size={16}
              color={theme.colors.text.secondary}
            />
          </TouchableOpacity>
        )}

        {isOwnMessage && (
          <TouchableOpacity
            onPress={() => handleActionPress('delete')}
            style={{
              padding: 6,
              borderRadius: 12,
            }}
          >
            <MaterialIcon
              name="delete"
              size={16}
              color={theme.colors.error}
            />
          </TouchableOpacity>
        )}
      </Animated.View>
    );
  };

  // System messages have different styling
  if (message.type === 'system') {
    return (
      <Animated.View
        entering={FadeIn.duration(400)}
        style={{
          alignItems: 'center',
          paddingVertical: 8,
          paddingHorizontal: 16,
        }}
      >
        <View
          style={{
            backgroundColor: theme.colors.info + '20' || theme.colors.primary + '20',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.colors.info + '40' || theme.colors.primary + '40',
          }}
        >
          <Text
            style={{
              fontSize: 12,
              color: theme.colors.info || theme.colors.primary,
              textAlign: 'center',
            }}
          >
            {message.content}
          </Text>
        </View>
      </Animated.View>
    );
  }

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        if (showActions) {
          setShowActions(false);
          actionsAnimation.value = withTiming(0);
        } else {
          onPress?.();
        }
      }}
    >
      <View style={{ paddingHorizontal: 16, paddingVertical: 4 }}>
        <Animated.View
          style={[
            {
              flexDirection: isOwnMessage ? 'row-reverse' : 'row',
              alignItems: 'flex-start',
              position: 'relative',
            },
            animatedPressStyle,
          ]}
        >
          {!isOwnMessage && renderAvatar()}

          <TouchableOpacity
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onLongPress={handleLongPress}
            onPress={onPress}
            style={{
              maxWidth: '75%',
              minWidth: 60,
            }}
          >
            {/* Message header (for non-own messages) */}
            {!isOwnMessage && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 4,
                  paddingHorizontal: 4,
                }}
              >
                <TouchableOpacity
                  onPress={() => onMention?.(message.author.id)}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: 'bold',
                      color: theme.colors.primary,
                    }}
                  >
                    {message.author.name}
                  </Text>
                </TouchableOpacity>
                
                <Text
                  style={{
                    fontSize: 10,
                    color: theme.colors.text.secondary,
                    marginLeft: 8,
                  }}
                >
                  {message.author.role}
                </Text>

                {message.type !== 'text' && (
                  <MaterialIcon
                    name={getMessageTypeIcon(message.type) || 'message'}
                    size={12}
                    color={getMessageTypeColor(message.type)}
                    style={{ marginLeft: 8 }}
                  />
                )}
              </View>
            )}

            {/* Message bubble */}
            <View
              style={{
                backgroundColor: isOwnMessage
                  ? theme.colors.primary
                  : theme.colors.surface,
                borderRadius: 16,
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderWidth: isOwnMessage ? 0 : 1,
                borderColor: theme.colors.border,
                shadowColor: theme.colors.shadows.neutral,
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
              }}
            >
              {/* Reply indicator */}
              {message.replyTo && (
                <View
                  style={{
                    backgroundColor: isOwnMessage
                      ? theme.colors.text.onPrimary + '20'
                      : theme.colors.primary + '20',
                    borderRadius: 8,
                    padding: 6,
                    marginBottom: 6,
                    borderLeftWidth: 3,
                    borderLeftColor: isOwnMessage
                      ? theme.colors.text.onPrimary
                      : theme.colors.primary,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      color: isOwnMessage
                        ? theme.colors.text.onPrimary
                        : theme.colors.text.secondary,
                      fontStyle: 'italic',
                    }}
                  >
                    Replying to previous message
                  </Text>
                </View>
              )}

              <Text
                style={{
                  fontSize: 14,
                  color: isOwnMessage
                    ? theme.colors.text.onPrimary
                    : theme.colors.text.primary,
                  lineHeight: 20,
                }}
              >
                {parseMentions(message.content, message.mentions)}
              </Text>

              {message.edited && (
                <Text
                  style={{
                    fontSize: 10,
                    color: isOwnMessage
                      ? theme.colors.text.onPrimary + '80'
                      : theme.colors.text.secondary,
                    fontStyle: 'italic',
                    marginTop: 4,
                  }}
                >
                  (edited)
                </Text>
              )}
            </View>

            {/* Attachments */}
            {renderAttachments()}

            {/* Timestamp and thread info */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                marginTop: 4,
                paddingHorizontal: 4,
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  color: theme.colors.text.secondary,
                }}
              >
                {formatTimestamp(message.timestamp)}
              </Text>

              {message.thread && message.thread.length > 0 && (
                <TouchableOpacity
                  onPress={onPress}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginLeft: 8,
                    backgroundColor: theme.colors.accent + '20',
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    borderRadius: 8,
                  }}
                >
                  <MaterialIcon
                    name="forum"
                    size={10}
                    color={theme.colors.accent}
                  />
                  <Text
                    style={{
                      fontSize: 10,
                      color: theme.colors.accent,
                      marginLeft: 4,
                      fontWeight: '600',
                    }}
                  >
                    {message.thread.length} {message.thread.length === 1 ? 'reply' : 'replies'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>

          {isOwnMessage && showAvatar && renderAvatar()}
        </Animated.View>

        {/* Message actions overlay */}
        {renderMessageActions()}
      </View>
    </TouchableWithoutFeedback>
  );
};