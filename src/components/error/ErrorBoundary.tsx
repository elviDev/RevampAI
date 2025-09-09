import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { errorHandler } from '../../services/errorHandler';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, retry: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Update state with error info
    this.setState({ errorInfo });
    
    // Handle error through centralized handler
    errorHandler.handleError(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
    });
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry);
      }

      // Default error UI
      return (
        <View className="flex-1 bg-gray-50 p-6 justify-center">
          <View className="bg-white rounded-xl p-6 shadow-sm">
            {/* Error Icon */}
            <View className="items-center mb-6">
              <Text className="text-6xl mb-4">⚠️</Text>
              <Text className="text-gray-900 text-xl font-bold mb-2">
                Something went wrong
              </Text>
              <Text className="text-gray-500 text-center">
                We've encountered an unexpected error. Don't worry, this has been reported.
              </Text>
            </View>

            {/* Error Details (only in development) */}
            {__DEV__ && (
              <View className="mb-6">
                <Text className="text-gray-700 font-semibold mb-2">Error Details:</Text>
                <ScrollView className="bg-gray-100 rounded-lg p-3 max-h-40">
                  <Text className="text-gray-600 text-sm font-mono">
                    {this.state.error.name}: {this.state.error.message}
                  </Text>
                  {this.state.error.stack && (
                    <Text className="text-gray-500 text-xs font-mono mt-2">
                      {this.state.error.stack}
                    </Text>
                  )}
                </ScrollView>
              </View>
            )}

            {/* Action Buttons */}
            <View className="space-y-3">
              <TouchableOpacity
                onPress={this.handleRetry}
                className="bg-blue-500 p-4 rounded-xl"
                activeOpacity={0.7}
              >
                <Text className="text-white font-semibold text-center">
                  Try Again
                </Text>
              </TouchableOpacity>

              {__DEV__ && (
                <TouchableOpacity
                  onPress={() => {
                    // Show error details in development
                    console.log('Error Boundary Details:', {
                      error: this.state.error,
                      errorInfo: this.state.errorInfo,
                      errorId: this.state.errorId,
                    });
                  }}
                  className="bg-gray-200 p-4 rounded-xl"
                  activeOpacity={0.7}
                >
                  <Text className="text-gray-900 font-semibold text-center">
                    Log Details
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Error ID for support */}
            {this.state.errorId && (
              <View className="mt-4 pt-4 border-t border-gray-200">
                <Text className="text-gray-400 text-center text-xs">
                  Error ID: {this.state.errorId}
                </Text>
              </View>
            )}
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

// Higher-order component wrapper for easier use
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorFallback?: (error: Error, retry: () => void) => ReactNode
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary fallback={errorFallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

// Hook for handling errors in functional components
export function useErrorHandler() {
  const handleError = React.useCallback((error: Error, context?: Record<string, any>) => {
    errorHandler.handleError(error, context);
  }, []);

  const handleAsyncError = React.useCallback(async (error: Error, context?: Record<string, any>) => {
    await errorHandler.handleError(error, context);
  }, []);

  const handleNetworkError = React.useCallback(async (error: Error, context?: Record<string, any>) => {
    await errorHandler.handleNetworkError(error, context);
  }, []);

  const handleAuthError = React.useCallback(async (error: Error, context?: Record<string, any>) => {
    await errorHandler.handleAuthError(error, context);
  }, []);

  const handleApiError = React.useCallback(async (
    error: Error, 
    statusCode: number, 
    context?: Record<string, any>
  ) => {
    await errorHandler.handleApiError(error, statusCode, context);
  }, []);

  return {
    handleError,
    handleAsyncError,
    handleNetworkError,
    handleAuthError,
    handleApiError,
  };
}