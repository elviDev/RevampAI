import { Alert } from 'react-native';
import * as Linking from 'expo-linking';
import { tokenManager } from './tokenManager';

export interface AppError extends Error {
  code?: string;
  statusCode?: number;
  context?: Record<string, any>;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  retryable?: boolean;
  userFriendly?: boolean;
}

export interface ErrorReport {
  error: AppError;
  userId?: string;
  timestamp: string;
  deviceInfo: Record<string, any>;
  appVersion?: string;
  buildNumber?: string;
  stackTrace?: string;
}

/**
 * Centralized Error Handling Service
 * Provides consistent error handling, logging, and user feedback across the app
 */
class ErrorHandler {
  private errorLog: ErrorReport[] = [];
  private maxLogSize = 100;
  private reportingEnabled = true;

  /**
   * Handle and process errors with appropriate user feedback
   */
  async handleError(error: Error | AppError, context?: Record<string, any>): Promise<void> {
    try {
      const appError = this.normalizeError(error, context);
      
      // Log error
      await this.logError(appError);
      
      // Show user feedback if needed
      if (appError.userFriendly !== false) {
        this.showUserFeedback(appError);
      }
      
      // Report to monitoring service if enabled
      if (this.reportingEnabled && appError.severity === 'critical') {
        await this.reportError(appError);
      }
      
    } catch (handlingError) {
      console.error('Error in error handler:', handlingError);
      // Fallback: show basic alert
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    }
  }

  /**
   * Create user-friendly error from various error types
   */
  private normalizeError(error: Error | AppError, context?: Record<string, any>): AppError {
    const appError: AppError = error as AppError;
    
    // Set default properties
    if (!appError.severity) {
      appError.severity = this.determineSeverity(appError);
    }
    
    if (!appError.code) {
      appError.code = this.determineErrorCode(appError);
    }
    
    if (!appError.retryable) {
      appError.retryable = this.isRetryable(appError);
    }
    
    if (context) {
      appError.context = { ...appError.context, ...context };
    }

    return appError;
  }

  /**
   * Determine error severity based on error type and code
   */
  private determineSeverity(error: AppError): 'low' | 'medium' | 'high' | 'critical' {
    if (error.statusCode === 401 || error.statusCode === 403) {
      return 'high'; // Authentication/authorization errors
    }
    
    if (error.statusCode >= 500) {
      return 'critical'; // Server errors
    }
    
    if (error.statusCode >= 400) {
      return 'medium'; // Client errors
    }
    
    if (error.message.toLowerCase().includes('network') || 
        error.message.toLowerCase().includes('connection')) {
      return 'medium'; // Network errors
    }
    
    return 'low'; // Default
  }

  /**
   * Determine error code for categorization
   */
  private determineErrorCode(error: AppError): string {
    if (error.statusCode) {
      return `HTTP_${error.statusCode}`;
    }
    
    if (error.message.toLowerCase().includes('network')) {
      return 'NETWORK_ERROR';
    }
    
    if (error.message.toLowerCase().includes('timeout')) {
      return 'TIMEOUT_ERROR';
    }
    
    if (error.message.toLowerCase().includes('permission')) {
      return 'PERMISSION_ERROR';
    }
    
    if (error.message.toLowerCase().includes('authentication')) {
      return 'AUTH_ERROR';
    }
    
    return 'UNKNOWN_ERROR';
  }

  /**
   * Determine if error is retryable
   */
  private isRetryable(error: AppError): boolean {
    // Network and timeout errors are usually retryable
    if (error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT_ERROR') {
      return true;
    }
    
    // 5xx server errors are retryable
    if (error.statusCode && error.statusCode >= 500) {
      return true;
    }
    
    // Rate limiting is retryable after delay
    if (error.statusCode === 429) {
      return true;
    }
    
    return false;
  }

  /**
   * Log error for debugging and monitoring
   */
  private async logError(error: AppError): Promise<void> {
    try {
      const userId = await tokenManager.getCurrentUserId();
      
      const errorReport: ErrorReport = {
        error,
        userId,
        timestamp: new Date().toISOString(),
        deviceInfo: {
          platform: 'react-native',
          // Add more device info as needed
        },
        stackTrace: error.stack,
      };

      // Add to local log
      this.errorLog.push(errorReport);
      
      // Keep log size manageable
      if (this.errorLog.length > this.maxLogSize) {
        this.errorLog.shift();
      }

      // Console log for development
      console.error('App Error:', {
        message: error.message,
        code: error.code,
        severity: error.severity,
        context: error.context,
        stack: error.stack
      });

    } catch (loggingError) {
      console.error('Failed to log error:', loggingError);
    }
  }

  /**
   * Show appropriate user feedback based on error type
   */
  private showUserFeedback(error: AppError): void {
    const title = this.getErrorTitle(error);
    const message = this.getErrorMessage(error);
    const buttons = this.getErrorButtons(error);

    Alert.alert(title, message, buttons);
  }

