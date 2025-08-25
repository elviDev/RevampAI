"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.securityLogger = exports.performanceLogger = exports.loggers = exports.logger = void 0;
const pino_1 = __importDefault(require("pino"));
const index_1 = require("@config/index");
// Create logger configuration based on environment
const loggerConfig = {
    level: index_1.config.logging.level,
    formatters: {
        level: (label) => ({ level: label }),
    },
    timestamp: pino_1.default.stdTimeFunctions.isoTime,
    ...(index_1.config.app.isDevelopment && index_1.config.logging.format === 'pretty'
        ? {
            transport: {
                target: 'pino-pretty',
                options: {
                    colorize: true,
                    translateTime: 'HH:MM:ss Z',
                    ignore: 'pid,hostname',
                },
            },
        }
        : {}),
};
// Create base logger
const baseLogger = (0, pino_1.default)(loggerConfig);
// Enhanced logger with context support
exports.logger = Object.assign(baseLogger, {
    withContext: (context) => baseLogger.child(context),
});
// Specialized loggers for different components
exports.loggers = {
    // Database operations
    db: exports.logger.child({ component: 'database' }),
    // Authentication and security
    auth: exports.logger.child({ component: 'auth' }),
    // API requests and responses
    api: exports.logger.child({ component: 'api' }),
    // WebSocket real-time communication
    websocket: exports.logger.child({ component: 'websocket' }),
    // Caching operations
    cache: exports.logger.child({ component: 'cache' }),
    // Voice processing (for Phase 2)
    voice: exports.logger.child({ component: 'voice' }),
    // AI operations (for Phase 2-3)
    ai: exports.logger.child({ component: 'ai' }),
    // Command execution (for Phase 3)
    commands: exports.logger.child({ component: 'commands' }),
    // Analytics and monitoring (for Phase 4)
    analytics: exports.logger.child({ component: 'analytics' }),
    // Performance monitoring
    performance: exports.logger.child({ component: 'performance' }),
    // Security events
    security: exports.logger.child({ component: 'security' }),
};
// Performance tracking utilities
exports.performanceLogger = {
    /**
     * Track execution time of async operations
     */
    trackAsyncOperation: async (operation, operationName, context) => {
        const startTime = Date.now();
        const operationLogger = exports.logger.withContext({ operation: operationName, ...context });
        try {
            operationLogger.info('Operation started');
            const result = await operation();
            const duration = Date.now() - startTime;
            operationLogger.info({ duration }, 'Operation completed successfully');
            // Log performance warning if operation takes too long
            if (duration > 1000) {
                exports.loggers.performance.warn({ operation: operationName, duration }, 'Slow operation detected');
            }
            return result;
        }
        catch (error) {
            const duration = Date.now() - startTime;
            operationLogger.error({ error, duration }, 'Operation failed');
            throw error;
        }
    },
    /**
     * Track sync operation performance
     */
    trackSyncOperation: (operation, operationName, context) => {
        const startTime = Date.now();
        const operationLogger = exports.logger.withContext({ operation: operationName, ...context });
        try {
            operationLogger.debug('Sync operation started');
            const result = operation();
            const duration = Date.now() - startTime;
            operationLogger.debug({ duration }, 'Sync operation completed');
            // Log performance warning for slow sync operations
            if (duration > 100) {
                exports.loggers.performance.warn({ operation: operationName, duration }, 'Slow sync operation');
            }
            return result;
        }
        catch (error) {
            const duration = Date.now() - startTime;
            operationLogger.error({ error, duration }, 'Sync operation failed');
            throw error;
        }
    },
};
// Security event logging
exports.securityLogger = {
    /**
     * Log authentication events
     */
    logAuthEvent: (event, context) => {
        exports.loggers.security.info({ event, ...context }, 'Authentication event');
    },
    /**
     * Log authorization events
     */
    logAuthzEvent: (event, context) => {
        exports.loggers.security.info({ event, ...context }, 'Authorization event');
    },
    /**
     * Log security violations
     */
    logSecurityViolation: (violation, context) => {
        exports.loggers.security.error({ violation, ...context }, 'Security violation detected');
    },
};
// Export default logger
exports.default = exports.logger;
//# sourceMappingURL=logger.js.map