/**
 * API Routes Index
 * Centralized registration of all API endpoints
 */

import { FastifyInstance } from 'fastify';
import { registerUserRoutes } from './routes/UserRoutes';
import { registerChannelRoutes } from './routes/ChannelRoutes';
import { registerTaskRoutes } from './routes/TaskRoutes';
import { registerDocsRoutes } from './routes/DocsRoutes';
import { logger } from '@utils/logger';

/**
 * Register all API routes
 */
export const registerAPIRoutes = async (fastify: FastifyInstance): Promise<void> => {
  try {
    // Register route modules
    await fastify.register(registerUserRoutes);
    await fastify.register(registerChannelRoutes);
    await fastify.register(registerTaskRoutes);
    await fastify.register(registerDocsRoutes);

    logger.info('All API routes registered successfully');
  } catch (error) {
    logger.error({ error }, 'Failed to register API routes');
    throw error;
  }
};

export default registerAPIRoutes;