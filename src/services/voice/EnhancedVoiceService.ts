import { Platform, PermissionsAndroid, Alert } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import Voice from './CustomVoice';
// import { openAIService } from '../ai/OpenAIService'; // DISABLED - GPT enhancement disabled
import { showVoiceErrorDialog } from '../../utils/voiceErrorHandler';

export interface VoiceResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

export interface VoiceConfig {
  locale?: string;
  confidenceThreshold?: number;
  enableCaching?: boolean;
  enableFallback?: boolean;
  maxRetries?: number;
  debounceMs?: number;
}

export interface VoiceContext {
  previousCommands: string[];
  userPreferences: {
    preferredLanguage: string;
    voiceSpeed: number;
  };
  sessionCommands: string[];
}

class EnhancedVoiceService {
  private static instance: EnhancedVoiceService;
  private transcriptCache = new Map<string, { transcript: string; timestamp: number }>();
  private isOnline = true;
  private voiceAvailable = false;
  private isInitialized = false;
  private activeListeners = new Set<string>();
  private commandHistory: string[] = [];
  private context: VoiceContext = {
    previousCommands: [],
    userPreferences: {
      preferredLanguage: 'en-US',
      voiceSpeed: 1.0,
    },
    sessionCommands: [],
  };

  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly DEFAULT_CONFIG: Required<VoiceConfig> = {
    locale: 'en-US',
    confidenceThreshold: 0.7,
    enableCaching: true,
    enableFallback: true,
    maxRetries: 3,
    debounceMs: 150,
  };

  private constructor() {
    this.initNetworkMonitoring();
  }

  static getInstance(): EnhancedVoiceService {
    if (!EnhancedVoiceService.instance) {
      EnhancedVoiceService.instance = new EnhancedVoiceService();
    }
    return EnhancedVoiceService.instance;
  }

  private initNetworkMonitoring() {
    NetInfo.addEventListener(state => {
      this.isOnline = state.isConnected ?? false;
      console.log('🌐 Network status changed:', this.isOnline ? 'Online' : 'Offline');
    });
  }

