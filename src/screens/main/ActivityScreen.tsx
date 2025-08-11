import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp, FadeInLeft } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../contexts/ThemeContext';
import { useQuickActions } from '../../contexts/QuickActionsContext';
import { NavigationService } from '../../services/NavigationService';

interface Activity {
  id: string;
  type: 'task_completed' | 'project_updated' | 'comment_added' | 'file_uploaded' | 'meeting_scheduled';
  title: string;
  description: string;
  timestamp: string;
  user: {
    name: string;
    avatar: string;
  };
  metadata?: {
    project?: string;
    priority?: 'high' | 'medium' | 'low';
  };
}

const MOCK_ACTIVITIES: Activity[] = [
  {
    id: '1',
    type: 'task_completed',
    title: 'Task Completed',
    description: 'Mobile App Redesign - UI Components',
    timestamp: '2 hours ago',
    user: { name: 'Sarah Johnson', avatar: 'SJ' },
    metadata: { project: 'Mobile App', priority: 'high' },
  },
  {
    id: '2',
    type: 'project_updated',
    title: 'Project Updated',
    description: 'API Integration project moved to testing phase',
    timestamp: '4 hours ago',
    user: { name: 'Mike Chen', avatar: 'MC' },
    metadata: { project: 'API Integration', priority: 'medium' },
  },
  {
    id: '3',
    type: 'comment_added',
    title: 'New Comment',
    description: 'Added feedback on the dashboard design mockups',
    timestamp: '6 hours ago',
    user: { name: 'Emma Davis', avatar: 'ED' },
    metadata: { project: 'Dashboard', priority: 'low' },
  },
  {
    id: '4',
    type: 'file_uploaded',
    title: 'File Uploaded',
    description: 'Uploaded wireframes.pdf to Design Assets',
    timestamp: '8 hours ago',
    user: { name: 'Alex Rivera', avatar: 'AR' },
    metadata: { project: 'Design System' },
  },
  {
    id: '5',
    type: 'meeting_scheduled',
    title: 'Meeting Scheduled',
    description: 'Sprint Review meeting scheduled for tomorrow 2 PM',
    timestamp: '1 day ago',
    user: { name: 'David Kim', avatar: 'DK' },
    metadata: { project: 'Sprint Planning' },
  },
  {
    id: '6',
    type: 'task_completed',
    title: 'Task Completed',
    description: 'Performance optimization for mobile app',
    timestamp: '1 day ago',
    user: { name: 'Lisa Wong', avatar: 'LW' },
    metadata: { project: 'Performance', priority: 'high' },
  },
];

