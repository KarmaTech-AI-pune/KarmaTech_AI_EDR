/**
 * Offline support utilities for the interactive version display system
 * Provides offline detection, cached data management, and offline indicators
 */

import { VersionInfo } from '../services/versionApi';
import { ProcessedReleaseNotes } from '../services/releaseNotesApi';

/**
 * Offline state information
 */
export interface OfflineState {
  isOffline: boolean;
  lastOnlineTime: number | null;
  offlineDuration: number; // in milliseconds
}

/**
 * Cached offline data structure
 */
interface OfflineCache {
  version: VersionInfo | null;
  releaseNotes: Record<string, ProcessedReleaseNotes>;
  lastUpdated: number;
}

/**
 * Offline cache configuration
 */
const OFFLINE_CACHE_CONFIG = {
  VERSION_KEY: 'offline_version_cache',
  RELEASE_NOTES_KEY: 'offline_release_notes_cache',
  OFFLINE_STATE_KEY: 'offline_state',
  MAX_CACHE_AGE: 7 * 24 * 60 * 60 * 1000, // 7 days
  OFFLINE_CHECK_INTERVAL: 5000, // 5 seconds
} as const;

/**
 * Offline support manager class
 */
export class OfflineManager {
  private static instance: OfflineManager;
  private offlineState: OfflineState;
  private listeners: Set<(state: OfflineState) => void> = new Set();
  private checkInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.offlineState = this.loadOfflineState();
    this.initializeOfflineDetection();
  }

  /**
   * Gets the singleton instance of OfflineManager
   */
  public static getInstance(): OfflineManager {
    if (!OfflineManager.instance) {
      OfflineManager.instance = new OfflineManager();
    }
    return OfflineManager.instance;
  }

  /**
   * Gets the current offline state
   */
  public getOfflineState(): OfflineState {
    return { ...this.offlineState };
  }

  /**
   * Checks if the application is currently offline
   */
  public isOffline(): boolean {
    return this.offlineState.isOffline;
  }

  /**
   * Adds a listener for offline state changes
   */
  public addOfflineStateListener(listener: (state: OfflineState) => void): void {
    this.listeners.add(listener);
  }

  /**
   * Removes a listener for offline state changes
   */
  public removeOfflineStateListener(listener: (state: OfflineState) => void): void {
    this.listeners.delete(listener);
  }

  /**
   * Initializes offline detection using multiple methods
   */
  private initializeOfflineDetection(): void {
    // Method 1: Navigator online/offline events
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));

    // Method 2: Periodic connectivity check
    this.startPeriodicCheck();

    // Method 3: Initial state from navigator
    this.updateOfflineState(!navigator.onLine);
  }

  /**
   * Handles online event
   */
  private handleOnline(): void {
    console.log('Network: Online event detected');
    this.updateOfflineState(false);
  }

  /**
   * Handles offline event
   */
  private handleOffline(): void {
    console.log('Network: Offline event detected');
    this.updateOfflineState(true);
  }

  /**
   * Starts periodic connectivity check
   */
  private startPeriodicCheck(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    this.checkInterval = setInterval(() => {
      this.checkConnectivity();
    }, OFFLINE_CACHE_CONFIG.OFFLINE_CHECK_INTERVAL);
  }

  /**
   * Checks connectivity by attempting to fetch a small resource
   */
  private async checkConnectivity(): Promise<void> {
    try {
      // Try to fetch a small resource with a short timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      await fetch('/favicon.ico', {
        method: 'HEAD',
        cache: 'no-cache',
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      
      // If we get here, we're online
      if (this.offlineState.isOffline) {
        console.log('Network: Connectivity restored');
        this.updateOfflineState(false);
      }
    } catch (error) {
      // If fetch fails, we might be offline
      if (!this.offlineState.isOffline) {
        console.log('Network: Connectivity lost');
        this.updateOfflineState(true);
      }
    }
  }

  /**
   * Updates the offline state and notifies listeners
   */
  private updateOfflineState(isOffline: boolean): void {
    const now = Date.now();
    const wasOffline = this.offlineState.isOffline;

    if (isOffline !== wasOffline) {
      this.offlineState = {
        isOffline,
        lastOnlineTime: isOffline ? this.offlineState.lastOnlineTime : now,
        offlineDuration: isOffline 
          ? (this.offlineState.lastOnlineTime ? now - this.offlineState.lastOnlineTime : 0)
          : 0
      };

      this.saveOfflineState();
      this.notifyListeners();
    } else if (isOffline && this.offlineState.lastOnlineTime) {
      // Update offline duration
      this.offlineState.offlineDuration = now - this.offlineState.lastOnlineTime;
    }
  }

  /**
   * Notifies all listeners of state changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.getOfflineState());
      } catch (error) {
        console.error('Error notifying offline state listener:', error);
      }
    });
  }

  /**
   * Loads offline state from localStorage
   */
  private loadOfflineState(): OfflineState {
    try {
      const stored = localStorage.getItem(OFFLINE_CACHE_CONFIG.OFFLINE_STATE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          isOffline: !navigator.onLine, // Always check current navigator state
          lastOnlineTime: parsed.lastOnlineTime || Date.now(),
          offlineDuration: parsed.offlineDuration || 0
        };
      }
    } catch (error) {
      console.warn('Failed to load offline state:', error);
    }

    return {
      isOffline: !navigator.onLine,
      lastOnlineTime: Date.now(),
      offlineDuration: 0
    };
  }

  /**
   * Saves offline state to localStorage
   */
  private saveOfflineState(): void {
    try {
      localStorage.setItem(
        OFFLINE_CACHE_CONFIG.OFFLINE_STATE_KEY,
        JSON.stringify(this.offlineState)
      );
    } catch (error) {
      console.warn('Failed to save offline state:', error);
    }
  }

  /**
   * Caches version information for offline use
   */
  public cacheVersionInfo(versionInfo: VersionInfo): void {
    try {
      const cache: OfflineCache = this.loadOfflineCache();
      cache.version = versionInfo;
      cache.lastUpdated = Date.now();
      this.saveOfflineCache(cache);
      console.log('Cached version info for offline use');
    } catch (error) {
      console.warn('Failed to cache version info:', error);
    }
  }

  /**
   * Caches release notes for offline use
   */
  public cacheReleaseNotes(version: string, releaseNotes: ProcessedReleaseNotes): void {
    try {
      const cache: OfflineCache = this.loadOfflineCache();
      cache.releaseNotes[version] = releaseNotes;
      cache.lastUpdated = Date.now();
      this.saveOfflineCache(cache);
      console.log(`Cached release notes for version ${version} for offline use`);
    } catch (error) {
      console.warn(`Failed to cache release notes for version ${version}:`, error);
    }
  }

  /**
   * Gets cached version information for offline use
   */
  public getCachedVersionInfo(): VersionInfo | null {
    try {
      const cache = this.loadOfflineCache();
      
      // Check if cache is too old
      if (cache.lastUpdated && Date.now() - cache.lastUpdated > OFFLINE_CACHE_CONFIG.MAX_CACHE_AGE) {
        console.warn('Cached version info is too old');
        return null;
      }
      
      return cache.version;
    } catch (error) {
      console.warn('Failed to get cached version info:', error);
      return null;
    }
  }

  /**
   * Gets cached release notes for offline use
   */
  public getCachedReleaseNotes(version: string): ProcessedReleaseNotes | null {
    try {
      const cache = this.loadOfflineCache();
      
      // Check if cache is too old
      if (cache.lastUpdated && Date.now() - cache.lastUpdated > OFFLINE_CACHE_CONFIG.MAX_CACHE_AGE) {
        console.warn('Cached release notes are too old');
        return null;
      }
      
      return cache.releaseNotes[version] || null;
    } catch (error) {
      console.warn(`Failed to get cached release notes for version ${version}:`, error);
      return null;
    }
  }

  /**
   * Gets all cached release notes versions
   */
  public getCachedVersions(): string[] {
    try {
      const cache = this.loadOfflineCache();
      return Object.keys(cache.releaseNotes);
    } catch (error) {
      console.warn('Failed to get cached versions:', error);
      return [];
    }
  }

  /**
   * Clears all offline cache
   */
  public clearOfflineCache(): void {
    try {
      localStorage.removeItem(OFFLINE_CACHE_CONFIG.VERSION_KEY);
      localStorage.removeItem(OFFLINE_CACHE_CONFIG.RELEASE_NOTES_KEY);
      console.log('Cleared offline cache');
    } catch (error) {
      console.warn('Failed to clear offline cache:', error);
    }
  }

  /**
   * Gets cache statistics
   */
  public getCacheStats(): {
    hasVersionCache: boolean;
    releaseNotesCount: number;
    cacheAge: number;
    cacheSize: string;
  } {
    try {
      const cache = this.loadOfflineCache();
      const cacheAge = cache.lastUpdated ? Date.now() - cache.lastUpdated : 0;
      
      // Estimate cache size
      const cacheString = JSON.stringify(cache);
      const cacheSize = new Blob([cacheString]).size;
      const cacheSizeFormatted = cacheSize > 1024 
        ? `${(cacheSize / 1024).toFixed(1)} KB`
        : `${cacheSize} bytes`;

      return {
        hasVersionCache: cache.version !== null,
        releaseNotesCount: Object.keys(cache.releaseNotes).length,
        cacheAge,
        cacheSize: cacheSizeFormatted
      };
    } catch (error) {
      console.warn('Failed to get cache stats:', error);
      return {
        hasVersionCache: false,
        releaseNotesCount: 0,
        cacheAge: 0,
        cacheSize: '0 bytes'
      };
    }
  }

  /**
   * Loads offline cache from localStorage
   */
  private loadOfflineCache(): OfflineCache {
    const defaultCache: OfflineCache = {
      version: null,
      releaseNotes: {},
      lastUpdated: 0
    };

    try {
      const versionCache = localStorage.getItem(OFFLINE_CACHE_CONFIG.VERSION_KEY);
      const releaseNotesCache = localStorage.getItem(OFFLINE_CACHE_CONFIG.RELEASE_NOTES_KEY);

      return {
        version: versionCache ? JSON.parse(versionCache) : null,
        releaseNotes: releaseNotesCache ? JSON.parse(releaseNotesCache) : {},
        lastUpdated: Date.now()
      };
    } catch (error) {
      console.warn('Failed to load offline cache:', error);
      return defaultCache;
    }
  }

  /**
   * Saves offline cache to localStorage
   */
  private saveOfflineCache(cache: OfflineCache): void {
    try {
      if (cache.version) {
        localStorage.setItem(OFFLINE_CACHE_CONFIG.VERSION_KEY, JSON.stringify(cache.version));
      }
      
      if (Object.keys(cache.releaseNotes).length > 0) {
        localStorage.setItem(OFFLINE_CACHE_CONFIG.RELEASE_NOTES_KEY, JSON.stringify(cache.releaseNotes));
      }
    } catch (error) {
      console.warn('Failed to save offline cache:', error);
      
      // If localStorage is full, try to clear old entries
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        this.clearOfflineCache();
        // Try again after clearing
        try {
          if (cache.version) {
            localStorage.setItem(OFFLINE_CACHE_CONFIG.VERSION_KEY, JSON.stringify(cache.version));
          }
          if (Object.keys(cache.releaseNotes).length > 0) {
            localStorage.setItem(OFFLINE_CACHE_CONFIG.RELEASE_NOTES_KEY, JSON.stringify(cache.releaseNotes));
          }
        } catch (retryError) {
          console.error('Failed to save offline cache after clearing:', retryError);
        }
      }
    }
  }

  /**
   * Cleanup method to stop intervals and remove listeners
   */
  public cleanup(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }

    window.removeEventListener('online', this.handleOnline.bind(this));
    window.removeEventListener('offline', this.handleOffline.bind(this));
    
    this.listeners.clear();
  }
}

