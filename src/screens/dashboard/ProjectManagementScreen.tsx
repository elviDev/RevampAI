import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import { SafeAreaWrapper } from '../../components/common/SafeAreaWrapper';
import { Button } from '../../components/common/Botton';
import { Colors } from '../../utils/colors';
import { ProjectService } from '../../services/api/projectService';
import { NotificationService } from '../../services/api/notificationService';
import type { Project, Task, Channel } from '../../types/project';

interface ProjectManagementScreenProps {
  navigation: any;
}

export const ProjectManagementScreen: React.FC<ProjectManagementScreenProps> = ({
  navigation,
}) => {
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [channel, setChannel] = useState<Channel | null>(null);

  const headerOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);

  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 800 });
    contentOpacity.value = withDelay(200, withTiming(1, { duration: 800 }));
  }, []);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const handleCreateEcommerceProject = async () => {
    try {
      setIsCreatingProject(true);

      // Create channel first
      const channelData = {
        title: 'E-commerce Website Project',
        description: 'Collaboration space for our e-commerce website development project. This channel includes all team members and will be used for project updates, discussions, and file sharing.',
        category: 'Active Projects',
        members: ['Lead Designer', 'Engineering Lead', 'PM', 'Myself'],
      };

      const newChannel = await ProjectService.createChannel(channelData);
      setChannel(newChannel);

      // Create project with tasks
      const projectData = {
        name: 'E-commerce Website Project',
        description: 'Complete e-commerce website development with modern UI/UX, secure payment integration, and scalable architecture.',
        category: 'Web Development',
        members: ['Lead Designer', 'Engineering Lead', 'PM', 'Myself'],
      };

      const newProject = await ProjectService.createProject(projectData);
      setProject(newProject);

      // Schedule initial kickoff meeting
      await ProjectService.scheduleMeeting({
        title: 'E-commerce Project Kickoff',
        attendees: ['Lead Designer', 'Engineering Lead', 'PM', 'Myself'],
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        duration: 60,
        description: 'Project kickoff meeting to discuss requirements, timeline, and responsibilities.',
      });

      Alert.alert(
        'Project Created Successfully!',
        `Channel "${newChannel.title}" has been created with all team members. Project breakdown and schedule have been generated. Notifications sent to all members.`,
        [{ text: 'OK' }]
      );

    } catch (error) {
      console.error('Error creating project:', error);
      Alert.alert('Error', 'Failed to create project. Please try again.');
    } finally {
      setIsCreatingProject(false);
    }
  };

  return (
    <SafeAreaWrapper backgroundColor={Colors.background}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View style={[{ paddingTop: 20 }, headerAnimatedStyle]}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 32,
            }}
          >
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: Colors.surface,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <Text style={{ fontSize: 18 }}>←</Text>
            </TouchableOpacity>
            
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: '700',
                  color: Colors.text.primary,
                }}
              >
                Project Management
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Content */}
        <Animated.View style={[{ flex: 1 }, contentAnimatedStyle]}>
          {!project ? (
            <EmptyProjectState
              onCreateProject={handleCreateEcommerceProject}
              isLoading={isCreatingProject}
            />
          ) : (
            <ProjectDetails
              project={project}
              channel={channel}
              onRefresh={() => {}}
            />
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaWrapper>
  );
};

// Empty state component
interface EmptyProjectStateProps {
  onCreateProject: () => void;
  isLoading: boolean;
}

const EmptyProjectState: React.FC<EmptyProjectStateProps> = ({
  onCreateProject,
  isLoading,
}) => {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
      }}
    >
      <View
        style={{
          width: 120,
          height: 120,
          borderRadius: 60,
          backgroundColor: Colors.purple[100],
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 32,
        }}
      >
        <Text style={{ fontSize: 48 }}>🚀</Text>
      </View>

      <Text
        style={{
          fontSize: 24,
          fontWeight: '700',
          color: Colors.text.primary,
          textAlign: 'center',
          marginBottom: 16,
        }}
      >
        Ready to Create Your Project?
      </Text>

      <Text
        style={{
          fontSize: 16,
          color: Colors.text.secondary,
          textAlign: 'center',
          lineHeight: 24,
          marginBottom: 40,
        }}
      >
        Let's create the E-commerce Website Project with all team members, project breakdown, and automated notifications.
      </Text>

      <Button
        title="Create E-commerce Project"
        onPress={onCreateProject}
        loading={isLoading}
        size="large"
        style={{ width: '100%' }}
      />
    </View>
  );
};

