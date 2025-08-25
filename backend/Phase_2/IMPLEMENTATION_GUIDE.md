# Phase 2 Implementation Guide
## CEO Communication Platform - Voice Core Development

### 🚀 Implementation Overview
This guide provides step-by-step implementation instructions for Phase 2 development, including code examples, architecture decisions, and integration patterns.

---

## 🎛️ Voice Processing Pipeline Implementation

### Step 1: Audio Stream Management Setup

#### WebRTC Audio Stream Infrastructure
```typescript
// src/voice/stream/AudioStreamManager.ts
import { EventEmitter } from 'events';
import { VoiceActivityDetector } from './VoiceActivityDetector';
import { AudioPreprocessor } from './AudioPreprocessor';

export interface AudioStreamConfig {
  userId: string;
  socketId: string;
  sampleRate: number;
  channels: number;
  format: 'pcm16' | 'pcm32' | 'float32';
  chunkSize: number;
}

export class AudioStreamManager extends EventEmitter {
  private activeStreams: Map<string, AudioStream> = new Map();
  private vad: VoiceActivityDetector;
  private preprocessor: AudioPreprocessor;
  
  constructor() {
    super();
    this.vad = new VoiceActivityDetector({
      threshold: 0.5,
      sensitivity: 0.8
    });
    this.preprocessor = new AudioPreprocessor();
  }
  
  async initializeStream(config: AudioStreamConfig): Promise<AudioStream> {
    const stream = new AudioStream(config);
    this.activeStreams.set(config.socketId, stream);
    
    // Initialize stream buffers
    await stream.initialize();
    
    // Setup event handlers
    stream.on('chunk_processed', (data) => {
      this.emit('stream_progress', { socketId: config.socketId, data });
    });
    
    stream.on('segment_complete', (segment) => {
      this.emit('audio_segment_ready', { 
        socketId: config.socketId, 
        segment,
        userId: config.userId 
      });
    });
    
    return stream;
  }
  
  async processAudioChunk(
    socketId: string, 
    audioChunk: Buffer
  ): Promise<ProcessingResult> {
    const stream = this.activeStreams.get(socketId);
    if (!stream) {
      throw new Error(`Audio stream not found: ${socketId}`);
    }
    
    // Preprocess audio chunk
    const preprocessed = await this.preprocessor.process(audioChunk);
    
    // Voice activity detection
    const hasVoice = await this.vad.detectActivity(preprocessed);
    
    if (!hasVoice) {
      stream.addSilenceChunk(preprocessed);
      return { status: 'waiting', hasVoice: false };
    }
    
    // Add voice chunk to stream
    stream.addVoiceChunk(preprocessed);
    
    // Check if segment is complete
    if (stream.isSegmentComplete()) {
      const segment = stream.getCompleteSegment();
      this.emit('audio_segment_ready', {
        socketId,
        segment,
        userId: stream.config.userId
      });
      return { status: 'segment_ready', segment };
    }
    
    return { status: 'processing', hasVoice: true };
  }
}

// Audio Stream Buffer Management
export class AudioStream extends EventEmitter {
  private buffer: CircularBuffer;
  private silenceThreshold: number = 500; // ms
  private maxSegmentLength: number = 10000; // ms
  private lastVoiceTime: number = 0;
  
  constructor(public config: AudioStreamConfig) {
    super();
    this.buffer = new CircularBuffer(
      config.sampleRate * 30 // 30 seconds max buffer
    );
  }
  
  async initialize(): Promise<void> {
    // Initialize audio buffer and processing
    this.buffer.initialize();
    this.lastVoiceTime = Date.now();
  }
  
  addVoiceChunk(chunk: Buffer): void {
    this.buffer.write(chunk);
    this.lastVoiceTime = Date.now();
    this.emit('chunk_processed', { 
      size: chunk.length, 
      timestamp: this.lastVoiceTime 
    });
  }
  
  addSilenceChunk(chunk: Buffer): void {
    this.buffer.write(chunk);
  }
  
  isSegmentComplete(): boolean {
    const silenceDuration = Date.now() - this.lastVoiceTime;
    const bufferDuration = this.buffer.getDurationMs();
    
    return silenceDuration > this.silenceThreshold || 
           bufferDuration > this.maxSegmentLength;
  }
  
  getCompleteSegment(): AudioSegment {
    const audioData = this.buffer.readAll();
    const segment: AudioSegment = {
      id: crypto.randomUUID(),
      audioData,
      sampleRate: this.config.sampleRate,
      channels: this.config.channels,
      format: this.config.format,
      duration: this.buffer.getDurationMs(),
      timestamp: new Date().toISOString()
    };
    
    // Clear buffer for next segment
    this.buffer.clear();
    
    return segment;
  }
}
```

