import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import EnhancedVoiceService, { VoiceResult, VoiceConfig } from '../services/voice/EnhancedVoiceService';

export interface VoiceState {
  isInitialized: boolean;
  isListening: boolean;
  isProcessing: boolean;
  voiceAvailable: boolean;
  currentTranscript: string;
  confidence: number;
  error: string | null;
  isOnline: boolean;
  stats: {
    totalCommands: number;
    successfulCommands: number;
    averageConfidence: number;
    sessionDuration: number;
  };
}

export type VoiceAction =
  | { type: 'INITIALIZE'; payload: { voiceAvailable: boolean } }
  | { type: 'START_LISTENING' }
  | { type: 'STOP_LISTENING' }
  | { type: 'SET_LISTENING'; payload: boolean }
  | { type: 'SET_PROCESSING'; payload: boolean }
  | { type: 'RECEIVE_RESULT'; payload: VoiceResult }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_ONLINE'; payload: boolean }
  | { type: 'UPDATE_STATS'; payload: Partial<VoiceState['stats']> }
  | { type: 'RESET' };

const initialState: VoiceState = {
  isInitialized: false,
  isListening: false,
  isProcessing: false,
  voiceAvailable: false,
  currentTranscript: '',
  confidence: 0,
  error: null,
  isOnline: true,
  stats: {
    totalCommands: 0,
    successfulCommands: 0,
    averageConfidence: 0,
    sessionDuration: 0,
  },
};

function voiceReducer(state: VoiceState, action: VoiceAction): VoiceState {
  switch (action.type) {
    case 'INITIALIZE':
      return {
        ...state,
        isInitialized: true,
        voiceAvailable: action.payload.voiceAvailable,
        error: null,
      };

    case 'START_LISTENING':
      return {
        ...state,
        isListening: true,
        error: null,
        currentTranscript: '',
        confidence: 0,
      };

    case 'STOP_LISTENING':
      return {
        ...state,
        isListening: false,
        isProcessing: false,
      };

    case 'SET_LISTENING':
      return {
        ...state,
        isListening: action.payload,
        isProcessing: action.payload,
      };

    case 'SET_PROCESSING':
      return {
        ...state,
        isProcessing: action.payload,
      };

    case 'RECEIVE_RESULT':
      const { transcript, confidence, isFinal } = action.payload;
      const newStats = {
        ...state.stats,
        totalCommands: isFinal ? state.stats.totalCommands + 1 : state.stats.totalCommands,
        successfulCommands: 
          isFinal && transcript 
            ? state.stats.successfulCommands + 1 
            : state.stats.successfulCommands,
        averageConfidence: isFinal && transcript
          ? (state.stats.averageConfidence * state.stats.totalCommands + confidence) / (state.stats.totalCommands + 1)
          : state.stats.averageConfidence,
      };

      return {
        ...state,
        currentTranscript: transcript,
        confidence,
        isProcessing: !isFinal,
        error: null,
        stats: newStats,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isListening: false,
        isProcessing: false,
      };

    case 'SET_ONLINE':
      return {
        ...state,
        isOnline: action.payload,
      };

    case 'UPDATE_STATS':
      return {
        ...state,
        stats: { ...state.stats, ...action.payload },
      };

    case 'RESET':
      return {
        ...initialState,
        isInitialized: state.isInitialized,
        voiceAvailable: state.voiceAvailable,
        isOnline: state.isOnline,
      };

    default:
      return state;
  }
}

interface VoiceContextValue {
  state: VoiceState;
  startListening: (config?: Partial<VoiceConfig>) => Promise<boolean>;
  stopListening: () => Promise<void>;
  reset: () => void;
  updateConfig: (config: Partial<VoiceConfig>) => void;
  getServiceStats: () => any;
}

const VoiceContext = createContext<VoiceContextValue | undefined>(undefined);

export const useVoice = () => {
  const context = useContext(VoiceContext);
  if (context === undefined) {
    throw new Error('useVoice must be used within a VoiceProvider');
  }
  return context;
};

interface VoiceProviderProps {
  children: React.ReactNode;
  config?: Partial<VoiceConfig>;
  onTranscript?: (transcript: string, confidence: number) => void;
  onError?: (error: string) => void;
}

