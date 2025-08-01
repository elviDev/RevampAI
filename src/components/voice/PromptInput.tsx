import React, { useState, useRef, useEffect } from 'react';
import {
  TextInput,
  TouchableOpacity,
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  Alert,
  PermissionsAndroid,
  Dimensions,
  Image,
  Modal,
  Pressable,
  FlatList,
  ScrollView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSpring,
  interpolate,
  withSequence,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import Voice from '../../services/voice/CustomVoice';
import { debugVoiceSystem, logVoiceModuleStatus } from '../../utils/debugVoice';
import {
  showVoiceErrorDialog,
  runVoiceDiagnostics,
} from '../../utils/voiceErrorHandler';
import {
  pick,
  types,
  DocumentPickerResponse,
} from '@react-native-documents/picker';
import {
  launchImageLibrary,
  ImagePickerResponse,
  MediaType,
} from 'react-native-image-picker';
import CustomAudioRecorderPlayer from '../../services/audio/CustomAudioRecorderPlayer';
import RNFS from 'react-native-fs';
import Icon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { EmojiPicker } from '../chat/EmojiPicker';
import { openAIService } from '../../services/ai/OpenAIService';

interface PromptInputProps {
  onSendMessage?: (text: string) => void;
  onSendRecording?: (audioUri: string, transcript?: string) => void;
  onAttachFile?: (file: any) => void;
  onAttachImage?: (image: any) => void;
  onEnhanceText?: (text: string) => void;
  placeholder?: string;
  maxLines?: number;
  disabled?: boolean;
}

interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioPath: string;
}

interface MentionUser {
  id: string;
  name: string;
  username: string;
}

// Dummy users for mention functionality
const DUMMY_USERS: MentionUser[] = [
  { id: '1', name: 'John Doe', username: 'johndoe' },
  { id: '2', name: 'Jane Smith', username: 'janesmith' },
  { id: '3', name: 'Mike Johnson', username: 'mikejohnson' },
  { id: '4', name: 'Sarah Wilson', username: 'sarahwilson' },
  { id: '5', name: 'David Brown', username: 'davidbrown' },
  { id: '6', name: 'Emily Davis', username: 'emilydavis' },
  { id: '7', name: 'Chris Miller', username: 'chrismiller' },
  { id: '8', name: 'Lisa Anderson', username: 'lisaanderson' },
  { id: '9', name: 'Tom Garcia', username: 'tomgarcia' },
  { id: '10', name: 'Amy Martinez', username: 'amymartinez' },
];

const { width } = Dimensions.get('window');

