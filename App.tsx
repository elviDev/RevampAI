import React from 'react';
import "./global.css";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store } from './src/store/store';
import { AppNavigator } from './src/navigation/AppNavigator';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { VoiceProvider } from './src/contexts/VoiceContext';

// Load voice testing utilities (only in development)
if (__DEV__) {
  require('./src/utils/voiceTestGlobal');
}

export default function App() {
  console.log('🚀 App starting with VoiceProvider...');
  
  return (
    <Provider store={store}>
      <ThemeProvider>
        <VoiceProvider
          config={{
            confidenceThreshold: 0.7,
            enableCaching: true,
            enableFallback: true,
            locale: 'en-US',
          }}
          onTranscript={(transcript, confidence) => {
            console.log('✅ App received voice transcript:', transcript, `(${Math.round(confidence * 100)}%)`);
          }}
          onError={(error) => {
            console.warn('❌ App voice error:', error);
          }}
        >
          <SafeAreaProvider>
            <AppNavigator />
          </SafeAreaProvider>
        </VoiceProvider>
      </ThemeProvider>
    </Provider>
  );
}