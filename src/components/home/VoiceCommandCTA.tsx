import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../contexts/ThemeContext';

interface VoiceCommandCTAProps {
  promptOpacity: Animated.SharedValue<number>;
  onPress?: () => void;
  title?: string;
  subtitle?: string;
  iconName?: string;
  iconSize?: number;
}

export const VoiceCommandCTA: React.FC<VoiceCommandCTAProps> = ({
  promptOpacity,
  onPress,
  title = "Try Voice Commands",
  subtitle = "Speak naturally and let Javier handle the complexity",
  iconName = "microphone",
  iconSize = 48,
}) => {
  const { theme } = useTheme();

  const promptAnimatedStyle = useAnimatedStyle(() => ({
    opacity: promptOpacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          paddingHorizontal: 24,
          alignItems: 'center',
          marginBottom: 24,
        },
        promptAnimatedStyle,
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.9}
        style={{ width: '100%' }}
      >
        <LinearGradient
          colors={theme.colors.gradients.accent}
          style={{
            borderRadius: 20,
            padding: 24,
            alignItems: 'center',
            width: '100%',
            shadowColor: theme.colors.accent,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 12,
          }}
        >
          <MaterialCommunityIcon
            name={iconName}
            size={iconSize}
            color={theme.colors.text.onPrimary}
          />
          <Text
            style={{
              fontSize: 20,
              fontWeight: '700',
              color: theme.colors.text.onPrimary,
              textAlign: 'center',
              marginTop: 12,
              marginBottom: 8,
            }}
          >
            {title}
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: theme.colors.text.onPrimary + 'CC',
              textAlign: 'center',
              lineHeight: 22,
            }}
          >
            {subtitle}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};