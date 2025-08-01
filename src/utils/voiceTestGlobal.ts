import { NativeModules } from 'react-native';
import Voice from '../services/voice/CustomVoice';
import { runVoiceDiagnostics } from './voiceErrorHandler';

// Global test function we can call from anywhere
(global as any).testVoice = async () => {
  console.log('🧪 === COMPREHENSIVE VOICE SYSTEM TEST ===');
  
  // 1. Check NativeModules
  console.log('📱 NativeModules available:', !!NativeModules);
  console.log('📋 Available modules:', Object.keys(NativeModules));
  
  // 2. Check Voice module specifically
  const { Voice: VoiceNative } = NativeModules;
  console.log('🎤 Voice native module:', !!VoiceNative);
  
  if (VoiceNative) {
    console.log('🔧 Voice methods:', Object.keys(VoiceNative));
  }
  
  // 3. Test custom Voice wrapper
  console.log('📦 Custom Voice available:', !!Voice);
  console.log('✅ Module check:', Voice.isModuleAvailable());
  
  // 4. Comprehensive diagnostics
  try {
    if (Voice.isModuleAvailable()) {
      console.log('🔍 Running comprehensive diagnostics...');
      
      // Check speech setup
      const setupInfo = await Voice.checkSpeechRecognitionSetup();
      console.log('📊 Speech Setup Info:', setupInfo);
      
      // Check available services
      const services = await Voice.getSpeechRecognitionServices();
      console.log('🔧 Available speech services:', services);
      
      // Test basic availability
      const available = await Voice.isAvailable();
      console.log('🗣️ Speech available:', available);
      
      // Test recognition status
      const recognizing = await Voice.isRecognizing();
      console.log('👂 Currently recognizing:', recognizing);
      
      // Provide recommendations
      if (!setupInfo.googleAppInstalled) {
        console.log('⚠️ RECOMMENDATION: Install Google app for better speech recognition');
      }
      
      if (setupInfo.speechServicesCount === 0) {
        console.log('❌ ISSUE: No speech recognition services available');
      }
      
      if (!setupInfo.hasAudioPermission) {
        console.log('❌ ISSUE: Audio permission not granted');
      }
      
      console.log('🎉 Voice system test completed successfully!');
      return { success: true, voiceAvailable: available, diagnostics: setupInfo };
    } else {
      console.log('⚠️ Voice module not available');
      return { success: false, reason: 'Module not available' };
    }
  } catch (error: any) {
    console.log('❌ Voice test failed:', error);
    return { success: false, error: error?.message || 'Unknown error' };
  }
};

// Quick voice start test
(global as any).testVoiceStart = async () => {
  console.log('🎤 Testing voice start...');
  
  try {
    if (!Voice.isModuleAvailable()) {
      console.log('❌ Voice module not available');
      return false;
    }
    
    // Set up basic handlers
    Voice.onSpeechStart = () => console.log('🎤 Speech started!');
    Voice.onSpeechEnd = () => console.log('🛑 Speech ended!');
    Voice.onSpeechResults = (e) => console.log('📝 Results:', e.value);
    Voice.onSpeechError = (e) => console.log('❌ Error:', e.message);
    
    await Voice.start('en-US');
    console.log('✅ Voice started successfully!');
    
    // Auto-stop after 3 seconds for testing
    setTimeout(async () => {
      try {
        await Voice.stop();
        console.log('✅ Voice stopped automatically');
      } catch (error) {
        console.log('❌ Stop failed:', error);
      }
    }, 3000);
    
    return true;
  } catch (error: any) {
    console.log('❌ Voice start test failed:', error);
    return false;
  }
};

console.log('🔧 Voice test utilities loaded!');
console.log('📞 Call testVoice() to run system test');
console.log('🎤 Call testVoiceStart() to test voice recognition');
console.log('🔬 Call runVoiceDiagnostics() to run diagnostics');

// Also make diagnostics available globally
(global as any).runVoiceDiagnostics = runVoiceDiagnostics;

export { };
