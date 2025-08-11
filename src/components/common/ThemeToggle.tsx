import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  interpolateColor,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import { designTokens } from '../../utils/colors';

interface ThemeToggleProps {
  size?: 'small' | 'medium' | 'large';
  style?: any;
  showLabel?: boolean;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  size = 'medium', 
  style,
  showLabel = false 
}) => {
  const { theme, toggleTheme } = useTheme();
  
  const getSizes = () => {
    switch (size) {
      case 'small':
        return { width: 44, height: 24, iconSize: 12 };
      case 'large':
        return { width: 64, height: 32, iconSize: 16 };
      default:
        return { width: 54, height: 28, iconSize: 14 };
    }
  };

  const sizes = getSizes();
  const maxTranslateX = sizes.width - sizes.height - 4;

  const toggleAnimation = useSharedValue(theme.isDark ? 1 : 0);
  const scaleAnimation = useSharedValue(1);

  React.useEffect(() => {
    toggleAnimation.value = withSpring(theme.isDark ? 1 : 0, {
      damping: 15,
      stiffness: 150,
    });
  }, [theme.isDark]);

  const animatedToggleStyle = useAnimatedStyle(() => {
    const translateX = toggleAnimation.value * maxTranslateX;
    
    return {
      transform: [
        { translateX },
        { scale: scaleAnimation.value }
      ],
      backgroundColor: interpolateColor(
        toggleAnimation.value,
        [0, 1],
        [theme.colors.warning, theme.colors.primary]
      ),
    };
  });

  const animatedBackgroundStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        toggleAnimation.value,
        [0, 1],
        [theme.colors.surface, theme.colors.surfaceElevated]
      ),
      borderColor: interpolateColor(
        toggleAnimation.value,
        [0, 1],
        [theme.colors.border, theme.colors.primary + '40']
      ),
    };
  });

  const handlePress = () => {
    scaleAnimation.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );
    toggleTheme();
  };


  return (
    <TouchableOpacity
      style={[
        {
          flexDirection: showLabel ? 'row' : 'column',
          alignItems: 'center',
          padding: showLabel ? designTokens.spacing.sm : 0,
        },
        style
      ]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <AnimatedTouchableOpacity
        style={[
          {
            width: sizes.width,
            height: sizes.height,
            borderRadius: sizes.height / 2,
            borderWidth: 2,
            padding: 2,
            justifyContent: 'center',
            ...designTokens.shadows.sm,
            shadowColor: theme.colors.shadows.neutral,
          },
          animatedBackgroundStyle,
        ]}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        <Animated.View
          style={[
            {
              width: sizes.height - 4,
              height: sizes.height - 4,
              borderRadius: (sizes.height - 4) / 2,
              justifyContent: 'center',
              alignItems: 'center',
              ...designTokens.shadows.sm,
            },
            animatedToggleStyle,
          ]}
        >
          <Text
            style={{
              fontSize: sizes.iconSize,
              color: theme.colors.text.onPrimary,
              fontWeight: designTokens.fontWeight.bold,
            }}
          >
            {theme.isDark ? '🌙' : '☀️'}
          </Text>
        </Animated.View>
      </AnimatedTouchableOpacity>

      {showLabel && (
        <Text
          style={{
            marginLeft: designTokens.spacing.sm,
            fontSize: designTokens.fontSize.sm,
            color: theme.colors.text.secondary,
            fontWeight: designTokens.fontWeight.medium,
          }}
        >
          {theme.isDark ? 'Dark Mode' : 'Light Mode'}
        </Text>
      )}
    </TouchableOpacity>
  );
};