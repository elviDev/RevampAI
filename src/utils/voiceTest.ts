import Voice from '../services/voice/CustomVoice';

export const testVoiceModule = async () => {
  console.log('=== Voice Module Test ===');
  
  try {
    // Test if module is available
    const isAvailable = Voice.isModuleAvailable();
    console.log('Voice module available:', isAvailable);
    
    if (!isAvailable) {
      console.log('Voice module not available - this is expected in development without native linking');
      return false;
    }
    
    // Test speech recognition availability
    const speechAvailable = await Voice.isAvailable();
    console.log('Speech recognition available:', speechAvailable);
    
    // Test if recognizing
    const isRecognizing = await Voice.isRecognizing();
    console.log('Currently recognizing:', isRecognizing);
    
    // Set up event handlers
    Voice.onSpeechStart = (e) => console.log('Speech started:', e);
    Voice.onSpeechEnd = (e) => console.log('Speech ended:', e);
    Voice.onSpeechResults = (e) => console.log('Speech results:', e);
    Voice.onSpeechError = (e) => console.log('Speech error:', e);
    
    console.log('Voice module test completed successfully');
    return true;
    
  } catch (error) {
    console.error('Voice module test failed:', error);
    return false;
  }
};

export const testVoiceRecognition = async () => {
  console.log('=== Voice Recognition Test ===');
  
  try {
    if (!Voice.isModuleAvailable()) {
      console.log('Voice module not available - skipping recognition test');
      return false;
    }
    
    console.log('Starting voice recognition...');
    await Voice.start('en-US');
    console.log('Voice recognition started successfully');
    
    // Wait a bit then stop
    setTimeout(async () => {
      try {
        await Voice.stop();
        console.log('Voice recognition stopped successfully');
      } catch (error) {
        console.error('Error stopping voice recognition:', error);
      }
    }, 3000);
    
    return true;
    
  } catch (error) {
    console.error('Voice recognition test failed:', error);
    return false;
  }
};
