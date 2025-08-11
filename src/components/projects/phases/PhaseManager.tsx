import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInRight,
  ZoomIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../contexts/ThemeContext';
import { useQuickActions } from '../../../contexts/QuickActionsContext';
import {
  ProjectMethodology,
  ProjectPhase,
  PhaseStatus,
  PhaseTransition,
} from '../../../types/projectMethodology.types';
import { PhaseCard } from './PhaseCard';
import { PhaseTransitionModal } from './PhaseTransitionModal';

interface PhaseManagerProps {
  methodology: ProjectMethodology;
  currentPhase: string;
  phases: ProjectPhase[];
  onPhaseChange: (phaseId: string, transition: PhaseTransition) => void;
  onCreatePhase: (phase: Omit<ProjectPhase, 'id'>) => void;
  onEditPhase: (phaseId: string, updates: Partial<ProjectPhase>) => void;
  onDeletePhase: (phaseId: string) => void;
  projectId: string;
}

interface PhaseTemplate {
  name: string;
  description: string;
  estimatedDuration: number;
  prerequisites: string[];
  deliverables: string[];
  exitCriteria: string[];
}

const METHODOLOGY_TEMPLATES: Record<ProjectMethodology, PhaseTemplate[]> = {
  agile: [
    {
      name: 'Sprint Planning',
      description: 'Plan and commit to sprint goals and backlog items',
      estimatedDuration: 2,
      prerequisites: ['Refined backlog', 'Team availability'],
      deliverables: ['Sprint goal', 'Sprint backlog', 'Capacity plan'],
      exitCriteria: ['All stories estimated', 'Sprint goal defined'],
    },
    {
      name: 'Sprint Active',
      description: 'Execute sprint work and daily standups',
      estimatedDuration: 10,
      prerequisites: ['Sprint plan approved'],
      deliverables: ['Working software increment', 'Updated burndown'],
      exitCriteria: ['Sprint goal achieved', 'Demo ready'],
    },
    {
      name: 'Sprint Review',
      description: 'Demo completed work to stakeholders',
      estimatedDuration: 2,
      prerequisites: ['Sprint completed'],
      deliverables: ['Product demo', 'Stakeholder feedback'],
      exitCriteria: ['Demo completed', 'Feedback collected'],
    },
    {
      name: 'Sprint Retrospective',
      description: 'Reflect on process and identify improvements',
      estimatedDuration: 1,
      prerequisites: ['Sprint review completed'],
      deliverables: ['Retrospective notes', 'Action items'],
      exitCriteria: ['Improvements identified', 'Actions assigned'],
    },
  ],
  scrum: [
    {
      name: 'Product Backlog Refinement',
      description: 'Refine and prioritize product backlog items',
      estimatedDuration: 4,
      prerequisites: ['Product vision', 'Initial requirements'],
      deliverables: ['Refined backlog', 'Story estimates'],
      exitCriteria: ['Backlog ready for sprint planning'],
    },
    {
      name: 'Sprint Planning',
      description: 'Plan sprint goals and select backlog items',
      estimatedDuration: 4,
      prerequisites: ['Refined backlog', 'Team capacity'],
      deliverables: ['Sprint goal', 'Sprint backlog'],
      exitCriteria: ['Team commitment to sprint goal'],
    },
    {
      name: 'Sprint Execution',
      description: 'Daily development work with standup meetings',
      estimatedDuration: 80,
      prerequisites: ['Sprint plan'],
      deliverables: ['Working increment', 'Daily updates'],
      exitCriteria: ['Sprint goal potentially achievable'],
    },
    {
      name: 'Sprint Review',
      description: 'Inspect increment and adapt product backlog',
      estimatedDuration: 2,
      prerequisites: ['Potentially shippable increment'],
      deliverables: ['Product demo', 'Updated backlog'],
      exitCriteria: ['Stakeholder feedback received'],
    },
    {
      name: 'Sprint Retrospective',
      description: 'Inspect team process and create improvement plan',
      estimatedDuration: 2,
      prerequisites: ['Sprint review completed'],
      deliverables: ['Process improvements', 'Action items'],
      exitCriteria: ['Next sprint improvements identified'],
    },
  ],
  kanban: [
    {
      name: 'Backlog',
      description: 'Collection of prioritized work items',
      estimatedDuration: 0,
      prerequisites: ['Requirements gathered'],
      deliverables: ['Prioritized backlog'],
      exitCriteria: ['Items ready to start'],
    },
    {
      name: 'To Do',
      description: 'Work selected and ready to begin',
      estimatedDuration: 0,
      prerequisites: ['Capacity available'],
      deliverables: ['Work commitment'],
      exitCriteria: ['Work can begin immediately'],
    },
    {
      name: 'In Progress',
      description: 'Active development work with WIP limits',
      estimatedDuration: 0,
      prerequisites: ['Work started'],
      deliverables: ['Work progress'],
      exitCriteria: ['Work completed'],
    },
    {
      name: 'Code Review',
      description: 'Quality assurance and peer review',
      estimatedDuration: 0,
      prerequisites: ['Code completed'],
      deliverables: ['Reviewed code'],
      exitCriteria: ['Quality standards met'],
    },
    {
      name: 'Testing',
      description: 'Quality assurance and testing phase',
      estimatedDuration: 0,
      prerequisites: ['Code reviewed'],
      deliverables: ['Test results'],
      exitCriteria: ['All tests passing'],
    },
    {
      name: 'Done',
      description: 'Completed and delivered work',
      estimatedDuration: 0,
      prerequisites: ['Testing completed'],
      deliverables: ['Delivered feature'],
      exitCriteria: ['Definition of done met'],
    },
  ],
  waterfall: [
    {
      name: 'Requirements Analysis',
      description: 'Gather and document all project requirements',
      estimatedDuration: 20,
      prerequisites: ['Project charter approved'],
      deliverables: ['Requirements document', 'Acceptance criteria'],
      exitCriteria: ['Requirements approved by stakeholders'],
    },
    {
      name: 'System Design',
      description: 'Create system architecture and detailed design',
      estimatedDuration: 15,
      prerequisites: ['Requirements completed'],
      deliverables: ['System architecture', 'Design documents'],
      exitCriteria: ['Design review passed'],
    },
    {
      name: 'Implementation',
      description: 'Code development based on approved design',
      estimatedDuration: 40,
      prerequisites: ['Design approved'],
      deliverables: ['Source code', 'Unit tests'],
      exitCriteria: ['Code review completed'],
    },
    {
      name: 'Testing',
      description: 'System testing and quality assurance',
      estimatedDuration: 20,
      prerequisites: ['Implementation completed'],
      deliverables: ['Test results', 'Bug reports'],
      exitCriteria: ['Acceptance criteria met'],
    },
    {
      name: 'Deployment',
      description: 'Release to production environment',
      estimatedDuration: 5,
      prerequisites: ['Testing passed'],
      deliverables: ['Deployed system', 'User documentation'],
      exitCriteria: ['System live and operational'],
    },
    {
      name: 'Maintenance',
      description: 'Ongoing support and maintenance',
      estimatedDuration: 0,
      prerequisites: ['System deployed'],
      deliverables: ['Support documentation'],
      exitCriteria: ['Support processes established'],
    },
  ],
  lean: [
    {
      name: 'Problem Identification',
      description: 'Identify and validate the problem to solve',
      estimatedDuration: 5,
      prerequisites: ['Market research'],
      deliverables: ['Problem statement', 'User research'],
      exitCriteria: ['Problem validated'],
    },
    {
      name: 'Solution Ideation',
      description: 'Generate and evaluate potential solutions',
      estimatedDuration: 10,
      prerequisites: ['Problem defined'],
      deliverables: ['Solution concepts', 'Value hypothesis'],
      exitCriteria: ['Solution direction chosen'],
    },
    {
      name: 'MVP Development',
      description: 'Build minimum viable product for testing',
      estimatedDuration: 20,
      prerequisites: ['Solution validated'],
      deliverables: ['MVP product', 'Success metrics'],
      exitCriteria: ['MVP ready for testing'],
    },
    {
      name: 'Validation & Learning',
      description: 'Test MVP with real users and gather feedback',
      estimatedDuration: 10,
      prerequisites: ['MVP completed'],
      deliverables: ['User feedback', 'Metrics data'],
      exitCriteria: ['Learning objectives met'],
    },
    {
      name: 'Iteration & Scale',
      description: 'Improve based on learning and scale successful features',
      estimatedDuration: 30,
      prerequisites: ['Validation completed'],
      deliverables: ['Improved product', 'Growth plan'],
      exitCriteria: ['Product-market fit achieved'],
    },
  ],
  hybrid: [
    {
      name: 'Project Initiation',
      description: 'Define project scope, methodology mix, and initial planning',
      estimatedDuration: 10,
      prerequisites: ['Stakeholder approval'],
      deliverables: ['Project charter', 'Methodology plan'],
      exitCriteria: ['Approach approved'],
    },
    {
      name: 'Analysis & Design',
      description: 'Requirements analysis with iterative design approach',
      estimatedDuration: 15,
      prerequisites: ['Project initiated'],
      deliverables: ['Requirements', 'Design prototypes'],
      exitCriteria: ['Core design validated'],
    },
    {
      name: 'Iterative Development',
      description: 'Agile development cycles with milestone checkpoints',
      estimatedDuration: 40,
      prerequisites: ['Design approved'],
      deliverables: ['Working increments', 'Test results'],
      exitCriteria: ['Major milestones achieved'],
    },
    {
      name: 'Integration & Testing',
      description: 'System integration with comprehensive testing',
      estimatedDuration: 15,
      prerequisites: ['Development completed'],
      deliverables: ['Integrated system', 'Test reports'],
      exitCriteria: ['Quality gates passed'],
    },
    {
      name: 'Deployment & Transition',
      description: 'Controlled rollout with change management',
      estimatedDuration: 10,
      prerequisites: ['Testing completed'],
      deliverables: ['Deployed system', 'Training materials'],
      exitCriteria: ['Go-live successful'],
    },
  ],
};

