import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

// Type declarations for Web APIs (avoiding global conflicts)

interface VoiceActivityConfig {
  silenceThreshold: number; // in dB, default -40
  speechThreshold: number; // in dB, default -25
  minSpeechDuration: number; // in ms, default 500
  maxSilenceDuration: number; // in ms, default 2000
  sampleRate: number; // default 16000
  bufferSize: number; // default 1024
}

interface VoiceActivity {
  isSpeaking: boolean;
  audioLevel: number; // in dB
  speechDuration: number; // in ms
  silenceDuration: number; // in ms
  confidence: number; // 0-1
}

export class VoiceActivityDetector {
  private config: VoiceActivityConfig;
  private isActive = false;
  private audioContext: any | null = null;
  private analyser: any | null = null;
  private dataArray: Uint8Array | null = null;
  private stream: MediaStream | null = null;
  private animationFrame: number | null = null;

  private lastActivity: VoiceActivity = {
    isSpeaking: false,
    audioLevel: -60,
    speechDuration: 0,
    silenceDuration: 0,
    confidence: 0,
  };

  private speechStartTime: number | null = null;
  private silenceStartTime: number | null = null;
  private listeners: ((activity: VoiceActivity) => void)[] = [];

  private readonly DEFAULT_CONFIG: VoiceActivityConfig = {
    silenceThreshold: -40,
    speechThreshold: -25,
    minSpeechDuration: 500,
    maxSilenceDuration: 2000,
    sampleRate: 16000,
    bufferSize: 1024,
  };

  constructor(config: Partial<VoiceActivityConfig> = {}) {
    this.config = { ...this.DEFAULT_CONFIG, ...config };

    // Initialize Web Audio API if available (web only)
    if (Platform.OS === 'web') {
      this.initWebAudio();
    }
  }

  private initWebAudio() {
    try {
      if (typeof globalThis !== 'undefined' && (globalThis as any).window) {
        const win = (globalThis as any).window;
        const AudioContextClass = win.AudioContext || win.webkitAudioContext;
        if (AudioContextClass) {
          this.audioContext = new AudioContextClass();
        }
      }
    } catch (error) {
      console.warn('❌ Web Audio API not available:', error);
    }
  }

  async start(): Promise<boolean> {
    if (this.isActive) return true;

    try {
      if (Platform.OS === 'web') {
        return await this.startWebVAD();
      } else {
        return await this.startNativeVAD();
      }
    } catch (error) {
      console.error('❌ Failed to start Voice Activity Detection:', error);
      return false;
    }
  }

