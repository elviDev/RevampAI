import React, { createContext, useContext, useReducer, useCallback } from 'react';

interface AppState {
  shouldOpenTaskCreation: boolean;
  shouldOpenProjectCreation: boolean;
  searchQuery: string;
  pendingNavigation: {
    screen?: string;
    params?: any;
  } | null;
}

type AppAction =
  | { type: 'TRIGGER_TASK_CREATION' }
  | { type: 'TRIGGER_PROJECT_CREATION' }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_PENDING_NAVIGATION'; payload: { screen: string; params?: any } }
  | { type: 'CLEAR_TASK_CREATION' }
  | { type: 'CLEAR_PROJECT_CREATION' }
  | { type: 'CLEAR_SEARCH_QUERY' }
  | { type: 'CLEAR_PENDING_NAVIGATION' };

const initialState: AppState = {
  shouldOpenTaskCreation: false,
  shouldOpenProjectCreation: false,
  searchQuery: '',
  pendingNavigation: null,
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'TRIGGER_TASK_CREATION':
      return { ...state, shouldOpenTaskCreation: true };
    case 'TRIGGER_PROJECT_CREATION':
      return { ...state, shouldOpenProjectCreation: true };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    case 'SET_PENDING_NAVIGATION':
      return { ...state, pendingNavigation: action.payload };
    case 'CLEAR_TASK_CREATION':
      return { ...state, shouldOpenTaskCreation: false };
    case 'CLEAR_PROJECT_CREATION':
      return { ...state, shouldOpenProjectCreation: false };
    case 'CLEAR_SEARCH_QUERY':
      return { ...state, searchQuery: '' };
    case 'CLEAR_PENDING_NAVIGATION':
      return { ...state, pendingNavigation: null };
    default:
      return state;
  }
};

interface AppStateContextType {
  state: AppState;
  triggerTaskCreation: () => void;
  triggerProjectCreation: () => void;
  setSearchQuery: (query: string) => void;
  setPendingNavigation: (screen: string, params?: any) => void;
  clearTaskCreation: () => void;
  clearProjectCreation: () => void;
  clearSearchQuery: () => void;
  clearPendingNavigation: () => void;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const triggerTaskCreation = useCallback(() => {
    dispatch({ type: 'TRIGGER_TASK_CREATION' });
  }, []);

  const triggerProjectCreation = useCallback(() => {
    dispatch({ type: 'TRIGGER_PROJECT_CREATION' });
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  }, []);

  const setPendingNavigation = useCallback((screen: string, params?: any) => {
    dispatch({ type: 'SET_PENDING_NAVIGATION', payload: { screen, params } });
  }, []);

  const clearTaskCreation = useCallback(() => {
    dispatch({ type: 'CLEAR_TASK_CREATION' });
  }, []);

  const clearProjectCreation = useCallback(() => {
    dispatch({ type: 'CLEAR_PROJECT_CREATION' });
  }, []);

  const clearSearchQuery = useCallback(() => {
    dispatch({ type: 'CLEAR_SEARCH_QUERY' });
  }, []);

  const clearPendingNavigation = useCallback(() => {
    dispatch({ type: 'CLEAR_PENDING_NAVIGATION' });
  }, []);

  const value: AppStateContextType = {
    state,
    triggerTaskCreation,
    triggerProjectCreation,
    setSearchQuery,
    setPendingNavigation,
    clearTaskCreation,
    clearProjectCreation,
    clearSearchQuery,
    clearPendingNavigation,
  };

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = (): AppStateContextType => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};