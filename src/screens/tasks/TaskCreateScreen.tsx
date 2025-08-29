import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  StatusBar,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSharedValue, withSpring } from 'react-native-reanimated';
import DateTimePicker from '@react-native-community/datetimepicker';
import DocumentPicker from '@react-native-documents/picker';
import {
  TaskPriority,
  TaskCategory,
  TaskAssignee,
  Task,
} from '../../types/task.types';
import { MainStackParamList } from '../../types/navigation.types';

// Import new components
import { TaskCreateHeader } from '../../components/task/TaskCreateHeader';
import { TaskCreateNavigation } from '../../components/task/TaskCreateNavigation';
import { TaskBasicInfo } from '../../components/task/TaskBasicInfo';
import { TaskTimeline } from '../../components/task/TaskTimeline';
import { TaskRequirements } from '../../components/task/TaskRequirements';
import { TaskTeamAssignment } from '../../components/task/TaskTeamAssignment';
import { taskService } from '../../services/api/taskService';
import { userService } from '../../services/api/userService';
import { useAuth } from '../../hooks/useAuth';
import { CreateTaskData } from '../../types/task.types';

type TaskCreateScreenProps = NativeStackScreenProps<
  MainStackParamList,
  'TaskCreateScreen'
> & {
  route: {
    params?: {
      taskId?: string; // For editing existing tasks
      channelId?: string; // When creating from a channel
    };
  };
};

interface FormData {
  title: string;
  description: string;
  priority: TaskPriority;
  category: TaskCategory;
  startDate: Date;
  endDate: Date;
  estimatedHours: string;
  tags: string[];
  assignees: TaskAssignee[];
  features: string[];
  deliverables: Array<{
    id: string;
    title: string;
    description: string;
    completed: boolean;
  }>;
  successCriteria: Array<{
    id: string;
    criteria: string;
    met: boolean;
  }>;
  documentLinks: string[];
  attachments: Array<{
    id: string;
    name: string;
    type: string;
    uri: string;
    size?: number;
  }>;
  // Backend fields
  channel_id?: string;
  owned_by?: string;
}

interface FormErrors {
  title: string;
  description: string;
  assignees: string;
  startDate: string;
  endDate: string;
  general: string;
}

