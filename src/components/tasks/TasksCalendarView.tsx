import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Task } from '../../types/task.types';

interface TasksCalendarViewProps {
  tasks: Task[];
  onTaskPress: (taskId: string) => void;
}

export const TasksCalendarView: React.FC<TasksCalendarViewProps> = ({
  tasks,
  onTaskPress,
}) => {
  return (
    <ScrollView className="flex-1 p-4">
      <View className="items-center justify-center flex-1 py-20">
        <Text className="text-gray-500 text-lg mb-2">
          Calendar View
        </Text>
        <Text className="text-gray-400 text-center">
          Calendar view will be implemented in the next version
        </Text>
        <Text className="text-gray-400 text-center mt-2">
          Currently showing {tasks.length} tasks
        </Text>
      </View>
    </ScrollView>
  );
};