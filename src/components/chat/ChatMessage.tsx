import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import { Avatar } from '../common/Avatar';
import type { Message } from '../../types/chat';

interface ChatMessageProps {
  message: Message;
  onReply: () => void;
  onReaction: (emoji: string) => void;
  onEdit?: () => void;
  onShowEmojiPicker?: () => void;
  onNavigateToUser?: (userId: string) => void;
  onNavigateToReference?: (type: string, id: string) => void;
  showThreadButton?: boolean;
  isOwnMessage?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onReply,
  onReaction,
  onEdit,
  onShowEmojiPicker,
  onNavigateToUser,
  onNavigateToReference,
  showThreadButton = true,
  isOwnMessage = false,
}) => {
  const [showActions, setShowActions] = useState(false);

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleUserPress = () => {
    if (onNavigateToUser) {
      onNavigateToUser(message.sender.id);
    }
  };

  const renderMentionsAndReferences = (text: string) => {
    if (!text) return null;
    
    // Enhanced regex to match users, channels, messages, and tasks
    const mentionRegex = /(@\w+)|(#\w+)|(msg:\w+)|(task:\w+)/g;
    const parts = text.split(mentionRegex);
    
    return parts.map((part, index) => {
      if (!part) return null;
      
      if (part.startsWith('@')) {
        // User mention
        return (
          <TouchableOpacity
            key={index}
            onPress={() => onNavigateToReference?.('user', part.slice(1))}
          >
            <Text className="text-blue-500 font-medium">{part}</Text>
          </TouchableOpacity>
        );
      } else if (part.startsWith('#')) {
        // Channel reference
        return (
          <TouchableOpacity
            key={index}
            onPress={() => onNavigateToReference?.('channel', part.slice(1))}
          >
            <Text className="text-green-500 font-medium">{part}</Text>
          </TouchableOpacity>
        );
      } else if (part.startsWith('msg:')) {
        // Message reference
        return (
          <TouchableOpacity
            key={index}
            onPress={() => onNavigateToReference?.('message', part.slice(4))}
          >
            <Text className="text-purple-500 font-medium underline">{part}</Text>
          </TouchableOpacity>
        );
      } else if (part.startsWith('task:')) {
        // Task reference
        return (
          <TouchableOpacity
            key={index}
            onPress={() => onNavigateToReference?.('task', part.slice(5))}
          >
            <Text className="text-orange-500 font-medium">{part}</Text>
          </TouchableOpacity>
        );
      }
      
      return (
        <Text key={index} className="text-gray-700">
          {part}
        </Text>
      );
    });
  };

  return (
    <View className="mb-2">
      <TouchableOpacity
        onLongPress={() => setShowActions(!showActions)}
        onPress={() => setShowActions(false)}
        className="flex-row items-start space-x-3 px-4 py-2"
      >
        {/* Avatar */}
        <Avatar
          user={{
            id: message.sender?.id || 'unknown',
            name: message.sender?.name || 'Unknown User',
            avatar: message.sender?.avatar,
            role: message.sender?.role,
            isOnline: true,
          }}
          size="md"
          showOnlineStatus
          onPress={handleUserPress}
        />

        {/* Message Content */}
        <View className="flex-1">
          {/* Header */}
          <View className="flex-row items-center space-x-2 mb-1">
            <Text className="font-semibold text-gray-900">{message.sender.name}</Text>
            <Text className="text-xs text-gray-500">{formatTime(message.timestamp)}</Text>
            {message.isEdited && (
              <Text className="text-xs text-gray-400">(edited)</Text>
            )}
          </View>

          {/* Content with Smart References */}
          <View className="flex-row flex-wrap">
            {renderMentionsAndReferences(message.content)}
          </View>

          {/* Voice Transcript */}
          {message.voiceTranscript && (
            <View className="mt-2 p-2 bg-blue-50 rounded-lg border-l-4 border-blue-400">
              <View className="flex-row items-center mb-1">
                <MaterialIcon name="mic" size={16} color="#3B82F6" />
                <Text className="text-blue-600 text-xs font-medium ml-1">Voice Message</Text>
              </View>
              <Text className="text-gray-700 text-sm">{message.voiceTranscript}</Text>
            </View>
          )}

          {/* File Attachments */}
          {(message as any).fileUri && (
            <View className="mt-2 p-3 bg-gray-50 rounded-lg border">
              <View className="flex-row items-center">
                <Feather name="paperclip" size={16} color="#6B7280" />
                <Text className="text-gray-700 font-medium ml-2">
                  {(message as any).fileName || 'File attachment'}
                </Text>
              </View>
              <Text className="text-gray-500 text-xs mt-1">
                {(message as any).fileType || 'Unknown type'}
              </Text>
            </View>
          )}

          {/* Mentions */}
          {message.mentions && Array.isArray(message.mentions) && message.mentions.length > 0 && (
            <View className="flex-row flex-wrap mt-1">
              {message.mentions.map((mention, idx) => (
                <Text key={idx} className="text-blue-500 text-sm mr-1">
                  @{mention}
                </Text>
              ))}
            </View>
          )}

          {/* Reactions */}
          {message.reactions && Array.isArray(message.reactions) && message.reactions.length > 0 && (
            <View className="flex-row flex-wrap mt-2">
              {message.reactions.map((reaction, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => onReaction(reaction.emoji)}
                  className="bg-gray-100 rounded-full px-2 py-1 mr-1 mb-1 border border-gray-200"
                >
                  <Text className="text-sm">
                    {reaction.emoji} {reaction.count}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Thread Info */}
          {message.replies && Array.isArray(message.replies) && message.replies.length > 0 && (
            <TouchableOpacity
              onPress={onReply}
              className="mt-2 flex-row items-center"
            >
              <MaterialIcon name="forum" size={16} color="#8B5CF6" />
              <Text className="text-purple-600 text-sm font-medium ml-1">
                {message.replies.length} {message.replies.length === 1 ? 'reply' : 'replies'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>

      {/* Quick Actions */}
      {showActions && (
        <View className="flex-row justify-end space-x-2 px-4 py-2">
          <TouchableOpacity
            onPress={() => onReaction('👍')}
            className="bg-gray-100 rounded-full p-2"
          >
            <Text className="text-lg">👍</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onShowEmojiPicker}
            className="bg-gray-100 rounded-full p-2"
          >
            <Text className="text-lg">😊</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onReply}
            className="bg-gray-100 rounded-full px-3 py-2"
          >
            <MaterialIcon name="reply" size={16} color="#6B7280" />
          </TouchableOpacity>
          {isOwnMessage && onEdit && (
            <TouchableOpacity
              onPress={onEdit}
              className="bg-gray-100 rounded-full px-3 py-2"
            >
              <MaterialIcon name="edit" size={16} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};