import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { TaskFilter, TaskAssignee, TaskStatus, TaskPriority, TaskCategory } from '../../types/task.types';

interface FiltersModalProps {
  visible: boolean;
  onClose: () => void;
  selectedFilter: TaskFilter;
  onFilterChange: (filter: TaskFilter) => void;
  assignees: TaskAssignee[];
}

export const FiltersModal: React.FC<FiltersModalProps> = ({
  visible,
  onClose,
  selectedFilter,
  onFilterChange,
  assignees,
}) => {
  const statuses: TaskStatus[] = ['pending', 'in-progress', 'completed', 'on-hold', 'cancelled'];
  const priorities: TaskPriority[] = ['low', 'medium', 'high', 'urgent'];
  const categories: TaskCategory[] = ['development', 'design', 'research', 'meeting', 'documentation', 'testing', 'deployment'];

  const toggleFilter = <T extends keyof TaskFilter>(
    filterType: T,
    value: string
  ) => {
    const currentValues = selectedFilter[filterType] as string[] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    onFilterChange({
      ...selectedFilter,
      [filterType]: newValues.length > 0 ? newValues : undefined,
    });
  };

  const clearAllFilters = () => {
    onFilterChange({});
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View className="flex-1 bg-white">
        <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
          <Text className="text-xl font-bold text-gray-900">
            Filters
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Feather name="x" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 p-4">
          <View className="mb-6">
            <Text className="text-lg font-bold text-gray-900 mb-3">
              Status
            </Text>
            <View className="flex-row flex-wrap">
              {statuses.map((status) => {
                const isSelected = (selectedFilter.status || []).includes(status);
                return (
                  <TouchableOpacity
                    key={status}
                    onPress={() => toggleFilter('status', status)}
                    className={`px-3 py-2 rounded-full mr-2 mb-2 ${
                      isSelected ? 'bg-blue-500' : 'bg-gray-100'
                    }`}
                  >
                    <Text className={`text-sm capitalize ${
                      isSelected ? 'text-white' : 'text-gray-700'
                    }`}>
                      {status.replace('-', ' ')}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-lg font-bold text-gray-900 mb-3">
              Priority
            </Text>
            <View className="flex-row flex-wrap">
              {priorities.map((priority) => {
                const isSelected = (selectedFilter.priority || []).includes(priority);
                return (
                  <TouchableOpacity
                    key={priority}
                    onPress={() => toggleFilter('priority', priority)}
                    className={`px-3 py-2 rounded-full mr-2 mb-2 ${
                      isSelected ? 'bg-blue-500' : 'bg-gray-100'
                    }`}
                  >
                    <Text className={`text-sm capitalize ${
                      isSelected ? 'text-white' : 'text-gray-700'
                    }`}>
                      {priority}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-lg font-bold text-gray-900 mb-3">
              Category
            </Text>
            <View className="flex-row flex-wrap">
              {categories.map((category) => {
                const isSelected = (selectedFilter.category || []).includes(category);
                return (
                  <TouchableOpacity
                    key={category}
                    onPress={() => toggleFilter('category', category)}
                    className={`px-3 py-2 rounded-full mr-2 mb-2 ${
                      isSelected ? 'bg-blue-500' : 'bg-gray-100'
                    }`}
                  >
                    <Text className={`text-sm capitalize ${
                      isSelected ? 'text-white' : 'text-gray-700'
                    }`}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>

        <View className="p-4 border-t border-gray-200">
          <View className="flex-row space-x-3">
            <TouchableOpacity
              onPress={clearAllFilters}
              className="flex-1 bg-gray-100 rounded-xl py-3"
            >
              <Text className="text-center text-gray-700 font-semibold">
                Clear All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onClose}
              className="flex-1 bg-blue-500 rounded-xl py-3"
            >
              <Text className="text-center text-white font-semibold">
                Apply Filters
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};