import React, { useEffect, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';
import { useQuickActions } from '../../contexts/QuickActionsContext';
import { NavigationService } from '../../services/NavigationService';
import { PromptInput } from '../../components/voice/PromptInput';
import { HomeHeader } from '../../components/home/HomeHeader';
import { AIBrainVisualization } from '../../components/home/AIBrainVisualization';
import { GreetingSection } from '../../components/home/GreetingSection';
import { AICapabilitiesShowcase } from '../../components/home/AICapabilitiesShowcase';
import { PerformanceStats } from '../../components/home/PerformanceStats';
import { VoiceCommandCTA } from '../../components/home/VoiceCommandCTA';
import {
  useHomeScreenAnimations,
  createAICapabilities,
  createPerformanceStats,
  CAPABILITY_CYCLE_INTERVAL,
} from '../../utils/homeScreenUtils';

const HomeScreen = () => {
  const { theme } = useTheme();
  const { createTask, createProject, searchTasks, showNotification } = useQuickActions();
  const insets = useSafeAreaInsets();
  const [activeCapability, setActiveCapability] = useState(0);

  const { values, startAnimations } = useHomeScreenAnimations();
  const aiCapabilities = createAICapabilities(theme);
  const performanceStats = createPerformanceStats(theme);

  // Start animations on mount
  useEffect(() => {
    startAnimations();
  }, []);

  // Auto-cycle capabilities
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCapability(prev => (prev + 1) % aiCapabilities.length);
    }, CAPABILITY_CYCLE_INTERVAL);
    return () => clearInterval(interval);
  }, [aiCapabilities.length]);

  // Animated styles
  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: values.logoScale.value },
      { rotate: `${values.logoRotation.value}deg` },
    ],
  }));

  const promptAnimatedStyle = useAnimatedStyle(() => ({
    opacity: values.promptOpacity.value,
  }));

  // Event handlers with AI command processing
  const handleSendMessage = (text: string) => {
    console.log('Sending text message:', text);
    processAICommand(text);
  };

  const handleSendRecording = (audioUri: string, transcript?: string) => {
    console.log('Sending audio recording:', audioUri);
    console.log('Voice transcript:', transcript);
    if (transcript) {
      processAICommand(transcript);
    }
  };

  const processAICommand = (command: string) => {
    const lowercaseCommand = command.toLowerCase();
    
    if (lowercaseCommand.includes('create task') || lowercaseCommand.includes('new task')) {
      createTask();
      showNotification('Creating a new task for you!', 'success');
    } else if (lowercaseCommand.includes('create project') || lowercaseCommand.includes('new project')) {
      createProject();
      showNotification('Opening project creation form!', 'success');
    } else if (lowercaseCommand.includes('search task') || lowercaseCommand.includes('find task')) {
      const searchTerm = command.replace(/(search|find)\s+(task|tasks?)\s*/i, '').trim();
      if (searchTerm) {
        searchTasks(searchTerm);
      } else {
        searchTasks('');
      }
    } else if (lowercaseCommand.includes('show analytics') || lowercaseCommand.includes('analytics')) {
      NavigationService.navigateToAnalytics();
      showNotification('Opening analytics dashboard!', 'success');
    } else if (lowercaseCommand.includes('show activity') || lowercaseCommand.includes('activity')) {
      NavigationService.navigateToActivity();
      showNotification('Opening activity feed!', 'success');
    } else if (lowercaseCommand.includes('my profile') || lowercaseCommand.includes('profile')) {
      NavigationService.navigateToProfile();
      showNotification('Opening your profile!', 'success');
    } else {
      showNotification(`Processing: "${command}" - Feature coming soon!`, 'info');
    }
  };

  const handleAttachFile = (file: any) => {
    console.log('File attached:', file);
    showNotification('File attached successfully!', 'success');
  };

  const handleAttachImage = (image: any) => {
    console.log('Image attached:', image);
    showNotification('Image attached successfully!', 'success');
  };

  const handleUserPress = () => {
    NavigationService.navigateToProfile();
  };

  const handleVoiceCTAPress = () => {
    showNotification('Try saying: "Create a new task" or "Show my analytics"', 'info');
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingTop: insets.top,
      }}
    >
      {/* Header */}
      <HomeHeader
        headerOpacity={values.headerOpacity}
        headerTranslateY={values.headerTranslateY}
        logoAnimatedStyle={logoAnimatedStyle}
        onUserPress={handleUserPress}
      />

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* AI Brain Visualization */}
        <AIBrainVisualization
          aiPulse={values.aiPulse}
          aiCapabilities={aiCapabilities}
        />

        {/* Greeting Section */}
        <GreetingSection
          greetingOpacity={values.greetingOpacity}
          greetingScale={values.greetingScale}
        />

        {/* AI Capabilities Showcase */}
        <AICapabilitiesShowcase
          capabilitiesOpacity={values.capabilitiesOpacity}
          capabilitiesTranslateY={values.capabilitiesTranslateY}
          aiCapabilities={aiCapabilities}
          activeCapability={activeCapability}
          onCapabilityPress={setActiveCapability}
        />

        {/* Performance Stats */}
        <PerformanceStats
          statsOpacity={values.statsOpacity}
          stats={performanceStats}
        />

        {/* Voice Command CTA */}
        <VoiceCommandCTA
          promptOpacity={values.promptOpacity}
          onPress={handleVoiceCTAPress}
        />
      </ScrollView>

      {/* Bottom Prompt Input */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: theme.colors.background,
            paddingHorizontal: 16,
            paddingVertical: 12,
            paddingBottom: insets.bottom + 12,
            borderTopWidth: 1,
            borderTopColor: theme.colors.border,
          },
          promptAnimatedStyle,
        ]}
      >
        <PromptInput
          onSendMessage={handleSendMessage}
          onSendRecording={handleSendRecording}
          onAttachFile={handleAttachFile}
          onAttachImage={handleAttachImage}
          placeholder="Tell Javier what you need..."
          maxLines={4}
          disabled={false}
        />
      </Animated.View>
    </View>
  );
};

export default HomeScreen;