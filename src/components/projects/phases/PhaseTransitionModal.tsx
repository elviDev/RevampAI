import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
  ZoomIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../contexts/ThemeContext';
import {
  ProjectPhase,
  ProjectMethodology,
  PhaseTransition,
  PhaseStatus,
} from '../../../types/projectMethodology.types';

interface PhaseTransitionModalProps {
  visible: boolean;
  phase: ProjectPhase | null;
  methodology: ProjectMethodology;
  allPhases: ProjectPhase[];
  onConfirm: (transition: PhaseTransition) => void;
  onCancel: () => void;
}

interface TransitionOption {
  toPhase: string;
  reason: string;
  description: string;
  requirements: string[];
  warning?: string;
  color: string;
  icon: string;
}

const PHASE_TRANSITIONS: Record<ProjectMethodology, Record<string, TransitionOption[]>> = {
  agile: {
    'Sprint Planning': [
      {
        toPhase: 'Sprint Active',
        reason: 'Start Sprint',
        description: 'Begin sprint execution with committed backlog',
        requirements: ['Sprint goal defined', 'Backlog items estimated', 'Team capacity confirmed'],
        color: '#10B981',
        icon: 'play-arrow',
      },
      {
        toPhase: 'Sprint Planning',
        reason: 'Restart Planning',
        description: 'Return to planning due to incomplete preparation',
        requirements: ['Team availability', 'Product owner input'],
        color: '#F59E0B',
        icon: 'refresh',
      },
    ],
    'Sprint Active': [
      {
        toPhase: 'Sprint Review',
        reason: 'Complete Sprint',
        description: 'Sprint completed, ready for review and demo',
        requirements: ['Sprint goal achieved', 'Increment ready', 'Demo prepared'],
        color: '#10B981',
        icon: 'check-circle',
      },
      {
        toPhase: 'Sprint Planning',
        reason: 'Abort Sprint',
        description: 'Cancel current sprint due to major changes',
        requirements: ['Stakeholder approval', 'Team consensus'],
        warning: 'This will reset sprint progress',
        color: '#EF4444',
        icon: 'cancel',
      },
    ],
    'Sprint Review': [
      {
        toPhase: 'Sprint Retrospective',
        reason: 'Continue to Retrospective',
        description: 'Move to process improvement discussion',
        requirements: ['Demo completed', 'Stakeholder feedback collected'],
        color: '#8B5CF6',
        icon: 'arrow-forward',
      },
    ],
    'Sprint Retrospective': [
      {
        toPhase: 'Sprint Planning',
        reason: 'Start Next Sprint',
        description: 'Begin planning for the next sprint cycle',
        requirements: ['Retrospective completed', 'Action items identified'],
        color: '#06B6D4',
        icon: 'refresh',
      },
    ],
  },
  scrum: {
    'Product Backlog Refinement': [
      {
        toPhase: 'Sprint Planning',
        reason: 'Backlog Ready',
        description: 'Backlog sufficiently refined for sprint planning',
        requirements: ['Stories estimated', 'Acceptance criteria defined', 'Dependencies identified'],
        color: '#10B981',
        icon: 'arrow-forward',
      },
    ],
    'Sprint Planning': [
      {
        toPhase: 'Sprint Execution',
        reason: 'Planning Complete',
        description: 'Sprint goal and backlog committed by team',
        requirements: ['Sprint goal agreed', 'Team commitment', 'Capacity planning done'],
        color: '#10B981',
        icon: 'play-arrow',
      },
      {
        toPhase: 'Product Backlog Refinement',
        reason: 'Need More Refinement',
        description: 'Backlog needs additional refinement before planning',
        requirements: ['Product owner availability'],
        color: '#F59E0B',
        icon: 'arrow-back',
      },
    ],
    'Sprint Execution': [
      {
        toPhase: 'Sprint Review',
        reason: 'Sprint Complete',
        description: 'Sprint timeline completed with deliverable increment',
        requirements: ['Sprint goal met', 'Increment tested', 'Definition of done met'],
        color: '#10B981',
        icon: 'check-circle',
      },
    ],
    'Sprint Review': [
      {
        toPhase: 'Sprint Retrospective',
        reason: 'Review Complete',
        description: 'Product demonstrated and feedback gathered',
        requirements: ['Stakeholder feedback', 'Product backlog updated'],
        color: '#8B5CF6',
        icon: 'arrow-forward',
      },
    ],
    'Sprint Retrospective': [
      {
        toPhase: 'Product Backlog Refinement',
        reason: 'Prepare Next Sprint',
        description: 'Refine backlog for upcoming sprint planning',
        requirements: ['Action items assigned', 'Process improvements identified'],
        color: '#06B6D4',
        icon: 'refresh',
      },
    ],
  },
  kanban: {
    'Backlog': [
      {
        toPhase: 'To Do',
        reason: 'Priority Selected',
        description: 'Item prioritized and ready for development',
        requirements: ['Priority assigned', 'Capacity available'],
        color: '#F59E0B',
        icon: 'arrow-forward',
      },
    ],
    'To Do': [
      {
        toPhase: 'In Progress',
        reason: 'Start Work',
        description: 'Begin active development on this item',
        requirements: ['Developer assigned', 'WIP limit check'],
        color: '#10B981',
        icon: 'play-arrow',
      },
      {
        toPhase: 'Backlog',
        reason: 'Deprioritize',
        description: 'Move back to backlog due to changing priorities',
        requirements: ['Stakeholder approval'],
        color: '#6B7280',
        icon: 'arrow-back',
      },
    ],
    'In Progress': [
      {
        toPhase: 'Code Review',
        reason: 'Development Complete',
        description: 'Implementation finished, ready for peer review',
        requirements: ['Code complete', 'Self-testing done'],
        color: '#8B5CF6',
        icon: 'arrow-forward',
      },
      {
        toPhase: 'To Do',
        reason: 'Blocked/Paused',
        description: 'Work paused due to blockers or dependencies',
        requirements: ['Blocker documented'],
        color: '#EF4444',
        icon: 'pause',
      },
    ],
    'Code Review': [
      {
        toPhase: 'Testing',
        reason: 'Review Approved',
        description: 'Code review passed, ready for testing',
        requirements: ['Peer approval', 'Code quality standards met'],
        color: '#10B981',
        icon: 'arrow-forward',
      },
      {
        toPhase: 'In Progress',
        reason: 'Changes Required',
        description: 'Code review feedback requires implementation changes',
        requirements: ['Feedback documented'],
        color: '#F59E0B',
        icon: 'arrow-back',
      },
    ],
    'Testing': [
      {
        toPhase: 'Done',
        reason: 'Testing Passed',
        description: 'All tests passing, ready for deployment',
        requirements: ['Test cases passed', 'Acceptance criteria met'],
        color: '#10B981',
        icon: 'check-circle',
      },
      {
        toPhase: 'In Progress',
        reason: 'Test Failures',
        description: 'Tests failed, requires bug fixes',
        requirements: ['Bugs documented', 'Developer assigned'],
        color: '#EF4444',
        icon: 'bug-report',
      },
    ],
  },
  waterfall: {
    'Requirements Analysis': [
      {
        toPhase: 'System Design',
        reason: 'Requirements Approved',
        description: 'All requirements documented and stakeholder-approved',
        requirements: ['Requirements document signed', 'Acceptance criteria defined', 'Scope locked'],
        color: '#10B981',
        icon: 'arrow-forward',
      },
    ],
    'System Design': [
      {
        toPhase: 'Implementation',
        reason: 'Design Approved',
        description: 'System architecture and design reviewed and approved',
        requirements: ['Design review passed', 'Architecture approved', 'Technical specs complete'],
        color: '#10B981',
        icon: 'arrow-forward',
      },
      {
        toPhase: 'Requirements Analysis',
        reason: 'Requirements Change',
        description: 'Significant requirements change requires analysis update',
        requirements: ['Change request approved', 'Impact assessment done'],
        warning: 'This may impact timeline and budget',
        color: '#F59E0B',
        icon: 'arrow-back',
      },
    ],
    'Implementation': [
      {
        toPhase: 'Testing',
        reason: 'Development Complete',
        description: 'All coding completed according to design specifications',
        requirements: ['Code complete', 'Unit tests passed', 'Code review done'],
        color: '#10B981',
        icon: 'arrow-forward',
      },
    ],
    'Testing': [
      {
        toPhase: 'Deployment',
        reason: 'Testing Passed',
        description: 'All test phases completed successfully',
        requirements: ['System tests passed', 'User acceptance testing done', 'Performance criteria met'],
        color: '#10B981',
        icon: 'arrow-forward',
      },
      {
        toPhase: 'Implementation',
        reason: 'Critical Bugs Found',
        description: 'Critical defects require code changes',
        requirements: ['Bug severity assessment', 'Fix priority assigned'],
        color: '#EF4444',
        icon: 'arrow-back',
      },
    ],
    'Deployment': [
      {
        toPhase: 'Maintenance',
        reason: 'Go-Live Successful',
        description: 'System successfully deployed to production',
        requirements: ['Deployment verified', 'User training complete', 'Support handover done'],
        color: '#10B981',
        icon: 'check-circle',
      },
    ],
  },
  lean: {
    'Problem Identification': [
      {
        toPhase: 'Solution Ideation',
        reason: 'Problem Validated',
        description: 'Problem clearly defined and validated with users',
        requirements: ['User research complete', 'Problem statement clear', 'Market opportunity sized'],
        color: '#10B981',
        icon: 'arrow-forward',
      },
    ],
    'Solution Ideation': [
      {
        toPhase: 'MVP Development',
        reason: 'Solution Direction Set',
        description: 'Solution approach validated and MVP scope defined',
        requirements: ['Value hypothesis formed', 'Solution feasibility confirmed', 'MVP features prioritized'],
        color: '#10B981',
        icon: 'arrow-forward',
      },
      {
        toPhase: 'Problem Identification',
        reason: 'Pivot Required',
        description: 'Solution approach not viable, need to redefine problem',
        requirements: ['Pivot decision documented', 'Lessons learned captured'],
        color: '#F59E0B',
        icon: 'refresh',
      },
    ],
    'MVP Development': [
      {
        toPhase: 'Validation & Learning',
        reason: 'MVP Ready',
        description: 'Minimum viable product completed and ready for user testing',
        requirements: ['Core features functional', 'Success metrics defined', 'Test users identified'],
        color: '#10B981',
        icon: 'arrow-forward',
      },
    ],
    'Validation & Learning': [
      {
        toPhase: 'Iteration & Scale',
        reason: 'Hypothesis Validated',
        description: 'User feedback positive, ready to iterate and scale',
        requirements: ['Success metrics met', 'User feedback positive', 'Market validation confirmed'],
        color: '#10B981',
        icon: 'trending-up',
      },
      {
        toPhase: 'Solution Ideation',
        reason: 'Pivot Based on Learning',
        description: 'User feedback indicates need for solution pivot',
        requirements: ['Learning documented', 'Pivot strategy defined'],
        color: '#F59E0B',
        icon: 'refresh',
      },
    ],
  },
  hybrid: {
    'Project Initiation': [
      {
        toPhase: 'Analysis & Design',
        reason: 'Charter Approved',
        description: 'Project charter and hybrid methodology approach approved',
        requirements: ['Stakeholder buy-in', 'Methodology plan approved', 'Team assembled'],
        color: '#10B981',
        icon: 'arrow-forward',
      },
    ],
    'Analysis & Design': [
      {
        toPhase: 'Iterative Development',
        reason: 'Foundation Complete',
        description: 'Core analysis and design foundation ready for iterative development',
        requirements: ['Architecture defined', 'Core requirements clear', 'Development plan approved'],
        color: '#10B981',
        icon: 'arrow-forward',
      },
    ],
    'Iterative Development': [
      {
        toPhase: 'Integration & Testing',
        reason: 'Development Complete',
        description: 'All development iterations completed, ready for integration',
        requirements: ['All iterations done', 'Integration plan ready', 'Testing strategy defined'],
        color: '#10B981',
        icon: 'arrow-forward',
      },
    ],
    'Integration & Testing': [
      {
        toPhase: 'Deployment & Transition',
        reason: 'Quality Gates Passed',
        description: 'System integration and testing completed successfully',
        requirements: ['Integration testing passed', 'Performance criteria met', 'User acceptance complete'],
        color: '#10B981',
        icon: 'arrow-forward',
      },
      {
        toPhase: 'Iterative Development',
        reason: 'Integration Issues',
        description: 'Integration problems require additional development',
        requirements: ['Issues documented', 'Fix plan created'],
        color: '#F59E0B',
        icon: 'arrow-back',
      },
    ],
  },
};

