import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  SharedValue,
} from 'react-native-reanimated';
import Feather from 'react-native-vector-icons/Feather';

interface TasksHeaderProps {
  viewMode: 'list' | 'board' | 'calendar';
  onViewModeChange: (mode: 'list' | 'board' | 'calendar') => void;
  onCreateTask: () => void;
  headerScale: SharedValue<number>;
}

export const TasksHeader: React.FC<TasksHeaderProps> = ({
  viewMode,
  onViewModeChange,
  onCreateTask,
  headerScale,
}) => {
  const animatedHeaderStyle = useAnimatedStyle(() => ({
    transform: [{ scale: headerScale.value }],
  }));

  const handleViewModeChange = (mode: 'list' | 'board' | 'calendar') => {
    try {
      console.log('TasksHeader: Changing view mode to:', mode);
      onViewModeChange(mode);
    } catch (error) {
      console.error('TasksHeader: Error changing view mode:', error);
    }
  };

  return (
    <Animated.View
      entering={FadeInDown.duration(800).springify()}
      style={animatedHeaderStyle}
      className="px-4 mb-4"
    >
      {/* Title and Actions */}
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-3xl font-bold text-gray-900">Tasks</Text>
        <View className="flex-row gap-2 items-center space-x-3">
          {/* View Mode Switcher */}
          <View className="flex-row bg-gray-200 rounded-lg p-1">
            {(['list', 'board', 'calendar'] as const).map(mode => (
              <TouchableOpacity
                key={mode}
                onPress={() => handleViewModeChange(mode)}
                className={`px-3 py-2 rounded-md ${
                  viewMode === mode ? 'bg-white shadow-sm' : ''
                }`}
              >
                <Feather
                  name={
                    mode === 'list'
                      ? 'list'
                      : mode === 'board'
                        ? 'columns'
                        : 'calendar'
                  }
                  size={16}
                  color={viewMode === mode ? '#3933C6' : '#6B7280'}
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Add Task Button */}
          <TouchableOpacity
            onPress={onCreateTask}
            className="bg-blue-500 rounded-lg px-4 py-2"
          >
            <Feather name="plus" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};
