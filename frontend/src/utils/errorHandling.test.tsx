import { describe, it, expect, beforeEach } from 'vitest';
import ErrorHandler, {
  ErrorType,
  createUserFriendlyMessage,
  shouldShowRetry,
  shouldUseFallback,
  getRetryDelay,
  withErrorHandling,
} from './errorHandling';
import type { ErrorInfo } from './errorHandling';

describe('ErrorHandler', () => {
  let handler: ErrorHandler;

  beforeEach(() => {
    // Get a fresh-ish instance and clear history
    handler = ErrorHandler.getInstance();
    handler.clearErrorHistory();
  });

  describe('categorizeError', () => {
    it('categorizes a network error', () => {
      const error = new TypeError('Failed to fetch');
      const info = (handler as any).categorizeError(error);
      expect(info.type).toBe(ErrorType.NETWORK_ERROR);
      expect(info.retryable).toBe(true);
    });

    it('categorizes a timeout error', () => {
      const error = new Error('timeout exceeded');
      const info = (handler as any).categorizeError(error);
      expect(info.type).toBe(ErrorType.TIMEOUT_ERROR);
      expect(info.retryable).toBe(true);
    });

    it('categorizes a string error', () => {
      const info = (handler as any).categorizeError('something went wrong');
      expect(info.type).toBe(ErrorType.UNKNOWN_ERROR);
      expect(info.message).toBe('something went wrong');
    });

    it('includes context in categorized error', () => {
      const info = (handler as any).categorizeError('error', { component: 'Dashboard' });
      expect(info.context).toEqual({ component: 'Dashboard' });
    });
  });

  describe('handleError', () => {
    it('adds error to history', () => {
      handler.handleError('test error');
      const history = handler.getErrorHistory();
      expect(history.length).toBe(1);
      expect(history[0].message).toBe('test error');
    });
  });

  describe('getErrorHistory / clearErrorHistory', () => {
    it('returns empty array after clearing', () => {
      handler.handleError('err1');
      handler.handleError('err2');
      handler.clearErrorHistory();
      expect(handler.getErrorHistory()).toEqual([]);
    });
  });

  describe('getErrorStats', () => {
    it('counts errors by type', () => {
      handler.handleError(new TypeError('Failed to fetch'));
      handler.handleError('generic error');
      const stats = handler.getErrorStats();
      expect(stats[ErrorType.NETWORK_ERROR]).toBe(1);
      expect(stats[ErrorType.UNKNOWN_ERROR]).toBe(1);
    });
  });
});

describe('createUserFriendlyMessage', () => {
  it('returns friendly message for network error', () => {
    const info: ErrorInfo = {
      type: ErrorType.NETWORK_ERROR,
      message: 'Failed to fetch',
      timestamp: Date.now(),
      retryable: true,
      fallbackAvailable: false,
    };
    const msg = createUserFriendlyMessage(info);
    expect(msg).toBeTruthy();
    expect(typeof msg).toBe('string');
  });

  it('returns friendly message for timeout error', () => {
    const info: ErrorInfo = {
      type: ErrorType.TIMEOUT_ERROR,
      message: 'timeout',
      timestamp: Date.now(),
      retryable: true,
      fallbackAvailable: false,
    };
    const msg = createUserFriendlyMessage(info);
    expect(msg).toBeTruthy();
  });
});

describe('shouldShowRetry', () => {
  it('returns true for retryable errors', () => {
    const info: ErrorInfo = {
      type: ErrorType.NETWORK_ERROR,
      message: '',
      timestamp: Date.now(),
      retryable: true,
      fallbackAvailable: false,
    };
    expect(shouldShowRetry(info)).toBe(true);
  });

  it('returns false for non-retryable errors', () => {
    const info: ErrorInfo = {
      type: ErrorType.PARSE_ERROR,
      message: '',
      timestamp: Date.now(),
      retryable: false,
      fallbackAvailable: false,
    };
    expect(shouldShowRetry(info)).toBe(false);
  });
});

describe('shouldUseFallback', () => {
  it('returns true when fallback is available', () => {
    const info: ErrorInfo = {
      type: ErrorType.API_ERROR,
      message: '',
      timestamp: Date.now(),
      retryable: false,
      fallbackAvailable: true,
    };
    expect(shouldUseFallback(info)).toBe(true);
  });

  it('returns false when no fallback', () => {
    const info: ErrorInfo = {
      type: ErrorType.API_ERROR,
      message: '',
      timestamp: Date.now(),
      retryable: false,
      fallbackAvailable: false,
    };
    expect(shouldUseFallback(info)).toBe(false);
  });
});

describe('getRetryDelay', () => {
  it('returns a positive number', () => {
    const info: ErrorInfo = {
      type: ErrorType.NETWORK_ERROR,
      message: '',
      timestamp: Date.now(),
      retryable: true,
      fallbackAvailable: false,
    };
    const delay = getRetryDelay(info, 1);
    expect(delay).toBeGreaterThan(0);
  });

  it('increases delay with attempt count', () => {
    const info: ErrorInfo = {
      type: ErrorType.NETWORK_ERROR,
      message: '',
      timestamp: Date.now(),
      retryable: true,
      fallbackAvailable: false,
    };
    const delay1 = getRetryDelay(info, 1);
    const delay2 = getRetryDelay(info, 2);
    expect(delay2).toBeGreaterThan(delay1);
  });
});

describe('withErrorHandling', () => {
  it('resolves with the operation result on success', async () => {
    const result = await withErrorHandling(() => Promise.resolve('ok'));
    expect(result).toBe('ok');
  });

  it('throws after max retries on persistent failure', async () => {
    const failOp = () => Promise.reject(new Error('always fails'));
    await expect(withErrorHandling(failOp, undefined, 1)).rejects.toThrow();
  });
});
