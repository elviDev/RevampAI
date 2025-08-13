import React, { useState } from 'react';
import { Text, TouchableOpacity, View, ScrollView } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, withSequence, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../contexts/ThemeContext';
import { useEnhancedVoiceToText, useVoiceActivityDetection } from '../../utils/voiceUtils';
import { useVoice as useVoiceContext } from '../../contexts/VoiceContext';

interface VoiceCommandCTAProps {
  promptOpacity: Animated.SharedValue<number>;
  onPress?: () => void;
  onVoiceTranscript?: (transcript: string, confidence: number) => void;
  title?: string;
  subtitle?: string;
  iconName?: string;
  iconSize?: number;
  enableVoiceToText?: boolean;
  enableVAD?: boolean;
  confidenceThreshold?: number;
  showConfidence?: boolean;
  showRealTimeTranscript?: boolean;
}

export const VoiceCommandCTA: React.FC<VoiceCommandCTAProps> = ({
  promptOpacity,
  onPress,
  onVoiceTranscript,
  title = "Try Voice Commands",
  subtitle = "Speak naturally and let Javier handle the complexity",
  iconName = "microphone",
  iconSize = 48,
  enableVoiceToText = false,
  enableVAD = true,
  confidenceThreshold = 0.7,
  showConfidence = false,
  showRealTimeTranscript = true,
}) => {
  const { theme } = useTheme();
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const pulseScale = useSharedValue(1);
  const recDotOpacity = useSharedValue(1);
  const scrollViewRef = React.useRef<ScrollView>(null);

  // Use VoiceContext for centralized state management (with fallback)
  let voiceContext;
  try {
    voiceContext = useVoiceContext();
  } catch (error) {
    console.warn('⚠️ VoiceProvider not found, using fallback voice system');
    voiceContext = null;
  }
  
  const {
    state: { 
      isListening: contextIsListening = false, 
      currentTranscript: contextTranscript = '', 
      confidence: contextConfidence = 0, 
      voiceAvailable: contextVoiceAvailable = false, 
      error: contextError = null, 
      isProcessing: contextIsProcessing = false 
    } = {},
    startListening: contextStartListening,
    stopListening: contextStopListening,
  } = voiceContext || {};
  
  const isListening = contextIsListening;
  const currentTranscript = contextTranscript;
  const confidence = contextConfidence;
  const voiceAvailable = contextVoiceAvailable;
  const error = contextError;
  const isProcessing = contextIsProcessing;
  const startListening = contextStartListening;
  const stopListening = contextStopListening;

  // Stable config for useEnhancedVoiceToText to prevent infinite re-renders
  const stableVadConfig = React.useMemo(() => ({
    silenceThreshold: -40,
    speechThreshold: -25,
    minSpeechDuration: 500,
    maxSilenceDuration: 2000,
  }), []);
  
  const stableVoiceConfig = React.useMemo(() => ({
    onTranscriptionReceived: (transcript: string, confidence: number) => {
      if (onVoiceTranscript) {
        onVoiceTranscript(transcript, confidence);
      }
      setIsVoiceMode(false);
      
      // Stop pulse animation
      pulseScale.value = withSpring(1);
    },
    confidenceThreshold,
    enableVAD,
    vadConfig: stableVadConfig,
  }), [onVoiceTranscript, confidenceThreshold, enableVAD, stableVadConfig, pulseScale]);

  // Enhanced voice-to-text with all improvements (fallback) - DISABLED to prevent conflicts
  // const voiceToText = useEnhancedVoiceToText(stableVoiceConfig);
  const voiceToText = {
    isListening: false,
    isProcessing: false,
    currentTranscript: '',
    confidence: 0,
    voiceAvailable: false,
    error: null,
    startListening: async () => false,
    stopListening: async () => '',
  };

  // Handle transcript changes from VoiceContext
  React.useEffect(() => {
    if (currentTranscript && onVoiceTranscript && confidence > 0) {
      onVoiceTranscript(currentTranscript, confidence);
    }
  }, [currentTranscript, confidence, onVoiceTranscript]);

  // Voice Activity Detection for visual feedback (with stable config)
  const stableVadDetectionConfig = React.useMemo(() => ({
    enableVAD,
    vadConfig: stableVadConfig,
  }), [enableVAD, stableVadConfig]);
  
  // const vad = useVoiceActivityDetection(stableVadDetectionConfig); // DISABLED to prevent conflicts
  const vad = {
    activity: {
      isSpeaking: false,
      audioLevel: -60,
      speechDuration: 0,
      silenceDuration: 0,
      confidence: 0,
    },
    isActive: false,
    start: async () => false,
    stop: () => {},
  };

  // Start pulse animation when listening - more prominent pulsing
  React.useEffect(() => {
    if (isListening || voiceToText.isListening) {
      // Continuous pulsing animation while recording
      const startPulsing = () => {
        pulseScale.value = withSequence(
          withSpring(1.2, { duration: 400 }),
          withSpring(0.9, { duration: 400 }),
          withSpring(1.15, { duration: 400 }),
          withSpring(1.0, { duration: 400 })
        );
      };
      
      startPulsing();
      
      // Repeat the pulsing animation
      const interval = setInterval(startPulsing, 1600);
      
      // Also animate the REC dot
      recDotOpacity.value = withRepeat(
        withTiming(0.3, { duration: 800 }),
        -1,
        true
      );
      
      return () => clearInterval(interval);
    } else {
      pulseScale.value = withSpring(1);
      recDotOpacity.value = withTiming(1);
    }
  }, [isListening, voiceToText.isListening, pulseScale, recDotOpacity]);

  const promptAnimatedStyle = useAnimatedStyle(() => ({
    opacity: promptOpacity.value,
  }));

  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));
  
  const recDotAnimatedStyle = useAnimatedStyle(() => ({
    opacity: recDotOpacity.value,
  }));

  const handlePress = async () => {
    if (enableVoiceToText) {
      if (!isVoiceMode && !isListening) {
        setIsVoiceMode(true);
        
        console.log('🎤 Starting voice recognition via VoiceContext...');
        
        if (startListening) {
          const success = await startListening({
            locale: 'en-US',
            confidenceThreshold,
            enableCaching: true,
            enableFallback: true,
          });
          
          if (!success) {
            console.warn('❌ VoiceContext failed to start listening');
            setIsVoiceMode(false);
          }
        } else {
          console.warn('❌ VoiceContext not available');
          setIsVoiceMode(false);
        }
      } else {
        console.log('🎤 Stopping voice recognition via VoiceContext...');
        
        if (stopListening) {
          await stopListening();
        }
        setIsVoiceMode(false);
      }
    } else if (onPress) {
      onPress();
    }
  };

  const getDisplayTitle = () => {
    if (enableVoiceToText && (isVoiceMode || isListening || voiceToText.isListening)) {
      if (isProcessing || voiceToText.isProcessing) return 'Processing...';
      if (isListening || voiceToText.isListening) return 'Listening...';
      if (error || voiceToText.error) return 'Error - Tap to retry';
      return 'Tap to stop recording'; // More descriptive for recording state
    }
    return title;
  };

  const getDisplaySubtitle = () => {
    if (enableVoiceToText && (isVoiceMode || isListening || voiceToText.isListening)) {
      if (error || voiceToText.error) {
        return error || voiceToText.error;
      }
      
      const activeTranscript = currentTranscript || voiceToText.currentTranscript;
      const activeConfidence = confidence || voiceToText.confidence;
      
      // Always show real-time transcript if available (remove showRealTimeTranscript condition)
      if (activeTranscript && activeTranscript.length > 0) {
        let transcript = activeTranscript;
        
        // Add confidence indicator if enabled and confidence is reasonable
        if (showConfidence && activeConfidence > 0.3) {
          const confidencePercent = Math.round(activeConfidence * 100);
          transcript += `\n\n(${confidencePercent}% confident)`;
        }
        
        return transcript;
      }
      
      if (isProcessing || voiceToText.isProcessing) {
        return 'Processing your voice...';
      }
      
      if (isListening || voiceToText.isListening) {
        return 'Listening... Speak now!\nTap microphone to stop recording';
      }
      
      return 'Voice ready';
    }
    return subtitle;
  };

  const getIconName = () => {
    if (enableVoiceToText && (isVoiceMode || isListening || voiceToText.isListening)) {
      if (error || voiceToText.error) return 'alert-circle';
      if (isProcessing || voiceToText.isProcessing) return 'cog';
      // Always show microphone when listening (pulsating animation will indicate recording)
      if (isListening || voiceToText.isListening) {
        return 'microphone';
      }
      return 'microphone'; // Changed from 'stop' to keep microphone icon
    }
    return iconName;
  };

  const getIconColor = () => {
    if (enableVoiceToText && (isVoiceMode || isListening || voiceToText.isListening)) {
      if (error || voiceToText.error) return theme.colors.error;
      if (isProcessing || voiceToText.isProcessing) return theme.colors.warning;
      if (isListening || voiceToText.isListening) {
        return '#FF4444'; // Bright red color to indicate active recording
      }
      return theme.colors.text.onPrimary;
    }
    return theme.colors.text.onPrimary;
  };

  return (
    <Animated.View
      style={[
        {
          paddingHorizontal: 24,
          alignItems: 'center',
          marginBottom: 24,
        },
        promptAnimatedStyle,
      ]}
    >
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.9}
        style={{ width: '100%' }}
      >
        <LinearGradient
          colors={theme.colors.gradients.accent}
          style={{
            borderRadius: 20,
            padding: 24,
            alignItems: 'center',
            width: '100%',
            shadowColor: theme.colors.accent,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 12,
          }}
        >
          <Animated.View style={[pulseAnimatedStyle, { alignItems: 'center' }]}>
            <MaterialCommunityIcon
              name={getIconName()}
              size={iconSize}
              color={getIconColor()}
            />
          </Animated.View>
          
          <Text
            style={{
              fontSize: 20,
              fontWeight: '700',
              color: theme.colors.text.onPrimary,
              textAlign: 'center',
              marginTop: 12,
              marginBottom: 8,
            }}
          >
            {getDisplayTitle()}
          </Text>
          
          {/* Transcript display with scrolling */}
          <View style={{
            maxHeight: 66, // 3 lines * 22 line height
            minHeight: 22,
            width: '100%',
            overflow: 'hidden',
          }}>
            <ScrollView 
              ref={scrollViewRef}
              style={{ flex: 1 }}
              contentContainerStyle={{ flexGrow: 1 }}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}
              onContentSizeChange={() => {
                // Auto-scroll to bottom when content changes
                scrollViewRef.current?.scrollToEnd({ animated: true });
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  color: theme.colors.text.onPrimary + 'CC',
                  textAlign: 'center',
                  lineHeight: 22,
                }}
              >
                {getDisplaySubtitle()}
              </Text>
            </ScrollView>
          </View>

          {/* Enhanced status indicators */}
          {enableVoiceToText && (
            <View style={{ marginTop: 8, alignItems: 'center' }}>
              {!(voiceAvailable || voiceToText.voiceAvailable) && (
                <Text
                  style={{
                    fontSize: 14,
                    color: theme.colors.text.onPrimary + '99',
                    textAlign: 'center',
                    fontStyle: 'italic',
                  }}
                >
                  Voice recognition unavailable
                </Text>
              )}
              
              {/* Recording indicator with pulsing dot */}
              {(isListening || voiceToText.isListening) && (
                <View style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  marginTop: 4,
                  backgroundColor: 'rgba(255, 68, 68, 0.2)',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 12,
                }}>
                  <Animated.View style={[
                    {
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: '#FF4444',
                      marginRight: 6,
                    },
                    recDotAnimatedStyle
                  ]} />
                  <Text
                    style={{
                      fontSize: 12,
                      color: '#FF4444',
                      fontWeight: '600',
                      textAlign: 'center',
                    }}
                  >
                    REC
                  </Text>
                </View>
              )}

              {/* Processing indicator */}
              {(isProcessing || voiceToText.isProcessing) && (
                <View style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  marginTop: 4,
                }}>
                  <MaterialCommunityIcon
                    name="loading"
                    size={12}
                    color={theme.colors.text.onPrimary + '99'}
                    style={{ marginRight: 4 }}
                  />
                  <Text
                    style={{
                      fontSize: 12,
                      color: theme.colors.text.onPrimary + '99',
                      textAlign: 'center',
                    }}
                  >
                    Processing
                  </Text>
                </View>
              )}
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};