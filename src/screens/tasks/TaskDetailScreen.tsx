import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSharedValue, withSpring } from 'react-native-reanimated';
import {
  Task,
  TaskStatus,
  TaskPriority,
  TaskComment,
} from '../../types/task.types';

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
  const [isEditing, setIsEditing] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const [_showAssigneeModal, _setShowAssigneeModal] = useState(false);

  // Animation values
  const commentInputScale = useSharedValue(1);
  const fabScale = useSharedValue(1);

  // Load task details
  useEffect(() => {
    loadTaskDetails();
  }, [taskId]);

  const loadTaskDetails = () => {
    // Mock task data - in real app this would come from API/database
    const mockTask: Task = {
      id: taskId,
      title: 'Implement Advanced Search Functionality',
      description:
        'Create a comprehensive search system with filters, sorting, and real-time results. The search should be fast, accurate, and provide intelligent suggestions to improve user experience.',
      status: 'in-progress',
      priority: 'high',
      category: 'development',
      assignees: [
        {
          id: '1',
          name: 'John Smith',
          avatar: 'JS',
          role: 'Frontend Developer',
          email: 'john.smith@company.com',
        },
        {
          id: '2',
          name: 'Sarah Wilson',
          avatar: 'SW',
          role: 'UX Designer',
          email: 'sarah.wilson@company.com',
        },
      ],
      reporter: {
        id: '3',
        name: 'Mike Johnson',
        avatar: 'MJ',
        role: 'Product Manager',
        email: 'mike.johnson@company.com',
      },
      channelId: '1',
      channelName: 'Frontend Team',
      tags: ['search', 'frontend', 'performance', 'ux'],
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
        },
        {
          id: 's2',
          title: 'Implement search API integration',
          completed: true,
        },
        { id: 's3', title: 'Add advanced filter functionality', completed: false },
        { id: 's4', title: 'Performance optimization and caching', completed: false },
        { id: 's5', title: 'User testing and feedback collection', completed: false },
      ],
      comments: [
        {
          id: 'c1',
          content:
            'Great progress on the UI components! The search interface looks clean and intuitive. Ready for backend integration.',
          author: {
            id: '3',
            name: 'Mike Johnson',
            avatar: 'MJ',
            role: 'Product Manager',
            email: 'mike.johnson@company.com',
          },
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        },
        {
          id: 'c2',
          content:
            "Successfully completed the API integration. The response time is under 200ms for most queries. Moving on to advanced filters next.",
          author: {
            id: '1',
            name: 'John Smith',
            avatar: 'JS',
            role: 'Frontend Developer',
            email: 'john.smith@company.com',
          },
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        },
      ],
      attachments: [],
      dependencies: [],
      watchers: [],
    };
    setTask(mockTask);
  };

  // Action handlers
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
    setIsEditing(!isEditing);
  };

  const handleCompletePress = () => {
    if (task?.status !== 'completed') {
      updateTaskStatus('completed');
    }
  };

  const handleAddAssignee = () => {
    // Future: implement add assignee functionality
    console.log('Add assignee');
  };

  if (!task) {
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