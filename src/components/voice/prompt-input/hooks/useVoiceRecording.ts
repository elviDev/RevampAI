import { useState, useRef, useEffect } from 'react';
import { Alert, Platform, PermissionsAndroid } from 'react-native';
import Voice from '../../../../services/voice/CustomVoice';
import CustomAudioRecorderPlayer from '../../../../services/audio/CustomAudioRecorderPlayer';
import { openAIService } from '../../../../services/ai/OpenAIService';
import { showVoiceErrorDialog } from '../../../../utils/voiceErrorHandler';
import RNFS from 'react-native-fs';
import { RecordingState } from '../types';

export const useVoiceRecording = (
  onSendRecording?: (audioUri: string, transcript?: string) => void
) => {
  const [recording, setRecording] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    audioPath: '',
  });
  const [voiceResults, setVoiceResults] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [voiceAvailable, setVoiceAvailable] = useState(false);

  const audioRecorderPlayer = useRef(new CustomAudioRecorderPlayer()).current;
  const recordingTimer = useRef<NodeJS.Timeout | null>(null);

  // Voice event handlers
  const onSpeechStart = () => {
    console.log('🎤 Speech recognition started');
    setIsListening(true);
  };

  const onSpeechEnd = () => {
    console.log('🛑 Speech recognition ended');
    setIsListening(false);
  };

  const onSpeechError = (error: any) => {
    console.log('❌ Voice error received:', error);
    setIsListening(false);
    showVoiceErrorDialog(error);
  };

  const onSpeechResults = (event: any) => {
    console.log('📝 Speech results received:', event.value);
    setVoiceResults(event.value);
  };

  const onSpeechPartialResults = (event: any) => {
    setVoiceResults(event.value);
  };

  // Initialize voice recognition
  useEffect(() => {
    const initializeVoice = async () => {
      try {
        Voice.onSpeechStart = onSpeechStart;
        Voice.onSpeechEnd = onSpeechEnd;
        Voice.onSpeechError = onSpeechError;
        Voice.onSpeechResults = onSpeechResults;
        Voice.onSpeechPartialResults = onSpeechPartialResults;

        const available = await Voice.isAvailable();
        setVoiceAvailable(available);
        console.log('Voice available:', available);
      } catch (error) {
        console.error('Voice initialization error:', error);
        setVoiceAvailable(false);
      }
    };

    initializeVoice();

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const requestAudioPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Audio Recording Permission',
            message: 'Javier needs microphone access for voice commands.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const startRecording = async (onAnimationStart?: () => void) => {
    const hasPermission = await requestAudioPermission();
    if (!hasPermission) {
      Alert.alert(
        'Permission required',
        'Please grant microphone permission for voice commands.',
      );
      return;
    }

    try {
      const audioPath = `${RNFS.DocumentDirectoryPath}/audio_${Date.now()}.m4a`;

      await audioRecorderPlayer.startRecorder(audioPath);

      setRecording({
        isRecording: true,
        isPaused: false,
        duration: 0,
        audioPath,
      });

      recordingTimer.current = setInterval(() => {
        setRecording(prev => ({ ...prev, duration: prev.duration + 1 }));
      }, 1000);

      // Start animations
      onAnimationStart?.();

      try {
        if (Voice.isModuleAvailable()) {
          console.log('🎤 Starting voice recognition...');
          await Voice.start('en-US');
          console.log('✅ Voice recognition started successfully');
        }
      } catch (voiceError: any) {
        console.warn('❌ Voice recognition failed to start:', voiceError);
        Alert.alert(
          'Voice Recognition',
          'Voice recognition unavailable, but audio recording continues.',
          [{ text: 'OK' }],
        );
      }
    } catch (error) {
      console.error('Start recording error:', error);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async (onAnimationStop?: () => void) => {
    try {
      const result = await audioRecorderPlayer.stopRecorder();

      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }

      try {
        if (Voice.isModuleAvailable()) {
          console.log('🛑 Stopping voice recognition...');
          await Voice.stop();
          console.log('✅ Voice recognition stopped successfully');
        }
      } catch (voiceError: any) {
        console.warn('❌ Voice recognition failed to stop:', voiceError);
      }

      // Stop animations
      onAnimationStop?.();

      const rawTranscript = voiceResults.length > 0 ? voiceResults[0] : '';
      console.log('📝 Raw transcript:', rawTranscript);

      let finalTranscript = rawTranscript;

      if (rawTranscript.trim()) {
        try {
          console.log('🔄 Correcting transcription with OpenAI...');
          finalTranscript = await openAIService.correctTranscription(rawTranscript);
          console.log('✅ Transcription corrected:', finalTranscript);
        } catch (error) {
          console.warn('⚠️ Transcription correction failed, using original:', error);
          finalTranscript = rawTranscript;
        }
      }

      setRecording({
        isRecording: false,
        isPaused: false,
        duration: 0,
        audioPath: '',
      });
      setVoiceResults([]);

      if (onSendRecording) {
        onSendRecording(result, finalTranscript);
      }

      console.log('🎬 Recording completed and sent');
    } catch (error) {
      console.error('Stop recording error:', error);
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    recording,
    voiceResults,
    isListening,
    voiceAvailable,
    startRecording,
    stopRecording,
    formatDuration,
  };
};