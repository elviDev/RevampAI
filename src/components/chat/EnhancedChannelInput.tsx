import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal } from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import { PromptInput } from '../voice/PromptInput';

interface EnhancedChannelInputProps {
  onSendMessage: (text: string) => void;
  onEditMessage?: (messageId: string, content: string) => void;
  onSendVoiceMessage: (audioUri: string, transcript?: string) => void;
  onAttachFile: (file: any) => void;
  onAttachImage: (image: any) => void;
  onStartTyping?: () => void;
  onStopTyping?: () => void;
  onStartReplyTyping?: (parentMessageId: string, parentUserName: string) => void;
  onStopReplyTyping?: (parentMessageId: string) => void;
  placeholder?: string;
  replyingTo?: {
    id: string;
    content: string;
    sender: string;
  } | null;
  onCancelReply?: () => void;
  editingMessage?: {
    id: string;
    content: string;
  } | null;
  onCancelEdit?: () => void;
}

export const EnhancedChannelInput: React.FC<EnhancedChannelInputProps> = ({
  onSendMessage,
  onEditMessage,
  onSendVoiceMessage,
  onAttachFile,
  onAttachImage,
  onStartTyping,
  onStopTyping,
  onStartReplyTyping,
  onStopReplyTyping,
  placeholder = 'Message #channel',
  replyingTo,
  onCancelReply,
  editingMessage,
  onCancelEdit,
}) => {
  const [message, setMessage] = useState('');
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const isTypingRef = useRef(false);

  // Set initial text when editing
  useEffect(() => {
    if (editingMessage) {
      setMessage(editingMessage.content);
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setMessage('');
    }
  }, [editingMessage]);

  // Handle typing indicators
  const handleTextChange = (text: string) => {
    setMessage(text);
    
    // Start typing indicator
    if (text.trim() && !isTypingRef.current) {
      isTypingRef.current = true;
      
      if (replyingTo && onStartReplyTyping) {
        onStartReplyTyping(replyingTo.id, replyingTo.sender);
      } else if (onStartTyping) {
        onStartTyping();
      }
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      if (isTypingRef.current) {
        isTypingRef.current = false;
        
        if (replyingTo && onStopReplyTyping) {
          onStopReplyTyping(replyingTo.id);
        } else if (onStopTyping) {
          onStopTyping();
        }
      }
    }, 2000);
  };

  // Stop typing when component unmounts or input loses focus
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isTypingRef.current) {
        if (replyingTo && onStopReplyTyping) {
          onStopReplyTyping(replyingTo.id);
        } else if (onStopTyping) {
          onStopTyping();
        }
      }
    };
  }, []);

  const handleSend = () => {
    if (message.trim()) {
      // Stop typing indicator immediately
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isTypingRef.current) {
        isTypingRef.current = false;
        if (replyingTo && onStopReplyTyping) {
          onStopReplyTyping(replyingTo.id);
        } else if (onStopTyping) {
          onStopTyping();
        }
      }

      // Handle editing vs sending new message
      if (editingMessage && onEditMessage) {
        // Edit existing message
        onEditMessage(editingMessage.id, message.trim());
        if (onCancelEdit) {
          onCancelEdit();
        }
      } else {
        // Send new message (including replies)
        onSendMessage(message.trim());
      }
      
      setMessage('');
    }
  };

  const handleCancel = () => {
    // Stop typing indicator
    if (isTypingRef.current) {
      isTypingRef.current = false;
      if (replyingTo && onStopReplyTyping) {
        onStopReplyTyping(replyingTo.id);
      } else if (onStopTyping) {
        onStopTyping();
      }
    }

    setMessage('');
    if (replyingTo && onCancelReply) {
      onCancelReply();
    }
    if (editingMessage && onCancelEdit) {
      onCancelEdit();
    }
  };

  const handleBlur = () => {
    // Stop typing indicator when input loses focus
    if (isTypingRef.current) {
      isTypingRef.current = false;
      if (replyingTo && onStopReplyTyping) {
        onStopReplyTyping(replyingTo.id);
      } else if (onStopTyping) {
        onStopTyping();
      }
    }
  };

  return (
    <View className="bg-white border-t border-gray-200">
      {/* Reply Preview */}
      {replyingTo && (
        <View className="flex-row items-center px-4 py-2 bg-blue-50 border-l-4 border-blue-400">
          <MaterialIcon name="reply" size={16} color="#3B82F6" />
          <View className="flex-1 ml-2">
            <Text className="text-blue-600 text-xs font-medium">
              Replying to {replyingTo.sender}
            </Text>
            <Text className="text-gray-600 text-sm" numberOfLines={1}>
              {replyingTo.content}
            </Text>
          </View>
          <TouchableOpacity onPress={handleCancel} className="p-1">
            <MaterialIcon name="close" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      )}

      {/* Edit Preview */}
      {editingMessage && (
        <View className="flex-row items-center px-4 py-2 bg-amber-50 border-l-4 border-amber-400">
          <MaterialIcon name="edit" size={16} color="#F59E0B" />
          <View className="flex-1 ml-2">
            <Text className="text-amber-600 text-xs font-medium">
              Editing message
            </Text>
            <Text className="text-gray-600 text-sm" numberOfLines={1}>
              {editingMessage.content}
            </Text>
          </View>
          <TouchableOpacity onPress={handleCancel} className="p-1">
            <MaterialIcon name="close" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      )}

      {/* Input Area */}
      <View className="flex-row items-end space-x-2 p-4">
        {/* Attachment Button */}
        <TouchableOpacity 
          onPress={() => onAttachFile({})}
          className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
        >
          <MaterialIcon name="add" size={24} color="#6B7280" />
        </TouchableOpacity>

        {/* Text Input Container */}
        <View className="flex-1 min-h-[40px] max-h-[120px] bg-gray-100 rounded-2xl px-4 py-2 flex-row items-center">
          <TextInput
            ref={inputRef}
            value={message}
            onChangeText={handleTextChange}
            onBlur={handleBlur}
            placeholder={replyingTo ? `Reply to ${replyingTo.sender}...` : editingMessage ? 'Edit message...' : placeholder}
            multiline
            className="flex-1 text-gray-700 text-base"
            style={{ textAlignVertical: 'center' }}
            autoCapitalize="sentences"
            autoCorrect
            blurOnSubmit={false}
            onSubmitEditing={handleSend}
          />
        </View>

        {/* Action Buttons */}
        <View className="flex-row items-center space-x-2">
          {/* Voice Button */}
          <TouchableOpacity 
            onPress={() => setShowVoiceModal(true)}
            className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center"
          >
            <MaterialIcon name="mic" size={20} color="#3B82F6" />
          </TouchableOpacity>

          {/* Send Button */}
          {message.trim() ? (
            <TouchableOpacity 
              onPress={handleSend}
              className="w-10 h-10 rounded-full items-center justify-center"
            >
              <LinearGradient
                colors={['#3B82F6', '#1D4ED8']}
                className="w-10 h-10 rounded-full items-center justify-center"
              >
                <MaterialIcon name="send" size={20} color="white" />
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              onPress={() => onAttachImage({})}
              className="w-10 h-10 rounded-full bg-green-100 items-center justify-center"
            >
              <MaterialIcon name="photo-camera" size={20} color="#10B981" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Voice Input Modal */}
      <Modal
        visible={showVoiceModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowVoiceModal(false)}
      >
        <PromptInput
          onSendVoice={(audioUri: string, transcript?: string) => {
            setShowVoiceModal(false);
            onSendVoiceMessage(audioUri, transcript);
          }}
          onClose={() => setShowVoiceModal(false)}
          showCloseButton
          placeholder={replyingTo ? `Voice reply to ${replyingTo.sender}...` : "Voice message..."}
        />
      </Modal>
    </View>
  );
};