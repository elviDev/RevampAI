import React, { createContext, useContext, useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { NavigationService } from '../services/NavigationService';
import { useAppState } from './AppStateContext';

export type QuickActionType = 
  | 'create_task'
  | 'create_project' 
  | 'view_analytics'
  | 'search_tasks'
  | 'view_activity'
  | 'open_profile'
  | 'toggle_theme';

interface QuickAction {
  id: QuickActionType;
  label: string;
  icon: string;
  description: string;
  shortcut?: string;
  handler: () => void;
}

interface QuickActionsContextType {
  quickActions: QuickAction[];
  executeQuickAction: (actionId: QuickActionType) => void;
  searchTasks: (query: string) => void;
  createTask: (taskData?: any) => void;
  createProject: (projectData?: any) => void;
  openTaskDetail: (taskId: string) => void;
  openProjectDetail: (projectId: string) => void;
  showNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const QuickActionsContext = createContext<QuickActionsContextType | undefined>(undefined);

export const QuickActionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [, forceUpdate] = useState({});
  const { triggerTaskCreation, triggerProjectCreation, setSearchQuery } = useAppState();

  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    // This could be enhanced with a toast library
    Alert.alert(
      type === 'error' ? 'Error' : type === 'success' ? 'Success' : 'Info',
      message,
      [{ text: 'OK' }]
    );
  }, []);

  const searchTasks = useCallback((query: string) => {
    setSearchQuery(query);
    NavigationService.navigateToTasks();
    if (query) {
      showNotification(`Searching for: ${query}`, 'info');
    }
  }, [showNotification, setSearchQuery]);

  const createTask = useCallback((taskData?: any) => {
    triggerTaskCreation();
    NavigationService.navigateToTasks();
    showNotification('Opening task creation form', 'info');
  }, [showNotification, triggerTaskCreation]);

  const createProject = useCallback((projectData?: any) => {
    triggerProjectCreation();
    NavigationService.navigateToProjects();
    showNotification('Opening project creation form', 'info');
  }, [showNotification, triggerProjectCreation]);

  const openTaskDetail = useCallback((taskId: string) => {
    NavigationService.navigateToTaskDetail(taskId);
  }, []);

  const openProjectDetail = useCallback((projectId: string) => {
    NavigationService.navigateToProjectDetail(projectId);
  }, []);

  const quickActions: QuickAction[] = [
    {
      id: 'create_task',
      label: 'Create Task',
      icon: 'plus-circle',
      description: 'Create a new task',
      shortcut: 'Ctrl+N',
      handler: () => createTask(),
    },
    {
      id: 'create_project',
      label: 'Create Project',
      icon: 'folder-plus',
      description: 'Start a new project',
      shortcut: 'Ctrl+Shift+N',
      handler: () => createProject(),
    },
    {
      id: 'search_tasks',
      label: 'Search Tasks',
      icon: 'search',
      description: 'Find tasks quickly',
      shortcut: 'Ctrl+F',
      handler: () => NavigationService.navigateToTasks(),
    },
    {
      id: 'view_analytics',
      label: 'View Analytics',
      icon: 'bar-chart',
      description: 'Check performance metrics',
      shortcut: 'Ctrl+D',
      handler: () => NavigationService.navigateToAnalytics(),
    },
    {
      id: 'view_activity',
      label: 'Activity Feed',
      icon: 'activity',
      description: 'See recent team activity',
      shortcut: 'Ctrl+A',
      handler: () => NavigationService.navigateToActivity(),
    },
    {
      id: 'open_profile',
      label: 'Profile Settings',
      icon: 'user',
      description: 'Manage your profile',
      shortcut: 'Ctrl+,',
      handler: () => NavigationService.navigateToProfile(),
    },
  ];

  const executeQuickAction = useCallback((actionId: QuickActionType) => {
    const action = quickActions.find(a => a.id === actionId);
    if (action) {
      action.handler();
    }
  }, [quickActions]);

  const value: QuickActionsContextType = {
    quickActions,
    executeQuickAction,
    searchTasks,
    createTask,
    createProject,
    openTaskDetail,
    openProjectDetail,
    showNotification,
  };

  return (
    <QuickActionsContext.Provider value={value}>
      {children}
    </QuickActionsContext.Provider>
  );
};

export const useQuickActions = (): QuickActionsContextType => {
  const context = useContext(QuickActionsContext);
  if (!context) {
    throw new Error('useQuickActions must be used within a QuickActionsProvider');
  }
  return context;
};