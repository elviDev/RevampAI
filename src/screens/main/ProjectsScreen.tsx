import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../contexts/ThemeContext';
import { useQuickActions } from '../../contexts/QuickActionsContext';


interface Project {
  id: string;
  name: string;
  description: string;
  progress: number;
  status: 'active' | 'completed' | 'on-hold';
  priority: 'high' | 'medium' | 'low';
  team: string[];
  deadline: string;
  tasksCount: number;
  completedTasks: number;
}

const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'Mobile App Redesign',
    description: 'Complete UI/UX overhaul for the mobile application',
    progress: 75,
    status: 'active',
    priority: 'high',
    team: ['John', 'Sarah', 'Mike'],
    deadline: '2024-08-25',
    tasksCount: 24,
    completedTasks: 18,
  },
  {
    id: '2',
    name: 'API Integration',
    description: 'Integrate with third-party APIs for enhanced functionality',
    progress: 45,
    status: 'active',
    priority: 'medium',
    team: ['David', 'Lisa'],
    deadline: '2024-08-30',
    tasksCount: 16,
    completedTasks: 7,
  },
  {
    id: '3',
    name: 'Performance Optimization',
    description: 'Optimize app performance and reduce load times',
    progress: 90,
    status: 'active',
    priority: 'high',
    team: ['Alex', 'Emma'],
    deadline: '2024-08-20',
    tasksCount: 12,
    completedTasks: 11,
  },
  {
    id: '4',
    name: 'Documentation Update',
    description: 'Update project documentation and user guides',
    progress: 100,
    status: 'completed',
    priority: 'low',
    team: ['Tom'],
    deadline: '2024-08-15',
    tasksCount: 8,
    completedTasks: 8,
  },
];

