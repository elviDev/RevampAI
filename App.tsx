import React from 'react';
import "./global.css";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store } from './src/store/store';
import { AppNavigator } from './src/navigation/AppNavigator';
import { ToastProvider } from './src/contexts/ToastContext';

// Load voice testing utilities (only in development)
if (__DEV__) {
  require('./src/utils/voiceTestGlobal');
}

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <ToastProvider>
          <AppNavigator />
        </ToastProvider>
      </SafeAreaProvider>
    </Provider>
  );
}