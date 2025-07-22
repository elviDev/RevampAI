import React from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { Colors } from '../../utils/colors';
export const VoiceWave: React.FC<{ delay: number }> = ({ delay }) => {
  const height = useSharedValue(4);

  React.useEffect(() => {
    height.value = withRepeat(
      withTiming(20, { duration: 600 }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    height: height.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width: 3,
          backgroundColor: Colors.primary,
          marginHorizontal: 1,
          borderRadius: 1.5,
        },
        animatedStyle,
      ]}
    />
  );
};