import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { SEED_ACTIVITIES } from '../../data/seedData';
import { ActivityItem } from '../../data/seedData';
import { loadAllSeedData } from '../../utils/seedDataLoader';
import Icon from 'react-native-vector-icons/Feather';

export const ActivityScreenSimple: React.FC = () => {
  const insets = useSafeAreaInsets();
  const tasks = useSelector((state: RootState) => state.tasks.tasks);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'tasks' | 'announcements' | 'system'>('all');
  const [unreadCount, setUnreadCount] = useState(0);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    loadData();
    
    // Animate in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load seed data into Redux store
      loadAllSeedData();
      
      // Use seed activities directly
      const allActivities = [...SEED_ACTIVITIES].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      
      setActivities(allActivities);
      setUnreadCount(allActivities.filter(item => !item.read).length);
    } catch (error) {
      console.error('Failed to load activity data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleMarkAsRead = (activityId: string) => {
    setActivities(prev => 
      prev.map(activity => 
        activity.id === activityId ? { ...activity, read: true } : activity
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true;
    if (filter === 'tasks') return ['task_created', 'task_updated', 'task_completed', 'task_assigned'].includes(activity.type);
    if (filter === 'announcements') return activity.type === 'announcement';
    if (filter === 'system') return activity.type === 'system';
    return true;
  });

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'task_created': return 'plus-circle';
      case 'task_updated': return 'edit';
      case 'task_completed': return 'check-circle';
      case 'task_assigned': return 'user-plus';
      case 'announcement': return 'megaphone';
      case 'system': return 'settings';
      default: return 'bell';
    }
  };

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'task_created': return '#3B82F6';
      case 'task_updated': return '#F59E0B';
      case 'task_completed': return '#10B981';
      case 'task_assigned': return '#8B5CF6';
      case 'announcement': return '#EF4444';
      case 'system': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getPriorityColor = (priority: ActivityItem['priority']) => {
    switch (priority) {
      case 'low': return '#10B981';
      case 'medium': return '#F59E0B';
      case 'high': return '#F97316';
      case 'critical': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-4">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-gray-900 text-2xl font-bold">Activity Feed</Text>
          <View className="flex-row items-center">
            <View className="bg-red-100 px-2 py-1 rounded-full mr-2">
              <Text className="text-red-700 text-sm font-medium">{unreadCount}</Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                // Mark all as read
                setActivities(prev => prev.map(activity => ({ ...activity, read: true })));
                setUnreadCount(0);
              }}
              className="bg-blue-100 px-3 py-2 rounded-lg"
            >
              <Text className="text-blue-700 text-sm font-medium">Mark All Read</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Filter Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row">
            {[
              { key: 'all', label: 'All', count: activities.length },
              { key: 'tasks', label: 'Tasks', count: activities.filter(a => ['task_created', 'task_updated', 'task_completed', 'task_assigned'].includes(a.type)).length },
              { key: 'announcements', label: 'Announcements', count: activities.filter(a => a.type === 'announcement').length },
              { key: 'system', label: 'System', count: activities.filter(a => a.type === 'system').length },
            ].map(tab => (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setFilter(tab.key as any)}
                className={`mr-4 pb-2 border-b-2 ${
                  filter === tab.key ? 'border-blue-500' : 'border-transparent'
                }`}
              >
                <View className="flex-row items-center">
                  <Text className={`font-medium ${
                    filter === tab.key ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {tab.label}
                  </Text>
                  {tab.count > 0 && (
                    <View className={`ml-2 px-2 py-1 rounded-full ${
                      filter === tab.key ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      <Text className={`text-xs font-medium ${
                        filter === tab.key ? 'text-blue-700' : 'text-gray-600'
                      }`}>
                        {tab.count}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Debug Info */}
        <View className="mt-2 p-2 bg-green-50 rounded-lg">
          <Text className="text-green-700 text-xs">
            ✅ Loaded {activities.length} activities • {tasks.length} tasks in store
          </Text>
        </View>
      </View>

      {/* Activity List */}
      <Animated.View className="flex-1" style={{ opacity: fadeAnim }}>
        <ScrollView
          className="flex-1"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View className="flex-1 justify-center items-center py-12">
              <LoadingSpinner size="large" />
              <Text className="text-gray-500 mt-4">Loading activities...</Text>
            </View>
          ) : filteredActivities.length === 0 ? (
            <View className="flex-1 items-center justify-center py-12">
              <Text className="text-6xl mb-4">📝</Text>
              <Text className="text-gray-500 text-lg font-medium mb-2">No activities found</Text>
              <Text className="text-gray-400 text-center">
                Try changing the filter or pull to refresh
              </Text>
            </View>
          ) : (
            <View className="px-4 pb-6">
              {filteredActivities.map(activity => (
                <TouchableOpacity
                  key={activity.id}
                  className={`mb-4 bg-white rounded-xl p-4 shadow-sm ${
                    !activity.read ? 'border-l-4 border-blue-500' : ''
                  }`}
                  onPress={() => handleMarkAsRead(activity.id)}
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-start">
                    {/* Activity Icon */}
                    <View 
                      className="w-10 h-10 rounded-full items-center justify-center mr-3"
                      style={{ backgroundColor: `${getActivityColor(activity.type)}20` }}
                    >
                      <Icon 
                        name={getActivityIcon(activity.type)} 
                        size={20} 
                        color={getActivityColor(activity.type)} 
                      />
                    </View>

                    {/* Content */}
                    <View className="flex-1">
                      <View className="flex-row items-center justify-between mb-1">
                        <Text className="text-gray-900 font-semibold flex-1" numberOfLines={1}>
                          {activity.title}
                        </Text>
                        <View className="flex-row items-center ml-2">
                          {!activity.read && (
                            <View className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                          )}
                          <Text className="text-gray-500 text-xs">
                            {formatTimeAgo(activity.timestamp)}
                          </Text>
                        </View>
                      </View>

                      <Text className="text-gray-600 text-sm mb-2" numberOfLines={2}>
                        {activity.description}
                      </Text>

                      {/* Footer with user info and priority */}
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                          {activity.userName && (
                            <View className="flex-row items-center mr-3">
                              <View className="w-6 h-6 bg-gray-300 rounded-full items-center justify-center mr-2">
                                <Text className="text-gray-600 text-xs font-medium">
                                  {activity.userName.charAt(0).toUpperCase()}
                                </Text>
                              </View>
                              <Text className="text-gray-500 text-xs">{activity.userName}</Text>
                            </View>
                          )}
                        </View>

                        <View className="flex-row items-center">
                          <View 
                            className="px-2 py-1 rounded-full"
                            style={{ backgroundColor: `${getPriorityColor(activity.priority)}20` }}
                          >
                            <Text 
                              className="text-xs font-medium capitalize"
                              style={{ color: getPriorityColor(activity.priority) }}
                            >
                              {activity.priority}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      </Animated.View>
    </View>
  );
};