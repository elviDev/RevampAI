import React from 'react';
import Animated, { useAnimatedStyle, interpolate } from 'react-native-reanimated';
import { View } from 'react-native';
import { useTheme } from '../../../../contexts/ThemeContext';
import { VOICE_WAVE_COUNT } from '../constants';

interface VoiceWaveformProps {
  voiceWaveAnimation: Animated.SharedValue<number>;
}

// Individual wave bar component to use hooks correctly
const WaveBar: React.FC<{
  index: number;
  voiceWaveAnimation: Animated.SharedValue<number>;
  color: string;
}> = ({ index, voiceWaveAnimation, color }) => {
  const animatedStyle = useAnimatedStyle(() => ({
    height: interpolate(
      voiceWaveAnimation.value + (index * 0.2),
      [0, 1],
      [8, 24]
    ),
  }));

  return (
    <Animated.View
      style={[
        {
          width: 4,
          backgroundColor: color,
          borderRadius: 2,
        },
        animatedStyle,
      ]}
    />
  );
};

export const VoiceWaveform: React.FC<VoiceWaveformProps> = ({
  voiceWaveAnimation,
}) => {
  const { theme } = useTheme();

  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
      marginVertical: 8,
    }}>
      {[...Array(VOICE_WAVE_COUNT)].map((_, i) => (
        <WaveBar
          key={i}
          index={i}
          voiceWaveAnimation={voiceWaveAnimation}
          color={theme.colors.primary}
        />
      ))}
    </View>
  );
};