export const PromptInput: React.FC<PromptInputProps> = ({
  onSendMessage,
  onSendRecording,
  onAttachFile,
  onAttachImage,
  onEnhanceText,
  placeholder = 'Enter a prompt here...',
  maxLines = 4,
  disabled = false,
}) => {
  const [text, setText] = useState('');
  const [recording, setRecording] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    audioPath: '',
  });
  const [voiceResults, setVoiceResults] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<any[]>([]);
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [voiceAvailable, setVoiceAvailable] = useState(false);
  const [selectionStart, setSelectionStart] = useState(0);
  const [isEnhancing, setIsEnhancing] = useState(false);

  const audioRecorderPlayer = useRef(new CustomAudioRecorderPlayer()).current;
  const recordingTimer = useRef<NodeJS.Timeout | null>(null);
  const textInputRef = useRef<TextInput>(null);

  // Animations
  const recordingScale = useSharedValue(1);
  const recordingOpacity = useSharedValue(0);
  const pulseAnimation = useSharedValue(0);
  const sendButtonScale = useSharedValue(1);

  // Helper functions
  const getWordCount = (text: string): number => {
    return text
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0).length;
  };

  const shouldShowEnhanceButton = (): boolean => {
    const wordCount = getWordCount(text);
    return wordCount > 0 && wordCount <= 100;
  };

  const handleTextChange = (newText: string) => {
    setText(newText);

    // Use setTimeout to ensure the text state is updated before checking mentions
    setTimeout(() => {
      checkForMentions(newText, selectionStart);
    }, 0);
  };

  const checkForMentions = (currentText: string, cursorPos: number) => {
    // Get text before cursor position
    const textBeforeCursor = currentText.substring(0, cursorPos);

    // Look for @ pattern at the end of text before cursor
    const mentionMatch = textBeforeCursor.match(/@([a-zA-Z0-9_]*)$/);

    if (mentionMatch) {
      const query = mentionMatch[1] || '';
      setMentionQuery(query);
      setShowMentionSuggestions(true);
      console.log('✅ Mention detected:', query, 'at position:', cursorPos);
    } else {
      setShowMentionSuggestions(false);
      setMentionQuery('');
      console.log('❌ No mention found in:', textBeforeCursor);
    }
  };

  const insertMention = (user: MentionUser) => {
    const currentText = text;
    const cursorPos = selectionStart;
    const textBeforeCursor = currentText.substring(0, cursorPos);
    const textAfterCursor = currentText.substring(cursorPos);

    // Find the @ symbol position
    const mentionMatch = textBeforeCursor.match(/@([a-zA-Z0-9_]*)$/);
    if (mentionMatch) {
      const atPosition = mentionMatch.index!;
      const newText =
        currentText.substring(0, atPosition) +
        `@${user.username} ` +
        textAfterCursor;

      setText(newText);
      setShowMentionSuggestions(false);
      setMentionQuery('');

      // Update cursor position
      const newCursorPos = atPosition + user.username.length + 2; // +2 for @ and space
      setSelectionStart(newCursorPos);

      // Focus back to input
      setTimeout(() => {
        textInputRef.current?.focus();
      }, 50);

      console.log('Mention inserted:', user.username);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    const cursorPos = selectionStart || text.length;
    const newText =
      text.substring(0, cursorPos) + emoji + text.substring(cursorPos);

    console.log('✅ Inserting emoji:', emoji, 'at position:', cursorPos);
    setText(newText);
    setSelectionStart(cursorPos + emoji.length);

    // Focus back to input after a brief delay
    setTimeout(() => {
      textInputRef.current?.focus();
    }, 50);
  };

  const renderStyledText = (text: string) => {
    const parts = text.split(/(@\w+)/g);
    return parts.map((part, index) => {
      if (part.match(/^@\w+$/)) {
        return (
          <Text
            key={index}
            style={{
              fontStyle: 'italic',
              color: '#7C3AED',
              fontWeight: '600',
            }}
          >
            {part}
          </Text>
        );
      }
      return part;
    });
  };

  const filteredMentionUsers = DUMMY_USERS.filter(
    user =>
      user.username.toLowerCase().includes(mentionQuery.toLowerCase()) ||
      user.name.toLowerCase().includes(mentionQuery.toLowerCase()),
  );

  // Check for mentions when cursor position changes
  useEffect(() => {
    if (text) {
      checkForMentions(text, selectionStart);
    }
  }, [selectionStart]);

  // Voice recognition setup
  useEffect(() => {
    // Debug voice system on component mount
    debugVoiceSystem();
    logVoiceModuleStatus();

    // Run comprehensive diagnostics
    runVoiceDiagnostics();

    try {
      if (Voice.isModuleAvailable()) {
        setVoiceAvailable(true);
        Voice.onSpeechStart = onSpeechStart;
        Voice.onSpeechRecognized = onSpeechRecognized;
        Voice.onSpeechEnd = onSpeechEnd;
        Voice.onSpeechError = onSpeechError;
        Voice.onSpeechResults = onSpeechResults;
        Voice.onSpeechPartialResults = onSpeechPartialResults;
        console.log('✅ Voice recognition setup completed');
      } else {
        setVoiceAvailable(false);
        console.warn(
          '⚠️ Voice module not available - voice recognition disabled',
        );
      }
    } catch (error) {
      setVoiceAvailable(false);
      console.warn('❌ Voice recognition setup failed:', error);
    }

    return () => {
      try {
        if (Voice.isModuleAvailable()) {
          Voice.destroy()
            .then(() => Voice.removeAllListeners())
            .catch(console.warn);
        }
      } catch (error) {
        console.warn('Voice cleanup failed:', error);
      }
    };
  }, []);

  // Voice event handlers
  const onSpeechStart = () => setIsListening(true);
  const onSpeechRecognized = () => {};
  const onSpeechEnd = () => {
    console.log('🛑 Speech end detected');
    setIsListening(false);
    // Don't automatically stop recording - let user control it
  };
  const onSpeechError = (error: any) => {
    console.log('❌ Voice error received:', error);
    setIsListening(false);

    // Show detailed error information
    showVoiceErrorDialog(error);
  };
  const onSpeechResults = (event: any) => {
    console.log('📝 Speech results received:', event.value);
    setVoiceResults(event.value);
    // Don't automatically stop - accumulate results for continuous speech
  };
  const onSpeechPartialResults = (event: any) => {
    setVoiceResults(event.value);
  };

  // Permission handlers
  const requestAudioPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Audio Recording Permission',
            message:
              'This app needs access to your microphone to record audio messages.',
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

  // Recording functions
  const startRecording = async () => {
    const hasPermission = await requestAudioPermission();
    if (!hasPermission) {
      Alert.alert(
        'Permission required',
        'Please grant microphone permission to record audio.',
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

      // Start timer
      recordingTimer.current = setInterval(() => {
        setRecording(prev => ({ ...prev, duration: prev.duration + 1 }));
      }, 1000);

      // Start animations
      recordingScale.value = withSpring(1.1, { damping: 10 });
      recordingOpacity.value = withTiming(1, { duration: 200 });
      pulseAnimation.value = withRepeat(
        withTiming(1, { duration: 1000 }),
        -1,
        true,
      );

      // Start voice recognition
      try {
        if (Voice.isModuleAvailable()) {
          console.log('🎤 Starting voice recognition...');
          await Voice.start('en-US');
          console.log('✅ Voice recognition started successfully');
        } else {
          console.warn(
            '⚠️ Voice module not available - continuing with audio recording only',
          );
        }
      } catch (voiceError: any) {
        console.warn('❌ Voice recognition failed to start:', voiceError);
        console.warn('Error details:', voiceError.message);
        // Continue with recording even if voice recognition fails
        Alert.alert(
          'Voice Recognition',
          'Voice recognition is not available, but audio recording will continue.',
          [{ text: 'OK' }],
        );
      }
    } catch (error) {
      console.error('Start recording error:', error);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    try {
      const result = await audioRecorderPlayer.stopRecorder();

      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }

      // Stop voice recognition
      try {
        if (Voice.isModuleAvailable()) {
          console.log('🛑 Stopping voice recognition...');
          await Voice.stop();
          console.log('✅ Voice recognition stopped successfully');
        }
      } catch (voiceError: any) {
        console.warn('❌ Voice recognition failed to stop:', voiceError);
        console.warn('Error details:', voiceError.message);
      }

      // Reset animations
      recordingScale.value = withSpring(1);
      recordingOpacity.value = withTiming(0);
      pulseAnimation.value = withTiming(0);

      // Get transcript
      const rawTranscript = voiceResults.length > 0 ? voiceResults[0] : '';
      console.log('📝 Raw transcript:', rawTranscript);

      let finalTranscript = rawTranscript;

      // Enhance transcript with OpenAI if available
      if (rawTranscript.trim()) {
        try {
          console.log('🔄 Correcting transcription with OpenAI...');
          finalTranscript =
            await openAIService.correctTranscription(rawTranscript);
          console.log('✅ Transcription corrected:', finalTranscript);
        } catch (error) {
          console.warn(
            '⚠️ Transcription correction failed, using original:',
            error,
          );
          finalTranscript = rawTranscript;
        }
      }

      // Send recording with corrected transcript
      onSendRecording?.(recording.audioPath, finalTranscript);

      // Reset state
      setRecording({
        isRecording: false,
        isPaused: false,
        duration: 0,
        audioPath: '',
      });
      setVoiceResults([]);
    } catch (error) {
      console.error('Stop recording error:', error);
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  const cancelRecording = async () => {
    try {
      await audioRecorderPlayer.stopRecorder();
      try {
        await Voice.stop();
      } catch (voiceError) {
        console.warn('Voice stop failed during cancel:', voiceError);
      }

      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }

      // Delete audio file
      if (recording.audioPath && (await RNFS.exists(recording.audioPath))) {
        await RNFS.unlink(recording.audioPath);
      }

      // Reset animations and state
      recordingScale.value = withSpring(1);
      recordingOpacity.value = withTiming(0);
      pulseAnimation.value = withTiming(0);

      // Completely reset recording state to restore mic icon
      setRecording({
        isRecording: false,
        isPaused: false,
        duration: 0,
        audioPath: '', // This ensures the mic icon is shown again
      });
      setVoiceResults([]);
      setIsListening(false);
    } catch (error) {
      console.error('Cancel recording error:', error);
    }
  };

  const pauseRecording = async () => {
    try {
      await audioRecorderPlayer.pauseRecorder();
      setRecording(prev => ({ ...prev, isPaused: true }));

      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }

      recordingScale.value = withSpring(1);
      pulseAnimation.value = withTiming(0);
    } catch (error) {
      console.error('Pause recording error:', error);
    }
  };

  const resumeRecording = async () => {
    try {
      await audioRecorderPlayer.resumeRecorder();
      setRecording(prev => ({ ...prev, isPaused: false }));

      // Restart timer
      recordingTimer.current = setInterval(() => {
        setRecording(prev => ({ ...prev, duration: prev.duration + 1 }));
      }, 1000);

      recordingScale.value = withSpring(1.1, { damping: 10 });
      pulseAnimation.value = withRepeat(
        withTiming(1, { duration: 1000 }),
        -1,
        true,
      );
    } catch (error) {
      console.error('Resume recording error:', error);
    }
  };

  // File handling
  const handleFilePicker = async () => {
    try {
      const results = await pick({
        allowMultiSelection: false,
        type: [types.allFiles],
      });

      if (results && results.length > 0) {
        const file = results[0];
        setAttachedFiles(prev => [...prev, file]);
        onAttachFile?.(file);
      }
    } catch (error) {
      // @react-native-documents/picker throws an error when user cancels
      if (error && typeof error === 'object' && 'code' in error) {
        const errorCode = (error as any).code;
        if (errorCode !== 'DOCUMENT_PICKER_CANCELED') {
          console.error('File picker error:', error);
          Alert.alert('Error', 'Failed to pick file');
        }
      } else {
        console.error('File picker error:', error);
        Alert.alert('Error', 'Failed to pick file');
      }
    }
  };

  const handleImagePicker = () => {
    const options = {
      mediaType: 'mixed' as MediaType,
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      if (response.assets && response.assets.length > 0) {
        const image = response.assets[0];
        setAttachedFiles(prev => [...prev, image]);
        onAttachImage?.(image);
      }
    });
  };

  const handleSend = () => {
    if (text.trim()) {
      sendButtonScale.value = withSequence(
        withTiming(0.95, { duration: 100 }),
        withTiming(1, { duration: 100 }),
      );

      onSendMessage?.(text.trim());
      setText('');
      setAttachedFiles([]);
    }
  };

  const handleEnhance = async () => {
    if (!text.trim() || !shouldShowEnhanceButton() || isEnhancing) {
      return;
    }

    setIsEnhancing(true);
    console.log('🔄 Starting text enhancement...');

    try {
      const enhancedText = await openAIService.enhanceText(text.trim());
      setText(enhancedText);
      console.log('✅ Text enhanced successfully');

      // Optionally call the callback if provided
      onEnhanceText?.(enhancedText);
    } catch (error) {
      console.error('❌ Enhancement failed:', error);
      Alert.alert(
        'Enhancement Failed',
        error instanceof Error
          ? error.message
          : 'Unable to enhance text. Please try again.',
        [{ text: 'OK' }],
      );
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleFocus = () => {
    // Remove animations to prevent flickering
  };

  const handleBlur = () => {
    // Remove animations to prevent flickering
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const removeAttachment = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const recordingAnimatedStyle = useAnimatedStyle(() => {
    const pulseScale = interpolate(pulseAnimation.value, [0, 1], [1, 1.1]);

    return {
      transform: [{ scale: recordingScale.value * pulseScale }],
      opacity: recordingOpacity.value,
    };
  });

  const sendButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sendButtonScale.value }],
  }));

  if (disabled) {
    return (
      <View className="px-4 py-2">
        <View className="bg-gray-200 rounded-md px-4 py-3">
          <Text className="text-gray-500 text-center">Input disabled</Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="px-4 py-2"
    >
      {/* Attachments Preview */}
      {attachedFiles.length > 0 && (
        <View className="mb-2">
          <View className="flex-row flex-wrap gap-1">
            {attachedFiles.map((file, index) => (
              <View
                key={index}
                className="bg-blue-50 border border-blue-200 rounded-md  p-2 flex-row items-center"
              >
                {file.uri &&
                (file.type?.startsWith('image') ||
                  file.fileName?.match(/\.(jpg|jpeg|png|gif)$/i)) ? (
                  <Image
                    source={{ uri: file.uri }}
                    className="w-8 h-8 rounded mr-2"
                  />
                ) : (
                  <View className="w-8 h-8 bg-blue-500 rounded mr-2 items-center justify-center">
                    <Icon name="file-text" size={12} color="white" />
                  </View>
                )}
                <Text
                  className="text-blue-700 text-sm flex-1"
                  numberOfLines={1}
                >
                  {file.fileName || file.name || 'Unknown file'}
                </Text>
                <TouchableOpacity onPress={() => removeAttachment(index)}>
                  <Text className="text-red-500 ml-2">×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Mention Suggestions */}
      {showMentionSuggestions && filteredMentionUsers.length > 0 && (
        <View className="mb-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48">
          <FlatList
            data={filteredMentionUsers}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => insertMention(item)}
                className="p-3 border-b border-gray-100 flex-row items-center"
              >
                <View className="w-8 h-8 bg-purple-100 rounded-full items-center justify-center mr-3">
                  <Text className="text-purple-600 font-semibold text-sm">
                    {item.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 font-medium">{item.name}</Text>
                  <Text className="text-gray-500 text-sm">
                    @{item.username}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Main Input Container */}
      <View className="relative">
        {/* Gradient Border Container */}
        <LinearGradient
          colors={['#3933C6', '#A05FFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 12,
            padding: 1,
            shadowColor: '#A05FFF',
            shadowOffset: { width: 0, height: 8 },
            shadowRadius: 28,
            shadowOpacity: 0.25,
            elevation: 6,
          }}
        >
          {/* Inner Container with Glow Effect */}
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              padding: 12,
              minHeight: 70,

              elevation: 0,
            }}
          >
            {/* Input Area - Full Width at Top */}
            <View className="mb-2">
              {recording.isRecording ? (
                <View className="min-h-[60px] justify-center">
                  <View className="flex-row items-center justify-center">
                    <Animated.View
                      style={recordingAnimatedStyle}
                      className="w-3 h-3 bg-red-500 rounded-full mr-2"
                    />
                    <Text className="text-gray-700 font-medium text-center text-base">
                      Recording {formatDuration(recording.duration)}
                      {recording.isPaused && ' (Paused)'}
                    </Text>
                  </View>
                  {voiceResults.length > 0 && (
                    <Text
                      className="text-blue-600 text-sm mt-3 text-center px-4"
                      numberOfLines={3}
                      style={{
                        lineHeight: 20,
                      }}
                    >
                      "{voiceResults[0]}"
                    </Text>
                  )}
                </View>
              ) : (
                <View className="relative">
                  {/* Background Gradient for Text Input */}
                  <LinearGradient
                    colors={[
                      'rgba(57, 51, 198, 0.03)',
                      'rgba(160, 95, 255, 0.03)',
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      borderRadius: 8,
                    }}
                  />

                  <TextInput
                    ref={textInputRef}
                    placeholder={placeholder}
                    value={text}
                    onChangeText={handleTextChange}
                    onSelectionChange={event => {
                      setSelectionStart(event.nativeEvent.selection.start);
                    }}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    className="text-gray-900 w-full"
                    placeholderTextColor="#9CA3AF"
                    multiline={true}
                    scrollEnabled={true}
                    style={{
                      textAlignVertical: 'top',
                      paddingTop: 16,
                      paddingBottom: 16,
                      paddingHorizontal: 16,
                      minHeight: 60,
                      maxHeight: 140,
                      lineHeight: 22,
                      fontSize: 16,
                      fontWeight: '400',
                      letterSpacing: 0.3,
                      borderRadius: 16,
                      backgroundColor: 'transparent',
                    }}
                    removeClippedSubviews={false}
                    keyboardType="default"
                    blurOnSubmit={false}
                    enablesReturnKeyAutomatically={false}
                    returnKeyType="default"
                    textBreakStrategy="balanced"
                    autoCorrect={true}
                    spellCheck={true}
                  />
                </View>
              )}
            </View>

            {/* Action Buttons Row - Bottom Right */}
            <View className="flex-row justify-end items-center">
              {/* Attachment Button */}
              {!recording.isRecording && (
                <TouchableOpacity
                  onPress={() => setShowAttachmentModal(true)}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: '#F8F9FF',
                    borderWidth: 1,
                    borderColor: '#E5E7FF',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                    shadowColor: '#3933C6',
                    shadowOffset: { width: 0, height: 2 },
                    shadowRadius: 8,
                    shadowOpacity: 0.1,
                    elevation: 3,
                  }}
                >
                  <Icon name="paperclip" size={18} color="#3933C6" />
                </TouchableOpacity>
              )}

              {/* Emoji Button */}
              {!recording.isRecording && (
                <TouchableOpacity
                  onPress={() => setShowEmojiPicker(true)}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: '#FFF8F0',
                    borderWidth: 1,
                    borderColor: '#FFE4CC',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                    shadowColor: '#A05FFF',
                    shadowOffset: { width: 0, height: 2 },
                    shadowRadius: 8,
                    shadowOpacity: 0.1,
                    elevation: 3,
                  }}
                >
                  <Text className="text-xl">😊</Text>
                </TouchableOpacity>
              )}

              {/* Enhancement Button - Only show when word count <= 100 and text exists */}
              {!recording.isRecording && shouldShowEnhanceButton() && (
                <TouchableOpacity
                  onPress={handleEnhance}
                  disabled={isEnhancing}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: isEnhancing ? '#F0F9F0' : '#F0FDF4',
                    borderWidth: 1,
                    borderColor: isEnhancing ? '#D1E7DD' : '#DCFCE7',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                    shadowColor: '#10B981',
                    shadowOffset: { width: 0, height: 2 },
                    shadowRadius: 8,
                    shadowOpacity: 0.1,
                    elevation: 3,
                    opacity: isEnhancing ? 0.7 : 1,
                  }}
                >
                  <MaterialIcon
                    name={isEnhancing ? 'hourglass-empty' : 'auto-fix-high'}
                    size={18}
                    color="#10B981"
                  />
                </TouchableOpacity>
              )}

              {/* Send/Record Button - Rightmost */}
              {recording.isRecording ? (
                <LinearGradient
                  colors={['#3933C6', '#A05FFF']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 26,
                    alignItems: 'center',
                    justifyContent: 'center',
                    shadowColor: '#A05FFF',
                    shadowOffset: { width: 0, height: 6 },
                    shadowRadius: 16,
                    shadowOpacity: 0.4,
                    elevation: 8,
                  }}
                >
                  <TouchableOpacity
                    onPress={stopRecording}
                    style={{
                      width: '100%',
                      height: '100%',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <MaterialIcon name="send" size={22} color="white" />
                  </TouchableOpacity>
                </LinearGradient>
              ) : text.trim() || attachedFiles.length > 0 ? (
                <Animated.View style={sendButtonAnimatedStyle}>
                  <LinearGradient
                    colors={['#3933C6', '#A05FFF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 26,
                      alignItems: 'center',
                      justifyContent: 'center',
                      shadowColor: '#A05FFF',
                      shadowOffset: { width: 0, height: 6 },
                      shadowRadius: 16,
                      shadowOpacity: 0.4,
                      elevation: 8,
                    }}
                  >
                    <TouchableOpacity
                      onPress={handleSend}
                      style={{
                        width: '100%',
                        height: '100%',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <MaterialIcon name="send" size={22} color="white" />
                    </TouchableOpacity>
                  </LinearGradient>
                </Animated.View>
              ) : (
                <View
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 26,
                    backgroundColor: '#F8F9FF',
                    borderWidth: 2,
                    borderColor: '#E5E7FF',
                    alignItems: 'center',
                    justifyContent: 'center',
                    shadowColor: '#3933C6',
                    shadowOffset: { width: 0, height: 4 },
                    shadowRadius: 12,
                    shadowOpacity: 0.15,
                    elevation: 6,
                    position: 'relative',
                  }}
                >
                  <TouchableOpacity
                    onPress={startRecording}
                    style={{
                      width: '100%',
                      height: '100%',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <MaterialIcon name="mic" size={22} color="#3933C6" />
                  </TouchableOpacity>

                  {/* Voice status indicator */}
                  <View
                    style={{
                      position: 'absolute',
                      top: -2,
                      right: -2,
                      width: 12,
                      height: 12,
                      borderRadius: 6,
                      backgroundColor: voiceAvailable ? '#10B981' : '#EF4444',
                      borderWidth: 2,
                      borderColor: '#FFFFFF',
                    }}
                  />
                </View>
              )}
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Voice Recording Controls - Bottom */}
      {recording.isRecording && (
        <View className="mt-3 flex-row justify-center space-x-4">
          {recording.isPaused ? (
            <TouchableOpacity
              onPress={resumeRecording}
              className="w-12 h-12 bg-green-500 rounded-full items-center justify-center"
              style={{
                shadowColor: '#22C55E',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 6,
                elevation: 4,
              }}
            >
              <MaterialIcon name="play-arrow" size={24} color="white" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={pauseRecording}
              className="w-12 h-12 bg-orange-500 rounded-full items-center justify-center"
              style={{
                shadowColor: '#F97316',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 6,
                elevation: 4,
              }}
            >
              <MaterialIcon name="pause" size={24} color="white" />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={cancelRecording}
            className="w-12 h-12 bg-red-500 rounded-full items-center justify-center"
            style={{
              shadowColor: '#EF4444',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 6,
              elevation: 4,
            }}
          >
            <MaterialIcon name="delete" size={24} color="white" />
          </TouchableOpacity>
        </View>
      )}

      {/* Attachment Modal */}
      <Modal
        visible={showAttachmentModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAttachmentModal(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-center items-center"
          onPress={() => setShowAttachmentModal(false)}
        >
          <View className="bg-white rounded-2xl p-6 m-6 w-80">
            <Text className="text-xl font-bold text-gray-800 mb-6 text-center">
              Choose Attachment
            </Text>

            <View className="space-y-4">
              <TouchableOpacity
                onPress={() => {
                  setShowAttachmentModal(false);
                  handleFilePicker();
                }}
                className="flex-row items-center py-4 px-4 bg-blue-50 rounded-xl"
              >
                <View className="w-12 h-12 bg-blue-500 rounded-full items-center justify-center mr-4">
                  <Icon name="file-text" size={24} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-gray-800">
                    Document
                  </Text>
                  <Text className="text-sm text-gray-600">
                    Select a file or document
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setShowAttachmentModal(false);
                  handleImagePicker();
                }}
                className="flex-row items-center py-4 px-4 bg-green-50 rounded-xl"
              >
                <View className="w-12 h-12 bg-green-500 rounded-full items-center justify-center mr-4">
                  <Icon name="image" size={24} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-gray-800">
                    Image
                  </Text>
                  <Text className="text-sm text-gray-600">
                    Select a photo or image
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => setShowAttachmentModal(false)}
              className="mt-6 py-3 px-6 bg-gray-100 rounded-xl"
            >
              <Text className="text-center text-gray-700 font-medium">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <Modal
          visible={showEmojiPicker}
          transparent={true}
          animationType="none"
          onRequestClose={() => setShowEmojiPicker(false)}
        >
          <EmojiPicker
            onEmojiSelect={handleEmojiSelect}
            onClose={() => setShowEmojiPicker(false)}
          />
        </Modal>
      )}

      {/* Voice Recognition Status */}
      {isListening && !recording.isRecording && (
        <View className="mt-2 px-4 flex-row items-center justify-center">
          <MaterialIcon name="mic" size={16} color="#3B82F6" />
          <Text className="text-blue-600 text-sm ml-2">Listening...</Text>
        </View>
      )}

      {/* Voice Debug Info */}
      {__DEV__ && (
        <View className="mt-2 px-4">
          <Text className="text-xs text-gray-500 text-center">
            Voice Module: {voiceAvailable ? '✅ Available' : '❌ Not Available'}
          </Text>
          {voiceResults.length > 0 && (
            <Text className="text-xs text-blue-600 text-center mt-1">
              Last: {voiceResults[0]}
            </Text>
          )}
        </View>
      )}
    </KeyboardAvoidingView>
  );
};
