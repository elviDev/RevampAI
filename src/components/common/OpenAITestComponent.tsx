import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { openAIService } from '../../services/ai';

const OpenAITestComponent: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);

  const testTextEnhancement = async () => {
    setIsLoading(true);
    try {
      const testText = "hey how r u doing today? hope ur well";
      const enhanced = await openAIService.enhanceText(testText);
      Alert.alert('Enhancement Result', `Original: ${testText}\n\nEnhanced: ${enhanced}`);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to enhance text');
    } finally {
      setIsLoading(false);
    }
  };

  const testTranscriptionCorrection = async () => {
    setIsLoading(true);
    try {
      const testTranscript = "hello how are you doing today i hope you are well";
      const corrected = await openAIService.correctTranscription(testTranscript);
      Alert.alert('Correction Result', `Original: ${testTranscript}\n\nCorrected: ${corrected}`);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to correct transcription');
    } finally {
      setIsLoading(false);
    }
  };

  const testHealthCheck = async () => {
    setIsLoading(true);
    try {
      const isHealthy = await openAIService.checkHealth();
      Alert.alert('Health Check', isHealthy ? 'OpenAI service is working!' : 'OpenAI service is not available');
    } catch (error) {
      Alert.alert('Error', 'Health check failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="p-4 bg-white rounded-lg shadow-sm">
      <Text className="text-lg font-semibold mb-4">OpenAI Integration Test</Text>
      
      <TouchableOpacity 
        onPress={testHealthCheck}
        disabled={isLoading}
        className="bg-blue-500 p-3 rounded-lg mb-2"
      >
        <Text className="text-white text-center font-medium">
          {isLoading ? 'Testing...' : 'Test Health Check'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={testTextEnhancement}
        disabled={isLoading}
        className="bg-green-500 p-3 rounded-lg mb-2"
      >
        <Text className="text-white text-center font-medium">
          {isLoading ? 'Enhancing...' : 'Test Text Enhancement'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={testTranscriptionCorrection}
        disabled={isLoading}
        className="bg-purple-500 p-3 rounded-lg"
      >
        <Text className="text-white text-center font-medium">
          {isLoading ? 'Correcting...' : 'Test Transcription Correction'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default OpenAITestComponent;