  /**
   * Get user-friendly error title
   */
  private getErrorTitle(error: AppError): string {
    switch (error.code) {
      case 'NETWORK_ERROR':
        return 'Connection Issue';
      case 'AUTH_ERROR':
      case 'HTTP_401':
      case 'HTTP_403':
        return 'Authentication Required';
      case 'PERMISSION_ERROR':
        return 'Permission Required';
      case 'TIMEOUT_ERROR':
        return 'Request Timeout';
      default:
        if (error.severity === 'critical') {
          return 'Critical Error';
        }
        return 'Error';
    }
  }

  /**
   * Get user-friendly error message
   */
  private getErrorMessage(error: AppError): string {
    switch (error.code) {
      case 'NETWORK_ERROR':
        return 'Please check your internet connection and try again.';
      case 'AUTH_ERROR':
      case 'HTTP_401':
        return 'Your session has expired. Please log in again.';
      case 'HTTP_403':
        return 'You do not have permission to perform this action.';
      case 'PERMISSION_ERROR':
        return 'This feature requires additional permissions. Please grant them in Settings.';
      case 'TIMEOUT_ERROR':
        return 'The request took too long. Please try again.';
      case 'HTTP_429':
        return 'Too many requests. Please wait a moment before trying again.';
      case 'HTTP_500':
      case 'HTTP_502':
      case 'HTTP_503':
        return 'Server is temporarily unavailable. Please try again later.';
      default:
        // Return original message if it's user-friendly, otherwise generic message
        if (error.message && error.message.length < 100 && !error.message.includes('Error:')) {
          return error.message;
        }
        return 'An unexpected error occurred. Please try again.';
    }
  }

  /**
   * Get appropriate alert buttons based on error type
   */
  private getErrorButtons(error: AppError): any[] {
    const buttons: any[] = [];

    // Always include OK button
    buttons.push({ text: 'OK' });

    // Add retry button for retryable errors
    if (error.retryable) {
      buttons.unshift({
        text: 'Retry',
        onPress: () => {
          // Emit retry event or callback if provided
          if (error.context?.retryCallback) {
            error.context.retryCallback();
          }
        }
      });
    }

    // Add settings button for permission errors
    if (error.code === 'PERMISSION_ERROR') {
      buttons.unshift({
        text: 'Settings',
        onPress: () => Linking.openSettings()
      });
    }

    // Add login button for auth errors
    if (error.code === 'AUTH_ERROR' || error.code === 'HTTP_401') {
      buttons.unshift({
        text: 'Log In',
        onPress: () => {
          // Navigate to login screen
          if (error.context?.navigateToLogin) {
            error.context.navigateToLogin();
          }
        }
      });
    }

    return buttons;
  }

  /**
   * Report error to external monitoring service
   */
  private async reportError(error: AppError): Promise<void> {
    try {
      // In a real app, you would send this to a service like Sentry, Bugsnag, etc.
      console.log('Reporting critical error to monitoring service:', error);
      
      // For now, just console log
      // TODO: Implement actual error reporting
      
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  }

  /**
   * Handle network errors specifically
   */
  async handleNetworkError(error: Error, context?: Record<string, any>): Promise<void> {
    const networkError: AppError = {
      ...error,
      code: 'NETWORK_ERROR',
      severity: 'medium',
      retryable: true,
      userFriendly: true,
      context
    };

    await this.handleError(networkError);
  }

  /**
   * Handle authentication errors
   */
  async handleAuthError(error: Error, context?: Record<string, any>): Promise<void> {
    const authError: AppError = {
      ...error,
      code: 'AUTH_ERROR',
      severity: 'high',
      retryable: false,
      userFriendly: true,
      context
    };

    // Clear stored tokens on auth error
    await tokenManager.clearTokens();

    await this.handleError(authError);
  }

  /**
   * Handle API errors with proper status code handling
   */
  async handleApiError(error: Error, statusCode: number, context?: Record<string, any>): Promise<void> {
    const apiError: AppError = {
      ...error,
      statusCode,
      code: `HTTP_${statusCode}`,
      severity: this.determineSeverity({ statusCode } as AppError),
      retryable: this.isRetryable({ statusCode } as AppError),
      userFriendly: true,
      context
    };

    await this.handleError(apiError);
  }

  /**
   * Create error boundary handler for React components
   */
  createErrorBoundaryHandler() {
    return async (error: Error, errorInfo: any) => {
      const boundaryError: AppError = {
        ...error,
        code: 'COMPONENT_ERROR',
        severity: 'high',
        retryable: false,
        userFriendly: true,
        context: { errorInfo }
      };

      await this.handleError(boundaryError);
    };
  }

  /**
   * Get recent errors for debugging
   */
  getRecentErrors(limit: number = 10): ErrorReport[] {
    return this.errorLog.slice(-limit);
  }

  /**
   * Clear error log
   */
  clearErrorLog(): void {
    this.errorLog = [];
  }

  /**
   * Enable/disable error reporting
   */
  setReportingEnabled(enabled: boolean): void {
    this.reportingEnabled = enabled;
  }
}

export const errorHandler = new ErrorHandler();