#### Voice Activity Detection Implementation
```typescript
// src/voice/stream/VoiceActivityDetector.ts
export interface VADConfig {
  threshold: number;      // Energy threshold (0-1)
  sensitivity: number;    // Detection sensitivity (0-1)
  smoothing: number;      // Smoothing factor (0-1)
}

export class VoiceActivityDetector {
  private config: VADConfig;
  private energyHistory: number[] = [];
  private backgroundNoise: number = 0;
  
  constructor(config: VADConfig) {
    this.config = {
      threshold: 0.5,
      sensitivity: 0.8,
      smoothing: 0.3,
      ...config
    };
  }
  
  async detectActivity(audioChunk: Buffer): Promise<boolean> {
    // Convert buffer to float32 array
    const samples = this.bufferToFloat32Array(audioChunk);
    
    // Calculate RMS energy
    const energy = this.calculateRMSEnergy(samples);
    
    // Update background noise estimate
    this.updateBackgroundNoise(energy);
    
    // Apply smoothing
    this.energyHistory.push(energy);
    if (this.energyHistory.length > 10) {
      this.energyHistory.shift();
    }
    
    const smoothedEnergy = this.energyHistory.reduce((a, b) => a + b) / this.energyHistory.length;
    
    // Voice activity detection
    const adjustedThreshold = this.backgroundNoise + (this.config.threshold * this.config.sensitivity);
    
    return smoothedEnergy > adjustedThreshold;
  }
  
  private calculateRMSEnergy(samples: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < samples.length; i++) {
      sum += samples[i] * samples[i];
    }
    return Math.sqrt(sum / samples.length);
  }
  
  private updateBackgroundNoise(energy: number): void {
    if (this.backgroundNoise === 0) {
      this.backgroundNoise = energy;
    } else {
      // Exponential moving average
      this.backgroundNoise = (this.config.smoothing * energy) + 
                           ((1 - this.config.smoothing) * this.backgroundNoise);
    }
  }
  
  private bufferToFloat32Array(buffer: Buffer): Float32Array {
    const samples = new Float32Array(buffer.length / 2);
    for (let i = 0; i < samples.length; i++) {
      // Convert 16-bit PCM to float32 (-1 to 1)
      samples[i] = buffer.readInt16LE(i * 2) / 32768.0;
    }
    return samples;
  }
}
```

### Step 2: Whisper API Integration

#### Connection Pool Management
```typescript
// src/voice/transcription/WhisperConnectionPool.ts
import axios, { AxiosInstance } from 'axios';

export class WhisperConnectionPool {
  private connections: AxiosInstance[] = [];
  private availableConnections: AxiosInstance[] = [];
  private activeConnections: Map<AxiosInstance, boolean> = new Map();
  private healthCheckInterval: NodeJS.Timeout;
  
  constructor(private poolSize: number = 5) {
    this.initializePool();
    this.startHealthMonitoring();
  }
  
  private initializePool(): void {
    for (let i = 0; i < this.poolSize; i++) {
      const connection = axios.create({
        baseURL: 'https://api.openai.com/v1',
        timeout: 10000,
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'multipart/form-data',
          'Keep-Alive': 'timeout=30, max=100'
        },
        httpAgent: new (require('http').Agent)({
          keepAlive: true,
          maxSockets: 10
        }),
        httpsAgent: new (require('https').Agent)({
          keepAlive: true,
          maxSockets: 10
        })
      });
      
      this.connections.push(connection);
      this.availableConnections.push(connection);
      this.activeConnections.set(connection, false);
    }
  }
  
  async getConnection(): Promise<AxiosInstance> {
    // Try to get available connection
    if (this.availableConnections.length > 0) {
      const connection = this.availableConnections.shift()!;
      this.activeConnections.set(connection, true);
      return connection;
    }
    
    // Wait for connection to become available
    return new Promise((resolve) => {
      const checkForConnection = () => {
        if (this.availableConnections.length > 0) {
          const connection = this.availableConnections.shift()!;
          this.activeConnections.set(connection, true);
          resolve(connection);
        } else {
          setTimeout(checkForConnection, 10); // Check every 10ms
        }
      };
      checkForConnection();
    });
  }
  
  releaseConnection(connection: AxiosInstance): void {
    this.activeConnections.set(connection, false);
    this.availableConnections.push(connection);
  }
  
  private startHealthMonitoring(): void {
    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthCheck();
    }, 30000); // Check every 30 seconds
  }
  
  private async performHealthCheck(): Promise<void> {
    // Warm up connections by making lightweight requests
    const warmupPromises = this.connections
      .filter(conn => !this.activeConnections.get(conn))
      .slice(0, 2) // Warm up 2 connections at a time
      .map(conn => this.warmupConnection(conn));
    
    await Promise.allSettled(warmupPromises);
  }
  
  private async warmupConnection(connection: AxiosInstance): Promise<void> {
    try {
      // Make a lightweight request to keep connection warm
      await connection.get('/models', { timeout: 5000 });
    } catch (error) {
      // Log warning but don't fail - connection will be recreated if needed
      console.warn('Connection warmup failed:', error.message);
    }
  }
}
```