// Project details component
interface ProjectDetailsProps {
  project: Project;
  channel: Channel | null;
  onRefresh: () => void;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({
  project,
  channel,
  onRefresh,
}) => {
  return (
    <View style={{ flex: 1 }}>
      {/* Project Overview Card */}
      <View
        style={{
          backgroundColor: Colors.surface,
          borderRadius: 20,
          padding: 24,
          marginBottom: 24,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: Colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 16,
            }}
          >
            <Text style={{ fontSize: 20, color: Colors.text.inverse }}>🛍️</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 20,
                fontWeight: '700',
                color: Colors.text.primary,
                marginBottom: 4,
              }}
            >
              {project.name}
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: Colors.text.secondary,
                textTransform: 'capitalize',
              }}
            >
              {project.status} • {project.category}
            </Text>
          </View>
          <View
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 12,
              backgroundColor: Colors.purple[100],
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: '600',
                color: Colors.primary,
              }}
            >
              {project.members.length} Members
            </Text>
          </View>
        </View>

        <Text
          style={{
            fontSize: 14,
            color: Colors.text.secondary,
            lineHeight: 20,
            marginBottom: 20,
          }}
        >
          {project.description}
        </Text>

        {/* Progress Bar */}
        <View style={{ marginBottom: 16 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: 8,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: Colors.text.primary,
              }}
            >
              Progress
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: Colors.text.secondary,
              }}
            >
              15%
            </Text>
          </View>
          <View
            style={{
              height: 8,
              backgroundColor: Colors.gray[200],
              borderRadius: 4,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                width: '15%',
                height: '100%',
                backgroundColor: Colors.primary,
              }}
            />
          </View>
        </View>

        {/* Team Members */}
        <View>
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: Colors.text.primary,
              marginBottom: 12,
            }}
          >
            Team Members
          </Text>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 8,
            }}
          >
            {project.members.map((member) => (
              <View
                key={member.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: Colors.gray[100],
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 16,
                }}
              >
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: Colors.primary,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 8,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: '600',
                      color: Colors.text.inverse,
                    }}
                  >
                    {member.user.fullName.charAt(0)}
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 12,
                    color: Colors.text.secondary,
                    fontWeight: '500',
                  }}
                >
                  {member.user.fullName}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Channel Info */}
      {channel && (
        <View
          style={{
            backgroundColor: Colors.surface,
            borderRadius: 20,
            padding: 24,
            marginBottom: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: '700',
              color: Colors.text.primary,
              marginBottom: 12,
            }}
          >
            📢 Channel Created
          </Text>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '600',
              color: Colors.primary,
              marginBottom: 8,
            }}
          >
            {channel.title}
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: Colors.text.secondary,
              lineHeight: 20,
              marginBottom: 16,
            }}
          >
            {channel.description}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: Colors.purple[50],
              padding: 12,
              borderRadius: 12,
              borderLeftWidth: 4,
              borderLeftColor: Colors.primary,
            }}
          >
            <Text style={{ fontSize: 16, marginRight: 8 }}>✅</Text>
            <Text
              style={{
                fontSize: 14,
                color: Colors.text.secondary,
                flex: 1,
              }}
            >
              All team members have been notified and added to the channel
            </Text>
          </View>
        </View>
      )}

      {/* Tasks Overview */}
      <View
        style={{
          backgroundColor: Colors.surface,
          borderRadius: 20,
          padding: 24,
          marginBottom: 24,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: '700',
            color: Colors.text.primary,
            marginBottom: 16,
          }}
        >
          📋 Project Tasks ({project.tasks.length})
        </Text>
        
        {project.tasks.slice(0, 3).map((task) => (
          <TaskItem key={task.id} task={task} />
        ))}
        
        {project.tasks.length > 3 && (
          <TouchableOpacity
            style={{
              alignItems: 'center',
              paddingVertical: 12,
              marginTop: 8,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                color: Colors.primary,
                fontWeight: '600',
              }}
            >
              View All Tasks ({project.tasks.length - 3} more)
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Quick Actions */}
      <View
        style={{
          backgroundColor: Colors.surface,
          borderRadius: 20,
          padding: 24,
          marginBottom: 40,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: '700',
            color: Colors.text.primary,
            marginBottom: 16,
          }}
        >
          🚀 Quick Actions
        </Text>
        
        <View style={{ gap: 12 }}>
          <QuickActionButton
            title="Assign New Task"
            subtitle="Create and assign tasks to team members"
            icon="📝"
            onPress={() => console.log('Assign task')}
          />
          
          <QuickActionButton
            title="Schedule Meeting"
            subtitle="Set up project meetings with the team"
            icon="📅"
            onPress={() => console.log('Schedule meeting')}
          />
          
          <QuickActionButton
            title="Send Update"
            subtitle="Share project updates with all members"
            icon="📢"
            onPress={() => console.log('Send update')}
          />
        </View>
      </View>
    </View>
  );
};

