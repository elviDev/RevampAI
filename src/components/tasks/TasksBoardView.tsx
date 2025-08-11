import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { TaskCard } from './TaskCard';
import { Task, TaskStatus } from '../../types/task.types';

interface TasksBoardViewProps {
  tasks: Task[];
  onTaskPress: (taskId: string) => void;
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
}

export const TasksBoardView: React.FC<TasksBoardViewProps> = ({
  tasks,
  onTaskPress,
  onTaskUpdate,
}) => {
  const getStatusColor = (status: TaskStatus): string => {
    switch (status) {
      case 'pending': return '#6B7280';
      case 'in-progress': return '#F59E0B';
      case 'completed': return '#10B981';
      case 'on-hold': return '#EF4444';
      case 'cancelled': return '#DC2626';
      default: return '#6B7280';
    }
  };

  const columns: { status: TaskStatus; title: string }[] = [
    { status: 'pending', title: 'Pending' },
    { status: 'in-progress', title: 'In Progress' },
    { status: 'completed', title: 'Completed' },
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
      className="flex-1"
    >
      {columns.map((column, columnIndex) => {
        const columnTasks = tasks.filter(task => task.status === column.status);
        
        return (
          <Animated.View
            key={column.status}
            entering={FadeInRight.delay(columnIndex * 100).duration(600)}
            className="w-80 mr-4"
          >
            <View className="bg-white rounded-t-2xl p-4 border-b border-gray-100">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: getStatusColor(column.status) }}
                  />
                  <Text className="text-lg font-bold text-gray-900">
                    {column.title}
                  </Text>
                </View>
                <View className="bg-gray-100 rounded-full px-2 py-1">
                  <Text className="text-sm font-semibold text-gray-600">
                    {columnTasks.length}
                  </Text>
                </View>
              </View>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              className="bg-gray-50 rounded-b-2xl max-h-96 flex-1"
              contentContainerStyle={{ padding: 8 }}
            >
              {columnTasks.length === 0 ? (
                <View className="items-center justify-center py-8">
                  <Text className="text-gray-500 text-center">
                    No {column.title.toLowerCase()} tasks
                  </Text>
                </View>
              ) : (
                columnTasks.map((task) => (
                  <View key={task.id} className="mb-2">
                    <TaskCard
                      task={task}
                      onPress={() => onTaskPress(task.id)}
                      onUpdate={onTaskUpdate}
                    />
                  </View>
                ))
              )}
            </ScrollView>
          </Animated.View>
        );
      })}
    </ScrollView>
  );
};