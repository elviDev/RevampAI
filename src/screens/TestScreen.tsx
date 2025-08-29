import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ActivityScreenSimple } from './main/ActivityScreenSimple';
import { TaskScreenSimple } from './tasks/TaskScreenSimple';
import { AdminTaskManagement } from './admin/AdminTaskManagement';
import { AdminAnnouncementManagement } from './admin/AdminAnnouncementManagement';

type TabType = 'activity' | 'tasks' | 'admin-tasks' | 'admin-announcements';

export const TestScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = React.useState<TabType>('activity');

  const renderContent = () => {
    switch (activeTab) {
      case 'activity':
        return <ActivityScreenSimple />;
      case 'tasks':
        return <TaskScreenSimple />;
      case 'admin-tasks':
        return <AdminTaskManagement />;
      case 'admin-announcements':
        return <AdminAnnouncementManagement />;
      default:
        return <ActivityScreenSimple />;
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Tab Navigation */}
      <View 
        className="bg-white border-b border-gray-200 px-4 py-2"
        style={{ paddingTop: insets.top + 8 }}
      >
        <Text className="text-gray-900 text-lg font-bold mb-3">RevampAI Demo</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row">
            {[
              { key: 'activity', label: '📝 Activity Feed', description: 'View activity timeline' },
              { key: 'tasks', label: '📋 Task Board', description: 'Manage tasks' },
              { key: 'admin-tasks', label: '⚡ Admin Tasks', description: 'Task management' },
              { key: 'admin-announcements', label: '📢 Announcements', description: 'Admin communications' },
            ].map(tab => (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key as TabType)}
                className={`mr-4 px-4 py-3 rounded-lg ${
                  activeTab === tab.key ? 'bg-blue-500' : 'bg-gray-100'
                }`}
              >
                <Text className={`font-medium ${
                  activeTab === tab.key ? 'text-white' : 'text-gray-700'
                }`}>
                  {tab.label}
                </Text>
                <Text className={`text-xs ${
                  activeTab === tab.key ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {tab.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Content */}
      <View className="flex-1">
        {renderContent()}
      </View>
    </View>
  );
};