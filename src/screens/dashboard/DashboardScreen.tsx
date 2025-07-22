import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import { SafeAreaWrapper } from '../../components/common/SafeAreaWrapper';
import { VoiceButton } from '../../components/voice/VoiceButton';
import { VoiceIndicator } from '../../components/voice/VoiceIndicator';
import { Colors } from '../../utils/colors';
import { QUICK_ACTIONS } from '../../utils/constants';
import { QuickActionCard } from '../../components/dashboard/QuickActions';

interface DashboardScreenProps {
  navigation: any;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [prompt, setPrompt] = useState('');

  const headerOpacity = useSharedValue(0);
  const actionsOpacity = useSharedValue(0);
  const promptOpacity = useSharedValue(0);

  React.useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 800 });
    actionsOpacity.value = withDelay(200, withTiming(1, { duration: 800 }));
    promptOpacity.value = withDelay(400, withTiming(1, { duration: 800 }));
  }, []);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  const actionsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: actionsOpacity.value,
  }));

  const promptAnimatedStyle = useAnimatedStyle(() => ({
    opacity: promptOpacity.value,
  }));

  const handleVoicePress = () => {
    setIsListening(!isListening);
    if (!isListening) {
      // Start voice recognition
      startVoiceRecognition();
    } else {
      // Stop voice recognition
      stopVoiceRecognition();
    }
  };

  const startVoiceRecognition = async () => {
    try {
      // Simulate voice recognition
      setTimeout(() => {
        setTranscript('Create a channel for E-commerce Website Project');
        setIsListening(false);
        processVoiceCommand();
      }, 3000);
    } catch (error) {
      console.error('Voice recognition error:', error);
      setIsListening(false);
    }
  };

  const stopVoiceRecognition = () => {
    setTranscript('');
  };

  const processVoiceCommand = () => {
    // Process the voice command and execute actions
    setTimeout(() => {
      setTranscript('');
      // Navigate to project management or show results
    }, 2000);
  };

  const handleQuickAction = (actionId: string) => {
    console.log('Quick action pressed:', actionId);
    // Handle quick action based on ID
  };

  const handlePromptSubmit = () => {
    if (prompt.trim()) {
      console.log('Prompt submitted:', prompt);
      setPrompt('');
      // Process text prompt
    }
  };

  return (
    <SafeAreaWrapper backgroundColor={Colors.background}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View style={[{ paddingTop: 20 }, headerAnimatedStyle]}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 32,
            }}
          >
            <View>
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: '700',
                  color: Colors.primary,
                  marginBottom: 8,
                }}
              >
                Hello Javier!
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  color: Colors.text.secondary,
                  lineHeight: 24,
                }}
              >
                Give any command from creating a{'\n'}document to scheduling a{'\n'}meeting.
              </Text>
            </View>
            
            {/* Status indicators */}
            <View style={{ alignItems: 'center' }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: Colors.gray[200],
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 12,
                }}
              >
                <Text style={{ fontSize: 20 }}>⏰</Text>
              </View>
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: Colors.online,
                }}
              />
            </View>
          </View>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View style={[actionsAnimatedStyle]}>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              marginBottom: 40,
            }}
          >
            {QUICK_ACTIONS.map((action, index) => (
              <QuickActionCard
                key={action.id}
                title={action.title}
                onPress={() => handleQuickAction(action.id)}
                delay={index * 100}
              />
            ))}
          </View>
        </Animated.View>

        {/* Voice Recognition Area */}
        <View style={{ alignItems: 'center', marginVertical: 40 }}>
          <VoiceButton
            isListening={isListening}
            onPress={handleVoicePress}
            size={100}
          />
          <VoiceIndicator isListening={isListening} transcript={transcript} />
        </View>

        {/* Command Prompt */}
        <Animated.View style={[promptAnimatedStyle]}>
          <View
            style={{
              backgroundColor: Colors.surface,
              borderRadius: 24,
              borderWidth: 1,
              borderColor: Colors.gray[200],
              paddingHorizontal: 20,
              paddingVertical: 4,
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 40,
            }}
          >
            <TextInput
              style={{
                flex: 1,
                paddingVertical: 16,
                fontSize: 16,
                color: Colors.text.primary,
              }}
              placeholder="Enter a prompt here"
              placeholderTextColor={Colors.text.tertiary}
              value={prompt}
              onChangeText={setPrompt}
              onSubmitEditing={handlePromptSubmit}
              returnKeyType="send"
            />
            <TouchableOpacity
              onPress={handlePromptSubmit}
              style={{
                padding: 8,
                marginLeft: 8,
              }}
            >
              <View
                style={{
                  width: 24,
                  height: 24,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 16, color: Colors.primary }}>🎤</Text>
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaWrapper>
  );
};