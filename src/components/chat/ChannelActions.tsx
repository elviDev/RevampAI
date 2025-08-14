import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

interface ChannelActionsProps {
  onGenerateSummary: () => void;
  onCreateTasks: () => void;
  isGeneratingSummary?: boolean;
  isCreatingTasks?: boolean;
}

export const ChannelActions: React.FC<ChannelActionsProps> = ({
  onGenerateSummary,
  onCreateTasks,
  isGeneratingSummary = false,
  isCreatingTasks = false,
}) => {
  const summaryScale = useSharedValue(1);
  const tasksScale = useSharedValue(1);

  const summaryAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: summaryScale.value }],
  }));

  const tasksAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: tasksScale.value }],
  }));

  return (
    <View className="flex-row px-4 py-3 space-x-3 bg-white border-b border-gray-100">
      {/* Generate Summary Button */}
      <Animated.View style={[summaryAnimatedStyle, { flex: 1 }]}>
        <TouchableOpacity
          onPress={onGenerateSummary}
          disabled={isGeneratingSummary}
          className="opacity-90"
        >
          <LinearGradient
            colors={['#3933C6', '#A05FFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: 12,
              paddingVertical: 10,
              paddingHorizontal: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MaterialIcon 
              name={isGeneratingSummary ? "hourglass-empty" : "summarize"} 
              size={18} 
              color="white" 
            />
            <Text className="text-white text-sm font-semibold ml-2">
              {isGeneratingSummary ? 'Generating...' : 'AI Summary'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* Create Tasks Button */}
      <Animated.View style={[tasksAnimatedStyle, { flex: 1 }]}>
        <TouchableOpacity
          onPress={onCreateTasks}
          disabled={isCreatingTasks}
          className="opacity-90"
        >
          <LinearGradient
            colors={['#059669', '#10B981']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: 12,
              paddingVertical: 10,
              paddingHorizontal: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MaterialIcon 
              name={isCreatingTasks ? "hourglass-empty" : "add-task"} 
              size={18} 
              color="white" 
            />
            <Text className="text-white text-sm font-semibold ml-2">
              {isCreatingTasks ? 'Creating...' : 'Create Tasks'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};