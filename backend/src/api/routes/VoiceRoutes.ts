/**
 * Voice Processing API Routes
 * Handles voice command processing and transcription
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authenticateToken } from '../../auth/middleware';
import { VoiceProcessingService } from '../../voice/VoiceProcessingService';
import { UserContext } from '../../voice/types';
import { logger } from '../../utils/logger';

const voiceProcessingService = new VoiceProcessingService();

interface VoiceProcessRequest extends FastifyRequest {
  body: {
    transcript: string;
    language?: string;
  };
}

interface AudioProcessRequest extends FastifyRequest {
  file: any;
}

export const registerVoiceRoutes = async (fastify: FastifyInstance): Promise<void> => {
  // Process voice command from text transcript
  fastify.post('/voice/process', {
    preHandler: authenticateToken,
    schema: {
      body: {
        type: 'object',
        required: ['transcript'],
        properties: {
          transcript: { type: 'string', minLength: 1 },
          language: { type: 'string' }
        }
      }
    }
  }, async (request: VoiceProcessRequest, reply: FastifyReply) => {
    try {
      const { transcript, language } = request.body;
      const userId = (request as any).user.id;
      const userRole = (request as any).user.role;

      logger.info('Processing voice command from transcript', {
        userId,
        transcript: transcript.substring(0, 100) + '...',
        language
      });

      // Create user context
      const userContext: UserContext = {
        userId,
        role: userRole,
        language: language || 'en-US',
        organizationId: (request as any).user.organizationId,
        timezone: (request as any).user.timezone || 'UTC'
      };

      // For text-based processing, we'll use a mock audio buffer
      // In a real implementation, this would come from actual audio
      const mockAudioBuffer = Buffer.from(transcript, 'utf-8');

      const result = await voiceProcessingService.processAndExecuteVoiceCommand(
        mockAudioBuffer,
        userContext,
        {
          enableCaching: true,
          maxProcessingTime: 10000,
          qualityThreshold: 0.7
        }
      );

      if (!result.success) {
        return reply.status(400).send({
          success: false,
          error: result.error,
          metrics: result.metrics
        });
      }

      logger.info('Voice command processed successfully', {
        userId,
        commandId: result.command?.id,
        intent: result.command?.intent,
        actionCount: result.command?.actions?.length,
        executionSuccess: result.executionResult?.success
      });

      return reply.send({
        success: true,
        command: result.command,
        executionResult: result.executionResult,
        metrics: {
          processingTime: result.metrics.totalTime,
          transcriptionTime: result.metrics.transcriptionTime,
          executionTime: result.metrics.executionTime,
          accuracy: result.metrics.accuracy
        }
      });

    } catch (error) {
      logger.error('Voice command processing failed', {
        userId: (request as any).user?.id,
        error: error instanceof Error ? error.message : String(error)
      });

      return reply.status(500).send({
        success: false,
        error: 'Internal server error processing voice command'
      });
    }
  });

  // Process audio file (for future enhancement)
  fastify.post('/voice/process-audio', {
    preHandler: authenticateToken
  }, async (request: AudioProcessRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.id;
      
      // For now, return not implemented
      return reply.status(501).send({
        success: false,
        error: 'Audio file processing not yet implemented'
      });

    } catch (error) {
      logger.error('Audio processing failed', {
        userId: (request as any).user?.id,
        error: error instanceof Error ? error.message : String(error)
      });

      return reply.status(500).send({
        success: false,
        error: 'Internal server error processing audio'
      });
    }
  });

  // Get voice processing health status
  fastify.get('/voice/health', {
    preHandler: authenticateToken
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const healthStatus = voiceProcessingService.getHealthStatus();
      const performanceStats = voiceProcessingService.getPerformanceStatistics();

      return reply.send({
        success: true,
        health: healthStatus,
        performance: performanceStats
      });

    } catch (error) {
      logger.error('Voice health check failed', {
        error: error instanceof Error ? error.message : String(error)
      });

      return reply.status(500).send({
        success: false,
        error: 'Failed to get voice service health status'
      });
    }
  });

  logger.debug('Voice routes registered');
};