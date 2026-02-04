/**
 * Error handling utilities for the interactive version display system
 * Provides comprehensive error handling, logging, and fallback mechanisms
 */

/**
 * Error types for better error categorization and handling
 */
export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  API_ERROR = 'API_ERROR',
  PARSE_ERROR = 'PARSE_ERROR',
  CACHE_ERROR = 'CACHE_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * Structured error information for consistent error handling
 */
export interface ErrorInfo {
  type: ErrorType;
  message: string;
  originalError?: Error;
  timestamp: number;
  context?: Record<string, any>;
  retryable: boolean;
  fallbackAvailable: boolean;
}

/**
 * Error logging configuration
 */
interface ErrorLogConfig {
  enableConsoleLogging: boolean;
  enableRemoteLogging: boolean;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
}

/**
 * Default error logging configuration
 */
const DEFAULT_LOG_CONFIG: ErrorLogConfig = {
  enableConsoleLogging: true,
  enableRemoteLogging: false, // Can be enabled when remote logging is set up
  logLevel: 'error'
};

/**
 * Error handler class for managing errors throughout the application
 */
export class ErrorHandler {
  private static instance: ErrorHandler;
  private config: ErrorLogConfig;
  private errorHistory: ErrorInfo[] = [];
  private maxHistorySize = 50;

  private constructor(config: ErrorLogConfig = DEFAULT_LOG_CONFIG) {
    this.config = config;
  }

  /**
   * Gets the singleton instance of ErrorHandler
   */
  public static getInstance(config?: ErrorLogConfig): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler(config);
    }
    return ErrorHandler.instance;
  }

  /**
   * Handles and logs an error with context information
   */
  public handleError(error: Error | string, context?: Record<string, any>): ErrorInfo {
    const errorInfo = this.categorizeError(error, context);
    this.logError(errorInfo);
    this.addToHistory(errorInfo);
    return errorInfo;
  }

  /**
   * Categorizes an error into a structured ErrorInfo object
   */
  private categorizeError(error: Error | string, context?: Record<string, any>): ErrorInfo {
    const timestamp = Date.now();
    let errorInfo: ErrorInfo;

    if (typeof error === 'string') {
      errorInfo = {
        type: ErrorType.UNKNOWN_ERROR,
        message: error,
        timestamp,
        context,
        retryable: false,
        fallbackAvailable: true
      };
    } else {
      // Categorize based on error properties
      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        errorInfo = {
          type: ErrorType.TIMEOUT_ERROR,
          message: error.message,
          originalError: error,
          timestamp,
          context,
          retryable: true,
          fallbackAvailable: true
        };
      } else if (error.message.includes('Network Error') || error.message.includes('fetch')) {
        errorInfo = {
          type: ErrorType.NETWORK_ERROR,
          message: error.message,
          originalError: error,
          timestamp,
          context,
          retryable: true,
          fallbackAvailable: true
        };
      } else if (error.message.includes('404') || error.message.includes('API')) {
        errorInfo = {
          type: ErrorType.API_ERROR,
          message: error.message,
          originalError: error,
          timestamp,
          context,
          retryable: true,
          fallbackAvailable: true
        };
      } else if (error.message.includes('JSON') || error.message.includes('parse')) {
        errorInfo = {
          type: ErrorType.PARSE_ERROR,
          message: error.message,
          originalError: error,
          timestamp,
          context,
          retryable: false,
          fallbackAvailable: true
        };
      } else if (error.message.includes('localStorage') || error.message.includes('cache')) {
        errorInfo = {
          type: ErrorType.CACHE_ERROR,
          message: error.message,
          originalError: error,
          timestamp,
          context,
          retryable: false,
          fallbackAvailable: true
        };
      } else {
        errorInfo = {
          type: ErrorType.UNKNOWN_ERROR,
          message: error.message,
          originalError: error,
          timestamp,
          context,
          retryable: false,
          fallbackAvailable: true
        };
      }
    }

    return errorInfo;
  }

  /**
   * Logs error information based on configuration
   */
  private logError(errorInfo: ErrorInfo): void {
    if (this.config.enableConsoleLogging) {
      const logMessage = `[${errorInfo.type}] ${errorInfo.message}`;
      const logData = {
        timestamp: new Date(errorInfo.timestamp).toISOString(),
        context: errorInfo.context,
        retryable: errorInfo.retryable,
        fallbackAvailable: errorInfo.fallbackAvailable,
        originalError: errorInfo.originalError
      };

      switch (this.config.logLevel) {
        case 'error':
          console.error(logMessage, logData);
          break;
        case 'warn':
          console.warn(logMessage, logData);
          break;
        case 'info':
          console.info(logMessage, logData);
          break;
        case 'debug':
          console.debug(logMessage, logData);
          break;
      }
    }

    // Remote logging can be implemented here when needed
    if (this.config.enableRemoteLogging) {
      this.sendToRemoteLogger(errorInfo);
    }
  }

  /**
   * Adds error to history for debugging and monitoring
   */
  private addToHistory(errorInfo: ErrorInfo): void {
    this.errorHistory.unshift(errorInfo);
    
    // Keep history size manageable
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory = this.errorHistory.slice(0, this.maxHistorySize);
    }
  }

  /**
   * Gets recent error history for debugging
   */
  public getErrorHistory(): ErrorInfo[] {
    return [...this.errorHistory];
  }

  /**
   * Clears error history
   */
  public clearErrorHistory(): void {
    this.errorHistory = [];
  }

  /**
   * Gets error statistics for monitoring
   */
  public getErrorStats(): Record<ErrorType, number> {
    const stats: Record<ErrorType, number> = {
      [ErrorType.NETWORK_ERROR]: 0,
      [ErrorType.TIMEOUT_ERROR]: 0,
      [ErrorType.API_ERROR]: 0,
      [ErrorType.PARSE_ERROR]: 0,
      [ErrorType.CACHE_ERROR]: 0,
      [ErrorType.UNKNOWN_ERROR]: 0
    };

    this.errorHistory.forEach(error => {
      stats[error.type]++;
    });

    return stats;
  }

  /**
   * Placeholder for remote logging implementation
   */
  private async sendToRemoteLogger(errorInfo: ErrorInfo): Promise<void> {
    try {
      // This would send error information to a remote logging service
      // Implementation depends on the logging service being used
      console.debug('Remote logging not implemented yet', errorInfo);
    } catch (error) {
      console.warn('Failed to send error to remote logger:', error);
    }
  }
}

