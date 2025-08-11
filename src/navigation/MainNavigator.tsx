import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TabNavigator } from './TabNavigator';
import { ChannelDetailScreen } from '../screens/chats/ChannelDetailScreen';
import { TaskDetailScreen } from '../screens/tasks/TaskDetailScreen';
import { ProjectDetailScreen } from '../screens/projects/ProjectDetailScreen';

export type MainStackParamList = {
  Tabs: undefined;
  ChannelDetailScreen: {
    channelId: string;
    channelName: string;
    members: any[];
  };
  TaskDetailScreen: {
    taskId: string;
  };
  ProjectDetailScreen: {
    projectId: string;
  };
};

const Stack = createNativeStackNavigator<MainStackParamList>();

export const MainNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Tabs"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen
        name="ChannelDetailScreen"
        component={ChannelDetailScreen}
      />
      <Stack.Screen
        name="TaskDetailScreen"
        component={TaskDetailScreen}
      />
      <Stack.Screen
        name="ProjectDetailScreen"
        component={ProjectDetailScreen}
      />
    </Stack.Navigator>
  );
};
