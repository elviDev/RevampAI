"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerTaskRoutes = void 0;
const typebox_1 = require("@sinclair/typebox");
const index_1 = require("@db/index");
const logger_1 = require("@utils/logger");
const errors_1 = require("@utils/errors");
const middleware_1 = require("@auth/middleware");
const CacheService_1 = require("../../services/CacheService");
const cache_decorators_1 = require("@utils/cache-decorators");
const utils_1 = require("@websocket/utils");
const validation_1 = require("@utils/validation");
/**
 * Task Management API Routes
 * Enterprise-grade task CRUD operations with real-time updates
 */
// Request/Response Schemas
const CreateTaskSchema = typebox_1.Type.Object({
    title: typebox_1.Type.String({ minLength: 1, maxLength: 255 }),
    description: typebox_1.Type.Optional(typebox_1.Type.String({ maxLength: 2000 })),
    channel_id: typebox_1.Type.Optional(validation_1.UUIDSchema),
    parent_task_id: typebox_1.Type.Optional(validation_1.UUIDSchema),
    assigned_to: typebox_1.Type.Optional(typebox_1.Type.Array(validation_1.UUIDSchema)),
    owned_by: typebox_1.Type.Optional(validation_1.UUIDSchema),
    priority: typebox_1.Type.Optional(validation_1.TaskPrioritySchema),
    task_type: typebox_1.Type.Optional(typebox_1.Type.Union([
        typebox_1.Type.Literal('general'),
        typebox_1.Type.Literal('project'),
        typebox_1.Type.Literal('maintenance'),
        typebox_1.Type.Literal('emergency'),
        typebox_1.Type.Literal('research'),
        typebox_1.Type.Literal('approval'),
    ])),
    complexity: typebox_1.Type.Optional(typebox_1.Type.Integer({ minimum: 1, maximum: 10 })),
    estimated_hours: typebox_1.Type.Optional(typebox_1.Type.Number({ minimum: 0 })),
    due_date: typebox_1.Type.Optional(typebox_1.Type.String({ format: 'date-time' })),
    start_date: typebox_1.Type.Optional(typebox_1.Type.String({ format: 'date-time' })),
    tags: typebox_1.Type.Optional(typebox_1.Type.Array(typebox_1.Type.String({ maxLength: 50 }))),
    labels: typebox_1.Type.Optional(typebox_1.Type.Record(typebox_1.Type.String(), typebox_1.Type.Any())),
    voice_created: typebox_1.Type.Optional(typebox_1.Type.Boolean()),
    voice_command_id: typebox_1.Type.Optional(typebox_1.Type.String()),
    voice_instructions: typebox_1.Type.Optional(typebox_1.Type.String()),
    business_value: typebox_1.Type.Optional(validation_1.BusinessValueSchema),
    acceptance_criteria: typebox_1.Type.Optional(typebox_1.Type.String({ maxLength: 2000 })),
});
const UpdateTaskSchema = typebox_1.Type.Object({
    title: typebox_1.Type.Optional(typebox_1.Type.String({ minLength: 1, maxLength: 255 })),
    description: typebox_1.Type.Optional(typebox_1.Type.String({ maxLength: 2000 })),
    priority: typebox_1.Type.Optional(validation_1.TaskPrioritySchema),
    status: typebox_1.Type.Optional(validation_1.TaskStatusSchema),
    complexity: typebox_1.Type.Optional(typebox_1.Type.Integer({ minimum: 1, maximum: 10 })),
    estimated_hours: typebox_1.Type.Optional(typebox_1.Type.Number({ minimum: 0 })),
    due_date: typebox_1.Type.Optional(typebox_1.Type.String({ format: 'date-time' })),
    start_date: typebox_1.Type.Optional(typebox_1.Type.String({ format: 'date-time' })),
    tags: typebox_1.Type.Optional(typebox_1.Type.Array(typebox_1.Type.String({ maxLength: 50 }))),
    labels: typebox_1.Type.Optional(typebox_1.Type.Record(typebox_1.Type.String(), typebox_1.Type.Any())),
    business_value: typebox_1.Type.Optional(validation_1.BusinessValueSchema),
    acceptance_criteria: typebox_1.Type.Optional(typebox_1.Type.String({ maxLength: 2000 })),
});
const TaskResponseSchema = typebox_1.Type.Object({
    id: validation_1.UUIDSchema,
    title: typebox_1.Type.String(),
    description: typebox_1.Type.Optional(typebox_1.Type.String()),
    channel_id: typebox_1.Type.Optional(validation_1.UUIDSchema),
    parent_task_id: typebox_1.Type.Optional(validation_1.UUIDSchema),
    created_by: validation_1.UUIDSchema,
    assigned_to: typebox_1.Type.Array(validation_1.UUIDSchema),
    owned_by: typebox_1.Type.Optional(validation_1.UUIDSchema),
    priority: validation_1.TaskPrioritySchema,
    status: validation_1.TaskStatusSchema,
    task_type: typebox_1.Type.String(),
    complexity: typebox_1.Type.Integer(),
    estimated_hours: typebox_1.Type.Optional(typebox_1.Type.Number()),
    actual_hours: typebox_1.Type.Number(),
    story_points: typebox_1.Type.Optional(typebox_1.Type.Integer()),
    due_date: typebox_1.Type.Optional(typebox_1.Type.String({ format: 'date-time' })),
    start_date: typebox_1.Type.Optional(typebox_1.Type.String({ format: 'date-time' })),
    completed_at: typebox_1.Type.Optional(typebox_1.Type.String({ format: 'date-time' })),
    progress_percentage: typebox_1.Type.Integer(),
    tags: typebox_1.Type.Array(typebox_1.Type.String()),
    labels: typebox_1.Type.Record(typebox_1.Type.String(), typebox_1.Type.Any()),
    voice_created: typebox_1.Type.Boolean(),
    voice_command_id: typebox_1.Type.Optional(typebox_1.Type.String()),
    voice_instructions: typebox_1.Type.Optional(typebox_1.Type.String()),
    business_value: validation_1.BusinessValueSchema,
    acceptance_criteria: typebox_1.Type.Optional(typebox_1.Type.String()),
    watchers: typebox_1.Type.Array(validation_1.UUIDSchema),
    comments_count: typebox_1.Type.Integer(),
    attachments_count: typebox_1.Type.Integer(),
    created_at: typebox_1.Type.String({ format: 'date-time' }),
    updated_at: typebox_1.Type.String({ format: 'date-time' }),
    last_activity_at: typebox_1.Type.String({ format: 'date-time' }),
});
const TaskStatsSchema = typebox_1.Type.Object({
    totalTasks: typebox_1.Type.Integer(),
    tasksByStatus: typebox_1.Type.Record(typebox_1.Type.String(), typebox_1.Type.Integer()),
    tasksByPriority: typebox_1.Type.Record(typebox_1.Type.String(), typebox_1.Type.Integer()),
    overdueTasks: typebox_1.Type.Integer(),
    completedThisWeek: typebox_1.Type.Integer(),
    averageCompletionTime: typebox_1.Type.Number(),
});
/**
 * Task service with caching
 */
