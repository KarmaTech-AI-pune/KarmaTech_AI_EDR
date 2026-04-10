/**
 * Unit Tests for Version Cache Utility
 * 
 * Tests version caching functionality including cache management,
 * expiration, statistics tracking, and error handling.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { versionCache, useVersionCache } from './versionCache';
import type { VersionInfo } from '../services/versionApi';

// Mock console methods to avoid noise in tests
const mockConsole = {
  log: vi.fn(),
  warn: vi.fn(),
};

describe('Version Cache Utility', () => {
  // Sample version info for testing
  const sampleVersionInfo: VersionInfo = {
    version: '1.12.0',
    buildDate: '2024-03-17T10:30:00.000Z',
    displayVersion: 'v1.12.0',
    fullVersion: '1.12.0-beta.1',
    commitHash: 'abc123def456',
    environment: 'development'
  };

  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks();
    
    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(mockConsole.log);
    vi.spyOn(console, 'warn').mockImplementation(mockConsole.warn);
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Reset cache manager state
    versionCache.clearAll();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    sessionStorage.clear();
  });

  describe('getCachedVersion()', () => {
    describe('Cache Miss Scenarios', () => {
      it('should return null when no cache exists', () => {
        // Act
        const result = versionCache.getCachedVersion();

        // Assert
        expect(result).toBeNull();
      });

      it('should return null when cache is expired', () => {
        // Arrange
        const expiredTimestamp = Date.now() - (31 * 60 * 1000); // 31 minutes ago
        const expiredCache = {
          versionInfo: sampleVersionInfo,
          timestamp: expiredTimestamp,
          expiresAt: expiredTimestamp + (30 * 60 * 1000) // Expired 1 minute ago
        };
        sessionStorage.setItem('kiro_version_cache_v1.2', JSON.stringify(expiredCache));

        // Act
        const result = versionCache.getCachedVersion();

        // Assert
        expect(result).toBeNull();
        expect(sessionStorage.getItem('kiro_version_cache_v1.2')).toBeNull(); // Should be removed
      });

      it('should handle corrupted cache data gracefully', () => {
        // Arrange
        sessionStorage.setItem('kiro_version_cache_v1.2', 'invalid-json');

        // Act
        const result = versionCache.getCachedVersion();

        // Assert
        expect(result).toBeNull();
        expect(mockConsole.warn).toHaveBeenCalledWith('Failed to retrieve cached version:', expect.any(Error));
      });

      it('should handle missing required properties in cache', () => {
        // Arrange
        const invalidCache = {
          versionInfo: sampleVersionInfo,
          timestamp: Date.now()
          // Missing expiresAt
        };
        sessionStorage.setItem('kiro_version_cache_v1.2', JSON.stringify(invalidCache));

        // Act
        const result = versionCache.getCachedVersion();

        // Assert
        expect(result).toBeNull();
      });
    });

    describe('Cache Hit Scenarios', () => {
      it('should return cached version when valid cache exists', () => {
        // Arrange
        const now = Date.now();
        const validCache = {
          versionInfo: sampleVersionInfo,
          timestamp: now,
          expiresAt: now + (30 * 60 * 1000) // 30 minutes from now
        };
        sessionStorage.setItem('kiro_version_cache_v1.2', JSON.stringify(validCache));

        // Act
        const result = versionCache.getCachedVersion();

        // Assert
        expect(result).toEqual(sampleVersionInfo);
      });

      it('should return cached version when cache is about to expire but still valid', () => {
        // Arrange
        const now = Date.now();
        const almostExpiredCache = {
          versionInfo: sampleVersionInfo,
          timestamp: now - (29 * 60 * 1000), // 29 minutes ago
          expiresAt: now + (1 * 60 * 1000) // 1 minute from now
        };
        sessionStorage.setItem('kiro_version_cache_v1.2', JSON.stringify(almostExpiredCache));

        // Act
        const result = versionCache.getCachedVersion();

        // Assert
        expect(result).toEqual(sampleVersionInfo);
      });
    });

    describe('Statistics Tracking', () => {
      it('should track cache misses', () => {
        // Act
        versionCache.getCachedVersion();
        const stats = versionCache.getStats();

        // Assert
        expect(stats.misses).toBe(1);
        expect(stats.hits).toBe(0);
        expect(stats.lastAccess).toBeGreaterThan(0);
      });

      it('should track cache hits', () => {
        // Arrange
        versionCache.setCachedVersion(sampleVersionInfo);

        // Act
        versionCache.getCachedVersion();
        const stats = versionCache.getStats();

        // Assert
        expect(stats.hits).toBe(1);
        expect(stats.misses).toBe(0);
      });
    });
  });

  describe('setCachedVersion()', () => {
    it('should cache version information with correct expiration', () => {
      // Arrange
      const beforeCache = Date.now();

      // Act
      versionCache.setCachedVersion(sampleVersionInfo);

      // Assert
      const cachedJson = sessionStorage.getItem('kiro_version_cache_v1.2');
      expect(cachedJson).toBeTruthy();

      const cachedData = JSON.parse(cachedJson!);
      expect(cachedData.versionInfo).toEqual(sampleVersionInfo);
      expect(cachedData.timestamp).toBeGreaterThanOrEqual(beforeCache);
      expect(cachedData.expiresAt).toBe(cachedData.timestamp + (30 * 60 * 1000));
    });

    it('should log successful caching', () => {
      // Act
      versionCache.setCachedVersion(sampleVersionInfo);

      // Assert
      expect(mockConsole.log).toHaveBeenCalledWith('Version v1.12.0 cached for 30 minutes');
    });

    it('should handle sessionStorage errors gracefully', () => {
      // Arrange
      const originalSetItem = sessionStorage.setItem;
      sessionStorage.setItem = vi.fn().mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      // Act & Assert - Should not throw and should handle error gracefully
      expect(() => versionCache.setCachedVersion(sampleVersionInfo)).not.toThrow();
      
      // Cleanup
      sessionStorage.setItem = originalSetItem;
    });

    it('should overwrite existing cache', () => {
      // Arrange
      const firstVersion: VersionInfo = { 
        ...sampleVersionInfo, 
        version: '1.0.0', 
        displayVersion: 'v1.0.0',
        fullVersion: '1.0.0-release'
      };
      const secondVersion: VersionInfo = { 
        ...sampleVersionInfo, 
        version: '2.0.0', 
        displayVersion: 'v2.0.0',
        fullVersion: '2.0.0-release'
      };

      // Act
      versionCache.setCachedVersion(firstVersion);
      versionCache.setCachedVersion(secondVersion);

      // Assert
      const cached = versionCache.getCachedVersion();
      expect(cached).toEqual(secondVersion);
    });
  });

  describe('invalidateCache()', () => {
    it('should remove cached version data', () => {
      // Arrange
      versionCache.setCachedVersion(sampleVersionInfo);
      expect(versionCache.isCached()).toBe(true);

      // Act
      versionCache.invalidateCache();

      // Assert
      expect(versionCache.isCached()).toBe(false);
      expect(sessionStorage.getItem('kiro_version_cache_v1.2')).toBeNull();
    });

    it('should log successful invalidation', () => {
      // Arrange
      versionCache.setCachedVersion(sampleVersionInfo);

      // Act
      versionCache.invalidateCache();

      // Assert
      expect(mockConsole.log).toHaveBeenCalledWith('Version cache invalidated');
    });

    it('should track invalidation in statistics', () => {
      // Arrange
      versionCache.setCachedVersion(sampleVersionInfo);

      // Act
      versionCache.invalidateCache();
      const stats = versionCache.getStats();

      // Assert
      expect(stats.invalidations).toBe(1);
    });

    it('should handle sessionStorage errors gracefully', () => {
      // Arrange
      const originalRemoveItem = sessionStorage.removeItem;
      sessionStorage.removeItem = vi.fn().mockImplementation(() => {
        throw new Error('Storage access denied');
      });

      // Act & Assert - Should not throw and should handle error gracefully
      expect(() => versionCache.invalidateCache()).not.toThrow();
      
      // Cleanup
      sessionStorage.removeItem = originalRemoveItem;
    });

    it('should work safely when no cache exists', () => {
      // Act & Assert - Should not throw
      expect(() => versionCache.invalidateCache()).not.toThrow();
    });
  });

  describe('isCached()', () => {
    it('should return false when no cache exists', () => {
      // Act
      const result = versionCache.isCached();

      // Assert
      expect(result).toBe(false);
    });

    it('should return true when valid cache exists', () => {
      // Arrange
      versionCache.setCachedVersion(sampleVersionInfo);

      // Act
      const result = versionCache.isCached();

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when cache is expired', () => {
      // Arrange
      const expiredCache = {
        versionInfo: sampleVersionInfo,
        timestamp: Date.now() - (31 * 60 * 1000),
        expiresAt: Date.now() - (1 * 60 * 1000)
      };
      sessionStorage.setItem('kiro_version_cache_v1.2', JSON.stringify(expiredCache));

      // Act
      const result = versionCache.isCached();

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('getStats()', () => {
    it('should return initial statistics', () => {
      // Act
      const stats = versionCache.getStats();

      // Assert
      expect(stats).toEqual({
        hits: 0,
        misses: 0,
        invalidations: 0,
        lastAccess: null
      });
    });

    it('should return updated statistics after operations', () => {
      // Arrange & Act
      versionCache.getCachedVersion(); // Miss
      versionCache.setCachedVersion(sampleVersionInfo);
      versionCache.getCachedVersion(); // Hit
      versionCache.invalidateCache();

      const stats = versionCache.getStats();

      // Assert
      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(1);
      expect(stats.invalidations).toBe(1);
      expect(stats.lastAccess).toBeGreaterThan(0);
    });

    it('should return a copy of statistics (not reference)', () => {
      // Act
      const stats1 = versionCache.getStats();
      const stats2 = versionCache.getStats();

      // Assert
      expect(stats1).not.toBe(stats2); // Different objects
      expect(stats1).toEqual(stats2); // Same content
    });
  });

  describe('getHitRatio()', () => {
    it('should return null when no requests have been made', () => {
      // Act
      const hitRatio = versionCache.getHitRatio();

      // Assert
      expect(hitRatio).toBeNull();
    });

    it('should return 0% for all misses', () => {
      // Arrange
      versionCache.getCachedVersion(); // Miss
      versionCache.getCachedVersion(); // Miss

      // Act
      const hitRatio = versionCache.getHitRatio();

      // Assert
      expect(hitRatio).toBe(0);
    });

    it('should return 100% for all hits', () => {
      // Arrange
      versionCache.setCachedVersion(sampleVersionInfo);
      versionCache.getCachedVersion(); // Hit
      versionCache.getCachedVersion(); // Hit

      // Act
      const hitRatio = versionCache.getHitRatio();

      // Assert
      expect(hitRatio).toBe(100);
    });

    it('should return correct percentage for mixed hits and misses', () => {
      // Arrange
      versionCache.getCachedVersion(); // Miss
      versionCache.setCachedVersion(sampleVersionInfo);
      versionCache.getCachedVersion(); // Hit
      versionCache.getCachedVersion(); // Hit
      versionCache.getCachedVersion(); // Hit

      // Act
      const hitRatio = versionCache.getHitRatio();

      // Assert
      expect(hitRatio).toBe(75); // 3 hits out of 4 total = 75%
    });

    it('should round to nearest integer', () => {
      // Arrange - Create scenario with 1 hit out of 3 requests (33.33%)
      versionCache.getCachedVersion(); // Miss
      versionCache.getCachedVersion(); // Miss
      versionCache.setCachedVersion(sampleVersionInfo);
      versionCache.getCachedVersion(); // Hit

      // Act
      const hitRatio = versionCache.getHitRatio();

      // Assert
      expect(hitRatio).toBe(33); // Rounded from 33.33%
    });
  });

  describe('getRemainingCacheTime()', () => {
    it('should return null when no cache exists', () => {
      // Act
      const remainingTime = versionCache.getRemainingCacheTime();

      // Assert
      expect(remainingTime).toBeNull();
    });

    it('should return remaining time for valid cache', () => {
      // Arrange
      versionCache.setCachedVersion(sampleVersionInfo);

      // Act
      const remainingTime = versionCache.getRemainingCacheTime();

      // Assert
      expect(remainingTime).toBeGreaterThan(29 * 60 * 1000); // Should be close to 30 minutes
      expect(remainingTime).toBeLessThanOrEqual(30 * 60 * 1000);
    });

    it('should return null for expired cache', () => {
      // Arrange
      const expiredCache = {
        versionInfo: sampleVersionInfo,
        timestamp: Date.now() - (31 * 60 * 1000),
        expiresAt: Date.now() - (1 * 60 * 1000)
      };
      sessionStorage.setItem('kiro_version_cache_v1.2', JSON.stringify(expiredCache));

      // Act
      const remainingTime = versionCache.getRemainingCacheTime();

      // Assert
      expect(remainingTime).toBeNull();
    });

    it('should handle corrupted cache data gracefully', () => {
      // Arrange
      sessionStorage.setItem('kiro_version_cache_v1.2', 'invalid-json');

      // Act
      const remainingTime = versionCache.getRemainingCacheTime();

      // Assert
      expect(remainingTime).toBeNull();
    });
  });

  describe('clearAll()', () => {
    it('should clear all cache data and statistics', () => {
      // Arrange - Ensure clean start
      versionCache.clearAll();
      
      // Set up test data
      versionCache.setCachedVersion(sampleVersionInfo);
      const cachedVersion = versionCache.getCachedVersion(); // This should be a hit
      expect(cachedVersion).not.toBeNull(); // Verify it's actually cached

      // Act
      versionCache.clearAll();

      // Assert - Stats should be completely reset
      const finalStats = versionCache.getStats();
      expect(finalStats.hits).toBe(0);
      expect(finalStats.misses).toBe(0);
      expect(finalStats.invalidations).toBe(0);
      expect(finalStats.lastAccess).toBeNull();
      
      // SessionStorage should be cleared
      expect(sessionStorage.getItem('kiro_version_cache_v1.2')).toBeNull();
      expect(sessionStorage.getItem('kiro_version_cache_stats_v1.2')).toBeNull();
      
      // Verify cache is actually cleared (this will increment miss count, but we check it last)
      expect(versionCache.getCachedVersion()).toBeNull();
    });

    it('should log successful clearing', () => {
      // Act
      versionCache.clearAll();

      // Assert
      expect(mockConsole.log).toHaveBeenCalledWith('All version cache data cleared');
    });

    it('should handle sessionStorage errors gracefully', () => {
      // Arrange
      const originalRemoveItem = sessionStorage.removeItem;
      sessionStorage.removeItem = vi.fn().mockImplementation(() => {
        throw new Error('Storage access denied');
      });

      // Act & Assert - Should not throw and should handle error gracefully
      expect(() => versionCache.clearAll()).not.toThrow();
      
      // Cleanup
      sessionStorage.removeItem = originalRemoveItem;
    });
  });

  describe('Statistics Persistence', () => {
    it('should persist statistics across cache manager instances', () => {
      // Arrange
      versionCache.setCachedVersion(sampleVersionInfo);
      versionCache.getCachedVersion(); // Hit

      // Act - Get stats before and after
      const statsBeforeClear = versionCache.getStats();
      
      // Simulate persistence by checking stats are saved to sessionStorage
      const statsJson = sessionStorage.getItem('kiro_version_cache_stats_v1.2');
      expect(statsJson).toBeTruthy();
      
      const persistedStats = JSON.parse(statsJson!);

      // Assert
      expect(persistedStats.hits).toBe(statsBeforeClear.hits);
      expect(persistedStats.lastAccess).toBe(statsBeforeClear.lastAccess);
    });

    it('should handle corrupted statistics gracefully', () => {
      // Arrange
      sessionStorage.setItem('kiro_version_cache_stats_v1.2', 'invalid-json');

      // Act
      versionCache.clearAll(); // This will reload stats
      const stats = versionCache.getStats();

      // Assert
      expect(stats).toEqual({
        hits: 0,
        misses: 0,
        invalidations: 0,
        lastAccess: null
      });
    });
  });
});

describe('useVersionCache Hook', () => {
  const sampleVersionInfo: VersionInfo = {
    version: '1.12.0',
    buildDate: '2024-03-17T10:30:00.000Z',
    displayVersion: 'v1.12.0',
    fullVersion: '1.12.0-beta.1',
    commitHash: 'abc123def456',
    environment: 'development'
  };

  beforeEach(() => {
    sessionStorage.clear();
    versionCache.clearAll();
  });

  it('should return all cache management functions', () => {
    // Act
    const hook = useVersionCache();

    // Assert
    expect(hook).toHaveProperty('getCached');
    expect(hook).toHaveProperty('setCached');
    expect(hook).toHaveProperty('invalidate');
    expect(hook).toHaveProperty('isCached');
    expect(hook).toHaveProperty('getStats');
    expect(hook).toHaveProperty('getHitRatio');
    expect(hook).toHaveProperty('getRemainingTime');

    // All should be functions
    Object.values(hook).forEach(fn => {
      expect(typeof fn).toBe('function');
    });
  });

  it('should provide working cache operations', () => {
    // Arrange
    const hook = useVersionCache();

    // Act & Assert
    expect(hook.isCached()).toBe(false);
    
    hook.setCached(sampleVersionInfo);
    expect(hook.isCached()).toBe(true);
    
    const cached = hook.getCached();
    expect(cached).toEqual(sampleVersionInfo);
    
    hook.invalidate();
    expect(hook.isCached()).toBe(false);
  });

  it('should provide working statistics operations', () => {
    // Arrange
    const hook = useVersionCache();

    // Act
    hook.getCached(); // Miss
    hook.setCached(sampleVersionInfo);
    hook.getCached(); // Hit

    const stats = hook.getStats();
    const hitRatio = hook.getHitRatio();

    // Assert
    expect(stats.hits).toBe(1);
    expect(stats.misses).toBe(1);
    expect(hitRatio).toBe(50);
  });

  it('should provide working time operations', () => {
    // Arrange
    const hook = useVersionCache();

    // Act
    expect(hook.getRemainingTime()).toBeNull();
    
    hook.setCached(sampleVersionInfo);
    const remainingTime = hook.getRemainingTime();

    // Assert
    expect(remainingTime).toBeGreaterThan(0);
    expect(remainingTime).toBeLessThanOrEqual(30 * 60 * 1000);
  });
});

describe('Integration Tests', () => {
  const sampleVersionInfo: VersionInfo = {
    version: '1.12.0',
    buildDate: '2024-03-17T10:30:00.000Z',
    displayVersion: 'v1.12.0',
    fullVersion: '1.12.0-beta.1',
    commitHash: 'abc123def456',
    environment: 'development'
  };

  beforeEach(() => {
    sessionStorage.clear();
    versionCache.clearAll();
  });

  it('should handle complete cache lifecycle', () => {
    // Act & Assert - Complete lifecycle
    expect(versionCache.isCached()).toBe(false);
    expect(versionCache.getCachedVersion()).toBeNull();
    
    versionCache.setCachedVersion(sampleVersionInfo);
    expect(versionCache.isCached()).toBe(true);
    expect(versionCache.getCachedVersion()).toEqual(sampleVersionInfo);
    
    versionCache.invalidateCache();
    expect(versionCache.isCached()).toBe(false);
    expect(versionCache.getCachedVersion()).toBeNull();
  });

  it('should maintain consistent statistics throughout operations', () => {
    // Act
    versionCache.getCachedVersion(); // Miss 1
    versionCache.getCachedVersion(); // Miss 2
    versionCache.setCachedVersion(sampleVersionInfo);
    versionCache.getCachedVersion(); // Hit 1
    versionCache.getCachedVersion(); // Hit 2
    versionCache.invalidateCache(); // Invalidation 1

    const stats = versionCache.getStats();

    // Assert
    expect(stats.hits).toBe(2);
    expect(stats.misses).toBe(2);
    expect(stats.invalidations).toBe(1);
    expect(versionCache.getHitRatio()).toBe(50);
  });

  it('should work correctly with hook and direct access', () => {
    // Arrange
    const hook = useVersionCache();

    // Act - Mix hook and direct access
    versionCache.setCachedVersion(sampleVersionInfo);
    const hookCached = hook.getCached();
    const directCached = versionCache.getCachedVersion();

    // Assert
    expect(hookCached).toEqual(directCached);
    expect(hookCached).toEqual(sampleVersionInfo);
  });
});