import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { Task, TaskStatus, TaskPriority } from '../../types/task.types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { TaskCard } from '../../components/task/TaskCard';
import { loadAllSeedData } from '../../utils/seedDataLoader';
import Icon from 'react-native-vector-icons/Feather';

export const TaskScreenSimple: React.FC = () => {
  const insets = useSafeAreaInsets();
  const tasks = useSelector((state: RootState) => state.tasks.tasks);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<TaskPriority | 'all'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load seed data into Redux store
      loadAllSeedData();
    } catch (error) {
      console.error('Failed to load task data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const filteredTasks = tasks.filter(task => {
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    return matchesStatus && matchesPriority;
  });

  const getTasksByStatus = () => {
    const groups = {
      'pending': [] as Task[],
      'in-progress': [] as Task[],
      'completed': [] as Task[],
      'on-hold': [] as Task[],
      'cancelled': [] as Task[],
    };

    filteredTasks.forEach(task => {
      if (groups[task.status]) {
        groups[task.status].push(task);
      }
    });

    return groups;
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'pending': return '#F59E0B';
      case 'in-progress': return '#3B82F6';
      case 'completed': return '#10B981';
      case 'on-hold': return '#8B5CF6';
      case 'cancelled': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'low': return '#10B981';
      case 'medium': return '#F59E0B';
      case 'high': return '#F97316';
      case 'urgent': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const renderBoardView = () => {
    const taskGroups = getTasksByStatus();
    const statusConfig = [
      { key: 'pending', label: 'To Do', color: '#F59E0B', tasks: taskGroups.pending },
      { key: 'in-progress', label: 'In Progress', color: '#3B82F6', tasks: taskGroups['in-progress'] },
      { key: 'completed', label: 'Done', color: '#10B981', tasks: taskGroups.completed },
      { key: 'on-hold', label: 'On Hold', color: '#8B5CF6', tasks: taskGroups['on-hold'] },
    ];

    return (
      <ScrollView 
        horizontal 
        className="flex-1" 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        {statusConfig.map(status => (
          <View key={status.key} className="w-72 mr-4">
            <View 
              className="px-3 py-2 rounded-lg mb-3"
              style={{ backgroundColor: `${status.color}20` }}
            >
              <Text 
                className="font-semibold text-sm"
                style={{ color: status.color }}
              >
                {status.label} ({status.tasks.length})
              </Text>
            </View>
            
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
              {status.tasks.map(task => (
                <View key={task.id} className="mb-3">
                  <TaskCard
                    task={task}
                    index={0}
                    onPress={() => console.log('Task pressed:', task.title)}
                    viewMode="board"
                  />
                </View>
              ))}
              
              {status.tasks.length === 0 && (
                <View className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-6 items-center">
                  <Text className="text-gray-400 text-sm">No {status.label.toLowerCase()} tasks</Text>
                </View>
              )}
            </ScrollView>
          </View>
        ))}
      </ScrollView>
    );
  };

  const renderListView = () => (
    <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
      {filteredTasks.length === 0 ? (
        <View className="flex-1 items-center justify-center py-12">
          <Text className="text-6xl mb-4">📋</Text>
          <Text className="text-gray-500 text-lg font-medium mb-2">No tasks found</Text>
          <Text className="text-gray-400 text-center">
            Try adjusting your filters or pull to refresh
          </Text>
        </View>
      ) : (
        <View className="py-4">
          {filteredTasks.map(task => (
            <View key={task.id} className="mb-4">
              <TaskCard
                task={task}
                index={0}
                onPress={() => console.log('Task pressed:', task.title)}
              />
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-4">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-gray-900 text-2xl font-bold">Tasks</Text>
          <View className="flex-row">
            <TouchableOpacity
              onPress={() => setViewMode(viewMode === 'list' ? 'board' : 'list')}
              className="bg-gray-100 px-3 py-2 rounded-lg mr-2"
            >
              <Text className="text-gray-700 text-sm font-medium">
                {viewMode === 'list' ? 'Board' : 'List'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Filters */}
        <View className="flex-row mb-4">
          <View className="flex-1 mr-2">
            <Text className="text-gray-600 text-sm mb-1">Status</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row">
                <TouchableOpacity
                  className={`px-3 py-2 rounded-lg mr-2 ${filterStatus === 'all' ? 'bg-blue-100' : 'bg-gray-100'}`}
                  onPress={() => setFilterStatus('all')}
                >
                  <Text className={filterStatus === 'all' ? 'text-blue-700 font-medium' : 'text-gray-700'}>
                    All
                  </Text>
                </TouchableOpacity>
                {(['pending', 'in-progress', 'completed', 'on-hold'] as TaskStatus[]).map(status => (
                  <TouchableOpacity
                    key={status}
                    className={`px-3 py-2 rounded-lg mr-2 ${filterStatus === status ? 'bg-blue-100' : 'bg-gray-100'}`}
                    onPress={() => setFilterStatus(status)}
                  >
                    <Text className={`${filterStatus === status ? 'text-blue-700 font-medium' : 'text-gray-700'} capitalize`}>
                      {status.replace('-', ' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>

        {/* Stats */}
        <View className="flex-row items-center justify-between">
          <Text className="text-gray-600 text-sm">
            {filteredTasks.length} of {tasks.length} tasks
          </Text>
          
          <View className="flex-row">
            <View className="flex-row items-center mr-4">
              <View className="w-2 h-2 bg-red-500 rounded-full mr-1" />
              <Text className="text-gray-600 text-xs">
                {tasks.filter(t => t.priority === 'urgent').length} Urgent
              </Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-2 h-2 bg-green-500 rounded-full mr-1" />
              <Text className="text-gray-600 text-xs">
                {tasks.filter(t => t.status === 'completed').length} Complete
              </Text>
            </View>
          </View>
        </View>

        {/* Debug Info */}
        <View className="mt-2 p-2 bg-blue-50 rounded-lg">
          <Text className="text-blue-700 text-xs">
            ✅ Loaded {tasks.length} tasks from seed data
          </Text>
        </View>
      </View>

      {/* Task List/Board */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <LoadingSpinner size="large" />
          <Text className="text-gray-500 mt-4">Loading tasks...</Text>
        </View>
      ) : viewMode === 'list' ? (
        renderListView()
      ) : (
        renderBoardView()
      )}
    </View>
  );
};