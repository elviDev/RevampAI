import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

interface ActivityItem {
  id: string;
  type: 'reaction' | 'reply' | 'task';
  user: {
    name: string;
    avatar: string;
    color: string;
  };
  content: string;
  timestamp: string;
  emoji?: string;
  taskStatus?: 'pending' | 'completed' | 'overdue';
  priority?: 'high' | 'medium' | 'low';
}

interface ActivityCardProps {
  item: ActivityItem;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ item }) => {
  const getIcon = () => {
    switch (item.type) {
      case 'reaction':
        return <Text className="text-xl">{item.emoji}</Text>;
      case 'reply':
        return <Feather name="message-circle" size={20} color="#007AFF" />;
      case 'task':
        return <Feather name="check-square" size={20} color="#FF9500" />;
    }
  };

  const getTypeText = () => {
    switch (item.type) {
      case 'reaction':
        return 'reacted to your comment';
      case 'reply':
        return 'replied to your comment';
      case 'task':
        return 'assigned you a task';
    }
  };

  const getTaskStatusColor = () => {
    switch (item.taskStatus) {
      case 'completed':
        return '#34C759';
      case 'overdue':
        return '#FF3B30';
      default:
        return '#FF9500';
    }
  };

  const getPriorityColor = () => {
    switch (item.priority) {
      case 'high':
        return '#FF3B30';
      case 'medium':
        return '#FF9500';
      case 'low':
        return '#34C759';
      default:
        return '#9CA3AF';
    }
  };

  return (
    <TouchableOpacity
      className="mx-4 p-4"
      style={{
        backgroundColor: '#ffffff',
        borderRadius: 16,
        marginBottom: 10,
      }}
    >
      <View className="flex-row items-start">
        {/* Avatar */}
        <View
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: item.user.color, marginRight: 16 }}
        >
          <Text className="text-white font-semibold">
            {item.user.avatar}
          </Text>
        </View>

        {/* Content */}
        <View className="flex-1">
          <View className="flex-row items-center mb-2">
            <Text className="text-gray-900 font-semibold" style={{ marginRight: 8 }}>
              {item.user.name}
            </Text>
            <Text className="text-gray-500 text-sm" style={{ marginRight: 8 }}>
              {getTypeText()}
            </Text>
            <View>
              {getIcon()}
            </View>
          </View>
          
          <Text className="text-gray-700 text-sm mb-2">{item.content}</Text>
          
          {/* Task specific info */}
          {item.type === 'task' && (
            <View className="flex-row items-center">
              <View className="flex-row items-center" style={{ marginRight: 16 }}>
                <View 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: getTaskStatusColor(), marginRight: 6 }}
                />
                <Text 
                  className="text-xs font-medium capitalize"
                  style={{ color: getTaskStatusColor() }}
                >
                  {item.taskStatus}
                </Text>
              </View>
              {item.priority && (
                <View className="flex-row items-center">
                  <Feather name="flag" size={12} color={getPriorityColor()} style={{ marginRight: 6 }} />
                  <Text 
                    className="text-xs font-medium capitalize"
                    style={{ color: getPriorityColor() }}
                  >
                    {item.priority}
                  </Text>
                </View>
              )}
            </View>
          )}
          
          <Text className="text-gray-400 text-xs mt-2">{item.timestamp}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export const ActivityScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'all' | 'reactions' | 'replies' | 'tasks'>('all');

  const activities: ActivityItem[] = [
    {
      id: '1',
      type: 'reaction',
      user: { name: 'Sarah', avatar: 'S', color: '#007AFF' },
      content: 'Great idea for the new feature!',
      timestamp: '2 minutes ago',
      emoji: '👍',
    },
    {
      id: '2',
      type: 'reply',
      user: { name: 'Mike', avatar: 'M', color: '#34C759' },
      content: 'I think we should consider the mobile responsiveness as well...',
      timestamp: '5 minutes ago',
    },
    {
      id: '3',
      type: 'task',
      user: { name: 'John', avatar: 'J', color: '#FF9500' },
      content: 'Review the dashboard design and provide feedback',
      timestamp: '1 hour ago',
      taskStatus: 'pending',
      priority: 'high',
    },
    {
      id: '4',
      type: 'reaction',
      user: { name: 'Lisa', avatar: 'L', color: '#FF2D92' },
      content: 'The color scheme looks perfect!',
      timestamp: '2 hours ago',
      emoji: '❤️',
    },
    {
      id: '5',
      type: 'task',
      user: { name: 'Mark', avatar: 'M', color: '#AF52DE' },
      content: 'Update the user documentation for the new API endpoints',
      timestamp: '3 hours ago',
      taskStatus: 'completed',
      priority: 'medium',
    },
    {
      id: '6',
      type: 'reply',
      user: { name: 'Emma', avatar: 'E', color: '#32D74B' },
      content: 'Could you explain the implementation details?',
      timestamp: '4 hours ago',
    },
    {
      id: '7',
      type: 'task',
      user: { name: 'Alex', avatar: 'A', color: '#5856D6' },
      content: 'Fix the login authentication bug',
      timestamp: '1 day ago',
      taskStatus: 'overdue',
      priority: 'high',
    },
  ];

  const filteredActivities = activities.filter(activity => {
    if (activeTab === 'all') return true;
    if (activeTab === 'reactions') return activity.type === 'reaction';
    if (activeTab === 'replies') return activity.type === 'reply';
    if (activeTab === 'tasks') return activity.type === 'task';
    return true;
  });

  const TabButton: React.FC<{ tab: typeof activeTab; title: string; count: number }> = ({ 
    tab, 
    title, 
    count 
  }) => (
    <TouchableOpacity
      onPress={() => setActiveTab(tab)}
      style={{
        backgroundColor: activeTab === tab ? '#8B5CF6' : '#f0f0f0',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginRight: 8,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text
          style={{
            color: activeTab === tab ? '#ffffff' : '#9CA3AF',
            fontWeight: '500',
            fontSize: 14,
            marginRight: 4,
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            color: activeTab === tab ? '#ffffff' : '#9CA3AF',
            fontWeight: 'bold',
            fontSize: 12,
          }}
        >
          {count}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View 
      className="flex-1" 
      style={{ 
        backgroundColor: '#F5F5F5',
        paddingTop: insets.top 
      }}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 mb-4">
        <Text className="text-purple-600 text-2xl font-bold">Activity</Text>
        <TouchableOpacity className="p-2">
          <Feather name="bell" size={24} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        className="px-4 mb-4"
        contentContainerStyle={{ paddingRight: 16 }}
      >
        <TabButton 
          tab="all" 
          title="All" 
          count={activities.length} 
        />
        <TabButton 
          tab="reactions" 
          title="Reactions" 
          count={activities.filter(a => a.type === 'reaction').length} 
        />
        <TabButton 
          tab="replies" 
          title="Replies" 
          count={activities.filter(a => a.type === 'reply').length} 
        />
        <TabButton 
          tab="tasks" 
          title="Tasks" 
          count={activities.filter(a => a.type === 'task').length} 
        />
      </ScrollView>

      {/* Activity List */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {filteredActivities.map(activity => (
          <ActivityCard key={activity.id} item={activity} />
        ))}
      </ScrollView>
    </View>
  );
};