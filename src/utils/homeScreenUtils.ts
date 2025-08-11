import {
  useSharedValue,
  withTiming,
  withSpring,
  withDelay,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';

// Types
export interface AICapability {
  icon: string;
  iconFamily: 'Feather' | 'MaterialIcons' | 'MaterialCommunityIcons';
  title: string;
  description: string;
  voiceCommand: string;
  color: string;
}

export interface PerformanceStat {
  value: string;
  label: string;
  color: string;
}

// Animation constants
export const ANIMATION_DURATIONS = {
  header: 800,
  logo: 8000,
  greeting: 600,
  aiPulse: 2000,
  capabilities: 800,
  stats: 600,
  prompt: 600,
} as const;

export const ANIMATION_DELAYS = {
  logo: 200,
  greeting: 400,
  capabilities: 600,
  stats: 800,
  prompt: 1000,
} as const;

export const CAPABILITY_CYCLE_INTERVAL = 4000;

// AI Capabilities data factory
export const createAICapabilities = (theme: any): AICapability[] => [
  {
    icon: 'brain',
    iconFamily: 'MaterialCommunityIcons',
    title: 'AI Project Planning',
    description: 'Generate comprehensive project roadmaps with AI analysis',
    voiceCommand: '"Create a project plan for mobile app development"',
    color: theme.colors.primary,
  },
  {
    icon: 'robot',
    iconFamily: 'MaterialCommunityIcons',
    title: 'Smart Task Automation',
    description: 'Automate repetitive tasks and optimize workflows',
    voiceCommand: '"Automate my daily standup meeting preparation"',
    color: theme.colors.accent,
  },
  {
    icon: 'chart-line',
    iconFamily: 'MaterialCommunityIcons',
    title: 'Predictive Analytics',
    description: 'Forecast project outcomes and resource requirements',
    voiceCommand: '"Predict timeline for Q1 deliverables"',
    color: theme.colors.success,
  },
  {
    icon: 'voice',
    iconFamily: 'MaterialCommunityIcons',
    title: 'Voice Command Center',
    description: 'Control everything with natural language commands',
    voiceCommand: '"Schedule team meeting for tomorrow 2 PM"',
    color: theme.colors.warning,
  },
];

// Performance stats data factory
export const createPerformanceStats = (theme: any): PerformanceStat[] => [
  { value: '85%', label: 'Time Saved', color: theme.colors.success },
  { value: '10x', label: 'Faster Planning', color: theme.colors.primary },
  { value: '99%', label: 'Accuracy', color: theme.colors.accent },
];

// Animation hooks
export const useHomeScreenAnimations = () => {
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-50);
  const logoScale = useSharedValue(0);
  const logoRotation = useSharedValue(0);
  const greetingOpacity = useSharedValue(0);
  const greetingScale = useSharedValue(0.8);
  const aiPulse = useSharedValue(0);
  const capabilitiesOpacity = useSharedValue(0);
  const capabilitiesTranslateY = useSharedValue(100);
  const statsOpacity = useSharedValue(0);
  const promptOpacity = useSharedValue(0);

  const startAnimations = () => {
    // Header animation
    headerOpacity.value = withTiming(1, { duration: ANIMATION_DURATIONS.header });
    headerTranslateY.value = withSpring(0, { damping: 15 });

    // Logo animation with bounce
    logoScale.value = withDelay(ANIMATION_DELAYS.logo, withSpring(1, { damping: 12 }));
    logoRotation.value = withRepeat(
      withTiming(360, { duration: ANIMATION_DURATIONS.logo, easing: Easing.linear }),
      -1,
      false
    );

    // Greeting animation
    greetingOpacity.value = withDelay(ANIMATION_DELAYS.greeting, withTiming(1, { duration: ANIMATION_DURATIONS.greeting }));
    greetingScale.value = withDelay(ANIMATION_DELAYS.greeting, withSpring(1, { damping: 12 }));

    // AI pulse animation
    aiPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: ANIMATION_DURATIONS.aiPulse }),
        withTiming(0, { duration: ANIMATION_DURATIONS.aiPulse })
      ),
      -1,
      false
    );

    // Capabilities animation
    capabilitiesOpacity.value = withDelay(ANIMATION_DELAYS.capabilities, withTiming(1, { duration: ANIMATION_DURATIONS.capabilities }));
    capabilitiesTranslateY.value = withDelay(ANIMATION_DELAYS.capabilities, withSpring(0, { damping: 15 }));

    // Stats animation
    statsOpacity.value = withDelay(ANIMATION_DELAYS.stats, withTiming(1, { duration: ANIMATION_DURATIONS.stats }));

    // Prompt animation
    promptOpacity.value = withDelay(ANIMATION_DELAYS.prompt, withTiming(1, { duration: ANIMATION_DURATIONS.prompt }));
  };

  return {
    values: {
      headerOpacity,
      headerTranslateY,
      logoScale,
      logoRotation,
      greetingOpacity,
      greetingScale,
      aiPulse,
      capabilitiesOpacity,
      capabilitiesTranslateY,
      statsOpacity,
      promptOpacity,
    },
    startAnimations,
  };
};

// Utility functions
export const getIconComponent = (iconFamily: AICapability['iconFamily']) => {
  // This will be imported where needed to avoid circular dependencies
  return iconFamily;
};

export const formatCapabilityColor = (color: string, opacity: string = '20'): string => {
  return color + opacity;
};

export const getOrbitalIconPosition = (index: number): any => ({
  transform: [
    { rotate: `${index * 90}deg` },
    { translateX: 100 },
    { rotate: `-${index * 90}deg` },
  ],
});