import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Task } from '../../types/task.types';

interface TaskViewModeTestProps {
  tasks: Task[];
}

export const TaskViewModeTest: React.FC<TaskViewModeTestProps> = ({ tasks }) => {
  const [viewMode, setViewMode] = useState<'list' | 'board' | 'calendar'>('list');

  const handleViewModeChange = (mode: 'list' | 'board' | 'calendar') => {
    try {
      console.log('Changing view mode to:', mode);
      setViewMode(mode);
    } catch (error) {
      console.error('Error changing view mode:', error);
      Alert.alert('Error', `Failed to change to ${mode} view: ${error}`);
    }
  };

  return (
    <View className="p-4">
      <Text className="text-lg font-bold mb-4">View Mode Test</Text>
      
      {/* View Mode Buttons */}
      <View className="flex-row space-x-2 mb-4">
        {(['list', 'board', 'calendar'] as const).map(mode => (
          <TouchableOpacity
            key={mode}
            onPress={() => handleViewModeChange(mode)}
            className={`px-4 py-2 rounded ${
              viewMode === mode ? 'bg-blue-500' : 'bg-gray-200'
            }`}
          >
            <Text className={viewMode === mode ? 'text-white' : 'text-gray-700'}>
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Simple Content Based on View Mode */}
      <View className="p-4 bg-gray-100 rounded">
        <Text className="text-lg font-semibold">Current View: {viewMode}</Text>
        <Text className="text-gray-600">Tasks count: {tasks.length}</Text>
        
        {viewMode === 'list' && (
          <Text className="mt-2 text-green-600">✓ List view working</Text>
        )}
        
        {viewMode === 'board' && (
          <Text className="mt-2 text-blue-600">✓ Board view working</Text>
        )}
        
        {viewMode === 'calendar' && (
          <Text className="mt-2 text-purple-600">✓ Calendar view working</Text>
        )}
      </View>
    </View>
  );
};