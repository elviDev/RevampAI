import { NativeModules } from 'react-native';

export const debugVoiceSystem = () => {
  console.log('=== VOICE SYSTEM DEBUG ===');
  
  // Check if NativeModules is available
  console.log('NativeModules available:', !!NativeModules);
  
  // List all available native modules
  console.log('Available native modules:', Object.keys(NativeModules));
  
  // Check specifically for Voice module
  const { Voice } = NativeModules;
  console.log('Voice module available:', !!Voice);
  
  if (Voice) {
    console.log('Voice module methods:', Object.keys(Voice));
    console.log('Voice module type:', typeof Voice);
  } else {
    console.log('Voice module is null/undefined');
  }
  
  // Check other potential voice-related modules
  const voiceRelated = Object.keys(NativeModules).filter(key => 
    key.toLowerCase().includes('voice') || 
    key.toLowerCase().includes('speech') ||
    key.toLowerCase().includes('audio')
  );
  console.log('Voice-related modules:', voiceRelated);
  
  console.log('=== END VOICE DEBUG ===');
};

export const logVoiceModuleStatus = () => {
  try {
    const { Voice } = NativeModules;
    if (Voice) {
      console.log('✅ Voice native module is available');
      console.log('Voice module methods:', Object.keys(Voice));
    } else {
      console.log('❌ Voice native module is NOT available');
      console.log('This could be because:');
      console.log('1. The native module is not properly linked');
      console.log('2. The app needs to be rebuilt after adding native code');
      console.log('3. The module registration failed');
    }
  } catch (error) {
    console.log('❌ Error checking Voice module:', error);
  }
};
