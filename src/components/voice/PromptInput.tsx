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
import Voice from '@react-native-voice/voice';
import { pick, types, DocumentPickerResponse } from '@react-native-documents/picker';
import { launchImageLibrary, ImagePickerResponse, MediaType } from 'react-native-image-picker';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';
import Icon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

interface PromptInputProps {
  onSendMessage?: (text: string) => void;
  onSendRecording?: (audioUri: string, transcript?: string) => void;
  onAttachFile?: (file: any) => void;
  onAttachImage?: (image: any) => void;
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

const { width } = Dimensions.get('window');

export const PromptInput: React.FC<PromptInputProps> = ({
  onSendMessage,
  onSendRecording,
  onAttachFile,
  onAttachImage,
  placeholder = "Enter a prompt here...",
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

  const audioRecorderPlayer = useRef(AudioRecorderPlayer).current;
  const recordingTimer = useRef<NodeJS.Timeout | null>(null);

  // Animations
  const recordingScale = useSharedValue(1);
  const recordingOpacity = useSharedValue(0);
  const pulseAnimation = useSharedValue(0);
  const inputFocus = useSharedValue(0);
  const sendButtonScale = useSharedValue(1);

  // Voice recognition setup
  useEffect(() => {
    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechRecognized = onSpeechRecognized;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechError = onSpeechError;
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechPartialResults = onSpeechPartialResults;

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  // Voice event handlers
  const onSpeechStart = () => setIsListening(true);
  const onSpeechRecognized = () => {};
  const onSpeechEnd = () => setIsListening(false);
  const onSpeechError = (error: any) => {
    console.log('Speech error:', error);
    setIsListening(false);
  };
  const onSpeechResults = (event: any) => {
    setVoiceResults(event.value);
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
            message: 'This app needs access to your microphone to record audio messages.',
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
      Alert.alert('Permission required', 'Please grant microphone permission to record audio.');
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
        true
      );

      // Start voice recognition
      await Voice.start('en-US');

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
      await Voice.stop();

      // Reset animations
      recordingScale.value = withSpring(1);
      recordingOpacity.value = withTiming(0);
      pulseAnimation.value = withTiming(0);

      // Get transcript
      const transcript = voiceResults.length > 0 ? voiceResults[0] : '';
      
      console.log('Voice transcript:', transcript);

      // Send recording with transcript
      onSendRecording?.(recording.audioPath, transcript);

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
      await Voice.stop();
      
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }

      // Delete audio file
      if (recording.audioPath && await RNFS.exists(recording.audioPath)) {
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
        true
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
        withSpring(0.9, { damping: 10 }),
        withSpring(1, { damping: 10 })
      );
      
      onSendMessage?.(text.trim());
      setText('');
      setAttachedFiles([]);
    }
  };

  const handleFocus = () => {
    inputFocus.value = withSpring(1);
  };

  const handleBlur = () => {
    inputFocus.value = withSpring(0);
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const removeAttachment = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Animated styles
  const containerAnimatedStyle = useAnimatedStyle(() => {
    const borderColor = interpolate(
      inputFocus.value,
      [0, 1],
      [0.3, 1]
    );
    
    return {
      borderColor: `rgba(99, 102, 241, ${borderColor})`,
      shadowOpacity: inputFocus.value * 0.1,
      transform: [{ scale: interpolate(inputFocus.value, [0, 1], [1, 1.02]) }],
    };
  });

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
        <View className="bg-gray-200 rounded-3xl px-4 py-3">
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
          <View className="flex-row flex-wrap gap-2">
            {attachedFiles.map((file, index) => (
              <View
                key={index}
                className="bg-blue-50 border border-blue-200 rounded-lg p-2 flex-row items-center"
              >
                {file.uri && (file.type?.startsWith('image') || file.fileName?.match(/\.(jpg|jpeg|png|gif)$/i)) ? (
                  <Image source={{ uri: file.uri }} className="w-8 h-8 rounded mr-2" />
                ) : (
                  <View className="w-8 h-8 bg-blue-500 rounded mr-2 items-center justify-center">
                    <Icon name="file-text" size={12} color="white" />
                  </View>
                )}
                <Text className="text-blue-700 text-sm flex-1" numberOfLines={1}>
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

      {/* Main Input Container */}
      <Animated.View
        style={[
          {
            shadowColor: '#cb9ffe',
            shadowOffset: { width: 0, height: 4 },
            shadowRadius: 12,
            elevation: 8,
          },
          containerAnimatedStyle,
        ]}
        className="bg-white rounded-full items-center border-2 border-[#A05FFF] px-4 py-3"
      >
        <View className="flex-row items-end ">
          {/* Action Buttons */}
          <View className="flex-row mr-3">
            {!recording.isRecording && (
              <TouchableOpacity
                onPress={() => setShowAttachmentModal(true)}
                className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center mr-2"
              >
                <Icon name="paperclip" size={20} color="#3B82F6" />
              </TouchableOpacity>
            )}
          </View>

          {/* Input Area */}
          <View className="flex-1 h-full flex-row items-center">
            {recording.isRecording ? (
              <View className="">
                <View className="flex-row items-center">
                  <Animated.View
                    style={recordingAnimatedStyle}
                    className="w-3 h-3 bg-red-500 rounded-full mr-2"
                  />
                  <Text className="text-gray-700 font-medium text-center">
                    Recording {formatDuration(recording.duration)}
                    {recording.isPaused && ' (Paused)'}
                  </Text>
                </View>
                {voiceResults.length > 0 && (
                  <Text className="text-blue-600 text-sm mt-1" numberOfLines={2}>
                    "{voiceResults[0]}"
                  </Text>
                )}
              </View>
            ) : (
              <TextInput
                placeholder={placeholder}
                value={text}
                onChangeText={setText}
                onFocus={handleFocus}
                onBlur={handleBlur}
                className="text-gray-900 text-base max-h-24"
                placeholderTextColor="#9CA3AF"
                multiline
                scrollEnabled
                style={{ textAlignVertical: 'center' }}
              />
            )}
          </View>

          {/* Send/Record Button */}
          <View className="ml-3">
            {recording.isRecording ? (
              <TouchableOpacity
                onPress={stopRecording}
                className="w-12 h-12 bg-blue-600 rounded-full items-center justify-center"
                style={{
                  shadowColor: '#4F46E5',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 6,
                }}
              >
                <MaterialIcon name="send" size={20} color="white" />
              </TouchableOpacity>
            ) : text.trim() || attachedFiles.length > 0 ? (
              <Animated.View style={sendButtonAnimatedStyle}>
                <TouchableOpacity
                  onPress={handleSend}
                  className="w-12 h-12 bg-blue-600 rounded-full items-center justify-center"
                  style={{
                    shadowColor: '#4F46E5',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 6,
                  }}
                >
                  <MaterialIcon name="send" size={20} color="white" />
                </TouchableOpacity>
              </Animated.View>
            ) : (
              <TouchableOpacity
                onPress={startRecording}
                className="w-12 h-12 bg-blue-600 rounded-full items-center justify-center"
                style={{
                  shadowColor: '#4F46E5',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 6,
                }}
              >
                <MaterialIcon name="mic" size={24} color="white" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Animated.View>

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
                  <Text className="text-lg font-semibold text-gray-800">Document</Text>
                  <Text className="text-sm text-gray-600">Select a file or document</Text>
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
                  <Text className="text-lg font-semibold text-gray-800">Image</Text>
                  <Text className="text-sm text-gray-600">Select a photo or image</Text>
                </View>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => setShowAttachmentModal(false)}
              className="mt-6 py-3 px-6 bg-gray-100 rounded-xl"
            >
              <Text className="text-center text-gray-700 font-medium">Cancel</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Voice Recognition Status */}
      {isListening && !recording.isRecording && (
        <View className="mt-2 px-4 flex-row items-center justify-center">
          <MaterialIcon name="mic" size={16} color="#3B82F6" />
          <Text className="text-blue-600 text-sm ml-2">
            Listening...
          </Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};