export const PhaseTransitionModal: React.FC<PhaseTransitionModalProps> = ({
  visible,
  phase,
  methodology,
  allPhases,
  onConfirm,
  onCancel,
}) => {
  const { theme } = useTheme();
  
  const [selectedTransition, setSelectedTransition] = useState<TransitionOption | null>(null);
  const [transitionNotes, setTransitionNotes] = useState('');
  const [confirmationStep, setConfirmationStep] = useState(false);

  // Animation values
  const scaleAnimation = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scaleAnimation.value = withSpring(1, {
        damping: 15,
        stiffness: 100,
      });
    } else {
      scaleAnimation.value = withTiming(0, { duration: 200 });
      setSelectedTransition(null);
      setTransitionNotes('');
      setConfirmationStep(false);
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnimation.value }],
    opacity: scaleAnimation.value,
  }));

  if (!phase) return null;

  const availableTransitions = PHASE_TRANSITIONS[methodology]?.[phase.name] || [];

  const handleTransitionSelect = (transition: TransitionOption) => {
    setSelectedTransition(transition);
    setConfirmationStep(true);
  };

  const handleConfirm = () => {
    if (!selectedTransition) return;

    const transition: PhaseTransition = {
      fromPhase: phase.name,
      toPhase: selectedTransition.toPhase,
      reason: selectedTransition.reason,
      timestamp: new Date(),
      notes: transitionNotes,
      triggeredBy: 'user', // In real app, this would be current user
      metadata: {
        requirements: selectedTransition.requirements,
        methodology,
      },
    };

    onConfirm(transition);
  };

  const renderTransitionOptions = () => (
    <View>
      <Text
        style={{
          fontSize: 18,
          fontWeight: 'bold',
          color: theme.colors.text.primary,
          marginBottom: 16,
          textAlign: 'center',
        }}
      >
        Transition Options for "{phase.name}"
      </Text>

      {availableTransitions.length === 0 ? (
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 40,
          }}
        >
          <MaterialCommunityIcon
            name="timeline-help-outline"
            size={48}
            color={theme.colors.text.secondary}
          />
          <Text
            style={{
              fontSize: 16,
              color: theme.colors.text.secondary,
              textAlign: 'center',
              marginTop: 16,
            }}
          >
            No transition options available for this phase
          </Text>
        </View>
      ) : (
        <ScrollView style={{ maxHeight: 400 }}>
          {availableTransitions.map((transition, index) => (
            <Animated.View
              key={transition.toPhase}
              entering={FadeIn.delay(index * 100)}
            >
              <TouchableOpacity
                onPress={() => handleTransitionSelect(transition)}
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
                    alignItems: 'center',
                    marginBottom: 8,
                  }}
                >
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: transition.color + '20',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 12,
                    }}
                  >
                    <MaterialIcon
                      name={transition.icon}
                      size={20}
                      color={transition.color}
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: 'bold',
                        color: theme.colors.text.primary,
                      }}
                    >
                      {transition.reason}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        color: transition.color,
                        fontWeight: '600',
                      }}
                    >
                      → {transition.toPhase}
                    </Text>
                  </View>

                  <MaterialIcon
                    name="arrow-forward-ios"
                    size={16}
                    color={theme.colors.text.secondary}
                  />
                </View>

                <Text
                  style={{
                    fontSize: 14,
                    color: theme.colors.text.secondary,
                    lineHeight: 20,
                    marginBottom: 8,
                  }}
                >
                  {transition.description}
                </Text>

                {transition.warning && (
                  <View
                    style={{
                      backgroundColor: theme.colors.error + '10',
                      borderRadius: 8,
                      padding: 8,
                      marginBottom: 8,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        color: theme.colors.error,
                        fontWeight: '600',
                      }}
                    >
                      ⚠️ {transition.warning}
                    </Text>
                  </View>
                )}

                <Text
                  style={{
                    fontSize: 12,
                    color: theme.colors.text.secondary,
                    fontWeight: '600',
                  }}
                >
                  Requirements: {transition.requirements.length} items
                </Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </ScrollView>
      )}
    </View>
  );

  const renderConfirmation = () => (
    <View>
      <Text
        style={{
          fontSize: 18,
          fontWeight: 'bold',
          color: theme.colors.text.primary,
          marginBottom: 16,
          textAlign: 'center',
        }}
      >
        Confirm Phase Transition
      </Text>

      {selectedTransition && (
        <View>
          <View
            style={{
              backgroundColor: selectedTransition.color + '10',
              borderRadius: 16,
              padding: 16,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: selectedTransition.color + '20',
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: 'bold',
                color: theme.colors.text.primary,
                marginBottom: 4,
              }}
            >
              {phase.name} → {selectedTransition.toPhase}
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: theme.colors.text.secondary,
              }}
            >
              {selectedTransition.description}
            </Text>
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: theme.colors.text.primary,
                marginBottom: 8,
              }}
            >
              Requirements Checklist:
            </Text>
            {selectedTransition.requirements.map((req, index) => (
              <Text
                key={index}
                style={{
                  fontSize: 12,
                  color: theme.colors.text.secondary,
                  marginLeft: 8,
                  marginBottom: 4,
                }}
              >
                ✓ {req}
              </Text>
            ))}
          </View>

          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: theme.colors.text.primary,
                marginBottom: 8,
              }}
            >
              Transition Notes (Optional):
            </Text>
            <TextInput
              value={transitionNotes}
              onChangeText={setTransitionNotes}
              placeholder="Add any notes about this transition..."
              multiline
              numberOfLines={3}
              style={{
                backgroundColor: theme.colors.surface,
                borderRadius: 12,
                padding: 12,
                borderWidth: 1,
                borderColor: theme.colors.border,
                fontSize: 14,
                color: theme.colors.text.primary,
                textAlignVertical: 'top',
              }}
              placeholderTextColor={theme.colors.text.secondary}
            />
          </View>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              onPress={() => setConfirmationStep(false)}
              style={{
                flex: 1,
                backgroundColor: theme.colors.surface,
                paddingVertical: 12,
                borderRadius: 12,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: theme.colors.text.primary,
                }}
              >
                Back
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleConfirm}
              style={{
                flex: 1,
                backgroundColor: selectedTransition.color,
                paddingVertical: 12,
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
                Confirm Transition
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onCancel}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}
      >
        <Animated.View
          style={[
            {
              backgroundColor: theme.colors.background,
              borderRadius: 24,
              padding: 24,
              width: '100%',
              maxWidth: 400,
              maxHeight: '80%',
              shadowColor: theme.colors.shadows.neutral,
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.3,
              shadowRadius: 24,
              elevation: 24,
            },
            animatedStyle,
          ]}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              marginBottom: 16,
            }}
          >
            <TouchableOpacity
              onPress={onCancel}
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

          {confirmationStep ? renderConfirmation() : renderTransitionOptions()}
        </Animated.View>
      </View>
    </Modal>
  );
};