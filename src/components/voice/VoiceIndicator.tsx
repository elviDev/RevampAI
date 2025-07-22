import React from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { Colors } from '../../utils/colors';
import { VoiceWave } from './VoiceWaveform';

interface VoiceIndicatorProps {
  isListening: boolean;
  transcript?: string;
}

export const VoiceIndicator: React.FC<VoiceIndicatorProps> = ({
  isListening,
  transcript,
}) => {
  const animation = useSharedValue(0);

  React.useEffect(() => {
    if (isListening) {
      animation.value = withRepeat(
        withTiming(1, { duration: 800 }),
        -1,
        true
      );
    } else {
      animation.value = withTiming(0);
    }
  }, [isListening]);

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(animation.value, [0, 1], [0.3, 1]);
    return { opacity };
  });

  if (!isListening && !transcript) return null;

  return (
    <View
      style={{
        alignItems: 'center',
        marginVertical: 20,
        paddingHorizontal: 20,
      }}
    >
      {isListening && (
        <Animated.View style={[animatedStyle]}>
          <Text
            style={{
              fontSize: 14,
              color: Colors.primary,
              fontWeight: '600',
              marginBottom: 8,
            }}
          >
            Listening...
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {[1, 2, 3, 4, 5].map((i) => (
              <VoiceWave key={i} delay={i * 100} />
            ))}
          </View>
        </Animated.View>
      )}
      {transcript && (
        <View
          style={{
            backgroundColor: Colors.surface,
            padding: 16,
            borderRadius: 12,
            marginTop: 8,
            borderWidth: 1,
            borderColor: Colors.gray[200],
          }}
        >
          <Text
            style={{
              fontSize: 14,
              color: Colors.text.secondary,
              textAlign: 'center',
            }}
          >
            "{transcript}"
          </Text>
        </View>
      )}
    </View>
  );
};