const ProjectCard: React.FC<{ project: Project; index: number; onPress: (project: Project) => void }> = ({ project, index, onPress }) => {
  const { theme } = useTheme();

  const getStatusColor = () => {
    switch (project.status) {
      case 'active': return theme.colors.primary;
      case 'completed': return theme.colors.success;
      case 'on-hold': return theme.colors.warning;
      default: return theme.colors.text.secondary;
    }
  };

  const getPriorityColor = () => {
    switch (project.priority) {
      case 'high': return theme.colors.error;
      case 'medium': return theme.colors.warning;
      case 'low': return theme.colors.success;
      default: return theme.colors.text.secondary;
    }
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100)}
    >
      <TouchableOpacity
        onPress={() => onPress(project)}
        activeOpacity={0.8}
        style={{
          backgroundColor: theme.colors.surface,
          borderRadius: 16,
          padding: 20,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: theme.colors.border,
          shadowColor: theme.colors.shadows.neutral,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
      }}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text style={{
            fontSize: 18,
            fontWeight: '700',
            color: theme.colors.text.primary,
            marginBottom: 4,
          }}>
            {project.name}
          </Text>
          <Text style={{
            fontSize: 14,
            color: theme.colors.text.secondary,
            lineHeight: 20,
          }}>
            {project.description}
          </Text>
        </View>
        
        <View style={{
          backgroundColor: getPriorityColor() + '20',
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 8,
        }}>
          <Text style={{
            fontSize: 12,
            fontWeight: '600',
            color: getPriorityColor(),
            textTransform: 'uppercase',
          }}>
            {project.priority}
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={{ marginBottom: 16 }}>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
        }}>
          <Text style={{
            fontSize: 14,
            fontWeight: '600',
            color: theme.colors.text.primary,
          }}>
            Progress
          </Text>
          <Text style={{
            fontSize: 14,
            fontWeight: '600',
            color: getStatusColor(),
          }}>
            {project.progress}%
          </Text>
        </View>
        
        <View style={{
          backgroundColor: theme.colors.border,
          height: 6,
          borderRadius: 3,
          overflow: 'hidden',
        }}>
          <Animated.View
            entering={FadeInUp.delay(index * 150)}
            style={{
              backgroundColor: getStatusColor(),
              height: '100%',
              width: `${project.progress}%`,
              borderRadius: 3,
            }}
          />
        </View>
      </View>

      {/* Project Stats */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
        }}>
          <Icon name="check-circle" size={16} color={theme.colors.success} />
          <Text style={{
            marginLeft: 6,
            fontSize: 14,
            color: theme.colors.text.secondary,
          }}>
            {project.completedTasks}/{project.tasksCount} tasks
          </Text>
        </View>

        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
        }}>
          <Icon name="users" size={16} color={theme.colors.primary} />
          <Text style={{
            marginLeft: 6,
            fontSize: 14,
            color: theme.colors.text.secondary,
          }}>
            {project.team.length} members
          </Text>
        </View>

        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
        }}>
          <Icon name="calendar" size={16} color={theme.colors.warning} />
          <Text style={{
            marginLeft: 6,
            fontSize: 14,
            color: theme.colors.text.secondary,
          }}>
            {new Date(project.deadline).toLocaleDateString()}
          </Text>
        </View>
      </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export const ProjectsScreen: React.FC = () => {
  const { theme } = useTheme();
  const { showNotification, openProjectDetail } = useQuickActions();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const filteredProjects = MOCK_PROJECTS.filter(project => {
    if (filter === 'all') return true;
    return project.status === filter;
  });

  const stats = {
    total: MOCK_PROJECTS.length,
    active: MOCK_PROJECTS.filter(p => p.status === 'active').length,
    completed: MOCK_PROJECTS.filter(p => p.status === 'completed').length,
    onHold: MOCK_PROJECTS.filter(p => p.status === 'on-hold').length,
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
            Projects
          </Text>
          
          <TouchableOpacity
            onPress={() => showNotification('Project creation feature coming soon!', 'info')}
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
            <Icon name="plus" size={24} color={theme.colors.text.onPrimary} />
          </TouchableOpacity>
        </View>
        
        <Text style={{
          fontSize: 16,
          color: theme.colors.text.secondary,
          marginBottom: 20,
        }}>
          Manage your projects and track progress
        </Text>

        {/* Stats Cards */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 20 }}
          contentContainerStyle={{ paddingRight: 24 }}
        >
          {[
            { label: 'Total', value: stats.total, color: theme.colors.primary },
            { label: 'Active', value: stats.active, color: theme.colors.success },
            { label: 'Completed', value: stats.completed, color: theme.colors.accent },
            { label: 'On Hold', value: stats.onHold, color: theme.colors.warning },
          ].map((stat, index) => (
            <Animated.View
              key={stat.label}
              entering={FadeInUp.delay(100 + index * 50)}
              style={{
                backgroundColor: theme.colors.surface,
                borderRadius: 12,
                padding: 16,
                marginRight: 12,
                minWidth: 100,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: theme.colors.border,
                shadowColor: theme.colors.shadows.neutral,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <Text style={{
                fontSize: 24,
                fontWeight: '800',
                color: stat.color,
                marginBottom: 4,
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
        </ScrollView>

        {/* Filter Buttons */}
        <View style={{
          flexDirection: 'row',
          backgroundColor: theme.colors.surface,
          borderRadius: 12,
          padding: 4,
          borderWidth: 1,
          borderColor: theme.colors.border,
        }}>
          {(['all', 'active', 'completed'] as const).map((filterOption) => (
            <TouchableOpacity
              key={filterOption}
              onPress={() => setFilter(filterOption)}
              style={{
                flex: 1,
                paddingVertical: 8,
                paddingHorizontal: 16,
                borderRadius: 8,
                backgroundColor: filter === filterOption ? theme.colors.primary : 'transparent',
                alignItems: 'center',
              }}
            >
              <Text style={{
                fontSize: 14,
                fontWeight: '600',
                color: filter === filterOption ? theme.colors.text.onPrimary : theme.colors.text.secondary,
                textTransform: 'capitalize',
              }}>
                {filterOption}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>

      {/* Projects List */}
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: 100,
        }}
      >
        {filteredProjects.map((project, index) => (
          <ProjectCard 
            key={project.id} 
            project={project} 
            index={index} 
            onPress={(project) => openProjectDetail(project.id)}
          />
        ))}

        {filteredProjects.length === 0 && (
          <Animated.View
            entering={FadeInUp.delay(200)}
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 60,
            }}
          >
            <MaterialIcon name="folder-open" size={64} color={theme.colors.text.secondary} />
            <Text style={{
              fontSize: 18,
              fontWeight: '600',
              color: theme.colors.text.primary,
              marginTop: 16,
              marginBottom: 8,
            }}>
              No projects found
            </Text>
            <Text style={{
              fontSize: 16,
              color: theme.colors.text.secondary,
              textAlign: 'center',
              maxWidth: 280,
            }}>
              Create your first project to start organizing your work
            </Text>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
};