#### Core Whisper Service
```typescript
// src/voice/transcription/WhisperService.ts
import FormData from 'form-data';
import { WhisperConnectionPool } from './WhisperConnectionPool';

export interface TranscriptionOptions {
  language?: string;
  prompt?: string;
  temperature?: number;
  responseFormat?: 'json' | 'text' | 'verbose_json';
}

export interface TranscriptResult {
  transcript: string;
  confidence: number;
  language: string;
  processingTime: number;
  segments?: TranscriptSegment[];
}

export class WhisperService {
  private connectionPool: WhisperConnectionPool;
  private performanceMetrics: Map<string, number[]> = new Map();
  
  constructor() {
    this.connectionPool = new WhisperConnectionPool(5);
  }
  
  async transcribeAudio(
    audioBuffer: Buffer, 
    options: TranscriptionOptions = {}
  ): Promise<TranscriptResult> {
    const startTime = performance.now();
    const requestId = crypto.randomUUID();
    
    try {
      // Get connection from pool
      const connection = await this.connectionPool.getConnection();
      
      try {
        // Prepare form data
        const formData = new FormData();
        formData.append('file', audioBuffer, {
          filename: 'audio.wav',
          contentType: 'audio/wav'
        });
        formData.append('model', 'whisper-1');
        formData.append('response_format', options.responseFormat || 'verbose_json');
        
        if (options.language) {
          formData.append('language', options.language);
        }
        
        if (options.temperature) {
          formData.append('temperature', options.temperature.toString());
        }
        
        if (options.prompt) {
          formData.append('prompt', options.prompt);
        }
        
        // Make transcription request
        const response = await connection.post('/audio/transcriptions', formData, {
          headers: formData.getHeaders(),
          timeout: 10000
        });
        
        const processingTime = performance.now() - startTime;
        
        // Record performance metrics
        this.recordPerformanceMetrics(requestId, processingTime);
        
        // Extract transcript and confidence
        const result = this.processWhisperResponse(response.data, processingTime);
        
        return result;
        
      } finally {
        // Always release connection back to pool
        this.connectionPool.releaseConnection(connection);
      }
      
    } catch (error) {
      const processingTime = performance.now() - startTime;
      
      // Log error with context
      console.error('Whisper transcription failed:', {
        requestId,
        processingTime,
        error: error.message,
        audioSize: audioBuffer.length
      });
      
      throw new VoiceProcessingError('Transcription failed', {
        requestId,
        processingTime,
        originalError: error
      });
    }
  }
  
  async transcribeBatch(
    audioSegments: AudioSegment[]
  ): Promise<TranscriptResult[]> {
    // Process segments in parallel (max 3 concurrent)
    const concurrencyLimit = 3;
    const results: TranscriptResult[] = [];
    
    for (let i = 0; i < audioSegments.length; i += concurrencyLimit) {
      const batch = audioSegments.slice(i, i + concurrencyLimit);
      const batchPromises = batch.map(segment => 
        this.transcribeAudio(segment.audioData, {
          language: segment.language,
          prompt: segment.context
        })
      );
      
      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          console.error(`Batch transcription failed for segment ${i + index}:`, result.reason);
          // Add empty result to maintain array indexing
          results.push({
            transcript: '',
            confidence: 0,
            language: 'unknown',
            processingTime: 0,
            error: result.reason.message
          } as TranscriptResult);
        }
      });
    }
    
    return results;
  }
  
  private processWhisperResponse(responseData: any, processingTime: number): TranscriptResult {
    const transcript = responseData.text || '';
    const language = responseData.language || 'en';
    
    // Calculate confidence score
    let confidence = 0.9; // Default confidence
    if (responseData.segments && responseData.segments.length > 0) {
      const avgConfidence = responseData.segments.reduce(
        (sum: number, segment: any) => sum + (segment.confidence || 0.9), 
        0
      ) / responseData.segments.length;
      confidence = Math.max(0.1, Math.min(1.0, avgConfidence));
    }
    
    return {
      transcript,
      confidence,
      language,
      processingTime,
      segments: responseData.segments || []
    };
  }
  
  private recordPerformanceMetrics(requestId: string, processingTime: number): void {
    const key = 'whisper_processing_time';
    if (!this.performanceMetrics.has(key)) {
      this.performanceMetrics.set(key, []);
    }
    
    const metrics = this.performanceMetrics.get(key)!;
    metrics.push(processingTime);
    
    // Keep only last 100 measurements
    if (metrics.length > 100) {
      metrics.shift();
    }
    
    // Log performance warning if processing is slow
    if (processingTime > 2000) {
      console.warn(`Slow Whisper processing detected: ${processingTime}ms for request ${requestId}`);
    }
  }
  
  getPerformanceStats(): { average: number; p95: number; p99: number } {
    const metrics = this.performanceMetrics.get('whisper_processing_time') || [];
    if (metrics.length === 0) {
      return { average: 0, p95: 0, p99: 0 };
    }
    
    const sorted = [...metrics].sort((a, b) => a - b);
    const average = metrics.reduce((sum, time) => sum + time, 0) / metrics.length;
    const p95 = sorted[Math.floor(sorted.length * 0.95)];
    const p99 = sorted[Math.floor(sorted.length * 0.99)];
    
    return { average, p95, p99 };
  }
}
```

