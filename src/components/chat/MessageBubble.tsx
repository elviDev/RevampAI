import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Image,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import type { Message } from '../../types/chat';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  onReaction: (emoji: string) => void;
  onReply: () => void;
  onEdit: () => void;
  onLongPress: () => void;
  showConnector: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  onReaction,
  onReply,
  onEdit,
  onLongPress,
  showConnector,
}) => {
  const [showActions, setShowActions] = useState(false);
  const scale = useSharedValue(1);
  const actionsOpacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const actionsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: actionsOpacity.value,
    transform: [
      { scale: actionsOpacity.value },
      { translateY: (1 - actionsOpacity.value) * 10 },
    ],
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withSpring(0.98, { damping: 15 }),
      withSpring(1, { damping: 15 }),
    );
  };

  const handleLongPress = () => {
    setShowActions(true);
    actionsOpacity.value = withSpring(1, { damping: 15 });
    onLongPress();
  };

  const hideActions = () => {
    actionsOpacity.value = withTiming(0, { duration: 200 }, () => {
      setShowActions(false);
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const renderMessageContent = () => {
    switch (message.type) {
      case 'voice':
        return (
          <View>
            <View className="flex-row items-center mb-2">
              <View className="w-8 h-8 bg-blue-500 rounded-full items-center justify-center mr-2">
                <Text className="text-white text-xs">🎤</Text>
              </View>
              <Text
                className={`text-sm ${isOwn ? 'text-blue-100' : 'text-gray-600'}`}
              >
                Voice message
              </Text>
            </View>
            {message.voiceTranscript && (
              <Text
                className={`leading-5 ${isOwn ? 'text-white' : 'text-gray-800'}`}
              >
                "{message.voiceTranscript}"
              </Text>
            )}
          </View>
        );

      case 'file':
        return (
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-gray-200 rounded-lg items-center justify-center mr-3">
              <Text className="text-lg">📎</Text>
            </View>
            <View className="flex-1">
              <Text
                className={`font-medium ${isOwn ? 'text-white' : 'text-gray-800'}`}
              >
                {message.fileName}
              </Text>
              <Text
                className={`text-sm ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}
              >
                File attachment
              </Text>
            </View>
          </View>
        );

      case 'system':
        return (
          <View className="flex-row items-center">
            <View className="w-6 h-6 bg-blue-500 rounded-full items-center justify-center mr-2">
              <Text className="text-white text-xs">🤖</Text>
            </View>
            <Text className="text-gray-600 italic">{message.content}</Text>
          </View>
        );

      default:
        return (
          <View>
            <Text
              className={`leading-5 ${isOwn ? 'text-white' : 'text-gray-800'}`}
            >
              {message.content}
              {message.isEdited && (
                <Text
                  className={`text-xs ${isOwn ? 'text-blue-100' : 'text-gray-400'}`}
                >
                  {' '}
                  (edited)
                </Text>
              )}
            </Text>
          </View>
        );
    }
  };

  if (message.type === 'system') {
    return (
      <View className="items-center my-4">
        <View className="bg-gray-100 rounded-full px-4 py-2">
          {renderMessageContent()}
        </View>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback
      onPress={handlePress}
      onLongPress={handleLongPress}
    >
      <Animated.View
        style={[animatedStyle]}
        className={`mb-4 ${isOwn ? 'items-end' : 'items-start'}`}
      >
        <View
          className={`flex-row max-w-[85%] ${isOwn ? 'flex-row-reverse' : ''}`}
        >
          {/* Avatar */}
          {!isOwn && (
            <View className="w-8 h-8 bg-blue-500 rounded-full items-center justify-center mr-2 mt-1">
              <Text className="text-white text-xs font-semibold">
                {message.sender.name.charAt(0)}
              </Text>
            </View>
          )}

          {/* Message Container */}
          <View className="flex-1">
            {/* Sender Name */}
            {!isOwn && (
              <Text className="text-gray-600 text-xs mb-1 ml-1">
                {message.sender.name}
              </Text>
            )}

            {/* Message Bubble */}
            <View
              className={`rounded-2xl px-4 py-3 ${
                isOwn
                  ? 'bg-blue-500 rounded-br-md'
                  : 'bg-white rounded-bl-md border border-gray-100'
              } ${showConnector ? 'border-l-4 border-l-blue-300' : ''}`}
              style={
                isOwn
                  ? {}
                  : {
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 4,
                      elevation: 2,
                    }
              }
            >
              {renderMessageContent()}
            </View>

            {/* Reactions */}
            {message.reactions.length > 0 && (
              <View className="flex-row mt-2 ml-1">
                {message.reactions.map((reaction, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => onReaction(reaction.emoji)}
                    className="bg-gray-100 rounded-full px-2 py-1 mr-1 flex-row items-center"
                  >
                    <Text className="text-sm">{reaction.emoji}</Text>
                    <Text className="text-xs text-gray-600 ml-1">
                      {reaction.count}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Replies */}
            {message.replies.length > 0 && (
              <View className="mt-3 ml-4 border-l-2 border-gray-200 pl-3">
                {message.replies.map(reply => (
                  <View key={reply.id} className="mb-2">
                    <Text className="text-gray-600 text-xs font-medium">
                      {reply.sender.name}
                    </Text>
                    <Text className="text-gray-700 text-sm mt-1">
                      {reply.content}
                    </Text>
                    <Text className="text-gray-400 text-xs mt-1">
                      {formatTime(reply.timestamp)}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Timestamp */}
            <Text
              className={`text-xs mt-1 ${
                isOwn ? 'text-right text-gray-400' : 'text-gray-500'
              }`}
            >
              {formatTime(message.timestamp)}
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        {showActions && (
          <Animated.View
            style={[actionsAnimatedStyle]}
            className="flex-row mt-3 space-x-2 bg-white rounded-2xl p-2 shadow-lg"
          >
            <TouchableOpacity
              onPress={() => {
                onReaction('👍');
                hideActions();
              }}
              className="bg-gray-100 rounded-full p-2"
            >
              <Text className="text-lg">👍</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                onReaction('❤️');
                hideActions();
              }}
              className="bg-gray-100 rounded-full p-2"
            >
              <Text className="text-lg">❤️</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                onReply();
                hideActions();
              }}
              className="bg-blue-100 rounded-full px-4 py-2"
            >
              <Text className="text-blue-600 text-sm font-medium">Reply</Text>
            </TouchableOpacity>

            {isOwn && (
              <TouchableOpacity
                onPress={() => {
                  onEdit();
                  hideActions();
                }}
                className="bg-orange-100 rounded-full px-4 py-2"
              >
                <Text className="text-orange-600 text-sm font-medium">
                  Edit
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={hideActions}
              className="bg-gray-100 rounded-full p-2"
            >
              <Text className="text-gray-600">✕</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};
