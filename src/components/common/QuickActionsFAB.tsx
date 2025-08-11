import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Dimensions, Text, Platform } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withSequence,
  interpolate,
  runOnJS,
  interpolateColor,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
// import { BlurView } from '@react-native-community/blur'; // Commented out - not available
import Icon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../contexts/ThemeContext';
import { useQuickActions } from '../../contexts/QuickActionsContext';
import { NavigationService } from '../../services/NavigationService';

const { width } = Dimensions.get('window');

interface QuickActionButton {
  id: string;
  icon: string;
  iconType?: 'feather' | 'material' | 'material-community';
  label: string;
  subtitle?: string;
  gradient: string[];
  action: () => void;
  vibrant?: boolean;
}

export const QuickActionsFAB: React.FC = () => {
  const { theme } = useTheme();
  const { createTask, createProject, showNotification, executeQuickAction } = useQuickActions();
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  
  // Animation values
  const expandAnimation = useSharedValue(0);
  const rotationAnimation = useSharedValue(0);
  const pulseAnimation = useSharedValue(0);
  const backdropOpacity = useSharedValue(0);

  const quickActions: QuickActionButton[] = [
    {
      id: 'create_task',
      icon: 'lightbulb-on',
      iconType: 'material-community',
      label: 'New Task',
      subtitle: 'Create & organize',
      gradient: [theme.colors.primary, '#8B5CF6'],
      action: () => {
        createTask();
        showNotification('Opening task creation form...', 'success');
      },
      vibrant: true,
    },
    {
      id: 'create_project',
      icon: 'rocket-launch',
      iconType: 'material-community',
      label: 'New Project',
      subtitle: 'Start something big',
      gradient: [theme.colors.accent, '#F59E0B'],
      action: () => {
        createProject();
        showNotification('Opening project creation form...', 'success');
      },
      vibrant: true,
    },
    {
      id: 'ai_assistant',
      icon: 'brain',
      iconType: 'material-community',
      label: 'AI Assistant',
      subtitle: 'Smart suggestions',
      gradient: ['#10B981', '#06B6D4'],
      action: () => {
        NavigationService.navigateToHome();
        setTimeout(() => {
          showNotification('🤖 AI Assistant activated! Use voice commands or ask questions.', 'success');
        }, 500);
      },
      vibrant: true,
    },
    {
      id: 'voice_command',
      icon: 'microphone',
      iconType: 'material-community',
      label: 'Voice Control',
      subtitle: 'Speak to create',
      gradient: ['#EF4444', '#F97316'],
      action: () => {
        // Simulate voice recognition starting
        showNotification('🎤 Voice recognition started. Say your command!', 'info');
        
        // Simulate processing voice command after 2 seconds
        setTimeout(() => {
          const commands = [
            'create task',
            'new project', 
            'show analytics',
            'view tasks'
          ];
          const randomCommand = commands[Math.floor(Math.random() * commands.length)];
          
          // Process the simulated command
          if (randomCommand === 'create task') {
            createTask();
            showNotification('Voice: "Create Task" - Opening task creator!', 'success');
          } else if (randomCommand === 'new project') {
            createProject();
            showNotification('Voice: "New Project" - Opening project creator!', 'success');
          } else if (randomCommand === 'show analytics') {
            NavigationService.navigateToAnalytics();
            showNotification('Voice: "Show Analytics" - Opening analytics!', 'success');
          } else {
            NavigationService.navigateToTasks();
            showNotification('Voice: "View Tasks" - Opening tasks!', 'success');
          }
        }, 2000);
      },
      vibrant: true,
    },
    {
      id: 'quick_search',
      icon: 'magnify',
      iconType: 'material-community',
      label: 'Smart Search',
      subtitle: 'Find anything fast',
      gradient: ['#8B5CF6', '#EC4899'],
      action: () => {
        NavigationService.navigateToTasks();
        setTimeout(() => {
          showNotification('🔍 Smart search activated! Search across all your tasks and projects.', 'info');
        }, 300);
      },
      vibrant: true,
    },
  ];

  // Pulse animation for main FAB
  useEffect(() => {
    pulseAnimation.value = withSequence(
      withTiming(1, { duration: 1000 }),
      withTiming(0, { duration: 1000 })
    );
    
    const interval = setInterval(() => {
      pulseAnimation.value = withSequence(
        withTiming(1, { duration: 1000 }),
        withTiming(0, { duration: 1000 })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const toggleFAB = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    
    expandAnimation.value = withSpring(newState ? 1 : 0, {
      damping: 18,
      stiffness: 120,
    });
    
    rotationAnimation.value = withTiming(newState ? 1 : 0, {
      duration: 400,
    });

    backdropOpacity.value = withTiming(newState ? 1 : 0, {
      duration: 300,
    });
  };

  const handleActionPress = (action: QuickActionButton) => {
    setActiveAction(action.id);
    
    // Visual feedback
    setTimeout(() => {
      action.action();
      setActiveAction(null);
      toggleFAB(); // Close the FAB after action
    }, 150);
  };

  // Animated styles
  const fabAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${interpolate(rotationAnimation.value, [0, 1], [0, 135])}deg` },
      { scale: interpolate(rotationAnimation.value, [0, 1], [1, 1.1]) },
    ],
  }));

  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulseAnimation.value, [0, 1], [0.4, 1]),
    transform: [
      { scale: interpolate(pulseAnimation.value, [0, 1], [1, 1.3]) },
    ],
  }));

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const renderIcon = (action: QuickActionButton, size: number = 24, color: string = theme.colors.text.onPrimary) => {
    switch (action.iconType) {
      case 'material':
        return <MaterialIcon name={action.icon} size={size} color={color} />;
      case 'material-community':
        return <MaterialCommunityIcon name={action.icon} size={size} color={color} />;
      default:
        return <Icon name={action.icon} size={size} color={color} />;
    }
  };

  const ActionButton: React.FC<{ action: QuickActionButton; index: number }> = ({
    action,
    index,
  }) => {
    const isActive = activeAction === action.id;
    
    const buttonAnimatedStyle = useAnimatedStyle(() => {
      const angle = (index * 60) - 30; // Spread actions in an arc
      const radius = 90;
      
      const translateX = interpolate(
        expandAnimation.value,
        [0, 1],
        [0, Math.cos((angle * Math.PI) / 180) * radius]
      );
      const translateY = interpolate(
        expandAnimation.value,
        [0, 1],
        [0, Math.sin((angle * Math.PI) / 180) * radius]
      );
      
      const scale = interpolate(expandAnimation.value, [0, 1], [0, isActive ? 1.1 : 1]);
      const opacity = interpolate(expandAnimation.value, [0, 1], [0, 1]);

      return {
        transform: [
          { translateX: translateX },
          { translateY: translateY },
          { scale: scale }
        ],
        opacity,
      };
    });

    return (
      <Animated.View
        style={[
          {
            position: 'absolute',
            bottom: 0,
            right: 0,
            alignItems: 'center',
          },
          buttonAnimatedStyle,
        ]}
      >
        <View style={{ alignItems: 'center' }}>
          {/* Action Button */}
          <TouchableOpacity
            onPress={() => handleActionPress(action)}
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              shadowColor: action.gradient[0],
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.4,
              shadowRadius: 12,
              elevation: 12,
              marginBottom: 8,
            }}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={action.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                width: '100%',
                height: '100%',
                borderRadius: 28,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 2,
                borderColor: 'rgba(255, 255, 255, 0.2)',
              }}
            >
              {renderIcon(action, 26)}
            </LinearGradient>
          </TouchableOpacity>

          {/* Label Card */}
          <View
            style={{
              backgroundColor: theme.colors.surface,
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 12,
              shadowColor: theme.colors.shadows.neutral,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 8,
              borderWidth: 1,
              borderColor: theme.colors.border,
              minWidth: 100,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: 'bold',
                color: theme.colors.text.primary,
                textAlign: 'center',
              }}
            >
              {action.label}
            </Text>
            {action.subtitle && (
              <Text
                style={{
                  fontSize: 10,
                  color: theme.colors.text.secondary,
                  textAlign: 'center',
                  marginTop: 2,
                }}
              >
                {action.subtitle}
              </Text>
            )}
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <>
      {/* Backdrop with blur effect */}
      {isExpanded && (
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
            },
            backdropAnimatedStyle,
          ]}
        >
          <TouchableOpacity
            onPress={toggleFAB}
            style={{ flex: 1 }}
            activeOpacity={1}
          />
        </Animated.View>
      )}

      <View
        style={{
          position: 'absolute',
          bottom: 100, // Above tab bar
          right: 20,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Action Buttons */}
        {quickActions.map((action, index) => (
          <ActionButton key={action.id} action={action} index={index} />
        ))}

        {/* Main FAB with pulse effect */}
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Pulse Ring */}
          {!isExpanded && (
            <Animated.View
              style={[
                {
                  position: 'absolute',
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  borderWidth: 2,
                  borderColor: theme.colors.primary + '40',
                },
                pulseAnimatedStyle,
              ]}
            />
          )}

          {/* Main FAB Button */}
          <TouchableOpacity
            onPress={toggleFAB}
            activeOpacity={0.85}
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              shadowColor: theme.colors.primary,
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.4,
              shadowRadius: 16,
              elevation: 16,
            }}
          >
            <LinearGradient
              colors={isExpanded 
                ? [theme.colors.error, theme.colors.warning] 
                : theme.colors.gradients.primary
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                width: '100%',
                height: '100%',
                borderRadius: 32,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 3,
                borderColor: 'rgba(255, 255, 255, 0.2)',
              }}
            >
              <Animated.View style={fabAnimatedStyle}>
                <MaterialIcon
                  name={isExpanded ? "close" : "add"}
                  size={28}
                  color={theme.colors.text.onPrimary}
                />
              </Animated.View>
            </LinearGradient>
          </TouchableOpacity>

          {/* AI Indicator */}
          {!isExpanded && (
            <View
              style={{
                position: 'absolute',
                top: -4,
                right: -4,
                width: 20,
                height: 20,
                borderRadius: 10,
                backgroundColor: theme.colors.success,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 2,
                borderColor: theme.colors.surface,
                shadowColor: theme.colors.success,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.8,
                shadowRadius: 4,
                elevation: 8,
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: 'bold',
                  color: theme.colors.text.onPrimary,
                }}
              >
                AI
              </Text>
            </View>
          )}
        </View>
      </View>
    </>
  );
};