/**
 * Hook for using offline state in React components
 */
export function useOfflineState(): OfflineState {
  const [offlineState, setOfflineState] = React.useState<OfflineState>(
    OfflineManager.getInstance().getOfflineState()
  );

  React.useEffect(() => {
    const offlineManager = OfflineManager.getInstance();
    
    const handleStateChange = (state: OfflineState) => {
      setOfflineState(state);
    };

    offlineManager.addOfflineStateListener(handleStateChange);

    return () => {
      offlineManager.removeOfflineStateListener(handleStateChange);
    };
  }, []);

  return offlineState;
}

/**
 * Utility functions for offline support
 */

/**
 * Formats offline duration for display
 */
export function formatOfflineDuration(duration: number): string {
  if (duration < 60000) { // Less than 1 minute
    return 'Just now';
  } else if (duration < 3600000) { // Less than 1 hour
    const minutes = Math.floor(duration / 60000);
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  } else if (duration < 86400000) { // Less than 1 day
    const hours = Math.floor(duration / 3600000);
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(duration / 86400000);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  }
}

/**
 * Creates an offline indicator message
 */
export function createOfflineMessage(offlineState: OfflineState): string {
  if (!offlineState.isOffline) {
    return 'Online';
  }

  const duration = formatOfflineDuration(offlineState.offlineDuration);
  return `Offline since ${duration}`;
}

/**
 * Global offline manager instance
 */
export const globalOfflineManager = OfflineManager.getInstance();

// Import React for the hook
import React from 'react';

export default OfflineManager;