export const VoiceProvider: React.FC<VoiceProviderProps> = ({
  children,
  config = {},
  onTranscript,
  onError,
}) => {
  const [state, dispatch] = useReducer(voiceReducer, initialState);
  const serviceRef = useRef<EnhancedVoiceService | null>(null);
  const sessionStartRef = useRef<number | undefined>(undefined);
  const currentConfigRef = useRef<Partial<VoiceConfig>>(config);

  // Initialize service
  useEffect(() => {
    const initializeService = async () => {
      try {
        console.log('🚀 Initializing Voice service...');
        const service = EnhancedVoiceService.getInstance();
        serviceRef.current = service;
        const voiceAvailable = await service.initialize();
        
        console.log('🎤 Voice service initialized:', { voiceAvailable });
        dispatch({ type: 'INITIALIZE', payload: { voiceAvailable } });
        
        sessionStartRef.current = Date.now();
        console.log('✅ Voice service ready for use');
      } catch (error) {
        console.error('❌ Voice service initialization failed:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to initialize voice service' });
      }
    };

    initializeService();

    // Cleanup on unmount
    return () => {
      console.log('🧹 VoiceContext cleanup (this should only happen on unmount)...');
      if (serviceRef.current) {
        serviceRef.current.cleanup();
      }
    };
  }, []);

  // Update session duration
  useEffect(() => {
    const interval = setInterval(() => {
      if (sessionStartRef.current) {
        const sessionDuration = Date.now() - sessionStartRef.current;
        dispatch({ 
          type: 'UPDATE_STATS', 
          payload: { sessionDuration } 
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleListeningChange = useCallback((listening: boolean) => {
    dispatch({ type: 'SET_LISTENING', payload: listening });
  }, []);

  const handleResults = useCallback((result: VoiceResult) => {
    console.log('📝 Voice result received:', result);
    dispatch({ type: 'RECEIVE_RESULT', payload: result });
    
    if (result.isFinal && result.transcript && onTranscript) {
      console.log('✅ Final transcript ready:', result.transcript, `(${Math.round(result.confidence * 100)}%)`);
      onTranscript(result.transcript, result.confidence);
    }
  }, [onTranscript]);

  const startListening = useCallback(async (overrideConfig?: Partial<VoiceConfig>): Promise<boolean> => {
    if (!serviceRef.current) {
      const errorMsg = 'Voice service not initialized';
      console.error('❌', errorMsg);
      dispatch({ type: 'SET_ERROR', payload: errorMsg });
      return false;
    }

    try {
      console.log('🎤 Starting voice listening...', overrideConfig);
      dispatch({ type: 'START_LISTENING' });
      
      const finalConfig = { ...currentConfigRef.current, ...overrideConfig };
      console.log('⚙️ Final voice config:', finalConfig);
      
      // Create event handlers
      const handlers = serviceRef.current.createEventHandlers(
        handleListeningChange,
        handleResults,
        finalConfig
      );

      // Set up voice event listeners
      const Voice = await import('../services/voice/CustomVoice');
      Voice.default.onSpeechStart = handlers.onSpeechStart;
      Voice.default.onSpeechEnd = handlers.onSpeechEnd;
      Voice.default.onSpeechError = handlers.onSpeechError;
      Voice.default.onSpeechResults = handlers.onSpeechResults;
      Voice.default.onSpeechPartialResults = handlers.onSpeechPartialResults;

      console.log('🔊 Voice event listeners set up');
      const success = await serviceRef.current.startListening(finalConfig);
      
      console.log('🎤 Voice listening start result:', success);
      
      if (!success) {
        dispatch({ type: 'STOP_LISTENING' });
        return false;
      }

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Voice listening error:', errorMessage);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      onError?.(errorMessage);
      return false;
    }
  }, [handleListeningChange, handleResults, onError]);

  const stopListening = useCallback(async (): Promise<void> => {
    if (!serviceRef.current) return;

    try {
      await serviceRef.current.stopListening();
      dispatch({ type: 'STOP_LISTENING' });
    } catch (error) {
      console.warn('❌ Error stopping voice recognition:', error);
    }
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
    sessionStartRef.current = Date.now();
  }, []);

  const updateConfig = useCallback((newConfig: Partial<VoiceConfig>) => {
    currentConfigRef.current = { ...currentConfigRef.current, ...newConfig };
  }, []);

  const getServiceStats = useCallback(() => {
    return serviceRef.current?.getStats() || {};
  }, []);

  const contextValue: VoiceContextValue = {
    state,
    startListening,
    stopListening,
    reset,
    updateConfig,
    getServiceStats,
  };

  return (
    <VoiceContext.Provider value={contextValue}>
      {children}
    </VoiceContext.Provider>
  );
};

// Custom hook for simplified voice-to-text usage
export const useVoiceToText = (
  config: Partial<VoiceConfig> = {},
  onTranscript?: (transcript: string, confidence: number) => void
) => {
  const {
    state: { isListening, currentTranscript, confidence, voiceAvailable, error, isProcessing },
    startListening,
    stopListening,
  } = useVoice();

  const [isActive, setIsActive] = React.useState(false);

  const start = useCallback(async () => {
    setIsActive(true);
    const success = await startListening(config);
    if (!success) {
      setIsActive(false);
    }
    return success;
  }, [startListening, config]);

  const stop = useCallback(async () => {
    await stopListening();
    setIsActive(false);
    
    if (currentTranscript && onTranscript) {
      onTranscript(currentTranscript, confidence);
    }
  }, [stopListening, currentTranscript, confidence, onTranscript]);

  const toggle = useCallback(async () => {
    if (isActive || isListening) {
      await stop();
    } else {
      await start();
    }
  }, [isActive, isListening, start, stop]);

  return {
    isListening: isListening || isActive,
    isProcessing,
    currentTranscript,
    confidence,
    voiceAvailable,
    error,
    start,
    stop,
    toggle,
  };
};