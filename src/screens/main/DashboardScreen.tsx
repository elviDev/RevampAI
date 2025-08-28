import React from 'react';
import { View, Text, Alert, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { PromptInput } from '../../components/voice/PromptInput';

const DashboardScreen = () => {
  const insets = useSafeAreaInsets();

  const handleSendMessage = (text: string) => {
    console.log('Sending text message:', text);
    // Handle text message
  };

  const handleSendRecording = (audioUri: string, transcript?: string) => {
    console.log('Sending audio recording:', audioUri);
    console.log('Voice transcript:', transcript);
    // Handle audio message with transcript
  };

  const handleAttachFile = (file: any) => {
    console.log('File attached:', file);
    Alert.alert('File Attached', `${file.name} has been attached`);
  };

  const handleAttachImage = (image: any) => {
    console.log('Image attached:', image);
    Alert.alert('Image Attached', `Image has been attached`);
  };

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {/* Top Right Avatar */}
      <View
        className="absolute top-0 right-4 z-10"
        style={{ top: insets.top + 16 }}
      >
        <TouchableOpacity
          onPress={() => console.log('User profile')}
          className="w-10 h-10 bg-blue-500 rounded-full items-center justify-center"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <Text className="text-white font-semibold text-sm">JL</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-1 justify-center items-center px-6">
        <View style={{ marginBottom: 64 }}>
          <MaskedView
            style={{ height: 80, width: 350 }}
            maskElement={
              <View
                style={{
                  backgroundColor: 'transparent',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: 1,
                }}
              >
                <Text
                  style={{
                    fontSize: 36,
                    fontWeight: 'bold',
                    textAlign: 'center',
                    backgroundColor: 'transparent',
                    color: 'black',
                  }}
                >
                  Hola, Javier López
                </Text>
              </View>
            }
          >
            <LinearGradient
              colors={['#3933C6', '#A05FFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ flex: 1, height: 80 }}
            />
          </MaskedView>
        </View>
      </View>

      <View className="px-4 pb-4">
        {/* Quick Action Buttons */}
        <View className="flex-row justify-center mb-2 gap-2">
          <TouchableOpacity
            className="bg-gray-200 rounded-full px-5 py-3"
            onPress={() => console.log('Create a channel')}
          >
            <Text className="text-gray-700 text-sm font-medium">
              Create a channel
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-gray-200 rounded-full px-5 py-3"
            onPress={() => console.log('Add user')}
          >
            <Text className="text-gray-700 text-sm font-medium">Add user</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-gray-200 rounded-full px-5 py-3"
            onPress={() => console.log('Create task')}
          >
            <Text className="text-gray-700 text-sm font-medium">
              Create task
            </Text>
          </TouchableOpacity>
        </View>
        <PromptInput
          onSendMessage={handleSendMessage}
          onSendRecording={handleSendRecording}
          onAttachFile={handleAttachFile}
          onAttachImage={handleAttachImage}
          placeholder="Ask TT"
          maxLines={6}
          disabled={false}
        />
      </View>
    </View>
  );
};

export default DashboardScreen;
