import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeInRight,
  SlideInRight,
  ZoomIn,
  BounceIn,
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  withSpring,
  withSequence,
  withTiming,
  interpolate,
  interpolateColor,
  runOnJS,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
// import { BlurView } from '@react-native-community/blur'; // Commented out - not available
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../contexts/ThemeContext';
import { useQuickActions } from '../../contexts/QuickActionsContext';
import {
  Task,
  TaskStatus,
  TaskPriority,
  TaskCategory,
  TaskAssignee,
} from '../../types/task.types';
import { getPriorityColor, getCategoryIcon } from '../../utils/taskUtils';

const { width, height } = Dimensions.get('window');

interface TaskDetailScreenProps {
  navigation: any;
  route: {
    params: {
      taskId: string;
    };
  };
}

export const TaskDetailScreen: React.FC<TaskDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { showNotification } = useQuickActions();
  const { taskId } = route.params;

  // State
  const [task, setTask] = useState<Task | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAIMode, setIsAIMode] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [newComment, setNewComment] = useState('');
  const [showSubtasks, setShowSubtasks] = useState(true);
  const [progress, setProgress] = useState(0);

  // Animation values
  const scrollY = useSharedValue(0);
  const headerOpacity = useSharedValue(1);
  const aiPulse = useSharedValue(0);
  const progressAnimation = useSharedValue(0);
  const sparkleAnimation = useSharedValue(0);

  // Mock data (replace with actual API call)
  useEffect(() => {
    loadTaskDetails();
    startAnimations();
  }, []);

  const startAnimations = () => {
    // AI pulse animation
    aiPulse.value = withSequence(
      withTiming(1, { duration: 2000 }),
      withTiming(0, { duration: 2000 })
    );

    // Sparkle animation
    sparkleAnimation.value = withSequence(
      withTiming(1, { duration: 1000 }),
      withTiming(0, { duration: 1000 })
    );

    // Repeat animations
    const interval = setInterval(() => {
      aiPulse.value = withSequence(
        withTiming(1, { duration: 2000 }),
        withTiming(0, { duration: 2000 })
      );
      sparkleAnimation.value = withSequence(
        withTiming(1, { duration: 1000 }),
        withTiming(0, { duration: 1000 })
      );
    }, 4000);

    return () => clearInterval(interval);
  };

  const loadTaskDetails = () => {
    // Mock task data - in real app, fetch from API
    const mockTask: Task = {
      id: taskId,
      title: 'Implement AI-powered task recommendations',
      description: 'Create an intelligent system that analyzes user behavior and suggests optimal task priorities, deadlines, and assignments based on historical data and current workload.',
      status: 'in_progress' as TaskStatus,
      priority: 'high' as TaskPriority,
      category: 'development' as TaskCategory,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
      assignees: [
        { 
          id: '1', 
          name: 'Alex Chen', 
          avatar: 'AC', 
          role: 'AI Engineer',
          email: 'alex@company.com'
        },
        { 
          id: '2', 
          name: 'Sarah Kim', 
          avatar: 'SK', 
          role: 'UX Designer',
          email: 'sarah@company.com'
        }
      ] as TaskAssignee[],
      reporter: { 
        id: '3', 
        name: 'John Doe', 
        avatar: 'JD', 
        role: 'Project Manager',
        email: 'john@company.com'
      },
      channelId: '1',
      channelName: 'AI Development',
      tags: ['AI', 'Machine Learning', 'UX', 'Priority'],
      estimatedHours: 24,
      actualHours: 16,
      progress: 60,
      subtasks: [
        { id: '1', title: 'Research existing solutions', completed: true },
        { id: '2', title: 'Design system architecture', completed: true },
        { id: '3', title: 'Implement core algorithm', completed: true },
        { id: '4', title: 'Build user interface', completed: false },
        { id: '5', title: 'Testing and optimization', completed: false },
      ],
      comments: [],
      attachments: [],
      dependencies: [],
      watchers: [],
    };

    setTask(mockTask);
    setProgress(mockTask.progress || 0);
    progressAnimation.value = withSpring((mockTask.progress || 0) / 100, {
      damping: 15,
      stiffness: 100,
    });

    // Generate AI suggestions
    generateAISuggestions(mockTask);
  };

  const generateAISuggestions = (taskData: Task) => {
    const suggestions = [
      'Based on your team\'s velocity, consider extending the deadline by 2 days',
      'Similar tasks took 20% longer on average - adjust time estimate',
      'Add a code review subtask to maintain quality standards',
      'Consider breaking this into smaller, more manageable tasks',
      'Team member Sarah has expertise in this area - assign as reviewer',
    ];
    setAiSuggestions(suggestions.slice(0, 3));
  };

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Animated styles
  const headerAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [0, 100], [0, 1]);
    return {
      opacity: opacity,
      backgroundColor: interpolateColor(
        scrollY.value,
        [0, 100],
        ['transparent', theme.colors.surface]
      ),
    };
  });

  const heroAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(scrollY.value, [0, 300], [0, -50]);
    const scale = interpolate(scrollY.value, [0, 300], [1, 0.9]);
    return {
      transform: [{ translateY }, { scale }],
    };
  });

  const aiPulseAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(aiPulse.value, [0, 1], [0.4, 1]),
    transform: [{ scale: interpolate(aiPulse.value, [0, 1], [0.95, 1.05]) }],
  }));

  const sparkleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(sparkleAnimation.value, [0, 1], [0.3, 1]),
    transform: [
      { scale: interpolate(sparkleAnimation.value, [0, 1], [0.8, 1.2]) },
      { rotate: `${interpolate(sparkleAnimation.value, [0, 1], [0, 360])}deg` },
    ],
  }));

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${interpolate(progressAnimation.value, [0, 1], [0, 100])}%`,
  }));

  if (!task) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar backgroundColor="transparent" translucent />
      
      {/* Floating Sparkles */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: height * 0.15,
            right: 30,
            width: 6,
            height: 6,
            backgroundColor: theme.colors.primary,
            borderRadius: 3,
            zIndex: 1000,
          },
          sparkleAnimatedStyle
        ]}
      />
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: height * 0.25,
            left: 40,
            width: 4,
            height: 4,
            backgroundColor: theme.colors.accent,
            borderRadius: 2,
            zIndex: 1000,
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
            zIndex: 1000,
          },
          sparkleAnimatedStyle
        ]}
      />

      {/* Animated Header */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: insets.top + 60,
            paddingTop: insets.top,
            paddingHorizontal: 20,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 1000,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border + '20',
          },
          headerAnimatedStyle,
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: theme.colors.surface + '90',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: theme.colors.shadows.neutral,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <Feather name="arrow-left" size={20} color={theme.colors.text.primary} />
        </TouchableOpacity>

        <Text
          style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: theme.colors.text.primary,
            flex: 1,
            textAlign: 'center',
            marginHorizontal: 16,
          }}
          numberOfLines={1}
        >
          Task Details
        </Text>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity
            onPress={() => setIsAIMode(!isAIMode)}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: isAIMode ? theme.colors.primary : theme.colors.surface + '90',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: theme.colors.shadows.neutral,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <MaterialCommunityIcon 
              name="brain" 
              size={20} 
              color={isAIMode ? theme.colors.text.onPrimary : theme.colors.text.primary} 
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setIsEditMode(!isEditMode)}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: isEditMode ? theme.colors.accent : theme.colors.surface + '90',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: theme.colors.shadows.neutral,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Feather 
              name={isEditMode ? "check" : "edit-3"} 
              size={20} 
              color={isEditMode ? theme.colors.text.onPrimary : theme.colors.text.primary} 
            />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <Animated.ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <Animated.View
          style={[
            {
              paddingTop: insets.top + 80,
              paddingHorizontal: 20,
              paddingBottom: 20,
            },
            heroAnimatedStyle,
          ]}
        >
          <Animated.View
            entering={FadeInDown.duration(800)}
            style={{
              backgroundColor: theme.colors.surface,
              borderRadius: 24,
              padding: 24,
              shadowColor: theme.colors.shadows.neutral,
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.1,
              shadowRadius: 24,
              elevation: 12,
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}
          >
            {/* Priority & Category Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <View
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 16,
                    backgroundColor: getPriorityColor(task.priority),
                    shadowColor: getPriorityColor(task.priority),
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 4,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: 'bold',
                      color: theme.colors.text.onPrimary,
                      textTransform: 'uppercase',
                    }}
                  >
                    {task.priority}
                  </Text>
                </View>

                <View
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 16,
                    backgroundColor: theme.colors.accent + '20',
                    borderWidth: 1,
                    borderColor: theme.colors.accent + '40',
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Feather 
                      name={getCategoryIcon(task.category)} 
                      size={12} 
                      color={theme.colors.accent} 
                    />
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: '600',
                        color: theme.colors.accent,
                        marginLeft: 4,
                        textTransform: 'capitalize',
                      }}
                    >
                      {task.category}
                    </Text>
                  </View>
                </View>
              </View>

              {isAIMode && (
                <Animated.View
                  style={[
                    {
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 12,
                      backgroundColor: theme.colors.success + '20',
                      borderWidth: 1,
                      borderColor: theme.colors.success + '40',
                    },
                    aiPulseAnimatedStyle,
                  ]}
                >
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: '600',
                      color: theme.colors.success,
                    }}
                  >
                    🤖 AI Active
                  </Text>
                </Animated.View>
              )}
            </View>

            {/* Task Title */}
            <Text
              style={{
                fontSize: 24,
                fontWeight: 'bold',
                color: theme.colors.text.primary,
                lineHeight: 32,
                marginBottom: 12,
              }}
            >
              {task.title}
            </Text>

            {/* Progress Bar */}
            <View style={{ marginBottom: 20 }}>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 8,
              }}>
                <Text style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: theme.colors.text.secondary,
                }}>
                  Progress
                </Text>
                <Text style={{
                  fontSize: 14,
                  fontWeight: 'bold',
                  color: theme.colors.primary,
                }}>
                  {Math.round(progress)}%
                </Text>
              </View>
              
              <View style={{
                height: 8,
                backgroundColor: theme.colors.background,
                borderRadius: 4,
                overflow: 'hidden',
              }}>
                <Animated.View
                  style={[
                    {
                      height: '100%',
                      borderRadius: 4,
                    },
                    progressAnimatedStyle,
                  ]}
                >
                  <LinearGradient
                    colors={theme.colors.gradients.primary}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ flex: 1 }}
                  />
                </Animated.View>
              </View>
            </View>

            {/* Task Stats */}
            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between',
              paddingTop: 16,
              borderTopWidth: 1,
              borderTopColor: theme.colors.border,
            }}>
              <View style={{ alignItems: 'center', flex: 1 }}>
                <MaterialCommunityIcon 
                  name="clock-outline" 
                  size={20} 
                  color={theme.colors.primary} 
                />
                <Text style={{
                  fontSize: 12,
                  color: theme.colors.text.secondary,
                  marginTop: 4,
                }}>
                  {task.actualHours || 0} / {task.estimatedHours} hrs
                </Text>
              </View>

              <View style={{ alignItems: 'center', flex: 1 }}>
                <MaterialCommunityIcon 
                  name="check-circle-outline" 
                  size={20} 
                  color={theme.colors.success} 
                />
                <Text style={{
                  fontSize: 12,
                  color: theme.colors.text.secondary,
                  marginTop: 4,
                }}>
                  {task.subtasks.filter(st => st.completed).length} / {task.subtasks.length} tasks
                </Text>
              </View>

              <View style={{ alignItems: 'center', flex: 1 }}>
                <MaterialCommunityIcon 
                  name="calendar-outline" 
                  size={20} 
                  color={theme.colors.warning} 
                />
                <Text style={{
                  fontSize: 12,
                  color: theme.colors.text.secondary,
                  marginTop: 4,
                }}>
                  {task.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </Text>
              </View>
            </View>
          </Animated.View>
        </Animated.View>

        {/* AI Suggestions (when AI mode is active) */}
        {isAIMode && aiSuggestions.length > 0 && (
          <Animated.View
            entering={SlideInRight.duration(500)}
            style={{ paddingHorizontal: 20, marginBottom: 20 }}
          >
            <View
              style={{
                backgroundColor: theme.colors.primary + '10',
                borderRadius: 20,
                padding: 20,
                borderWidth: 1,
                borderColor: theme.colors.primary + '20',
              }}
            >
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 16,
              }}>
                <MaterialCommunityIcon 
                  name="brain" 
                  size={20} 
                  color={theme.colors.primary} 
                />
                <Text style={{
                  fontSize: 16,
                  fontWeight: 'bold',
                  color: theme.colors.primary,
                  marginLeft: 8,
                }}>
                  AI Insights & Recommendations
                </Text>
              </View>

              {aiSuggestions.map((suggestion, index) => (
                <Animated.View
                  key={index}
                  entering={FadeInRight.delay(index * 100).duration(400)}
                  style={{
                    flexDirection: 'row',
                    backgroundColor: theme.colors.surface,
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 12,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                  }}
                >
                  <MaterialIcon 
                    name="auto-awesome" 
                    size={16} 
                    color={theme.colors.primary}
                    style={{ marginTop: 2, marginRight: 12 }}
                  />
                  <Text style={{
                    fontSize: 14,
                    color: theme.colors.text.primary,
                    lineHeight: 20,
                    flex: 1,
                  }}>
                    {suggestion}
                  </Text>
                </Animated.View>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Description Section */}
        <Animated.View
          entering={FadeInUp.delay(200).duration(600)}
          style={{ paddingHorizontal: 20, marginBottom: 24 }}
        >
          <View
            style={{
              backgroundColor: theme.colors.surface,
              borderRadius: 20,
              padding: 20,
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}
          >
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 16,
            }}>
              <MaterialCommunityIcon 
                name="text-box-outline" 
                size={20} 
                color={theme.colors.accent} 
              />
              <Text style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: theme.colors.text.primary,
                marginLeft: 12,
              }}>
                Description
              </Text>
            </View>

            <Text style={{
              fontSize: 16,
              color: theme.colors.text.primary,
              lineHeight: 24,
            }}>
              {task.description}
            </Text>
          </View>
        </Animated.View>

        {/* Team Section */}
        <Animated.View
          entering={FadeInUp.delay(300).duration(600)}
          style={{ paddingHorizontal: 20, marginBottom: 24 }}
        >
          <View
            style={{
              backgroundColor: theme.colors.surface,
              borderRadius: 20,
              padding: 20,
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}
          >
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialCommunityIcon 
                  name="account-group" 
                  size={20} 
                  color={theme.colors.success} 
                />
                <Text style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: theme.colors.text.primary,
                  marginLeft: 12,
                }}>
                  Team Members
                </Text>
              </View>

              <TouchableOpacity
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 12,
                  backgroundColor: theme.colors.primary + '20',
                  borderWidth: 1,
                  borderColor: theme.colors.primary + '40',
                }}
              >
                <Text style={{
                  fontSize: 12,
                  fontWeight: '600',
                  color: theme.colors.primary,
                }}>
                  + Add Member
                </Text>
              </TouchableOpacity>
            </View>

            {task.assignees.map((assignee, index) => (
              <Animated.View
                key={assignee.id}
                entering={BounceIn.delay(index * 100).duration(600)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  backgroundColor: theme.colors.background,
                  borderRadius: 16,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                }}
              >
                <LinearGradient
                  colors={index % 2 === 0 
                    ? [theme.colors.primary, theme.colors.accent] 
                    : [theme.colors.accent, theme.colors.success]
                  }
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 16,
                  }}
                >
                  <Text style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    color: theme.colors.text.onPrimary,
                  }}>
                    {assignee.avatar}
                  </Text>
                </LinearGradient>

                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: 'bold',
                    color: theme.colors.text.primary,
                  }}>
                    {assignee.name}
                  </Text>
                  <Text style={{
                    fontSize: 14,
                    color: theme.colors.text.secondary,
                    marginTop: 2,
                  }}>
                    {assignee.role}
                  </Text>
                </View>

                <TouchableOpacity
                  style={{
                    padding: 8,
                    borderRadius: 12,
                    backgroundColor: theme.colors.success + '20',
                  }}
                >
                  <MaterialCommunityIcon 
                    name="message-outline" 
                    size={20} 
                    color={theme.colors.success} 
                  />
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* Tags Section */}
        {task.tags && task.tags.length > 0 && (
          <Animated.View
            entering={FadeInUp.delay(400).duration(600)}
            style={{ paddingHorizontal: 20, marginBottom: 24 }}
          >
            <View
              style={{
                backgroundColor: theme.colors.surface,
                borderRadius: 20,
                padding: 20,
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
            >
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 16,
              }}>
                <MaterialCommunityIcon 
                  name="tag-multiple" 
                  size={20} 
                  color={theme.colors.warning} 
                />
                <Text style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: theme.colors.text.primary,
                  marginLeft: 12,
                }}>
                  Tags
                </Text>
              </View>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {task.tags.map((tag, index) => (
                  <Animated.View
                    key={tag}
                    entering={ZoomIn.delay(index * 50).duration(400)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 16,
                      backgroundColor: theme.colors.primary + '20',
                      borderWidth: 1,
                      borderColor: theme.colors.primary + '40',
                    }}
                  >
                    <Text style={{
                      fontSize: 12,
                      fontWeight: '600',
                      color: theme.colors.primary,
                    }}>
                      #{tag}
                    </Text>
                  </Animated.View>
                ))}
              </View>
            </View>
          </Animated.View>
        )}
      </Animated.ScrollView>

      {/* Floating Action Buttons */}
      <View
        style={{
          position: 'absolute',
          bottom: 20 + insets.bottom,
          right: 20,
          flexDirection: 'row',
          gap: 12,
        }}
      >
        <TouchableOpacity
          onPress={() => showNotification('Task updated successfully! 🎉', 'success')}
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            shadowColor: theme.colors.success,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          <LinearGradient
            colors={[theme.colors.success, '#10B981']}
            style={{
              width: '100%',
              height: '100%',
              borderRadius: 28,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MaterialIcon 
              name="check" 
              size={24} 
              color={theme.colors.text.onPrimary} 
            />
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => showNotification('Starting AI task analysis... 🤖', 'info')}
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            shadowColor: theme.colors.primary,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          <LinearGradient
            colors={theme.colors.gradients.primary}
            style={{
              width: '100%',
              height: '100%',
              borderRadius: 28,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MaterialCommunityIcon 
              name="robot" 
              size={24} 
              color={theme.colors.text.onPrimary} 
            />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};