import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Type } from '@sinclair/typebox';
import { channelRepository } from '@db/index';
import { logger, loggers } from '@utils/logger';
import {
  ValidationError,
  NotFoundError,
  AuthorizationError,
  formatErrorResponse,
  createErrorContext,
} from '@utils/errors';
import {
  authenticate,
  authorize,
  authorizeRoles,
  requireChannelAccess,
  apiRateLimit,
} from '@auth/middleware';
import { cacheService } from '../../services/CacheService';
import { Cacheable, CacheEvict, CacheKeyUtils } from '@utils/cache-decorators';
import { WebSocketUtils } from '@websocket/utils';
import {
  UUIDSchema,
  PaginationSchema,
  ChannelTypeSchema,
  ChannelPrivacySchema,
  SuccessResponseSchema,
} from '@utils/validation';

/**
 * Channel Management API Routes
 * Enterprise-grade channel CRUD operations with real-time updates
 */

// Request/Response Schemas
const CreateChannelSchema = Type.Object({
  name: Type.String({ minLength: 1, maxLength: 100 }),
  description: Type.Optional(Type.String({ maxLength: 500 })),
  type: ChannelTypeSchema,
  privacy: ChannelPrivacySchema,
  parent_id: Type.Optional(UUIDSchema),
  settings: Type.Optional(Type.Record(Type.String(), Type.Any())),
  tags: Type.Optional(Type.Array(Type.String({ maxLength: 50 }))),
  color: Type.Optional(Type.String({ pattern: '^#[0-9A-Fa-f]{6}$' })),
});

const UpdateChannelSchema = Type.Object({
  name: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
  description: Type.Optional(Type.String({ maxLength: 500 })),
  type: Type.Optional(ChannelTypeSchema),
  privacy: Type.Optional(ChannelPrivacySchema),
  settings: Type.Optional(Type.Record(Type.String(), Type.Any())),
  tags: Type.Optional(Type.Array(Type.String({ maxLength: 50 }))),
  color: Type.Optional(Type.String({ pattern: '^#[0-9A-Fa-f]{6}$' })),
});

const ChannelMemberSchema = Type.Object({
  user_id: UUIDSchema,
  role: Type.Union([
    Type.Literal('owner'),
    Type.Literal('admin'),
    Type.Literal('member'),
    Type.Literal('viewer'),
  ]),
  joined_at: Type.String({ format: 'date-time' }),
});

const ChannelResponseSchema = Type.Object({
  id: UUIDSchema,
  name: Type.String(),
  description: Type.Optional(Type.String()),
  type: ChannelTypeSchema,
  privacy: ChannelPrivacySchema,
  parent_id: Type.Optional(UUIDSchema),
  created_by: UUIDSchema,
  settings: Type.Optional(Type.Record(Type.String(), Type.Any())),
  tags: Type.Array(Type.String()),
  color: Type.Optional(Type.String()),
  member_count: Type.Integer(),
  message_count: Type.Integer(),
  last_activity: Type.Optional(Type.String({ format: 'date-time' })),
  created_at: Type.String({ format: 'date-time' }),
  updated_at: Type.String({ format: 'date-time' }),
});

/**
 * Channel service with caching
 */
class ChannelService {
  @Cacheable({
    ttl: 1800, // 30 minutes
    namespace: 'channels',
    keyGenerator: (channelId: string) => CacheKeyUtils.channelKey(channelId),
  })
  async getChannelById(channelId: string) {
    return await channelRepository.findById(channelId);
  }

  @CacheEvict({
    keys: (channelId: string) => [CacheKeyUtils.channelKey(channelId)],
    namespace: 'channels',
  })
  async updateChannel(channelId: string, updateData: any) {
    return await channelRepository.update(channelId, updateData);
  }

  @CacheEvict({
    allEntries: true,
    namespace: 'channels',
  })
  async createChannel(channelData: any) {
    return await channelRepository.create(channelData);
  }
}

