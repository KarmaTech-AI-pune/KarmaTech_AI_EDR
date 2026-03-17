/**
 * Unit Tests for Cache Initializer Utility
 * 
 * Tests cache initialization, management, and cleanup functionality.
 * Covers all public methods and edge cases for cache management.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { cacheInitializer, useCacheInitializer, initializeCaches } from './cacheInitializer';
import { versionCache } from './versionCache';

// Mock the versionCache module
vi.mock('./versionCache', () => ({
  versionCache: {
    getStats: vi.fn(),
    getRemainingCacheTime: vi.fn(),
    clearAll: vi.fn(),
  },
}));

// Mock console methods to avoid noise in tests
const mockConsole = {
  log: vi.fn(),
  warn: vi.fn(),
};

describe('CacheInitializer', () => {
  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks();
    
    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(mockConsole.log);
    vi.spyOn(console, 'warn').mockImplementation(mockConsole.warn);
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Reset the initializer state
    (cacheInitializer as any).isInitialized = false;
    
    // Setup default mock returns
    (versionCache.getStats as any).mockReturnValue({
      hits: 0,
      misses: 0,
      lastAccess: null,
    });
    (versionCache.getRemainingCacheTime as any).mockReturnValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    sessionStorage.clear();
  });

  describe('initialize()', () => {
    describe('Fresh Page Load', () => {
      it('should initialize caches on fresh page load', () => {
        // Arrange
        const mockStats = { hits: 5, misses: 2, lastAccess: Date.now() };
        const mockRemainingTime = 300000; // 5 minutes
        (versionCache.getStats as any).mockReturnValue(mockStats);
        (versionCache.getRemainingCacheTime as any).mockReturnValue(mockRemainingTime);

        // Act
        cacheInitializer.initialize();

        // Assert
        expect(sessionStorage.getItem('kiro_page_load_timestamp')).toBeTruthy();
        expect(sessionStorage.getItem('kiro_cache_initialized')).toBeTruthy();
        expect(mockConsole.log).toHaveBeenCalledWith('Fresh page load detected - initializing caches');
        expect(mockConsole.log).toHaveBeenCalledWith('Cache initialization completed');
      });

      it('should handle fresh page load with expired version cache', () => {
        // Arrange
        const mockStats = { hits: 10, misses: 3, lastAccess: Date.now() - 600000 };
        (versionCache.getStats as any).mockReturnValue(mockStats);
        (versionCache.getRemainingCacheTime as any).mockReturnValue(0);

        // Act
        cacheInitializer.initialize();

        // Assert
        expect(mockConsole.log).toHaveBeenCalledWith('Fresh page load detected - initializing caches');
        expect(mockConsole.log).toHaveBeenCalledWith('Version cache expired - will be refreshed on next request');
      });

      it('should handle fresh page load with no existing cache', () => {
        // Arrange
        const mockStats = { hits: 0, misses: 0, lastAccess: null };
        (versionCache.getStats as any).mockReturnValue(mockStats);
        (versionCache.getRemainingCacheTime as any).mockReturnValue(null);

        // Act
        cacheInitializer.initialize();

        // Assert
        expect(sessionStorage.getItem('kiro_page_load_timestamp')).toBeTruthy();
        expect(mockConsole.log).toHaveBeenCalledWith('Fresh page load detected - initializing caches');
      });
    });

    describe('Existing Session', () => {
      it('should preserve caches for existing session', () => {
        // Arrange
        const existingTimestamp = (Date.now() - 60000).toString(); // 1 minute ago
        sessionStorage.setItem('kiro_page_load_timestamp', existingTimestamp);
        
        const mockRemainingTime = 240000; // 4 minutes
        (versionCache.getRemainingCacheTime as any).mockReturnValue(mockRemainingTime);

        // Act
        cacheInitializer.initialize();

        // Assert
        expect(mockConsole.log).toHaveBeenCalledWith('Existing session detected - preserving caches');
        expect(mockConsole.log).toHaveBeenCalledWith('Version cache active (4m remaining)');
        expect(sessionStorage.getItem('kiro_page_load_timestamp')).not.toBe(existingTimestamp);
      });

      it('should handle existing session with expired cache', () => {
        // Arrange
        const existingTimestamp = (Date.now() - 60000).toString();
        sessionStorage.setItem('kiro_page_load_timestamp', existingTimestamp);
        
        (versionCache.getRemainingCacheTime as any).mockReturnValue(0);

        // Act
        cacheInitializer.initialize();

        // Assert
        expect(mockConsole.log).toHaveBeenCalledWith('Existing session detected - preserving caches');
        expect(mockConsole.log).not.toHaveBeenCalledWith(expect.stringContaining('Version cache active'));
      });
    });

    describe('Multiple Initialization', () => {
      it('should not reinitialize if already initialized', () => {
        // Arrange
        cacheInitializer.initialize(); // First initialization
        mockConsole.log.mockClear();

        // Act
        cacheInitializer.initialize(); // Second initialization

        // Assert
        expect(mockConsole.log).not.toHaveBeenCalled();
      });
    });

    describe('Error Handling', () => {
      it('should handle sessionStorage errors gracefully', () => {
        // Arrange
        const originalSetItem = sessionStorage.setItem;
        sessionStorage.setItem = vi.fn().mockImplementation(() => {
          throw new Error('Storage quota exceeded');
        });

        // Act & Assert - Should not throw and should handle error gracefully
        expect(() => cacheInitializer.initialize()).not.toThrow();
        
        // Cleanup
        sessionStorage.setItem = originalSetItem;
      });

      it('should handle versionCache errors gracefully', () => {
        // Arrange
        (versionCache.getStats as any).mockImplementation(() => {
          throw new Error('Cache access error');
        });

        // Act
        cacheInitializer.initialize();

        // Assert
        // Should not throw and should handle error gracefully
        expect((versionCache.getStats as any)).toHaveBeenCalled();
      });
    });
  });

  describe('invalidateAllCaches()', () => {
    it('should clear all caches and session storage', () => {
      // Arrange
      sessionStorage.setItem('kiro_page_load_timestamp', Date.now().toString());
      sessionStorage.setItem('kiro_cache_initialized', Date.now().toString());

      // Act
      cacheInitializer.invalidateAllCaches();

      // Assert
      expect(versionCache.clearAll).toHaveBeenCalled();
      expect(sessionStorage.getItem('kiro_page_load_timestamp')).toBeNull();
      expect(sessionStorage.getItem('kiro_cache_initialized')).toBeNull();
      expect(mockConsole.log).toHaveBeenCalledWith('All caches invalidated');
    });

    it('should handle cache clearing errors gracefully', () => {
      // Arrange
      (versionCache.clearAll as any).mockImplementation(() => {
        throw new Error('Failed to clear cache');
      });

      // Act
      cacheInitializer.invalidateAllCaches();

      // Assert
      // Should not throw and should handle error gracefully
      expect((versionCache.clearAll as any)).toHaveBeenCalled();
    });

    it('should handle sessionStorage errors during invalidation', () => {
      // Arrange
      const originalRemoveItem = sessionStorage.removeItem;
      sessionStorage.removeItem = vi.fn().mockImplementation(() => {
        throw new Error('Storage access denied');
      });

      // Act & Assert - Should not throw and should handle error gracefully
      expect(() => cacheInitializer.invalidateAllCaches()).not.toThrow();
      
      // Cleanup
      sessionStorage.removeItem = originalRemoveItem;
    });
  });

  describe('getInitializationStatus()', () => {
    it('should return complete initialization status', () => {
      // Arrange
      const pageLoadTime = Date.now() - 120000; // 2 minutes ago
      const cacheInitTime = Date.now() - 60000; // 1 minute ago
      const mockStats = { hits: 15, misses: 3, lastAccess: Date.now() - 30000 };
      const mockRemainingTime = 180000; // 3 minutes
      
      sessionStorage.setItem('kiro_page_load_timestamp', pageLoadTime.toString());
      sessionStorage.setItem('kiro_cache_initialized', cacheInitTime.toString());
      (versionCache.getStats as any).mockReturnValue(mockStats);
      (versionCache.getRemainingCacheTime as any).mockReturnValue(mockRemainingTime);
      
      cacheInitializer.initialize();

      // Act
      const status = cacheInitializer.getInitializationStatus();

      // Assert
      expect(status.isInitialized).toBe(true);
      expect(status.pageLoadTime).toBeInstanceOf(Date);
      expect(status.cacheInitTime).toBeInstanceOf(Date);
      expect(status.versionCacheStats).toBeDefined();
      expect(status.versionCacheRemaining).toBe(mockRemainingTime);
    });

    it('should return status with null timestamps when not set', () => {
      // Act
      const status = cacheInitializer.getInitializationStatus();

      // Assert
      expect(status.isInitialized).toBe(false);
      expect(status.pageLoadTime).toBeNull();
      expect(status.cacheInitTime).toBeNull();
      expect(status.versionCacheStats).toBeDefined();
      expect(status.versionCacheRemaining).toBeDefined();
    });

    it('should handle invalid timestamp values', () => {
      // Arrange
      sessionStorage.setItem('kiro_page_load_timestamp', 'invalid-timestamp');
      sessionStorage.setItem('kiro_cache_initialized', 'also-invalid');

      // Act
      const status = cacheInitializer.getInitializationStatus();

      // Assert
      expect(status.pageLoadTime).toEqual(new Date(NaN));
      expect(status.cacheInitTime).toEqual(new Date(NaN));
    });
  });

  describe('shouldRefreshCaches()', () => {
    it('should return true when version cache is expired', () => {
      // Arrange
      (versionCache.getRemainingCacheTime as any).mockReturnValue(0);

      // Act
      const shouldRefresh = cacheInitializer.shouldRefreshCaches();

      // Assert
      expect(shouldRefresh).toBe(true);
    });

    it('should return true when version cache is null', () => {
      // Arrange
      (versionCache.getRemainingCacheTime as any).mockReturnValue(null);

      // Act
      const shouldRefresh = cacheInitializer.shouldRefreshCaches();

      // Assert
      expect(shouldRefresh).toBe(true);
    });

    it('should return true when last access was more than 5 minutes ago', () => {
      // Arrange
      const sixMinutesAgo = Date.now() - (6 * 60 * 1000);
      const mockStats = { hits: 10, misses: 2, lastAccess: sixMinutesAgo };
      
      (versionCache.getRemainingCacheTime as any).mockReturnValue(120000); // 2 minutes remaining
      (versionCache.getStats as any).mockReturnValue(mockStats);

      // Act
      const shouldRefresh = cacheInitializer.shouldRefreshCaches();

      // Assert
      expect(shouldRefresh).toBe(true);
    });

    it('should return false when cache is valid and recently accessed', () => {
      // Arrange
      const twoMinutesAgo = Date.now() - (2 * 60 * 1000);
      const mockStats = { hits: 10, misses: 2, lastAccess: twoMinutesAgo };
      
      (versionCache.getRemainingCacheTime as any).mockReturnValue(180000); // 3 minutes remaining
      (versionCache.getStats as any).mockReturnValue(mockStats);

      // Act
      const shouldRefresh = cacheInitializer.shouldRefreshCaches();

      // Assert
      expect(shouldRefresh).toBe(false);
    });

    it('should return false when cache is valid and no last access recorded', () => {
      // Arrange
      const mockStats = { hits: 5, misses: 1, lastAccess: null };
      
      (versionCache.getRemainingCacheTime as any).mockReturnValue(240000); // 4 minutes remaining
      (versionCache.getStats as any).mockReturnValue(mockStats);

      // Act
      const shouldRefresh = cacheInitializer.shouldRefreshCaches();

      // Assert
      expect(shouldRefresh).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle Date.now() returning same value multiple times', () => {
      // Arrange
      const fixedTime = 1640995200000; // Fixed timestamp
      vi.spyOn(Date, 'now').mockReturnValue(fixedTime);

      // Act
      cacheInitializer.initialize();

      // Assert
      expect(sessionStorage.getItem('kiro_page_load_timestamp')).toBe(fixedTime.toString());
      expect(sessionStorage.getItem('kiro_cache_initialized')).toBe(fixedTime.toString());
    });

    it('should handle very large timestamp values', () => {
      // Arrange
      const largeTimestamp = Number.MAX_SAFE_INTEGER;
      vi.spyOn(Date, 'now').mockReturnValue(largeTimestamp);

      // Act
      cacheInitializer.initialize();

      // Assert
      expect(sessionStorage.getItem('kiro_page_load_timestamp')).toBe(largeTimestamp.toString());
    });

    it('should handle negative remaining cache time', () => {
      // Arrange
      (versionCache.getRemainingCacheTime as any).mockReturnValue(-60000); // -1 minute

      // Act
      const shouldRefresh = cacheInitializer.shouldRefreshCaches();

      // Assert
      expect(shouldRefresh).toBe(true);
    });
  });
});

describe('useCacheInitializer Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    (cacheInitializer as any).isInitialized = false;
  });

  it('should return all cache initializer methods', () => {
    // Act
    const hook = useCacheInitializer();

    // Assert
    expect(hook).toHaveProperty('initialize');
    expect(hook).toHaveProperty('invalidateAll');
    expect(hook).toHaveProperty('getStatus');
    expect(hook).toHaveProperty('shouldRefresh');
    expect(typeof hook.initialize).toBe('function');
    expect(typeof hook.invalidateAll).toBe('function');
    expect(typeof hook.getStatus).toBe('function');
    expect(typeof hook.shouldRefresh).toBe('function');
  });

  it('should call cacheInitializer.initialize when initialize is called', () => {
    // Arrange
    const initializeSpy = vi.spyOn(cacheInitializer, 'initialize');
    const hook = useCacheInitializer();

    // Act
    hook.initialize();

    // Assert
    expect(initializeSpy).toHaveBeenCalled();
  });

  it('should call cacheInitializer.invalidateAllCaches when invalidateAll is called', () => {
    // Arrange
    const invalidateSpy = vi.spyOn(cacheInitializer, 'invalidateAllCaches');
    const hook = useCacheInitializer();

    // Act
    hook.invalidateAll();

    // Assert
    expect(invalidateSpy).toHaveBeenCalled();
  });

  it('should call cacheInitializer.getInitializationStatus when getStatus is called', () => {
    // Arrange
    const getStatusSpy = vi.spyOn(cacheInitializer, 'getInitializationStatus');
    const hook = useCacheInitializer();

    // Act
    hook.getStatus();

    // Assert
    expect(getStatusSpy).toHaveBeenCalled();
  });

  it('should call cacheInitializer.shouldRefreshCaches when shouldRefresh is called', () => {
    // Arrange
    const shouldRefreshSpy = vi.spyOn(cacheInitializer, 'shouldRefreshCaches');
    const hook = useCacheInitializer();

    // Act
    hook.shouldRefresh();

    // Assert
    expect(shouldRefreshSpy).toHaveBeenCalled();
  });
});

describe('initializeCaches Utility Function', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    (cacheInitializer as any).isInitialized = false;
  });

  it('should call cacheInitializer.initialize', () => {
    // Arrange
    const initializeSpy = vi.spyOn(cacheInitializer, 'initialize');

    // Act
    initializeCaches();

    // Assert
    expect(initializeSpy).toHaveBeenCalled();
  });

  it('should be callable multiple times safely', () => {
    // Arrange
    const initializeSpy = vi.spyOn(cacheInitializer, 'initialize');

    // Act
    initializeCaches();
    initializeCaches();
    initializeCaches();

    // Assert
    expect(initializeSpy).toHaveBeenCalledTimes(3);
  });
});

describe('Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    (cacheInitializer as any).isInitialized = false;
    
    // Setup realistic mock returns
    (versionCache.getStats as any).mockReturnValue({
      hits: 25,
      misses: 5,
      lastAccess: Date.now() - 30000, // 30 seconds ago
    });
    (versionCache.getRemainingCacheTime as any).mockReturnValue(270000); // 4.5 minutes
  });

  it('should complete full initialization cycle', () => {
    // Act
    cacheInitializer.initialize();
    const status = cacheInitializer.getInitializationStatus();
    const shouldRefresh = cacheInitializer.shouldRefreshCaches();

    // Assert
    expect(status.isInitialized).toBe(true);
    expect(status.pageLoadTime).toBeInstanceOf(Date);
    expect(status.cacheInitTime).toBeInstanceOf(Date);
    expect(shouldRefresh).toBe(false);
  });

  it('should handle complete cache invalidation and reinitialization', () => {
    // Arrange
    cacheInitializer.initialize();
    
    // Act
    cacheInitializer.invalidateAllCaches();
    const statusAfterInvalidation = cacheInitializer.getInitializationStatus();
    
    // Reset for reinitialization
    (cacheInitializer as any).isInitialized = false;
    cacheInitializer.initialize();
    const statusAfterReinit = cacheInitializer.getInitializationStatus();

    // Assert
    expect(statusAfterInvalidation.pageLoadTime).toBeNull();
    expect(statusAfterInvalidation.cacheInitTime).toBeNull();
    expect(statusAfterReinit.isInitialized).toBe(true);
  });

  it('should maintain consistent behavior across multiple operations', () => {
    // Act & Assert - Multiple operations should work consistently
    expect(() => {
      cacheInitializer.initialize();
      cacheInitializer.getInitializationStatus();
      cacheInitializer.shouldRefreshCaches();
      cacheInitializer.invalidateAllCaches();
      cacheInitializer.getInitializationStatus();
    }).not.toThrow();
  });
});