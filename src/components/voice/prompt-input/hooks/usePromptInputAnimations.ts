import { useEffect } from 'react';
import {
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { ANIMATION_DURATIONS } from '../constants';
import { AnimationValues } from '../types';

export const usePromptInputAnimations = (): AnimationValues => {
  const recordingScale = useSharedValue(1);
  const recordingOpacity = useSharedValue(0);
  const pulseAnimation = useSharedValue(0);
  const sendButtonScale = useSharedValue(1);
  const focusAnimation = useSharedValue(0);
  const borderGlow = useSharedValue(0);
  const voiceWaveAnimation = useSharedValue(0);
  const sparkleAnimation = useSharedValue(0);
  const buttonHover = useSharedValue(0);

  useEffect(() => {
    // Subtle sparkle animation
    sparkleAnimation.value = withRepeat(
      withSequence(
        withTiming(1, { duration: ANIMATION_DURATIONS.SPARKLE_CYCLE, easing: Easing.bezier(0.4, 0, 0.6, 1) }),
        withTiming(0, { duration: ANIMATION_DURATIONS.SPARKLE_CYCLE, easing: Easing.bezier(0.4, 0, 0.6, 1) })
      ),
      -1,
      false
    );
  }, [sparkleAnimation]);

  const startRecordingAnimations = () => {
    recordingScale.value = withSpring(1.1, { damping: 10 });
    recordingOpacity.value = withTiming(1, { duration: ANIMATION_DURATIONS.FOCUS });
    pulseAnimation.value = withRepeat(
      withTiming(1, { duration: ANIMATION_DURATIONS.PULSE }),
      -1,
      true,
    );
    voiceWaveAnimation.value = withRepeat(
      withSequence(
        withTiming(1, { duration: ANIMATION_DURATIONS.VOICE_WAVE }),
        withTiming(0, { duration: ANIMATION_DURATIONS.VOICE_WAVE })
      ),
      -1,
      false
    );
    borderGlow.value = withTiming(1, { duration: ANIMATION_DURATIONS.RECORDING_TRANSITION });
  };

  const stopRecordingAnimations = () => {
    recordingScale.value = withSpring(1);
    recordingOpacity.value = withTiming(0);
    pulseAnimation.value = withTiming(0);
    voiceWaveAnimation.value = withTiming(0);
  };

  const animateFocus = () => {
    focusAnimation.value = withTiming(1, { duration: ANIMATION_DURATIONS.FOCUS });
    borderGlow.value = withTiming(0.7, { duration: ANIMATION_DURATIONS.FOCUS });
  };

  const animateBlur = (isRecording: boolean) => {
    focusAnimation.value = withTiming(0, { duration: ANIMATION_DURATIONS.FOCUS });
    if (!isRecording) {
      borderGlow.value = withTiming(0, { duration: ANIMATION_DURATIONS.FOCUS });
    }
  };

  const animateSendButton = () => {
    sendButtonScale.value = withSequence(
      withTiming(1.2, { duration: ANIMATION_DURATIONS.BUTTON_PRESS }),
      withTiming(1, { duration: ANIMATION_DURATIONS.BUTTON_PRESS })
    );
  };

  return {
    recordingScale,
    recordingOpacity,
    pulseAnimation,
    sendButtonScale,
    focusAnimation,
    borderGlow,
    voiceWaveAnimation,
    sparkleAnimation,
    buttonHover,
    startRecordingAnimations,
    stopRecordingAnimations,
    animateFocus,
    animateBlur,
    animateSendButton,
  } as AnimationValues & {
    startRecordingAnimations: () => void;
    stopRecordingAnimations: () => void;
    animateFocus: () => void;
    animateBlur: (isRecording: boolean) => void;
    animateSendButton: () => void;
  };
};