// Task item component
interface TaskItemProps {
  task: Task;
}

const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return Colors.error;
      case 'high':
        return '#F59E0B';
      case 'medium':
        return Colors.primary;
      case 'low':
        return Colors.success;
      default:
        return Colors.gray[400];
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return Colors.success;
      case 'in-progress':
        return Colors.primary;
      case 'review':
        return '#F59E0B';
      case 'todo':
        return Colors.gray[400];
      default:
        return Colors.gray[400];
    }
  };

  return (
    <View
      style={{
        backgroundColor: Colors.gray[50],
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: getPriorityColor(task.priority),
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 8,
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: '600',
            color: Colors.text.primary,
            flex: 1,
            marginRight: 12,
          }}
        >
          {task.title}
        </Text>
        <View
          style={{
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 8,
            backgroundColor: getStatusColor(task.status),
          }}
        >
          <Text
            style={{
              fontSize: 10,
              fontWeight: '600',
              color: Colors.text.inverse,
              textTransform: 'uppercase',
            }}
          >
            {task.status}
          </Text>
        </View>
      </View>
      
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              backgroundColor: Colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 8,
            }}
          >
            <Text
              style={{
                fontSize: 10,
                fontWeight: '600',
                color: Colors.text.inverse,
              }}
            >
              {task.assignee.fullName.charAt(0)}
            </Text>
          </View>
          <Text
            style={{
              fontSize: 12,
              color: Colors.text.secondary,
            }}
          >
            {task.assignee.fullName}
          </Text>
        </View>
        
        <Text
          style={{
            fontSize: 12,
            color: Colors.text.tertiary,
          }}
        >
          Due {task.dueDate.toLocaleDateString()}
        </Text>
      </View>
    </View>
  );
};

// Quick action button component
interface QuickActionButtonProps {
  title: string;
  subtitle: string;
  icon: string;
  onPress: () => void;
}

const QuickActionButton: React.FC<QuickActionButtonProps> = ({
  title,
  subtitle,
  icon,
  onPress,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.gray[50],
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: Colors.gray[200],
      }}
      activeOpacity={0.7}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: Colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 16,
        }}
      >
        <Text style={{ fontSize: 18 }}>{icon}</Text>
      </View>
      
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: '600',
            color: Colors.text.primary,
            marginBottom: 2,
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            fontSize: 12,
            color: Colors.text.secondary,
          }}
        >
          {subtitle}
        </Text>
      </View>
      
      <Text
        style={{
          fontSize: 18,
          color: Colors.text.tertiary,
        }}
      >
        →
      </Text>
    </TouchableOpacity>
  );
};
