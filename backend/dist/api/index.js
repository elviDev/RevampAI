"use strict";
/**
 * API Routes Index
 * Centralized registration of all API endpoints
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerAPIRoutes = void 0;
const UserRoutes_1 = require("./routes/UserRoutes");
const ChannelRoutes_1 = require("./routes/ChannelRoutes");
const TaskRoutes_1 = require("./routes/TaskRoutes");
const DocsRoutes_1 = require("./routes/DocsRoutes");
const logger_1 = require("@utils/logger");
/**
 * Register all API routes
 */
const registerAPIRoutes = async (fastify) => {
    try {
        // Register route modules
        await fastify.register(UserRoutes_1.registerUserRoutes);
        await fastify.register(ChannelRoutes_1.registerChannelRoutes);
        await fastify.register(TaskRoutes_1.registerTaskRoutes);
        await fastify.register(DocsRoutes_1.registerDocsRoutes);
        logger_1.logger.info('All API routes registered successfully');
    }
    catch (error) {
        logger_1.logger.error({ error }, 'Failed to register API routes');
        throw error;
    }
};
exports.registerAPIRoutes = registerAPIRoutes;
exports.default = exports.registerAPIRoutes;
//# sourceMappingURL=index.js.map