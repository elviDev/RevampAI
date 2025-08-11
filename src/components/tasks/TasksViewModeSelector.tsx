import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import Animated from 'react-native-reanimated';
import Feather from 'react-native-vector-icons/Feather';

interface TasksViewModeSelectorProps {
  viewMode: 'list' | 'board' | 'calendar';
  setViewMode: (mode: 'list' | 'board' | 'calendar') => void;
}

export const TasksViewModeSelector: React.FC<TasksViewModeSelectorProps> = ({
  viewMode,
  setViewMode,
}) => {
  const viewModes = [
    { key: 'list' as const, icon: 'list' },
    { key: 'board' as const, icon: 'columns' },
    { key: 'calendar' as const, icon: 'calendar' },
  ];

  return (
    <Animated.View className="flex-row justify-center mb-4">
      <View className="bg-white rounded-2xl p-1 shadow-sm flex-row">
        {viewModes.map((mode) => (
          <TouchableOpacity
            key={mode.key}
            onPress={() => setViewMode(mode.key)}
            className={`px-6 py-2 rounded-xl ${
              viewMode === mode.key
                ? 'bg-blue-500'
                : 'bg-transparent'
            }`}
          >
            <Feather
              name={mode.icon}
              size={18}
              color={viewMode === mode.key ? '#FFFFFF' : '#6B7280'}
            />
          </TouchableOpacity>
        ))}
      </View>
    </Animated.View>
  );
};