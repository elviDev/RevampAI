import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { useAuth } from '../hooks/useAuth';
import { SplashScreen } from '../components/common/SplashScreen';
import { navigationRef } from '../services/NavigationService';
import { QuickActionsProvider } from '../contexts/QuickActionsContext';
import { AppStateProvider } from '../contexts/AppStateContext';

const Stack = createNativeStackNavigator();

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Ensure splash screen shows for at least 3 seconds
    const timer = setTimeout(() => {
      if (!isLoading) {
        setShowSplash(false);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [isLoading]);

  // Show splash screen if still loading or if we haven't completed the minimum display time
  if (showSplash || isLoading) {
    return (
      <SplashScreen 
        onAnimationComplete={() => {
          if (!isLoading) {
            setShowSplash(false);
          }
        }} 
      />
    );
  }

  return (
    <AppStateProvider>
      <QuickActionsProvider>
        <NavigationContainer ref={navigationRef}>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {isAuthenticated ? (
              <Stack.Screen name="Main" component={MainNavigator} />
            ) : (
              <Stack.Screen name="Auth" component={AuthNavigator} />
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </QuickActionsProvider>
    </AppStateProvider>
  );
}; 