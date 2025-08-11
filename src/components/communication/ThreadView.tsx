import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../contexts/ThemeContext';
import { ChatMessage } from './ChatChannel';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';

interface ThreadViewProps {
  parentMessage: ChatMessage;
  onClose: () => void;
  onReply: (content: string) => void;
  currentUserId: string;
}

export const ThreadView: React.FC<ThreadViewProps> = ({
  parentMessage,
  onClose,
  onReply,
  currentUserId,
}) => {
  const { theme } = useTheme();
  
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header */}
      <Animated.View
        entering={FadeInDown.duration(300)}
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
        <Text
          style={{
            fontSize: 16,
            fontWeight: 'bold',
            color: theme.colors.text.primary,
          }}
        >
          Thread
        </Text>
        
        <TouchableOpacity
          onPress={onClose}
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: theme.colors.error + '20',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MaterialIcon
            name="close"
            size={20}
            color={theme.colors.error}
          />
        </TouchableOpacity>
      </Animated.View>

      {/* Parent Message */}
      <Animated.View
        entering={FadeInUp.delay(100).duration(400)}
        style={{
          backgroundColor: theme.colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        }}
      >
        <MessageBubble
          message={parentMessage}
          isOwnMessage={parentMessage.author.id === currentUserId}
          showAvatar={true}
        />
      </Animated.View>

      {/* Thread Messages */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {parentMessage.thread?.map((message, index) => (
          <Animated.View
            key={message.id}
            entering={FadeInUp.delay(index * 100).duration(400)}
          >
            <MessageBubble
              message={message}
              isOwnMessage={message.author.id === currentUserId}
              showAvatar={true}
            />
          </Animated.View>
        )) || (
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 40,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                color: theme.colors.text.secondary,
              }}
            >
              No replies yet
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Reply Input */}
      <MessageInput
        onSendMessage={(content: string) => onReply(content)}
        channelMembers={[]}
        placeholder="Reply to thread..."
      />
    </View>
  );
};