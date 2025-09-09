import { useState, useCallback, useEffect } from 'react';
import Voice from '@react-native-voice/voice';
import { VoiceService } from '../services/api/voiceService';
import { permissionService } from '../services/permissionService';
import { Alert } from 'react-native';

export const useVoice = () => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Voice.onSpeechStart = () => setIsListening(true);
    Voice.onSpeechEnd = () => setIsListening(false);
    Voice.onSpeechError = (e: any) => {
      setError('Speech recognition error: ' + e.error?.message);
      setIsListening(false);
    };
    Voice.onSpeechResults = (e: any) => {
      if (e.value && e.value.length > 0) {
        setTranscript(e.value[0]);
      }
    };
    Voice.onSpeechPartialResults = (e: any) => {
      if (e.value && e.value.length > 0) {
        setTranscript(e.value[0]);
      }
    };

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const requestMicrophonePermission = async () => {
    const hasPermission = await permissionService.ensureVoicePermissions();
    if (!hasPermission) {
      Alert.alert(
        'Permission Required',
        'Microphone access is required for voice commands. Please enable it in settings.',
        [{ text: 'OK' }]
      );
    }
    return hasPermission;
  };

  const startListening = useCallback(async () => {
    try {
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        setError('Microphone permission denied');
        return;
      }

      setError(null);
      setTranscript('');
      
      await Voice.start('en-US');
    } catch (err) {
      setError('Failed to start voice recognition');
      setIsListening(false);
      console.error('Voice start error:', err);
    }
  }, []);

  const stopListening = useCallback(async () => {
    try {
      await Voice.stop();
      setIsListening(false);
    } catch (err) {
      console.error('Voice stop error:', err);
      setIsListening(false);
    }
  }, []);

  const processCommand = useCallback(async (command: string) => {
    try {
      setIsProcessing(true);
      setError(null);
      
      const result = await VoiceService.processVoiceCommand(command);
      
      return result;
    } catch (err) {
      setError('Failed to process voice command');
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const clearTranscript = useCallback(() => {
    setTranscript('');
    setError(null);
  }, []);

  return {
    isListening,
    isProcessing,
    transcript,
    error,
    startListening,
    stopListening,
    processCommand,
    clearTranscript,
  };
}