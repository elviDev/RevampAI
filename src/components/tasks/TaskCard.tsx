import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, { 
  FadeInUp, 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import { Task } from '../../types/task.types';
import { Colors } from '../../utils/colors';
import { GlassCard } from '../common/GlassBackground';

interface TaskCardProps {
  task: Task;
  onPress: () => void;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onPress,
  onUpdate,
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const shadowOpacity = useSharedValue(0.1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
    shadowOpacity: shadowOpacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
    opacity.value = withTiming(0.9, { duration: 100 });
    shadowOpacity.value = withTiming(0.05, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    opacity.value = withTiming(1, { duration: 200 });
    shadowOpacity.value = withTiming(0.1, { duration: 200 });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return Colors.error;
      case 'high': return Colors.warning;
      case 'medium': return Colors.success;
      case 'low': return Colors.gray[500];
      default: return Colors.gray[500];
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return Colors.success;
      case 'in-progress': return Colors.warning;
      case 'pending': return Colors.gray[500];
      case 'on-hold': return Colors.error;
      default: return Colors.gray[500];
    }
  };

  const getPriorityGradient = (priority: string) => {
    switch (priority) {
      case 'urgent': return Colors.gradients.error;
      case 'high': return Colors.gradients.warning;
      case 'medium': return Colors.gradients.success;
      case 'low': return [Colors.gray[400], Colors.gray[500]];
      default: return [Colors.gray[400], Colors.gray[500]];
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Animated.View
      entering={FadeInUp.duration(600)}
      style={[
        {
          marginHorizontal: 16,
          marginBottom: 12,
        },
        animatedStyle,
      ]}
    >
      <GlassCard
        variant="light"
        intensity="medium"
        borderRadius={20}
        style={{
          shadowColor: Colors.shadows.neutral,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 4,
        }}
      >
        <AnimatedTouchableOpacity 
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={{ padding: 16 }}
          activeOpacity={0.9}
        >
          {/* Priority Gradient Bar */}
          <LinearGradient
            colors={getPriorityGradient(task.priority)}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
            }}
          />

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: 16,
                fontWeight: '700',
                color: Colors.text.primary,
                marginBottom: 4,
                lineHeight: 20,
              }}>
                {task.title}
              </Text>
              <Text style={{
                fontSize: 14,
                color: Colors.text.secondary,
                lineHeight: 18,
              }} numberOfLines={2}>
                {task.description}
              </Text>
            </View>
            
            {/* Priority Indicator */}
            <View style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              marginLeft: 12,
              marginTop: 2,
              shadowColor: getPriorityColor(task.priority),
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 3,
            }}>
              <LinearGradient
                colors={getPriorityGradient(task.priority)}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: 10,
                }}
              />
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: getStatusColor(task.status),
                marginRight: 8,
              }} />
              <Text style={{
                fontSize: 12,
                fontWeight: '600',
                color: Colors.text.secondary,
                textTransform: 'capitalize',
              }}>
                {task.status.replace('-', ' ')}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Feather name="calendar" size={12} color={Colors.text.tertiary} />
              <Text style={{
                fontSize: 12,
                color: Colors.text.tertiary,
                marginLeft: 4,
                fontWeight: '500',
              }}>
                {formatDate(task.dueDate)}
              </Text>
            </View>
          </View>

          {task.tags.length > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 }}>
              {task.tags.slice(0, 3).map((tag, index) => (
                <View
                  key={index}
                  style={{
                    backgroundColor: Colors.purple[100],
                    borderRadius: 12,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    marginRight: 6,
                    marginBottom: 4,
                  }}
                >
                  <Text style={{
                    fontSize: 11,
                    color: Colors.purple[700],
                    fontWeight: '600',
                  }}>
                    {tag}
                </Text>
              </View>
            ))}
            {task.tags.length > 3 && (
              <Text style={{
                fontSize: 11,
                color: Colors.text.tertiary,
                paddingVertical: 4,
                fontWeight: '500',
              }}>
                +{task.tags.length - 3} more
              </Text>
            )}
          </View>
        )}

        {task.progress > 0 && (
          <View style={{ marginTop: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={{
                fontSize: 11,
                color: Colors.text.secondary,
                fontWeight: '600',
              }}>
                Progress
              </Text>
              <Text style={{
                fontSize: 11,
                color: Colors.text.secondary,
                fontWeight: '600',
              }}>
                {task.progress}%
              </Text>
            </View>
            <View style={{
              backgroundColor: Colors.gray[200],
              borderRadius: 6,
              height: 6,
              overflow: 'hidden',
            }}>
              <LinearGradient
                colors={Colors.gradients.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  width: `${task.progress}%`,
                  height: '100%',
                  borderRadius: 6,
                }}
              />
            </View>
          </View>
        )}
        </AnimatedTouchableOpacity>
      </GlassCard>
    </Animated.View>
  );
};