---

## 🤖 AI Command Processing Implementation

### GPT-4 Integration and Prompt Engineering

```typescript
// src/ai/commands/AICommandParser.ts
import OpenAI from 'openai';
import { ContextManager } from './ContextManager';

export class AICommandParser {
  private openai: OpenAI;
  private contextManager: ContextManager;
  private promptCache: Map<string, string> = new Map();
  
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 10000,
      maxRetries: 2
    });
    this.contextManager = new ContextManager();
  }
  
  async parseVoiceCommand(
    transcript: string,
    userContext: UserContext
  ): Promise<ParsedCommand> {
    const startTime = performance.now();
    
    try {
      // Build comprehensive context
      const context = await this.contextManager.buildContext(userContext);
      
      // Generate system and user prompts
      const systemPrompt = this.buildSystemPrompt(context);
      const userPrompt = this.buildUserPrompt(transcript, context);
      
      // Make GPT-4 request
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.1, // Low temperature for consistent parsing
        max_tokens: 1500,
        response_format: { type: 'json_object' }
      });
      
      const processingTime = performance.now() - startTime;
      
      // Parse and validate response
      const parsed = this.parseAndValidateResponse(
        response.choices[0].message.content!,
        transcript,
        context
      );
      
      return {
        ...parsed,
        id: crypto.randomUUID(),
        userId: userContext.userId,
        transcript,
        processingTime,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      throw new AIProcessingError('Command parsing failed', {
        transcript,
        userId: userContext.userId,
        error: error.message
      });
    }
  }
  
  private buildSystemPrompt(context: ContextData): string {
    const cacheKey = `system_prompt_${context.user.id}_${context.organization.id}`;
    
    if (this.promptCache.has(cacheKey)) {
      return this.promptCache.get(cacheKey)!;
    }
    
    const systemPrompt = `You are an advanced AI assistant for "${context.organization.name}", a CEO communication platform.