/**
 * Utility functions for common error handling scenarios
 */

/**
 * Creates a user-friendly error message from an ErrorInfo object
 */
export function createUserFriendlyMessage(errorInfo: ErrorInfo): string {
  switch (errorInfo.type) {
    case ErrorType.NETWORK_ERROR:
      return 'Unable to connect to the server. Please check your internet connection.';
    case ErrorType.TIMEOUT_ERROR:
      return 'The request took too long to complete. Please try again.';
    case ErrorType.API_ERROR:
      if (errorInfo.message.includes('404')) {
        return 'The requested information was not found.';
      }
      return 'There was a problem with the server. Please try again later.';
    case ErrorType.PARSE_ERROR:
      return 'There was a problem processing the server response.';
    case ErrorType.CACHE_ERROR:
      return 'There was a problem with local storage. Some features may not work properly.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
}

/**
 * Determines if an error should show a retry button
 */
export function shouldShowRetry(errorInfo: ErrorInfo): boolean {
  return errorInfo.retryable;
}

/**
 * Determines if a fallback should be used
 */
export function shouldUseFallback(errorInfo: ErrorInfo): boolean {
  return errorInfo.fallbackAvailable;
}

/**
 * Creates a retry delay based on error type and attempt count
 */
export function getRetryDelay(errorInfo: ErrorInfo, attemptCount: number): number {
  const baseDelay = 1000; // 1 second
  const maxDelay = 30000; // 30 seconds

  let multiplier = 1;
  switch (errorInfo.type) {
    case ErrorType.NETWORK_ERROR:
      multiplier = 2; // Exponential backoff for network errors
      break;
    case ErrorType.TIMEOUT_ERROR:
      multiplier = 1.5; // Moderate backoff for timeouts
      break;
    case ErrorType.API_ERROR:
      multiplier = 2; // Exponential backoff for API errors
      break;
    default:
      multiplier = 1; // Linear backoff for other errors
      break;
  }

  const delay = Math.min(baseDelay * Math.pow(multiplier, attemptCount), maxDelay);
  return delay;
}

/**
 * Wraps an async function with error handling and retry logic
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context?: Record<string, any>,
  maxRetries: number = 3
): Promise<T> {
  const errorHandler = ErrorHandler.getInstance();
  let lastError: ErrorInfo | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      const errorInfo = errorHandler.handleError(
        error instanceof Error ? error : new Error(String(error)),
        { ...context, attempt, maxRetries }
      );

      lastError = errorInfo;

      // Don't retry if error is not retryable or this is the last attempt
      if (!errorInfo.retryable || attempt === maxRetries) {
        break;
      }

      // Wait before retrying
      const delay = getRetryDelay(errorInfo, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // If we get here, all retries failed
  throw new Error(lastError ? createUserFriendlyMessage(lastError) : 'Operation failed after retries');
}

/**
 * Global error handler instance
 */
export const globalErrorHandler = ErrorHandler.getInstance();

export default ErrorHandler;