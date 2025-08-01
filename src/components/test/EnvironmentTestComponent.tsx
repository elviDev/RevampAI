import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { openAIService } from '../../services/ai/OpenAIService';
import { envSetupStatus } from '../../utils/envSetup';

const EnvironmentTestComponent: React.FC = () => {
  const [setupStatus, setSetupStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Run environment setup check
    setSetupStatus(envSetupStatus);
  }, []);

  const testOpenAIConnection = async () => {
    setIsLoading(true);
    try {
      const isHealthy = await openAIService.checkHealth();
      Alert.alert(
        'OpenAI Connection Test',
        isHealthy ? '✅ Connection successful!' : '❌ Connection failed'
      );
    } catch (error) {
      Alert.alert('Error', `Connection failed: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testTextEnhancement = async () => {
    setIsLoading(true);
    try {
      const testText = "hey whats up how r u";
      const enhanced = await openAIService.enhanceText(testText);
      Alert.alert(
        'Text Enhancement Test',
        `Original: "${testText}"\n\nEnhanced: "${enhanced}"`
      );
    } catch (error) {
      Alert.alert('Error', `Enhancement failed: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 p-4 bg-gray-50">
      <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
        <Text className="text-xl font-bold mb-4">🔧 Environment Setup Status</Text>
        
        {setupStatus && (
          <View className="space-y-2">
            <View className="flex-row items-center">
              <Text className={`mr-2 ${setupStatus.envImport ? 'text-green-600' : 'text-red-600'}`}>
                {setupStatus.envImport ? '✅' : '❌'}
              </Text>
              <Text>@env module loading</Text>
            </View>
            
            <View className="flex-row items-center">
              <Text className={`mr-2 ${setupStatus.fallbackConfig ? 'text-green-600' : 'text-red-600'}`}>
                {setupStatus.fallbackConfig ? '✅' : '❌'}
              </Text>
              <Text>Fallback config</Text>
            </View>
            
            <View className="flex-row items-center">
              <Text className={`mr-2 ${setupStatus.keyPresent ? 'text-green-600' : 'text-red-600'}`}>
                {setupStatus.keyPresent ? '✅' : '❌'}
              </Text>
              <Text>API Key present</Text>
            </View>
            
            <View className="flex-row items-center">
              <Text className={`mr-2 ${setupStatus.keyValid ? 'text-green-600' : 'text-red-600'}`}>
                {setupStatus.keyValid ? '✅' : '❌'}
              </Text>
              <Text>Key format valid</Text>
            </View>
          </View>
        )}
      </View>

      <View className="bg-white rounded-lg p-4 shadow-sm">
        <Text className="text-xl font-bold mb-4">🧪 OpenAI Tests</Text>
        
        <TouchableOpacity
          onPress={testOpenAIConnection}
          disabled={isLoading || !setupStatus?.keyValid}
          className={`p-3 rounded-lg mb-3 ${
            setupStatus?.keyValid && !isLoading
              ? 'bg-blue-500'
              : 'bg-gray-300'
          }`}
        >
          <Text className="text-white text-center font-medium">
            {isLoading ? 'Testing...' : 'Test Connection'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={testTextEnhancement}
          disabled={isLoading || !setupStatus?.keyValid}
          className={`p-3 rounded-lg ${
            setupStatus?.keyValid && !isLoading
              ? 'bg-green-500'
              : 'bg-gray-300'
          }`}
        >
          <Text className="text-white text-center font-medium">
            {isLoading ? 'Testing...' : 'Test Text Enhancement'}
          </Text>
        </TouchableOpacity>

        {!setupStatus?.keyValid && (
          <Text className="mt-3 text-red-600 text-sm text-center">
            Fix environment setup before testing
          </Text>
        )}
      </View>
    </ScrollView>
  );
};

export default EnvironmentTestComponent;
