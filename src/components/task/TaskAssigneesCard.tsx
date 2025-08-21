import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, { FadeInUp, SlideInRight } from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { TaskAssignee } from '../../types/task.types';

interface TaskAssigneesCardProps {
  assignees: TaskAssignee[];
  onAddAssignee: () => void;
}

export const TaskAssigneesCard: React.FC<TaskAssigneesCardProps> = ({
  assignees,
  onAddAssignee,
}) => {
  return (
    <Animated.View
      entering={FadeInUp.delay(400).duration(600)}
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
        <Text className="text-lg font-bold text-gray-900">Team Members</Text>
        <TouchableOpacity
          onPress={onAddAssignee}
          className="w-8 h-8 bg-blue-50 rounded-full items-center justify-center"
        >
          <MaterialIcon name="add" size={16} color="#2563EB" />
        </TouchableOpacity>
      </View>

      <View className="space-y-3">
        {assignees.map((assignee, index) => (
          <Animated.View
            key={assignee.id}
            entering={SlideInRight.delay(index * 100).duration(600)}
            className="flex-row items-center"
          >
            <LinearGradient
              colors={
                index % 3 === 0
                  ? ['#2563EB', '#7C3AED']
                  : index % 3 === 1
                  ? ['#7C3AED', '#EC4899']
                  : ['#EC4899', '#F59E0B']
              }
              className="w-12 h-12 rounded-full items-center justify-center mr-4"
            >
              <Text className="text-white font-bold text-lg">
                {assignee.avatar}
              </Text>
            </LinearGradient>
            <View className="flex-1">
              <Text className="text-gray-900 font-semibold text-base">
                {assignee.name}
              </Text>
              <Text className="text-gray-500 text-sm">{assignee.role}</Text>
            </View>
            <View className="w-2 h-2 bg-green-400 rounded-full" />
          </Animated.View>
        ))}
      </View>
    </Animated.View>
  );
};