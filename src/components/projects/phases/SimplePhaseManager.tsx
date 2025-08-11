import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../contexts/ThemeContext';
import { useQuickActions } from '../../../contexts/QuickActionsContext';

interface SimplePhase {
  id: string;
  name: string;
  description: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked' | 'on_hold';
  progress: number;
  estimatedDuration: number;
  blockers: Array<{
    id: string;
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }>;
}

interface SimplePhaseManagerProps {
  phases: SimplePhase[];
  currentPhase: string;
  onPhaseUpdate: (phaseId: string, updates: Partial<SimplePhase>) => void;
}

export const SimplePhaseManager: React.FC<SimplePhaseManagerProps> = ({
  phases,
  currentPhase,
  onPhaseUpdate,
}) => {
  const { theme } = useTheme();
  const { showNotification } = useQuickActions();

  const getStatusIcon = (status: string) => {
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

  const getStatusColor = (status: string, isActive: boolean) => {
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

  const handlePhaseAction = (phaseId: string, phase: SimplePhase) => {
    Alert.alert(
      'Phase Actions',
      `What would you like to do with "${phase.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start Phase',
          onPress: () => {
            onPhaseUpdate(phaseId, { status: 'in_progress' });
            showNotification(`Started phase: ${phase.name}`, 'success');
          },
        },
        {
          text: 'Complete Phase',
          onPress: () => {
            onPhaseUpdate(phaseId, { status: 'completed', progress: 100 });
            showNotification(`Completed phase: ${phase.name}`, 'success');
          },
        },
        {
          text: 'Block Phase',
          onPress: () => {
            onPhaseUpdate(phaseId, { status: 'blocked' });
            showNotification(`Blocked phase: ${phase.name}`, 'warning');
          },
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1 }}>
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
            }}
          >
            Agile Methodology
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => showNotification('Phase templates coming soon!', 'info')}
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
            Add Phase
          </Text>
        </TouchableOpacity>
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
              Start by adding phases to track project progress
            </Text>
          </Animated.View>
        ) : (
          <View>
            {phases.map((phase, index) => {
              const isActive = phase.id === currentPhase;
              
              return (
                <Animated.View
                  key={phase.id}
                  entering={FadeInDown.delay(index * 100).duration(600)}
                  style={{
                    marginBottom: 16,
                    borderRadius: 16,
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
                  <TouchableOpacity
                    onPress={() => handlePhaseAction(phase.id, phase)}
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
                              backgroundColor: getStatusColor(phase.status, isActive) + '20',
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginRight: 12,
                            }}
                          >
                            <MaterialIcon
                              name={getStatusIcon(phase.status)}
                              size={20}
                              color={getStatusColor(phase.status, isActive)}
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
                                color: getStatusColor(phase.status, isActive),
                                fontWeight: '600',
                                textTransform: 'uppercase',
                              }}
                            >
                              {phase.status.replace('_', ' ')}
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
                          name="more-vert"
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
                            color: getStatusColor(phase.status, isActive),
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
                        <View
                          style={{
                            width: `${phase.progress}%`,
                            height: '100%',
                            backgroundColor: getStatusColor(phase.status, isActive),
                            borderRadius: 3,
                          }}
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
                          {phase.estimatedDuration}h
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

                      <TouchableOpacity
                        style={{
                          backgroundColor: theme.colors.primary + '20',
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 8,
                          alignItems: 'center',
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 11,
                            fontWeight: '600',
                            color: theme.colors.primary,
                          }}
                        >
                          View Details
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
};