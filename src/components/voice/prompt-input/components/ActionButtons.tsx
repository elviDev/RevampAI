import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../../contexts/ThemeContext';

interface ActionButtonsProps {
  isRecording: boolean;
  hasText: boolean;
  hasAttachments: boolean;
  isEnhancing: boolean;
  shouldShowEnhanceButton: boolean;
  sendButtonScale: Animated.SharedValue<number>;
  onAttachmentPress: () => void;
  onEmojiPress: () => void;
  onEnhancePress: () => void;
  onRecordPress: () => void;
  onStopRecordingPress: () => void;
  onSendPress: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  isRecording,
  hasText,
  hasAttachments,
  isEnhancing,
  shouldShowEnhanceButton,
  sendButtonScale,
  onAttachmentPress,
  onEmojiPress,
  onEnhancePress,
  onRecordPress,
  onStopRecordingPress,
  onSendPress,
}) => {
  const { theme } = useTheme();

  const sendButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sendButtonScale.value }],
  }));

  return (
    <View style={{
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      gap: 8,
    }}>
      {/* Attachment Button */}
      {!isRecording && (
        <TouchableOpacity
          onPress={onAttachmentPress}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: theme.colors.glass.background,
            borderWidth: 1,
            borderColor: theme.colors.glass.border,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: theme.colors.shadows.neutral,
            shadowOffset: { width: 0, height: 4 },
            shadowRadius: 12,
            shadowOpacity: 0.15,
            elevation: 6,
          }}
        >
          <Icon name="paperclip" size={20} color={theme.colors.text.secondary} />
        </TouchableOpacity>
      )}

      {/* Emoji Button */}
      {!isRecording && (
        <TouchableOpacity
          onPress={onEmojiPress}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: theme.colors.warning + '20',
            borderWidth: 1,
            borderColor: theme.colors.warning + '40',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: theme.colors.warning,
            shadowOffset: { width: 0, height: 4 },
            shadowRadius: 12,
            shadowOpacity: 0.2,
            elevation: 6,
          }}
        >
          <MaterialCommunityIcon name="emoticon-happy" size={20} color={theme.colors.warning} />
        </TouchableOpacity>
      )}

      {/* Enhancement Button */}
      {!isRecording && shouldShowEnhanceButton && (
        <TouchableOpacity
          onPress={onEnhancePress}
          disabled={isEnhancing}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: theme.colors.success + '20',
            borderWidth: 1,
            borderColor: theme.colors.success + '40',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: theme.colors.success,
            shadowOffset: { width: 0, height: 4 },
            shadowRadius: 12,
            shadowOpacity: 0.2,
            elevation: 6,
            opacity: isEnhancing ? 0.6 : 1,
          }}
        >
          <MaterialCommunityIcon
            name={isEnhancing ? 'loading' : 'magic-staff'}
            size={20}
            color={theme.colors.success}
          />
        </TouchableOpacity>
      )}

      {/* Voice/Send Button */}
      {isRecording ? (
        <LinearGradient
          colors={theme.colors.gradients.error || [theme.colors.error, theme.colors.errorDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: theme.colors.error,
            shadowOffset: { width: 0, height: 8 },
            shadowRadius: 20,
            shadowOpacity: 0.4,
            elevation: 12,
          }}
        >
          <TouchableOpacity
            onPress={onStopRecordingPress}
            style={{
              width: '100%',
              height: '100%',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MaterialIcon name="send" size={24} color={theme.colors.text.onPrimary} />
          </TouchableOpacity>
        </LinearGradient>
      ) : hasText || hasAttachments ? (
        <Animated.View style={sendButtonAnimatedStyle}>
          <LinearGradient
            colors={theme.colors.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: theme.colors.primary,
              shadowOffset: { width: 0, height: 8 },
              shadowRadius: 20,
              shadowOpacity: 0.4,
              elevation: 12,
            }}
          >
            <TouchableOpacity
              onPress={onSendPress}
              style={{
                width: '100%',
                height: '100%',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MaterialIcon name="send" size={24} color={theme.colors.text.onPrimary} />
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      ) : (
        <TouchableOpacity
          onPress={onRecordPress}
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: theme.colors.glass.background,
            borderWidth: 2,
            borderColor: theme.colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: theme.colors.primary,
            shadowOffset: { width: 0, height: 6 },
            shadowRadius: 16,
            shadowOpacity: 0.3,
            elevation: 8,
          }}
        >
          <MaterialCommunityIcon name="microphone" size={28} color={theme.colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
};