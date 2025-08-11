import React from 'react';
import { View, ViewStyle, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../../utils/colors';

const { width, height } = Dimensions.get('window');

interface GlassBackgroundProps {
  children: React.ReactNode;
  variant?: 'light' | 'dark' | 'primary' | 'accent';
  intensity?: 'subtle' | 'medium' | 'strong';
  animated?: boolean;
  style?: ViewStyle;
}

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export const GlassBackground: React.FC<GlassBackgroundProps> = ({
  children,
  variant = 'light',
  intensity = 'medium',
  animated = true,
  style,
}) => {
  const floatingAnimation = useSharedValue(0);
  const glowAnimation = useSharedValue(0);
  const particleAnimation = useSharedValue(0);

  React.useEffect(() => {
    if (animated) {
      // Floating animation
      floatingAnimation.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 4000, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );

      // Glow animation
      glowAnimation.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.quad) }),
          withTiming(0, { duration: 3000, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        true
      );

      // Particle animation
      particleAnimation.value = withRepeat(
        withTiming(1, { duration: 8000, easing: Easing.linear }),
        -1,
        false
      );
    }
  }, [animated]);

  const getBackgroundColors = () => {
    const intensityMap = {
      subtle: 0.08,
      medium: 0.15,
      strong: 0.25,
    };

    const alpha = intensityMap[intensity];

    switch (variant) {
      case 'dark':
        return [
          `rgba(0, 0, 0, ${alpha})`,
          `rgba(0, 0, 0, ${alpha * 0.6})`,
          `rgba(0, 0, 0, ${alpha * 0.3})`,
        ];
      case 'primary':
        const primaryRgb = hexToRgb(Colors.primary);
        return [
          `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, ${alpha})`,
          `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, ${alpha * 0.6})`,
          `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, ${alpha * 0.3})`,
        ];
      case 'accent':
        const accentRgb = hexToRgb(Colors.accent);
        return [
          `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, ${alpha})`,
          `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, ${alpha * 0.6})`,
          `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, ${alpha * 0.3})`,
        ];
      default: // light
        return [
          `rgba(255, 255, 255, ${alpha})`,
          `rgba(255, 255, 255, ${alpha * 0.6})`,
          `rgba(255, 255, 255, ${alpha * 0.3})`,
        ];
    }
  };

  const getBorderColor = () => {
    const intensityMap = {
      subtle: 0.1,
      medium: 0.2,
      strong: 0.3,
    };

    const alpha = intensityMap[intensity];

    switch (variant) {
      case 'dark':
        return `rgba(255, 255, 255, ${alpha})`;
      case 'primary':
        const primaryRgb = hexToRgb(Colors.primary);
        return `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, ${alpha + 0.2})`;
      case 'accent':
        const accentRgb = hexToRgb(Colors.accent);
        return `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, ${alpha + 0.2})`;
      default: // light
        return `rgba(255, 255, 255, ${alpha + 0.1})`;
    }
  };

  const floatingStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          floatingAnimation.value,
          [0, 1],
          [0, -10]
        ),
      },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      glowAnimation.value,
      [0, 1],
      [0.3, 0.8]
    ),
  }));

  const particleStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          particleAnimation.value,
          [0, 1],
          [-width, width * 2]
        ),
      },
    ],
  }));

  return (
    <View style={[{ flex: 1 }, style]}>
      {/* Animated background gradient */}
      <AnimatedLinearGradient
        colors={getBackgroundColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          {
            position: 'absolute',
            width: width,
            height: height,
            borderWidth: 1,
            borderColor: getBorderColor(),
          },
          animated && floatingStyle,
        ]}
      />

      {/* Animated glow overlay */}
      {animated && (
        <Animated.View
          style={[
            {
              position: 'absolute',
              width: width,
              height: height,
              backgroundColor: variant === 'primary' ? Colors.primary : 
                               variant === 'accent' ? Colors.accent : 
                               'rgba(255, 255, 255, 0.1)',
              opacity: 0.1,
            },
            glowStyle,
          ]}
        />
      )}

      {/* Floating particles */}
      {animated && (
        <Animated.View
          style={[
            {
              position: 'absolute',
              width: width * 3,
              height: height,
              left: -width,
            },
            particleStyle,
          ]}
        >
          {[...Array(15)].map((_, index) => (
            <View
              key={index}
              style={{
                position: 'absolute',
                width: Math.random() * 4 + 2,
                height: Math.random() * 4 + 2,
                borderRadius: 2,
                backgroundColor: variant === 'primary' ? Colors.primary : 
                                variant === 'accent' ? Colors.accent : 
                                'rgba(255, 255, 255, 0.6)',
                left: Math.random() * width,
                top: Math.random() * height,
                opacity: Math.random() * 0.7 + 0.3,
              }}
            />
          ))}
        </Animated.View>
      )}

      {/* Content */}
      <View style={{ flex: 1, zIndex: 10 }}>
        {children}
      </View>
    </View>
  );
};

// Glass card component for individual elements
interface GlassCardProps {
  children: React.ReactNode;
  variant?: 'light' | 'dark' | 'primary' | 'accent';
  intensity?: 'subtle' | 'medium' | 'strong';
  borderRadius?: number;
  style?: ViewStyle;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  variant = 'light',
  intensity = 'medium',
  borderRadius = 16,
  style,
}) => {
  const getBackgroundColors = () => {
    const intensityMap = {
      subtle: 0.1,
      medium: 0.15,
      strong: 0.25,
    };

    const alpha = intensityMap[intensity];

    switch (variant) {
      case 'dark':
        return [
          `rgba(0, 0, 0, ${alpha})`,
          `rgba(0, 0, 0, ${alpha * 0.8})`,
        ];
      case 'primary':
        const primaryRgb = hexToRgb(Colors.primary);
        return [
          `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, ${alpha})`,
          `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, ${alpha * 0.8})`,
        ];
      case 'accent':
        const accentRgb = hexToRgb(Colors.accent);
        return [
          `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, ${alpha})`,
          `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, ${alpha * 0.8})`,
        ];
      default: // light
        return [
          `rgba(255, 255, 255, ${alpha})`,
          `rgba(255, 255, 255, ${alpha * 0.8})`,
        ];
    }
  };

  const getBorderColor = () => {
    const intensityMap = {
      subtle: 0.15,
      medium: 0.25,
      strong: 0.35,
    };

    const alpha = intensityMap[intensity];

    switch (variant) {
      case 'dark':
        return `rgba(255, 255, 255, ${alpha})`;
      case 'primary':
        const primaryRgb = hexToRgb(Colors.primary);
        return `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, ${alpha + 0.2})`;
      case 'accent':
        const accentRgb = hexToRgb(Colors.accent);
        return `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, ${alpha + 0.2})`;
      default: // light
        return `rgba(255, 255, 255, ${alpha + 0.1})`;
    }
  };

  return (
    <LinearGradient
      colors={getBackgroundColors()}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        {
          borderRadius,
          borderWidth: 1,
          borderColor: getBorderColor(),
          shadowColor: variant === 'primary' ? Colors.shadows.primary :
                       variant === 'accent' ? Colors.accent :
                       Colors.shadows.neutral,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
        },
        style,
      ]}
    >
      {children}
    </LinearGradient>
  );
};

// Utility function to convert hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : { r: 0, g: 0, b: 0 };
}