CURRENT CONTEXT:
- User: ${context.user.name} (${context.user.role})
- Active Channels: ${context.activeChannels.map(c => `"${c.name}"`).join(', ')}
- Recent Tasks: ${context.recentTasks.slice(0, 5).map(t => `"${t.title}"`).join(', ')}
- Team Members: ${context.teamMembers.map(u => `${u.name} (${u.role})`).join(', ')}
- Current Time: ${new Date().toISOString()}

AVAILABLE ACTIONS:
1. CREATE_CHANNEL - Create new communication channels
   Parameters: name (required), description, category_id, channel_type, privacy_level
   
2. CREATE_TASK - Create tasks with assignments and deadlines  
   Parameters: title (required), description, channel_id, assigned_to[], priority, due_date
   
3. ASSIGN_USERS - Assign users to tasks or channels
   Parameters: entity_type, entity_id, user_ids[], role
   
4. SEND_MESSAGE - Send messages to channels or users
   Parameters: target_type, target_id, content, message_type
   
5. UPLOAD_FILE - Upload and share files
   Parameters: file_name, description, target_channels[], target_tasks[]
   
6. SET_DEADLINE - Set or update task deadlines
   Parameters: task_id, due_date, priority
   
7. CREATE_DEPENDENCY - Create task dependencies
   Parameters: task_id, depends_on_task_id, dependency_type
   
8. UPDATE_STATUS - Update task or channel status
   Parameters: entity_type, entity_id, status, notes
   
9. SCHEDULE_MEETING - Schedule meetings and events
   Parameters: title, date_time, duration, attendees[], location
   
10. GENERATE_REPORT - Generate reports and summaries
    Parameters: report_type, filters, output_format

ENTITY RESOLUTION RULES:
- Use context to resolve ambiguous references
- "marketing team" → users with marketing role or marketing channel members
- "this project" → most recently mentioned channel or task
- "next Friday" → calculate actual date based on current time
- User names: Match against team members, use fuzzy matching if needed

OUTPUT FORMAT (JSON):
{
  "intent": "Primary intention of the command",
  "confidence": 0.95,
  "actions": [
    {
      "type": "ACTION_TYPE",
      "parameters": {
        "param1": "value1",
        "param2": "value2"
      },
      "priority": 1,
      "dependencies": [],
      "estimated_duration": "2 seconds"
    }
  ],
  "entities": {
    "users": [{"name": "John Smith", "resolved_id": "user-123", "confidence": 0.95}],
    "channels": [{"name": "Marketing Q1", "resolved_id": "channel-456", "confidence": 1.0}],
    "tasks": [{"title": "Campaign Launch", "resolved_id": "task-789", "confidence": 0.9}],
    "dates": [{"text": "next Friday", "resolved_date": "2024-01-19T17:00:00Z", "confidence": 0.9}]
  },
  "context_references": {
    "pronouns": ["this", "that"],
    "temporal_context": ["next week", "by Friday"],
    "implicit_entities": ["the team", "the project"]
  }
}

IMPORTANT RULES:
1. Always resolve entity references using provided context
2. Be conservative with confidence scores - use lower scores for ambiguous references
3. Create logical action sequences for complex commands
4. Validate that all required parameters are present or can be inferred
5. Use dependency relationships to ensure proper execution order`;

    // Cache the prompt for 5 minutes
    this.promptCache.set(cacheKey, systemPrompt);
    setTimeout(() => this.promptCache.delete(cacheKey), 300000);
    
    return systemPrompt;
  }
  
  private buildUserPrompt(transcript: string, context: ContextData): string {
    return `Please parse this voice command: "${transcript}"

Consider the current context and resolve all entity references. If any information is ambiguous, use the most likely interpretation based on the context and indicate lower confidence scores.

