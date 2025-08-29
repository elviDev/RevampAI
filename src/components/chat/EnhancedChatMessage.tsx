import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import { Avatar } from '../common/Avatar';
import type { Message } from '../../types/chat';

interface EnhancedChatMessageProps {
  message: Message;
  currentUserId?: string;
  onReply: () => void;
  onReaction: (emoji: string) => void;
  onEdit?: () => void;
  onShowEmojiPicker?: () => void;
  onNavigateToUser?: (userId: string) => void;
  onNavigateToReference?: (type: string, id: string) => void;
  onOpenThread?: () => void;
  showThreadButton?: boolean;
}

export const EnhancedChatMessage: React.FC<EnhancedChatMessageProps> = ({
  message,
  currentUserId = 'current_user',
  onReply,
  onReaction,
  onEdit,
  onShowEmojiPicker,
  onNavigateToUser,
  onNavigateToReference,
  onOpenThread,
  showThreadButton = true,
}) => {
  const [showActions, setShowActions] = useState(false);
  const isOwnMessage = message.sender.id === currentUserId;

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: Date) => {
    const today = new Date();
    const messageDate = new Date(timestamp);
    
    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    return messageDate.toLocaleDateString();
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
        return (
          <TouchableOpacity
            key={index}
            onPress={() => onNavigateToReference?.('user', part.slice(1))}
          >
            <Text className="text-blue-500 font-medium">{part}</Text>
          </TouchableOpacity>
        );
      } else if (part.startsWith('#')) {
        return (
          <TouchableOpacity
            key={index}
            onPress={() => onNavigateToReference?.('channel', part.slice(1))}
          >
            <Text className="text-green-500 font-medium">{part}</Text>
          </TouchableOpacity>
        );
      } else if (part.startsWith('msg:')) {
        return (
          <TouchableOpacity
            key={index}
            onPress={() => onNavigateToReference?.('message', part.slice(4))}
          >
            <Text className="text-purple-500 font-medium underline">{part}</Text>
          </TouchableOpacity>
        );
      } else if (part.startsWith('task:')) {
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
        <Text key={index} className={isOwnMessage ? 'text-white' : 'text-gray-700'}>
          {part}
        </Text>
      );
    });
  };

  // Different layouts for own messages vs others
  if (isOwnMessage) {
    return (
      <View className="mb-3 px-4">
        <View className="flex-row justify-end">
          <TouchableOpacity
            onLongPress={() => setShowActions(!showActions)}
            onPress={() => setShowActions(false)}
            className="max-w-[85%]"
          >
            <View className="bg-blue-500 rounded-2xl rounded-br-sm px-4 py-3">
              {/* Content */}
              <View className="flex-row flex-wrap">
                {renderMentionsAndReferences(message.content)}
              </View>

              {/* Voice Transcript */}
              {message.voiceTranscript && (
                <View className="mt-2 p-2 bg-blue-600 rounded-lg">
                  <View className="flex-row items-center mb-1">
                    <MaterialIcon name="mic" size={14} color="white" />
                    <Text className="text-white text-xs font-medium ml-1">Voice Message</Text>
                  </View>
                  <Text className="text-white text-sm opacity-90">{message.voiceTranscript}</Text>
                </View>
              )}

              {/* File Attachments */}
              {(message as any).fileUri && (
                <View className="mt-2 p-2 bg-blue-600 rounded-lg">
                  <View className="flex-row items-center">
                    <Feather name="paperclip" size={14} color="white" />
                    <Text className="text-white font-medium ml-2 text-sm">
                      {(message as any).fileName || 'File attachment'}
                    </Text>
                  </View>
                </View>
              )}

              {/* Timestamp */}
              <View className="flex-row items-center justify-end mt-1">
                <Text className="text-blue-200 text-xs">
                  {formatTime(message.timestamp)}
                  {message.isEdited && ' (edited)'}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <View className="flex-row flex-wrap justify-end mt-1 mr-2">
            {message.reactions.map((reaction, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => onReaction(reaction.emoji)}
                className="bg-white rounded-full px-2 py-1 ml-1 mb-1 border border-gray-200 shadow-sm"
              >
                <Text className="text-xs">
                  {reaction.emoji} {reaction.count}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Thread Info */}
        {message.replies && message.replies.length > 0 && (
          <TouchableOpacity
            onPress={onOpenThread || onReply}
            className="flex-row items-center justify-end mt-2 mr-2"
          >
            <MaterialIcon name="forum" size={16} color="#8B5CF6" />
            <Text className="text-purple-600 text-sm font-medium ml-1">
              {message.replies.length} {message.replies.length === 1 ? 'reply' : 'replies'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Quick Actions for own messages */}
        {showActions && (
          <View className="flex-row justify-end space-x-2 mt-2 mr-2">
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
            {onEdit && (
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
  }

  // Layout for others' messages
  return (
    <View className="mb-3 px-4">
      <TouchableOpacity
        onLongPress={() => setShowActions(!showActions)}
        onPress={() => setShowActions(false)}
        className="flex-row items-start space-x-3"
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
        <View className="flex-1 max-w-[85%]">
          {/* Header */}
          <View className="flex-row items-center space-x-2 mb-1">
            <Text className="font-semibold text-gray-900">{message.sender.name}</Text>
            <Text className="text-xs text-gray-500">{formatTime(message.timestamp)}</Text>
            {message.isEdited && (
              <Text className="text-xs text-gray-400">(edited)</Text>
            )}
          </View>

          {/* Message Bubble */}
          <View className="bg-gray-200 rounded-2xl rounded-tl-sm px-4 py-3">
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
          </View>

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
        </View>
      </TouchableOpacity>

      {/* Reactions */}
      {message.reactions && Array.isArray(message.reactions) && message.reactions.length > 0 && (
        <View className="flex-row flex-wrap mt-1 ml-14">
          {message.reactions.map((reaction, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => onReaction(reaction.emoji)}
              className="bg-white rounded-full px-2 py-1 mr-1 mb-1 border border-gray-200 shadow-sm"
            >
              <Text className="text-xs">
                {reaction.emoji} {reaction.count}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Thread Info */}
      {message.replies && Array.isArray(message.replies) && message.replies.length > 0 && (
        <TouchableOpacity
          onPress={onOpenThread || onReply}
          className="flex-row items-center mt-2 ml-14"
        >
          <MaterialIcon name="forum" size={16} color="#8B5CF6" />
          <Text className="text-purple-600 text-sm font-medium ml-1">
            {message.replies.length} {message.replies.length === 1 ? 'reply' : 'replies'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Quick Actions */}
      {showActions && (
        <View className="flex-row justify-start space-x-2 mt-2 ml-14">
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
        </View>
      )}
    </View>
  );
};