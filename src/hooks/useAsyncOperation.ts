import { useState, useCallback } from 'react';
import { errorHandler } from '../services/errorHandler';

interface AsyncOperationState<T> {
  loading: boolean;
  error: Error | null;
  data: T | null;
}

interface UseAsyncOperationOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  retryable?: boolean;
  showErrorAlert?: boolean;
  context?: Record<string, any>;
}

/**
 * Hook for handling async operations with consistent error handling and loading states
 */
export function useAsyncOperation<T = any>(
  options: UseAsyncOperationOptions = {}
) {
  const [state, setState] = useState<AsyncOperationState<T>>({
    loading: false,
    error: null,
    data: null,
  });

  const execute = useCallback(async (
    operation: () => Promise<T>,
    operationOptions?: Partial<UseAsyncOperationOptions>
  ): Promise<T | undefined> => {
    const mergedOptions = { ...options, ...operationOptions };
    
    setState({ loading: true, error: null, data: null });

    try {
      const result = await operation();
      
      setState({ loading: false, error: null, data: result });
      
      // Call success callback if provided
      mergedOptions.onSuccess?.(result);
      
      return result;
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      
      setState({ loading: false, error: errorObj, data: null });
      
      // Handle error through centralized handler
      if (mergedOptions.showErrorAlert !== false) {
        await errorHandler.handleError(errorObj, {
          ...mergedOptions.context,
          retryable: mergedOptions.retryable,
          retryCallback: () => execute(operation, operationOptions),
        });
      }
      
      // Call error callback if provided
      mergedOptions.onError?.(errorObj);
      
      return undefined;
    }
  }, [options]);

  const retry = useCallback((operation: () => Promise<T>) => {
    return execute(operation);
  }, [execute]);

  const reset = useCallback(() => {
    setState({ loading: false, error: null, data: null });
  }, []);

  return {
    ...state,
    execute,
    retry,
    reset,
  };
}

/**
 * Hook for handling multiple async operations
 */
export function useAsyncOperations() {
  const [operations, setOperations] = useState<Record<string, AsyncOperationState<any>>>({});

  const execute = useCallback(async <T>(
    key: string,
    operation: () => Promise<T>,
    options: UseAsyncOperationOptions = {}
  ): Promise<T | undefined> => {
    // Set loading state for this operation
    setOperations(prev => ({
      ...prev,
      [key]: { loading: true, error: null, data: null }
    }));

    try {
      const result = await operation();
      
      setOperations(prev => ({
        ...prev,
        [key]: { loading: false, error: null, data: result }
      }));
      
      options.onSuccess?.(result);
      return result;
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      
      setOperations(prev => ({
        ...prev,
        [key]: { loading: false, error: errorObj, data: null }
      }));
      
      if (options.showErrorAlert !== false) {
        await errorHandler.handleError(errorObj, {
          ...options.context,
          retryable: options.retryable,
          retryCallback: () => execute(key, operation, options),
        });
      }
      
      options.onError?.(errorObj);
      return undefined;
    }
  }, []);

  const getOperation = useCallback((key: string) => {
    return operations[key] || { loading: false, error: null, data: null };
  }, [operations]);

  const reset = useCallback((key?: string) => {
    if (key) {
      setOperations(prev => ({
        ...prev,
        [key]: { loading: false, error: null, data: null }
      }));
    } else {
      setOperations({});
    }
  }, []);

  const isAnyLoading = Object.values(operations).some(op => op.loading);
  const hasAnyError = Object.values(operations).some(op => op.error);

  return {
    execute,
    getOperation,
    reset,
    operations,
    isAnyLoading,
    hasAnyError,
  };
}