import React from 'react';
import { Text } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';

interface GreetingSectionProps {
  greetingOpacity: Animated.SharedValue<number>;
  greetingScale: Animated.SharedValue<number>;
  title?: string;
  subtitle?: string;
}

export const GreetingSection: React.FC<GreetingSectionProps> = ({
  greetingOpacity,
  greetingScale,
  title = "Transform Your Workflow",
  subtitle = "Harness the power of advanced AI to revolutionize project management. Simply speak your commands and watch Javier work magic.",
}) => {
  const { theme } = useTheme();

  const greetingAnimatedStyle = useAnimatedStyle(() => ({
    opacity: greetingOpacity.value,
    transform: [{ scale: greetingScale.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          paddingHorizontal: 24,
          alignItems: 'center',
          marginBottom: 32,
        },
        greetingAnimatedStyle,
      ]}
    >
      <Text
        style={{
          fontSize: 36,
          fontWeight: '900',
          color: theme.colors.text.primary,
          textAlign: 'center',
          marginBottom: 12,
        }}
      >
        Transform Your
        <Text style={{ color: theme.colors.primary }}> Workflow</Text>
      </Text>
      <Text
        style={{
          fontSize: 18,
          color: theme.colors.text.secondary,
          textAlign: 'center',
          lineHeight: 26,
          paddingHorizontal: 20,
        }}
      >
        {subtitle}
      </Text>
    </Animated.View>
  );
};