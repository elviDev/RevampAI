import React from 'react';
import Animated, { useAnimatedStyle, interpolate } from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../../../contexts/ThemeContext';

interface SparkleEffectProps {
  sparkleAnimation: Animated.SharedValue<number>;
}

export const SparkleEffect: React.FC<SparkleEffectProps> = ({
  sparkleAnimation,
}) => {
  const { theme } = useTheme();

  const sparkleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(sparkleAnimation.value, [0, 1], [0.1, 0.3]),
    transform: [
      { rotate: `${sparkleAnimation.value * 360}deg` },
      { scale: interpolate(sparkleAnimation.value, [0, 1], [0.8, 1.2]) }
    ],
  }));

  return (
    <Animated.View style={[
      {
        position: 'absolute',
        top: -4,
        left: -4,
        right: -4,
        bottom: -4,
        borderRadius: 20,
        opacity: 0.1,
      },
      sparkleAnimatedStyle
    ]}>
      <LinearGradient
        colors={[
          theme.colors.primary + '20',
          theme.colors.accent + '20',
          theme.colors.primary + '20',
        ]}
        style={{
          flex: 1,
          borderRadius: 20,
        }}
      />
    </Animated.View>
  );
};