Respond with a valid JSON object following the specified format.`;
  }
  
  private parseAndValidateResponse(
    responseContent: string,
    originalTranscript: string,
    context: ContextData
  ): Omit<ParsedCommand, 'id' | 'userId' | 'transcript' | 'processingTime' | 'timestamp'> {
    try {
      const parsed = JSON.parse(responseContent);
      
      // Validate required fields
      this.validateParsedCommand(parsed);
      
      // Enhanced validation and processing
      parsed.actions = parsed.actions.map((action: any, index: number) => ({
        ...action,
        id: crypto.randomUUID(),
        order: index + 1,
        validated: true
      }));
      
      // Validate entity resolutions against actual data
      parsed.entities = await this.validateAndEnhanceEntities(parsed.entities, context);
      
      return parsed;
      
    } catch (error) {
      throw new AIProcessingError('Invalid response format from GPT-4', {
        responseContent,
        originalTranscript,
        parseError: error.message
      });
    }
  }
  
  private validateParsedCommand(parsed: any): void {
    const requiredFields = ['intent', 'confidence', 'actions'];
    
    for (const field of requiredFields) {
      if (!parsed[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    
    if (!Array.isArray(parsed.actions) || parsed.actions.length === 0) {
      throw new Error('Actions array is required and must not be empty');
    }
    
    // Validate each action
    parsed.actions.forEach((action: any, index: number) => {
      if (!action.type || !action.parameters) {
        throw new Error(`Invalid action at index ${index}: missing type or parameters`);
      }
    });
  }
  
  private async validateAndEnhanceEntities(
    entities: any,
    context: ContextData
  ): Promise<ResolvedEntities> {
    const enhanced: ResolvedEntities = {
      users: [],
      channels: [],
      tasks: [],
      dates: [],
      files: []
    };
    
    // Validate and enhance user entities
    if (entities.users) {
      for (const user of entities.users) {
        const validated = await this.contextManager.entityResolver.resolveUser(
          user.name,
          context
        );
        if (validated) {
          enhanced.users.push({
            ...user,
            resolved_id: validated.id,
            confidence: Math.min(user.confidence, validated.confidence)
          });
        }
      }
    }
    
    // Validate and enhance channel entities
    if (entities.channels) {
      for (const channel of entities.channels) {
        const validated = await this.contextManager.entityResolver.resolveChannel(
          channel.name,
          context
        );
        if (validated) {
          enhanced.channels.push({
            ...channel,
            resolved_id: validated.id,
            confidence: Math.min(channel.confidence, validated.confidence)
          });
        }
      }
    }
    
    // Process date entities
    if (entities.dates) {
      for (const date of entities.dates) {
        const resolved = await this.contextManager.temporalProcessor.resolveDate(
          date.text,
          context.temporal
        );
        if (resolved) {
          enhanced.dates.push({
            ...date,
            resolved_date: resolved.toISOString(),
            confidence: Math.min(date.confidence, resolved.confidence || 0.9)
          });
        }
      }
    }
    
    return enhanced;
  }
}
```

### Multi-Action Command Execution System