  async initialize(): Promise<boolean> {
    if (this.isInitialized) return this.voiceAvailable;

    try {
      const available = await Voice.isAvailable();
      this.voiceAvailable = available;
      this.isInitialized = true;
      
      console.log('🎤 EnhancedVoiceService initialized:', { available, online: this.isOnline });
      return available;
    } catch (error) {
      console.error('❌ Voice service initialization failed:', error);
      return false;
    }
  }

  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Audio Recording Permission',
            message: 'This app needs microphone access for voice commands.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('❌ Permission request failed:', err);
        return false;
      }
    }
    return true;
  }

  private getCachedTranscript(rawText: string): string | null {
    if (!this.DEFAULT_CONFIG.enableCaching) return null;

    const cached = this.transcriptCache.get(rawText.toLowerCase());
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      console.log('✅ Using cached transcript');
      return cached.transcript;
    }
    return null;
  }

  private setCachedTranscript(rawText: string, correctedText: string): void {
    if (!this.DEFAULT_CONFIG.enableCaching) return;

    this.transcriptCache.set(rawText.toLowerCase(), {
      transcript: correctedText,
      timestamp: Date.now(),
    });

    // Cleanup old cache entries
    if (this.transcriptCache.size > 100) {
      const oldestKey = Array.from(this.transcriptCache.keys())[0];
      this.transcriptCache.delete(oldestKey);
    }
  }

  private async correctTranscriptionWithFallback(
    rawTranscript: string,
    config: Required<VoiceConfig>
  ): Promise<string> {
    // Check cache first
    const cached = this.getCachedTranscript(rawTranscript);
    if (cached) return cached;

    // GPT translation enhancement DISABLED - use local enhancement only
    console.log('🔧 Using local enhancement only (GPT translation disabled)');
    const enhanced = this.enhanceTranscriptLocally(rawTranscript);
    
    // Still cache the locally enhanced result
    this.setCachedTranscript(rawTranscript, enhanced);
    
    return enhanced;
  }

  private async retryWithBackoff<T>(
    fn: () => Promise<T>,
    attempt: number
  ): Promise<T> {
    const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
    if (attempt > 1) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    return fn();
  }

  private enhanceTranscriptLocally(transcript: string): string {
    // Local enhancement logic
    let enhanced = transcript
      .trim()
      .toLowerCase()
      // Fix common speech recognition errors
      .replace(/\bcreate\s+task\b/gi, 'create task')
      .replace(/\bshow\s+analytics\b/gi, 'show analytics')
      .replace(/\bnew\s+project\b/gi, 'new project')
      .replace(/\bsearch\s+tasks?\b/gi, 'search tasks')
      // Add more common corrections based on your app's commands
      .replace(/\btask\s+detail\b/gi, 'task detail')
      .replace(/\bopen\s+settings\b/gi, 'open settings');

    // Capitalize first letter
    enhanced = enhanced.charAt(0).toUpperCase() + enhanced.slice(1);
    
    console.log('🔧 Local enhancement:', transcript, '->', enhanced);
    return enhanced;
  }

  private assessConfidence(results: string[]): number {
    if (!results || results.length === 0) return 0;
    
    // Simple confidence assessment based on result consistency
    const primary = results[0];
    const similar = results.filter(r => 
      this.calculateSimilarity(r, primary) > 0.8
    ).length;
    
    return Math.min(similar / results.length, 1.0);
  }

  private calculateSimilarity(a: string, b: string): number {
    const longer = a.length > b.length ? a : b;
    const shorter = a.length > b.length ? b : a;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  private levenshteinDistance(a: string, b: string): number {
    const matrix = Array(b.length + 1).fill(null).map(() => 
      Array(a.length + 1).fill(null)
    );

    for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= b.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= b.length; j++) {
      for (let i = 1; i <= a.length; i++) {
        const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // insertion
          matrix[j - 1][i] + 1, // deletion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }

    return matrix[b.length][a.length];
  }

  private addToContext(command: string): void {
    this.commandHistory.push(command);
    this.context.sessionCommands.push(command);
    
    // Keep only last 10 commands for context
    if (this.commandHistory.length > 10) {
      this.commandHistory.shift();
    }
    
    if (this.context.sessionCommands.length > 20) {
      this.context.sessionCommands.shift();
    }
  }

  private enhanceWithContext(transcript: string): string {
    // Context-aware enhancement
    const recentCommands = this.commandHistory.slice(-3);
    
    // If user said "another" or "same", infer from recent commands
    if (/\b(another|same|also|too)\b/i.test(transcript)) {
      const lastTaskCommand = recentCommands.find(cmd => 
        /create\s+(task|project)/i.test(cmd)
      );
      if (lastTaskCommand) {
        return transcript.replace(/\b(another|same)\b/i, lastTaskCommand);
      }
    }
    
    // Handle pronouns with context
    if (/\b(it|that|this)\b/i.test(transcript)) {
      const lastNoun = this.extractLastNoun(recentCommands);
      if (lastNoun) {
        return transcript.replace(/\b(it|that|this)\b/i, lastNoun);
      }
    }
    
    return transcript;
  }

  private extractLastNoun(commands: string[]): string | null {
    const nouns = ['task', 'project', 'analytics', 'profile', 'settings'];
    for (const command of commands.reverse()) {
      for (const noun of nouns) {
        if (command.toLowerCase().includes(noun)) {
          return noun;
        }
      }
    }
    return null;
  }

  async processVoiceResult(
    results: string[],
    config: Partial<VoiceConfig> = {}
  ): Promise<VoiceResult> {
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config };
    
    if (!results || results.length === 0) {
      return { transcript: '', confidence: 0, isFinal: true };
    }

    const rawTranscript = results[0];
    const confidence = this.assessConfidence(results);
    
    console.log('📊 Voice result assessment:', { 
      raw: rawTranscript, 
      confidence: confidence.toFixed(2),
      threshold: finalConfig.confidenceThreshold 
    });

    if (confidence < finalConfig.confidenceThreshold) {
      console.log('⚠️ Low confidence, requesting clearer speech');
      return {
        transcript: '',
        confidence,
        isFinal: false,
      };
    }

    try {
      // Process transcript with all enhancements
      let finalTranscript = await this.correctTranscriptionWithFallback(
        rawTranscript,
        finalConfig
      );
      
      finalTranscript = this.enhanceWithContext(finalTranscript);
      this.addToContext(finalTranscript);
      
      return {
        transcript: finalTranscript,
        confidence,
        isFinal: true,
      };
    } catch (error) {
      console.error('❌ Transcript processing failed:', error);
      return {
        transcript: rawTranscript,
        confidence,
        isFinal: true,
      };
    }
  }

  createEventHandlers(
    onListeningChange: (listening: boolean) => void,
    onResults: (result: VoiceResult) => void,
    config: Partial<VoiceConfig> = {}
  ) {
    const listenerId = Math.random().toString(36);
    this.activeListeners.add(listenerId);

    let debounceTimer: NodeJS.Timeout | null = null;
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config };

    const handlers = {
      onSpeechStart: () => {
        console.log('🎤 Speech recognition started');
        onListeningChange(true);
      },

      onSpeechEnd: () => {
        console.log('🛑 Speech recognition ended');
        onListeningChange(false);
      },

      onSpeechError: (error: any) => {
        console.log('❌ Voice error received:', error);
        onListeningChange(false);
        showVoiceErrorDialog(error);
      },

      onSpeechResults: async (event: any) => {
        if (debounceTimer) clearTimeout(debounceTimer);
        
        debounceTimer = setTimeout(async () => {
          const result = await this.processVoiceResult(event.value, config);
          onResults(result);
        }, finalConfig.debounceMs);
      },

      onSpeechPartialResults: async (event: any) => {
        if (debounceTimer) clearTimeout(debounceTimer);
        
        debounceTimer = setTimeout(async () => {
          const result = await this.processVoiceResult(event.value, config);
          if (result.transcript) {
            onResults({ ...result, isFinal: false });
          }
        }, finalConfig.debounceMs);
      },

      cleanup: () => {
        this.activeListeners.delete(listenerId);
        if (debounceTimer) clearTimeout(debounceTimer);
      },
    };

    return handlers;
  }

  async startListening(config: Partial<VoiceConfig> = {}): Promise<boolean> {
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config };
    
    // Ensure locale is never null or undefined
    const safeLocale = finalConfig.locale || this.DEFAULT_CONFIG.locale || 'en-US';

    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'Microphone access is required for voice commands.',
        );
        return false;
      }

      if (!this.voiceAvailable) {
        Alert.alert(
          'Voice Recognition Unavailable',
          'Speech recognition is not available on this device.',
        );
        return false;
      }

      console.log('🎤 Starting voice recognition with locale:', safeLocale);
      await Voice.start(safeLocale);
      return true;
    } catch (error) {
      console.error('❌ Failed to start voice recognition:', error);
      return false;
    }
  }

  async stopListening(): Promise<void> {
    try {
      if (Voice.isModuleAvailable()) {
        await Voice.stop();
      }
    } catch (error) {
      console.warn('❌ Failed to stop voice recognition:', error);
    }
  }

  async cleanup(): Promise<void> {
    try {
      console.log('🧹 Voice service cleanup called from:', new Error().stack?.split('\n')[2]?.trim());
      
      // Clear all timers and listeners
      this.activeListeners.clear();
      
      // Cleanup voice resources
      if (Voice.isModuleAvailable()) {
        await Voice.destroy();
        Voice.removeAllListeners();
      }
      
      // Clear caches
      this.transcriptCache.clear();
      this.commandHistory = [];
      
      console.log('🧹 Voice service cleanup completed');
    } catch (error) {
      console.warn('❌ Voice service cleanup error:', error);
    }
  }

  // Utility methods for debugging and monitoring
  getStats() {
    return {
      cacheSize: this.transcriptCache.size,
      commandHistory: this.commandHistory.length,
      activeListeners: this.activeListeners.size,
      isOnline: this.isOnline,
      voiceAvailable: this.voiceAvailable,
    };
  }

  clearHistory() {
    this.commandHistory = [];
    this.context.sessionCommands = [];
    console.log('🗑️ Command history cleared');
  }

  updateContext(updates: Partial<VoiceContext>) {
    this.context = { ...this.context, ...updates };
    console.log('🔄 Voice context updated');
  }
}

export default EnhancedVoiceService;