export const TaskCreateScreen: React.FC<TaskCreateScreenProps> = ({
  navigation,
  route,
}) => {
  const { user } = useAuth();
  const isEditMode = !!route.params?.taskId;
  const channelId = route.params?.channelId;
  const scrollViewRef = useRef<ScrollView>(null);

  // Animation values
  const buttonScale = useSharedValue(1);

  // Form state
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    priority: 'medium',
    category: 'development',
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    estimatedHours: '',
    tags: [],
    assignees: [],
    features: [],
    deliverables: [],
    successCriteria: [],
    documentLinks: [],
    attachments: [],
    channel_id: channelId,
    owned_by: user?.id,
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({
    title: '',
    description: '',
    assignees: '',
    startDate: '',
    endDate: '',
    general: '',
  });

  // UI states
  const [currentPage, setCurrentPage] = useState(1);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [availableAssignees, setAvailableAssignees] = useState<TaskAssignee[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, [isEditMode, route.params?.taskId]);

  const loadInitialData = async () => {
    setIsLoadingData(true);
    try {
      // Load available users for assignment
      await loadAvailableUsers();
      
      // If editing, load existing task data
      if (isEditMode && route.params?.taskId) {
        await loadExistingTask(route.params.taskId);
      } else if (channelId) {
        // Pre-fill channel if creating from channel
        setFormData(prev => ({ ...prev, channel_id: channelId }));
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      Alert.alert('Error', 'Failed to load data. Please try again.');
    } finally {
      setIsLoadingData(false);
    }
  };

  const loadAvailableUsers = async () => {
    try {
      // In a real app, you'd fetch users from the API
      // For now, we'll use mock data but make it look like it came from API
      const mockUsers: TaskAssignee[] = [
        {
          id: user?.id || 'current-user',
          name: user?.name || 'You',
          avatar: user?.name ? user.name.split(' ').map(n => n[0]).join('') : 'YU',
          role: 'Current User',
          email: user?.email || 'you@company.com',
        },
        {
          id: 'user-1',
          name: 'John Smith',
          avatar: 'JS',
          role: 'Frontend Developer',
          email: 'john.smith@company.com',
        },
        {
          id: 'user-2',
          name: 'Sarah Wilson',
          avatar: 'SW',
          role: 'UI/UX Designer',
          email: 'sarah.wilson@company.com',
        },
        {
          id: 'user-3',
          name: 'Mike Johnson',
          avatar: 'MJ',
          role: 'Product Manager',
          email: 'mike.johnson@company.com',
        },
        {
          id: 'user-4',
          name: 'Alex Chen',
          avatar: 'AC',
          role: 'Backend Developer',
          email: 'alex.chen@company.com',
        },
        {
          id: 'user-5',
          name: 'Emily Davis',
          avatar: 'ED',
          role: 'DevOps Engineer',
          email: 'emily.davis@company.com',
        },
      ];
      
      setAvailableAssignees(mockUsers);
      
      // Auto-assign current user if not editing
      if (!isEditMode && user?.id) {
        const currentUserAssignee = mockUsers.find(u => u.id === user.id);
        if (currentUserAssignee) {
          setFormData(prev => ({ 
            ...prev, 
            assignees: [currentUserAssignee],
            owned_by: user.id 
          }));
        }
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadExistingTask = async (taskId: string) => {
    try {
      const response = await taskService.getTask(taskId);
      if (response.success && response.data) {
        const task = response.data;
        
        // Wait a bit to ensure availableAssignees are loaded
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Transform task data to form data
        const taskAssignees = availableAssignees.filter(user => 
          task.assigned_to.includes(user.id)
        );
        
        // If no assignees found in current list, create basic assignee objects
        const finalAssignees = taskAssignees.length > 0 
          ? taskAssignees 
          : task.assigned_to.map(userId => ({
              id: userId,
              name: `User ${userId.substring(0, 8)}`,
              avatar: userId.substring(0, 2).toUpperCase(),
              role: 'Team Member',
              email: `${userId}@company.com`,
            }));
        
        setFormData({
          title: task.title,
          description: task.description || '',
          priority: task.priority,
          category: task.task_type as any,
          startDate: task.start_date ? new Date(task.start_date) : new Date(),
          endDate: task.due_date ? new Date(task.due_date) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          estimatedHours: task.estimated_hours?.toString() || '',
          tags: task.tags || [],
          assignees: finalAssignees,
          features: [], // TODO: Map from custom_fields if needed
          deliverables: [], // TODO: Map from subtasks if needed
          successCriteria: [], // TODO: Map from acceptance_criteria
          documentLinks: [], // TODO: Map from external_references
          attachments: [], // TODO: Map from attachments
          channel_id: task.channel_id,
          owned_by: task.owned_by,
        });
      }
    } catch (error) {
      console.error('Error loading task:', error);
      Alert.alert('Error', 'Failed to load task data');
    }
  };

  const pageHeaders = [
    { title: isEditMode ? 'Edit Basic Information' : 'Basic Information', subtitle: isEditMode ? 'Update task fundamentals' : 'Define your task fundamentals' },
    {
      title: isEditMode ? 'Edit Timeline & Planning' : 'Timeline & Planning',
      subtitle: isEditMode ? 'Update dates and details' : 'Set dates and organize details',
    },
    {
      title: isEditMode ? 'Edit Requirements & Assets' : 'Requirements & Assets',
      subtitle: isEditMode ? 'Update features and attachments' : 'Add features and attachments',
    },
    { title: isEditMode ? 'Edit Team Assignment' : 'Team Assignment', subtitle: isEditMode ? 'Update collaborators' : 'Choose your collaborators' },
  ];

  // Helper functions
  const validateCurrentPage = useCallback((): boolean => {
    const errors: FormErrors = { ...formErrors };
    let isValid = true;

    // Reset current page errors
    Object.keys(errors).forEach(key => {
      if (key !== 'general') errors[key as keyof FormErrors] = '';
    });

    switch (currentPage) {
      case 1: // Basic Information
        if (!formData.title.trim()) {
          errors.title = 'Task title is required';
          isValid = false;
        } else if (formData.title.trim().length < 3) {
          errors.title = 'Title must be at least 3 characters long';
          isValid = false;
        }

        if (!formData.description.trim()) {
          errors.description = 'Task description is required';
          isValid = false;
        } else if (formData.description.trim().length < 10) {
          errors.description =
            'Description must be at least 10 characters long';
          isValid = false;
        }
        break;

      case 2: // Timeline
        if (formData.startDate >= formData.endDate) {
          errors.endDate = 'End date must be after start date';
          isValid = false;
        }
        break;

      case 3: // Requirements - no validation needed
        break;

      case 4: // Team Assignment
        if (formData.assignees.length === 0) {
          errors.assignees = 'At least one team member must be assigned';
          isValid = false;
        }
        break;
    }

    setFormErrors(errors);
    return isValid;
  }, [currentPage, formData, formErrors]);

  const handleNext = useCallback(() => {
    if (validateCurrentPage()) {
      if (currentPage < pageHeaders.length) {
        setCurrentPage(currentPage + 1);
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      }
    }
  }, [currentPage, validateCurrentPage, pageHeaders.length]);

  const handlePrevious = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  }, [currentPage]);

  const handleCreateTask = useCallback(async () => {
    if (!validateCurrentPage()) {
      return;
    }

    if (!user?.id) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    setIsSaving(true);
    buttonScale.value = withSpring(0.95);

    try {
      // Prepare task data for API
      const taskData: CreateTaskData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        task_type: formData.category as any,
        assigned_to: formData.assignees.map(a => a.id),
        owned_by: formData.owned_by || user.id,
        created_by: user.id,
        channel_id: formData.channel_id,
        due_date: formData.endDate,
        start_date: formData.startDate,
        estimated_hours: parseInt(formData.estimatedHours) || undefined,
        tags: formData.tags,
        labels: {
          features: formData.features,
          deliverables: formData.deliverables,
          success_criteria: formData.successCriteria,
          document_links: formData.documentLinks,
        },
        business_value: 'medium', // Default value
      };

      let response;
      if (isEditMode && route.params?.taskId) {
        // Update existing task
        response = await taskService.updateTask(route.params.taskId, taskData as any);
      } else {
        // Create new task
        response = await taskService.createTask(taskData);
      }

      if (response.success) {
        // Success animation
        buttonScale.value = withSpring(1);
        
        const successTitle = isEditMode ? '✅ Task Updated!' : '🎉 Task Created!';
        const successMessage = isEditMode 
          ? 'Your task has been successfully updated.'
          : 'Your task has been successfully created and assigned to the team.';

        Alert.alert(
          successTitle,
          successMessage,
          [
            {
              text: isEditMode ? 'View Task' : 'Create Another',
              onPress: () => {
                if (isEditMode) {
                  navigation.replace('TaskDetail', { taskId: route.params!.taskId });
                } else {
                  // Reset form for creating another task
                  resetForm();
                }
              },
            },
            {
              text: 'Go to Tasks',
              onPress: () => navigation.navigate('TasksScreen'),
              style: 'cancel',
            },
          ],
        );
      } else {
        throw new Error(response.message || 'Failed to save task');
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} task:`, error);
      Alert.alert(
        isEditMode ? 'Update Failed' : 'Creation Failed',
        `There was an error ${isEditMode ? 'updating' : 'creating'} your task. Please check your connection and try again.`,
        [{ text: 'OK' }],
      );
      buttonScale.value = withSpring(1);
    } finally {
      setIsSaving(false);
    }
  }, [
    formData,
    validateCurrentPage,
    buttonScale,
    navigation,
    user,
    isEditMode,
    route.params?.taskId,
  ]);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      category: 'development',
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      estimatedHours: '',
      tags: [],
      assignees: user?.id ? [availableAssignees.find(u => u.id === user.id)!].filter(Boolean) : [],
      features: [],
      deliverables: [],
      successCriteria: [],
      documentLinks: [],
      attachments: [],
      channel_id: channelId,
      owned_by: user?.id,
    });
    setCurrentPage(1);
    setFormErrors({
      title: '',
      description: '',
      assignees: '',
      startDate: '',
      endDate: '',
      general: '',
    });
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  // Input handlers with error clearing
  const updateFormData = useCallback(
    (field: keyof FormData, value: any) => {
      try {
        setFormData(prev => ({
          ...prev,
          [field]: value,
        }));
        
        // Clear any related errors
        if (formErrors[field as keyof FormErrors]) {
          setFormErrors(prev => ({
            ...prev,
            [field]: '',
          }));
        }
      } catch (error) {
        console.error(`Error updating form field ${field}:`, error);
      }
    },
    [formErrors]
  );

  // Specific handlers for components
  const handleAddTag = useCallback(
    (tag: string) => {
      if (!formData.tags.includes(tag)) {
        updateFormData('tags', [...formData.tags, tag]);
      }
    },
    [formData.tags, updateFormData],
  );

  const handleRemoveTag = useCallback(
    (tag: string) => {
      updateFormData(
        'tags',
        formData.tags.filter(t => t !== tag),
      );
    },
    [formData.tags, updateFormData],
  );

  const handleAddFeature = useCallback(
    (feature: string) => {
      if (!formData.features.includes(feature)) {
        updateFormData('features', [...formData.features, feature]);
      }
    },
    [formData.features, updateFormData],
  );

  const handleRemoveFeature = useCallback(
    (feature: string) => {
      updateFormData(
        'features',
        formData.features.filter(f => f !== feature),
      );
    },
    [formData.features, updateFormData],
  );

  const handleAddDeliverable = useCallback(
    (title: string, description: string) => {
      const newDeliverable = {
        id: Date.now().toString(),
        title,
        description,
        completed: false,
      };
      updateFormData('deliverables', [
        ...formData.deliverables,
        newDeliverable,
      ]);
    },
    [formData.deliverables, updateFormData],
  );

  const handleRemoveDeliverable = useCallback(
    (id: string) => {
      updateFormData(
        'deliverables',
        formData.deliverables.filter(d => d.id !== id),
      );
    },
    [formData.deliverables, updateFormData],
  );

  const handleAddSuccessCriteria = useCallback(
    (criteria: string) => {
      const newCriteria = {
        id: Date.now().toString(),
        criteria,
        met: false,
      };
      updateFormData('successCriteria', [
        ...formData.successCriteria,
        newCriteria,
      ]);
    },
    [formData.successCriteria, updateFormData],
  );

  const handleRemoveSuccessCriteria = useCallback(
    (id: string) => {
      updateFormData(
        'successCriteria',
        formData.successCriteria.filter(c => c.id !== id),
      );
    },
    [formData.successCriteria, updateFormData],
  );

  const handleAddDocumentLink = useCallback(
    (link: string) => {
      if (!formData.documentLinks.includes(link)) {
        updateFormData('documentLinks', [...formData.documentLinks, link]);
      }
    },
    [formData.documentLinks, updateFormData],
  );

  const handleRemoveDocumentLink = useCallback(
    (link: string) => {
      updateFormData(
        'documentLinks',
        formData.documentLinks.filter(l => l !== link),
      );
    },
    [formData.documentLinks, updateFormData],
  );

  const handlePickDocuments = useCallback(async () => {
    try {
      const results = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
        allowMultiSelection: true,
      });

      const newAttachments = results.map((result: any) => ({
        id: Date.now().toString() + Math.random().toString(),
        name: result.name || 'Unknown file',
        type: result.type || 'application/octet-stream',
        uri: result.uri,
        size: result.size || undefined,
      }));

      updateFormData('attachments', [
        ...formData.attachments,
        ...newAttachments,
      ]);
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        console.error('Document picker error:', err);
        Alert.alert('Error', 'Failed to pick documents. Please try again.');
      }
    }
  }, [formData.attachments, updateFormData]);

  const handleRemoveAttachment = useCallback(
    (id: string) => {
      updateFormData(
        'attachments',
        formData.attachments.filter(a => a.id !== id),
      );
    },
    [formData.attachments, updateFormData],
  );

  const handleToggleAssignee = useCallback(
    (assignee: TaskAssignee) => {
      const isAssigned = formData.assignees.some(a => a.id === assignee.id);
      const newAssignees = isAssigned
        ? formData.assignees.filter(a => a.id !== assignee.id)
        : [...formData.assignees, assignee];

      updateFormData('assignees', newAssignees);
    },
    [formData.assignees, updateFormData],
  );

  const renderPage = () => {
    switch (currentPage) {
      case 1:
        return (
          <TaskBasicInfo
            title={formData.title}
            description={formData.description}
            priority={formData.priority}
            category={formData.category}
            errors={{
              title: formErrors.title,
              description: formErrors.description,
            }}
            onTitleChange={text => updateFormData('title', text)}
            onDescriptionChange={text => updateFormData('description', text)}
            onPriorityChange={priority => updateFormData('priority', priority)}
            onCategoryChange={category => updateFormData('category', category)}
          />
        );
      case 2:
        return (
          <TaskTimeline
            startDate={formData.startDate}
            endDate={formData.endDate}
            estimatedHours={formData.estimatedHours}
            tags={formData.tags}
            errors={{ endDate: formErrors.endDate }}
            onStartDatePress={() => setShowStartDatePicker(true)}
            onEndDatePress={() => setShowEndDatePicker(true)}
            onEstimatedHoursChange={text =>
              updateFormData('estimatedHours', text)
            }
            onAddTag={handleAddTag}
            onRemoveTag={handleRemoveTag}
          />
        );
      case 3:
        return (
          <TaskRequirements
            features={formData.features}
            deliverables={formData.deliverables}
            successCriteria={formData.successCriteria}
            documentLinks={formData.documentLinks}
            attachments={formData.attachments}
            onAddFeature={handleAddFeature}
            onRemoveFeature={handleRemoveFeature}
            onAddDeliverable={handleAddDeliverable}
            onRemoveDeliverable={handleRemoveDeliverable}
            onAddSuccessCriteria={handleAddSuccessCriteria}
            onRemoveSuccessCriteria={handleRemoveSuccessCriteria}
            onAddDocumentLink={handleAddDocumentLink}
            onRemoveDocumentLink={handleRemoveDocumentLink}
            onPickDocuments={handlePickDocuments}
            onRemoveAttachment={handleRemoveAttachment}
          />
        );
      case 4:
        return (
          <TaskTeamAssignment
            assignees={formData.assignees}
            availableAssignees={availableAssignees}
            onToggleAssignee={handleToggleAssignee}
            errors={{ assignees: formErrors.assignees }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      {/* Clean Header */}
      <TaskCreateHeader
        title={pageHeaders[currentPage - 1].title}
        subtitle={pageHeaders[currentPage - 1].subtitle}
        onBack={() => {
          if (isEditMode) {
            Alert.alert(
              'Discard Changes?',
              'Are you sure you want to go back? Any unsaved changes will be lost.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() },
              ]
            );
          } else {
            navigation.goBack();
          }
        }}
        currentStep={currentPage}
        totalSteps={pageHeaders.length}
      />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 84 : 20}
      >
        {isLoadingData ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-gray-500 text-lg">Loading...</Text>
          </View>
        ) : (
          <>
            <ScrollView
              ref={scrollViewRef}
              className="flex-1 px-6 pt-4"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 100 }}
            >
              {renderPage()}
            </ScrollView>

            {/* Fixed position navigation footer */}
            <View className="absolute left-0 right-0 bottom-0">
              <TaskCreateNavigation
                currentStep={currentPage}
                totalSteps={pageHeaders.length}
                onPrevious={handlePrevious}
                onNext={handleNext}
                onComplete={handleCreateTask}
                isLoading={isSaving}
                canGoBack={currentPage > 1}
                buttonScale={buttonScale}
                completeText={isEditMode ? 'Update Task' : 'Create Task'}
              />
            </View>
          </>
        )}
      </KeyboardAvoidingView>

      {/* Date Pickers */}
      {showStartDatePicker && (
        <DateTimePicker
          value={formData.startDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          minimumDate={new Date()}
          onChange={(event, selectedDate) => {
            setShowStartDatePicker(false);
            if (selectedDate) {
              updateFormData('startDate', selectedDate);
            }
          }}
        />
      )}

      {showEndDatePicker && (
        <DateTimePicker
          value={formData.endDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          minimumDate={formData.startDate}
          onChange={(event, selectedDate) => {
            setShowEndDatePicker(false);
            if (selectedDate) {
              updateFormData('endDate', selectedDate);
            }
          }}
        />
      )}
    </View>
  );
};
