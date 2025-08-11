import React from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import Animated, {
  SlideInRight,
} from 'react-native-reanimated';
import { TaskAssignee } from '../../types/task.types';
import { mockAssignees } from '../../utils/taskUtils';

interface EnhancedAssigneeSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  selectedAssignees: TaskAssignee[];
  onToggleAssignee: (assignee: TaskAssignee) => void;
}

export const EnhancedAssigneeSelectionModal: React.FC<EnhancedAssigneeSelectionModalProps> = ({
  visible,
  onClose,
  selectedAssignees,
  onToggleAssignee,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-white">
        {/* Enhanced Modal Header */}
        <View style={{ paddingTop: insets.top }}>
          <LinearGradient
            colors={['#6366F1', '#8B5CF6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="px-6 py-6"
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <TouchableOpacity
                  onPress={onClose}
                  className="w-10 h-10 bg-white bg-opacity-20 rounded-full items-center justify-center mr-4"
                >
                  <Feather name="x" size={20} color="white" />
                </TouchableOpacity>
                <View>
                  <Text className="text-white text-xl font-bold">
                    Assign Team Members
                  </Text>
                  <Text className="text-white text-sm opacity-80">
                    Select people to work on this task
                  </Text>
                </View>
              </View>
              <View className="w-10 h-10 bg-white bg-opacity-20 rounded-full items-center justify-center">
                <Feather name="users" size={20} color="white" />
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Enhanced Content */}
        <ScrollView
          className="flex-1 px-6 py-8"
          showsVerticalScrollIndicator={false}
        >
          {/* Selection Stats */}
          <View className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 mb-8 border border-indigo-100">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-indigo-900 font-bold text-lg">
                  {selectedAssignees.length} Selected
                </Text>
                <Text className="text-indigo-600 text-sm">
                  Choose team members for collaboration
                </Text>
              </View>
              <View className="w-12 h-12 bg-indigo-100 rounded-full items-center justify-center">
                <Text className="text-indigo-600 font-bold text-lg">
                  {selectedAssignees.length}
                </Text>
              </View>
            </View>
          </View>

          {/* Team Members List */}
          <Text className="text-gray-900 font-bold text-xl mb-6">
            Available Team Members
          </Text>

          <View className="space-y-4">
            {mockAssignees.map((assignee, index) => {
              const isSelected = selectedAssignees.some(
                a => a.id === assignee.id,
              );

              return (
                <Animated.View
                  key={assignee.id}
                  entering={SlideInRight.delay(index * 100).duration(600)}
                >
                  <TouchableOpacity
                    onPress={() => onToggleAssignee(assignee)}
                    className={`rounded-2xl p-5 border-2 ${
                      isSelected
                        ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200'
                        : 'bg-white border-gray-200'
                    }`}
                    style={{
                      transform: [{ scale: isSelected ? 1.02 : 1 }],
                      shadowColor: isSelected ? '#6366F1' : '#000',
                      shadowOffset: { width: 0, height: isSelected ? 4 : 2 },
                      shadowOpacity: isSelected ? 0.2 : 0.1,
                      shadowRadius: isSelected ? 8 : 4,
                      elevation: isSelected ? 8 : 2,
                    }}
                  >
                    <View className="flex-row items-center">
                      {/* Enhanced Avatar */}
                      <LinearGradient
                        colors={
                          index % 3 === 0
                            ? ['#6366F1', '#8B5CF6']
                            : index % 3 === 1
                            ? ['#8B5CF6', '#EC4899']
                            : ['#EC4899', '#F59E0B']
                        }
                        className="w-16 h-16 rounded-full items-center justify-center mr-4"
                      >
                        <Text className="text-white text-xl font-bold">
                          {assignee.avatar}
                        </Text>
                      </LinearGradient>

                      {/* Member Info */}
                      <View className="flex-1">
                        <Text
                          className={`font-bold text-lg ${
                            isSelected ? 'text-indigo-900' : 'text-gray-900'
                          }`}
                        >
                          {assignee.name}
                        </Text>
                        <Text
                          className={`font-medium text-sm ${
                            isSelected ? 'text-indigo-600' : 'text-blue-600'
                          }`}
                        >
                          {assignee.role}
                        </Text>
                        <Text
                          className={`text-sm ${
                            isSelected ? 'text-indigo-500' : 'text-gray-500'
                          }`}
                        >
                          {assignee.email}
                        </Text>
                      </View>

                      {/* Selection Indicator */}
                      <View
                        className={`w-8 h-8 rounded-full border-2 items-center justify-center ${
                          isSelected
                            ? 'bg-indigo-500 border-indigo-500'
                            : 'border-gray-300'
                        }`}
                      >
                        {isSelected && (
                          <Feather name="check" size={16} color="white" />
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>
        </ScrollView>

        {/* Enhanced Footer */}
        <View className="border-t border-gray-200 p-6 bg-white">
          <TouchableOpacity
            onPress={onClose}
            className="rounded-2xl shadow-lg"
          >
            <LinearGradient
              colors={['#6366F1', '#8B5CF6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="rounded-2xl py-5 flex-row items-center justify-center"
            >
              <Feather name="check" size={24} color="white" />
              <Text className="text-white font-bold text-lg ml-3">
                Done ({selectedAssignees.length} selected)
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
