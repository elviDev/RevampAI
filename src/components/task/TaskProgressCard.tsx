import React from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeInUp, ZoomIn } from 'react-native-reanimated';
import { Task } from '../../types/task.types';
import { TaskUtils } from './TaskUtils';

interface TaskProgressCardProps {
  task: Task;
  formatDueDate: (date: Date) => string;
}

export const TaskProgressCard: React.FC<TaskProgressCardProps> = ({
  task,
  formatDueDate,
}) => {

  return (
    <Animated.View
      entering={FadeInUp.delay(300).duration(600)}
      className="bg-white mx-6 mt-4 rounded-2xl p-6"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-lg font-bold text-gray-900">Progress</Text>
        <Text className="text-2xl font-bold text-blue-600">{task.progress}%</Text>
      </View>

      <View className="bg-gray-200 h-3 rounded-full mb-4">
        <Animated.View
          entering={ZoomIn.delay(500).duration(800)}
          className="h-full rounded-full"
          style={{
            width: `${task.progress}%`,
            backgroundColor: TaskUtils.getStatusColor(task.status),
          }}
        />
      </View>

      <View className="flex-row justify-between text-sm">
        <Text className="text-gray-500">
          {task.subtasks.filter(s => s.completed).length} of {task.subtasks.length} completed
        </Text>
        <Text className="text-gray-500">Due {formatDueDate(task.dueDate)}</Text>
      </View>
    </Animated.View>
  );
};