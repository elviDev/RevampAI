import React from 'react';
import { View, Image, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';

interface LogoProps {
  size?: number;
  variant?: 'primary' | 'surface' | 'success' | 'custom';
  customBackgroundColor?: string;
  customBorderColor?: string;
  tintColor?: string;
  enableRotation?: boolean;
  rotationDuration?: number;
  style?: ViewStyle;
  imageSize?: number;
  borderWidth?: number;
  noBackground?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  noBackground = false,
  size = 180,
  variant = 'primary',
  customBackgroundColor,
  customBorderColor,
  tintColor,
  enableRotation = true,
  rotationDuration = 4000,
  style,
  imageSize,
  borderWidth = 0,
}) => {
  const { theme } = useTheme();
  const rotation = useSharedValue(0);

  React.useEffect(() => {
    if (enableRotation) {
      rotation.value = withRepeat(
        withTiming(360, {
          duration: rotationDuration,
          easing: Easing.linear,
        }),
        -1, // repeat infinitely
        false,
      );
    }
  }, [enableRotation, rotationDuration]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const calculatedImageSize = imageSize || size * 0.47;

  return (
    <View style={{}}>
      <Animated.View style={enableRotation ? animatedStyle : undefined}>
        <Image
          source={require('../../assets/icons/logo.png')}
          style={{
            width: calculatedImageSize,
            height: calculatedImageSize,
          }}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
};