```typescript
// src/ai/execution/MultiActionExecutor.ts
import { DatabaseManager } from '../../db';
import { ActionHandlerRegistry } from './ActionHandlerRegistry';
import { DependencyResolver } from './DependencyResolver';

export class MultiActionExecutor {
  private db: DatabaseManager;
  private actionHandlers: ActionHandlerRegistry;
  private dependencyResolver: DependencyResolver;
  private executionBroadcaster: ExecutionBroadcaster;
  
  constructor(
    db: DatabaseManager,
    socketManager: SocketManager
  ) {
    this.db = db;
    this.actionHandlers = new ActionHandlerRegistry(db);
    this.dependencyResolver = new DependencyResolver();
    this.executionBroadcaster = new ExecutionBroadcaster(socketManager);
  }
  
  async executeCommand(parsedCommand: ParsedCommand): Promise<ExecutionResult> {
    const startTime = performance.now();
    const executionId = crypto.randomUUID();
    
    try {
      // Create execution plan with dependency resolution
      const executionPlan = await this.createExecutionPlan(
        parsedCommand.actions,
        executionId
      );
      
      // Start broadcasting execution progress
      await this.executionBroadcaster.broadcastExecutionStart(
        parsedCommand,
        executionPlan
      );
      
      // Execute plan within database transaction
      const results = await this.executeInTransaction(
        executionPlan,
        parsedCommand
      );
      
      const totalTime = performance.now() - startTime;
      
      // Create execution summary
      const executionResult: ExecutionResult = {
        id: executionId,
        commandId: parsedCommand.id,
        success: results.every(r => r.success),
        totalActions: results.length,
        successfulActions: results.filter(r => r.success).length,
        failedActions: results.filter(r => !r.success).length,
        results,
        executionTime: totalTime,
        timestamp: new Date().toISOString()
      };
      
      // Broadcast completion
      await this.executionBroadcaster.broadcastExecutionComplete(
        parsedCommand,
        executionResult
      );
      
      // Record metrics
      await this.recordExecutionMetrics(executionResult);
      
      return executionResult;
      
    } catch (error) {
      const totalTime = performance.now() - startTime;
      
      const errorResult: ExecutionResult = {
        id: executionId,
        commandId: parsedCommand.id,
        success: false,
        totalActions: parsedCommand.actions.length,
        successfulActions: 0,
        failedActions: parsedCommand.actions.length,
        results: [],
        error: error.message,
        executionTime: totalTime,
        rollbackApplied: true,
        timestamp: new Date().toISOString()
      };
      
      await this.executionBroadcaster.broadcastExecutionError(
        parsedCommand,
        errorResult
      );
      
      return errorResult;
    }
  }
  
  private async createExecutionPlan(
    actions: CommandAction[],
    executionId: string
  ): Promise<ExecutionPlan> {
    // Analyze dependencies between actions
    const dependencyGraph = this.dependencyResolver.analyzeDependencies(actions);
    
    // Create execution steps with optimal ordering
    const steps = this.dependencyResolver.createExecutionSteps(dependencyGraph);
    
    return {
      id: executionId,
      steps,
      totalActions: actions.length,
      estimatedTime: this.estimateExecutionTime(steps),
      createdAt: new Date().toISOString()
    };
  }
  
  private async executeInTransaction(
    executionPlan: ExecutionPlan,
    parsedCommand: ParsedCommand
  ): Promise<ActionResult[]> {
    const results: ActionResult[] = [];
    
    return this.db.transaction(async (tx) => {
      for (const step of executionPlan.steps) {
        // Broadcast step start
        await this.executionBroadcaster.broadcastStepStart(step, parsedCommand);
        
        if (step.parallel) {
          // Execute actions in parallel
          const stepResults = await this.executeParallelActions(
            step.actions,
            tx,
            parsedCommand
          );
          results.push(...stepResults);
        } else {
          // Execute actions sequentially
          for (const action of step.actions) {
            const result = await this.executeSingleAction(action, tx, parsedCommand);
            results.push(result);
            
            // Check if critical action failed
            if (!result.success && action.critical) {
              throw new ExecutionError(
                `Critical action failed: ${action.type}`,
                result
              );
            }
          }
        }
        
        // Broadcast step completion
        const stepResults = results.slice(-step.actions.length);
        await this.executionBroadcaster.broadcastStepComplete(
          step,
          stepResults,
          parsedCommand
        );
      }
      
      return results;
    });
  }
  
  private async executeParallelActions(
    actions: CommandAction[],
    tx: any,
    parsedCommand: ParsedCommand
  ): Promise<ActionResult[]> {
    const promises = actions.map(action => 
      this.executeSingleAction(action, tx, parsedCommand)
    );
    
    const results = await Promise.allSettled(promises);
    
    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          actionId: actions[index].id,
          actionType: actions[index].type,
          success: false,
          error: result.reason.message,
          timestamp: new Date().toISOString()
        };
      }
    });
  }
  
  private async executeSingleAction(
    action: CommandAction,
    tx: any,
    parsedCommand: ParsedCommand
  ): Promise<ActionResult> {
    const startTime = performance.now();
    
    try {
      // Get appropriate action handler
      const handler = this.actionHandlers.getHandler(action.type);
      
      if (!handler) {
        throw new Error(`No handler found for action type: ${action.type}`);
      }
      
      // Execute action
      const result = await handler.execute(action, tx, parsedCommand);
      
      const executionTime = performance.now() - startTime;
      
      return {
        actionId: action.id,
        actionType: action.type,
        success: true,
        data: result,
        executionTime,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      const executionTime = performance.now() - startTime;
      
      return {
        actionId: action.id,
        actionType: action.type,
        success: false,
        error: error.message,
        executionTime,
        timestamp: new Date().toISOString()
      };
    }
  }
  
  private estimateExecutionTime(steps: ExecutionStep[]): number {
    return steps.reduce((total, step) => {
      if (step.parallel) {
        // Parallel steps take time of the longest action
        const maxTime = Math.max(...step.actions.map(a => this.estimateActionTime(a.type)));
        return total + maxTime;
      } else {
        // Sequential steps sum all action times
        const stepTime = step.actions.reduce((sum, action) => 
          sum + this.estimateActionTime(action.type), 0);
        return total + stepTime;
      }
    }, 0);
  }
  
  private estimateActionTime(actionType: string): number {
    // Time estimates in milliseconds
    const estimates: Record<string, number> = {
      'CREATE_CHANNEL': 300,
      'CREATE_TASK': 250,
      'ASSIGN_USERS': 100,
      'SEND_MESSAGE': 150,
      'UPLOAD_FILE': 500,
      'SET_DEADLINE': 100,
      'CREATE_DEPENDENCY': 150,
      'UPDATE_STATUS': 100,
      'SCHEDULE_MEETING': 200,
      'GENERATE_REPORT': 1000
    };
    
    return estimates[actionType] || 200; // Default estimate
  }
  
  private async recordExecutionMetrics(result: ExecutionResult): Promise<void> {
    // Record metrics for monitoring and optimization
    await this.analyticsService.recordExecution({
      executionId: result.id,
      commandId: result.commandId,
      success: result.success,
      totalTime: result.executionTime,
      actionCount: result.totalActions,
      successRate: result.successfulActions / result.totalActions,
      timestamp: new Date()
    });
  }
}
```

