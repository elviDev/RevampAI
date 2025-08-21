import React, { useState, useMemo, useEffect } from 'react';
import { View, FlatList, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, {
  FadeInUp,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import {
  Task,
  TaskFilter,
  TaskSort,
  TaskStats,
  TaskStatus,
} from '../../types/task.types';
import { MainStackParamList } from '../../types/navigation.types';
import { TasksHeader } from '../../components/task/TasksHeader';
import { TaskStatsCards } from '../../components/task/TaskStatsCards';
import { TaskSearchAndFilters } from '../../components/task/TaskSearchAndFilters';
import { TaskFilterModal } from '../../components/task/TaskFilterModal';
import { TaskViewRenderer } from '../../components/task/TaskViewRenderer';
import { TaskCard } from '../../components/task/TaskCard';
import Feather from 'react-native-vector-icons/Feather';

type TasksScreenNavigationProp = NativeStackNavigationProp<MainStackParamList>;

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
  const [viewModeError, setViewModeError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [_selectedTasks, _setSelectedTasks] = useState<string[]>([]);
  const [_isMultiSelectMode, _setIsMultiSelectMode] = useState(false);

  // Animation values
  const headerScale = useSharedValue(1);
  const filterButtonScale = useSharedValue(1);

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

  // Animation handlers
  const handleFilterPress = () => {
    filterButtonScale.value = withSpring(0.95, {}, () => {
      filterButtonScale.value = withSpring(1);
    });
    runOnJS(setShowFilters)(true);
  };

  // Event handlers
  const handleTaskPress = (task: Task) => {
    try {
      navigation.navigate('TaskDetailScreen', { taskId: task.id });
    } catch (error) {
      console.error(
        'TasksScreen: Error navigating to TaskDetailScreen:',
        error,
      );
      // Retry after a brief delay
      setTimeout(() => {
        try {
          navigation.navigate('TaskDetailScreen', { taskId: task.id });
        } catch (retryError) {
          console.error('TasksScreen: Retry navigation failed:', retryError);
        }
      }, 100);
    }
  };

  const handleTaskLongPress = (_task: Task) => {
    try {
      // Future: implement multi-select functionality
      console.log('Long press detected');
    } catch (error) {
      console.warn('TasksScreen: Error in handleTaskLongPress:', error);
    }
  };

  const handleCreateTask = () => {
    try {
      navigation.navigate('TaskCreateScreen');
    } catch (error) {
      console.error(
        'TasksScreen: Error navigating to TaskCreateScreen:',
        error,
      );
      // Retry after a brief delay
      setTimeout(() => {
        try {
          navigation.navigate('TaskCreateScreen');
        } catch (retryError) {
          console.error('TasksScreen: Retry navigation failed:', retryError);
        }
      }, 100);
    }
  };

  const handleFilterClear = () => {
    setSelectedFilter({});
    setShowFilters(false);
  };

  const handleSortPress = () => {
    setSortBy(prev => ({
      ...prev,
      direction: prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  // Render functions
  const renderTaskCard = ({
    item: task,
    index,
  }: {
    item: Task;
    index: number;
  }) => (
    <TaskCard
      task={task}
      index={index}
      onPress={handleTaskPress}
      onLongPress={handleTaskLongPress}
      viewMode="list"
    />
  );

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <TasksHeader
        viewMode={viewMode}
        onViewModeChange={mode => {
          try {
            console.log('TasksScreen: Switching to view mode:', mode);
            setViewModeError(null);
            setViewMode(mode);
          } catch (error) {
            console.error('TasksScreen: Error switching view mode:', error);
            setViewModeError(`Failed to switch to ${mode} view: ${error}`);
          }
        }}
        onCreateTask={handleCreateTask}
        headerScale={headerScale}
      />

      {/* Stats Cards */}
      <View className="p-2">
        <TaskStatsCards taskStats={taskStats} />
      </View>

      {/* Search and Filters */}
      <TaskSearchAndFilters
        searchQuery={searchQuery}
        isSearchFocused={isSearchFocused}
        onSearchChange={setSearchQuery}
        onSearchFocus={() => setIsSearchFocused(true)}
        onSearchBlur={() => setIsSearchFocused(false)}
        onFilterPress={handleFilterPress}
        onSortPress={handleSortPress}
        filterButtonScale={filterButtonScale}
      />

      {/* Error Display */}
      {viewModeError && (
        <View className="mx-4 mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <Text className="text-red-600 font-semibold">View Mode Error</Text>
          <Text className="text-red-500 text-sm mt-1">{viewModeError}</Text>
        </View>
      )}

      {/* Task Views with Error Handling */}
      <TaskViewRenderer
        tasks={filteredTasks}
        viewMode={viewMode}
        searchQuery={searchQuery}
        onTaskPress={handleTaskPress}
        onTaskLongPress={handleTaskLongPress}
      />

      {/* Filter Modal */}
      <TaskFilterModal
        visible={showFilters}
        selectedFilter={selectedFilter}
        onClose={() => setShowFilters(false)}
        onFilterChange={setSelectedFilter}
        onClearAll={handleFilterClear}
      />
    </View>
  );
};
