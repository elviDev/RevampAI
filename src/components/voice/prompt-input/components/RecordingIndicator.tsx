import React from 'react';
import { View, Text } from 'react-native';
import Animated, { useAnimatedStyle, interpolate } from 'react-native-reanimated';
import { useTheme } from '../../../../contexts/ThemeContext';
import { VoiceWaveform } from './VoiceWaveform';
import { RecordingState } from '../types';

interface RecordingIndicatorProps {
  recording: RecordingState;
  voiceResults: string[];
  recordingAnimation: Animated.SharedValue<number>;
  voiceWaveAnimation: Animated.SharedValue<number>;
  formatDuration: (seconds: number) => string;
}

export const RecordingIndicator: React.FC<RecordingIndicatorProps> = ({
  recording,
  voiceResults,
  recordingAnimation,
  voiceWaveAnimation,
  formatDuration,
}) => {
  const { theme } = useTheme();

  const recordingAnimatedStyle = useAnimatedStyle(() => {
    const pulseScale = interpolate(recordingAnimation.value, [0, 1], [1, 1.2]);
    const waveOpacity = interpolate(voiceWaveAnimation.value, [0, 1], [0.3, 1]);

    return {
      transform: [{ scale: pulseScale }],
      opacity: waveOpacity,
    };
  });

  return (
    <View style={{
      minHeight: 60,
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
      }}>
        <Animated.View style={[
          recordingAnimatedStyle,
          {
            width: 16,
            height: 16,
            backgroundColor: theme.colors.error,
            borderRadius: 8,
            marginRight: 12,
          }
        ]} />
        <Text style={{
          color: theme.colors.text.primary,
          fontWeight: '600',
          fontSize: 18,
        }}>
          Recording {formatDuration(recording.duration)}
          {recording.isPaused && ' (Paused)'}
        </Text>
      </View>
      
      <VoiceWaveform voiceWaveAnimation={voiceWaveAnimation} />
      
      {voiceResults.length > 0 && (
        <Text
          style={{
            color: theme.colors.primary,
            fontSize: 16,
            marginTop: 12,
            textAlign: 'center',
            paddingHorizontal: 16,
            fontStyle: 'italic',
          }}
          numberOfLines={3}
        >
          "{voiceResults[0]}"
        </Text>
      )}
    </View>
  );
};