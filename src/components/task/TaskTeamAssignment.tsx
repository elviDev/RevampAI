import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown, SlideInRight, BounceIn } from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { TaskAssignee } from '../../types/task.types';

interface TaskTeamAssignmentProps {
  assignees: TaskAssignee[];
  availableAssignees: TaskAssignee[];
  onToggleAssignee: (assignee: TaskAssignee) => void;
  errors: {
    assignees: string;
  };
}

export const TaskTeamAssignment: React.FC<TaskTeamAssignmentProps> = ({
  assignees,
  availableAssignees,
  onToggleAssignee,
  errors,
}) => {
  return (
    <Animated.View entering={FadeInDown.duration(600)} className="space-y-6">
      <View>
        <View className="flex-row items-center mb-4">
          <View className="w-10 h-10 bg-blue-100 rounded-xl items-center justify-center mr-3">
            <MaterialIcon name="groups" size={20} color="#3B82F6" />
          </View>
          <View>
            <Text className="text-gray-900 font-bold text-lg">Team Assignment</Text>
            <Text className="text-gray-500 text-sm">
              Select team members who will work on this task
            </Text>
          </View>
        </View>

        {errors.assignees ? (
          <Animated.View 
            entering={BounceIn} 
            className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4"
          >
            <Text className="text-red-700 font-medium">{errors.assignees}</Text>
          </Animated.View>
        ) : null}

        <View className="space-y-3">
          {availableAssignees.map((assignee, index) => {
            const isSelected = assignees.some(a => a.id === assignee.id);
            
            return (
              <Animated.View key={assignee.id} entering={SlideInRight.delay(index * 100)}>
                <TouchableOpacity
                  onPress={() => onToggleAssignee(assignee)}
                  className={`rounded-2xl p-4 border-2 ${
                    isSelected
                      ? 'bg-blue-50 border-blue-300 shadow-lg'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <View className="flex-row items-center">
                    <LinearGradient
                      colors={
                        index % 4 === 0
                          ? ['#3B82F6', '#8B5CF6']
                          : index % 4 === 1
                          ? ['#8B5CF6', '#EC4899']
                          : index % 4 === 2
                          ? ['#EC4899', '#F59E0B']
                          : ['#F59E0B', '#10B981']
                      }
                      className="w-14 h-14 rounded-full items-center justify-center mr-4"
                    >
                      <Text className="text-white text-lg font-bold">
                        {assignee.avatar}
                      </Text>
                    </LinearGradient>

                    <View className="flex-1">
                      <Text
                        className={`font-bold text-lg ${
                          isSelected ? 'text-blue-900' : 'text-gray-900'
                        }`}
                      >
                        {assignee.name}
                      </Text>
                      <Text
                        className={`font-medium text-sm ${
                          isSelected ? 'text-blue-600' : 'text-gray-600'
                        }`}
                      >
                        {assignee.role}
                      </Text>
                      <Text
                        className={`text-sm ${
                          isSelected ? 'text-blue-500' : 'text-gray-500'
                        }`}
                      >
                        {assignee.email}
                      </Text>
                    </View>

                    <View
                      className={`w-8 h-8 rounded-full border-2 items-center justify-center ${
                        isSelected
                          ? 'bg-blue-600 border-blue-600'
                          : 'border-gray-300'
                      }`}
                    >
                      {isSelected && (
                        <MaterialIcon name="check" size={18} color="white" />
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        {assignees.length > 0 && (
          <Animated.View 
            entering={BounceIn} 
            className="mt-6 bg-blue-50 border border-blue-200 rounded-2xl p-4"
          >
            <Text className="text-blue-800 font-semibold mb-3">
              Selected Team Members ({assignees.length})
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {assignees.map(assignee => (
                <View
                  key={assignee.id}
                  className="bg-blue-100 rounded-full px-3 py-2 flex-row items-center"
                >
                  <Text className="text-blue-700 font-medium">{assignee.name}</Text>
                  <Text className="text-blue-600 text-sm ml-1">• {assignee.role}</Text>
                </View>
              ))}
            </View>
          </Animated.View>
        )}
      </View>
    </Animated.View>
  );
};