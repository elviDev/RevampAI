import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import Voice from '../services/voice/CustomVoice';
import { debugVoiceSystem, logVoiceModuleStatus } from '../utils/debugVoice';

export const VoiceTestComponent: React.FC = () => {
  const [voiceAvailable, setVoiceAvailable] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  useEffect(() => {
    // Debug voice system
    debugVoiceSystem();
    logVoiceModuleStatus();
    
    // Set up voice
    const setupVoice = async () => {
      try {
        const available = Voice.isModuleAvailable();
        setVoiceAvailable(available);
        
        if (available) {
          Voice.onSpeechStart = () => {
            console.log('Speech started');
            setIsListening(true);
          };
          
          Voice.onSpeechEnd = () => {
            console.log('Speech ended');
            setIsListening(false);
          };
          
          Voice.onSpeechResults = (event) => {
            console.log('Speech results:', event);
            setResults(event.value || []);
            setIsListening(false);
          };
          
          Voice.onSpeechError = (error) => {
            console.log('Speech error:', error);
            setIsListening(false);
            Alert.alert('Voice Error', error.message || 'Unknown error');
          };
        }
      } catch (error) {
        console.error('Voice setup error:', error);
        setVoiceAvailable(false);
      }
    };
    
    setupVoice();
    
    return () => {
      try {
        if (Voice.isModuleAvailable()) {
          Voice.destroy().catch(console.warn);
        }
      } catch (error) {
        console.warn('Voice cleanup error:', error);
      }
    };
  }, []);

  const startListening = async () => {
    try {
      if (!voiceAvailable) {
        Alert.alert('Voice Not Available', 'Voice recognition is not available on this device');
        return;
      }
      
      setResults([]);
      await Voice.start('en-US');
      console.log('Started listening');
    } catch (error) {
      console.error('Start listening error:', error);
      Alert.alert('Error', 'Failed to start voice recognition');
    }
  };

  const stopListening = async () => {
    try {
      await Voice.stop();
      console.log('Stopped listening');
    } catch (error) {
      console.error('Stop listening error:', error);
    }
  };

  return (
    <View className="p-4 bg-gray-100 m-4 rounded-lg">
      <Text className="text-lg font-bold mb-2">Voice Test</Text>
      
      <View className="mb-4">
        <Text className={`text-sm ${voiceAvailable ? 'text-green-600' : 'text-red-600'}`}>
          Voice Module: {voiceAvailable ? '✅ Available' : '❌ Not Available'}
        </Text>
        <Text className={`text-sm ${isListening ? 'text-blue-600' : 'text-gray-600'}`}>
          Status: {isListening ? '🎤 Listening' : '⏸️ Stopped'}
        </Text>
      </View>
      
      <View className="flex-row space-x-2 mb-4">
        <TouchableOpacity
          onPress={startListening}
          disabled={!voiceAvailable || isListening}
          className={`px-4 py-2 rounded ${
            voiceAvailable && !isListening 
              ? 'bg-blue-500' 
              : 'bg-gray-400'
          }`}
        >
          <Text className="text-white font-medium">Start</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={stopListening}
          disabled={!isListening}
          className={`px-4 py-2 rounded ${
            isListening ? 'bg-red-500' : 'bg-gray-400'
          }`}
        >
          <Text className="text-white font-medium">Stop</Text>
        </TouchableOpacity>
      </View>
      
      {results.length > 0 && (
        <View>
          <Text className="text-sm font-medium mb-2">Results:</Text>
          {results.map((result, index) => (
            <Text key={index} className="text-blue-600 text-sm">
              {index + 1}. {result}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
};
