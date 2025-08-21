import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { Task } from '../../types/task.types';
import { TaskUtils } from './TaskUtils';

interface TaskCardProps {
  task: Task;
  index: number;
  onPress: (task: Task) => void;
  onLongPress?: (task: Task) => void;
  viewMode?: 'list' | 'board' | 'calendar';
}

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  index,
  onPress,
  onLongPress,
  viewMode = 'list',
}) => {
  const isOverdue = TaskUtils.isOverdue(task.dueDate, task.status);
  const isDueSoon = TaskUtils.isDueSoon(task.dueDate, task.status);

  return (
    <AnimatedTouchableOpacity
      entering={FadeInDown.delay(index * 100)
        .duration(600)
        .springify()}
      onPress={() => {
        try {
          onPress(task);
        } catch (error) {
          console.warn('TaskCard: Error handling task press:', error);
        }
      }}
      onLongPress={() => {
        try {
          onLongPress?.(task);
        } catch (error) {
          console.warn('TaskCard: Error handling task long press:', error);
        }
      }}
      className={`bg-white rounded-2xl p-4 ${viewMode === 'list' ? 'mb-4 mx-4' : 'mb-3'}`}
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: TaskUtils.getPriorityColor(task.priority),
      }}
    >
      {/* Header */}
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1 pr-4">
          {/* Category and Channel */}
          <View className="flex-row items-center mb-2 flex-wrap">
            <View className="flex-row items-center bg-gray-100 rounded-full px-2 py-1 mr-2">
              <Feather
                name={TaskUtils.getCategoryIcon(task.category)}
                size={12}
                color="#6B7280"
              />
              <Text className="text-gray-600 text-xs ml-1 uppercase font-medium">
                {task.category}
              </Text>
            </View>
            <View className="bg-blue-50 rounded-full px-2 py-1">
              <Text className="text-blue-600 text-xs font-medium">
                {task.channelName}
              </Text>
            </View>
          </View>

          {/* Title */}
          <Text
            className="text-gray-900 text-lg font-bold mb-1"
            numberOfLines={2}
          >
            {task.title}
          </Text>

          {/* Description */}
          <Text className="text-gray-600 text-sm leading-5" numberOfLines={2}>
            {task.description}
          </Text>
        </View>

        {/* Status and Priority */}
        <View className="items-end space-y-2">
          <View
            className="px-2 py-1 rounded-full"
            style={{
              backgroundColor: `${TaskUtils.getStatusColor(task.status)}15`,
            }}
          >
            <Text
              className="text-xs font-semibold uppercase"
              style={{ color: TaskUtils.getStatusColor(task.status) }}
            >
              {task.status.replace('-', ' ')}
            </Text>
          </View>

          <View
            className="px-2 py-1 rounded-full"
            style={{
              backgroundColor: `${TaskUtils.getPriorityColor(task.priority)}15`,
            }}
          >
            <Text
              className="text-xs font-semibold uppercase"
              style={{ color: TaskUtils.getPriorityColor(task.priority) }}
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
                backgroundColor: TaskUtils.getStatusColor(task.status),
              }}
            />
          </View>
        </View>
      )}

      {/* Tags */}
      {task.tags.length > 0 && (
        <View className="flex-row flex-wrap mb-3 gap-1">
          {task.tags.slice(0, 3).map((tag, tagIndex) => (
            <View key={tagIndex} className="bg-purple-50 px-2 py-1 rounded-md">
              <Text className="text-purple-600 text-xs font-medium">
                #{tag}
              </Text>
            </View>
          ))}
          {task.tags.length > 3 && (
            <View className="bg-gray-100 px-2 py-1 rounded-md">
              <Text className="text-gray-500 text-xs">
                +{task.tags.length - 3}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Footer */}
      <View className="flex-row items-center justify-between">
        {/* Assignees */}
        <View className="flex-row items-center">
          {task.assignees.length > 0 ? (
            <View className="flex-row -space-x-2">
              {task.assignees.slice(0, 3).map((assignee, avatarIndex) => (
                <LinearGradient
                  key={assignee.id}
                  colors={
                    avatarIndex % 2 === 0
                      ? ['#3B82F6', '#8B5CF6']
                      : ['#8B5CF6', '#3B82F6']
                  }
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    borderWidth: 2,
                    borderColor: 'white',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: task.assignees.length - avatarIndex,
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
          <Feather
            name="calendar"
            size={14}
            color={isOverdue ? '#EF4444' : isDueSoon ? '#F59E0B' : '#6B7280'}
          />
          <Text
            className="text-xs ml-1 font-medium"
            style={{
              color: isOverdue ? '#EF4444' : isDueSoon ? '#F59E0B' : '#6B7280',
            }}
          >
            {TaskUtils.formatDueDate(task.dueDate)}
          </Text>
        </View>
      </View>

      {/* Urgent indicator */}
      {task.priority === 'urgent' && (
        <View className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full items-center justify-center">
          <MaterialIcon name="priority-high" size={14} color="white" />
        </View>
      )}

      {/* Overdue indicator */}
      {isOverdue && (
        <View className="absolute -top-1 -left-1 w-6 h-6 bg-red-500 rounded-full items-center justify-center">
          <MaterialIcon name="schedule" size={12} color="white" />
        </View>
      )}
    </AnimatedTouchableOpacity>
  );
};
