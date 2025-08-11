import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
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
  interpolate,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../contexts/ThemeContext';
import {
  ProjectPhase,
  ProjectMethodology,
  PhaseStatus,
} from '../../../types/projectMethodology.types';

interface PhaseCardProps {
  phase: ProjectPhase;
  index: number;
  isActive: boolean;
  methodology: ProjectMethodology;
  onTransition: () => void;
  onEdit: (updates: Partial<ProjectPhase>) => void;
  onDelete: () => void;
}

export const PhaseCard: React.FC<PhaseCardProps> = ({
  phase,
  index,
  isActive,
  methodology,
  onTransition,
  onEdit,
  onDelete,
}) => {
  const { theme } = useTheme();
  const [expanded, setExpanded] = useState(false);

  // Animation values
  const expandAnimation = useSharedValue(0);
  const progressAnimation = useSharedValue(phase.progress / 100);

  const toggleExpanded = () => {
    setExpanded(!expanded);
    expandAnimation.value = withTiming(expanded ? 0 : 1, {
      duration: 300,
    });
  };

  const animatedExpandStyle = useAnimatedStyle(() => ({
    height: interpolate(expandAnimation.value, [0, 1], [0, 200]),
    opacity: expandAnimation.value,
  }));

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${interpolate(progressAnimation.value, [0, 1], [0, 100])}%`,
  }));

  const getStatusIcon = (status: PhaseStatus) => {
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

  const getStatusColor = (status: PhaseStatus) => {
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

  const getStatusText = (status: PhaseStatus) => {
    switch (status) {
      case 'not_started':
        return 'Not Started';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'blocked':
        return 'Blocked';
      case 'on_hold':
        return 'On Hold';
      default:
        return 'Unknown';
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

  const formatDuration = (hours: number) => {
    if (hours === 0) return 'Not set';
    if (hours < 8) return `${hours}h`;
    const days = Math.floor(hours / 8);
    const remainingHours = hours % 8;
    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100).duration(600)}
      style={{
        marginBottom: 16,
        borderRadius: 20,
        backgroundColor: theme.colors.surface,
        borderWidth: isActive ? 2 : 1,
        borderColor: isActive ? theme.colors.primary : theme.colors.border,
        shadowColor: theme.colors.shadows.neutral,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isActive ? 0.15 : 0.05,
        shadowRadius: 12,
        elevation: isActive ? 8 : 2,
      }}
    >
      {/* Phase Header */}
      <TouchableOpacity
        onPress={toggleExpanded}
        activeOpacity={0.8}
        style={{
          padding: 20,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: 12,
          }}
        >
          <View style={{ flex: 1, marginRight: 12 }}>
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
                  backgroundColor: getStatusColor(phase.status) + '20',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}
              >
                <MaterialIcon
                  name={getStatusIcon(phase.status)}
                  size={20}
                  color={getStatusColor(phase.status)}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    color: theme.colors.text.primary,
                  }}
                >
                  {phase.name}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: getStatusColor(phase.status),
                    fontWeight: '600',
                    textTransform: 'uppercase',
                  }}
                >
                  {getStatusText(phase.status)}
                </Text>
              </View>
            </View>

            <Text
              style={{
                fontSize: 14,
                color: theme.colors.text.secondary,
                lineHeight: 20,
              }}
            >
              {phase.description}
            </Text>
          </View>

          <View style={{ alignItems: 'flex-end' }}>
            {isActive && (
              <View
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 12,
                  backgroundColor: theme.colors.primary + '20',
                  marginBottom: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: '600',
                    color: theme.colors.primary,
                  }}
                >
                  ACTIVE
                </Text>
              </View>
            )}

            <MaterialIcon
              name={expanded ? 'expand-less' : 'expand-more'}
              size={24}
              color={theme.colors.text.secondary}
            />
          </View>
        </View>

        {/* Progress Bar */}
        <View style={{ marginBottom: 16 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 6,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: '600',
                color: theme.colors.text.secondary,
              }}
            >
              Progress
            </Text>
            <Text
              style={{
                fontSize: 12,
                fontWeight: 'bold',
                color: getStatusColor(phase.status),
              }}
            >
              {Math.round(phase.progress)}%
            </Text>
          </View>

          <View
            style={{
              height: 6,
              backgroundColor: theme.colors.background,
              borderRadius: 3,
              overflow: 'hidden',
            }}
          >
            <Animated.View
              style={[
                {
                  height: '100%',
                  borderRadius: 3,
                  backgroundColor: getStatusColor(phase.status),
                },
                progressAnimatedStyle,
              ]}
            />
          </View>
        </View>

        {/* Phase Stats */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <View style={{ alignItems: 'center' }}>
            <MaterialCommunityIcon
              name="clock-outline"
              size={16}
              color={theme.colors.primary}
            />
            <Text
              style={{
                fontSize: 11,
                color: theme.colors.text.secondary,
                marginTop: 2,
              }}
            >
              {formatDuration(phase.estimatedDuration)}
            </Text>
          </View>

          <View style={{ alignItems: 'center' }}>
            <MaterialCommunityIcon
              name="check-circle-outline"
              size={16}
              color={theme.colors.success}
            />
            <Text
              style={{
                fontSize: 11,
                color: theme.colors.text.secondary,
                marginTop: 2,
              }}
            >
              {phase.deliverables.length} items
            </Text>
          </View>

          <View style={{ alignItems: 'center' }}>
            <MaterialCommunityIcon
              name="account-group"
              size={16}
              color={theme.colors.warning}
            />
            <Text
              style={{
                fontSize: 11,
                color: theme.colors.text.secondary,
                marginTop: 2,
              }}
            >
              {phase.assignedTeam.length} members
            </Text>
          </View>

          {phase.blockers.length > 0 && (
            <View style={{ alignItems: 'center' }}>
              <MaterialCommunityIcon
                name="alert-circle"
                size={16}
                color={theme.colors.error}
              />
              <Text
                style={{
                  fontSize: 11,
                  color: theme.colors.text.secondary,
                  marginTop: 2,
                }}
              >
                {phase.blockers.length} blockers
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      {/* Expanded Details */}
      {expanded && (
        <Animated.View
          style={[
            {
              paddingHorizontal: 20,
              paddingBottom: 20,
              borderTopWidth: 1,
              borderTopColor: theme.colors.border,
              overflow: 'hidden',
            },
            animatedExpandStyle,
          ]}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingTop: 16,
              marginBottom: 16,
            }}
          >
            <TouchableOpacity
              onPress={onTransition}
              style={{
                flex: 1,
                backgroundColor: theme.colors.primary,
                paddingVertical: 10,
                borderRadius: 12,
                alignItems: 'center',
                marginRight: 8,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: theme.colors.text.onPrimary,
                }}
              >
                Transition Phase
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  'Edit Phase',
                  'Phase editing functionality coming soon!',
                  [{ text: 'OK' }]
                );
              }}
              style={{
                backgroundColor: theme.colors.accent + '20',
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 12,
                alignItems: 'center',
                marginRight: 8,
              }}
            >
              <MaterialIcon
                name="edit"
                size={16}
                color={theme.colors.accent}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onDelete}
              style={{
                backgroundColor: theme.colors.error + '20',
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 12,
                alignItems: 'center',
              }}
            >
              <MaterialIcon
                name="delete"
                size={16}
                color={theme.colors.error}
              />
            </TouchableOpacity>
          </View>

          {/* Deliverables */}
          {phase.deliverables.length > 0 && (
            <View style={{ marginBottom: 12 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: theme.colors.text.primary,
                  marginBottom: 6,
                }}
              >
                Deliverables:
              </Text>
              {phase.deliverables.slice(0, 3).map((deliverable, idx) => (
                <Text
                  key={idx}
                  style={{
                    fontSize: 12,
                    color: theme.colors.text.secondary,
                    marginLeft: 8,
                    marginBottom: 2,
                  }}
                >
                  • {deliverable}
                </Text>
              ))}
              {phase.deliverables.length > 3 && (
                <Text
                  style={{
                    fontSize: 12,
                    color: theme.colors.text.secondary,
                    marginLeft: 8,
                    fontStyle: 'italic',
                  }}
                >
                  +{phase.deliverables.length - 3} more...
                </Text>
              )}
            </View>
          )}

          {/* Exit Criteria */}
          {phase.exitCriteria.length > 0 && (
            <View style={{ marginBottom: 12 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: theme.colors.text.primary,
                  marginBottom: 6,
                }}
              >
                Exit Criteria:
              </Text>
              {phase.exitCriteria.slice(0, 2).map((criteria, idx) => (
                <Text
                  key={idx}
                  style={{
                    fontSize: 12,
                    color: theme.colors.text.secondary,
                    marginLeft: 8,
                    marginBottom: 2,
                  }}
                >
                  ✓ {criteria}
                </Text>
              ))}
            </View>
          )}
        </Animated.View>
      )}
    </Animated.View>
  );
};