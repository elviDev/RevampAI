import { errorHandler, AppError } from '../services/errorHandler';

/**
 * Utility functions for common error handling patterns
 */

/**
 * Wrap async function with error handling
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context?: Record<string, any>
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      await errorHandler.handleError(error as Error, context);
      throw error; // Re-throw for caller to handle if needed
    }
  }) as T;
}

/**
 * Safe async operation that won't throw
 */
export async function safeAsync<T>(
  operation: () => Promise<T>,
  fallback?: T,
  context?: Record<string, any>
): Promise<T | undefined> {
  try {
    return await operation();
  } catch (error) {
    await errorHandler.handleError(error as Error, context);
    return fallback;
  }
}

/**
 * Retry operation with exponential backoff
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  options: {
    retries?: number;
    delay?: number;
    backoff?: number;
    context?: Record<string, any>;
  } = {}
): Promise<T> {
  const { retries = 3, delay = 1000, backoff = 2, context } = options;
  
  let lastError: Error;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === retries) {
        // Final attempt failed
        await errorHandler.handleError(lastError, {
          ...context,
          finalAttempt: true,
          totalAttempts: attempt + 1,
        });
        throw lastError;
      }
      
      // Log retry attempt
      console.warn(`Operation failed, retrying (${attempt + 1}/${retries + 1}):`, error);
      
      // Wait before next attempt
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(backoff, attempt)));
    }
  }
  
  throw lastError!;
}

/**
 * Handle API response errors
 */
export async function handleApiResponse(response: Response, context?: Record<string, any>): Promise<any> {
  try {
    const data = await response.json();
    
    if (!response.ok) {
      const error: AppError = new Error(data.message || `HTTP ${response.status}`) as AppError;
      error.statusCode = response.status;
      error.code = `HTTP_${response.status}`;
      error.context = context;
      
      await errorHandler.handleApiError(error, response.status, context);
      throw error;
    }
    
    return data;
  } catch (parseError) {
    if (!response.ok) {
      const error: AppError = new Error(`HTTP ${response.status}: ${response.statusText}`) as AppError;
      error.statusCode = response.status;
      error.code = `HTTP_${response.status}`;
      error.context = context;
      
      await errorHandler.handleApiError(error, response.status, context);
      throw error;
    }
    
    // JSON parse error
    await errorHandler.handleError(parseError as Error, {
      ...context,
      parseError: true,
      responseStatus: response.status,
    });
    throw parseError;
  }
}

/**
 * Validate required fields and throw descriptive error
 */
export function validateRequired(data: Record<string, any>, fields: string[]): void {
  const missing = fields.filter(field => !data[field]);
  
  if (missing.length > 0) {
    const error: AppError = new Error(
      `Missing required fields: ${missing.join(', ')}`
    ) as AppError;
    error.code = 'VALIDATION_ERROR';
    error.context = { missingFields: missing, providedData: Object.keys(data) };
    throw error;
  }
}

/**
 * Create contextual error with additional information
 */
export function createContextualError(
  message: string,
  context: Record<string, any>,
  originalError?: Error
): AppError {
  const error: AppError = new Error(message) as AppError;
  error.context = context;
  error.code = context.code || 'CONTEXTUAL_ERROR';
  error.severity = context.severity || 'medium';
  error.retryable = context.retryable || false;
  
  if (originalError) {
    error.stack = originalError.stack;
    error.context.originalError = {
      message: originalError.message,
      name: originalError.name,
    };
  }
  
  return error;
}

/**
 * Handle network errors with user-friendly messaging
 */
export async function handleNetworkError(error: Error, context?: Record<string, any>): Promise<void> {
  let networkError: AppError = error as AppError;
  
  // Detect common network error patterns
  if (error.message.includes('Network request failed') || 
      error.message.includes('TypeError: Network request failed')) {
    networkError = createContextualError(
      'Network connection failed. Please check your internet connection.',
      { code: 'NETWORK_FAILURE', retryable: true, ...context },
      error
    );
  } else if (error.message.includes('timeout') || error.message.includes('TIMEOUT')) {
    networkError = createContextualError(
      'Request timed out. Please try again.',
      { code: 'REQUEST_TIMEOUT', retryable: true, ...context },
      error
    );
  } else if (error.message.includes('DNS') || error.message.includes('resolve')) {
    networkError = createContextualError(
      'Unable to connect to server. Please check your internet connection.',
      { code: 'DNS_ERROR', retryable: true, ...context },
      error
    );
  }
  
  await errorHandler.handleNetworkError(networkError, context);
}

/**
 * Global error handlers that can be attached to window/global
 */
export function setupGlobalErrorHandlers(): void {
  // Handle unhandled promise rejections
  if (typeof window !== 'undefined') {
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      
      const error = event.reason instanceof Error 
        ? event.reason 
        : new Error(String(event.reason));
      
      errorHandler.handleError(error, {
        unhandledPromise: true,
        type: 'unhandledrejection'
      });
    });
  }
  
  // In React Native, we might use a different global error handler
  // This would be set up in the app's main entry point
}

/**
 * Error boundary factory for specific components
 */
export function createErrorContext(componentName: string) {
  return {
    handleError: (error: Error, additionalContext?: Record<string, any>) => 
      errorHandler.handleError(error, {
        component: componentName,
        ...additionalContext
      }),
    
    handleAsyncError: async (error: Error, additionalContext?: Record<string, any>) =>
      errorHandler.handleError(error, {
        component: componentName,
        async: true,
        ...additionalContext
      }),
  };
}

/**
 * Development helpers
 */
export const devErrorUtils = {
  /**
   * Log error details for debugging
   */
  logError: (error: Error, context?: Record<string, any>) => {
    if (__DEV__) {
      console.group(`🚨 Error in ${context?.component || 'Unknown Component'}`);
      console.error('Error:', error);
      console.log('Context:', context);
      console.log('Stack:', error.stack);
      console.groupEnd();
    }
  },
  
  /**
   * Get recent errors for debugging
   */
  getRecentErrors: (limit?: number) => errorHandler.getRecentErrors(limit),
  
  /**
   * Clear error log
   */
  clearErrors: () => errorHandler.clearErrorLog(),
};