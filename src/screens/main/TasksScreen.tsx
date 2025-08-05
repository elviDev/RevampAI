import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Dimensions,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeInRight,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  SlideInDown,
  SlideInRight,
  ZoomIn,
  BounceIn,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import {
  Task,
  TaskFilter,
  TaskSort,
  TaskStats,
  TaskStatus,
  TaskPriority,
  TaskCategory,
  TaskAssignee,
} from '../../types/task.types';
import { MainStackParamList } from '../../types/navigation.types';

const { width } = Dimensions.get('window');

type TasksScreenNavigationProp = NativeStackNavigationProp<MainStackParamList>;

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

export const TasksScreen: React.FC = () => {
  const navigation = useNavigation<TasksScreenNavigationProp>();
  const insets = useSafeAreaInsets();

  // State management
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<TaskFilter>({});
  const [sortBy, setSortBy] = useState<TaskSort>({
    field: 'dueDate',
    direction: 'asc',
  });
  const [viewMode, setViewMode] = useState<'list' | 'board' | 'calendar'>(
    'list',
  );
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);

  // Create Task Form State
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as TaskPriority,
    category: 'development' as TaskCategory,
    status: 'pending' as TaskStatus,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    estimatedHours: 0,
    tags: [] as string[],
    assignees: [] as TaskAssignee[],
  });
  const [newTaskTag, setNewTaskTag] = useState('');
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);
  const [showAssigneeModal, setShowAssigneeModal] = useState(false);

  // Animation values
  const headerScale = useSharedValue(1);
  const filterButtonScale = useSharedValue(1);
  const createModalOpacity = useSharedValue(0);
  const createModalScale = useSharedValue(0.5);

  // Mock assignees data
  const mockAssignees: TaskAssignee[] = [
    {
      id: '1',
      name: 'John Doe',
      avatar: 'J',
      role: 'Frontend Developer',
      email: 'john@example.com',
    },
    {
      id: '2',
      name: 'Sarah Wilson',
      avatar: 'S',
      role: 'UI/UX Designer',
      email: 'sarah@example.com',
    },
    {
      id: '3',
      name: 'Mike Johnson',
      avatar: 'M',
      role: 'Product Manager',
      email: 'mike@example.com',
    },
    {
      id: '4',
      name: 'Alex Chen',
      avatar: 'A',
      role: 'Backend Developer',
      email: 'alex@example.com',
    },
    {
      id: '5',
      name: 'Emily Davis',
      avatar: 'E',
      role: 'DevOps Engineer',
      email: 'emily@example.com',
    },
  ];

  // Mock data for demonstration
  useEffect(() => {
    loadMockTasks();
  }, []);

  const loadMockTasks = () => {
    const mockTasks: Task[] = [
      {
        id: '1',
        title: 'Implement user authentication',
        description: 'Create login, signup, and password reset functionality',
        status: 'in-progress',
        priority: 'high',
        category: 'development',
        assignees: [
          {
            id: '1',
            name: 'John Doe',
            avatar: 'J',
            role: 'Developer',
            email: 'john@example.com',
          },
          {
            id: '2',
            name: 'Sarah Wilson',
            avatar: 'S',
            role: 'Designer',
            email: 'sarah@example.com',
          },
        ],
        reporter: {
          id: '3',
          name: 'Mike Johnson',
          avatar: 'M',
          role: 'Product Manager',
          email: 'mike@example.com',
        },
        channelId: '1',
        channelName: 'Brainstorming',
        tags: ['authentication', 'security', 'frontend'],
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        estimatedHours: 40,
        actualHours: 25,
        progress: 65,
        subtasks: [
          { id: 's1', title: 'Design login UI', completed: true },
          { id: 's2', title: 'Implement backend API', completed: true },
          { id: 's3', title: 'Add validation', completed: false },
        ],
        comments: [],
        attachments: [],
        dependencies: [],
        watchers: [],
      },
      {
        id: '2',
        title: 'Design system documentation',
        description: 'Create comprehensive design system documentation',
        status: 'pending',
        priority: 'medium',
        category: 'documentation',
        assignees: [],
        reporter: {
          id: '2',
          name: 'Sarah Wilson',
          avatar: 'S',
          role: 'Designer',
          email: 'sarah@example.com',
        },
        channelId: '2',
        channelName: 'Design',
        tags: ['design-system', 'documentation'],
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        estimatedHours: 16,
        progress: 0,
        subtasks: [],
        comments: [],
        attachments: [],
        dependencies: [],
        watchers: [],
      },
      {
        id: '3',
        title: 'API performance optimization',
        description: 'Optimize API endpoints for better performance',
        status: 'completed',
        priority: 'high',
        category: 'development',
        assignees: [
          {
            id: '4',
            name: 'Alex Chen',
            avatar: 'A',
            role: 'Backend Developer',
            email: 'alex@example.com',
          },
        ],
        reporter: {
          id: '3',
          name: 'Mike Johnson',
          avatar: 'M',
          role: 'Product Manager',
          email: 'mike@example.com',
        },
        channelId: '3',
        channelName: 'Backend',
        tags: ['performance', 'api', 'optimization'],
        dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        estimatedHours: 20,
        actualHours: 18,
        progress: 100,
        subtasks: [],
        comments: [],
        attachments: [],
        dependencies: [],
        watchers: [],
      },
    ];
    setTasks(mockTasks);
  };

  // Computed values
  const taskStats = useMemo((): TaskStats => {
    const stats = {
      total: tasks.length,
      pending: 0,
      inProgress: 0,
      completed: 0,
      overdue: 0,
      dueSoon: 0,
      unassigned: 0,
    };

    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    tasks.forEach(task => {
      switch (task.status) {
        case 'pending':
          stats.pending++;
          break;
        case 'in-progress':
          stats.inProgress++;
          break;
        case 'completed':
          stats.completed++;
          break;
      }

      if (task.assignees.length === 0) {
        stats.unassigned++;
      }

      if (task.dueDate < now && task.status !== 'completed') {
        stats.overdue++;
      }

      if (
        task.dueDate <= tomorrow &&
        task.dueDate > now &&
        task.status !== 'completed'
      ) {
        stats.dueSoon++;
      }
    });

    return stats;
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        task =>
          task.title.toLowerCase().includes(query) ||
          task.description.toLowerCase().includes(query) ||
          task.tags.some(tag => tag.toLowerCase().includes(query)) ||
          task.channelName.toLowerCase().includes(query),
      );
    }

    // Apply status filter
    if (selectedFilter.status && selectedFilter.status.length > 0) {
      filtered = filtered.filter(task =>
        selectedFilter.status!.includes(task.status),
      );
    }

    // Apply priority filter
    if (selectedFilter.priority && selectedFilter.priority.length > 0) {
      filtered = filtered.filter(task =>
        selectedFilter.priority!.includes(task.priority),
      );
    }

    // Apply category filter
    if (selectedFilter.category && selectedFilter.category.length > 0) {
      filtered = filtered.filter(task =>
        selectedFilter.category!.includes(task.category),
      );
    }

    // Apply assignee filter
    if (selectedFilter.assignee && selectedFilter.assignee.length > 0) {
      if (selectedFilter.assignee.includes('unassigned')) {
        filtered = filtered.filter(
          task =>
            task.assignees.length === 0 ||
            task.assignees.some(assignee =>
              selectedFilter.assignee!.includes(assignee.id),
            ),
        );
      } else {
        filtered = filtered.filter(task =>
          task.assignees.some(assignee =>
            selectedFilter.assignee!.includes(assignee.id),
          ),
        );
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy.field) {
        case 'dueDate':
          comparison = a.dueDate.getTime() - b.dueDate.getTime();
          break;
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'status':
          const statusOrder: Record<TaskStatus, number> = {
            pending: 1,
            'in-progress': 2,
            completed: 3,
            'on-hold': 4,
            cancelled: 5,
          };
          comparison = statusOrder[a.status] - statusOrder[b.status];
          break;
        case 'createdAt':
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
        case 'updatedAt':
          comparison = a.updatedAt.getTime() - b.updatedAt.getTime();
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
      }

      return sortBy.direction === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [tasks, searchQuery, selectedFilter, sortBy]);

  // Helper functions
  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent':
        return '#EF4444';
      case 'high':
        return '#F97316';
      case 'medium':
        return '#EAB308';
      case 'low':
        return '#22C55E';
      default:
        return '#6B7280';
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'pending':
        return '#6B7280';
      case 'in-progress':
        return '#3B82F6';
      case 'completed':
        return '#22C55E';
      case 'on-hold':
        return '#F59E0B';
      case 'cancelled':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getCategoryIcon = (category: TaskCategory) => {
    switch (category) {
      case 'development':
        return 'code';
      case 'design':
        return 'palette';
      case 'research':
        return 'search';
      case 'meeting':
        return 'users';
      case 'documentation':
        return 'file-text';
      case 'testing':
        return 'check-circle';
      case 'deployment':
        return 'upload';
      default:
        return 'circle';
    }
  };

  const formatDueDate = (dueDate: Date) => {
    const now = new Date();
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''}`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return 'Due tomorrow';
    } else if (diffDays <= 7) {
      return `Due in ${diffDays} days`;
    } else {
      return dueDate.toLocaleDateString();
    }
  };

  // Animation handlers
  const handleFilterPress = () => {
    filterButtonScale.value = withSpring(0.95, {}, () => {
      filterButtonScale.value = withSpring(1);
    });
    runOnJS(setShowFilters)(true);
  };

  const animatedHeaderStyle = useAnimatedStyle(() => ({
    transform: [{ scale: headerScale.value }],
  }));

  const animatedFilterButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: filterButtonScale.value }],
  }));

  const animatedCreateModalStyle = useAnimatedStyle(() => ({
    opacity: createModalOpacity.value,
    transform: [{ scale: createModalScale.value }],
  }));

  // Create Task Helper Functions
  const resetCreateTaskForm = () => {
    setNewTask({
      title: '',
      description: '',
      priority: 'medium',
      category: 'development',
      status: 'pending',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      estimatedHours: 0,
      tags: [],
      assignees: [],
    });
    setNewTaskTag('');
  };

  const handleCreateTask = () => {
    if (!newTask.title.trim()) {
      Alert.alert('Validation Error', 'Please enter a task title');
      return;
    }

    if (!newTask.description.trim()) {
      Alert.alert('Validation Error', 'Please enter a task description');
      return;
    }

    // Generate new task
    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title.trim(),
      description: newTask.description.trim(),
      status: newTask.status,
      priority: newTask.priority,
      category: newTask.category,
      assignees: newTask.assignees,
      reporter: mockAssignees[2], // Default to Mike Johnson as reporter
      channelId: '1',
      channelName: 'Brainstorming',
      tags: newTask.tags,
      dueDate: newTask.dueDate,
      createdAt: new Date(),
      updatedAt: new Date(),
      estimatedHours: newTask.estimatedHours,
      progress: 0,
      subtasks: [],
      comments: [],
      attachments: [],
      dependencies: [],
      watchers: [],
    };

    // Add to tasks list
    setTasks(prev => [task, ...prev]);

    // Reset form and close modal
    resetCreateTaskForm();
    handleCloseCreateModal();

    // Show success message
    Alert.alert('Success', 'Task created successfully!');
  };

  const handleOpenCreateModal = () => {
    setShowCreateTaskModal(true);
    createModalOpacity.value = withTiming(1, { duration: 300 });
    createModalScale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  const handleCloseCreateModal = () => {
    createModalOpacity.value = withTiming(0, { duration: 200 });
    createModalScale.value = withTiming(0.5, { duration: 200 });
    setTimeout(() => {
      setShowCreateTaskModal(false);
    }, 200);
  };

  const addTag = () => {
    if (newTaskTag.trim() && !newTask.tags.includes(newTaskTag.trim())) {
      setNewTask(prev => ({
        ...prev,
        tags: [...prev.tags, newTaskTag.trim()],
      }));
      setNewTaskTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setNewTask(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const toggleAssignee = (assignee: TaskAssignee) => {
    setNewTask(prev => {
      const isAssigned = prev.assignees.some(a => a.id === assignee.id);
      return {
        ...prev,
        assignees: isAssigned
          ? prev.assignees.filter(a => a.id !== assignee.id)
          : [...prev.assignees, assignee],
      };
    });
  };

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  // Render functions
  const renderTaskCard = ({
    item: task,
    index,
  }: {
    item: Task;
    index: number;
  }) => (
    <AnimatedTouchableOpacity
      entering={FadeInDown.delay(index * 100)
        .duration(600)
        .springify()}
      onPress={() =>
        navigation.navigate('TaskDetailScreen', { taskId: task.id })
      }
      onLongPress={() => {
        setIsMultiSelectMode(true);
        setSelectedTasks([task.id]);
      }}
      className="bg-white rounded-2xl p-4 mb-4 mx-4"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 0,
        borderLeftWidth: 4,
        borderLeftColor: getPriorityColor(task.priority),
      }}
    >
      {/* Task Header */}
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1 pr-4">
          <View className="flex-row items-center mb-2 flex-wrap">
            <Feather
              name={getCategoryIcon(task.category)}
              size={16}
              color="#6B7280"
            />
            <Text className="text-gray-500 text-xs ml-2 uppercase tracking-wide">
              {task.category}
            </Text>
            <View className="ml-2 px-2 py-1 bg-gray-100 rounded-full">
              <Text className="text-gray-600 text-xs">{task.channelName}</Text>
            </View>
          </View>
          <Text
            className="text-gray-900 text-lg font-bold mb-1"
            numberOfLines={2}
          >
            {task.title}
          </Text>
          <Text className="text-gray-600 text-sm" numberOfLines={2}>
            {task.description}
          </Text>
        </View>

        {/* Status and Priority Badges */}
        <View className="items-end space-y-1 flex-shrink-0">
          {/* Status Badge */}
          <View
            className="px-2 py-1 rounded-full min-w-0"
            style={{ backgroundColor: `${getStatusColor(task.status)}20` }}
          >
            <Text
              className="text-xs font-semibold uppercase"
              style={{ color: getStatusColor(task.status) }}
              numberOfLines={1}
            >
              {task.status.replace('-', ' ')}
            </Text>
          </View>

          {/* Priority Badge */}
          <View
            className="px-2 py-1 rounded-full min-w-0"
            style={{ backgroundColor: `${getPriorityColor(task.priority)}20` }}
          >
            <Text
              className="text-xs font-semibold uppercase"
              style={{ color: getPriorityColor(task.priority) }}
              numberOfLines={1}
            >
              {task.priority}
            </Text>
          </View>
        </View>
      </View>

      {/* Progress Bar */}
      {task.progress > 0 && (
        <View className="mb-3">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-gray-500 text-xs">Progress</Text>
            <Text className="text-gray-700 text-xs font-semibold">
              {task.progress}%
            </Text>
          </View>
          <View className="h-2 bg-gray-200 rounded-full">
            <View
              className="h-full rounded-full"
              style={{
                width: `${task.progress}%`,
                backgroundColor: getStatusColor(task.status),
              }}
            />
          </View>
        </View>
      )}

      {/* Task Meta */}
      <View className="flex-row items-center justify-between">
        {/* Assignees */}
        <View className="flex-row items-center">
          {task.assignees.length > 0 ? (
            <View className="flex-row -space-x-2">
              {task.assignees.slice(0, 3).map((assignee, index) => (
                <LinearGradient
                  key={assignee.id}
                  colors={
                    index % 2 === 0
                      ? ['#3933C6', '#A05FFF']
                      : ['#A05FFF', '#3933C6']
                  }
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    borderWidth: 2,
                    borderColor: 'white',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: task.assignees.length - index,
                  }}
                >
                  <Text className="text-white text-xs font-bold">
                    {assignee.avatar}
                  </Text>
                </LinearGradient>
              ))}
              {task.assignees.length > 3 && (
                <View className="w-7 h-7 bg-gray-400 rounded-full border-2 border-white flex items-center justify-center">
                  <Text className="text-white text-xs font-bold">
                    +{task.assignees.length - 3}
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <View className="flex-row items-center">
              <Feather name="user-plus" size={16} color="#9CA3AF" />
              <Text className="text-gray-400 text-xs ml-1">Unassigned</Text>
            </View>
          )}
        </View>

        {/* Due Date */}
        <View className="flex-row items-center">
          <Feather name="calendar" size={14} color="#6B7280" />
          <Text
            className="text-xs ml-1 font-medium"
            style={{
              color:
                task.dueDate < new Date() && task.status !== 'completed'
                  ? '#EF4444'
                  : '#6B7280',
            }}
          >
            {formatDueDate(task.dueDate)}
          </Text>
        </View>
      </View>
    </AnimatedTouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <Animated.View
        entering={FadeInDown.duration(800).springify()}
        style={animatedHeaderStyle}
        className="px-4 mb-4"
      >
        {/* Title and Actions */}
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-3xl font-bold text-gray-900">Tasks</Text>
          <View className="flex-row items-center space-x-3">
            {/* View Mode Switcher */}
            <View className="flex-row bg-gray-200 rounded-lg p-1">
              {(['list', 'board', 'calendar'] as const).map(mode => (
                <TouchableOpacity
                  key={mode}
                  onPress={() => setViewMode(mode)}
                  className={`px-3 py-2 rounded-md ${
                    viewMode === mode ? 'bg-white shadow-sm' : ''
                  }`}
                >
                  <Feather
                    name={
                      mode === 'list'
                        ? 'list'
                        : mode === 'board'
                          ? 'columns'
                          : 'calendar'
                    }
                    size={16}
                    color={viewMode === mode ? '#3933C6' : '#6B7280'}
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Add Task Button */}
            <TouchableOpacity
              onPress={handleOpenCreateModal}
              className="bg-blue-500 rounded-lg px-4 py-2"
            >
              <Feather name="plus" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Cards */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-4"
        >
          {[
            { label: 'Total', value: taskStats.total, color: '#6B7280' },
            { label: 'Pending', value: taskStats.pending, color: '#F59E0B' },
            {
              label: 'In Progress',
              value: taskStats.inProgress,
              color: '#3B82F6',
            },
            {
              label: 'Completed',
              value: taskStats.completed,
              color: '#22C55E',
            },
            { label: 'Overdue', value: taskStats.overdue, color: '#EF4444' },
            {
              label: 'Unassigned',
              value: taskStats.unassigned,
              color: '#9CA3AF',
            },
          ].map((stat, index) => (
            <Animated.View
              key={stat.label}
              entering={FadeInRight.delay(index * 100).duration(600)}
              className="bg-white rounded-xl p-4 mr-3 min-w-[80px] items-center"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <Text
                className="text-2xl font-bold mb-1"
                style={{ color: stat.color }}
              >
                {stat.value}
              </Text>
              <Text className="text-gray-600 text-xs text-center">
                {stat.label}
              </Text>
            </Animated.View>
          ))}
        </ScrollView>

        {/* Search and Filters */}
        <View className="flex-row items-center space-x-3 mb-4">
          {/* Search Input */}
          <View className="flex-1">
            <LinearGradient
              colors={['#3933C6', '#A05FFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                borderRadius: 12,
                padding: 1,
              }}
            >
              <View className="bg-white rounded-xl px-4 py-3 flex-row items-center">
                <Feather
                  name="search"
                  size={20}
                  color={isSearchFocused ? '#3933C6' : '#9CA3AF'}
                />
                <TextInput
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="flex-1 ml-3 text-gray-900"
                  placeholderTextColor="#9CA3AF"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Feather name="x" size={16} color="#9CA3AF" />
                  </TouchableOpacity>
                )}
              </View>
            </LinearGradient>
          </View>

          {/* Filter Button */}
          <AnimatedTouchableOpacity
            style={animatedFilterButtonStyle}
            onPress={handleFilterPress}
            className="bg-white rounded-xl p-3"
          >
            <Feather name="filter" size={20} color="#6B7280" />
          </AnimatedTouchableOpacity>

          {/* Sort Button */}
          <TouchableOpacity
            onPress={() => {
              // Toggle sort direction or show sort modal
              setSortBy(prev => ({
                ...prev,
                direction: prev.direction === 'asc' ? 'desc' : 'asc',
              }));
            }}
            className="bg-white rounded-xl p-3"
          >
            <Feather name="refresh-cw" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Tasks List */}
      {viewMode === 'list' && (
        <FlatList
          data={filteredTasks}
          renderItem={renderTaskCard}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={
            <Animated.View
              entering={FadeInUp.delay(400).duration(600)}
              className="flex-1 items-center justify-center py-12"
            >
              <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
                <Feather name="clipboard" size={32} color="#9CA3AF" />
              </View>
              <Text className="text-gray-500 text-lg font-medium mb-2">
                No tasks found
              </Text>
              <Text className="text-gray-400 text-sm text-center px-8">
                {searchQuery.trim()
                  ? 'Try adjusting your search or filters'
                  : 'Create your first task to get started'}
              </Text>
            </Animated.View>
          }
        />
      )}

      {/* Board View */}
      {viewMode === 'board' && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        >
          {(['pending', 'in-progress', 'completed'] as TaskStatus[]).map(
            (status, columnIndex) => {
              const columnTasks = filteredTasks.filter(
                task => task.status === status,
              );
              return (
                <Animated.View
                  key={status}
                  entering={FadeInRight.delay(columnIndex * 100).duration(600)}
                  className="w-80 mr-4"
                >
                  {/* Column Header */}
                  <View className="bg-white rounded-t-2xl p-4 border-b border-gray-100">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center">
                        <View
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: getStatusColor(status) }}
                        />
                        <Text className="text-lg font-bold text-gray-900">
                          {status.replace('-', ' ').toUpperCase()}
                        </Text>
                      </View>
                      <View className="bg-gray-100 rounded-full px-2 py-1">
                        <Text className="text-gray-600 text-sm font-medium">
                          {columnTasks.length}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Column Tasks */}
                  <ScrollView
                    className="bg-gray-50 rounded-b-2xl"
                    style={{ minHeight: 400, maxHeight: 600 }}
                    showsVerticalScrollIndicator={false}
                  >
                    {columnTasks.map((task, index) => (
                      <TouchableOpacity
                        key={task.id}
                        onPress={() =>
                          navigation.navigate('TaskDetailScreen', {
                            taskId: task.id,
                          })
                        }
                        className="bg-white rounded-xl p-4 mb-3 mx-3"
                        style={{
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 1 },
                          shadowOpacity: 0.05,
                          shadowRadius: 4,
                          elevation: 2,
                          borderLeftWidth: 3,
                          borderLeftColor: getPriorityColor(task.priority),
                        }}
                      >
                        <Text
                          className="text-gray-900 font-bold mb-2"
                          numberOfLines={2}
                        >
                          {task.title}
                        </Text>

                        <View className="flex-row items-center mb-3">
                          <Feather
                            name={getCategoryIcon(task.category)}
                            size={14}
                            color="#6B7280"
                          />
                          <Text className="text-gray-500 text-xs ml-1 uppercase">
                            {task.category}
                          </Text>
                        </View>

                        {task.progress > 0 && (
                          <View className="mb-3">
                            <View className="flex-row items-center justify-between mb-1">
                              <Text className="text-gray-500 text-xs">
                                Progress
                              </Text>
                              <Text className="text-gray-700 text-xs font-semibold">
                                {task.progress}%
                              </Text>
                            </View>
                            <View className="h-1.5 bg-gray-200 rounded-full">
                              <View
                                className="h-full rounded-full"
                                style={{
                                  width: `${task.progress}%`,
                                  backgroundColor: getStatusColor(task.status),
                                }}
                              />
                            </View>
                          </View>
                        )}

                        <View className="flex-row items-center justify-between">
                          {/* Assignees */}
                          <View className="flex-row items-center">
                            {task.assignees.length > 0 ? (
                              <View className="flex-row -space-x-1">
                                {task.assignees
                                  .slice(0, 2)
                                  .map((assignee, idx) => (
                                    <LinearGradient
                                      key={assignee.id}
                                      colors={
                                        idx % 2 === 0
                                          ? ['#3933C6', '#A05FFF']
                                          : ['#A05FFF', '#3933C6']
                                      }
                                      style={{
                                        width: 24,
                                        height: 24,
                                        borderRadius: 12,
                                        borderWidth: 2,
                                        borderColor: 'white',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                      }}
                                    >
                                      <Text className="text-white text-xs font-bold">
                                        {assignee.avatar}
                                      </Text>
                                    </LinearGradient>
                                  ))}
                                {task.assignees.length > 2 && (
                                  <View className="w-6 h-6 bg-gray-400 rounded-full border-2 border-white flex items-center justify-center">
                                    <Text className="text-white text-xs font-bold">
                                      +{task.assignees.length - 2}
                                    </Text>
                                  </View>
                                )}
                              </View>
                            ) : (
                              <View className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                                <Feather
                                  name="user"
                                  size={12}
                                  color="#9CA3AF"
                                />
                              </View>
                            )}
                          </View>

                          {/* Priority Badge */}
                          <View
                            className="px-2 py-1 rounded-full"
                            style={{
                              backgroundColor: `${getPriorityColor(task.priority)}20`,
                            }}
                          >
                            <Text
                              className="text-xs font-semibold"
                              style={{ color: getPriorityColor(task.priority) }}
                            >
                              {task.priority.toUpperCase()}
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))}

                    {columnTasks.length === 0 && (
                      <View className="items-center justify-center py-8">
                        <Feather name="plus-circle" size={24} color="#D1D5DB" />
                        <Text className="text-gray-400 text-sm mt-2">
                          No tasks
                        </Text>
                      </View>
                    )}
                  </ScrollView>
                </Animated.View>
              );
            },
          )}
        </ScrollView>
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          <Animated.View
            entering={FadeInUp.delay(200).duration(600)}
            className="bg-white mx-4 rounded-2xl p-6 mb-4"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <View className="flex-row items-center justify-center mb-4">
              <Feather name="calendar" size={24} color="#6B7280" />
              <Text className="text-xl font-bold text-gray-900 ml-2">
                Calendar View
              </Text>
            </View>
            <Text className="text-gray-500 text-center">
              Calendar view coming soon! This will show tasks organized by due
              dates with a beautiful calendar interface.
            </Text>
          </Animated.View>

          {/* Tasks grouped by due date */}
          {(() => {
            const tasksByDate = filteredTasks.reduce(
              (acc, task) => {
                const dateKey = task.dueDate.toDateString();
                if (!acc[dateKey]) acc[dateKey] = [];
                acc[dateKey].push(task);
                return acc;
              },
              {} as Record<string, Task[]>,
            );

            return Object.entries(tasksByDate)
              .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
              .map(([dateString, tasks], groupIndex) => (
                <Animated.View
                  key={dateString}
                  entering={FadeInUp.delay((groupIndex + 1) * 100).duration(
                    600,
                  )}
                  className="bg-white mx-4 rounded-2xl p-4 mb-4"
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 4,
                  }}
                >
                  <Text className="text-lg font-bold text-gray-900 mb-3">
                    {new Date(dateString).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Text>

                  {tasks.map((task, taskIndex) => (
                    <TouchableOpacity
                      key={task.id}
                      onPress={() =>
                        navigation.navigate('TaskDetailScreen', {
                          taskId: task.id,
                        })
                      }
                      className="flex-row items-center p-3 border border-gray-200 rounded-xl mb-2 last:mb-0"
                    >
                      <View
                        className="w-4 h-4 rounded-full mr-3"
                        style={{
                          backgroundColor: getPriorityColor(task.priority),
                        }}
                      />
                      <View className="flex-1">
                        <Text
                          className="text-gray-900 font-medium"
                          numberOfLines={1}
                        >
                          {task.title}
                        </Text>
                        <Text
                          className="text-gray-500 text-sm"
                          numberOfLines={1}
                        >
                          {task.category} • {task.channelName}
                        </Text>
                      </View>
                      <View
                        className="px-2 py-1 rounded-full"
                        style={{
                          backgroundColor: `${getStatusColor(task.status)}20`,
                        }}
                      >
                        <Text
                          className="text-xs font-medium"
                          style={{ color: getStatusColor(task.status) }}
                        >
                          {task.status.replace('-', ' ').toUpperCase()}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </Animated.View>
              ));
          })()}
        </ScrollView>
      )}

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilters(false)}
      >
        <View className="flex-1 bg-black bg-opacity-50 justify-end">
          <View
            className="bg-white rounded-t-3xl p-6"
            style={{ maxHeight: '80%' }}
          >
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-gray-900">Filters</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Feather name="x" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Filter content would go here */}
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Status Filter */}
              <View className="mb-6">
                <Text className="text-lg font-semibold text-gray-900 mb-3">
                  Status
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {(
                    [
                      'pending',
                      'in-progress',
                      'completed',
                      'on-hold',
                    ] as TaskStatus[]
                  ).map(status => (
                    <TouchableOpacity
                      key={status}
                      onPress={() => {
                        const currentStatuses = selectedFilter.status || [];
                        const isSelected = currentStatuses.includes(status);
                        setSelectedFilter(prev => ({
                          ...prev,
                          status: isSelected
                            ? currentStatuses.filter(s => s !== status)
                            : [...currentStatuses, status],
                        }));
                      }}
                      className={`px-4 py-2 rounded-full border ${
                        selectedFilter.status?.includes(status)
                          ? 'bg-blue-500 border-blue-500'
                          : 'bg-white border-gray-300'
                      }`}
                    >
                      <Text
                        className={`text-sm font-medium ${
                          selectedFilter.status?.includes(status)
                            ? 'text-white'
                            : 'text-gray-700'
                        }`}
                      >
                        {status.replace('-', ' ').toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Priority Filter */}
              <View className="mb-6">
                <Text className="text-lg font-semibold text-gray-900 mb-3">
                  Priority
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {(['low', 'medium', 'high', 'urgent'] as TaskPriority[]).map(
                    priority => (
                      <TouchableOpacity
                        key={priority}
                        onPress={() => {
                          const currentPriorities =
                            selectedFilter.priority || [];
                          const isSelected =
                            currentPriorities.includes(priority);
                          setSelectedFilter(prev => ({
                            ...prev,
                            priority: isSelected
                              ? currentPriorities.filter(p => p !== priority)
                              : [...currentPriorities, priority],
                          }));
                        }}
                        className={`px-4 py-2 rounded-full border ${
                          selectedFilter.priority?.includes(priority)
                            ? 'border-orange-500'
                            : 'bg-white border-gray-300'
                        }`}
                        style={{
                          backgroundColor: selectedFilter.priority?.includes(
                            priority,
                          )
                            ? getPriorityColor(priority)
                            : 'white',
                        }}
                      >
                        <Text
                          className={`text-sm font-medium ${
                            selectedFilter.priority?.includes(priority)
                              ? 'text-white'
                              : 'text-gray-700'
                          }`}
                        >
                          {priority.toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    ),
                  )}
                </View>
              </View>
            </ScrollView>

            {/* Filter Actions */}
            <View className="flex-row space-x-3 pt-4 border-t border-gray-200">
              <TouchableOpacity
                onPress={() => {
                  setSelectedFilter({});
                  setShowFilters(false);
                }}
                className="flex-1 bg-gray-200 rounded-xl py-3"
              >
                <Text className="text-center text-gray-700 font-semibold">
                  Clear All
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowFilters(false)}
                className="flex-1 bg-blue-500 rounded-xl py-3"
              >
                <Text className="text-center text-white font-semibold">
                  Apply Filters
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Create Task Modal - Full Screen */}
      <Modal
        visible={showCreateTaskModal}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={handleCloseCreateModal}
      >
        <View className="flex-1 bg-white">
          {/* Full Page Header */}
          <View style={{ paddingTop: insets.top }}>
            <LinearGradient
              colors={['#3933C6', '#A05FFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="px-6 py-6"
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <TouchableOpacity
                    onPress={handleCloseCreateModal}
                    className="w-12 h-12 bg-white bg-opacity-20 rounded-full items-center justify-center mr-4"
                  >
                    <Feather name="arrow-left" size={20} color="white" />
                  </TouchableOpacity>
                  <View>
                    <Text className="text-white text-2xl font-bold">
                      Create New Task
                    </Text>
                    <Text className="text-white text-sm opacity-80">
                      Fill in the details below
                    </Text>
                  </View>
                </View>
                <View className="w-12 h-12 bg-white bg-opacity-20 rounded-full items-center justify-center">
                  <Feather name="plus-circle" size={24} color="white" />
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Full Page Content */}
          <KeyboardAvoidingView
            className="flex-1"
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <ScrollView
              className="flex-1 px-6 py-8"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 100 }}
            >
              {/* Progress Indicator */}
              <View className="flex-row justify-center mb-8">
                <View className="flex-row space-x-2">
                  {[1, 2, 3].map((step, index) => (
                    <View
                      key={step}
                      className={`w-3 h-3 rounded-full ${
                        index === 0 ? 'bg-blue-500' : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </View>
              </View>

              {/* Task Title Section */}
              <Animated.View
                entering={FadeInDown.delay(100).duration(600)}
                className="mb-10"
              >
                <View className="flex-row items-center mb-4">
                  <View className="w-8 h-8 bg-blue-100 rounded-lg items-center justify-center mr-3">
                    <Feather name="edit-3" size={16} color="#3B82F6" />
                  </View>
                  <Text className="text-gray-900 font-bold text-xl">
                    Task Details
                  </Text>
                </View>

                <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <Text className="text-gray-900 font-semibold mb-3 text-lg">
                    Task Title *
                  </Text>
                  <View className="border border-gray-200 rounded-xl p-5 bg-gray-50 focus:border-blue-500">
                    <TextInput
                      placeholder="Enter a clear and descriptive task title..."
                      value={newTask.title}
                      onChangeText={text =>
                        setNewTask(prev => ({ ...prev, title: text }))
                      }
                      className="text-gray-900 text-lg"
                      placeholderTextColor="#9CA3AF"
                      multiline
                      style={{ minHeight: 50 }}
                    />
                  </View>

                  <Text className="text-gray-900 font-semibold mb-3 text-lg mt-6">
                    Description *
                  </Text>
                  <View className="border border-gray-200 rounded-xl p-5 bg-gray-50 min-h-[150px]">
                    <TextInput
                      placeholder="Provide detailed information about what needs to be done, requirements, and any relevant context..."
                      value={newTask.description}
                      onChangeText={text =>
                        setNewTask(prev => ({ ...prev, description: text }))
                      }
                      className="text-gray-900 text-lg"
                      placeholderTextColor="#9CA3AF"
                      multiline
                      numberOfLines={6}
                      textAlignVertical="top"
                      style={{ minHeight: 120 }}
                    />
                  </View>
                </View>
              </Animated.View>

              {/* Priority & Category Section */}
              <Animated.View
                entering={FadeInDown.delay(200).duration(600)}
                className="mb-10"
              >
                <View className="flex-row items-center mb-4">
                  <View className="w-8 h-8 bg-orange-100 rounded-lg items-center justify-center mr-3">
                    <Feather name="flag" size={16} color="#F97316" />
                  </View>
                  <Text className="text-gray-900 font-bold text-xl">
                    Priority & Category
                  </Text>
                </View>

                <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <Text className="text-gray-900 font-semibold mb-4 text-lg">
                    Priority Level
                  </Text>
                  <View className="flex-row flex-wrap gap-3 mb-8">
                    {(
                      ['low', 'medium', 'high', 'urgent'] as TaskPriority[]
                    ).map(priority => (
                      <TouchableOpacity
                        key={priority}
                        onPress={() =>
                          setNewTask(prev => ({ ...prev, priority }))
                        }
                        className={`px-6 py-4 rounded-xl border-2 flex-row items-center ${
                          newTask.priority === priority
                            ? 'border-transparent shadow-lg'
                            : 'border-gray-200 bg-gray-50'
                        }`}
                        style={{
                          backgroundColor:
                            newTask.priority === priority
                              ? getPriorityColor(priority)
                              : undefined,
                          transform: [
                            { scale: newTask.priority === priority ? 1.05 : 1 },
                          ],
                        }}
                      >
                        <View
                          className={`w-3 h-3 rounded-full mr-3 ${
                            newTask.priority === priority ? 'bg-white' : ''
                          }`}
                          style={{
                            backgroundColor:
                              newTask.priority === priority
                                ? 'white'
                                : getPriorityColor(priority),
                          }}
                        />
                        <Text
                          className={`text-base font-semibold ${
                            newTask.priority === priority
                              ? 'text-white'
                              : 'text-gray-700'
                          }`}
                        >
                          {priority.charAt(0).toUpperCase() + priority.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text className="text-gray-900 font-semibold mb-4 text-lg">
                    Category
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingRight: 20 }}
                  >
                    <View className="flex-row space-x-3">
                      {(
                        [
                          'development',
                          'design',
                          'research',
                          'meeting',
                          'documentation',
                          'testing',
                          'deployment',
                        ] as TaskCategory[]
                      ).map(category => (
                        <TouchableOpacity
                          key={category}
                          onPress={() =>
                            setNewTask(prev => ({ ...prev, category }))
                          }
                          className={`px-5 py-4 rounded-xl border-2 flex-row items-center min-w-[140px] ${
                            newTask.category === category
                              ? 'bg-blue-500 border-blue-500 shadow-lg'
                              : 'border-gray-200 bg-gray-50'
                          }`}
                        >
                          <Feather
                            name={getCategoryIcon(category)}
                            size={18}
                            color={
                              newTask.category === category
                                ? 'white'
                                : '#6B7280'
                            }
                          />
                          <Text
                            className={`text-base font-medium ml-2 ${
                              newTask.category === category
                                ? 'text-white'
                                : 'text-gray-700'
                            }`}
                          >
                            {category.charAt(0).toUpperCase() +
                              category.slice(1)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              </Animated.View>

              {/* Due Date & Hours Section */}
              <Animated.View
                entering={FadeInDown.delay(300).duration(600)}
                className="mb-10"
              >
                <View className="flex-row items-center mb-4">
                  <View className="w-8 h-8 bg-green-100 rounded-lg items-center justify-center mr-3">
                    <Feather name="clock" size={16} color="#22C55E" />
                  </View>
                  <Text className="text-gray-900 font-bold text-xl">
                    Timeline & Estimation
                  </Text>
                </View>

                <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <View className="flex-row space-x-4">
                    <View className="flex-1">
                      <Text className="text-gray-900 font-semibold mb-3 text-lg">
                        Due Date
                      </Text>
                      <TouchableOpacity className="border border-gray-200 rounded-xl p-5 bg-gray-50 flex-row items-center justify-between">
                        <View className="flex-row items-center">
                          <Feather name="calendar" size={18} color="#6B7280" />
                          <Text className="text-gray-700 ml-3 text-lg">
                            {newTask.dueDate.toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </Text>
                        </View>
                        <Feather
                          name="chevron-down"
                          size={18}
                          color="#6B7280"
                        />
                      </TouchableOpacity>
                    </View>

                    <View className="flex-1">
                      <Text className="text-gray-900 font-semibold mb-3 text-lg">
                        Estimated Hours
                      </Text>
                      <View className="border border-gray-200 rounded-xl p-5 bg-gray-50">
                        <TextInput
                          placeholder="0"
                          value={newTask.estimatedHours.toString()}
                          onChangeText={text => {
                            const hours = parseInt(text) || 0;
                            setNewTask(prev => ({
                              ...prev,
                              estimatedHours: hours,
                            }));
                          }}
                          className="text-gray-900 text-lg"
                          placeholderTextColor="#9CA3AF"
                          keyboardType="numeric"
                        />
                      </View>
                    </View>
                  </View>
                </View>
              </Animated.View>

              {/* Enhanced Tags Section */}
              <Animated.View
                entering={FadeInDown.delay(400).duration(600)}
                className="mb-10"
              >
                <View className="flex-row items-center mb-4">
                  <View className="w-8 h-8 bg-purple-100 rounded-lg items-center justify-center mr-3">
                    <Feather name="tag" size={16} color="#A855F7" />
                  </View>
                  <Text className="text-gray-900 font-bold text-xl">
                    Tags & Labels
                  </Text>
                </View>

                <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <Text className="text-gray-900 font-semibold mb-3 text-lg">
                    Add Tags
                  </Text>

                  {/* Enhanced Tag Input */}
                  <View className="flex-row mb-4">
                    <View className="flex-1 border border-gray-200 rounded-xl p-4 bg-gray-50 mr-3">
                      <TextInput
                        placeholder="Enter a tag and press enter..."
                        value={newTaskTag}
                        onChangeText={setNewTaskTag}
                        className="text-gray-900 text-lg"
                        placeholderTextColor="#9CA3AF"
                        onSubmitEditing={addTag}
                        returnKeyType="done"
                      />
                    </View>
                    <TouchableOpacity
                      onPress={addTag}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl px-6 justify-center shadow-lg"
                    >
                      <LinearGradient
                        colors={['#3B82F6', '#A855F7']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        className="rounded-xl px-6 py-4 flex-row items-center"
                      >
                        <Feather name="plus" size={20} color="white" />
                        <Text className="text-white font-semibold ml-2">
                          Add
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>

                  {/* Enhanced Tags Display */}
                  {newTask.tags.length > 0 ? (
                    <View>
                      <Text className="text-gray-700 mb-3 text-sm">
                        {newTask.tags.length} tag
                        {newTask.tags.length !== 1 ? 's' : ''} added
                      </Text>
                      <View className="flex-row flex-wrap gap-2">
                        {newTask.tags.map((tag, index) => (
                          <Animated.View
                            key={tag}
                            entering={ZoomIn.delay(index * 100).duration(400)}
                            className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-full px-4 py-2 flex-row items-center border border-blue-200"
                          >
                            <Text className="text-blue-700 text-sm font-medium">
                              #{tag}
                            </Text>
                            <TouchableOpacity
                              onPress={() => removeTag(tag)}
                              className="ml-2 w-5 h-5 bg-blue-200 rounded-full items-center justify-center"
                            >
                              <Feather name="x" size={12} color="#3B82F6" />
                            </TouchableOpacity>
                          </Animated.View>
                        ))}
                      </View>
                    </View>
                  ) : (
                    <View className="border border-dashed border-gray-300 rounded-xl p-8 items-center">
                      <Feather name="tag" size={32} color="#D1D5DB" />
                      <Text className="text-gray-400 text-sm mt-2">
                        No tags added yet
                      </Text>
                      <Text className="text-gray-400 text-xs mt-1">
                        Tags help organize and find tasks easily
                      </Text>
                    </View>
                  )}
                </View>
              </Animated.View>

              {/* Enhanced Assignees Section */}
              <Animated.View
                entering={FadeInDown.delay(500).duration(600)}
                className="mb-8"
              >
                <View className="flex-row items-center mb-4">
                  <View className="w-8 h-8 bg-indigo-100 rounded-lg items-center justify-center mr-3">
                    <Feather name="users" size={16} color="#6366F1" />
                  </View>
                  <Text className="text-gray-900 font-bold text-xl">
                    Team Assignment
                  </Text>
                </View>

                <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <View className="flex-row items-center justify-between mb-4">
                    <Text className="text-gray-900 font-semibold text-lg">
                      Assign Team Members
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowAssigneeModal(true)}
                      className="rounded-xl px-4 py-2 shadow-lg"
                    >
                      <LinearGradient
                        colors={['#6366F1', '#8B5CF6']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        className="rounded-xl px-4 py-2 flex-row items-center"
                      >
                        <Feather name="user-plus" size={16} color="white" />
                        <Text className="text-white text-sm font-medium ml-2">
                          Add People
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>

                  {/* Enhanced Assignees Display */}
                  {newTask.assignees.length > 0 ? (
                    <View>
                      <Text className="text-gray-700 mb-4 text-sm">
                        {newTask.assignees.length} team member
                        {newTask.assignees.length !== 1 ? 's' : ''} assigned
                      </Text>
                      <View className="space-y-3">
                        {newTask.assignees.map((assignee, index) => (
                          <Animated.View
                            key={assignee.id}
                            entering={BounceIn.delay(index * 100).duration(600)}
                            className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-4 flex-row items-center"
                          >
                            <LinearGradient
                              colors={
                                index % 2 === 0
                                  ? ['#6366F1', '#8B5CF6']
                                  : ['#8B5CF6', '#6366F1']
                              }
                              className="w-12 h-12 rounded-full items-center justify-center mr-4"
                            >
                              <Text className="text-white text-lg font-bold">
                                {assignee.avatar}
                              </Text>
                            </LinearGradient>
                            <View className="flex-1">
                              <Text className="text-gray-900 font-semibold text-base">
                                {assignee.name}
                              </Text>
                              <Text className="text-indigo-600 text-sm font-medium">
                                {assignee.role}
                              </Text>
                              <Text className="text-gray-500 text-xs">
                                {assignee.email}
                              </Text>
                            </View>
                            <TouchableOpacity
                              onPress={() => toggleAssignee(assignee)}
                              className="w-8 h-8 bg-red-100 rounded-full items-center justify-center"
                            >
                              <Feather name="x" size={14} color="#EF4444" />
                            </TouchableOpacity>
                          </Animated.View>
                        ))}
                      </View>
                    </View>
                  ) : (
                    <View className="border border-dashed border-gray-300 rounded-xl p-8 items-center">
                      <Feather name="user-plus" size={32} color="#D1D5DB" />
                      <Text className="text-gray-400 text-sm mt-2">
                        No team members assigned
                      </Text>
                      <Text className="text-gray-400 text-xs mt-1">
                        Assign team members to collaborate on this task
                      </Text>
                    </View>
                  )}
                </View>
              </Animated.View>
            </ScrollView>

            {/* Enhanced Footer */}
            <View className="border-t border-gray-200 p-6 bg-white">
              <View className="flex-row space-x-4">
                <TouchableOpacity
                  onPress={handleCloseCreateModal}
                  className="flex-1 bg-gray-100 rounded-xl py-4 border border-gray-200"
                >
                  <Text className="text-center text-gray-700 font-semibold text-lg">
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleCreateTask}
                  className="flex-2 rounded-xl shadow-lg"
                  style={{ flex: 2 }}
                >
                  <LinearGradient
                    colors={['#3B82F6', '#8B5CF6']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="rounded-xl py-4 flex-row items-center justify-center"
                  >
                    <Feather name="check" size={20} color="white" />
                    <Text className="text-center text-white font-bold text-lg ml-2">
                      Create Task
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Enhanced Assignee Selection Modal */}
      <Modal
        visible={showAssigneeModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAssigneeModal(false)}
      >
        <View className="flex-1 bg-white">
          {/* Enhanced Modal Header */}
          <View style={{ paddingTop: insets.top }}>
            <LinearGradient
              colors={['#6366F1', '#8B5CF6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="px-6 py-6"
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <TouchableOpacity
                    onPress={() => setShowAssigneeModal(false)}
                    className="w-10 h-10 bg-white bg-opacity-20 rounded-full items-center justify-center mr-4"
                  >
                    <Feather name="x" size={20} color="white" />
                  </TouchableOpacity>
                  <View>
                    <Text className="text-white text-xl font-bold">
                      Assign Team Members
                    </Text>
                    <Text className="text-white text-sm opacity-80">
                      Select people to work on this task
                    </Text>
                  </View>
                </View>
                <View className="w-10 h-10 bg-white bg-opacity-20 rounded-full items-center justify-center">
                  <Feather name="users" size={20} color="white" />
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Enhanced Content */}
          <ScrollView
            className="flex-1 px-6 py-8"
            showsVerticalScrollIndicator={false}
          >
            {/* Selection Stats */}
            <View className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 mb-8 border border-indigo-100">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-indigo-900 font-bold text-lg">
                    {newTask.assignees.length} Selected
                  </Text>
                  <Text className="text-indigo-600 text-sm">
                    Choose team members for collaboration
                  </Text>
                </View>
                <View className="w-12 h-12 bg-indigo-100 rounded-full items-center justify-center">
                  <Text className="text-indigo-600 font-bold text-lg">
                    {newTask.assignees.length}
                  </Text>
                </View>
              </View>
            </View>

            {/* Team Members List */}
            <Text className="text-gray-900 font-bold text-xl mb-6">
              Available Team Members
            </Text>

            <View className="space-y-4">
              {mockAssignees.map((assignee, index) => {
                const isSelected = newTask.assignees.some(
                  a => a.id === assignee.id,
                );

                return (
                  <Animated.View
                    key={assignee.id}
                    entering={SlideInRight.delay(index * 100).duration(600)}
                  >
                    <TouchableOpacity
                      onPress={() => toggleAssignee(assignee)}
                      className={`rounded-2xl p-5 border-2 ${
                        isSelected
                          ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200'
                          : 'bg-white border-gray-200'
                      }`}
                      style={{
                        transform: [{ scale: isSelected ? 1.02 : 1 }],
                        shadowColor: isSelected ? '#6366F1' : '#000',
                        shadowOffset: { width: 0, height: isSelected ? 4 : 2 },
                        shadowOpacity: isSelected ? 0.2 : 0.1,
                        shadowRadius: isSelected ? 8 : 4,
                        elevation: isSelected ? 8 : 2,
                      }}
                    >
                      <View className="flex-row items-center">
                        {/* Enhanced Avatar */}
                        <LinearGradient
                          colors={
                            index % 3 === 0
                              ? ['#6366F1', '#8B5CF6']
                              : index % 3 === 1
                                ? ['#8B5CF6', '#EC4899']
                                : ['#EC4899', '#F59E0B']
                          }
                          className="w-16 h-16 rounded-full items-center justify-center mr-4"
                        >
                          <Text className="text-white text-xl font-bold">
                            {assignee.avatar}
                          </Text>
                        </LinearGradient>

                        {/* Member Info */}
                        <View className="flex-1">
                          <Text
                            className={`font-bold text-lg ${
                              isSelected ? 'text-indigo-900' : 'text-gray-900'
                            }`}
                          >
                            {assignee.name}
                          </Text>
                          <Text
                            className={`font-medium text-sm ${
                              isSelected ? 'text-indigo-600' : 'text-blue-600'
                            }`}
                          >
                            {assignee.role}
                          </Text>
                          <Text
                            className={`text-sm ${
                              isSelected ? 'text-indigo-500' : 'text-gray-500'
                            }`}
                          >
                            {assignee.email}
                          </Text>
                        </View>

                        {/* Selection Indicator */}
                        <View
                          className={`w-8 h-8 rounded-full border-2 items-center justify-center ${
                            isSelected
                              ? 'bg-indigo-500 border-indigo-500'
                              : 'border-gray-300'
                          }`}
                        >
                          {isSelected && (
                            <Feather name="check" size={16} color="white" />
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  </Animated.View>
                );
              })}
            </View>
          </ScrollView>

          {/* Enhanced Footer */}
          <View className="border-t border-gray-200 p-6 bg-white">
            <TouchableOpacity
              onPress={() => setShowAssigneeModal(false)}
              className="rounded-2xl shadow-lg"
            >
              <LinearGradient
                colors={['#6366F1', '#8B5CF6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="rounded-2xl py-5 flex-row items-center justify-center"
              >
                <Feather name="check" size={24} color="white" />
                <Text className="text-white font-bold text-lg ml-3">
                  Done ({newTask.assignees.length} selected)
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};
