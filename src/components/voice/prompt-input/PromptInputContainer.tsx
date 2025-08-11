import React, { useState, useRef } from 'react';
import {
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform,
  Text,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
  interpolateColor,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../../contexts/ThemeContext';
import { EmojiPicker } from '../../chat/EmojiPicker';

// Import modular components
import { SparkleEffect } from './components/SparkleEffect';
import { RecordingIndicator } from './components/RecordingIndicator';
import { TextInputField } from './components/TextInputField';
import { ActionButtons } from './components/ActionButtons';
import { AttachmentPreview } from './components/AttachmentPreview';
import { MentionSuggestions } from './components/MentionSuggestions';
import { AttachmentModal } from './components/AttachmentModal';

// Import hooks
import { usePromptInputAnimations } from './hooks/usePromptInputAnimations';
import { useVoiceRecording } from './hooks/useVoiceRecording';
import { useMentions } from './hooks/useMentions';
import { useFileAttachments } from './hooks/useFileAttachments';
import { useTextEnhancement } from './hooks/useTextEnhancement';

// Import types
import { PromptInputProps } from './types';

export const PromptInput: React.FC<PromptInputProps> = ({
  onSendMessage,
  onSendRecording,
  onAttachFile,
  onAttachImage,
  onEnhanceText,
  placeholder = 'Tell Javier what you need...',
  disabled = false,
}) => {
  const { theme } = useTheme();
  const [text, setText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const textInputRef = useRef<TextInput>(null);

  // Custom hooks
  const animations = usePromptInputAnimations();
  const voiceRecording = useVoiceRecording(onSendRecording);
  const mentions = useMentions();
  const fileAttachments = useFileAttachments(onAttachFile, onAttachImage);
  const textEnhancement = useTextEnhancement(onEnhanceText);

  // Handle text change with mention detection
  const handleTextChange = (newText: string) => {
    setText(newText);
    setTimeout(() => {
      mentions.checkForMentions(newText, mentions.selectionStart);
    }, 0);
  };

  // Handle focus and blur events
  const handleFocus = () => {
    setIsFocused(true);
    animations.animateFocus();
  };

  const handleBlur = () => {
    setIsFocused(false);
    animations.animateBlur(voiceRecording.recording.isRecording);
  };

  // Handle send message
  const handleSend = () => {
    if (text.trim() || fileAttachments.attachedFiles.length > 0) {
      animations.animateSendButton();

      if (onSendMessage && text.trim()) {
        onSendMessage(text.trim());
        setText('');
      }

      fileAttachments.setAttachedFiles([]);
    }
  };

  // Handle voice recording
  const handleStartRecording = () => {
    voiceRecording.startRecording(animations.startRecordingAnimations);
  };

  const handleStopRecording = () => {
    voiceRecording.stopRecording(animations.stopRecordingAnimations);
  };

  // Handle mention insertion
  const handleMentionSelect = (user: any) => {
    mentions.insertMention(
      user,
      text,
      handleTextChange,
      mentions.setSelectionStart,
      () => textInputRef.current?.focus()
    );
  };

  // Enhanced animated styles
  const containerAnimatedStyle = useAnimatedStyle(() => {
    const glowIntensity = interpolate(animations.borderGlow.value, [0, 1], [0, 0.4]);
    const focusScale = interpolate(animations.focusAnimation.value, [0, 1], [1, 1.02]);
    
    return {
      transform: [{ scale: focusScale }],
      shadowOpacity: glowIntensity,
    };
  });

  const borderAnimatedStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      animations.borderGlow.value,
      [0, 1],
      [theme.colors.border, theme.colors.primary]
    );
    
    return {
      borderColor,
      borderWidth: interpolate(animations.borderGlow.value, [0, 1], [1, 2]),
    };
  });

  if (disabled) {
    return (
      <View style={{
        paddingHorizontal: 16,
        paddingVertical: 8,
      }}>
        <View style={{
          backgroundColor: theme.colors.surface,
          borderRadius: 16,
          padding: 16,
          opacity: 0.6,
        }}>
          <Text style={{
            color: theme.colors.text.secondary,
            textAlign: 'center',
            fontSize: 16,
          }}>
            Input disabled
          </Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ paddingHorizontal: 16, paddingVertical: 8 }}
    >
      {/* Attachments Preview */}
      <AttachmentPreview
        attachedFiles={fileAttachments.attachedFiles}
        onRemoveAttachment={fileAttachments.removeAttachment}
      />

      {/* Mention Suggestions */}
      <MentionSuggestions
        visible={mentions.showMentionSuggestions}
        users={mentions.filteredMentionUsers}
        onSelectUser={handleMentionSelect}
      />

      {/* Main Input Container */}
      <Animated.View style={[containerAnimatedStyle, { position: 'relative' }]}>
        {/* Sparkle Background Effect */}
        <SparkleEffect sparkleAnimation={animations.sparkleAnimation} />

        {/* Gradient Border Container */}
        <LinearGradient
          colors={theme.colors.gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 16,
            padding: 2,
            shadowColor: theme.colors.primary,
            shadowOffset: { width: 0, height: 8 },
            shadowRadius: 24,
            shadowOpacity: animations.borderGlow.value * 0.3,
            elevation: 8,
          }}
        >
          {/* Inner Container with Glass Effect */}
          <Animated.View style={[
            {
              backgroundColor: theme.colors.surface,
              borderRadius: 14,
              padding: 16,
              minHeight: 70,
            },
            borderAnimatedStyle,
          ]}>
            {/* Input Area */}
            <View style={{ marginBottom: 12 }}>
              {voiceRecording.recording.isRecording ? (
                <RecordingIndicator
                  recording={voiceRecording.recording}
                  voiceResults={voiceRecording.voiceResults}
                  recordingAnimation={animations.pulseAnimation}
                  voiceWaveAnimation={animations.voiceWaveAnimation}
                  formatDuration={voiceRecording.formatDuration}
                />
              ) : (
                <TextInputField
                  value={text}
                  onChangeText={handleTextChange}
                  onSelectionChange={event => {
                    mentions.setSelectionStart(event.nativeEvent.selection.start);
                  }}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  placeholder={placeholder}
                  textInputRef={textInputRef}
                  isFocused={isFocused}
                />
              )}
            </View>

            {/* Enhanced Action Buttons Row */}
            <ActionButtons
              isRecording={voiceRecording.recording.isRecording}
              hasText={!!text.trim()}
              hasAttachments={fileAttachments.attachedFiles.length > 0}
              isEnhancing={textEnhancement.isEnhancing}
              shouldShowEnhanceButton={textEnhancement.shouldShowEnhanceButton(text)}
              sendButtonScale={animations.sendButtonScale}
              onAttachmentPress={() => fileAttachments.setShowAttachmentModal(true)}
              onEmojiPress={() => setShowEmojiPicker(true)}
              onEnhancePress={() => textEnhancement.handleEnhance(text, setText)}
              onRecordPress={handleStartRecording}
              onStopRecordingPress={handleStopRecording}
              onSendPress={handleSend}
            />
          </Animated.View>
        </LinearGradient>
      </Animated.View>

      {/* Attachment Modal */}
      <AttachmentModal
        visible={fileAttachments.showAttachmentModal}
        onClose={() => fileAttachments.setShowAttachmentModal(false)}
        onAttachFile={fileAttachments.attachFile}
        onAttachImage={fileAttachments.attachImage}
      />

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <EmojiPicker
          onEmojiSelected={(emoji: string) => {
            setText(prev => prev + emoji);
            setShowEmojiPicker(false);
          }}
          onClose={() => setShowEmojiPicker(false)}
        />
      )}
    </KeyboardAvoidingView>
  );
};