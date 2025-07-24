import React, { useState, useRef, forwardRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  interpolate,
  interpolateColor,
} from 'react-native-reanimated';
interface VoiceMessageInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: (text: string, voiceUri?: string, transcript?: string) => void;
  placeholder: string;
  members: any[];
  isVoiceMode: boolean;
  onVoiceModeChange: (mode: boolean) => void;
  onEmojiPress: () => void;
}

export const VoiceMessageInput = forwardRef<TextInput, VoiceMessageInputProps>(
  (
    {
      value,
      onChangeText,
      onSend,
      placeholder,
      members,
      isVoiceMode,
      onVoiceModeChange,
      onEmojiPress,
    },
    ref,
  ) => {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [voiceTranscript, setVoiceTranscript] = useState('');
    const [showMentions, setShowMentions] = useState(false);

    const recordingTimer = useRef<NodeJS.Timeout | null>(null);

    // Animations
    const recordingScale = useSharedValue(1);
    const pulseAnimation = useSharedValue(0);
    const inputFocus = useSharedValue(0);

    const requestMicrophonePermission = async () => {
      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
            {
              title: 'Microphone Permission',
              message:
                'This app needs access to your microphone to record voice messages.',
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

    const startRecording = async () => {
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'Please grant microphone permission to record voice messages.',
        );
        return;
      }

      setIsRecording(true);
      setRecordingDuration(0);
      setVoiceTranscript('');

      // Start animations
      recordingScale.value = withSpring(1.1);
      pulseAnimation.value = withRepeat(
        withTiming(1, { duration: 1000 }),
        -1,
        true,
      );

      // Start timer
      recordingTimer.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

      // Simulate voice-to-text conversion
      setTimeout(() => {
        setVoiceTranscript('Converting speech to text...');
        setTimeout(() => {
          setVoiceTranscript(
            'This is a sample voice message transcript that would be generated in real-time.',
          );
        }, 2000);
      }, 1000);
    };

    const stopRecording = () => {
      setIsRecording(false);

      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }

      // Reset animations
      recordingScale.value = withSpring(1);
      pulseAnimation.value = withTiming(0);

      // Send voice message
      const audioUri = `voice_${Date.now()}.m4a`;
      onSend(voiceTranscript || 'Voice message', audioUri, voiceTranscript);

      setVoiceTranscript('');
      setRecordingDuration(0);
    };

    const cancelRecording = () => {
      setIsRecording(false);

      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }

      recordingScale.value = withSpring(1);
      pulseAnimation.value = withTiming(0);

      setVoiceTranscript('');
      setRecordingDuration(0);
    };

    const handleSend = () => {
      if (value.trim()) {
        onSend(value.trim());
      }
    };

    const formatDuration = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleTextChange = (text: string) => {
      onChangeText(text);

      // Check for mentions
      const lastWord = text.split(' ').pop();
      if (lastWord?.startsWith('@') && lastWord.length > 1) {
        setShowMentions(true);
      } else {
        setShowMentions(false);
      }
    };

    const insertMention = (memberName: string) => {
      const words = value.split(' ');
      words[words.length - 1] = `@${memberName} `;
      onChangeText(words.join(' '));
      setShowMentions(false);
    };

    const recordingAnimatedStyle = useAnimatedStyle(() => {
      const pulseScale = interpolate(pulseAnimation.value, [0, 1], [1, 1.05]);
      return {
        transform: [{ scale: recordingScale.value * pulseScale }],
      };
    });

    const inputAnimatedStyle = useAnimatedStyle(() => ({
      borderColor: interpolateColor(
        inputFocus.value,
        [0, 1],
        ['#d1d5db', '#3B82F6'], // gray-300 to blue-500
      ),
    }));

    return (
      <View className="px-4 py-2 bg-white">
        {/* Mentions Dropdown */}
        {showMentions && (
          <View className="bg-white border border-gray-200 rounded-lg mb-2 max-h-32">
            {members
              .filter(member =>
                member.name
                  .toLowerCase()
                  .includes(
                    value.split(' ').pop()?.slice(1).toLowerCase() || '',
                  ),
              )
              .map(member => (
                <TouchableOpacity
                  key={member.id}
                  onPress={() => insertMention(member.name)}
                  className="px-4 py-2 border-b border-gray-100"
                >
                  <View className="flex-row items-center">
                    <View className="w-8 h-8 bg-blue-500 rounded-full items-center justify-center mr-3">
                      <Text className="text-white text-xs font-semibold">
                        {member.name.charAt(0)}
                      </Text>
                    </View>
                    <View>
                      <Text className="text-gray-800 font-medium">
                        {member.name}
                      </Text>
                      <Text className="text-gray-500 text-xs">
                        {member.role}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
          </View>
        )}

        {/* Recording Status */}
        {isRecording && (
          <Animated.View
            style={recordingAnimatedStyle}
            className="bg-red-50 border border-red-200 rounded-lg p-3 mb-2"
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="w-3 h-3 bg-red-500 rounded-full mr-2" />
                <Text className="text-red-600 font-medium">
                  Recording {formatDuration(recordingDuration)}
                </Text>
              </View>
              <TouchableOpacity
                onPress={cancelRecording}
                className="bg-red-100 rounded-full px-3 py-1"
              >
                <Text className="text-red-600 text-xs font-medium">Cancel</Text>
              </TouchableOpacity>
            </View>

            {voiceTranscript && (
              <View className="mt-2 bg-white rounded-lg p-2">
                <Text className="text-gray-600 text-xs mb-1">
                  Live Transcript:
                </Text>
                <Text className="text-gray-800 text-sm">{voiceTranscript}</Text>
              </View>
            )}
          </Animated.View>
        )}

        {/* Input Container */}
        <Animated.View
          style={[
            inputAnimatedStyle,
            {
              shadowColor: '#3B82F6',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            },
          ]}
          className="bg-white border-2 border-blue-500 rounded-3xl px-4 py-2"
        >
          <View className="flex-row items-end">
            {/* Text Input */}
            <View className="flex-1 mr-3">
              {!isRecording ? (
                <TextInput
                  ref={ref}
                  value={value}
                  onChangeText={handleTextChange}
                  onFocus={() => (inputFocus.value = withSpring(1))}
                  onBlur={() => (inputFocus.value = withSpring(0))}
                  placeholder={placeholder}
                  placeholderTextColor="#9CA3AF"
                  className="text-gray-900 text-base min-h-[24px] max-h-24"
                  multiline
                  scrollEnabled
                  style={{ textAlignVertical: 'center' }}
                />
              ) : (
                <View className="py-2">
                  <Text className="text-gray-500">
                    Recording in progress...
                  </Text>
                </View>
              )}
            </View>

            {/* Action Buttons */}
            <View className="flex-row items-center space-x-2">
              {/* Emoji Button */}
              <TouchableOpacity
                onPress={onEmojiPress}
                className="w-10 h-10 bg-yellow-100 rounded-full items-center justify-center"
                disabled={isRecording}
              >
                <Text className="text-lg">😊</Text>
              </TouchableOpacity>

              {/* Voice/Send Button */}
              {isRecording ? (
                <TouchableOpacity
                  onPress={stopRecording}
                  className="w-12 h-12 bg-red-500 rounded-full items-center justify-center"
                  style={{
                    shadowColor: '#EF4444',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 6,
                    elevation: 6,
                  }}
                >
                  <Text className="text-white text-lg">📤</Text>
                </TouchableOpacity>
              ) : value.trim() ? (
                <TouchableOpacity
                  onPress={handleSend}
                  className="w-12 h-12 bg-blue-600 rounded-full items-center justify-center"
                  style={{
                    shadowColor: '#3B82F6',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 6,
                    elevation: 6,
                  }}
                >
                  <Text className="text-white text-lg">🚀</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={startRecording}
                  className="w-12 h-12 bg-blue-600 rounded-full items-center justify-center"
                  style={{
                    shadowColor: '#3B82F6',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 6,
                    elevation: 6,
                  }}
                >
                  <Text className="text-white text-lg">🎤</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Animated.View>
      </View>
    );
  },
);