export const PhaseManager: React.FC<PhaseManagerProps> = ({
  methodology,
  currentPhase,
  phases,
  onPhaseChange,
  onCreatePhase,
  onEditPhase,
  onDeletePhase,
  projectId,
}) => {
  const { theme } = useTheme();
  const { showNotification } = useQuickActions();
  
  const [showTransitionModal, setShowTransitionModal] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState<ProjectPhase | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Animation values
  const phaseAnimation = useSharedValue(0);

  useEffect(() => {
    phaseAnimation.value = withSpring(1, {
      damping: 15,
      stiffness: 100,
    });
  }, [phases]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: phaseAnimation.value,
    transform: [{ scale: phaseAnimation.value }],
  }));

  const handlePhaseTransition = (phase: ProjectPhase) => {
    setSelectedPhase(phase);
    setShowTransitionModal(true);
  };

  const handleTransitionConfirm = (transition: PhaseTransition) => {
    if (selectedPhase) {
      setIsLoading(true);
      onPhaseChange(selectedPhase.id, transition);
      setShowTransitionModal(false);
      setSelectedPhase(null);
      
      setTimeout(() => {
        setIsLoading(false);
        showNotification(
          `Phase transitioned to ${transition.toPhase}`,
          'success'
        );
      }, 1000);
    }
  };

  const handleCreateFromTemplate = (template: PhaseTemplate) => {
    const newPhase: Omit<ProjectPhase, 'id'> = {
      name: template.name,
      description: template.description,
      status: 'not_started',
      startDate: null,
      endDate: null,
      estimatedDuration: template.estimatedDuration,
      actualDuration: 0,
      prerequisites: template.prerequisites,
      deliverables: template.deliverables,
      exitCriteria: template.exitCriteria,
      progress: 0,
      assignedTeam: [],
      blockers: [],
      risks: [],
      artifacts: [],
      metrics: {},
    };

    onCreatePhase(newPhase);
    setShowTemplates(false);
    showNotification(`Phase "${template.name}" created successfully!`, 'success');
  };

  const renderPhaseTemplates = () => {
    const templates = METHODOLOGY_TEMPLATES[methodology] || [];

    return (
      <Modal
        visible={showTemplates}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View
          style={{
            flex: 1,
            backgroundColor: theme.colors.background,
            paddingTop: 20,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: 20,
              paddingBottom: 20,
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.border,
            }}
          >
            <Text
              style={{
                fontSize: 24,
                fontWeight: 'bold',
                color: theme.colors.text.primary,
              }}
            >
              {methodology.charAt(0).toUpperCase() + methodology.slice(1)} Templates
            </Text>
            <TouchableOpacity
              onPress={() => setShowTemplates(false)}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: theme.colors.error + '20',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MaterialIcon
                name="close"
                size={20}
                color={theme.colors.error}
              />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 20 }}
            showsVerticalScrollIndicator={false}
          >
            {templates.map((template, index) => (
              <Animated.View
                key={template.name}
                entering={FadeInDown.delay(index * 100)}
                style={{
                  backgroundColor: theme.colors.surface,
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: 12,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: theme.colors.text.primary,
                        marginBottom: 4,
                      }}
                    >
                      {template.name}
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        color: theme.colors.text.secondary,
                        lineHeight: 20,
                      }}
                    >
                      {template.description}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleCreateFromTemplate(template)}
                    style={{
                      backgroundColor: theme.colors.primary,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 12,
                      marginLeft: 12,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: '600',
                        color: theme.colors.text.onPrimary,
                      }}
                    >
                      Add Phase
                    </Text>
                  </TouchableOpacity>
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 8,
                  }}
                >
                  <MaterialCommunityIcon
                    name="clock-outline"
                    size={16}
                    color={theme.colors.primary}
                  />
                  <Text
                    style={{
                      fontSize: 12,
                      color: theme.colors.text.secondary,
                      marginLeft: 4,
                    }}
                  >
                    Estimated: {template.estimatedDuration} hours
                  </Text>
                </View>

                {template.deliverables.length > 0 && (
                  <View style={{ marginTop: 8 }}>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: '600',
                        color: theme.colors.text.primary,
                        marginBottom: 4,
                      }}
                    >
                      Key Deliverables:
                    </Text>
                    {template.deliverables.slice(0, 3).map((deliverable, idx) => (
                      <Text
                        key={idx}
                        style={{
                          fontSize: 11,
                          color: theme.colors.text.secondary,
                          marginLeft: 8,
                        }}
                      >
                        • {deliverable}
                      </Text>
                    ))}
                  </View>
                )}
              </Animated.View>
            ))}
          </ScrollView>
        </View>
      </Modal>
    );
  };

  const getPhaseIcon = (status: PhaseStatus) => {
    switch (status) {
      case 'not_started':
        return 'radio-button-unchecked';
      case 'in_progress':
        return 'schedule';
      case 'completed':
        return 'check-circle';
      case 'blocked':
        return 'block';
      case 'on_hold':
        return 'pause-circle-filled';
      default:
        return 'help-outline';
    }
  };

  const getPhaseColor = (status: PhaseStatus, isActive: boolean) => {
    if (isActive) return theme.colors.primary;
    
    switch (status) {
      case 'not_started':
        return theme.colors.text.secondary;
      case 'in_progress':
        return theme.colors.warning;
      case 'completed':
        return theme.colors.success;
      case 'blocked':
        return theme.colors.error;
      case 'on_hold':
        return theme.colors.secondary;
      default:
        return theme.colors.text.secondary;
    }
  };

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 40,
        }}
      >
        <MaterialCommunityIcon
          name="loading"
          size={48}
          color={theme.colors.primary}
        />
        <Text
          style={{
            fontSize: 16,
            fontWeight: '600',
            color: theme.colors.text.primary,
            marginTop: 16,
            textAlign: 'center',
          }}
        >
          Transitioning Phase...
        </Text>
      </View>
    );
  }

  return (
    <Animated.View style={[{ flex: 1 }, animatedStyle]}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingVertical: 16,
          backgroundColor: theme.colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        }}
      >
        <View>
          <Text
            style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: theme.colors.text.primary,
            }}
          >
            Project Phases
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: theme.colors.text.secondary,
              textTransform: 'capitalize',
            }}
          >
            {methodology} Methodology
          </Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity
            onPress={() => setShowTemplates(true)}
            style={{
              backgroundColor: theme.colors.primary + '20',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: theme.colors.primary + '40',
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: '600',
                color: theme.colors.primary,
              }}
            >
              Add Template
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {phases.length === 0 ? (
          <Animated.View
            entering={FadeInDown.duration(600)}
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 60,
            }}
          >
            <MaterialCommunityIcon
              name="timeline-outline"
              size={64}
              color={theme.colors.text.secondary}
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
              No Phases Defined
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: theme.colors.text.secondary,
                textAlign: 'center',
                marginBottom: 24,
                maxWidth: 280,
              }}
            >
              Start by adding phases from templates or create custom phases
            </Text>
            <TouchableOpacity
              onPress={() => setShowTemplates(true)}
              style={{
                backgroundColor: theme.colors.primary,
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 16,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: theme.colors.text.onPrimary,
                }}
              >
                Browse Templates
              </Text>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <View>
            {phases.map((phase, index) => (
              <PhaseCard
                key={phase.id}
                phase={phase}
                index={index}
                isActive={phase.id === currentPhase}
                methodology={methodology}
                onTransition={() => handlePhaseTransition(phase)}
                onEdit={(updates) => onEditPhase(phase.id, updates)}
                onDelete={() => {
                  Alert.alert(
                    'Delete Phase',
                    `Are you sure you want to delete "${phase.name}"?`,
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: () => onDeletePhase(phase.id),
                      },
                    ]
                  );
                }}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Phase Templates Modal */}
      {renderPhaseTemplates()}

      {/* Phase Transition Modal */}
      <PhaseTransitionModal
        visible={showTransitionModal}
        phase={selectedPhase}
        methodology={methodology}
        allPhases={phases}
        onConfirm={handleTransitionConfirm}
        onCancel={() => {
          setShowTransitionModal(false);
          setSelectedPhase(null);
        }}
      />
    </Animated.View>
  );
};