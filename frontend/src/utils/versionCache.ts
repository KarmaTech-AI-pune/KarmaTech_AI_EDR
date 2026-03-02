/**
 * Version Caching Utility
 * 
 * Provides caching functionality for version information to avoid repeated API calls
 * during the same session. Uses sessionStorage for temporary caching with expiration.
 * 
 * Features:
 * - 30-minute cache expiration
 * - Automatic cache invalidation on page refresh
 * - Type-safe caching with proper error handling
 * - Cache statistics for monitoring
 * 
 * Requirements: 5.1, 5.3
 */

import { VersionInfo } from '../services/versionApi';

interface CachedVersionData {
  versionInfo: VersionInfo;
  timestamp: number;
  expiresAt: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  invalidations: number;
  lastAccess: number | null;
}

/**
 * Version cache configuration
 */
const CACHE_CONFIG = {
  // Cache duration: 30 minutes in milliseconds
  CACHE_DURATION_MS: 30 * 60 * 1000,
  // SessionStorage key for version data
  VERSION_CACHE_KEY: 'kiro_version_cache_v1.2',
  // SessionStorage key for cache statistics
  CACHE_STATS_KEY: 'kiro_version_cache_stats_v1.2',
} as const;

/**
 * Version cache manager class
 */
class VersionCacheManager {
  private stats: CacheStats;

  constructor() {
    this.stats = this.loadStats();
  }

  /**
   * Loads cache statistics from sessionStorage
   */
  private loadStats(): CacheStats {
    try {
      const statsJson = sessionStorage.getItem(CACHE_CONFIG.CACHE_STATS_KEY);
      if (statsJson) {
        return JSON.parse(statsJson);
      }
    } catch (error) {
      console.warn('Failed to load cache stats:', error);
    }

    return {
      hits: 0,
      misses: 0,
      invalidations: 0,
      lastAccess: null,
    };
  }

  /**
   * Saves cache statistics to sessionStorage
   */
  private saveStats(): void {
    try {
      sessionStorage.setItem(CACHE_CONFIG.CACHE_STATS_KEY, JSON.stringify(this.stats));
    } catch (error) {
      console.warn('Failed to save cache stats:', error);
    }
  }

  /**
   * Updates cache statistics
   */
  private updateStats(type: 'hit' | 'miss' | 'invalidation'): void {
    this.stats.lastAccess = Date.now();

    switch (type) {
      case 'hit':
        this.stats.hits++;
        break;
      case 'miss':
        this.stats.misses++;
        break;
      case 'invalidation':
        this.stats.invalidations++;
        break;
    }

    this.saveStats();
  }

  /**
   * Checks if cached data is still valid
   */
  private isValidCache(cachedData: CachedVersionData): boolean {
    const now = Date.now();
    return now < cachedData.expiresAt;
  }

  /**
   * Gets cached version information if available and valid
   * @returns Cached version info or null if not available/expired
   */
  getCachedVersion(): VersionInfo | null {
    try {
      const cachedJson = sessionStorage.getItem(CACHE_CONFIG.VERSION_CACHE_KEY);

      if (!cachedJson) {
        this.updateStats('miss');
        return null;
      }

      const cachedData: CachedVersionData = JSON.parse(cachedJson);

      if (!this.isValidCache(cachedData)) {
        // Cache expired, remove it
        this.invalidateCache();
        this.updateStats('miss');
        return null;
      }

      this.updateStats('hit');
      return cachedData.versionInfo;
    } catch (error) {
      console.warn('Failed to retrieve cached version:', error);
      this.invalidateCache();
      this.updateStats('miss');
      return null;
    }
  }

  /**
   * Caches version information with expiration
   * @param versionInfo - Version information to cache
   */
  setCachedVersion(versionInfo: VersionInfo): void {
    try {
      const now = Date.now();
      const cachedData: CachedVersionData = {
        versionInfo,
        timestamp: now,
        expiresAt: now + CACHE_CONFIG.CACHE_DURATION_MS,
      };

      sessionStorage.setItem(CACHE_CONFIG.VERSION_CACHE_KEY, JSON.stringify(cachedData));
      console.log(`Version ${versionInfo.displayVersion} cached for 30 minutes`);
    } catch (error) {
      console.warn('Failed to cache version:', error);
      // If we can't cache, it's not a critical error - just continue without caching
    }
  }

  /**
   * Invalidates (removes) cached version data
   */
  invalidateCache(): void {
    try {
      sessionStorage.removeItem(CACHE_CONFIG.VERSION_CACHE_KEY);
      this.updateStats('invalidation');
      console.log('Version cache invalidated');
    } catch (error) {
      console.warn('Failed to invalidate cache:', error);
    }
  }

  /**
   * Checks if version is currently cached and valid
   * @returns True if valid cache exists
   */
  isCached(): boolean {
    return this.getCachedVersion() !== null;
  }

  /**
   * Gets cache statistics for monitoring
   * @returns Cache statistics object
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Gets cache hit ratio as percentage
   * @returns Hit ratio (0-100) or null if no requests made
   */
  getHitRatio(): number | null {
    const totalRequests = this.stats.hits + this.stats.misses;
    if (totalRequests === 0) {
      return null;
    }
    return Math.round((this.stats.hits / totalRequests) * 100);
  }

  /**
   * Gets remaining cache time in milliseconds
   * @returns Remaining time or null if no cache
   */
  getRemainingCacheTime(): number | null {
    try {
      const cachedJson = sessionStorage.getItem(CACHE_CONFIG.VERSION_CACHE_KEY);

      if (!cachedJson) {
        return null;
      }

      const cachedData: CachedVersionData = JSON.parse(cachedJson);
      const now = Date.now();
      const remaining = cachedData.expiresAt - now;

      return remaining > 0 ? remaining : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Clears all cache data and statistics
   */
  clearAll(): void {
    try {
      sessionStorage.removeItem(CACHE_CONFIG.VERSION_CACHE_KEY);
      sessionStorage.removeItem(CACHE_CONFIG.CACHE_STATS_KEY);
      this.stats = {
        hits: 0,
        misses: 0,
        invalidations: 0,
        lastAccess: null,
      };
      console.log('All version cache data cleared');
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }
}

// Create singleton instance
export const versionCache = new VersionCacheManager();

/**
 * Hook for React components to use version caching
 * Provides cache status and utilities
 */
export const useVersionCache = () => {
  const getCached = () => versionCache.getCachedVersion();
  const setCached = (versionInfo: VersionInfo) => versionCache.setCachedVersion(versionInfo);
  const invalidate = () => versionCache.invalidateCache();
  const isCached = () => versionCache.isCached();
  const getStats = () => versionCache.getStats();
  const getHitRatio = () => versionCache.getHitRatio();
  const getRemainingTime = () => versionCache.getRemainingCacheTime();

  return {
    getCached,
    setCached,
    invalidate,
    isCached,
    getStats,
    getHitRatio,
    getRemainingTime,
  };
};

export default versionCache;