const channelService = new ChannelService();

/**
 * Register channel routes
 */
export const registerChannelRoutes = async (fastify: FastifyInstance) => {
  /**
   * GET /channels - List channels accessible to user
   */
  fastify.get<{
    Querystring: typeof PaginationSchema.static & {
      type?: string;
      privacy?: string;
      parent_id?: string;
      search?: string;
    };
  }>(
    '/channels',
    {
      preHandler: [authenticate, apiRateLimit],
      schema: {
        querystring: Type.Intersect([
          PaginationSchema,
          Type.Object({
            type: Type.Optional(ChannelTypeSchema),
            privacy: Type.Optional(ChannelPrivacySchema),
            parent_id: Type.Optional(UUIDSchema),
            search: Type.Optional(Type.String({ maxLength: 100 })),
          }),
        ]),
        response: {
          200: Type.Object({
            success: Type.Boolean(),
            data: Type.Array(ChannelResponseSchema),
            pagination: Type.Object({
              total: Type.Integer(),
              limit: Type.Integer(),
              offset: Type.Integer(),
              hasMore: Type.Boolean(),
            }),
            timestamp: Type.String({ format: 'date-time' }),
          }),
        },
      },
    },
    async (request, reply) => {
      try {
        const { limit = 20, offset = 0, type, privacy, parent_id, search } = request.query;

        // Build filters
        const filters: any = {};
        if (type) filters.type = type;
        if (privacy) filters.privacy = privacy;
        if (parent_id) filters.parent_id = parent_id;
        if (search) filters.search = search;

        // Get channels user has access to
        const result = await channelRepository.findUserChannels(request.user!.userId);

        loggers.api.info(
          {
            userId: request.user?.userId,
            filters,
            resultCount: result.length,
          },
          'Channels list retrieved'
        );

        reply.send({
          success: true,
          data: result,
          pagination: {
            total: result.length,
            limit,
            offset,
            hasMore: false,
          },
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        const context = createErrorContext({
          ...(request.user && {
            user: {
              id: request.user.id,
              email: request.user.email,
              role: request.user.role,
            },
          }),
          ip: request.ip,
          method: request.method,
          url: request.url,
          headers: request.headers as Record<string, string | string[] | undefined>,
        });
        loggers.api.error({ error, context }, 'Failed to retrieve channels');

        reply.code(500).send({
          error: {
            message: 'Failed to retrieve channels',
            code: 'SERVER_ERROR',
          },
        });
      }
    }
  );

  /**
   * GET /channels/:id - Get channel details
   */
  fastify.get<{
    Params: { id: string };
  }>(
    '/channels/:id',
    {
      preHandler: [authenticate, requireChannelAccess],
      schema: {
        params: Type.Object({
          id: UUIDSchema,
        }),
        response: {
          200: Type.Object({
            success: Type.Boolean(),
            data: ChannelResponseSchema,
            timestamp: Type.String({ format: 'date-time' }),
          }),
        },
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params;

        const channel = await channelService.getChannelById(id);
        if (!channel) {
          throw new NotFoundError('Channel not found');
        }

        loggers.api.info(
          {
            userId: request.user?.userId,
            channelId: id,
          },
          'Channel details retrieved'
        );

        reply.send({
          success: true,
          data: channel,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        const context = createErrorContext({
          ...(request.user && {
            user: {
              id: request.user.id,
              email: request.user.email,
              role: request.user.role,
            },
          }),
          ip: request.ip,
          method: request.method,
          url: request.url,
          headers: request.headers as Record<string, string | string[] | undefined>,
        });
        loggers.api.error({ error, context }, 'Failed to retrieve channel');

        if (error instanceof NotFoundError) {
          reply.code(404).send(formatErrorResponse(error));
        } else {
          reply.code(500).send({
            error: {
              message: 'Failed to retrieve channel',
              code: 'SERVER_ERROR',
            },
          });
        }
      }
    }
  );

  /**
   * POST /channels - Create new channel
   */
  fastify.post<{
    Body: typeof CreateChannelSchema.static;
  }>(
    '/channels',
    {
      preHandler: [authenticate, authorize('channels:create')],
      schema: {
        body: CreateChannelSchema,
        response: {
          201: Type.Object({
            success: Type.Boolean(),
            data: ChannelResponseSchema,
            timestamp: Type.String({ format: 'date-time' }),
          }),
        },
      },
    },
    async (request, reply) => {
      try {
        const channelData = {
          ...request.body,
          created_by: request.user!.userId,
          tags: request.body.tags || [],
          settings: request.body.settings || {},
          member_count: 1,
          message_count: 0,
        };

        const channel = await channelService.createChannel(channelData);

        // Add creator as owner
        await channelRepository.addMember(channel.id, request.user!.userId, 'owner');

        // Broadcast channel creation
        await WebSocketUtils.broadcastChannelMessage({
          type: 'chat_message',
          channelId: channel.id,
          messageId: `system_${Date.now()}`,
          message: `Channel "${channel.name}" created`,
          messageType: 'system',
          userId: request.user!.userId,
          userName: request.user!.name,
          userRole: request.user!.role,
        });

        loggers.api.info(
          {
            userId: request.user?.userId,
            channelId: channel.id,
            channelName: channel.name,
            channelType: channel.channel_type,
          },
          'Channel created successfully'
        );

        reply.code(201).send({
          success: true,
          data: channel,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        const context = createErrorContext({
          ...(request.user && {
            user: {
              id: request.user.id,
              email: request.user.email,
              role: request.user.role,
            },
          }),
          ip: request.ip,
          method: request.method,
          url: request.url,
          headers: request.headers as Record<string, string | string[] | undefined>,
        });
        loggers.api.error({ error, context }, 'Failed to create channel');

        if (error instanceof ValidationError) {
          reply.code(400).send(formatErrorResponse(error));
        } else {
          reply.code(500).send({
            error: {
              message: 'Failed to create channel',
              code: 'SERVER_ERROR',
            },
          });
        }
      }
    }
  );

  /**
   * PUT /channels/:id - Update channel
   */
  fastify.put<{
    Params: { id: string };
    Body: typeof UpdateChannelSchema.static;
  }>(
    '/channels/:id',
    {
      preHandler: [authenticate, requireChannelAccess, authorize('channels:update')],
      schema: {
        params: Type.Object({
          id: UUIDSchema,
        }),
        body: UpdateChannelSchema,
        response: {
          200: Type.Object({
            success: Type.Boolean(),
            data: ChannelResponseSchema,
            timestamp: Type.String({ format: 'date-time' }),
          }),
        },
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params;
        const updateData = request.body;

        const channel = await channelService.updateChannel(id, updateData);

        // Broadcast channel update
        await WebSocketUtils.sendToChannel(id, 'channel_updated', {
          type: 'channel_updated',
          channelId: id,
          updates: updateData,
          userId: request.user!.userId,
          userName: request.user!.name,
          userRole: request.user!.role,
          timestamp: new Date().toISOString(),
        });

        loggers.api.info(
          {
            userId: request.user?.userId,
            channelId: id,
            updatedFields: Object.keys(updateData),
          },
          'Channel updated successfully'
        );

        reply.send({
          success: true,
          data: channel,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        const context = createErrorContext({
          ...(request.user && {
            user: {
              id: request.user.id,
              email: request.user.email,
              role: request.user.role,
            },
          }),
          ip: request.ip,
          method: request.method,
          url: request.url,
          headers: request.headers as Record<string, string | string[] | undefined>,
        });
        loggers.api.error({ error, context }, 'Failed to update channel');

        if (error instanceof NotFoundError) {
          reply.code(404).send(formatErrorResponse(error));
        } else if (error instanceof ValidationError) {
          reply.code(400).send(formatErrorResponse(error));
        } else {
          reply.code(500).send({
            error: {
              message: 'Failed to update channel',
              code: 'SERVER_ERROR',
            },
          });
        }
      }
    }
  );

  /**
   * DELETE /channels/:id - Delete channel
   */
  fastify.delete<{
    Params: { id: string };
  }>(
    '/channels/:id',
    {
      preHandler: [authenticate, requireChannelAccess, authorize('channels:delete')],
      schema: {
        params: Type.Object({
          id: UUIDSchema,
        }),
        response: {
          200: SuccessResponseSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params;

        const success = await channelRepository.softDelete(id, request.user!.userId);
        if (!success) {
          throw new NotFoundError('Channel not found');
        }

        // Clear channel cache
        await cacheService.channels.delete(CacheKeyUtils.channelKey(id));

        // Broadcast channel deletion
        await WebSocketUtils.sendToChannel(id, 'channel_deleted', {
          type: 'channel_deleted',
          channelId: id,
          userId: request.user!.userId,
          userName: request.user!.name,
          userRole: request.user!.role,
          timestamp: new Date().toISOString(),
        });

        loggers.api.info(
          {
            userId: request.user?.userId,
            channelId: id,
          },
          'Channel deleted successfully'
        );

        reply.send({
          success: true,
          message: 'Channel deleted successfully',
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        const context = createErrorContext({
          ...(request.user && {
            user: {
              id: request.user.id,
              email: request.user.email,
              role: request.user.role,
            },
          }),
          ip: request.ip,
          method: request.method,
          url: request.url,
          headers: request.headers as Record<string, string | string[] | undefined>,
        });
        loggers.api.error({ error, context }, 'Failed to delete channel');

        if (error instanceof NotFoundError) {
          reply.code(404).send(formatErrorResponse(error));
        } else {
          reply.code(500).send({
            error: {
              message: 'Failed to delete channel',
              code: 'SERVER_ERROR',
            },
          });
        }
      }
    }
  );

  /**
   * GET /channels/:id/members - Get channel members
   */
  fastify.get<{
    Params: { id: string };
    Querystring: typeof PaginationSchema.static;
  }>(
    '/channels/:id/members',
    {
      preHandler: [authenticate, requireChannelAccess],
      schema: {
        params: Type.Object({
          id: UUIDSchema,
        }),
        querystring: PaginationSchema,
        response: {
          200: Type.Object({
            success: Type.Boolean(),
            data: Type.Array(ChannelMemberSchema),
            pagination: Type.Object({
              total: Type.Integer(),
              limit: Type.Integer(),
              offset: Type.Integer(),
              hasMore: Type.Boolean(),
            }),
            timestamp: Type.String({ format: 'date-time' }),
          }),
        },
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params;
        const { limit = 50, offset = 0 } = request.query;

        const members = await channelRepository.getMembers(id);
        const result = {
          data: members.slice(offset, offset + limit),
          total: members.length,
        };

        reply.send({
          success: true,
          data: result.data,
          pagination: {
            total: result.total,
            limit,
            offset,
            hasMore: offset + limit < result.total,
          },
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        const context = createErrorContext({
          ...(request.user && {
            user: {
              id: request.user.id,
              email: request.user.email,
              role: request.user.role,
            },
          }),
          ip: request.ip,
          method: request.method,
          url: request.url,
          headers: request.headers as Record<string, string | string[] | undefined>,
        });
        loggers.api.error({ error, context }, 'Failed to retrieve channel members');

        reply.code(500).send({
          error: {
            message: 'Failed to retrieve channel members',
            code: 'SERVER_ERROR',
          },
        });
      }
    }
  );

  /**
   * POST /channels/:id/members - Add member to channel
   */
  fastify.post<{
    Params: { id: string };
    Body: {
      user_id: string;
      role?: 'admin' | 'member' | 'viewer';
    };
  }>(
    '/channels/:id/members',
    {
      preHandler: [authenticate, requireChannelAccess, authorize('channels:manage_members')],
      schema: {
        params: Type.Object({
          id: UUIDSchema,
        }),
        body: Type.Object({
          user_id: UUIDSchema,
          role: Type.Optional(
            Type.Union([Type.Literal('admin'), Type.Literal('member'), Type.Literal('viewer')])
          ),
        }),
        response: {
          200: SuccessResponseSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params;
        const { user_id, role = 'member' } = request.body;

        const success = await channelRepository.addMember(id, user_id, role);
        if (!success) {
          throw new ValidationError('Failed to add member to channel', []);
        }

        // Broadcast member addition
        await WebSocketUtils.sendToChannel(id, 'user_joined_channel', {
          type: 'user_joined_channel',
          channelId: id,
          userId: user_id,
          userName: '', // TODO: Get user name
          userRole: request.user!.role,
          memberCount: (await channelRepository.getMembers(id)).length,
          timestamp: new Date().toISOString(),
        });

        loggers.api.info(
          {
            userId: request.user?.userId,
            channelId: id,
            addedUserId: user_id,
            memberRole: role,
          },
          'Member added to channel'
        );

        reply.send({
          success: true,
          message: 'Member added successfully',
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        const context = createErrorContext({
          ...(request.user && {
            user: {
              id: request.user.id,
              email: request.user.email,
              role: request.user.role,
            },
          }),
          ip: request.ip,
          method: request.method,
          url: request.url,
          headers: request.headers as Record<string, string | string[] | undefined>,
        });
        loggers.api.error({ error, context }, 'Failed to add member to channel');

        if (error instanceof ValidationError) {
          reply.code(400).send(formatErrorResponse(error));
        } else {
          reply.code(500).send({
            error: {
              message: 'Failed to add member',
              code: 'SERVER_ERROR',
            },
          });
        }
      }
    }
  );

  /**
   * DELETE /channels/:id/members/:user_id - Remove member from channel
   */
  fastify.delete<{
    Params: { id: string; user_id: string };
  }>(
    '/channels/:id/members/:user_id',
    {
      preHandler: [authenticate, requireChannelAccess, authorize('channels:manage_members')],
      schema: {
        params: Type.Object({
          id: UUIDSchema,
          user_id: UUIDSchema,
        }),
        response: {
          200: SuccessResponseSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        const { id, user_id } = request.params;

        const success = await channelRepository.removeMember(id, user_id, request.user!.userId);
        if (!success) {
          throw new NotFoundError('Member not found in channel');
        }

        // Broadcast member removal
        await WebSocketUtils.sendToChannel(id, 'user_left_channel', {
          type: 'user_left_channel',
          channelId: id,
          userId: user_id,
          userName: '', // TODO: Get user name
          userRole: request.user!.role,
          memberCount: (await channelRepository.getMembers(id)).length,
          timestamp: new Date().toISOString(),
        });

        loggers.api.info(
          {
            userId: request.user?.userId,
            channelId: id,
            removedUserId: user_id,
          },
          'Member removed from channel'
        );

        reply.send({
          success: true,
          message: 'Member removed successfully',
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        const context = createErrorContext({
          ...(request.user && {
            user: {
              id: request.user.id,
              email: request.user.email,
              role: request.user.role,
            },
          }),
          ip: request.ip,
          method: request.method,
          url: request.url,
          headers: request.headers as Record<string, string | string[] | undefined>,
        });
        loggers.api.error({ error, context }, 'Failed to remove member from channel');

        if (error instanceof NotFoundError) {
          reply.code(404).send(formatErrorResponse(error));
        } else {
          reply.code(500).send({
            error: {
              message: 'Failed to remove member',
              code: 'SERVER_ERROR',
            },
          });
        }
      }
    }
  );
};
