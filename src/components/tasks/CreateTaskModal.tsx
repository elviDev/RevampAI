import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  StatusBar,
} from 'react-native';
// import { BlurView } from '@react-native-community/blur'; // Commented out - not available
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeInRight,
  ZoomIn,
  BounceIn,
  SlideInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../contexts/ThemeContext';
import {
  Task,
  TaskPriority,
  TaskCategory,
  TaskStatus,
  TaskAssignee,
} from '../../types/task.types';
import { getPriorityColor, getCategoryIcon } from '../../utils/taskUtils';

const { width, height } = Dimensions.get('window');

interface CreateTaskModalProps {
  visible: boolean;
  onClose: () => void;
  newTask: {
    title: string;
    description: string;
    priority: TaskPriority;
    category: TaskCategory;
    status: TaskStatus;
    dueDate: Date;
    estimatedHours: number;
    tags: string[];
    assignees: TaskAssignee[];
  };
  onTaskChange: (task: {
    title: string;
    description: string;
    priority: TaskPriority;
    category: TaskCategory;
    status: TaskStatus;
    dueDate: Date;
    estimatedHours: number;
    tags: string[];
    assignees: TaskAssignee[];
  }) => void;
  onCreateTask: () => void;
  onShowAssigneeModal: () => void;
  newTaskTag: string;
  onNewTaskTagChange: (tag: string) => void;
  onAddTag: () => void;
  onRemoveTag: (tag: string) => void;
  onToggleAssignee: (assignee: TaskAssignee) => void;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  visible,
  onClose,
  newTask,
  onTaskChange,
  onCreateTask,
  onShowAssigneeModal,
  newTaskTag,
  onNewTaskTagChange,
  onAddTag,
  onRemoveTag,
  onToggleAssignee,
}) => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [isAIMode, setIsAIMode] = useState(false);
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([]);
  
  // Animation values
  const backgroundOpacity = useSharedValue(0);
  const modalScale = useSharedValue(0.8);
  const sparkleAnimation = useSharedValue(0);
  const aiPulse = useSharedValue(0);
  
  const steps = [
    { title: 'Basic Info', icon: 'edit-3', color: theme.colors.primary },
    { title: 'Details', icon: 'settings', color: theme.colors.accent },
    { title: 'Team', icon: 'users', color: theme.colors.success },
  ];

  const setNewTask = (updater: (prev: typeof newTask) => typeof newTask) => {
    onTaskChange(updater(newTask));
  };

  // AI-powered title suggestions
  const generateTitleSuggestions = (category: TaskCategory) => {
    const suggestions: Record<TaskCategory, string[]> = {
      development: [
        'Implement user authentication system',
        'Optimize database performance',
        'Create responsive mobile interface',
        'Integrate payment processing',
      ],
      design: [
        'Design user onboarding flow',
        'Create brand style guide',
        'Redesign dashboard interface',
        'Prototype mobile navigation',
      ],
      research: [
        'Conduct user experience research',
        'Analyze competitor features',
        'Research new technologies',
        'Validate product assumptions',
      ],
      meeting: [
        'Product planning session',
        'Weekly team standup',
        'Client requirements review',
        'Sprint retrospective meeting',
      ],
      documentation: [
        'Update API documentation',
        'Create user manual',
        'Document deployment process',
        'Write technical specifications',
      ],
      testing: [
        'Perform user acceptance testing',
        'Execute regression test suite',
        'Conduct security audit',
        'Test mobile compatibility',
      ],
      deployment: [
        'Deploy to production environment',
        'Set up monitoring system',
        'Configure backup strategy',
        'Update deployment pipeline',
      ],
    };
    setTitleSuggestions(suggestions[category] || []);
  };

  useEffect(() => {
    if (visible) {
      backgroundOpacity.value = withTiming(1, { duration: 300 });
      modalScale.value = withSpring(1, { damping: 15, stiffness: 100 });
      sparkleAnimation.value = withSequence(
        withTiming(1, { duration: 1000 }),
        withTiming(0, { duration: 1000 })
      );
      aiPulse.value = withSequence(
        withTiming(1, { duration: 2000 }),
        withTiming(0, { duration: 2000 })
      );
    } else {
      backgroundOpacity.value = withTiming(0, { duration: 200 });
      modalScale.value = withTiming(0.8, { duration: 200 });
    }
  }, [visible]);

  const backgroundAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backgroundOpacity.value,
  }));

  const modalAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: modalScale.value }],
  }));

  const sparkleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(sparkleAnimation.value, [0, 1], [0.3, 1]),
    transform: [
      { scale: interpolate(sparkleAnimation.value, [0, 1], [0.8, 1.2]) },
      { rotate: `${interpolate(sparkleAnimation.value, [0, 1], [0, 360])}deg` },
    ],
  }));

  const aiPulseAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(aiPulse.value, [0, 1], [0.4, 1]),
    transform: [{ scale: interpolate(aiPulse.value, [0, 1], [0.95, 1.05]) }],
  }));

  return (
    <Modal
      visible={visible}
      animationType="none"
      presentationStyle="overFullScreen"
      transparent
      onRequestClose={onClose}
    >
      <StatusBar backgroundColor="transparent" translucent />
      
      {/* Animated Background */}
      <Animated.View 
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
          },
          backgroundAnimatedStyle
        ]}
      />

      {/* Floating Sparkles */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: height * 0.1,
            right: 30,
            width: 6,
            height: 6,
            backgroundColor: theme.colors.primary,
            borderRadius: 3,
          },
          sparkleAnimatedStyle
        ]}
      />
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: height * 0.2,
            left: 40,
            width: 4,
            height: 4,
            backgroundColor: theme.colors.accent,
            borderRadius: 2,
          },
          sparkleAnimatedStyle
        ]}
      />
      <Animated.View
        style={[
          {
            position: 'absolute',
            bottom: height * 0.3,
            right: 50,
            width: 8,
            height: 8,
            backgroundColor: theme.colors.success,
            borderRadius: 4,
          },
          sparkleAnimatedStyle
        ]}
      />

      {/* Main Modal Container */}
      <Animated.View 
        style={[
          {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingTop: insets.top + 20,
            paddingBottom: insets.bottom + 20,
          },
          modalAnimatedStyle
        ]}
      >
        <View
          style={{
            width: width - 40,
            maxHeight: height * 0.9,
            backgroundColor: theme.colors.surface,
            borderRadius: 24,
            shadowColor: theme.colors.shadows.neutral,
            shadowOffset: { width: 0, height: 20 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 20,
          }}
        >
          {/* Glassmorphism Header */}
          <View style={{ borderRadius: 24, overflow: 'hidden' }}>
            <LinearGradient
              colors={theme.colors.gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                paddingHorizontal: 20,
                paddingVertical: 24,
                position: 'relative',
              }}
            >
              {/* AI Pulse Effect */}
              <Animated.View
                style={[
                  {
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    width: 8,
                    height: 8,
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    borderRadius: 4,
                  },
                  aiPulseAnimatedStyle
                ]}
              />

              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity
                      onPress={onClose}
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 22,
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 16,
                      }}
                      activeOpacity={0.8}
                    >
                      <Feather name="x" size={20} color={theme.colors.text.onPrimary} />
                    </TouchableOpacity>
                    
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          color: theme.colors.text.onPrimary,
                          fontSize: 24,
                          fontWeight: 'bold',
                          letterSpacing: 0.5,
                        }}
                      >
                        ✨ AI Task Creator
                      </Text>
                      <Text
                        style={{
                          color: theme.colors.text.onPrimary,
                          fontSize: 14,
                          opacity: 0.9,
                          marginTop: 4,
                        }}
                      >
                        Let intelligence guide your productivity
                      </Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => setIsAIMode(!isAIMode)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 16,
                    backgroundColor: isAIMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  }}
                  activeOpacity={0.8}
                >
                  <Text
                    style={{
                      color: theme.colors.text.onPrimary,
                      fontSize: 12,
                      fontWeight: '600',
                    }}
                  >
                    {isAIMode ? '🤖 AI ON' : '🎯 Manual'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Progress Steps */}
              <View 
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  marginTop: 20,
                  paddingHorizontal: 20,
                }}
              >
                {steps.map((step, index) => (
                  <View key={index} style={{ flex: 1, alignItems: 'center' }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        width: '100%',
                      }}
                    >
                      {/* Step Circle */}
                      <View
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 16,
                          backgroundColor: index <= currentStep 
                            ? 'rgba(255, 255, 255, 0.9)' 
                            : 'rgba(255, 255, 255, 0.3)',
                          alignItems: 'center',
                          justifyContent: 'center',
                          shadowColor: index <= currentStep ? theme.colors.text.onPrimary : 'transparent',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.3,
                          shadowRadius: 4,
                          elevation: index <= currentStep ? 4 : 0,
                        }}
                      >
                        {index < currentStep ? (
                          <Feather 
                            name="check" 
                            size={16} 
                            color={theme.colors.primary} 
                          />
                        ) : (
                          <Feather 
                            name={step.icon} 
                            size={16} 
                            color={index <= currentStep ? theme.colors.primary : theme.colors.text.onPrimary} 
                          />
                        )}
                      </View>

                      {/* Connection Line */}
                      {index < steps.length - 1 && (
                        <View
                          style={{
                            flex: 1,
                            height: 2,
                            backgroundColor: index < currentStep 
                              ? 'rgba(255, 255, 255, 0.8)' 
                              : 'rgba(255, 255, 255, 0.3)',
                            marginHorizontal: 8,
                            borderRadius: 1,
                          }}
                        />
                      )}
                    </View>
                    
                    <Text
                      style={{
                        color: theme.colors.text.onPrimary,
                        fontSize: 10,
                        fontWeight: '500',
                        marginTop: 6,
                        opacity: index <= currentStep ? 1 : 0.7,
                      }}
                    >
                      {step.title}
                    </Text>
                  </View>
                ))}
              </View>
            </LinearGradient>
          </View>

          {/* Content Area */}
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
            >
              {currentStep === 0 && (
                <Animated.View
                  entering={FadeInRight.duration(500)}
                  style={{ padding: 20 }}
                >
                  {/* Task Title Section with AI */}
                  <View style={{ marginBottom: 24 }}>
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: 16,
                    }}>
                      <View style={{
                        width: 40,
                        height: 40,
                        backgroundColor: `${theme.colors.primary}20`,
                        borderRadius: 20,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 12,
                      }}>
                        <MaterialCommunityIcon 
                          name="brain" 
                          size={20} 
                          color={theme.colors.primary} 
                        />
                      </View>
                      <Text style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: theme.colors.text.primary,
                        flex: 1,
                      }}>
                        What needs to be accomplished?
                      </Text>
                    </View>

                    <View style={{
                      backgroundColor: theme.colors.background,
                      borderRadius: 16,
                      padding: 16,
                      borderWidth: 1,
                      borderColor: newTask.title ? theme.colors.primary + '40' : theme.colors.border,
                      shadowColor: theme.colors.shadows.neutral,
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.1,
                      shadowRadius: 8,
                      elevation: 4,
                    }}>
                      <TextInput
                        placeholder="Describe your task with natural language..."
                        value={newTask.title}
                        onChangeText={text => {
                          setNewTask(prev => ({ ...prev, title: text }));
                          if (isAIMode && text.length > 5) {
                            generateTitleSuggestions(newTask.category);
                          }
                        }}
                        style={{
                          fontSize: 16,
                          color: theme.colors.text.primary,
                          minHeight: 50,
                          textAlignVertical: 'top',
                        }}
                        placeholderTextColor={theme.colors.text.secondary}
                        multiline
                      />
                    </View>

                    {/* AI Suggestions */}
                    {isAIMode && titleSuggestions.length > 0 && (
                      <Animated.View
                        entering={SlideInRight.duration(400)}
                        style={{
                          marginTop: 16,
                          backgroundColor: `${theme.colors.primary}10`,
                          borderRadius: 12,
                          padding: 16,
                          borderWidth: 1,
                          borderColor: `${theme.colors.primary}20`,
                        }}
                      >
                        <View style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          marginBottom: 12,
                        }}>
                          <MaterialIcon name="auto-awesome" size={16} color={theme.colors.primary} />
                          <Text style={{
                            fontSize: 14,
                            fontWeight: '600',
                            color: theme.colors.primary,
                            marginLeft: 8,
                          }}>
                            AI Suggestions
                          </Text>
                        </View>
                        {titleSuggestions.slice(0, 3).map((suggestion, index) => (
                          <TouchableOpacity
                            key={index}
                            onPress={() => setNewTask(prev => ({ ...prev, title: suggestion }))}
                            style={{
                              paddingVertical: 8,
                              paddingHorizontal: 12,
                              backgroundColor: theme.colors.background,
                              borderRadius: 8,
                              marginBottom: 8,
                              borderWidth: 1,
                              borderColor: theme.colors.border,
                            }}
                          >
                            <Text style={{
                              fontSize: 14,
                              color: theme.colors.text.primary,
                            }}>
                              {suggestion}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </Animated.View>
                    )}
                  </View>

                  {/* Category Selection with Beautiful Icons */}
                  <View style={{ marginBottom: 24 }}>
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: 16,
                    }}>
                      <View style={{
                        width: 40,
                        height: 40,
                        backgroundColor: `${theme.colors.accent}20`,
                        borderRadius: 20,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 12,
                      }}>
                        <MaterialIcon 
                          name="category" 
                          size={20} 
                          color={theme.colors.accent} 
                        />
                      </View>
                      <Text style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: theme.colors.text.primary,
                      }}>
                        Choose a category
                      </Text>
                    </View>

                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{ paddingHorizontal: 4 }}
                    >
                      {([
                        'development',
                        'design', 
                        'research',
                        'meeting',
                        'documentation',
                        'testing',
                        'deployment',
                      ] as TaskCategory[]).map((category, index) => (
                        <Animated.View
                          key={category}
                          entering={ZoomIn.delay(index * 50).duration(400)}
                          style={{ marginRight: 12 }}
                        >
                          <TouchableOpacity
                            onPress={() => {
                              setNewTask(prev => ({ ...prev, category }));
                              generateTitleSuggestions(category);
                            }}
                            style={{
                              alignItems: 'center',
                              padding: 16,
                              borderRadius: 16,
                              width: 100,
                              backgroundColor: newTask.category === category 
                                ? theme.colors.primary 
                                : theme.colors.background,
                              borderWidth: 2,
                              borderColor: newTask.category === category 
                                ? theme.colors.primary 
                                : theme.colors.border,
                              shadowColor: newTask.category === category 
                                ? theme.colors.primary 
                                : 'transparent',
                              shadowOffset: { width: 0, height: 4 },
                              shadowOpacity: 0.3,
                              shadowRadius: 8,
                              elevation: newTask.category === category ? 6 : 0,
                            }}
                          >
                            <Feather
                              name={getCategoryIcon(category)}
                              size={24}
                              color={newTask.category === category 
                                ? theme.colors.text.onPrimary 
                                : theme.colors.text.secondary}
                            />
                            <Text
                              style={{
                                fontSize: 12,
                                fontWeight: '600',
                                color: newTask.category === category 
                                  ? theme.colors.text.onPrimary 
                                  : theme.colors.text.primary,
                                textAlign: 'center',
                                marginTop: 8,
                              }}
                            >
                              {category.charAt(0).toUpperCase() + category.slice(1)}
                            </Text>
                          </TouchableOpacity>
                        </Animated.View>
                      ))}
                    </ScrollView>
                  </View>

                  {/* Priority Selection with Vibrant Colors */}
                  <View>
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: 16,
                    }}>
                      <View style={{
                        width: 40,
                        height: 40,
                        backgroundColor: `${theme.colors.warning}20`,
                        borderRadius: 20,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 12,
                      }}>
                        <MaterialIcon 
                          name="priority-high" 
                          size={20} 
                          color={theme.colors.warning} 
                        />
                      </View>
                      <Text style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: theme.colors.text.primary,
                      }}>
                        Set priority level
                      </Text>
                    </View>

                    <View style={{
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      gap: 12,
                    }}>
                      {(['low', 'medium', 'high', 'urgent'] as TaskPriority[]).map((priority, index) => (
                        <Animated.View
                          key={priority}
                          entering={BounceIn.delay(index * 100).duration(600)}
                          style={{ flex: 1, minWidth: '45%' }}
                        >
                          <TouchableOpacity
                            onPress={() => setNewTask(prev => ({ ...prev, priority }))}
                            style={{
                              paddingVertical: 16,
                              paddingHorizontal: 12,
                              borderRadius: 16,
                              backgroundColor: newTask.priority === priority 
                                ? getPriorityColor(priority) 
                                : theme.colors.background,
                              borderWidth: 2,
                              borderColor: newTask.priority === priority 
                                ? getPriorityColor(priority) 
                                : theme.colors.border,
                              shadowColor: newTask.priority === priority 
                                ? getPriorityColor(priority) 
                                : 'transparent',
                              shadowOffset: { width: 0, height: 4 },
                              shadowOpacity: 0.3,
                              shadowRadius: 8,
                              elevation: newTask.priority === priority ? 6 : 0,
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <View
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: newTask.priority === priority 
                                  ? theme.colors.text.onPrimary 
                                  : getPriorityColor(priority),
                                marginRight: 8,
                              }}
                            />
                            <Text
                              style={{
                                fontSize: 14,
                                fontWeight: '600',
                                color: newTask.priority === priority 
                                  ? theme.colors.text.onPrimary 
                                  : theme.colors.text.primary,
                              }}
                            >
                              {priority.charAt(0).toUpperCase() + priority.slice(1)}
                            </Text>
                          </TouchableOpacity>
                        </Animated.View>
                      ))}
                    </View>
                  </View>
                </Animated.View>
              )}

              {/* Step 2: Details */}
              {currentStep === 1 && (
                <Animated.View
                  entering={FadeInRight.duration(500)}
                  style={{ padding: 20 }}
                >
                  {/* Description Section */}
                  <View style={{ marginBottom: 24 }}>
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: 16,
                    }}>
                      <View style={{
                        width: 40,
                        height: 40,
                        backgroundColor: `${theme.colors.primary}20`,
                        borderRadius: 20,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 12,
                      }}>
                        <MaterialIcon name="description" size={20} color={theme.colors.primary} />
                      </View>
                      <Text style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: theme.colors.text.primary,
                      }}>
                        Add detailed description
                      </Text>
                    </View>

                    <View style={{
                      backgroundColor: theme.colors.background,
                      borderRadius: 16,
                      padding: 16,
                      borderWidth: 1,
                      borderColor: newTask.description ? theme.colors.primary + '40' : theme.colors.border,
                      shadowColor: theme.colors.shadows.neutral,
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.1,
                      shadowRadius: 8,
                      elevation: 4,
                    }}>
                      <TextInput
                        placeholder="Provide detailed requirements, specifications, or notes..."
                        value={newTask.description}
                        onChangeText={text => setNewTask(prev => ({ ...prev, description: text }))}
                        style={{
                          fontSize: 14,
                          color: theme.colors.text.primary,
                          minHeight: 100,
                          textAlignVertical: 'top',
                        }}
                        placeholderTextColor={theme.colors.text.secondary}
                        multiline
                        numberOfLines={5}
                      />
                    </View>
                  </View>

                  {/* Due Date Section */}
                  <View style={{ marginBottom: 24 }}>
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: 16,
                    }}>
                      <View style={{
                        width: 40,
                        height: 40,
                        backgroundColor: `${theme.colors.accent}20`,
                        borderRadius: 20,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 12,
                      }}>
                        <MaterialIcon name="event" size={20} color={theme.colors.accent} />
                      </View>
                      <Text style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: theme.colors.text.primary,
                      }}>
                        When is this due?
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={{
                        backgroundColor: theme.colors.background,
                        borderRadius: 16,
                        padding: 16,
                        borderWidth: 1,
                        borderColor: theme.colors.border,
                        flexDirection: 'row',
                        alignItems: 'center',
                        shadowColor: theme.colors.shadows.neutral,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.1,
                        shadowRadius: 8,
                        elevation: 4,
                      }}
                    >
                      <MaterialIcon name="today" size={20} color={theme.colors.accent} style={{ marginRight: 12 }} />
                      <Text style={{
                        fontSize: 16,
                        color: theme.colors.text.primary,
                        flex: 1,
                      }}>
                        {newTask.dueDate.toLocaleDateString('en-US', { 
                          weekday: 'long',
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </Text>
                      <MaterialIcon name="keyboard-arrow-right" size={20} color={theme.colors.text.secondary} />
                    </TouchableOpacity>
                  </View>

                  {/* Estimated Hours */}
                  <View style={{ marginBottom: 24 }}>
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: 16,
                    }}>
                      <View style={{
                        width: 40,
                        height: 40,
                        backgroundColor: `${theme.colors.success}20`,
                        borderRadius: 20,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 12,
                      }}>
                        <MaterialIcon name="schedule" size={20} color={theme.colors.success} />
                      </View>
                      <Text style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: theme.colors.text.primary,
                        flex: 1,
                      }}>
                        Estimated effort
                      </Text>
                    </View>

                    <View style={{
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      gap: 12,
                    }}>
                      {[1, 2, 4, 8, 16, 24].map((hours, index) => (
                        <Animated.View
                          key={hours}
                          entering={ZoomIn.delay(index * 50).duration(400)}
                          style={{ flex: 1, minWidth: '30%' }}
                        >
                          <TouchableOpacity
                            onPress={() => setNewTask(prev => ({ ...prev, estimatedHours: hours }))}
                            style={{
                              paddingVertical: 12,
                              paddingHorizontal: 16,
                              borderRadius: 12,
                              backgroundColor: newTask.estimatedHours === hours 
                                ? theme.colors.success 
                                : theme.colors.background,
                              borderWidth: 2,
                              borderColor: newTask.estimatedHours === hours 
                                ? theme.colors.success 
                                : theme.colors.border,
                              alignItems: 'center',
                              shadowColor: newTask.estimatedHours === hours 
                                ? theme.colors.success 
                                : 'transparent',
                              shadowOffset: { width: 0, height: 4 },
                              shadowOpacity: 0.3,
                              shadowRadius: 8,
                              elevation: newTask.estimatedHours === hours ? 4 : 0,
                            }}
                          >
                            <Text style={{
                              fontSize: 16,
                              fontWeight: 'bold',
                              color: newTask.estimatedHours === hours 
                                ? theme.colors.text.onPrimary 
                                : theme.colors.text.primary,
                            }}>
                              {hours}h
                            </Text>
                            <Text style={{
                              fontSize: 11,
                              color: newTask.estimatedHours === hours 
                                ? theme.colors.text.onPrimary 
                                : theme.colors.text.secondary,
                              marginTop: 2,
                            }}>
                              {hours <= 4 ? 'Quick' : hours <= 8 ? 'Medium' : hours <= 16 ? 'Large' : 'Epic'}
                            </Text>
                          </TouchableOpacity>
                        </Animated.View>
                      ))}
                    </View>
                  </View>

                  {/* Tags Section */}
                  <View>
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: 16,
                    }}>
                      <View style={{
                        width: 40,
                        height: 40,
                        backgroundColor: `${theme.colors.warning}20`,
                        borderRadius: 20,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 12,
                      }}>
                        <MaterialIcon name="label" size={20} color={theme.colors.warning} />
                      </View>
                      <Text style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: theme.colors.text.primary,
                        flex: 1,
                      }}>
                        Add tags for organization
                      </Text>
                    </View>

                    <View style={{
                      backgroundColor: theme.colors.background,
                      borderRadius: 16,
                      padding: 16,
                      borderWidth: 1,
                      borderColor: theme.colors.border,
                      shadowColor: theme.colors.shadows.neutral,
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.1,
                      shadowRadius: 8,
                      elevation: 4,
                    }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                        <TextInput
                          placeholder="Add tag..."
                          value={newTaskTag}
                          onChangeText={onNewTaskTagChange}
                          style={{
                            flex: 1,
                            fontSize: 14,
                            color: theme.colors.text.primary,
                            marginRight: 12,
                          }}
                          placeholderTextColor={theme.colors.text.secondary}
                          onSubmitEditing={onAddTag}
                        />
                        <TouchableOpacity
                          onPress={onAddTag}
                          style={{
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                            backgroundColor: theme.colors.primary,
                            borderRadius: 8,
                          }}
                        >
                          <Text style={{
                            fontSize: 12,
                            fontWeight: '600',
                            color: theme.colors.text.onPrimary,
                          }}>
                            Add
                          </Text>
                        </TouchableOpacity>
                      </View>

                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                        {newTask.tags.map((tag, index) => (
                          <Animated.View
                            key={index}
                            entering={BounceIn.duration(300)}
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              backgroundColor: theme.colors.primary + '20',
                              paddingHorizontal: 12,
                              paddingVertical: 6,
                              borderRadius: 16,
                              borderWidth: 1,
                              borderColor: theme.colors.primary + '40',
                            }}
                          >
                            <Text style={{
                              fontSize: 12,
                              color: theme.colors.primary,
                              fontWeight: '500',
                              marginRight: 6,
                            }}>
                              {tag}
                            </Text>
                            <TouchableOpacity
                              onPress={() => onRemoveTag(tag)}
                              style={{
                                width: 16,
                                height: 16,
                                borderRadius: 8,
                                backgroundColor: theme.colors.primary + '30',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Feather name="x" size={10} color={theme.colors.primary} />
                            </TouchableOpacity>
                          </Animated.View>
                        ))}
                      </View>
                    </View>
                  </View>
                </Animated.View>
              )}

              {/* Step 3: Team Assignment */}
              {currentStep === 2 && (
                <Animated.View
                  entering={FadeInRight.duration(500)}
                  style={{ padding: 20 }}
                >
                  {/* Assignees Section */}
                  <View style={{ marginBottom: 24 }}>
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: 16,
                    }}>
                      <View style={{
                        width: 40,
                        height: 40,
                        backgroundColor: `${theme.colors.success}20`,
                        borderRadius: 20,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 12,
                      }}>
                        <MaterialIcon name="group" size={20} color={theme.colors.success} />
                      </View>
                      <Text style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: theme.colors.text.primary,
                        flex: 1,
                      }}>
                        Who will work on this?
                      </Text>
                    </View>

                    {/* Current Assignees */}
                    {newTask.assignees.length > 0 && (
                      <View style={{ marginBottom: 16 }}>
                        <Text style={{
                          fontSize: 14,
                          fontWeight: '600',
                          color: theme.colors.text.secondary,
                          marginBottom: 12,
                        }}>
                          Assigned to:
                        </Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                          {newTask.assignees.map((assignee, index) => (
                            <Animated.View
                              key={assignee.id}
                              entering={ZoomIn.delay(index * 50).duration(400)}
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: theme.colors.background,
                                paddingHorizontal: 12,
                                paddingVertical: 8,
                                borderRadius: 20,
                                borderWidth: 1,
                                borderColor: theme.colors.border,
                                shadowColor: theme.colors.shadows.neutral,
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.1,
                                shadowRadius: 4,
                                elevation: 2,
                              }}
                            >
                              <LinearGradient
                                colors={[theme.colors.primary, theme.colors.accent]}
                                style={{
                                  width: 24,
                                  height: 24,
                                  borderRadius: 12,
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  marginRight: 8,
                                }}
                              >
                                <Text style={{
                                  fontSize: 10,
                                  fontWeight: 'bold',
                                  color: theme.colors.text.onPrimary,
                                }}>
                                  {assignee.avatar || assignee.name.charAt(0)}
                                </Text>
                              </LinearGradient>
                              <Text style={{
                                fontSize: 12,
                                fontWeight: '600',
                                color: theme.colors.text.primary,
                                marginRight: 6,
                              }}>
                                {assignee.name}
                              </Text>
                              <TouchableOpacity
                                onPress={() => onToggleAssignee(assignee)}
                                style={{
                                  width: 16,
                                  height: 16,
                                  borderRadius: 8,
                                  backgroundColor: theme.colors.error + '20',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <Feather name="x" size={10} color={theme.colors.error} />
                              </TouchableOpacity>
                            </Animated.View>
                          ))}
                        </View>
                      </View>
                    )}

                    <TouchableOpacity
                      onPress={onShowAssigneeModal}
                      style={{
                        backgroundColor: theme.colors.background,
                        borderRadius: 16,
                        padding: 16,
                        borderWidth: 2,
                        borderColor: theme.colors.primary + '40',
                        borderStyle: 'dashed',
                        alignItems: 'center',
                        shadowColor: theme.colors.shadows.neutral,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.1,
                        shadowRadius: 8,
                        elevation: 4,
                      }}
                    >
                      <MaterialIcon name="add-circle-outline" size={32} color={theme.colors.primary} style={{ marginBottom: 8 }} />
                      <Text style={{
                        fontSize: 14,
                        fontWeight: '600',
                        color: theme.colors.primary,
                        textAlign: 'center',
                      }}>
                        Add Team Member
                      </Text>
                      <Text style={{
                        fontSize: 12,
                        color: theme.colors.text.secondary,
                        textAlign: 'center',
                        marginTop: 4,
                      }}>
                        Tap to select from your team
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* AI Recommendations */}
                  {isAIMode && (
                    <Animated.View
                      entering={FadeInUp.duration(500)}
                      style={{
                        backgroundColor: `${theme.colors.accent}10`,
                        borderRadius: 16,
                        padding: 16,
                        borderWidth: 1,
                        borderColor: `${theme.colors.accent}20`,
                      }}
                    >
                      <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginBottom: 12,
                      }}>
                        <MaterialCommunityIcon name="brain" size={16} color={theme.colors.accent} />
                        <Text style={{
                          fontSize: 14,
                          fontWeight: '600',
                          color: theme.colors.accent,
                          marginLeft: 8,
                        }}>
                          AI Team Recommendations
                        </Text>
                      </View>
                      <Text style={{
                        fontSize: 13,
                        color: theme.colors.text.secondary,
                        lineHeight: 20,
                      }}>
                        • Based on task category "{newTask.category}", consider assigning to team members with relevant expertise{"\n"}
                        • Priority level "{newTask.priority}" suggests involving senior team members{"\n"}
                        • Estimated {newTask.estimatedHours} hours indicates this {newTask.estimatedHours <= 4 ? 'can be handled by one person' : 'may require multiple contributors'}
                      </Text>
                    </Animated.View>
                  )}
                </Animated.View>
              )}
            </ScrollView>

            {/* Action Footer */}
            <View style={{
              paddingHorizontal: 20,
              paddingVertical: 16,
              borderTopWidth: 1,
              borderTopColor: theme.colors.border,
              backgroundColor: theme.colors.surface,
            }}>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                {currentStep > 0 && (
                  <TouchableOpacity
                    onPress={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                    style={{
                      flex: 1,
                      paddingVertical: 16,
                      borderRadius: 16,
                      backgroundColor: theme.colors.background,
                      borderWidth: 2,
                      borderColor: theme.colors.border,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Feather name="arrow-left" size={18} color={theme.colors.text.secondary} />
                      <Text style={{
                        fontSize: 16,
                        fontWeight: '600',
                        color: theme.colors.text.secondary,
                        marginLeft: 8,
                      }}>
                        Back
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  onPress={() => {
                    if (currentStep < steps.length - 1) {
                      setCurrentStep(prev => prev + 1);
                    } else {
                      onCreateTask();
                    }
                  }}
                  disabled={currentStep === 0 && (!newTask.title || !newTask.category || !newTask.priority)}
                  style={{
                    flex: 2,
                    borderRadius: 16,
                    shadowColor: theme.colors.primary,
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.3,
                    shadowRadius: 12,
                    elevation: 8,
                  }}
                >
                  <LinearGradient
                    colors={theme.colors.gradients.primary}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      paddingVertical: 16,
                      borderRadius: 16,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      {currentStep < steps.length - 1 ? (
                        <>
                          <Text style={{
                            fontSize: 16,
                            fontWeight: 'bold',
                            color: theme.colors.text.onPrimary,
                            marginRight: 8,
                          }}>
                            Continue
                          </Text>
                          <Feather name="arrow-right" size={18} color={theme.colors.text.onPrimary} />
                        </>
                      ) : (
                        <>
                          <MaterialIcon name="auto-awesome" size={20} color={theme.colors.text.onPrimary} />
                          <Text style={{
                            fontSize: 16,
                            fontWeight: 'bold',
                            color: theme.colors.text.onPrimary,
                            marginLeft: 8,
                          }}>
                            Create Task
                          </Text>
                        </>
                      )}
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Animated.View>
    </Modal>
  );
};
