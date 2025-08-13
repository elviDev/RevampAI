import { useState, useEffect, useCallback, useRef } from 'react';
import EnhancedVoiceService, { VoiceConfig, VoiceResult } from '../services/voice/EnhancedVoiceService';
import VoiceActivityDetector from './voiceActivityDetection';

export interface VoiceRecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioPath: string;
}

export interface VoiceUtilsConfig {
  onSendRecording?: (audioUri: string, transcript?: string) => void;
  onTranscriptionReceived?: (transcript: string, confidence: number) => void;
  locale?: string;
  confidenceThreshold?: number;
  enableVAD?: boolean;
  vadConfig?: {
    silenceThreshold: number;
    speechThreshold: number;
    minSpeechDuration: number;
    maxSilenceDuration: number;
  };
}

// Legacy interface for backward compatibility
export interface VoiceLegacyConfig {
  onTranscriptionReceived?: (transcript: string) => void;
  locale?: string;
}

// Enhanced Voice Activity Detection Hook
export const useVoiceActivityDetection = (config: VoiceUtilsConfig = {}) => {
  const [vad] = useState(() => new VoiceActivityDetector(config.vadConfig));
  const [activity, setActivity] = useState({
    isSpeaking: false,
    audioLevel: -60,
    speechDuration: 0,
    silenceDuration: 0,
    confidence: 0,
  });
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const removeListener = vad.addListener(setActivity);
    return () => {
      removeListener();
      vad.stop();
    };
  }, [vad]);

  const start = useCallback(async () => {
    const success = await vad.start();
    setIsActive(success);
    return success;
  }, [vad]);

  const stop = useCallback(() => {
    vad.stop();
    setIsActive(false);
  }, [vad]);

  return {
    activity,
    isActive,
    start,
    stop,
    detector: vad,
  };
};

// Enhanced voice initialization using new service
export const initializeEnhancedVoiceRecognition = async (): Promise<boolean> => {
  try {
    const service = EnhancedVoiceService.getInstance();
    const available = await service.initialize();
    console.log('🎤 Enhanced voice service initialized:', available);
    return available;
  } catch (error) {
    console.error('❌ Enhanced voice initialization error:', error);
    return false;
  }
};

// Enhanced permission handling
export const requestEnhancedAudioPermission = async (): Promise<boolean> => {
  try {
    const service = EnhancedVoiceService.getInstance();
    return await service.requestPermissions();
  } catch (error) {
    console.error('❌ Permission request failed:', error);
    return false;
  }
};

// Enhanced voice recognition with improved error handling
export const startEnhancedVoiceRecognition = async (config: Partial<VoiceConfig> = {}): Promise<boolean> => {
  try {
    const service = EnhancedVoiceService.getInstance();
    return await service.startListening(config);
  } catch (error) {
    console.error('❌ Enhanced voice recognition failed to start:', error);
    return false;
  }
};

// Enhanced voice recognition stop
export const stopEnhancedVoiceRecognition = async (): Promise<void> => {
  try {
    const service = EnhancedVoiceService.getInstance();
    await service.stopListening();
  } catch (error) {
    console.error('❌ Enhanced voice recognition failed to stop:', error);
  }
};

// Enhanced transcription processing (now handled by EnhancedVoiceService)
export const processEnhancedTranscription = async (
  results: string[],
  config: Partial<VoiceConfig> = {}
): Promise<VoiceResult> => {
  try {
    const service = EnhancedVoiceService.getInstance();
    return await service.processVoiceResult(results, config);
  } catch (error) {
    console.error('❌ Enhanced transcription processing failed:', error);
    return {
      transcript: results[0] || '',
      confidence: 0,
      isFinal: true,
    };
  }
};

// Format duration utility
export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Enhanced resource cleanup
export const cleanupEnhancedVoiceResources = async (): Promise<void> => {
  try {
    const service = EnhancedVoiceService.getInstance();
    await service.cleanup();
  } catch (error) {
    console.warn('❌ Enhanced voice cleanup error:', error);
  }
};

