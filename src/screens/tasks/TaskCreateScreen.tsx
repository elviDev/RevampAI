import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  ScrollView,
  Alert,
  Platform,
  KeyboardAvoidingView,
  StatusBar,
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

type TaskCreateScreenProps = NativeStackScreenProps<
  MainStackParamList,
  'TaskCreateScreen'
>;

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
}) => {
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

  // Mock assignees data
  const availableAssignees: TaskAssignee[] = [
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
      role: 'UI/UX Designer',
      email: 'sarah.wilson@company.com',
    },
    {
      id: '3',
      name: 'Mike Johnson',
      avatar: 'MJ',
      role: 'Product Manager',
      email: 'mike.johnson@company.com',
    },
    {
      id: '4',
      name: 'Alex Chen',
      avatar: 'AC',
      role: 'Backend Developer',
      email: 'alex.chen@company.com',
    },
    {
      id: '5',
      name: 'Emily Davis',
      avatar: 'ED',
      role: 'DevOps Engineer',
      email: 'emily.davis@company.com',
    },
    {
      id: '6',
      name: 'David Kim',
      avatar: 'DK',
      role: 'QA Engineer',
      email: 'david.kim@company.com',
    },
  ];

  const pageHeaders = [
    { title: 'Basic Information', subtitle: 'Define your task fundamentals' },
    {
      title: 'Timeline & Planning',
      subtitle: 'Set dates and organize details',
    },
    {
      title: 'Requirements & Assets',
      subtitle: 'Add features and attachments',
    },
    { title: 'Team Assignment', subtitle: 'Choose your collaborators' },
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

    setIsLoading(true);
    buttonScale.value = withSpring(0.95);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const newTask: Partial<Task> = {
        id: Date.now().toString(),
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        category: formData.category,
        status: 'pending',
        assignees: formData.assignees,
        reporter: availableAssignees[2],
        channelId: '1',
        channelName: 'Project Tasks',
        tags: formData.tags,
        dueDate: formData.endDate,
        createdAt: new Date(),
        updatedAt: new Date(),
        estimatedHours: parseInt(formData.estimatedHours) || 0,
        progress: 0,
        subtasks: formData.deliverables.map(d => ({
          id: d.id,
          title: d.title,
          completed: d.completed,
        })),
        comments: [],
        attachments: formData.attachments.map(a => ({
          id: a.id,
          name: a.name,
          type: a.type.startsWith('image')
            ? ('image' as const)
            : a.type.startsWith('video')
              ? ('video' as const)
              : a.type.startsWith('audio')
                ? ('audio' as const)
                : ('document' as const),
          size: a.size ?? 0,
          url: a.uri,
          uploadedBy: availableAssignees[0],
          uploadedAt: new Date(),
        })),
        dependencies: [],
        watchers: [],
      };

      console.log('Task created successfully:', newTask);

      // Success animation
      buttonScale.value = withSpring(1);

      Alert.alert(
        '🎉 Task Created!',
        'Your task has been successfully created and assigned to the team.',
        [
          {
            text: 'Create Another',
            onPress: () => {
              // Reset form
              setFormData({
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
            },
          },
          {
            text: 'View Tasks',
            onPress: () => navigation.goBack(),
            style: 'cancel',
          },
        ],
      );
    } catch (error) {
      console.error('Error creating task:', error);
      Alert.alert(
        'Creation Failed',
        'There was an error creating your task. Please check your connection and try again.',
        [{ text: 'OK' }],
      );
      buttonScale.value = withSpring(1);
    } finally {
      setIsLoading(false);
    }
  }, [
    formData,
    validateCurrentPage,
    buttonScale,
    navigation,
    availableAssignees,
  ]);

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
        onBack={() => navigation.goBack()}
        currentStep={currentPage}
        totalSteps={pageHeaders.length}
      />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 84 : 20}
      >
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-6 pt-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }} // Added extra padding at bottom
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
            isLoading={isLoading}
            canGoBack={currentPage > 1}
            buttonScale={buttonScale}
          />
        </View>
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