class TaskService {
    async getTaskById(taskId) {
        return await index_1.taskRepository.findById(taskId);
    }
    async updateTask(taskId, updateData) {
        return await index_1.taskRepository.update(taskId, updateData);
    }
    async createTask(taskData) {
        return await index_1.taskRepository.createTask(taskData);
    }
}
__decorate([
    (0, cache_decorators_1.Cacheable)({
        ttl: 900, // 15 minutes
        namespace: 'tasks',
        keyGenerator: (taskId) => cache_decorators_1.CacheKeyUtils.taskKey(taskId),
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TaskService.prototype, "getTaskById", null);
__decorate([
    (0, cache_decorators_1.CacheEvict)({
        keys: (taskId) => [cache_decorators_1.CacheKeyUtils.taskKey(taskId)],
        namespace: 'tasks',
        tags: ['tasks'],
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TaskService.prototype, "updateTask", null);
__decorate([
    (0, cache_decorators_1.CacheEvict)({
        allEntries: true,
        namespace: 'tasks',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TaskService.prototype, "createTask", null);
const taskService = new TaskService();
/**
 * Register task routes
 */
const registerTaskRoutes = async (fastify) => {
    /**
     * GET /tasks - List tasks with filters
     */
    fastify.get('/tasks', {
        preHandler: [middleware_1.authenticate, middleware_1.apiRateLimit],
        schema: {
            querystring: typebox_1.Type.Intersect([
                validation_1.PaginationSchema,
                typebox_1.Type.Object({
                    status: typebox_1.Type.Optional(typebox_1.Type.Array(validation_1.TaskStatusSchema)),
                    priority: typebox_1.Type.Optional(typebox_1.Type.Array(validation_1.TaskPrioritySchema)),
                    assigned_to: typebox_1.Type.Optional(validation_1.UUIDSchema),
                    channel_id: typebox_1.Type.Optional(validation_1.UUIDSchema),
                    created_by: typebox_1.Type.Optional(validation_1.UUIDSchema),
                    due_after: typebox_1.Type.Optional(typebox_1.Type.String({ format: 'date-time' })),
                    due_before: typebox_1.Type.Optional(typebox_1.Type.String({ format: 'date-time' })),
                    tags: typebox_1.Type.Optional(typebox_1.Type.Array(typebox_1.Type.String())),
                    overdue: typebox_1.Type.Optional(typebox_1.Type.Boolean()),
                    voice_created: typebox_1.Type.Optional(typebox_1.Type.Boolean()),
                    search: typebox_1.Type.Optional(typebox_1.Type.String({ maxLength: 200 })),
                }),
            ]),
            response: {
                200: typebox_1.Type.Object({
                    success: typebox_1.Type.Boolean(),
                    data: typebox_1.Type.Array(TaskResponseSchema),
                    pagination: typebox_1.Type.Object({
                        total: typebox_1.Type.Integer(),
                        limit: typebox_1.Type.Integer(),
                        offset: typebox_1.Type.Integer(),
                        hasMore: typebox_1.Type.Boolean(),
                    }),
                    timestamp: typebox_1.Type.String({ format: 'date-time' }),
                }),
            },
        },
    }, async (request, reply) => {
        try {
            const { limit = 20, offset = 0, status, priority, assigned_to, channel_id, created_by, due_after, due_before, tags, overdue, voice_created, search, } = request.query;
            // Build task filters
            const filters = {};
            if (status)
                filters.status = status;
            if (priority)
                filters.priority = priority;
            if (assigned_to)
                filters.assignedTo = [assigned_to];
            if (channel_id)
                filters.channelId = channel_id;
            if (due_after)
                filters.dueAfter = new Date(due_after);
            if (due_before)
                filters.dueBefore = new Date(due_before);
            if (tags)
                filters.tags = tags;
            if (overdue !== undefined)
                filters.overdue = overdue;
            if (voice_created !== undefined)
                filters.voiceCreated = voice_created;
            let tasks = [];
            let total = 0;
            if (search) {
                // Use search functionality
                tasks = await index_1.taskRepository.searchTasks(search, request.user.userId, Math.min(limit, 100), offset);
                total = tasks.length; // Approximation for search results
            }
            else {
                // Use filtered query
                tasks = await index_1.taskRepository.findWithFilters(filters, Math.min(limit, 100), offset);
                // TODO: Get total count for pagination
                total = tasks.length;
            }
            // Filter based on user permissions (non-CEO users only see their tasks unless specified)
            if (request.user.role !== 'ceo' && !assigned_to && !created_by) {
                filters.assignedTo = [request.user.userId];
                tasks = await index_1.taskRepository.findByAssignee(request.user.userId, filters.status, true);
            }
            logger_1.loggers.api.info({
                userId: request.user?.userId,
                filters,
                search,
                resultCount: tasks.length,
            }, 'Tasks list retrieved');
            reply.send({
                success: true,
                data: tasks,
                pagination: {
                    total,
                    limit,
                    offset,
                    hasMore: offset + limit < total,
                },
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            const context = (0, errors_1.createErrorContext)({
                ...(request.user && {
                    user: {
                        id: request.user.userId,
                        email: request.user.email ?? '',
                        role: request.user.role,
                    },
                }),
                ip: request.ip,
                method: request.method,
                url: request.url,
                headers: request.headers,
            });
            logger_1.loggers.api.error({ error, context }, 'Failed to retrieve tasks');
            reply.code(500).send({
                error: {
                    message: 'Failed to retrieve tasks',
                    code: 'SERVER_ERROR',
                },
            });
        }
    });
    /**
     * GET /tasks/:id - Get task details
     */
    fastify.get('/tasks/:id', {
        preHandler: [middleware_1.authenticate],
        schema: {
            params: typebox_1.Type.Object({
                id: validation_1.UUIDSchema,
            }),
            response: {
                200: typebox_1.Type.Object({
                    success: typebox_1.Type.Boolean(),
                    data: TaskResponseSchema,
                    timestamp: typebox_1.Type.String({ format: 'date-time' }),
                }),
            },
        },
    }, async (request, reply) => {
        try {
            const { id } = request.params;
            const task = await taskService.getTaskById(id);
            if (!task) {
                throw new errors_1.NotFoundError('Task not found');
            }
            // Check if user has access to this task
            const hasAccess = request.user.role === 'ceo' ||
                task.assigned_to.includes(request.user.userId) ||
                task.created_by === request.user.userId ||
                task.watchers.includes(request.user.userId);
            if (!hasAccess) {
                throw new errors_1.AuthorizationError('You do not have access to this task');
            }
            logger_1.loggers.api.info({
                userId: request.user?.userId,
                taskId: id,
            }, 'Task details retrieved');
            reply.send({
                success: true,
                data: task,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            const context = (0, errors_1.createErrorContext)({
                ...(request.user && {
                    user: {
                        id: request.user.userId,
                        email: request.user.email ?? '',
                        role: request.user.role,
                    },
                }),
                ip: request.ip,
                method: request.method,
                url: request.url,
                headers: request.headers,
            });
            logger_1.loggers.api.error({ error, context }, 'Failed to retrieve task');
            if (error instanceof errors_1.NotFoundError || error instanceof errors_1.AuthorizationError) {
                reply.code(error.statusCode).send((0, errors_1.formatErrorResponse)(error));
            }
            else {
                reply.code(500).send({
                    error: {
                        message: 'Failed to retrieve task',
                        code: 'SERVER_ERROR',
                    },
                });
            }
        }
    });
    /**
     * POST /tasks - Create new task
     */
    fastify.post('/tasks', {
        preHandler: [middleware_1.authenticate, (0, middleware_1.authorize)('tasks:create')],
        schema: {
            body: CreateTaskSchema,
            response: {
                201: typebox_1.Type.Object({
                    success: typebox_1.Type.Boolean(),
                    data: TaskResponseSchema,
                    timestamp: typebox_1.Type.String({ format: 'date-time' }),
                }),
            },
        },
    }, async (request, reply) => {
        try {
            const taskData = {
                ...request.body,
                created_by: request.user.userId,
                assigned_to: request.body.assigned_to || [request.user.userId],
                owned_by: request.body.owned_by || request.user.userId,
                tags: request.body.tags || [],
                labels: request.body.labels || {},
                due_date: request.body.due_date ? new Date(request.body.due_date) : undefined,
                start_date: request.body.start_date ? new Date(request.body.start_date) : undefined,
            };
            const task = await taskService.createTask(taskData);
            // Broadcast task creation
            await utils_1.WebSocketUtils.broadcastTaskUpdate({
                type: 'task_created',
                taskId: task.id,
                channelId: task.channel_id || '',
                task: {
                    id: task.id,
                    title: task.title,
                    ...(task.description ? { description: task.description } : {}),
                    status: task.status,
                    priority: task.priority,
                    assignedTo: task.assigned_to,
                    ...(task.due_date ? { dueDate: task.due_date.toISOString() } : {}),
                    progress: task.progress_percentage,
                    tags: task.tags,
                },
                action: 'create',
                userId: request.user.userId,
                userName: request.user.name,
                userRole: request.user.role,
            });
            // Send notifications to assignees
            if (task.assigned_to.length > 0) {
                for (const assigneeId of task.assigned_to) {
                    if (assigneeId !== request.user.userId) {
                        await utils_1.WebSocketUtils.createAndSendNotification(assigneeId, {
                            title: 'New Task Assigned',
                            message: `You have been assigned to task: ${task.title}`,
                            category: 'task',
                            priority: task.priority === 'critical' || task.priority === 'urgent' ? 'high' : 'medium',
                            actionUrl: `/tasks/${task.id}`,
                            actionText: 'View Task',
                            data: { taskId: task.id, taskTitle: task.title },
                        });
                    }
                }
            }
            logger_1.loggers.api.info({
                userId: request.user?.userId,
                taskId: task.id,
                taskTitle: task.title,
                assignedTo: task.assigned_to,
                priority: task.priority,
            }, 'Task created successfully');
            reply.code(201).send({
                success: true,
                data: task,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            const context = (0, errors_1.createErrorContext)({
                ...(request.user && {
                    user: {
                        id: request.user.userId,
                        email: request.user.email ?? '',
                        role: request.user.role,
                    },
                }),
                ip: request.ip,
                method: request.method,
                url: request.url,
                headers: request.headers,
            });
            logger_1.loggers.api.error({ error, context }, 'Failed to create task');
            if (error instanceof errors_1.ValidationError) {
                reply.code(400).send((0, errors_1.formatErrorResponse)(error));
            }
            else {
                reply.code(500).send({
                    error: {
                        message: 'Failed to create task',
                        code: 'SERVER_ERROR',
                    },
                });
            }
        }
    });
    /**
     * PUT /tasks/:id - Update task
     */
    fastify.put('/tasks/:id', {
        preHandler: [middleware_1.authenticate, (0, middleware_1.authorize)('tasks:update')],
        schema: {
            params: typebox_1.Type.Object({
                id: validation_1.UUIDSchema,
            }),
            body: UpdateTaskSchema,
            response: {
                200: typebox_1.Type.Object({
                    success: typebox_1.Type.Boolean(),
                    data: TaskResponseSchema,
                    timestamp: typebox_1.Type.String({ format: 'date-time' }),
                }),
            },
        },
    }, async (request, reply) => {
        try {
            const { id } = request.params;
            const updateData = {
                ...request.body,
                due_date: request.body.due_date ? new Date(request.body.due_date) : undefined,
                start_date: request.body.start_date ? new Date(request.body.start_date) : undefined,
            };
            // Check if user can update this task
            const existingTask = await index_1.taskRepository.findById(id);
            if (!existingTask) {
                throw new errors_1.NotFoundError('Task not found');
            }
            const canUpdate = request.user.role === 'ceo' ||
                existingTask.assigned_to.includes(request.user.userId) ||
                existingTask.created_by === request.user.userId ||
                existingTask.owned_by === request.user.userId;
            if (!canUpdate) {
                throw new errors_1.AuthorizationError('You do not have permission to update this task');
            }
            const task = await taskService.updateTask(id, updateData);
            // Broadcast task update
            await utils_1.WebSocketUtils.broadcastTaskUpdate({
                type: 'task_updated',
                taskId: id,
                channelId: task.channel_id || '',
                task: {
                    id: task.id,
                    title: task.title,
                    ...(task.description ? { description: task.description } : {}),
                    status: task.status,
                    priority: task.priority,
                    assignedTo: task.assigned_to,
                    ...(task.due_date ? { dueDate: task.due_date.toISOString() } : {}),
                    progress: task.progress_percentage,
                    tags: task.tags,
                },
                action: 'update',
                changes: updateData,
                userId: request.user.userId,
                userName: request.user.name,
                userRole: request.user.role,
            });
            logger_1.loggers.api.info({
                userId: request.user?.userId,
                taskId: id,
                updatedFields: Object.keys(updateData),
            }, 'Task updated successfully');
            reply.send({
                success: true,
                data: task,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            const context = (0, errors_1.createErrorContext)({
                ...(request.user && {
                    user: {
                        id: request.user.userId,
                        email: request.user.email ?? '',
                        role: request.user.role,
                    },
                }),
                ip: request.ip,
                method: request.method,
                url: request.url,
                headers: request.headers,
            });
            logger_1.loggers.api.error({ error, context }, 'Failed to update task');
            if (error instanceof errors_1.NotFoundError || error instanceof errors_1.AuthorizationError) {
                reply.code(error.statusCode).send((0, errors_1.formatErrorResponse)(error));
            }
            else if (error instanceof errors_1.ValidationError) {
                reply.code(400).send((0, errors_1.formatErrorResponse)(error));
            }
            else {
                reply.code(500).send({
                    error: {
                        message: 'Failed to update task',
                        code: 'SERVER_ERROR',
                    },
                });
            }
        }
    });
    /**
     * PATCH /tasks/:id/status - Update task status
     */
    fastify.patch('/tasks/:id/status', {
        preHandler: [middleware_1.authenticate, (0, middleware_1.authorize)('tasks:update')],
        schema: {
            params: typebox_1.Type.Object({
                id: validation_1.UUIDSchema,
            }),
            body: typebox_1.Type.Object({
                status: validation_1.TaskStatusSchema,
            }),
            response: {
                200: typebox_1.Type.Object({
                    success: typebox_1.Type.Boolean(),
                    data: TaskResponseSchema,
                    timestamp: typebox_1.Type.String({ format: 'date-time' }),
                }),
            },
        },
    }, async (request, reply) => {
        try {
            const { id } = request.params;
            const { status } = request.body;
            const task = await index_1.taskRepository.updateStatus(id, status, request.user.userId);
            // Broadcast status change
            await utils_1.WebSocketUtils.broadcastTaskUpdate({
                type: status === 'completed' ? 'task_completed' : 'task_updated',
                taskId: id,
                channelId: task.channel_id || '',
                task: {
                    id: task.id,
                    title: task.title,
                    ...(task.description ? { description: task.description } : {}),
                    status: task.status,
                    priority: task.priority,
                    assignedTo: task.assigned_to,
                    ...(task.due_date ? { dueDate: task.due_date.toISOString() } : {}),
                    progress: task.progress_percentage,
                    tags: task.tags,
                },
                action: status === 'completed' ? 'complete' : 'update',
                changes: { status },
                userId: request.user.userId,
                userName: request.user.name,
                userRole: request.user.role,
            });
            // Send completion notification
            if (status === 'completed') {
                for (const assigneeId of task.assigned_to) {
                    if (assigneeId !== request.user.userId) {
                        await utils_1.WebSocketUtils.createAndSendNotification(assigneeId, {
                            title: 'Task Completed',
                            message: `Task "${task.title}" has been completed`,
                            category: 'task',
                            priority: 'medium',
                            actionUrl: `/tasks/${task.id}`,
                            actionText: 'View Task',
                            data: { taskId: task.id, taskTitle: task.title },
                        });
                    }
                }
            }
            logger_1.loggers.api.info({
                userId: request.user?.userId,
                taskId: id,
                newStatus: status,
            }, 'Task status updated successfully');
            reply.send({
                success: true,
                data: task,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            const context = (0, errors_1.createErrorContext)({
                ...(request.user && {
                    user: {
                        id: request.user.userId,
                        email: request.user.email ?? '',
                        role: request.user.role,
                    },
                }),
                ip: request.ip,
                method: request.method,
                url: request.url,
                headers: request.headers,
            });
            logger_1.loggers.api.error({ error, context }, 'Failed to update task status');
            if (error instanceof errors_1.NotFoundError || error instanceof errors_1.AuthorizationError) {
                reply.code(error.statusCode).send((0, errors_1.formatErrorResponse)(error));
            }
            else {
                reply.code(500).send({
                    error: {
                        message: 'Failed to update task status',
                        code: 'SERVER_ERROR',
                    },
                });
            }
        }
    });
    /**
     * POST /tasks/:id/assign - Assign users to task
     */
    fastify.post('/tasks/:id/assign', {
        preHandler: [middleware_1.authenticate, (0, middleware_1.authorize)('tasks:assign')],
        schema: {
            params: typebox_1.Type.Object({
                id: validation_1.UUIDSchema,
            }),
            body: typebox_1.Type.Object({
                user_ids: typebox_1.Type.Array(validation_1.UUIDSchema),
            }),
            response: {
                200: validation_1.SuccessResponseSchema,
            },
        },
    }, async (request, reply) => {
        try {
            const { id } = request.params;
            const { user_ids } = request.body;
            const success = await index_1.taskRepository.assignUsers(id, user_ids, request.user.userId);
            if (!success) {
                throw new errors_1.ValidationError('Failed to assign users to task', []);
            }
            // Clear task cache
            await CacheService_1.cacheService.tasks.delete(cache_decorators_1.CacheKeyUtils.taskKey(id));
            // Get updated task for broadcast
            const task = await index_1.taskRepository.findById(id);
            if (task) {
                // Broadcast assignment
                await utils_1.WebSocketUtils.broadcastTaskUpdate({
                    type: 'task_updated',
                    taskId: id,
                    channelId: task.channel_id || '',
                    task: {
                        id: task.id,
                        title: task.title,
                        ...(task.description ? { description: task.description } : {}),
                        status: task.status,
                        priority: task.priority,
                        assignedTo: task.assigned_to,
                        ...(task.due_date ? { dueDate: task.due_date.toISOString() } : {}),
                        progress: task.progress_percentage,
                        tags: task.tags,
                    },
                    action: 'assign',
                    changes: { assigned_to: user_ids },
                    userId: request.user.userId,
                    userName: request.user.name,
                    userRole: request.user.role,
                });
                // Send notifications to newly assigned users
                for (const userId of user_ids) {
                    await utils_1.WebSocketUtils.createAndSendNotification(userId, {
                        title: 'Task Assigned',
                        message: `You have been assigned to task: ${task.title}`,
                        category: 'task',
                        priority: task.priority === 'critical' || task.priority === 'urgent' ? 'high' : 'medium',
                        actionUrl: `/tasks/${task.id}`,
                        actionText: 'View Task',
                        data: { taskId: task.id, taskTitle: task.title },
                    });
                }
            }
            logger_1.loggers.api.info({
                userId: request.user?.userId,
                taskId: id,
                assignedUsers: user_ids,
            }, 'Users assigned to task successfully');
            reply.send({
                success: true,
                message: 'Users assigned successfully',
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            const context = (0, errors_1.createErrorContext)({
                ...(request.user && {
                    user: {
                        id: request.user.userId,
                        email: request.user.email ?? '',
                        role: request.user.role,
                    },
                }),
                ip: request.ip,
                method: request.method,
                url: request.url,
                headers: request.headers,
            });
            logger_1.loggers.api.error({ error, context }, 'Failed to assign users to task');
            if (error instanceof errors_1.ValidationError) {
                reply.code(400).send((0, errors_1.formatErrorResponse)(error));
            }
            else {
                reply.code(500).send({
                    error: {
                        message: 'Failed to assign users',
                        code: 'SERVER_ERROR',
                    },
                });
            }
        }
    });
    /**
     * DELETE /tasks/:id - Delete task
     */
    fastify.delete('/tasks/:id', {
        preHandler: [middleware_1.authenticate, (0, middleware_1.authorize)('tasks:delete')],
        schema: {
            params: typebox_1.Type.Object({
                id: validation_1.UUIDSchema,
            }),
            response: {
                200: validation_1.SuccessResponseSchema,
            },
        },
    }, async (request, reply) => {
        try {
            const { id } = request.params;
            const success = await index_1.taskRepository.softDelete(id, request.user.userId);
            if (!success) {
                throw new errors_1.NotFoundError('Task not found');
            }
            // Clear task cache
            await CacheService_1.cacheService.tasks.delete(cache_decorators_1.CacheKeyUtils.taskKey(id));
            // Broadcast task deletion
            await utils_1.WebSocketUtils.broadcastTaskUpdate({
                type: 'task_deleted',
                taskId: id,
                task: {},
                action: 'delete',
                userId: request.user.userId,
                userName: request.user.name,
                userRole: request.user.role,
            });
            logger_1.loggers.api.info({
                userId: request.user?.userId,
                taskId: id,
            }, 'Task deleted successfully');
            reply.send({
                success: true,
                message: 'Task deleted successfully',
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            const context = (0, errors_1.createErrorContext)({
                ...(request.user && {
                    user: {
                        id: request.user.userId,
                        email: request.user.email ?? '',
                        role: request.user.role,
                    },
                }),
                ip: request.ip,
                method: request.method,
                url: request.url,
                headers: request.headers,
            });
            logger_1.loggers.api.error({ error, context }, 'Failed to delete task');
            if (error instanceof errors_1.NotFoundError) {
                reply.code(404).send((0, errors_1.formatErrorResponse)(error));
            }
            else {
                reply.code(500).send({
                    error: {
                        message: 'Failed to delete task',
                        code: 'SERVER_ERROR',
                    },
                });
            }
        }
    });
    /**
     * GET /tasks/stats - Get task statistics
     */
    fastify.get('/tasks/stats', {
        preHandler: [middleware_1.authenticate],
        schema: {
            querystring: typebox_1.Type.Object({
                user_id: typebox_1.Type.Optional(validation_1.UUIDSchema),
            }),
            response: {
                200: typebox_1.Type.Object({
                    success: typebox_1.Type.Boolean(),
                    data: TaskStatsSchema,
                    timestamp: typebox_1.Type.String({ format: 'date-time' }),
                }),
            },
        },
    }, async (request, reply) => {
        try {
            const { user_id } = request.query;
            // Only CEO can view stats for other users
            const targetUserId = user_id && request.user.role === 'ceo' ? user_id : request.user.userId;
            const stats = await index_1.taskRepository.getTaskStats(targetUserId);
            logger_1.loggers.api.info({
                userId: request.user?.userId,
                targetUserId,
                stats,
            }, 'Task stats retrieved');
            reply.send({
                success: true,
                data: stats,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            const context = (0, errors_1.createErrorContext)({
                ...(request.user && {
                    user: {
                        id: request.user.userId,
                        email: request.user.email ?? '',
                        role: request.user.role,
                    },
                }),
                ip: request.ip,
                method: request.method,
                url: request.url,
                headers: request.headers,
            });
            logger_1.loggers.api.error({ error, context }, 'Failed to retrieve task stats');
            reply.code(500).send({
                error: {
                    message: 'Failed to retrieve task stats',
                    code: 'SERVER_ERROR',
                },
            });
        }
    });
};
exports.registerTaskRoutes = registerTaskRoutes;
//# sourceMappingURL=TaskRoutes.js.map