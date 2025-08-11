import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
  Platform,
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

interface MessageInputProps {
  onSendMessage: (content: string, mentions?: string[], attachments?: File[]) => void;
  onTypingStart?: () => void;
  onTypingStop?: () => void;
  channelMembers: string[];
  placeholder?: string;
  disabled?: boolean;
  initialContent?: string;
  replyingTo?: {
    id: string;
    author: string;
    content: string;
  };
  onCancelReply?: () => void;
}

interface MentionSuggestion {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

interface EmojiCategory {
  name: string;
  icon: string;
  emojis: string[];
}

const EMOJI_CATEGORIES: EmojiCategory[] = [
  {
    name: 'Smileys',
    icon: '😀',
    emojis: ['😀', '😃', '😄', '😁', '😆', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘'],
  },
  {
    name: 'Gestures',
    icon: '👍',
    emojis: ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐️'],
  },
  {
    name: 'Objects',
    icon: '📱',
    emojis: ['📱', '💻', '⌨️', '🖥️', '🖨️', '📞', '📟', '📠', '📺', '📻', '⏰', '⏱️', '⏲️', '🕰️', '📡', '🔋'],
  },
  {
    name: 'Activities',
    icon: '⚽',
    emojis: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍'],
  },
];

const MOCK_MEMBERS: MentionSuggestion[] = [
  { id: '1', name: 'Sarah Johnson', role: 'Project Manager', avatar: 'SJ' },
  { id: '2', name: 'Alex Chen', role: 'Developer', avatar: 'AC' },
  { id: '3', name: 'Maria Rodriguez', role: 'Designer', avatar: 'MR' },
  { id: '4', name: 'David Kim', role: 'QA Engineer', avatar: 'DK' },
  { id: '5', name: 'Emma Wilson', role: 'Product Owner', avatar: 'EW' },
];

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onTypingStart,
  onTypingStop,
  channelMembers,
  placeholder = 'Type a message...',
  disabled = false,
  initialContent = '',
  replyingTo,
  onCancelReply,
}) => {
  const { theme } = useTheme();
  const { showNotification } = useQuickActions();
  
  const textInputRef = useRef<TextInput>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const [message, setMessage] = useState(initialContent);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionStartIndex, setMentionStartIndex] = useState(-1);
  const [selectedMentions, setSelectedMentions] = useState<string[]>([]);

  // Animation values
  const inputAnimation = useSharedValue(1);
  const sendButtonAnimation = useSharedValue(0);

  useEffect(() => {
    sendButtonAnimation.value = withSpring(message.trim().length > 0 ? 1 : 0);
  }, [message]);

  const animatedInputStyle = useAnimatedStyle(() => ({
    transform: [{ scale: inputAnimation.value }],
  }));

  const animatedSendButtonStyle = useAnimatedStyle(() => ({
    opacity: sendButtonAnimation.value,
    transform: [
      { scale: interpolate(sendButtonAnimation.value, [0, 1], [0.8, 1]) },
    ],
  }));

  const handleInputChange = (text: string) => {
    setMessage(text);

    // Handle typing indicators
    if (!isTyping && text.length > 0) {
      setIsTyping(true);
      onTypingStart?.();
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        onTypingStop?.();
      }
    }, 1000);

    // Handle mentions
    const lastAtIndex = text.lastIndexOf('@');
    if (lastAtIndex !== -1) {
      const afterAt = text.substring(lastAtIndex + 1);
      const spaceIndex = afterAt.indexOf(' ');
      
      if (spaceIndex === -1 || afterAt.length <= 20) {
        setMentionQuery(afterAt);
        setMentionStartIndex(lastAtIndex);
        setShowMentions(true);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  const handleSend = () => {
    if (!message.trim() || disabled) return;

    // Clean up typing
    if (isTyping) {
      setIsTyping(false);
      onTypingStop?.();
    }

    onSendMessage(message.trim(), selectedMentions);
    setMessage('');
    setSelectedMentions([]);
  };

  const handleMentionSelect = (member: MentionSuggestion) => {
    const beforeMention = message.substring(0, mentionStartIndex);
    const afterMention = message.substring(mentionStartIndex + mentionQuery.length + 1);
    
    const newMessage = `${beforeMention}@${member.name} ${afterMention}`;
    setMessage(newMessage);
    setSelectedMentions(prev => [...prev, member.id]);
    setShowMentions(false);
    
    // Focus back to input
    textInputRef.current?.focus();
  };

  const handleEmojiSelect = (emoji: string) => {
    const newMessage = message + emoji;
    setMessage(newMessage);
    setShowEmojiPicker(false);
    textInputRef.current?.focus();
  };

  const handleInputFocus = () => {
    inputAnimation.value = withSpring(1.02);
  };

  const handleInputBlur = () => {
    inputAnimation.value = withSpring(1);
    
    // Stop typing after a delay when input loses focus
    setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        onTypingStop?.();
      }
    }, 2000);
  };

  const filteredMembers = MOCK_MEMBERS.filter(member =>
    member.name.toLowerCase().includes(mentionQuery.toLowerCase()) ||
    member.role.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  const renderMentionSuggestions = () => {
    if (!showMentions || filteredMembers.length === 0) return null;

    return (
      <Animated.View
        entering={FadeInUp.duration(200)}
        style={{
          position: 'absolute',
          bottom: '100%',
          left: 0,
          right: 0,
          backgroundColor: theme.colors.surface,
          borderRadius: 12,
          marginBottom: 8,
          maxHeight: 200,
          borderWidth: 1,
          borderColor: theme.colors.border,
          shadowColor: theme.colors.shadows.neutral,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ padding: 8 }}>
            <Text
              style={{
                fontSize: 12,
                fontWeight: '600',
                color: theme.colors.text.secondary,
                paddingHorizontal: 8,
                paddingVertical: 4,
              }}
            >
              People
            </Text>
            
            {filteredMembers.map((member, index) => (
              <TouchableOpacity
                key={member.id}
                onPress={() => handleMentionSelect(member)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 8,
                  paddingVertical: 8,
                  borderRadius: 8,
                  backgroundColor: 'transparent',
                }}
              >
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: theme.colors.primary,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: 'bold',
                      color: theme.colors.text.onPrimary,
                    }}
                  >
                    {member.avatar}
                  </Text>
                </View>
                
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '600',
                      color: theme.colors.text.primary,
                    }}
                  >
                    {member.name}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: theme.colors.text.secondary,
                    }}
                  >
                    {member.role}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </Animated.View>
    );
  };

  const renderEmojiPicker = () => (
    <Modal
      visible={showEmojiPicker}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowEmojiPicker(false)}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.background,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: theme.colors.text.primary,
            }}
          >
            Choose Emoji
          </Text>
          
          <TouchableOpacity
            onPress={() => setShowEmojiPicker(false)}
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
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20 }}
        >
          {EMOJI_CATEGORIES.map((category, categoryIndex) => (
            <Animated.View
              key={category.name}
              entering={FadeInDown.delay(categoryIndex * 100)}
              style={{ marginBottom: 24 }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: 'bold',
                  color: theme.colors.text.primary,
                  marginBottom: 12,
                }}
              >
                {category.icon} {category.name}
              </Text>
              
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  gap: 8,
                }}
              >
                {category.emojis.map((emoji, emojiIndex) => (
                  <Animated.View
                    key={emoji}
                    entering={ZoomIn.delay(emojiIndex * 20)}
                  >
                    <TouchableOpacity
                      onPress={() => handleEmojiSelect(emoji)}
                      style={{
                        width: 44,
                        height: 44,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 12,
                        backgroundColor: theme.colors.surface,
                        borderWidth: 1,
                        borderColor: theme.colors.border,
                      }}
                    >
                      <Text style={{ fontSize: 20 }}>{emoji}</Text>
                    </TouchableOpacity>
                  </Animated.View>
                ))}
              </View>
            </Animated.View>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );

  return (
    <View
      style={{
        backgroundColor: theme.colors.background,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        paddingHorizontal: 16,
        paddingVertical: 12,
        position: 'relative',
      }}
    >
      {/* Reply indicator */}
      {replyingTo && (
        <Animated.View
          entering={FadeInDown.duration(200)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: theme.colors.accent + '20',
            borderRadius: 8,
            padding: 8,
            marginBottom: 8,
            borderLeftWidth: 3,
            borderLeftColor: theme.colors.accent,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 12,
                fontWeight: '600',
                color: theme.colors.accent,
              }}
            >
              Replying to {replyingTo.author}
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: theme.colors.text.secondary,
                marginTop: 2,
              }}
              numberOfLines={1}
            >
              {replyingTo.content}
            </Text>
          </View>
          
          <TouchableOpacity
            onPress={onCancelReply}
            style={{
              padding: 4,
              marginLeft: 8,
            }}
          >
            <MaterialIcon
              name="close"
              size={16}
              color={theme.colors.text.secondary}
            />
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Mention suggestions */}
      {renderMentionSuggestions()}

      <Animated.View
        style={[
          {
            flexDirection: 'row',
            alignItems: 'flex-end',
            gap: 8,
          },
          animatedInputStyle,
        ]}
      >
        {/* Attachment button */}
        <TouchableOpacity
          onPress={() => showNotification('File attachment coming soon!', 'info')}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: theme.colors.surface,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          <MaterialIcon
            name="attach-file"
            size={18}
            color={theme.colors.text.secondary}
          />
        </TouchableOpacity>

        {/* Text input container */}
        <View
          style={{
            flex: 1,
            backgroundColor: theme.colors.surface,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: theme.colors.border,
            paddingHorizontal: 16,
            paddingVertical: 8,
            maxHeight: 100,
          }}
        >
          <TextInput
            ref={textInputRef}
            value={message}
            onChangeText={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder={placeholder}
            placeholderTextColor={theme.colors.text.secondary}
            multiline
            style={{
              fontSize: 14,
              color: theme.colors.text.primary,
              minHeight: 20,
              maxHeight: 60,
              textAlignVertical: 'top',
              paddingVertical: Platform.OS === 'android' ? 0 : 4,
            }}
            editable={!disabled}
          />
        </View>

        {/* Emoji button */}
        <TouchableOpacity
          onPress={() => setShowEmojiPicker(true)}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: theme.colors.surface,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          <MaterialCommunityIcon
            name="emoticon-outline"
            size={18}
            color={theme.colors.text.secondary}
          />
        </TouchableOpacity>

        {/* Send button */}
        <Animated.View style={animatedSendButtonStyle}>
          <TouchableOpacity
            onPress={handleSend}
            disabled={!message.trim() || disabled}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: message.trim() && !disabled
                ? theme.colors.primary
                : theme.colors.surface,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: message.trim() && !disabled
                ? theme.colors.primary
                : theme.colors.border,
            }}
          >
            <MaterialIcon
              name="send"
              size={18}
              color={message.trim() && !disabled
                ? theme.colors.text.onPrimary
                : theme.colors.text.secondary}
            />
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>

      {/* Emoji picker modal */}
      {renderEmojiPicker()}
    </View>
  );
};