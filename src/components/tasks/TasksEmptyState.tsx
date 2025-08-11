import React from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import Feather from 'react-native-vector-icons/Feather';

interface TasksEmptyStateProps {
  searchQuery: string;
}

export const TasksEmptyState: React.FC<TasksEmptyStateProps> = ({ searchQuery }) => {
  return (
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
  );
};