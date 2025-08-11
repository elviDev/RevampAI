import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '../../contexts/ThemeContext';

interface TasksHeaderProps {
  onCreatePress: () => void;
  tasksCount: number;
}

export const TasksHeader: React.FC<TasksHeaderProps> = ({
  onCreatePress,
  tasksCount,
}) => {
  const { theme } = useTheme();

  return (
    <Animated.View
      entering={FadeInDown.duration(800)}
      style={{
        paddingHorizontal: 16,
        paddingVertical: 24,
        backgroundColor: theme.colors.background,
      }}
    >
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <View>
          <Text style={{
            fontSize: 28,
            fontWeight: 'bold',
            color: theme.colors.text.primary,
            marginBottom: 4,
          }}>
            Tasks
          </Text>
          <Text style={{
            color: theme.colors.text.secondary,
            fontSize: 14,
          }}>
            {tasksCount} {tasksCount === 1 ? 'task' : 'tasks'} total
          </Text>
        </View>
        
        <TouchableOpacity
          onPress={onCreatePress}
          style={{
            borderRadius: 16,
            shadowColor: theme.colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 6,
          }}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={theme.colors.gradients.primary}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderRadius: 16,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Feather name="plus" size={20} color={theme.colors.text.onPrimary} />
            <Text style={{
              color: theme.colors.text.onPrimary,
              fontWeight: '600',
              marginLeft: 8,
              fontSize: 16,
            }}>
              New Task
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};