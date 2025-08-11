import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeInRight,
  SlideInRight,
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  withSpring,
  withSequence,
  withTiming,
  interpolate,
  interpolateColor,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../contexts/ThemeContext';
import { useQuickActions } from '../../contexts/QuickActionsContext';
import {
  Project,
  ProjectStatus,
  ProjectPriority,
  ProjectMember,
  ProjectActivity,
} from '../../types/project.types';
import {
  ProjectMethodology,
  ProjectMethodologyData,
  Sprint,
  UserStory,
  KanbanBoard,
  WaterfallPhase,
  ProjectPhase,
  PhaseTransition,
} from '../../types/projectMethodology.types';
import { SimplePhaseManager } from '../../components/projects/phases/SimplePhaseManager';
import { TaskAssignee } from '../../types/task.types';

const { width, height } = Dimensions.get('window');

interface ProjectDetailScreenProps {
  navigation: any;
  route: {
    params: {
      projectId: string;
    };
  };
}

// Enhanced project interface with methodology support
interface EnhancedProject extends Project {
  methodologyData: ProjectMethodologyData;
  phases?: ProjectPhase[];
  currentPhase?: string;
}

export const ProjectDetailScreen: React.FC<ProjectDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { showNotification } = useQuickActions();
  const { projectId } = route.params;

  // State Management
  const [project, setProject] = useState<EnhancedProject | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMethodology, setSelectedMethodology] =
    useState<ProjectMethodology>('agile');
  const [showPhaseManager, setShowPhaseManager] = useState(false);

  // Animation Values
  const scrollY = useSharedValue(0);
  const headerOpacity = useSharedValue(1);
  const sparkleAnimation = useSharedValue(0);
  const progressAnimation = useSharedValue(0);

  useEffect(() => {
    loadProjectDetails();

    // Start sparkle animations
    sparkleAnimation.value = withSequence(
      withTiming(1, { duration: 1000 }),
      withTiming(0, { duration: 1000 }),
    );

    const interval = setInterval(() => {
      sparkleAnimation.value = withSequence(
        withTiming(1, { duration: 1000 }),
        withTiming(0, { duration: 1000 }),
      );
    }, 3000);

    // Cleanup function
    return () => {
      clearInterval(interval);
    };
  }, []);

  const loadProjectDetails = () => {
    // Enhanced mock project data with methodology support
    const mockProject: EnhancedProject = {
      id: projectId,
      name: 'AI-Powered Project Management Platform',
      description:
        'Building a next-generation project management platform with AI-driven insights, automated task allocation, and intelligent resource optimization.',
      category: 'Software Development',
      status: 'in-progress' as ProjectStatus,
      priority: 'high' as ProjectPriority,

      owner: {
        id: '1',
        name: 'Sarah Johnson',
        avatar: 'SJ',
        role: 'Project Director',
        email: 'sarah@company.com',
      },

      members: [
        {
          id: '1',
          user: {
            id: '1',
            name: 'Sarah Johnson',
            avatar: 'SJ',
            role: 'Project Director',
            email: 'sarah@company.com',
          },
          role: 'owner',
          joinedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          permissions: [],
          workload: 40,
          lastActive: new Date(),
        },
        {
          id: '2',
          user: {
            id: '2',
            name: 'Alex Chen',
            avatar: 'AC',
            role: 'Scrum Master',
            email: 'alex@company.com',
          },
          role: 'lead',
          joinedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
          permissions: [],
          workload: 40,
          lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
        },
        {
          id: '3',
          user: {
            id: '3',
            name: 'Maria Rodriguez',
            avatar: 'MR',
            role: 'UI/UX Designer',
            email: 'maria@company.com',
          },
          role: 'member',
          joinedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
          permissions: [],
          workload: 35,
          lastActive: new Date(Date.now() - 1 * 60 * 60 * 1000),
        },
        {
          id: '4',
          user: {
            id: '4',
            name: 'David Kim',
            avatar: 'DK',
            role: 'Backend Developer',
            email: 'david@company.com',
          },
          role: 'member',
          joinedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          permissions: [],
          workload: 40,
          lastActive: new Date(Date.now() - 30 * 60 * 1000),
        },
      ] as ProjectMember[],

      timeline: {
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        actualStartDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        milestones: [],
      },

      progress: 68,

      budget: {
        total: 250000,
        currency: 'USD',
        categories: [
          {
            id: '1',
            category: 'development',
            allocated: 150000,
            spent: 95000,
            remaining: 55000,
            currency: 'USD',
          },
          {
            id: '2',
            category: 'design',
            allocated: 50000,
            spent: 35000,
            remaining: 15000,
            currency: 'USD',
          },
          {
            id: '3',
            category: 'infrastructure',
            allocated: 30000,
            spent: 18000,
            remaining: 12000,
            currency: 'USD',
          },
          {
            id: '4',
            category: 'marketing',
            allocated: 20000,
            spent: 5000,
            remaining: 15000,
            currency: 'USD',
          },
        ],
      },

      files: [],

      metrics: {
        totalTasks: 24,
        completedTasks: 16,
        overdueTasks: 2,
        totalHours: 480,
        actualHours: 356,
        budgetUtilization: 61.2,
        teamProductivity: 85.4,
        milestoneProgress: 62.5,
        riskScore: 25,
      },

      activities: [
        {
          id: '1',
          type: 'milestone_completed',
          title: 'Sprint 3 Completed',
          description: 'Successfully completed sprint 3 with 95% velocity',
          user: {
            id: '2',
            name: 'Alex Chen',
            avatar: 'AC',
            role: 'Scrum Master',
            email: 'alex@company.com',
          },
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        },
        {
          id: '2',
          type: 'task_created',
          title: 'New User Story: Implement User Authentication',
          description:
            'Created high-priority user story for authentication system',
          user: {
            id: '1',
            name: 'Sarah Johnson',
            avatar: 'SJ',
            role: 'Project Director',
            email: 'sarah@company.com',
          },
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        },
      ] as ProjectActivity[],

      risks: [],

      settings: {
        isPublic: false,
        allowGuestAccess: false,
        autoAssignTasks: true,
        notificationSettings: {
          email: true,
          push: true,
          slack: false,
        },
        workingDays: [1, 2, 3, 4, 5],
        workingHours: {
          start: '09:00',
          end: '17:00',
        },
        timezone: 'UTC',
      },

      tags: ['AI', 'Web Development', 'Mobile', 'Innovation'],
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),

      subProjects: [],
      customFields: {},

      // Project phases
      phases: [
        {
          id: 'phase-1',
          name: 'Sprint Planning',
          description: 'Plan and commit to sprint goals and backlog items',
          status: 'completed',
          startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          estimatedDuration: 8,
          actualDuration: 6,
          progress: 100,
          prerequisites: ['Refined backlog', 'Team availability'],
          deliverables: ['Sprint goal', 'Sprint backlog', 'Capacity plan'],
          exitCriteria: ['All stories estimated', 'Sprint goal defined'],
          assignedTeam: ['1', '2'],
          blockers: [],
          risks: [],
          artifacts: [],
          metrics: { velocity: 45, satisfaction: 8.5 },
        },
        {
          id: 'phase-2',
          name: 'Sprint Active',
          description: 'Execute sprint work and daily standups',
          status: 'in_progress',
          startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
          estimatedDuration: 80,
          actualDuration: 60,
          progress: 75,
          prerequisites: ['Sprint plan approved'],
          deliverables: ['Working software increment', 'Updated burndown'],
          exitCriteria: ['Sprint goal achieved', 'Demo ready'],
          assignedTeam: ['1', '2', '3', '4'],
          blockers: [
            {
              id: 'block-1',
              title: 'API Dependencies',
              description: 'Waiting for external API integration',
              severity: 'medium',
              blockedSince: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
              assignedTo: '2',
            },
          ],
          risks: [
            {
              id: 'risk-1',
              title: 'Scope Creep',
              description: 'Additional requirements being added mid-sprint',
              probability: 'medium',
              impact: 'high',
              mitigation: 'Strict change control process',
              owner: '1',
              status: 'open',
            },
          ],
          artifacts: [
            {
              id: 'art-1',
              name: 'Sprint Burndown Chart',
              type: 'document',
              description: 'Daily progress tracking',
              createdBy: '2',
              createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            },
          ],
          metrics: { velocity: 38, burndown: 0.75 },
        },
        {
          id: 'phase-3',
          name: 'Sprint Review',
          description: 'Demo completed work to stakeholders',
          status: 'not_started',
          startDate: null,
          endDate: null,
          estimatedDuration: 4,
          actualDuration: 0,
          progress: 0,
          prerequisites: ['Sprint completed'],
          deliverables: ['Product demo', 'Stakeholder feedback'],
          exitCriteria: ['Demo completed', 'Feedback collected'],
          assignedTeam: ['1', '3'],
          blockers: [],
          risks: [],
          artifacts: [],
          metrics: {},
        },
      ],
      currentPhase: 'phase-2',

      // Enhanced methodology data
      methodologyData: {
        methodology: 'agile',
        sprints: [
          {
            id: 'sprint-1',
            name: 'Sprint 1 - Foundation',
            goal: 'Set up core infrastructure and authentication',
            startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
            endDate: new Date(Date.now()),
            status: 'completed',
            capacity: 50,
            velocity: 47,
            burndownData: [
              {
                date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
                remainingPoints: 50,
                idealBurndown: 50,
              },
              {
                date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
                remainingPoints: 35,
                idealBurndown: 35,
              },
              {
                date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                remainingPoints: 20,
                idealBurndown: 25,
              },
              {
                date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                remainingPoints: 8,
                idealBurndown: 10,
              },
              {
                date: new Date(Date.now()),
                remainingPoints: 3,
                idealBurndown: 0,
              },
            ],
            tasks: ['task1', 'task2', 'task3'],
            retrospectiveNotes:
              'Great team collaboration, need to improve estimation accuracy',
          },
          {
            id: 'sprint-2',
            name: 'Sprint 2 - Core Features',
            goal: 'Implement main project management features',
            startDate: new Date(),
            endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            status: 'active',
            capacity: 55,
            velocity: 0,
            burndownData: [
              { date: new Date(), remainingPoints: 55, idealBurndown: 55 },
            ],
            tasks: ['task4', 'task5', 'task6'],
          },
        ],
        backlog: [
          {
            id: 'story-1',
            title: 'User Authentication System',
            description:
              'As a user, I want to securely log in so that I can access my projects',
            acceptanceCriteria: [
              'User can register with email and password',
              'User can login with valid credentials',
              'User session persists across app restarts',
              'Password reset functionality works',
            ],
            storyPoints: 8,
            status: 'done',
            priority: 1,
            tasks: ['task1', 'task2'],
            definition_of_done: [
              'Code reviewed and approved',
              'Unit tests written and passing',
              'Integration tests passing',
              'Security audit completed',
            ],
          },
          {
            id: 'story-2',
            title: 'Project Dashboard',
            description:
              'As a project manager, I want a dashboard view so that I can see project status at a glance',
            acceptanceCriteria: [
              'Shows project progress indicators',
              'Displays team member status',
              'Shows upcoming deadlines',
              'Responsive design works on all devices',
            ],
            storyPoints: 13,
            status: 'in-progress',
            priority: 2,
            tasks: ['task3', 'task4'],
            definition_of_done: [
              'Code reviewed and approved',
              'Unit tests written and passing',
              'UI/UX approved by design team',
              'Performance benchmarks met',
            ],
          },
        ],
        epics: [
          {
            id: 'epic-1',
            title: 'User Management System',
            description:
              'Complete user authentication, authorization, and profile management',
            businessValue:
              'Enable secure user access and personalized experience',
            status: 'in-progress',
            stories: [],
            timeline: {
              startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              targetEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
          },
        ],
        currentSprint: 'sprint-2',
        metrics: {
          velocity: 47,
          burndownRate: 0.85,
          teamSatisfaction: 8.5,
          customerSatisfaction: 9.0,
          defectRate: 0.02,
        },
      },
    };

    setProject(mockProject);
    setSelectedMethodology(mockProject.methodologyData.methodology);
    progressAnimation.value = withSpring(mockProject.progress / 100, {
      damping: 15,
      stiffness: 100,
    });
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadProjectDetails();
    setTimeout(() => setRefreshing(false), 1000);
  };

  // Phase management handlers
  const handlePhaseChange = (phaseId: string, transition: PhaseTransition) => {
    if (!project) return;

    // Update phase status based on transition
    const updatedPhases = project.phases?.map(phase => {
      if (phase.id === phaseId) {
        return {
          ...phase,
          status:
            transition.toPhase === phase.name
              ? ('completed' as const)
              : phase.status,
        };
      }
      // Update target phase if it exists
      const targetPhase = project.phases?.find(
        p => p.name === transition.toPhase,
      );
      if (targetPhase && phase.id === targetPhase.id) {
        return {
          ...phase,
          status: 'in_progress' as const,
          startDate: new Date(),
        };
      }
      return phase;
    });

    setProject(prev =>
      prev
        ? {
            ...prev,
            phases: updatedPhases,
            currentPhase:
              project.phases?.find(p => p.name === transition.toPhase)?.id ||
              prev.currentPhase,
          }
        : null,
    );

    showNotification(`Phase transitioned to ${transition.toPhase}!`, 'success');
  };

  const handleCreatePhase = (phase: Omit<ProjectPhase, 'id'>) => {
    if (!project) return;

    const newPhase: ProjectPhase = {
      ...phase,
      id: `phase-${Date.now()}`,
    };

    setProject(prev =>
      prev
        ? {
            ...prev,
            phases: [...(prev.phases || []), newPhase],
          }
        : null,
    );

    showNotification(`Phase "${phase.name}" created successfully!`, 'success');
  };

  const handleEditPhase = (phaseId: string, updates: Partial<ProjectPhase>) => {
    if (!project) return;

    const updatedPhases = project.phases?.map(phase =>
      phase.id === phaseId ? { ...phase, ...updates } : phase,
    );

    setProject(prev =>
      prev
        ? {
            ...prev,
            phases: updatedPhases,
          }
        : null,
    );

    showNotification('Phase updated successfully!', 'success');
  };

  const handleDeletePhase = (phaseId: string) => {
    if (!project) return;

    const updatedPhases = project.phases?.filter(phase => phase.id !== phaseId);

    setProject(prev =>
      prev
        ? {
            ...prev,
            phases: updatedPhases,
          }
        : null,
    );

    showNotification('Phase deleted successfully!', 'success');
  };

  // const scrollHandler = useAnimatedScrollHandler({
  //   onScroll: (event) => {
  //     'worklet';
  //     const offsetY = event.contentOffset?.y ?? 0;
  //     if (offsetY >= 0 && isFinite(offsetY)) {
  //       scrollY.value = offsetY;
  //     }
  //   },
  // });

  // Animated Styles
  const headerAnimatedStyle = useAnimatedStyle(() => {
    'worklet';
    const opacity = interpolate(scrollY.value, [0, 100], [0, 1], 'clamp');
    const surfaceColor = theme.colors.surface || '#FFFFFF';
    return {
      opacity: opacity,
      backgroundColor: interpolateColor(
        scrollY.value,
        [0, 100],
        ['rgba(0,0,0,0)', surfaceColor],
      ),
    };
  }, [theme.colors.surface]);

  const sparkleAnimatedStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      opacity: interpolate(sparkleAnimation.value, [0, 1], [0.3, 1], 'clamp'),
      transform: [
        {
          scale: interpolate(
            sparkleAnimation.value,
            [0, 1],
            [0.8, 1.2],
            'clamp',
          ),
        },
      ],
    };
  });

  const progressAnimatedStyle = useAnimatedStyle(() => {
    'worklet';
    const widthPercentage = interpolate(
      progressAnimation.value,
      [0, 1],
      [0, 100],
      'clamp',
    );
    return {
      width: `${widthPercentage}%`,
    };
  });

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case 'planning':
        return theme.colors.warning;
      case 'in-progress':
        return theme.colors.primary;
      case 'completed':
        return theme.colors.success;
      case 'on-hold':
        return theme.colors.secondary;
      case 'cancelled':
        return theme.colors.error;
      default:
        return theme.colors.primary;
    }
  };

  const getPriorityColor = (priority: ProjectPriority) => {
    switch (priority) {
      case 'low':
        return theme.colors.success;
      case 'medium':
        return theme.colors.warning;
      case 'high':
        return theme.colors.error;
      case 'urgent':
        return '#DC2626';
      default:
        return theme.colors.primary;
    }
  };

  const getMethodologyIcon = (methodology: ProjectMethodology) => {
    switch (methodology) {
      case 'agile':
        return 'refresh';
      case 'scrum':
        return 'group-work';
      case 'kanban':
        return 'view-column';
      case 'waterfall':
        return 'waterfall-chart';
      case 'lean':
        return 'trending-up';
      case 'hybrid':
        return 'hub';
      default:
        return 'business';
    }
  };

  const getMethodologyColor = (methodology: ProjectMethodology) => {
    switch (methodology) {
      case 'agile':
        return theme.colors.primary;
      case 'scrum':
        return theme.colors.success;
      case 'kanban':
        return theme.colors.accent;
      case 'waterfall':
        return theme.colors.info || theme.colors.primary;
      case 'lean':
        return theme.colors.warning;
      case 'hybrid':
        return theme.colors.secondary;
      default:
        return theme.colors.primary;
    }
  };

  const renderMethodologySelector = () => {
    const methodologies: ProjectMethodology[] = [
      'agile',
      'scrum',
      'kanban',
      'waterfall',
      'lean',
      'hybrid',
    ];

    return (
      <View style={{ marginBottom: 20 }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: 'bold',
            color: theme.colors.text.primary,
            marginBottom: 12,
          }}
        >
          Project Methodology
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 4 }}
        >
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {methodologies.map(methodology => (
              <TouchableOpacity
                key={methodology}
                onPress={() => setSelectedMethodology(methodology)}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 12,
                  backgroundColor:
                    selectedMethodology === methodology
                      ? getMethodologyColor(methodology)
                      : theme.colors.background,
                  borderWidth: 1,
                  borderColor:
                    selectedMethodology === methodology
                      ? getMethodologyColor(methodology)
                      : theme.colors.border,
                  flexDirection: 'row',
                  alignItems: 'center',
                  minWidth: 80,
                }}
              >
                <MaterialIcon
                  name={getMethodologyIcon(methodology)}
                  size={16}
                  color={
                    selectedMethodology === methodology
                      ? theme.colors.text.onPrimary
                      : theme.colors.text.secondary
                  }
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '600',
                    color:
                      selectedMethodology === methodology
                        ? theme.colors.text.onPrimary
                        : theme.colors.text.primary,
                    textTransform: 'capitalize',
                  }}
                >
                  {methodology}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderAgileView = () => {
    if (!project?.methodologyData.sprints) return null;

    const currentSprint = project.methodologyData.sprints.find(
      s => s.id === project.methodologyData.currentSprint,
    );

    return (
      <View>
        {/* Current Sprint Card */}
        {currentSprint && (
          <Animated.View
            entering={FadeInDown.duration(600)}
            style={{
              backgroundColor: theme.colors.surface || '#FFFFFF',
              borderRadius: 16,
              padding: 20,
              marginBottom: 20,
              borderWidth: 1,
              borderColor: theme.colors.border,
              shadowColor: theme.colors.shadows?.neutral || '#000000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.1,
              shadowRadius: 16,
              elevation: 8,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.accent]}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}
              >
                <MaterialIcon
                  name="sprint"
                  size={20}
                  color={theme.colors.text.onPrimary}
                />
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    color: theme.colors.text.primary,
                  }}
                >
                  {currentSprint.name}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: theme.colors.text.secondary,
                  }}
                >
                  {currentSprint.goal}
                </Text>
              </View>
              <View
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 12,
                  backgroundColor:
                    currentSprint.status === 'active'
                      ? theme.colors.success + '20'
                      : theme.colors.warning + '20',
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '600',
                    color:
                      currentSprint.status === 'active'
                        ? theme.colors.success
                        : theme.colors.warning,
                    textTransform: 'uppercase',
                  }}
                >
                  {currentSprint.status}
                </Text>
              </View>
            </View>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 12,
              }}
            >
              <View style={{ alignItems: 'center' }}>
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: 'bold',
                    color: theme.colors.primary,
                  }}
                >
                  {currentSprint.velocity || 0}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: theme.colors.text.secondary,
                  }}
                >
                  Velocity
                </Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: 'bold',
                    color: theme.colors.accent,
                  }}
                >
                  {currentSprint.capacity}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: theme.colors.text.secondary,
                  }}
                >
                  Capacity
                </Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: 'bold',
                    color: theme.colors.success,
                  }}
                >
                  {Math.ceil(
                    (new Date(currentSprint.endDate).getTime() - Date.now()) /
                      (1000 * 60 * 60 * 24),
                  )}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: theme.colors.text.secondary,
                  }}
                >
                  Days Left
                </Text>
              </View>
            </View>

            <Text
              style={{
                fontSize: 14,
                color: theme.colors.text.secondary,
                textAlign: 'center',
              }}
            >
              Sprint ends {currentSprint.endDate.toLocaleDateString()}
            </Text>
          </Animated.View>
        )}

        {/* Backlog Preview */}
        <Animated.View
          entering={FadeInUp.delay(200).duration(600)}
          style={{
            backgroundColor: theme.colors.surface,
            borderRadius: 16,
            padding: 20,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <MaterialIcon name="list" size={24} color={theme.colors.primary} />
            <Text
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: theme.colors.text.primary,
                marginLeft: 12,
              }}
            >
              Product Backlog
            </Text>
          </View>

          {project.methodologyData.backlog?.slice(0, 3).map((story, index) => (
            <View
              key={story.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12,
                paddingHorizontal: 16,
                backgroundColor: theme.colors.background,
                borderRadius: 12,
                marginBottom: 8,
              }}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor:
                    story.status === 'done'
                      ? theme.colors.success + '20'
                      : story.status === 'in-progress'
                        ? theme.colors.primary + '20'
                        : theme.colors.warning + '20',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: 'bold',
                    color:
                      story.status === 'done'
                        ? theme.colors.success
                        : story.status === 'in-progress'
                          ? theme.colors.primary
                          : theme.colors.warning,
                  }}
                >
                  {story.storyPoints}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: theme.colors.text.primary,
                  }}
                >
                  {story.title}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: theme.colors.text.secondary,
                    marginTop: 2,
                  }}
                >
                  {story.description}
                </Text>
              </View>
              <View
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 8,
                  backgroundColor:
                    story.status === 'done'
                      ? theme.colors.success + '20'
                      : story.status === 'in-progress'
                        ? theme.colors.primary + '20'
                        : theme.colors.warning + '20',
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: '600',
                    color:
                      story.status === 'done'
                        ? theme.colors.success
                        : story.status === 'in-progress'
                          ? theme.colors.primary
                          : theme.colors.warning,
                    textTransform: 'uppercase',
                  }}
                >
                  {story.status.replace('-', ' ')}
                </Text>
              </View>
            </View>
          ))}

          <TouchableOpacity
            onPress={() =>
              showNotification('Opening full backlog view...', 'info')
            }
            style={{
              paddingVertical: 12,
              alignItems: 'center',
              borderTopWidth: 1,
              borderTopColor: theme.colors.border,
              marginTop: 8,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: theme.colors.primary,
              }}
            >
              View Full Backlog ({project.methodologyData.backlog?.length || 0}{' '}
              stories)
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  const renderKanbanView = () => {
    // Mock Kanban data
    const kanbanColumns = [
      { name: 'To Do', count: 8, color: theme.colors.warning },
      { name: 'In Progress', count: 5, color: theme.colors.primary },
      { name: 'Review', count: 3, color: theme.colors.accent },
      { name: 'Done', count: 12, color: theme.colors.success },
    ];

    return (
      <Animated.View
        entering={FadeInDown.duration(600)}
        style={{
          backgroundColor: theme.colors.surface,
          borderRadius: 16,
          padding: 20,
          marginBottom: 20,
          borderWidth: 1,
          borderColor: theme.colors.border,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <MaterialIcon
            name="view-column"
            size={24}
            color={theme.colors.accent}
          />
          <Text
            style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: theme.colors.text.primary,
              marginLeft: 12,
            }}
          >
            Kanban Board
          </Text>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {kanbanColumns.map((column, index) => (
            <View
              key={column.name}
              style={{
                flex: 1,
                alignItems: 'center',
                marginHorizontal: 4,
              }}
            >
              <View
                style={{
                  width: '100%',
                  backgroundColor: theme.colors.background,
                  borderRadius: 12,
                  padding: 16,
                  alignItems: 'center',
                  borderWidth: 2,
                  borderColor: column.color + '40',
                }}
              >
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: 'bold',
                    color: column.color,
                    marginBottom: 4,
                  }}
                >
                  {column.count}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '600',
                    color: theme.colors.text.secondary,
                    textAlign: 'center',
                  }}
                >
                  {column.name}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity
          onPress={() => showNotification('Opening Kanban board...', 'info')}
          style={{
            marginTop: 16,
            paddingVertical: 12,
            paddingHorizontal: 20,
            backgroundColor: theme.colors.primary,
            borderRadius: 12,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: theme.colors.text.onPrimary,
            }}
          >
            Open Full Board
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderWaterfallView = () => {
    // Mock Waterfall phases
    const phases = [
      { name: 'Requirements', progress: 100, status: 'completed' },
      { name: 'Design', progress: 100, status: 'completed' },
      { name: 'Development', progress: 75, status: 'in-progress' },
      { name: 'Testing', progress: 30, status: 'in-progress' },
      { name: 'Deployment', progress: 0, status: 'not-started' },
    ];

    return (
      <Animated.View
        entering={FadeInDown.duration(600)}
        style={{
          backgroundColor: theme.colors.surface,
          borderRadius: 16,
          padding: 20,
          marginBottom: 20,
          borderWidth: 1,
          borderColor: theme.colors.border,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <MaterialIcon
            name="waterfall-chart"
            size={24}
            color={theme.colors.info || theme.colors.primary}
          />
          <Text
            style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: theme.colors.text.primary,
              marginLeft: 12,
            }}
          >
            Project Phases
          </Text>
        </View>

        {phases.map((phase, index) => (
          <View
            key={phase.name}
            style={{
              marginBottom: 16,
              padding: 16,
              backgroundColor: theme.colors.background,
              borderRadius: 12,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 8,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: theme.colors.text.primary,
                }}
              >
                {phase.name}
              </Text>
              <View
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 8,
                  backgroundColor:
                    phase.status === 'completed'
                      ? theme.colors.success + '20'
                      : phase.status === 'in-progress'
                        ? theme.colors.primary + '20'
                        : theme.colors.warning + '20',
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: '600',
                    color:
                      phase.status === 'completed'
                        ? theme.colors.success
                        : phase.status === 'in-progress'
                          ? theme.colors.primary
                          : theme.colors.warning,
                    textTransform: 'uppercase',
                  }}
                >
                  {phase.status.replace('-', ' ')}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View
                style={{
                  flex: 1,
                  height: 6,
                  backgroundColor: theme.colors.border,
                  borderRadius: 3,
                  marginRight: 12,
                  overflow: 'hidden',
                }}
              >
                <View
                  style={{
                    width: `${phase.progress}%`,
                    height: '100%',
                    backgroundColor:
                      phase.status === 'completed'
                        ? theme.colors.success
                        : phase.status === 'in-progress'
                          ? theme.colors.primary
                          : theme.colors.warning,
                    borderRadius: 3,
                  }}
                />
              </View>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: theme.colors.text.primary,
                  minWidth: 40,
                }}
              >
                {phase.progress}%
              </Text>
            </View>
          </View>
        ))}
      </Animated.View>
    );
  };

  const renderMethodologyContent = () => {
    switch (selectedMethodology) {
      case 'agile':
      case 'scrum':
        return renderAgileView();
      case 'kanban':
        return renderKanbanView();
      case 'waterfall':
        return renderWaterfallView();
      case 'lean':
        return (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <MaterialIcon
              name="trending-up"
              size={48}
              color={theme.colors.warning}
            />
            <Text
              style={{
                fontSize: 16,
                fontWeight: 'bold',
                color: theme.colors.text.primary,
                marginTop: 16,
              }}
            >
              Lean Methodology View
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: theme.colors.text.secondary,
                textAlign: 'center',
                marginTop: 8,
              }}
            >
              Value stream mapping and waste reduction analysis
            </Text>
          </View>
        );
      case 'hybrid':
        return (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <MaterialIcon name="hub" size={48} color={theme.colors.secondary} />
            <Text
              style={{
                fontSize: 16,
                fontWeight: 'bold',
                color: theme.colors.text.primary,
                marginTop: 16,
              }}
            >
              Hybrid Methodology View
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: theme.colors.text.secondary,
                textAlign: 'center',
                marginTop: 8,
              }}
            >
              Combined approach with multiple methodologies
            </Text>
          </View>
        );
      default:
        return renderAgileView();
    }
  };

  if (!project) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <MaterialIcon
          name="hourglass-empty"
          size={48}
          color={theme.colors.text.secondary}
        />
        <Text
          style={{
            fontSize: 18,
            fontWeight: '600',
            color: theme.colors.text.primary,
            marginTop: 16,
          }}
        >
          Loading project details...
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar backgroundColor="transparent" translucent />

      {/* Floating Sparkles */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: height * 0.15,
            right: 30,
            width: 6,
            height: 6,
            backgroundColor: theme.colors.primary,
            borderRadius: 3,
            zIndex: 1000,
          },
          sparkleAnimatedStyle,
        ]}
      />
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: height * 0.25,
            left: 40,
            width: 4,
            height: 4,
            backgroundColor: theme.colors.accent,
            borderRadius: 2,
            zIndex: 1000,
          },
          sparkleAnimatedStyle,
        ]}
      />

      {/* Animated Header */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: insets.top + 60,
            paddingTop: insets.top,
            paddingHorizontal: 20,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 1000,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border + '20',
          },
          headerAnimatedStyle,
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: (theme.colors.surface || '#FFFFFF') + '90',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: theme.colors.shadows.neutral,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <Feather
            name="arrow-left"
            size={20}
            color={theme.colors.text.primary}
          />
        </TouchableOpacity>

        <Text
          style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: theme.colors.text.primary,
            flex: 1,
            textAlign: 'center',
            marginHorizontal: 16,
          }}
          numberOfLines={1}
        >
          {project.name}
        </Text>

        <TouchableOpacity
          onPress={() => showNotification('Project settings opened', 'info')}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: (theme.colors.surface || '#FFFFFF') + '90',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: theme.colors.shadows.neutral,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <Feather
            name="settings"
            size={20}
            color={theme.colors.text.primary}
          />
        </TouchableOpacity>
      </Animated.View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        bounces={true}
        removeClippedSubviews={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary || '#3B82F6'}
            colors={[theme.colors.primary || '#3B82F6']}
          />
        }
      >
        {/* Hero Section */}
        <Animated.View
          entering={FadeInDown.duration(800)}
          style={{
            paddingTop: insets.top + 80,
            paddingHorizontal: 20,
            paddingBottom: 20,
          }}
        >
          <View
            style={{
              backgroundColor: theme.colors.surface || '#FFFFFF',
              borderRadius: 24,
              padding: 24,
              shadowColor: theme.colors.shadows?.neutral || '#000000',
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.1,
              shadowRadius: 24,
              elevation: 12,
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}
          >
            {/* Status & Priority */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 16,
              }}
            >
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <View
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 16,
                    backgroundColor: getStatusColor(project.status),
                    shadowColor: getStatusColor(project.status),
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 4,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: 'bold',
                      color: theme.colors.text.onPrimary,
                      textTransform: 'uppercase',
                    }}
                  >
                    {project.status.replace('-', ' ')}
                  </Text>
                </View>

                <View
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 16,
                    backgroundColor: getPriorityColor(project.priority) + '20',
                    borderWidth: 1,
                    borderColor: getPriorityColor(project.priority) + '40',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '600',
                      color: getPriorityColor(project.priority),
                      textTransform: 'uppercase',
                    }}
                  >
                    {project.priority} Priority
                  </Text>
                </View>
              </View>
            </View>

            {/* Project Name */}
            <Text
              style={{
                fontSize: 24,
                fontWeight: 'bold',
                color: theme.colors.text.primary,
                lineHeight: 32,
                marginBottom: 8,
              }}
            >
              {project.name}
            </Text>

            <Text
              style={{
                fontSize: 16,
                color: theme.colors.text.secondary,
                lineHeight: 24,
                marginBottom: 20,
              }}
            >
              {project.description}
            </Text>

            {/* Progress Bar */}
            <View style={{ marginBottom: 20 }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: theme.colors.text.secondary,
                  }}
                >
                  Overall Progress
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: 'bold',
                    color: theme.colors.primary,
                  }}
                >
                  {project.progress}%
                </Text>
              </View>

              <View
                style={{
                  height: 8,
                  backgroundColor: theme.colors.background,
                  borderRadius: 4,
                  overflow: 'hidden',
                }}
              >
                <Animated.View
                  style={[
                    {
                      height: '100%',
                      borderRadius: 4,
                    },
                    progressAnimatedStyle,
                  ]}
                >
                  <LinearGradient
                    colors={
                      theme.colors.gradients?.primary || [
                        theme.colors.primary || '#3B82F6',
                        theme.colors.accent || '#8B5CF6',
                      ]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ flex: 1 }}
                  />
                </Animated.View>
              </View>
            </View>

            {/* Project Info */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingTop: 16,
                borderTopWidth: 1,
                borderTopColor: theme.colors.border,
              }}
            >
              <View style={{ alignItems: 'center', flex: 1 }}>
                <MaterialIcon
                  name="person"
                  size={20}
                  color={theme.colors.primary}
                />
                <Text
                  style={{
                    fontSize: 12,
                    color: theme.colors.text.secondary,
                    marginTop: 4,
                  }}
                >
                  {project.owner.name}
                </Text>
              </View>

              <View style={{ alignItems: 'center', flex: 1 }}>
                <MaterialIcon
                  name="group"
                  size={20}
                  color={theme.colors.success}
                />
                <Text
                  style={{
                    fontSize: 12,
                    color: theme.colors.text.secondary,
                    marginTop: 4,
                  }}
                >
                  {project.members.length} members
                </Text>
              </View>

              <View style={{ alignItems: 'center', flex: 1 }}>
                <MaterialIcon
                  name="event"
                  size={20}
                  color={theme.colors.warning}
                />
                <Text
                  style={{
                    fontSize: 12,
                    color: theme.colors.text.secondary,
                    marginTop: 4,
                  }}
                >
                  {project.timeline.endDate.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Tab Navigation */}
        <Animated.View
          entering={FadeInDown.delay(300).duration(600)}
          style={{ paddingHorizontal: 20, marginBottom: 20 }}
        >
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: theme.colors.surface,
              borderRadius: 12,
              padding: 4,
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}
          >
            {(['overview', 'phases', 'discussions', 'team'] as const).map(
              tab => (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    borderRadius: 8,
                    backgroundColor:
                      activeTab === tab ? theme.colors.primary : 'transparent',
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '600',
                      color:
                        activeTab === tab
                          ? theme.colors.text.onPrimary
                          : theme.colors.text.secondary,
                      textTransform: 'capitalize',
                    }}
                  >
                    {tab}
                  </Text>
                </TouchableOpacity>
              ),
            )}
          </View>
        </Animated.View>

        {/* Tab Content */}
        <View style={{ paddingHorizontal: 20 }}>
          {activeTab === 'overview' && (
            <View>
              {renderMethodologySelector()}
              {renderMethodologyContent()}
            </View>
          )}

          {activeTab === 'phases' && project?.phases && (
            <SimplePhaseManager
              phases={project.phases.map(p => ({
                id: p.id,
                name: p.name,
                description: p.description,
                status: p.status,
                progress: p.progress,
                estimatedDuration: p.estimatedDuration,
                blockers: p.blockers,
              }))}
              currentPhase={project.currentPhase || ''}
              onPhaseUpdate={(phaseId: string, updates: any) => {
                handleEditPhase(phaseId, updates);
              }}
            />
          )}

          {activeTab === 'discussions' && (
            <Animated.View
              entering={FadeInUp.duration(600)}
              style={{
                backgroundColor: theme.colors.surface,
                borderRadius: 16,
                padding: 20,
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 16,
                }}
              >
                <MaterialCommunityIcon
                  name="message-text-outline"
                  size={24}
                  color={theme.colors.primary}
                />
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    color: theme.colors.text.primary,
                    marginLeft: 12,
                  }}
                >
                  Project Discussions
                </Text>
              </View>

              {/* Mock discussion items */}
              <View style={{ marginBottom: 16 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    padding: 12,
                    backgroundColor: theme.colors.background,
                    borderRadius: 12,
                    marginBottom: 8,
                  }}
                >
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: theme.colors.primary,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 12,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: 'bold',
                        color: theme.colors.text.onPrimary,
                      }}
                    >
                      SJ
                    </Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginBottom: 4,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: 'bold',
                          color: theme.colors.text.primary,
                        }}
                      >
                        Sarah Johnson
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          color: theme.colors.text.secondary,
                          marginLeft: 8,
                        }}
                      >
                        2 hours ago
                      </Text>
                    </View>
                    <Text
                      style={{
                        fontSize: 13,
                        color: theme.colors.text.primary,
                        lineHeight: 18,
                      }}
                    >
                      Great progress on the API integration! @Alex Chen can you
                      provide an update on the authentication module?
                    </Text>

                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginTop: 8,
                        gap: 12,
                      }}
                    >
                      <TouchableOpacity
                        style={{ flexDirection: 'row', alignItems: 'center' }}
                      >
                        <Text style={{ fontSize: 12, marginRight: 4 }}>👍</Text>
                        <Text
                          style={{
                            fontSize: 12,
                            color: theme.colors.text.secondary,
                          }}
                        >
                          3
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity>
                        <Text
                          style={{
                            fontSize: 12,
                            color: theme.colors.primary,
                            fontWeight: '600',
                          }}
                        >
                          Reply
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    padding: 12,
                    backgroundColor: theme.colors.background,
                    borderRadius: 12,
                    marginLeft: 20,
                  }}
                >
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: theme.colors.accent,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 12,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: 'bold',
                        color: theme.colors.text.onPrimary,
                      }}
                    >
                      AC
                    </Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginBottom: 4,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: 'bold',
                          color: theme.colors.text.primary,
                        }}
                      >
                        Alex Chen
                      </Text>
                      <Text
                        style={{
                          fontSize: 11,
                          color: theme.colors.text.secondary,
                          marginLeft: 8,
                        }}
                      >
                        1 hour ago
                      </Text>
                    </View>
                    <Text
                      style={{
                        fontSize: 12,
                        color: theme.colors.text.primary,
                        lineHeight: 16,
                      }}
                    >
                      @Sarah Johnson Auth module is 90% complete. Just need to
                      finish the password reset flow. ETA: tomorrow morning.
                    </Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                onPress={() =>
                  showNotification('Full chat system coming soon!', 'info')
                }
                style={{
                  backgroundColor: theme.colors.primary + '20',
                  borderRadius: 12,
                  padding: 12,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: theme.colors.primary + '40',
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: theme.colors.primary,
                  }}
                >
                  💬 Join Discussion
                </Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          {activeTab === 'team' && (
            <Animated.View
              entering={FadeInUp.duration(600)}
              style={{
                backgroundColor: theme.colors.surface,
                borderRadius: 16,
                padding: 20,
                borderWidth: 1,
                borderColor: theme.colors.border,
                alignItems: 'center',
              }}
            >
              <MaterialCommunityIcon
                name="account-group"
                size={48}
                color={theme.colors.success}
              />
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: theme.colors.text.primary,
                  marginTop: 16,
                  marginBottom: 8,
                }}
              >
                Team Management
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: theme.colors.text.secondary,
                  textAlign: 'center',
                }}
              >
                Advanced team management features coming soon!
              </Text>
            </Animated.View>
          )}
        </View>
      </ScrollView>

      {/* Floating Action Buttons */}
      <View
        style={{
          position: 'absolute',
          bottom: 20 + insets.bottom,
          right: 20,
          flexDirection: 'column',
          gap: 12,
          alignItems: 'flex-end',
        }}
      >
        {/* Quick Actions Menu */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity
            onPress={() => navigation.navigate('TasksScreen')}
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: theme.colors.accent,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: theme.colors.accent,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 6,
            }}
          >
            <MaterialIcon
              name="assignment"
              size={20}
              color={theme.colors.text.onPrimary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              showNotification('Creating new task for this project...', 'info')
            }
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: theme.colors.warning,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: theme.colors.warning,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 6,
            }}
          >
            <MaterialIcon
              name="add-task"
              size={20}
              color={theme.colors.text.onPrimary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              showNotification('Starting AI project analysis... 🤖', 'info')
            }
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: theme.colors.info || theme.colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: theme.colors.info || theme.colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 6,
            }}
          >
            <MaterialCommunityIcon
              name="robot"
              size={20}
              color={theme.colors.text.onPrimary}
            />
          </TouchableOpacity>
        </View>

        {/* Main Action Button */}
        <TouchableOpacity
          onPress={() => {
            if (activeTab === 'phases') {
              showNotification('Opening phase transition options...', 'info');
            } else if (activeTab === 'discussions') {
              showNotification('Opening chat composer...', 'info');
            } else {
              showNotification('Project updated successfully! 🎉', 'success');
            }
          }}
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            shadowColor: theme.colors.primary,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          <LinearGradient
            colors={
              theme.colors.gradients?.primary || [
                theme.colors.primary || '#3B82F6',
                theme.colors.accent || '#8B5CF6',
              ]
            }
            style={{
              width: '100%',
              height: '100%',
              borderRadius: 28,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MaterialIcon
              name={
                activeTab === 'phases'
                  ? 'next-plan'
                  : activeTab === 'discussions'
                    ? 'message'
                    : activeTab === 'team'
                      ? 'group-add'
                      : 'check'
              }
              size={24}
              color={theme.colors.text.onPrimary}
            />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};
