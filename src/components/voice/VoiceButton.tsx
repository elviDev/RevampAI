import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { Colors } from '../../utils/colors';

interface VoiceButtonProps {
  isListening: boolean;
  onPress: () => void;
  size?: number;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export const VoiceButton: React.FC<VoiceButtonProps> = ({
  isListening,
  onPress,
  size = 80,
}) => {
  const scale = useSharedValue(1);
  const pulseAnimation = useSharedValue(0);

  React.useEffect(() => {
    if (isListening) {
      pulseAnimation.value = withRepeat(
        withTiming(1, { duration: 1000 }),
        -1,
        true
      );
    } else {
      pulseAnimation.value = withTiming(0);
    }
  }, [isListening]);

  const animatedStyle = useAnimatedStyle(() => {
    const pulseScale = interpolate(pulseAnimation.value, [0, 1], [1, 1.2]);
    
    return {
      transform: [{ scale: scale.value * pulseScale }],
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.9);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <AnimatedTouchableOpacity
      style={[
        animatedStyle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: Colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: Colors.primary,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 16,
          elevation: 12,
        },
      ]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.8}
    >
      <View
        style={{
          width: size * 0.4,
          height: size * 0.4,
          borderRadius: (size * 0.4) / 2,
          backgroundColor: Colors.text.inverse,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
        }}
      />
      {isListening && (
        <View
          style={{
            position: 'absolute',
            width: size * 1.5,
            height: size * 1.5,
            borderRadius: (size * 1.5) / 2,
            borderWidth: 2,
            borderColor: Colors.primary,
            opacity: 0.3,
          }}
        />
      )}
    </AnimatedTouchableOpacity>
  );
};
