/**
 * Cache Initialization Utility
 * 
 * Handles cache initialization and cleanup on page refresh.
 * This utility ensures that caches are properly managed across page loads
 * and provides mechanisms for cache invalidation when needed.
 * 
 * Requirements: 5.1, 5.3
 */

import { versionCache } from './versionCache';

/**
 * Cache initialization configuration
 */
const CACHE_INIT_CONFIG = {
  // Key to track if this is a fresh page load
  PAGE_LOAD_KEY: 'kiro_page_load_timestamp',
  // Key to track cache initialization
  CACHE_INIT_KEY: 'kiro_cache_initialized',
} as const;

/**
 * Cache initializer class
 */
class CacheInitializer {
  private isInitialized = false;

  /**
   * Initializes caches on application startup
   * This should be called once when the application starts
   */
  initialize(): void {
    if (this.isInitialized) {
      return;
    }

    try {
      // Check if this is a fresh page load
      const currentTimestamp = Date.now();
      const lastPageLoad = sessionStorage.getItem(CACHE_INIT_CONFIG.PAGE_LOAD_KEY);
      
      if (!lastPageLoad) {
        // First time loading the page in this session
        console.log('Fresh page load detected - initializing caches');
        this.handleFreshPageLoad(currentTimestamp);
      } else {
        // Page was already loaded in this session (e.g., navigation within SPA)
        console.log('Existing session detected - preserving caches');
        this.handleExistingSession(currentTimestamp);
      }

      // Mark as initialized
      sessionStorage.setItem(CACHE_INIT_CONFIG.CACHE_INIT_KEY, currentTimestamp.toString());
      this.isInitialized = true;

      console.log('Cache initialization completed');
    } catch (error) {
      console.warn('Failed to initialize caches:', error);
      // Don't throw - cache initialization failure shouldn't break the app
    }
  }

  /**
   * Handles cache setup for fresh page loads
   * On fresh page loads, we keep existing caches but update the timestamp
   */
  private handleFreshPageLoad(timestamp: number): void {
    // Update page load timestamp
    sessionStorage.setItem(CACHE_INIT_CONFIG.PAGE_LOAD_KEY, timestamp.toString());
    
    // Check if version cache is still valid
    const cacheStats = versionCache.getStats();
    const remainingTime = versionCache.getRemainingCacheTime();
    
    if (remainingTime && remainingTime > 0) {
      console.log(`Version cache is valid for ${Math.ceil(remainingTime / (1000 * 60))} more minutes`);
    } else if (cacheStats.hits > 0 || cacheStats.misses > 0) {
      console.log('Version cache expired - will be refreshed on next request');
    }
  }

  /**
   * Handles cache setup for existing sessions
   * For existing sessions (SPA navigation), we preserve all caches
   */
  private handleExistingSession(timestamp: number): void {
    // Update the last access timestamp
    sessionStorage.setItem(CACHE_INIT_CONFIG.PAGE_LOAD_KEY, timestamp.toString());
    
    // Log cache status
    const remainingTime = versionCache.getRemainingCacheTime();
    if (remainingTime && remainingTime > 0) {
      console.log(`Version cache active (${Math.ceil(remainingTime / (1000 * 60))}m remaining)`);
    }
  }

  /**
   * Forces cache invalidation (useful for development or troubleshooting)
   */
  invalidateAllCaches(): void {
    try {
      versionCache.clearAll();
      sessionStorage.removeItem(CACHE_INIT_CONFIG.PAGE_LOAD_KEY);
      sessionStorage.removeItem(CACHE_INIT_CONFIG.CACHE_INIT_KEY);
      
      console.log('All caches invalidated');
    } catch (error) {
      console.warn('Failed to invalidate caches:', error);
    }
  }

  /**
   * Gets cache initialization status
   */
  getInitializationStatus() {
    const pageLoadTime = sessionStorage.getItem(CACHE_INIT_CONFIG.PAGE_LOAD_KEY);
    const cacheInitTime = sessionStorage.getItem(CACHE_INIT_CONFIG.CACHE_INIT_KEY);
    
    return {
      isInitialized: this.isInitialized,
      pageLoadTime: pageLoadTime ? new Date(parseInt(pageLoadTime)) : null,
      cacheInitTime: cacheInitTime ? new Date(parseInt(cacheInitTime)) : null,
      versionCacheStats: versionCache.getStats(),
      versionCacheRemaining: versionCache.getRemainingCacheTime(),
    };
  }

  /**
   * Checks if caches should be refreshed based on various conditions
   */
  shouldRefreshCaches(): boolean {
    // Check if version cache is expired
    const remainingTime = versionCache.getRemainingCacheTime();
    if (!remainingTime || remainingTime <= 0) {
      return true;
    }

    // Check if it's been more than 5 minutes since last cache access
    const stats = versionCache.getStats();
    if (stats.lastAccess) {
      const timeSinceLastAccess = Date.now() - stats.lastAccess;
      const fiveMinutes = 5 * 60 * 1000;
      if (timeSinceLastAccess > fiveMinutes) {
        return true;
      }
    }

    return false;
  }
}

// Create singleton instance
export const cacheInitializer = new CacheInitializer();

/**
 * Hook for React components to use cache initialization
 */
export const useCacheInitializer = () => {
  const initialize = () => cacheInitializer.initialize();
  const invalidateAll = () => cacheInitializer.invalidateAllCaches();
  const getStatus = () => cacheInitializer.getInitializationStatus();
  const shouldRefresh = () => cacheInitializer.shouldRefreshCaches();

  return {
    initialize,
    invalidateAll,
    getStatus,
    shouldRefresh,
  };
};

/**
 * Utility function to initialize caches on app startup
 * Call this in your main App component or index file
 */
export const initializeCaches = () => {
  cacheInitializer.initialize();
};

export default cacheInitializer;