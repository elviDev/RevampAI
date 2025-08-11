import React from 'react';
import {
  TouchableOpacity,
  Text,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';
import { designTokens } from '../../utils/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glass' | 'accent';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
  fullWidth = false,
}) => {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const shadowOpacity = useSharedValue(0.3);
  const elevation = useSharedValue(8);
  const glowIntensity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
    shadowOpacity: shadowOpacity.value,
    elevation: elevation.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowIntensity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
    opacity.value = withTiming(0.9, { duration: 100 });
    shadowOpacity.value = withTiming(0.1, { duration: 100 });
    elevation.value = withTiming(4, { duration: 100 });
    glowIntensity.value = withTiming(0.8, { duration: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    opacity.value = withTiming(1, { duration: 200 });
    shadowOpacity.value = withTiming(variant === 'primary' ? 0.3 : 0.15, { duration: 200 });
    elevation.value = withTiming(variant === 'primary' ? 8 : 4, { duration: 200 });
    glowIntensity.value = withTiming(0, { duration: 300 });
  };

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: size === 'small' 
        ? designTokens.borderRadius.md 
        : size === 'large' 
          ? designTokens.borderRadius.xxl 
          : designTokens.borderRadius.xl,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      ...(fullWidth && { width: '100%' }),
    };

    const sizeStyles = {
      small: { 
        paddingVertical: designTokens.spacing.sm + 2, 
        paddingHorizontal: designTokens.spacing.lg,
        minHeight: 40,
      },
      medium: { 
        paddingVertical: designTokens.spacing.md, 
        paddingHorizontal: designTokens.spacing.xl,
        minHeight: 48,
      },
      large: { 
        paddingVertical: designTokens.spacing.lg, 
        paddingHorizontal: designTokens.spacing.xl + 8,
        minHeight: 56,
      },
    };

    const variantStyles = {
      primary: {
        shadowColor: theme.colors.shadows.primary,
        ...designTokens.shadows.lg,
      },
      secondary: {
        backgroundColor: 'transparent',
        shadowColor: theme.colors.shadows.secondary,
        ...designTokens.shadows.md,
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: theme.colors.primary,
        shadowColor: theme.colors.shadows.neutral,
        ...designTokens.shadows.sm,
      },
      ghost: {
        backgroundColor: 'transparent',
      },
      glass: {
        backgroundColor: theme.colors.glass.background,
        borderWidth: 1,
        borderColor: theme.colors.glass.border,
        shadowColor: theme.colors.shadows.glass,
        ...designTokens.shadows.lg,
      },
      accent: {
        shadowColor: theme.colors.accent + '40',
        ...designTokens.shadows.lg,
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...(disabled && { opacity: 0.5 }),
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontWeight: size === 'large' 
        ? designTokens.fontWeight.bold 
        : designTokens.fontWeight.semibold,
      textAlign: 'center',
      letterSpacing: designTokens.letterSpacing.wide,
    };

    const sizeStyles = {
      small: { 
        fontSize: designTokens.fontSize.sm, 
        lineHeight: designTokens.fontSize.sm * designTokens.lineHeight.normal 
      },
      medium: { 
        fontSize: designTokens.fontSize.md, 
        lineHeight: designTokens.fontSize.md * designTokens.lineHeight.normal 
      },
      large: { 
        fontSize: designTokens.fontSize.lg, 
        lineHeight: designTokens.fontSize.lg * designTokens.lineHeight.normal 
      },
    };

    const variantStyles = {
      primary: { color: theme.colors.text.onPrimary },
      secondary: { color: 'transparent' }, // Will be overridden by gradient
      outline: { color: theme.colors.primary },
      ghost: { color: theme.colors.primary },
      glass: { color: theme.colors.text.primary, fontWeight: designTokens.fontWeight.semibold },
      accent: { color: theme.colors.text.onPrimary },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
    };
  };

  const renderButtonContent = () => {
    if (loading) {
      return (
        <ActivityIndicator 
          color={
            variant === 'outline' || variant === 'ghost' || variant === 'glass' 
              ? theme.colors.primary 
              : theme.colors.text.onPrimary
          } 
          size="small" 
        />
      );
    }

    return (
      <>
        {icon && (
          <View style={{ marginRight: designTokens.spacing.sm }}>
            {icon}
          </View>
        )}
        <Text style={[getTextStyle(), textStyle]}>
          {title}
        </Text>
      </>
    );
  };

  return (
    <View style={style}>
      {/* Glow effect for primary and accent buttons */}
      {(variant === 'primary' || variant === 'accent') && (
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: -2,
              left: -2,
              right: -2,
              bottom: -2,
              borderRadius: (size === 'small' 
                ? designTokens.borderRadius.md 
                : size === 'large' 
                  ? designTokens.borderRadius.xxl 
                  : designTokens.borderRadius.xl) + 2,
              backgroundColor: variant === 'accent' ? theme.colors.accent : theme.colors.primary,
              opacity: 0.2,
            },
            glowStyle,
          ]}
        />
      )}

      <AnimatedTouchableOpacity
        style={[
          animatedStyle,
          (variant === 'outline' || variant === 'ghost' || variant === 'glass') && getButtonStyle(),
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.9}
      >
        {variant === 'primary' && (
          <AnimatedLinearGradient
            colors={theme.colors.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[getButtonStyle()]}
          >
            {renderButtonContent()}
          </AnimatedLinearGradient>
        )}

        {variant === 'secondary' && (
          <LinearGradient
            colors={theme.colors.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[getButtonStyle(), { padding: 2 }]}
          >
            <View style={[
              getButtonStyle(), 
              { 
                backgroundColor: theme.colors.surface, 
                margin: 0, 
                padding: 0,
                shadowOpacity: 0,
                elevation: 0,
              }
            ]}>
              {loading ? (
                <ActivityIndicator color={theme.colors.primary} size="small" />
              ) : (
                <>
                  {icon && (
                    <View style={{ marginRight: designTokens.spacing.sm }}>
                      {icon}
                    </View>
                  )}
                  <LinearGradient
                    colors={theme.colors.gradients.primary}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ borderRadius: 4, paddingHorizontal: 4, paddingVertical: 2 }}
                  >
                    <Text style={[
                      getTextStyle(),
                      textStyle,
                      { color: theme.colors.text.onPrimary, backgroundColor: 'transparent' }
                    ]}>
                      {title}
                    </Text>
                  </LinearGradient>
                </>
              )}
            </View>
          </LinearGradient>
        )}

        {variant === 'accent' && (
          <AnimatedLinearGradient
            colors={theme.colors.gradients.accent}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[getButtonStyle()]}
          >
            {renderButtonContent()}
          </AnimatedLinearGradient>
        )}

        {(variant === 'outline' || variant === 'ghost' || variant === 'glass') && renderButtonContent()}
      </AnimatedTouchableOpacity>
    </View>
  );
};