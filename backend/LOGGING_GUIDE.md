# Logging Configuration Guide

This backend now uses an optimized logging system with reduced noise and better readability.

## Quick Start

### Adjust Log Levels
```bash
# For normal development (recommended)
./scripts/adjust-logging.sh normal

# For minimal output (errors only)  
./scripts/adjust-logging.sh quiet

# For detailed debugging
./scripts/adjust-logging.sh verbose
```

## Log Levels

| Level | Output | Use Case |
|-------|--------|----------|
| `quiet` | Errors only | Minimal output, production debugging |
| `normal` | Info, warnings, errors | **Recommended** for development |
| `verbose` | Debug + all messages | Detailed troubleshooting |
| `debug` | Everything + JSON context | Deep debugging |
| `production` | Warnings, errors only | Production deployment |

## What Changed

### ✅ Improvements Made

1. **Startup Logging**: Grouped startup sequence with duration tracking
2. **Reduced Verbosity**: Many routine messages moved from `info` to `debug` level
3. **Better Formatting**: Enhanced pretty printing for development
4. **Smart Metrics**: Only log metrics when significant changes occur
5. **Security**: Automatic redaction of sensitive fields (passwords, tokens, etc.)

### 📊 Before vs After

**Before** (too verbose):
```
{"level":"info","time":"2025-08-28T05:48:42.632Z","msg":"Starting API server..."}
{"level":"info","time":"2025-08-28T05:48:42.632Z","msg":"Initializing database..."}
{"level":"info","time":"2025-08-28T05:48:42.660Z","msg":"Database connection pool initialized successfully"}
{"level":"info","time":"2025-08-28T05:48:42.660Z","msg":"Initializing Redis..."}
...
```

**After** (clean and organized):
```
05:48:42 [info] 📋 API Server Startup...
05:48:42 [info] ✅ Database (28ms)
05:48:42 [info] ✅ Redis (25ms)  
05:48:42 [info] ✅ WebSocket Server (15ms)
05:48:42 [info] ✅ Database Migrations (35ms)
05:48:42 [info] ✅ Server Configuration (67ms)

🚀 Server Initialization Summary:
   ✅ Database (28ms)
   ✅ Redis (25ms)
   ✅ WebSocket Server (15ms)
   ✅ Database Migrations (35ms)
   ✅ Server Configuration (67ms)
   ✅ Server Listen (12ms)
   ✅ Total Startup Time (207ms)

05:48:42 [info] 🚀 API server running
```

## Environment Variables

Update your `.env` file:

```bash
# For clean development logging
LOG_LEVEL=info
LOG_FORMAT=pretty

# For production
LOG_LEVEL=warn
LOG_FORMAT=json
```

## Custom Logging in Your Code

```typescript
import { logger, startupLogger, metricsLogger } from '@utils/logger';

// Regular logging
logger.info('Something happened');
logger.error({ error }, 'Operation failed');

// Startup sequence
const timer = startupLogger.createTimer('My Service');
await initializeService();
timer.log('completed'); // Logs: ✅ My Service (123ms)

// Smart metrics (only logs if changed significantly)
metricsLogger.logMetricsIfSignificant('cache', newMetrics, oldMetrics);
```

## Troubleshooting

If you need to see all logs temporarily:
```bash
LOG_LEVEL=debug npm run dev
```

Or use the helper script:
```bash
./scripts/adjust-logging.sh debug
npm run dev
```