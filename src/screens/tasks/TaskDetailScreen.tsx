import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSharedValue, withSpring } from 'react-native-reanimated';
import {
  Task,
  TaskStatus,
  TaskPriority,
  TaskComment,
  TaskAssignee,
} from '../../types/task.types';
import { taskService } from '../../services/api/taskService';
import { useAuth } from '../../hooks/useAuth';

// Import existing components
import { TaskDetailHeader } from '../../components/task/TaskDetailHeader';
import { TaskOverviewCard } from '../../components/task/TaskOverviewCard';
import { TaskProgressCard } from '../../components/task/TaskProgressCard';
import { TaskAssigneesCard } from '../../components/task/TaskAssigneesCard';
import { TaskSubtasksCard } from '../../components/task/TaskSubtasksCard';
import { TaskCommentsCard } from '../../components/task/TaskCommentsCard';
import { TaskTagsCard } from '../../components/task/TaskTagsCard';
import { TaskStatusModal } from '../../components/task/TaskStatusModal';
import { TaskPriorityModal } from '../../components/task/TaskPriorityModal';
import { TaskDetailFloatingActions } from '../../components/task/TaskDetailFloatingActions';
import { TaskUtils } from '../../components/task/TaskUtils';

interface TaskDetailScreenProps {
  navigation: any;
  route: {
    params: {
      taskId: string;
    };
  };
}