const ActivityItem: React.FC<{ activity: Activity; index: number; onPress: (activity: Activity) => void }> = ({ activity, index, onPress }) => {
  const { theme } = useTheme();

  const getActivityIcon = () => {
    const iconProps = { size: 20, color: theme.colors.primary };
    switch (activity.type) {
      case 'task_completed':
        return <Icon name="check-circle" {...iconProps} />;
      case 'project_updated':
        return <Icon name="folder" {...iconProps} />;
      case 'comment_added':
        return <Icon name="message-circle" {...iconProps} />;
      case 'file_uploaded':
        return <Icon name="upload" {...iconProps} />;
      case 'meeting_scheduled':
        return <Icon name="calendar" {...iconProps} />;
      default:
        return <Icon name="activity" {...iconProps} />;
    }
  };

  const getActivityColor = () => {
    switch (activity.type) {
      case 'task_completed': return theme.colors.success;
      case 'project_updated': return theme.colors.primary;
      case 'comment_added': return theme.colors.accent;
      case 'file_uploaded': return theme.colors.warning;
      case 'meeting_scheduled': return theme.colors.info || theme.colors.primary;
      default: return theme.colors.text.secondary;
    }
  };

  const getPriorityColor = () => {
    if (!activity.metadata?.priority) return theme.colors.text.secondary;
    switch (activity.metadata.priority) {
      case 'high': return theme.colors.error;
      case 'medium': return theme.colors.warning;
      case 'low': return theme.colors.success;
      default: return theme.colors.text.secondary;
    }
  };

  return (
    <Animated.View
      entering={FadeInLeft.delay(index * 100)}
    >
      <TouchableOpacity
        onPress={() => onPress(activity)}
        activeOpacity={0.8}
        style={{
          backgroundColor: theme.colors.surface,
          borderRadius: 12,
          padding: 16,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: theme.colors.border,
          shadowColor: theme.colors.shadows.neutral,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
          flexDirection: 'row',
          alignItems: 'flex-start',
        }}
      >
      {/* Activity Icon */}
      <View style={{
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: getActivityColor() + '20',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
      }}>
        {getActivityIcon()}
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 4,
        }}>
          <Text style={{
            fontSize: 16,
            fontWeight: '700',
            color: theme.colors.text.primary,
            flex: 1,
          }}>
            {activity.title}
          </Text>
          
          {activity.metadata?.priority && (
            <View style={{
              backgroundColor: getPriorityColor() + '20',
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 6,
              marginLeft: 8,
            }}>
              <Text style={{
                fontSize: 10,
                fontWeight: '600',
                color: getPriorityColor(),
                textTransform: 'uppercase',
              }}>
                {activity.metadata.priority}
              </Text>
            </View>
          )}
        </View>

        <Text style={{
          fontSize: 14,
          color: theme.colors.text.secondary,
          lineHeight: 20,
          marginBottom: 8,
        }}>
          {activity.description}
        </Text>

        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}>
            <View style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: theme.colors.primary + '20',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 8,
            }}>
              <Text style={{
                fontSize: 10,
                fontWeight: '700',
                color: theme.colors.primary,
              }}>
                {activity.user.avatar}
              </Text>
            </View>
            <Text style={{
              fontSize: 12,
              color: theme.colors.text.secondary,
              fontWeight: '500',
            }}>
              {activity.user.name}
            </Text>
          </View>

          <Text style={{
            fontSize: 12,
            color: theme.colors.text.secondary,
          }}>
            {activity.timestamp}
          </Text>
        </View>

        {activity.metadata?.project && (
          <View style={{
            marginTop: 8,
            paddingTop: 8,
            borderTopWidth: 1,
            borderTopColor: theme.colors.border,
          }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}>
              <Icon name="folder" size={12} color={theme.colors.text.secondary} />
              <Text style={{
                marginLeft: 6,
                fontSize: 12,
                color: theme.colors.text.secondary,
                fontWeight: '500',
              }}>
                {activity.metadata.project}
              </Text>
            </View>
          </View>
        )}
      </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export const ActivityScreen: React.FC = () => {
  const { theme } = useTheme();
  const { showNotification, openTaskDetail } = useQuickActions();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<'all' | 'tasks' | 'projects' | 'files'>('all');

  const filteredActivities = MOCK_ACTIVITIES.filter(activity => {
    if (filter === 'all') return true;
    if (filter === 'tasks') return activity.type === 'task_completed';
    if (filter === 'projects') return activity.type === 'project_updated';
    if (filter === 'files') return activity.type === 'file_uploaded';
    return true;
  });

  const stats = {
    total: MOCK_ACTIVITIES.length,
    today: MOCK_ACTIVITIES.filter(a => a.timestamp.includes('hour')).length,
    thisWeek: MOCK_ACTIVITIES.length,
  };

  const handleActivityPress = (activity: Activity) => {
    switch (activity.type) {
      case 'task_completed':
        NavigationService.navigateToTasks();
        showNotification(`Viewing task details`, 'info');
        break;
      case 'project_updated':
        NavigationService.navigateToProjects();
        showNotification(`Viewing project: ${activity.metadata?.project}`, 'info');
        break;
      case 'file_uploaded':
        showNotification(`File: ${activity.description}`, 'info');
        break;
      case 'meeting_scheduled':
        showNotification(`Meeting: ${activity.description}`, 'info');
        break;
      default:
        showNotification(activity.description, 'info');
    }
  };

  return (
    <View style={{
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingTop: insets.top,
    }}>
      {/* Header */}
      <Animated.View
        entering={FadeInDown.delay(50)}
        style={{
          paddingHorizontal: 24,
          paddingVertical: 20,
        }}
      >
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
        }}>
          <Text style={{
            fontSize: 28,
            fontWeight: '800',
            color: theme.colors.text.primary,
          }}>
            Activity
          </Text>
          
          <TouchableOpacity
            style={{
              backgroundColor: theme.colors.primary,
              width: 44,
              height: 44,
              borderRadius: 22,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: theme.colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 6,
            }}
          >
            <Icon name="filter" size={20} color={theme.colors.text.onPrimary} />
          </TouchableOpacity>
        </View>
        
        <Text style={{
          fontSize: 16,
          color: theme.colors.text.secondary,
          marginBottom: 20,
        }}>
          Stay updated with your team's progress
        </Text>

        {/* Quick Stats */}
        <View style={{
          flexDirection: 'row',
          backgroundColor: theme.colors.surface,
          borderRadius: 12,
          padding: 16,
          marginBottom: 20,
          borderWidth: 1,
          borderColor: theme.colors.border,
          shadowColor: theme.colors.shadows.neutral,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
        }}>
          {[
            { label: 'Today', value: stats.today, icon: 'clock' },
            { label: 'This Week', value: stats.thisWeek, icon: 'calendar' },
            { label: 'Total', value: stats.total, icon: 'activity' },
          ].map((stat, index) => (
            <Animated.View
              key={stat.label}
              entering={FadeInUp.delay(150 + index * 50)}
              style={{
                flex: 1,
                alignItems: 'center',
              }}
            >
              <View style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: theme.colors.primary + '20',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 6,
              }}>
                <Icon name={stat.icon} size={16} color={theme.colors.primary} />
              </View>
              <Text style={{
                fontSize: 18,
                fontWeight: '800',
                color: theme.colors.text.primary,
                marginBottom: 2,
              }}>
                {stat.value}
              </Text>
              <Text style={{
                fontSize: 12,
                fontWeight: '600',
                color: theme.colors.text.secondary,
                textAlign: 'center',
              }}>
                {stat.label}
              </Text>
            </Animated.View>
          ))}
        </View>

        {/* Filter Buttons */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 24 }}
        >
          {[
            { key: 'all', label: 'All', icon: 'list' },
            { key: 'tasks', label: 'Tasks', icon: 'check-circle' },
            { key: 'projects', label: 'Projects', icon: 'folder' },
            { key: 'files', label: 'Files', icon: 'file' },
          ].map((filterOption, index) => (
            <Animated.View
              key={filterOption.key}
              entering={FadeInUp.delay(250 + index * 50)}
            >
              <TouchableOpacity
                onPress={() => setFilter(filterOption.key as any)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 12,
                  backgroundColor: filter === filterOption.key 
                    ? theme.colors.primary 
                    : theme.colors.surface,
                  marginRight: 12,
                  borderWidth: 1,
                  borderColor: filter === filterOption.key 
                    ? theme.colors.primary 
                    : theme.colors.border,
                  shadowColor: filter === filterOption.key 
                    ? theme.colors.primary 
                    : theme.colors.shadows.neutral,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: filter === filterOption.key ? 0.2 : 0.05,
                  shadowRadius: 4,
                  elevation: filter === filterOption.key ? 4 : 2,
                }}
              >
                <Icon 
                  name={filterOption.icon} 
                  size={16} 
                  color={filter === filterOption.key 
                    ? theme.colors.text.onPrimary 
                    : theme.colors.text.secondary
                  } 
                />
                <Text style={{
                  marginLeft: 8,
                  fontSize: 14,
                  fontWeight: '600',
                  color: filter === filterOption.key 
                    ? theme.colors.text.onPrimary 
                    : theme.colors.text.secondary,
                }}>
                  {filterOption.label}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </ScrollView>
      </Animated.View>

      {/* Activities List */}
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: 100,
        }}
      >
        {filteredActivities.map((activity, index) => (
          <ActivityItem 
            key={activity.id} 
            activity={activity} 
            index={index} 
            onPress={handleActivityPress}
          />
        ))}

        {filteredActivities.length === 0 && (
          <Animated.View
            entering={FadeInUp.delay(400)}
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 60,
            }}
          >
            <MaterialIcon name="inbox" size={64} color={theme.colors.text.secondary} />
            <Text style={{
              fontSize: 18,
              fontWeight: '600',
              color: theme.colors.text.primary,
              marginTop: 16,
              marginBottom: 8,
            }}>
              No activities found
            </Text>
            <Text style={{
              fontSize: 16,
              color: theme.colors.text.secondary,
              textAlign: 'center',
              maxWidth: 280,
            }}>
              Activities will appear here as your team works on projects
            </Text>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
};