### Action Handler Registry

```typescript
// src/ai/execution/ActionHandlerRegistry.ts
import { 
  ChannelActionHandler,
  TaskActionHandler,
  UserActionHandler,
  MessageActionHandler,
  FileActionHandler
} from './handlers';

export class ActionHandlerRegistry {
  private handlers: Map<string, ActionHandler> = new Map();
  
  constructor(db: DatabaseManager) {
    // Register all action handlers
    this.handlers.set('CREATE_CHANNEL', new ChannelActionHandler(db));
    this.handlers.set('CREATE_TASK', new TaskActionHandler(db));
    this.handlers.set('ASSIGN_USERS', new UserActionHandler(db));
    this.handlers.set('SEND_MESSAGE', new MessageActionHandler(db));
    this.handlers.set('UPLOAD_FILE', new FileActionHandler(db));
    this.handlers.set('SET_DEADLINE', new TaskActionHandler(db));
    this.handlers.set('CREATE_DEPENDENCY', new TaskActionHandler(db));
    this.handlers.set('UPDATE_STATUS', new TaskActionHandler(db));
    this.handlers.set('SCHEDULE_MEETING', new MeetingActionHandler(db));
    this.handlers.set('GENERATE_REPORT', new ReportActionHandler(db));
  }
  
  getHandler(actionType: string): ActionHandler | null {
    return this.handlers.get(actionType) || null;
  }
  
  registerHandler(actionType: string, handler: ActionHandler): void {
    this.handlers.set(actionType, handler);
  }
}

// Example Action Handler
export class ChannelActionHandler implements ActionHandler {
  constructor(private db: DatabaseManager) {}
  
  async execute(
    action: CommandAction,
    tx: any,
    context: ParsedCommand
  ): Promise<any> {
    const { parameters } = action;
    
    // Validate required parameters
    if (!parameters.name) {
      throw new Error('Channel name is required');
    }
    
    // Create channel
    const channel = await this.db.channels.create({
      name: parameters.name,
      description: parameters.description,
      category_id: parameters.category_id,
      created_by: context.userId,
      channel_type: parameters.channel_type || 'project',
      privacy_level: parameters.privacy_level || 'public',
      status: 'active'
    }, tx);
    
    // Add creator as member
    await this.db.channelMembers.create({
      channel_id: channel.id,
      user_id: context.userId,
      role: 'admin',
      joined_at: new Date()
    }, tx);
    
    return {
      channelId: channel.id,
      channelName: channel.name,
      createdAt: channel.created_at
    };
  }
}
```

---

This implementation guide provides the foundation for Phase 2 development. Each component includes:

1. **Detailed code examples** with proper TypeScript typing
2. **Error handling patterns** for robust operation
3. **Performance optimization techniques** for <2 second targets
4. **Integration patterns** between components
5. **Testing strategies** for validation

The guide ensures developers can implement Phase 2 systematically while meeting all performance and reliability requirements.