export const TaskDetailScreen: React.FC<TaskDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const insets = useSafeAreaInsets();
  const { taskId } = route.params;

  // State
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const [_showAssigneeModal, _setShowAssigneeModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get current user from auth context
  const { user } = useAuth();

  // Animation values
  const commentInputScale = useSharedValue(1);
  const fabScale = useSharedValue(1);

  // Load task details
  useEffect(() => {
    loadTaskDetails();
  }, [taskId]);

  const loadTaskDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await taskService.getTask(taskId);
      if (response.success && response.data) {
        const taskData = response.data;
        
        // Transform backend data to match component expectations
        const transformedTask: Task = {
          ...taskData,
          // Map backend fields to legacy component fields for compatibility
          assignees: taskData.assigned_to.map(userId => {
            // In a real app, you'd fetch user details or have them cached
            return {
              id: userId,
              name: `User ${userId.substring(0, 8)}`,
              avatar: userId.substring(0, 2).toUpperCase(),
              role: 'Team Member',
              email: `${userId}@company.com`,
            } as TaskAssignee;
          }),
          reporter: {
            id: taskData.created_by,
            name: `User ${taskData.created_by.substring(0, 8)}`,
            avatar: taskData.created_by.substring(0, 2).toUpperCase(),
            role: 'Task Creator',
            email: `${taskData.created_by}@company.com`,
          },
          channelId: taskData.channel_id,
          channelName: taskData.channel_name || 'General',
          dueDate: taskData.due_date ? new Date(taskData.due_date) : undefined,
          createdAt: new Date(taskData.created_at),
          updatedAt: new Date(taskData.updated_at),
          completedAt: taskData.completed_at ? new Date(taskData.completed_at) : undefined,
          estimatedHours: taskData.estimated_hours || 0,
          actualHours: taskData.actual_hours || 0,
          progress: taskData.progress_percentage || 0,
          category: taskData.task_type || 'general',
          subtasks: [], // TODO: Implement subtasks from backend
          comments: [], // TODO: Implement comments from backend
          attachments: [], // TODO: Implement attachments from backend
          dependencies: [], // TODO: Implement dependencies from backend
          watchers: taskData.watchers || [],
        };
        
        setTask(transformedTask);
      } else {
        setError('Failed to load task details');
      }
    } catch (err) {
      console.error('Error loading task:', err);
      setError(err instanceof Error ? err.message : 'Failed to load task');
    } finally {
      setIsLoading(false);
    }
  };

  // Action handlers
  const updateTaskStatus = async (newStatus: TaskStatus) => {
    if (!task) return;
    
    try {
      const response = await taskService.updateTaskStatus(task.id, newStatus);
      if (response.success && response.data) {
        const updatedData = response.data;
        setTask({
          ...task,
          status: updatedData.status,
          updatedAt: new Date(updatedData.updated_at),
          completed_at: updatedData.completed_at,
          progress: updatedData.progress_percentage,
        });
        setShowStatusModal(false);
        
        Alert.alert('Success', `Task status updated to ${newStatus}`);
      } else {
        Alert.alert('Error', 'Failed to update task status');
      }
    } catch (err) {
      console.error('Error updating task status:', err);
      Alert.alert('Error', 'Failed to update task status');
    }
  };

  const updateTaskPriority = async (newPriority: TaskPriority) => {
    if (!task) return;
    
    try {
      const response = await taskService.updateTask(task.id, { priority: newPriority });
      if (response.success && response.data) {
        const updatedData = response.data;
        setTask({
          ...task,
          priority: updatedData.priority,
          updatedAt: new Date(updatedData.updated_at),
        });
        setShowPriorityModal(false);
        
        Alert.alert('Success', `Task priority updated to ${newPriority}`);
      } else {
        Alert.alert('Error', 'Failed to update task priority');
      }
    } catch (err) {
      console.error('Error updating task priority:', err);
      Alert.alert('Error', 'Failed to update task priority');
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
          email: 'you@company.com',
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
      commentInputScale.value = withSpring(0.95, {}, () => {
        commentInputScale.value = withSpring(1);
      });
    }
  };

  const handleEditPress = () => {
    if (task) {
      navigation.navigate('TaskCreateScreen', { 
        taskId: task.id,
        channelId: task.channel_id 
      });
    }
  };

  const handleCompletePress = () => {
    if (task?.status !== 'completed') {
      Alert.alert(
        'Complete Task',
        'Are you sure you want to mark this task as completed?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Complete', 
            style: 'default',
            onPress: () => updateTaskStatus('completed')
          },
        ]
      );
    }
  };

  const handleAddAssignee = () => {
    // Future: implement add assignee functionality
    console.log('Add assignee');
  };

  if (isLoading) {
    return (
      <View
        className="flex-1 bg-gray-50 items-center justify-center"
        style={{ paddingTop: insets.top }}
      >
        <View className="items-center">
          <View className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center mb-4">
            <Text className="text-blue-600 text-lg font-bold">⏳</Text>
          </View>
          <Text className="text-gray-600 text-lg font-medium">Loading task...</Text>
          <Text className="text-gray-400 text-sm mt-1">Please wait a moment</Text>
        </View>
      </View>
    );
  }

  if (error || !task) {
    return (
      <View
        className="flex-1 bg-gray-50 items-center justify-center"
        style={{ paddingTop: insets.top }}
      >
        <View className="items-center">
          <View className="w-16 h-16 bg-red-100 rounded-full items-center justify-center mb-4">
            <Text className="text-red-600 text-lg font-bold">⚠️</Text>
          </View>
          <Text className="text-gray-600 text-lg font-medium">{error || 'Task not found'}</Text>
          <Text className="text-gray-400 text-sm mt-1">Please check the task ID</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      {/* Clean Header */}
      <TaskDetailHeader
        title="Task Details"
        subtitle={task.channelName}
        onBack={() => navigation.goBack()}
        onEdit={handleEditPress}
        isEditing={isEditing}
      />

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Task Overview Card */}
        <TaskOverviewCard
          task={task}
          onStatusPress={() => setShowStatusModal(true)}
          onPriorityPress={() => setShowPriorityModal(true)}
        />

        {/* Progress Card */}
        <TaskProgressCard
          task={task}
          formatDueDate={TaskUtils.formatDueDate}
        />

        {/* Assignees Card */}
        <TaskAssigneesCard
          assignees={task.assignees}
          onAddAssignee={handleAddAssignee}
          onAssigneePress={(assigneeId) => {
            navigation.navigate('UserProfile', { userId: assigneeId });
          }}
        />

        {/* Subtasks Card */}
        <TaskSubtasksCard
          subtasks={task.subtasks}
          onToggleSubtask={toggleSubtask}
          onAddSubtask={() => {
            // Future: implement add subtask functionality
            console.log('Add subtask');
          }}
        />

        {/* Comments Card */}
        <TaskCommentsCard
          comments={task.comments}
          newComment={newComment}
          onNewCommentChange={setNewComment}
          onAddComment={addComment}
          formatTimeAgo={TaskUtils.formatTimeAgo}
          commentInputScale={commentInputScale}
          onAuthorPress={(authorId) => {
            navigation.navigate('UserProfile', { userId: authorId });
          }}
        />

        {/* Tags Card */}
        <TaskTagsCard tags={task.tags} />
      </ScrollView>

      {/* Floating Action Buttons */}
      <TaskDetailFloatingActions
        fabScale={fabScale}
        onEditPress={handleEditPress}
        onCompletePress={handleCompletePress}
      />

      {/* Status Modal */}
      <TaskStatusModal
        visible={showStatusModal}
        currentStatus={task.status}
        onStatusChange={updateTaskStatus}
        onClose={() => setShowStatusModal(false)}
      />

      {/* Priority Modal */}
      <TaskPriorityModal
        visible={showPriorityModal}
        currentPriority={task.priority}
        onPriorityChange={updateTaskPriority}
        onClose={() => setShowPriorityModal(false)}
      />
    </View>
  );
};