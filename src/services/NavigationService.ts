import { NavigationContainerRef } from '@react-navigation/native';
import { createRef } from 'react';

// Navigation reference for navigating outside of React components
export const navigationRef = createRef<NavigationContainerRef<any>>();

// Helper functions for navigation
export const NavigationService = {
  // Navigate to a route
  navigate: (name: string, params?: any) => {
    if (navigationRef.current) {
      navigationRef.current.navigate(name, params);
    }
  },

  // Go back
  goBack: () => {
    if (navigationRef.current?.canGoBack()) {
      navigationRef.current.goBack();
    }
  },

  // Reset navigation stack
  reset: (state: any) => {
    if (navigationRef.current) {
      navigationRef.current.reset(state);
    }
  },

  // Get current route name
  getCurrentRoute: () => {
    if (navigationRef.current) {
      return navigationRef.current.getCurrentRoute()?.name;
    }
    return null;
  },

  // Quick navigation functions for common routes
  navigateToHome: () => NavigationService.navigate('Tabs', { screen: 'Home' }),
  navigateToProjects: () => NavigationService.navigate('Tabs', { screen: 'Projects' }),
  navigateToTasks: () => NavigationService.navigate('Tabs', { screen: 'Tasks' }),
  navigateToActivity: () => NavigationService.navigate('Tabs', { screen: 'Activity' }),
  navigateToAnalytics: () => NavigationService.navigate('Tabs', { screen: 'Analytics' }),
  navigateToProfile: () => NavigationService.navigate('Tabs', { screen: 'Profile' }),
  
  // Navigate to specific screens with data
  navigateToTaskDetail: (taskId: string) => NavigationService.navigate('TaskDetailScreen', { taskId }),
  navigateToProjectDetail: (projectId: string) => NavigationService.navigate('ProjectDetailScreen', { projectId }),
  navigateToChannelDetail: (channelId: string, channelName: string, members: any[]) => 
    NavigationService.navigate('ChannelDetailScreen', { channelId, channelName, members }),
  
  // Create new items
  navigateToCreateTask: () => NavigationService.navigateToTasks(), // Will open create modal
  navigateToCreateProject: () => NavigationService.navigateToProjects(), // Will open create modal
};