  private async startWebVAD(): Promise<boolean> {
    if (!this.audioContext) {
      console.warn('❌ AudioContext not available');
      return false;
    }

    try {
      const nav = (globalThis as any).navigator;
      this.stream = await nav.mediaDevices.getUserMedia({
        audio: {
          sampleRate: this.config.sampleRate,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      const source = this.audioContext.createMediaStreamSource(this.stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = this.config.bufferSize * 2;
      this.analyser.smoothingTimeConstant = 0.8;

      source.connect(this.analyser);
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

      this.isActive = true;
      this.startAnalysis();

      console.log('✅ Web-based VAD started');
      return true;
    } catch (error) {
      console.error('❌ Web VAD initialization failed:', error);
      return false;
    }
  }

  private async startNativeVAD(): Promise<boolean> {
    // For React Native, we'll use a simplified approach
    // In a real implementation, you might use a native module
    // for more accurate VAD

    try {
      // Simulate VAD using voice recognition events
      this.isActive = true;
      console.log('✅ Native VAD simulation started');
      return true;
    } catch (error) {
      console.error('❌ Native VAD failed:', error);
      return false;
    }
  }

  private startAnalysis() {
    if (!this.isActive || !this.analyser || !this.dataArray) return;

    const analyze = () => {
      if (!this.isActive || !this.analyser || !this.dataArray) return;

      this.analyser.getByteFrequencyData(this.dataArray);

      // Calculate RMS (Root Mean Square) for audio level
      const rms = this.calculateRMS(this.dataArray);
      const audioLevel = this.rmsToDecibels(rms);

      const currentTime = Date.now();
      const wasSpeaking = this.lastActivity.isSpeaking;
      const isSpeaking = audioLevel > this.config.speechThreshold;

      let speechDuration = this.lastActivity.speechDuration;
      let silenceDuration = this.lastActivity.silenceDuration;

      if (isSpeaking && !wasSpeaking) {
        // Speech started
        this.speechStartTime = currentTime;
        this.silenceStartTime = null;
        silenceDuration = 0;
      } else if (!isSpeaking && wasSpeaking) {
        // Speech ended
        this.silenceStartTime = currentTime;
        this.speechStartTime = null;
        speechDuration = 0;
      }

      if (this.speechStartTime) {
        speechDuration = currentTime - this.speechStartTime;
      }

      if (this.silenceStartTime) {
        silenceDuration = currentTime - this.silenceStartTime;
      }

      // Calculate confidence based on audio characteristics
      const confidence = this.calculateConfidence(
        audioLevel,
        speechDuration,
        silenceDuration,
      );

      const activity: VoiceActivity = {
        isSpeaking:
          isSpeaking && speechDuration > this.config.minSpeechDuration,
        audioLevel,
        speechDuration,
        silenceDuration,
        confidence,
      };

      if (this.hasActivityChanged(this.lastActivity, activity)) {
        this.lastActivity = activity;
        this.notifyListeners(activity);
      }

      this.animationFrame = requestAnimationFrame(analyze);
    };

    analyze();
  }

  private calculateRMS(dataArray: Uint8Array): number {
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i] * dataArray[i];
    }
    return Math.sqrt(sum / dataArray.length);
  }

  private rmsToDecibels(rms: number): number {
    if (rms === 0) return -60; // Floor at -60dB
    return 20 * Math.log10(rms / 255);
  }

  private calculateConfidence(
    audioLevel: number,
    speechDuration: number,
    silenceDuration: number,
  ): number {
    let confidence = 0;

    // Audio level confidence (0-0.4)
    if (audioLevel > this.config.speechThreshold) {
      const levelConfidence = Math.min(
        (audioLevel - this.config.speechThreshold) / 20,
        1,
      );
      confidence += levelConfidence * 0.4;
    }

    // Speech duration confidence (0-0.3)
    if (speechDuration > this.config.minSpeechDuration) {
      const durationConfidence = Math.min(speechDuration / 2000, 1);
      confidence += durationConfidence * 0.3;
    }

    // Silence handling confidence (0-0.3)
    if (
      silenceDuration > 0 &&
      silenceDuration < this.config.maxSilenceDuration
    ) {
      confidence += 0.3;
    }

    return Math.min(confidence, 1);
  }

  private hasActivityChanged(
    prev: VoiceActivity,
    current: VoiceActivity,
  ): boolean {
    const threshold = 0.1;
    return (
      prev.isSpeaking !== current.isSpeaking ||
      Math.abs(prev.audioLevel - current.audioLevel) > 3 ||
      Math.abs(prev.confidence - current.confidence) > threshold
    );
  }

  private notifyListeners(activity: VoiceActivity) {
    this.listeners.forEach(listener => {
      try {
        listener(activity);
      } catch (error) {
        console.error('❌ VAD listener error:', error);
      }
    });
  }

  stop(): void {
    this.isActive = false;

    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }

    if (this.stream) {
      (this.stream as any).getTracks().forEach((track: any) => track.stop());
      this.stream = null;
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.analyser = null;
    this.dataArray = null;
    this.speechStartTime = null;
    this.silenceStartTime = null;

    console.log('🛑 Voice Activity Detection stopped');
  }

  addListener(listener: (activity: VoiceActivity) => void): () => void {
    this.listeners.push(listener);

    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  getCurrentActivity(): VoiceActivity {
    return { ...this.lastActivity };
  }

  updateConfig(newConfig: Partial<VoiceActivityConfig>) {
    this.config = { ...this.config, ...newConfig };
    console.log('🔄 VAD config updated:', newConfig);
  }

  // Native integration methods for React Native
  simulateSpeechStart() {
    if (!this.isActive) return;

    const activity: VoiceActivity = {
      isSpeaking: true,
      audioLevel: -20,
      speechDuration: 100,
      silenceDuration: 0,
      confidence: 0.8,
    };

    this.speechStartTime = Date.now();
    this.silenceStartTime = null;
    this.lastActivity = activity;
    this.notifyListeners(activity);
  }

  simulateSpeechEnd() {
    if (!this.isActive) return;

    const speechDuration = this.speechStartTime
      ? Date.now() - this.speechStartTime
      : 0;

    const activity: VoiceActivity = {
      isSpeaking: false,
      audioLevel: -45,
      speechDuration,
      silenceDuration: 0,
      confidence: speechDuration > this.config.minSpeechDuration ? 0.9 : 0.3,
    };

    this.silenceStartTime = Date.now();
    this.speechStartTime = null;
    this.lastActivity = activity;
    this.notifyListeners(activity);
  }

  simulateAudioLevel(level: number) {
    if (!this.isActive) return;

    const isSpeaking = level > this.config.speechThreshold;
    const currentTime = Date.now();

    let speechDuration = this.lastActivity.speechDuration;
    let silenceDuration = this.lastActivity.silenceDuration;

    if (isSpeaking && this.speechStartTime) {
      speechDuration = currentTime - this.speechStartTime;
    }
    if (!isSpeaking && this.silenceStartTime) {
      silenceDuration = currentTime - this.silenceStartTime;
    }

    const activity: VoiceActivity = {
      isSpeaking,
      audioLevel: level,
      speechDuration,
      silenceDuration,
      confidence: this.calculateConfidence(
        level,
        speechDuration,
        silenceDuration,
      ),
    };

    if (this.hasActivityChanged(this.lastActivity, activity)) {
      this.lastActivity = activity;
      this.notifyListeners(activity);
    }
  }
}

export default VoiceActivityDetector;
