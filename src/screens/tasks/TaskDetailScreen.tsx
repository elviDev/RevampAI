import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeInRight,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import {
  Task,
  TaskStatus,
  TaskPriority,
  TaskCategory,
  TaskAssignee,
  TaskComment,
  TaskSubtask,
} from '../../types/task.types';

interface TaskDetailScreenProps {
  navigation: any;
  route: {
    params: {
      taskId: string;
    };
  };
}

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

export const TaskDetailScreen: React.FC<TaskDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const insets = useSafeAreaInsets();
  const { taskId } = route.params;

  // State
  const [task, setTask] = useState<Task | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const [showAssigneeModal, setShowAssigneeModal] = useState(false);

  // Animation values
  const headerOpacity = useSharedValue(1);
  const commentInputScale = useSharedValue(1);

  // Mock data - in real app, fetch from API/Redux
  useEffect(() => {
    loadTaskDetails();
  }, [taskId]);

  const loadTaskDetails = () => {
    // Mock task data
    const mockTask: Task = {
      id: taskId,
      title: 'Implement advanced search functionality',
      description:
        'Create a comprehensive search system with filters, sorting, and real-time results. The search should be fast, accurate, and provide suggestions.',
      status: 'in-progress',
      priority: 'high',
      category: 'development',
      assignees: [
        {
          id: '1',
          name: 'John Doe',
          avatar: 'J',
          role: 'Frontend Developer',
          email: 'john@example.com',
        },
        {
          id: '2',
          name: 'Sarah Wilson',
          avatar: 'S',
          role: 'UX Designer',
          email: 'sarah@example.com',
        },
      ],
      reporter: {
        id: '3',
        name: 'Mike Johnson',
        avatar: 'M',
        role: 'Product Manager',
        email: 'mike@example.com',
      },
      channelId: '1',
      channelName: 'Frontend Team',
      tags: ['search', 'frontend', 'performance', 'user-experience'],
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      estimatedHours: 32,
      actualHours: 18,
      progress: 60,
      subtasks: [
        {
          id: 's1',
          title: 'Design search UI components',
          completed: true,
          assignee: {
            id: '2',
            name: 'Sarah Wilson',
            avatar: 'S',
            role: 'UX Designer',
            email: 'sarah@example.com',
          },
        },
        {
          id: 's2',
          title: 'Implement search API integration',
          completed: true,
        },
        { id: 's3', title: 'Add filter functionality', completed: false },
        { id: 's4', title: 'Performance optimization', completed: false },
        { id: 's5', title: 'User testing and feedback', completed: false },
      ],
      comments: [
        {
          id: 'c1',
          content:
            'Great progress on the UI! The search interface looks clean and intuitive.',
          author: {
            id: '3',
            name: 'Mike Johnson',
            avatar: 'M',
            role: 'Product Manager',
            email: 'mike@example.com',
          },
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        },
        {
          id: 'c2',
          content:
            "I've completed the API integration. The response time is under 200ms for most queries.",
          author: {
            id: '1',
            name: 'John Doe',
            avatar: 'J',
            role: 'Frontend Developer',
            email: 'john@example.com',
          },
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        },
      ],
      attachments: [],
      dependencies: ['task-456', 'task-789'],
      watchers: [],
    };
    setTask(mockTask);
  };

  // Helper functions
  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent':
        return '#EF4444';
      case 'high':
        return '#F97316';
      case 'medium':
        return '#EAB308';
      case 'low':
        return '#22C55E';
      default:
        return '#6B7280';
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'pending':
        return '#6B7280';
      case 'in-progress':
        return '#3B82F6';
      case 'completed':
        return '#22C55E';
      case 'on-hold':
        return '#F59E0B';
      case 'cancelled':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getCategoryIcon = (category: TaskCategory) => {
    switch (category) {
      case 'development':
        return 'code';
      case 'design':
        return 'palette';
      case 'research':
        return 'search';
      case 'meeting':
        return 'users';
      case 'documentation':
        return 'file-text';
      case 'testing':
        return 'check-circle';
      case 'deployment':
        return 'upload';
      default:
        return 'circle';
    }
  };

  const formatDueDate = (dueDate: Date) => {
    const now = new Date();
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''}`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return 'Due tomorrow';
    } else if (diffDays <= 7) {
      return `Due in ${diffDays} days`;
    } else {
      return dueDate.toLocaleDateString();
    }
  };

  const updateTaskStatus = (newStatus: TaskStatus) => {
    if (task) {
      setTask({ ...task, status: newStatus, updatedAt: new Date() });
      setShowStatusModal(false);
    }
  };

  const updateTaskPriority = (newPriority: TaskPriority) => {
    if (task) {
      setTask({ ...task, priority: newPriority, updatedAt: new Date() });
      setShowPriorityModal(false);
    }
  };

  const toggleSubtask = (subtaskId: string) => {
    if (task) {
      const updatedSubtasks = task.subtasks.map(subtask =>
        subtask.id === subtaskId
          ? { ...subtask, completed: !subtask.completed }
          : subtask,
      );
      const completedCount = updatedSubtasks.filter(s => s.completed).length;
      const progress = Math.round(
        (completedCount / updatedSubtasks.length) * 100,
      );

      setTask({
        ...task,
        subtasks: updatedSubtasks,
        progress,
        updatedAt: new Date(),
      });
    }
  };

  const addComment = () => {
    if (newComment.trim() && task) {
      const comment: TaskComment = {
        id: Date.now().toString(),
        content: newComment.trim(),
        author: {
          id: 'current_user',
          name: 'You',
          avatar: 'Y',
          role: 'Developer',
          email: 'you@example.com',
        },
        timestamp: new Date(),
      };

      setTask({
        ...task,
        comments: [...task.comments, comment],
        updatedAt: new Date(),
      });
      setNewComment('');

      // Animation feedback
      commentInputScale.value = withSpring(0.98, {}, () => {
        commentInputScale.value = withSpring(1);
      });
    }
  };

  const animatedCommentInputStyle = useAnimatedStyle(() => ({
    transform: [{ scale: commentInputScale.value }],
  }));

  if (!task) {
    return (
      <View
        className="flex-1 bg-gray-50 items-center justify-center"
        style={{ paddingTop: insets.top }}
      >
        <Text className="text-gray-500 text-lg">Loading task...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <Animated.View
        entering={FadeInDown.duration(600)}
        className="bg-white px-4 py-3 border-b border-gray-100"
      >
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
          >
            <Feather name="arrow-left" size={20} color="#6B7280" />
          </TouchableOpacity>

          <View className="flex-1 mx-4">
            <Text className="text-lg font-bold text-gray-900" numberOfLines={1}>
              Task Details
            </Text>
            <Text className="text-sm text-gray-500">
              {task.channelName} • {task.category}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => setIsEditing(!isEditing)}
            className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
          >
            <Feather name="edit-2" size={18} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* Task Header */}
        <Animated.View
          entering={FadeInUp.delay(200).duration(600)}
          className="bg-white mx-4 mt-4 rounded-2xl p-6"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 0,
          }}
        >
          {/* Title and Category */}
          <View className="flex-row items-start mb-4">
            <View className="flex-1">
              <View className="flex-row items-center mb-2">
                <Feather
                  name={getCategoryIcon(task.category)}
                  size={16}
                  color="#6B7280"
                />
                <Text className="text-gray-500 text-xs ml-2 uppercase tracking-wide">
                  {task.category}
                </Text>
              </View>
              <Text className="text-2xl font-bold text-gray-900 mb-2">
                {task.title}
              </Text>
              <Text className="text-gray-600 leading-6">
                {task.description}
              </Text>
            </View>
          </View>

          {/* Status Cards */}
          <View className="flex-row space-x-3 mb-6">
            {/* Status */}
            <TouchableOpacity
              onPress={() => setShowStatusModal(true)}
              className="flex-1 p-3 rounded-xl border border-gray-200"
            >
              <Text className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                Status
              </Text>
              <View className="flex-row items-center">
                <View
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: getStatusColor(task.status) }}
                />
                <Text className="text-sm font-medium text-gray-900">
                  {task.status.replace('-', ' ').toUpperCase()}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Priority */}
            <TouchableOpacity
              onPress={() => setShowPriorityModal(true)}
              className="flex-1 p-3 rounded-xl border border-gray-200"
            >
              <Text className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                Priority
              </Text>
              <View className="flex-row items-center">
                <View
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: getPriorityColor(task.priority) }}
                />
                <Text className="text-sm font-medium text-gray-900">
                  {task.priority.toUpperCase()}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Due Date */}
            <View className="flex-1 p-3 rounded-xl border border-gray-200">
              <Text className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                Due Date
              </Text>
              <Text className="text-sm font-medium text-gray-900">
                {formatDueDate(task.dueDate)}
              </Text>
            </View>
          </View>

          {/* Progress */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-sm font-medium text-gray-900">
                Progress
              </Text>
              <Text className="text-sm font-bold text-gray-900">
                {task.progress}%
              </Text>
            </View>
            <View className="h-3 bg-gray-200 rounded-full">
              <LinearGradient
                colors={['#3933C6', '#A05FFF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  width: `${task.progress}%`,
                  height: '100%',
                  borderRadius: 6,
                }}
              />
            </View>
          </View>

          {/* Assignees */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-900 mb-3">
              Assignees
            </Text>
            <View className="flex-row flex-wrap gap-3">
              {task.assignees.map((assignee, index) => (
                <View
                  key={assignee.id}
                  className="flex-row items-center bg-gray-50 rounded-lg px-3 py-2"
                >
                  <LinearGradient
                    colors={
                      index % 2 === 0
                        ? ['#3933C6', '#A05FFF']
                        : ['#A05FFF', '#3933C6']
                    }
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 8,
                    }}
                  >
                    <Text className="text-white text-xs font-bold">
                      {assignee.avatar}
                    </Text>
                  </LinearGradient>
                  <Text className="text-sm font-medium text-gray-900">
                    {assignee.name}
                  </Text>
                </View>
              ))}
              <TouchableOpacity
                onPress={() => setShowAssigneeModal(true)}
                className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2"
              >
                <Feather name="plus" size={16} color="#6B7280" />
                <Text className="text-sm text-gray-600 ml-2">Add assignee</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Tags */}
          <View>
            <Text className="text-sm font-medium text-gray-900 mb-3">Tags</Text>
            <View className="flex-row flex-wrap gap-2">
              {task.tags.map((tag, index) => (
                <View key={index} className="bg-blue-50 px-3 py-1 rounded-full">
                  <Text className="text-blue-600 text-xs font-medium">
                    #{tag}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </Animated.View>

        {/* Subtasks */}
        <Animated.View
          entering={FadeInUp.delay(400).duration(600)}
          className="bg-white mx-4 mt-4 rounded-2xl p-6"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 0,
          }}
        >
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-bold text-gray-900">
              Subtasks ({task.subtasks.filter(s => s.completed).length}/
              {task.subtasks.length})
            </Text>
            <TouchableOpacity className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center">
              <Feather name="plus" size={16} color="#3B82F6" />
            </TouchableOpacity>
          </View>

          {task.subtasks.map((subtask, index) => (
            <Animated.View
              key={subtask.id}
              entering={FadeInRight.delay(index * 100).duration(400)}
              className="flex-row items-center py-3 border-b border-gray-100 last:border-b-0"
            >
              <TouchableOpacity
                onPress={() => toggleSubtask(subtask.id)}
                className={`w-5 h-5 rounded border-2 mr-3 items-center justify-center ${
                  subtask.completed
                    ? 'bg-green-500 border-green-500'
                    : 'border-gray-300'
                }`}
              >
                {subtask.completed && (
                  <Feather name="check" size={12} color="white" />
                )}
              </TouchableOpacity>

              <Text
                className={`flex-1 ${
                  subtask.completed
                    ? 'text-gray-500 line-through'
                    : 'text-gray-900'
                }`}
              >
                {subtask.title}
              </Text>

              {subtask.assignee && (
                <LinearGradient
                  colors={['#3933C6', '#A05FFF']}
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text className="text-white text-xs font-bold">
                    {subtask.assignee.avatar}
                  </Text>
                </LinearGradient>
              )}
            </Animated.View>
          ))}
        </Animated.View>

        {/* Comments */}
        <Animated.View
          entering={FadeInUp.delay(600).duration(600)}
          className="bg-white mx-4 mt-4 rounded-2xl p-6"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 0,
          }}
        >
          <Text className="text-lg font-bold text-gray-900 mb-4">
            Comments ({task.comments.length})
          </Text>

          {task.comments.map((comment, index) => (
            <Animated.View
              key={comment.id}
              entering={FadeInUp.delay(index * 100).duration(400)}
              className="flex-row mb-4 last:mb-0"
            >
              <LinearGradient
                colors={['#3933C6', '#A05FFF']}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 12,
                }}
              >
                <Text className="text-white text-sm font-bold">
                  {comment.author.avatar}
                </Text>
              </LinearGradient>

              <View className="flex-1">
                <View className="flex-row items-center mb-1">
                  <Text className="font-medium text-gray-900 mr-2">
                    {comment.author.name}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    {comment.timestamp.toLocaleTimeString()}
                  </Text>
                </View>
                <Text className="text-gray-700 leading-5">
                  {comment.content}
                </Text>
              </View>
            </Animated.View>
          ))}

          {/* Add Comment */}
          <Animated.View
            style={animatedCommentInputStyle}
            className="flex-row items-center mt-4 pt-4 border-t border-gray-100"
          >
            <LinearGradient
              colors={['#3933C6', '#A05FFF']}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 12,
              }}
            >
              <Text className="text-white text-sm font-bold">Y</Text>
            </LinearGradient>

            <View className="flex-1 flex-row items-center bg-gray-50 rounded-lg px-3 py-2">
              <TextInput
                placeholder="Add a comment..."
                value={newComment}
                onChangeText={setNewComment}
                className="flex-1 text-gray-900"
                placeholderTextColor="#9CA3AF"
                multiline
              />
              {newComment.trim() && (
                <TouchableOpacity onPress={addComment} className="ml-2">
                  <Feather name="send" size={18} color="#3933C6" />
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>
        </Animated.View>

        <View className="h-20" />
      </ScrollView>

      {/* Status Modal */}
      <Modal visible={showStatusModal} transparent animationType="fade">
        <View className="flex-1 bg-black bg-opacity-50 justify-center px-4">
          <View className="bg-white rounded-2xl p-6">
            <Text className="text-xl font-bold text-gray-900 mb-4">
              Update Status
            </Text>
            {(
              [
                'pending',
                'in-progress',
                'completed',
                'on-hold',
                'cancelled',
              ] as TaskStatus[]
            ).map(status => (
              <TouchableOpacity
                key={status}
                onPress={() => updateTaskStatus(status)}
                className="flex-row items-center py-3 border-b border-gray-100 last:border-b-0"
              >
                <View
                  className="w-4 h-4 rounded-full mr-3"
                  style={{ backgroundColor: getStatusColor(status) }}
                />
                <Text className="text-gray-900 font-medium">
                  {status.replace('-', ' ').toUpperCase()}
                </Text>
                {task.status === status && (
                  <Feather
                    name="check"
                    size={16}
                    color="#22C55E"
                    style={{ marginLeft: 'auto' }}
                  />
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => setShowStatusModal(false)}
              className="mt-4 bg-gray-100 rounded-lg py-3"
            >
              <Text className="text-center text-gray-700 font-medium">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Priority Modal */}
      <Modal visible={showPriorityModal} transparent animationType="fade">
        <View className="flex-1 bg-black bg-opacity-50 justify-center px-4">
          <View className="bg-white rounded-2xl p-6">
            <Text className="text-xl font-bold text-gray-900 mb-4">
              Update Priority
            </Text>
            {(['low', 'medium', 'high', 'urgent'] as TaskPriority[]).map(
              priority => (
                <TouchableOpacity
                  key={priority}
                  onPress={() => updateTaskPriority(priority)}
                  className="flex-row items-center py-3 border-b border-gray-100 last:border-b-0"
                >
                  <View
                    className="w-4 h-4 rounded-full mr-3"
                    style={{ backgroundColor: getPriorityColor(priority) }}
                  />
                  <Text className="text-gray-900 font-medium">
                    {priority.toUpperCase()}
                  </Text>
                  {task.priority === priority && (
                    <Feather
                      name="check"
                      size={16}
                      color="#22C55E"
                      style={{ marginLeft: 'auto' }}
                    />
                  )}
                </TouchableOpacity>
              ),
            )}
            <TouchableOpacity
              onPress={() => setShowPriorityModal(false)}
              className="mt-4 bg-gray-100 rounded-lg py-3"
            >
              <Text className="text-center text-gray-700 font-medium">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};