// Enhanced Voice-to-Text hook with all improvements
export const useEnhancedVoiceToText = (config: VoiceUtilsConfig = {}) => {
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voiceAvailable, setVoiceAvailable] = useState(false);
  
  const serviceRef = useRef<EnhancedVoiceService | null>(null);
  const vadRef = useRef<VoiceActivityDetector | null>(null);

  // Initialize enhanced service
  useEffect(() => {
    const init = async () => {
      const service = EnhancedVoiceService.getInstance();
      serviceRef.current = service;
      const available = await service.initialize();
      setVoiceAvailable(available);

      if (config.enableVAD && available) {
        vadRef.current = new VoiceActivityDetector(config.vadConfig);
      }
    };

    init();

    return () => {
      console.log('🧹 useEnhancedVoiceToText cleanup...');
      if (serviceRef.current) {
        serviceRef.current.cleanup();
      }
      if (vadRef.current) {
        vadRef.current.stop();
      }
    };
  }, []); // Remove dependencies that cause infinite re-renders
  
  // Handle VAD initialization separately
  useEffect(() => {
    if (config.enableVAD && voiceAvailable && !vadRef.current) {
      console.log('🔊 Initializing VAD...');
      vadRef.current = new VoiceActivityDetector(config.vadConfig);
    }
    
    if (!config.enableVAD && vadRef.current) {
      console.log('🔇 Disabling VAD...');
      vadRef.current.stop();
      vadRef.current = null;
    }
  }, [config.enableVAD, voiceAvailable]);

  const handleResults = useCallback((result: VoiceResult) => {
    setCurrentTranscript(result.transcript);
    setConfidence(result.confidence);
    setIsProcessing(!result.isFinal);
    setError(null);

    if (result.isFinal && result.transcript && config.onTranscriptionReceived) {
      config.onTranscriptionReceived(result.transcript, result.confidence);
    }
  }, [config.onTranscriptionReceived]);

  const startListening = useCallback(async (): Promise<boolean> => {
    if (!serviceRef.current) {
      setError('Voice service not initialized');
      return false;
    }

    try {
      setError(null);
      setCurrentTranscript('');
      setConfidence(0);
      
      // Start VAD if enabled
      if (vadRef.current && config.enableVAD) {
        await vadRef.current.start();
      }

      const handlers = serviceRef.current.createEventHandlers(
        setIsListening,
        handleResults,
        {
          locale: config.locale || 'en-US',
          confidenceThreshold: config.confidenceThreshold || 0.7,
        }
      );

      // Setup voice event listeners
      const Voice = await import('../services/voice/CustomVoice');
      Voice.default.onSpeechStart = handlers.onSpeechStart;
      Voice.default.onSpeechEnd = handlers.onSpeechEnd;
      Voice.default.onSpeechError = handlers.onSpeechError;
      Voice.default.onSpeechResults = handlers.onSpeechResults;
      Voice.default.onSpeechPartialResults = handlers.onSpeechPartialResults;

      const success = await serviceRef.current.startListening({
        locale: config.locale || 'en-US',
        confidenceThreshold: config.confidenceThreshold || 0.7,
      });
      
      if (!success) {
        setError('Failed to start voice recognition');
      }
      
      return success;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      return false;
    }
  }, [config.locale, config.confidenceThreshold, config.enableVAD, handleResults]);

  const stopListening = useCallback(async (): Promise<string> => {
    try {
      if (vadRef.current) {
        vadRef.current.stop();
      }
      
      if (serviceRef.current) {
        await serviceRef.current.stopListening();
      }
      
      setIsListening(false);
      setIsProcessing(false);
      
      return currentTranscript;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      return currentTranscript;
    }
  }, [currentTranscript]);

  const toggle = useCallback(async () => {
    if (isListening) {
      return await stopListening();
    } else {
      const success = await startListening();
      return success ? '' : currentTranscript;
    }
  }, [isListening, startListening, stopListening, currentTranscript]);

  return {
    currentTranscript,
    confidence,
    isListening,
    isProcessing,
    error,
    voiceAvailable,
    startListening,
    stopListening,
    toggle,
  };
};

// Legacy hook for backward compatibility
export const useVoiceToText = (config: VoiceLegacyConfig = {}) => {
  const enhancedConfig: VoiceUtilsConfig = {
    ...config,
    onTranscriptionReceived: config.onTranscriptionReceived 
      ? (transcript: string) => config.onTranscriptionReceived!(transcript)
      : undefined,
  };
  
  const enhanced = useEnhancedVoiceToText(enhancedConfig);
  
  return {
    voiceResults: enhanced.currentTranscript ? [enhanced.currentTranscript] : [],
    isListening: enhanced.isListening,
    voiceAvailable: enhanced.voiceAvailable,
    startListening: enhanced.startListening,
    stopListening: enhanced.stopListening,
    currentTranscript: enhanced.currentTranscript,
  };
};