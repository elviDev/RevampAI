import { View, Text } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {
  getCategoryIcon,
  getStatusColor,
  getPriorityColor,
} from '../../utils/taskUtils';
import React from 'react';
import { Task } from '../../types/task.types';

const TaskHeader = ({ task }: { task: Task }) => {
  return (
    <View className="flex-row items-start justify-between mb-3">
      <View className="flex-1 pr-4">
        <View className="flex-row items-center mb-2 flex-wrap">
          <Feather
            name={getCategoryIcon(task.category)}
            size={16}
            color="#6B7280"
          />
          <Text className="text-gray-500 text-xs ml-2 uppercase tracking-wide">
            {task.category}
          </Text>
          <View className="ml-2 px-2 py-1 bg-gray-100 rounded-full">
            <Text className="text-gray-600 text-xs">{task.channelName}</Text>
          </View>
        </View>
        <Text
          className="text-gray-900 text-lg font-bold mb-1"
          numberOfLines={2}
        >
          {task.title}
        </Text>
        <Text className="text-gray-600 text-sm" numberOfLines={2}>
          {task.description}
        </Text>
      </View>

      {/* Status and Priority Badges */}
      <View className="items-end space-y-1 flex-shrink-0">
        {/* Status Badge */}
        <View
          className="px-2 py-1 rounded-full min-w-0"
          style={{ backgroundColor: `${getStatusColor(task.status)}20` }}
        >
          <Text
            className="text-xs font-semibold uppercase"
            style={{ color: getStatusColor(task.status) }}
            numberOfLines={1}
          >
            {task.status.replace('-', ' ')}
          </Text>
        </View>

        {/* Priority Badge */}
        <View
          className="px-2 py-1 rounded-full min-w-0"
          style={{ backgroundColor: `${getPriorityColor(task.priority)}20` }}
        >
          <Text
            className="text-xs font-semibold uppercase"
            style={{ color: getPriorityColor(task.priority) }}
            numberOfLines={1}
          >
            {task.priority}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default TaskHeader;
