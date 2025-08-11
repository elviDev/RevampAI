import React, { useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSharedValue } from 'react-native-reanimated';
import Feather from 'react-native-vector-icons/Feather';

import { useTasks } from '../../hooks/useTasks';
import { useAppState } from '../../contexts/AppStateContext';
import { useQuickActions } from '../../contexts/QuickActionsContext';
import { TasksHeader } from '../../components/tasks/TasksHeader';
import { TasksSearchBar } from '../../components/tasks/TasksSearchBar';
import { TasksViewModeSelector } from '../../components/tasks/TasksViewModeSelector';
import { TasksEmptyState } from '../../components/tasks/TasksEmptyState';
import { TaskCard } from '../../components/tasks/TaskCard';
import { TasksBoardView } from '../../components/tasks/TasksBoardView';
import { TasksCalendarView } from '../../components/tasks/TasksCalendarView';
import { FiltersModal } from '../../components/tasks/FiltersModal';
import { CreateTaskModal } from '../../components/tasks/CreateTaskModal';
import { EnhancedAssigneeSelectionModal } from '../../components/tasks/EnhancedAssigneeSelectionModal';
import { MainStackParamList } from '../../types/navigation.types';
import { TaskAssignee, TaskPriority, TaskCategory, TaskStatus } from '../../types/task.types';

type TasksScreenNavigationProp = NativeStackNavigationProp<MainStackParamList>;

export const TasksScreen: React.FC = () => {
  const navigation = useNavigation<TasksScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  
  // App state management
  const { state, clearTaskCreation, clearSearchQuery } = useAppState();
  const { showNotification } = useQuickActions();
  
  // Use custom hook for task management
  const {
    filteredTasks,
    searchQuery,
    setSearchQuery,
    selectedFilter,
    setSelectedFilter,
    sortBy,
    setSortBy,
    mockAssignees,
    createTask,
    updateTask,
    deleteTask,
  } = useTasks();

  // UI State
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'board' | 'calendar'>('list');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [showAssigneeModal, setShowAssigneeModal] = useState(false);

  // Create Task Form State
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as TaskPriority,
    category: 'development' as TaskCategory,
    status: 'pending' as TaskStatus,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    estimatedHours: 0,
    tags: [] as string[],
    assignees: [] as TaskAssignee[],
  });
  const [newTaskTag, setNewTaskTag] = useState('');

  // Animation values
  const filterButtonScale = useSharedValue(1);

  // Handle cross-screen triggers
  useEffect(() => {
    if (state.shouldOpenTaskCreation) {
      setShowCreateTaskModal(true);
      clearTaskCreation();
      showNotification('Ready to create a new task!', 'success');
    }
  }, [state.shouldOpenTaskCreation, clearTaskCreation, showNotification]);

  useEffect(() => {
    if (state.searchQuery) {
      setSearchQuery(state.searchQuery);
      clearSearchQuery();
      showNotification(`Searching for: ${state.searchQuery}`, 'info');
    }
  }, [state.searchQuery, setSearchQuery, clearSearchQuery, showNotification]);

  // Handlers
  const handleFilterPress = () => {
    setShowFilters(true);
  };

  const handleSortPress = () => {
    setSortBy(prev => ({
      ...prev,
      direction: prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleCreateTask = () => {
    if (newTask.title.trim()) {
      createTask(newTask);
      resetNewTask();
      setShowCreateTaskModal(false);
      showNotification(`Task "${newTask.title}" created successfully!`, 'success');
    } else {
      showNotification('Please enter a task title', 'error');
    }
  };

  const handleCloseCreateModal = () => {
    setShowCreateTaskModal(false);
    resetNewTask();
  };

  const resetNewTask = () => {
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

  const renderTaskCard = ({ item }: { item: any }) => (
    <TaskCard
      task={item}
      onPress={() => navigation.navigate('TaskDetailScreen', { taskId: item.id })}
      onUpdate={updateTask}
    />
  );

  const renderContent = () => {
    switch (viewMode) {
      case 'board':
        return (
          <TasksBoardView
            tasks={filteredTasks}
            onTaskPress={(taskId: string) => navigation.navigate('TaskDetailScreen', { taskId })}
            onTaskUpdate={updateTask}
          />
        );
      case 'calendar':
        return (
          <TasksCalendarView
            tasks={filteredTasks}
            onTaskPress={(taskId: string) => navigation.navigate('TaskDetailScreen', { taskId })}
          />
        );
      default:
        return (
          <FlatList
            data={filteredTasks}
            renderItem={renderTaskCard}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
            ListEmptyComponent={<TasksEmptyState searchQuery={searchQuery} />}
          />
        );
    }
  };

  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <TasksHeader 
        onCreatePress={() => setShowCreateTaskModal(true)}
        tasksCount={filteredTasks.length}
      />

      <TasksSearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isSearchFocused={isSearchFocused}
        setIsSearchFocused={setIsSearchFocused}
        onFilterPress={handleFilterPress}
        onSortPress={handleSortPress}
        filterButtonScale={filterButtonScale}
      />

      <TasksViewModeSelector
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {renderContent()}

      {/* Modals */}
      <FiltersModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        selectedFilter={selectedFilter}
        onFilterChange={setSelectedFilter}
        assignees={mockAssignees}
      />

      <CreateTaskModal
        visible={showCreateTaskModal}
        onClose={handleCloseCreateModal}
        newTask={newTask}
        onTaskChange={setNewTask}
        onCreateTask={handleCreateTask}
        onShowAssigneeModal={() => setShowAssigneeModal(true)}
        newTaskTag={newTaskTag}
        onNewTaskTagChange={setNewTaskTag}
        onAddTag={addTag}
        onRemoveTag={removeTag}
        onToggleAssignee={toggleAssignee}
      />

      <EnhancedAssigneeSelectionModal
        visible={showAssigneeModal}
        onClose={() => setShowAssigneeModal(false)}
        selectedAssignees={newTask.assignees}
        onToggleAssignee={toggleAssignee}
      />
    </View>
  );
};