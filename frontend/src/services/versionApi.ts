/**
 * Version API Service Module
 * 
 * Provides comprehensive version information management with:
 * - Current version fetching from backend API
 * - Version health monitoring and status checks
 * - Intelligent caching with configurable expiration
 * - Semantic version extraction from GitHub tags
 * - Environment detection (dev, staging, prod)
 * - Comprehensive error handling with retry logic
 * - Performance optimization with timeout management
 * 
 * @example
 * ```typescript
 * // Get current version with caching
 * const versionInfo = await versionApi.getCurrentVersion();
 * console.log(versionInfo.displayVersion); // "v1.0.38"
 * 
 * // Get version without cache
 * const freshVersion = await versionApi.getCurrentVersion(5000, false);
 * 
 * // Check version health
 * const health = await versionApi.getVersionHealth();
 * 
 * // Cache management
 * versionApi.cache.invalidate();
 * const hitRatio = versionApi.cache.getHitRatio();
 * ```
 * 
 * @module versionApi
 * @since 1.0.38
 * @author Interactive Version Display Feature Team
 * 
 * Requirements Coverage:
 * - 4.1: API endpoint for current version
 * - 4.3: Semantic version extraction from GitHub tags
 * - 4.4: Structured JSON response handling
 * - 4.5: Comprehensive error handling
 * - 5.1: Performance caching for repeated requests
 * - 5.3: Cache management and invalidation
 */

import { axiosInstance } from './axiosConfig';
import { withErrorHandling } from '../utils/errorHandling';
import { versionCache } from '../utils/versionCache';

/**
 * Interface for the current version response from the backend API
 * Maps to the VersionController response structure in the backend
 */
export interface CurrentVersionResponse {
  /** Indicates if the API request was successful */
  success: boolean;
  
  /** Version data payload */
  data: {
    /** Full version string from GitHub tag (e.g., "v1.0.38-dev.20251223.1") */
    version: string;
    
    /** ISO date string of when the build was created */
    buildDate: string;
    
    /** Git commit hash for the build */
    commitHash: string;
    
    /** .NET assembly version */
    assemblyVersion: string;
    
    /** File version information */
    fileVersion: string;
    
    /** Product version information */
    productVersion: string;
  };
  
  /** Timestamp when the response was generated */
  timestamp: string;
}

/**
 * Interface for version health check response from the backend API
 * Provides comprehensive system health and version information
 */
export interface VersionHealthResponse {
  /** Overall system status (e.g., "Healthy", "Degraded", "Unhealthy") */
  status: string;
  
  /** Current deployed version */
  version: string;
  
  /** Git commit hash */
  commitHash: string;
  
  /** Build creation date */
  buildDate: string;
  
  /** Deployment environment (dev, staging, prod) */
  environment: string;
  
  /** System uptime duration */
  uptime: string;
  
  /** Response generation timestamp */
  timestamp: string;
  
  /** Individual health check results */
  checks: {
    /** API health status */
    api: string;
    
    /** Memory usage status */
    memory: string;
    
    /** Disk space status */
    disk: string;
    
    /** Version file accessibility status */
    version_file: string;
  };
}

/**
 * Processed version information optimized for frontend use
 * Provides clean, consistent interface regardless of backend response format
 */
export interface VersionInfo {
  /** Semantic version only (e.g., "1.0.38") - extracted from full GitHub tag */
  version: string;
  
  /** Formatted version for UI display (e.g., "v1.0.38") */
  displayVersion: string;
  
  /** Complete version string from backend (e.g., "v1.0.38-dev.20251223.1") */
  fullVersion: string;
  
  /** ISO date string of build creation */
  buildDate: string;
  
  /** Git commit hash for traceability */
  commitHash: string;
  
  /** Detected environment (dev, staging, prod) */
  environment: string;
}

/**
 * Version API service for fetching version information
 */
export const versionApi = {
  /**
   * Gets the current application version from the backend
   * Extracts semantic version from full GitHub tag format
   * Features comprehensive error handling with retry logic and caching
   * @param timeout - Request timeout in milliseconds (default: 5000)
   * @param useCache - Whether to use cached version (default: true)
   * @returns Promise<VersionInfo> - Processed version information
   */
  async getCurrentVersion(timeout: number = 5000, useCache: boolean = true): Promise<VersionInfo> {
    // Check cache first if enabled
    if (useCache) {
      const cachedVersion = versionCache.getCachedVersion();
      if (cachedVersion) {
        console.log(`Using cached version: ${cachedVersion.displayVersion}`);
        return cachedVersion;
      }
    }

    return withErrorHandling(
      async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
          const response = await axiosInstance.get<CurrentVersionResponse>('/api/version', {
            signal: controller.signal,
            timeout: timeout
          });

          clearTimeout(timeoutId);

          if (!response.data.success) {
            throw new Error('API returned unsuccessful response');
          }

          const versionData = response.data.data;
          
          // Extract semantic version from full GitHub tag
          // Example: "v1.0.38-dev.20251223.1" -> "1.0.38"
          const semanticVersion = extractSemanticVersion(versionData.version);
          
          const versionInfo: VersionInfo = {
            version: semanticVersion,
            displayVersion: `v${semanticVersion}`,
            fullVersion: versionData.version,
            buildDate: versionData.buildDate,
            commitHash: versionData.commitHash,
            environment: detectEnvironment(versionData.version)
          };

          // Cache the version info for future requests
          if (useCache) {
            versionCache.setCachedVersion(versionInfo);
          }
          
          return versionInfo;
        } catch (error) {
          clearTimeout(timeoutId);
          
          // Re-throw with enhanced error information
          if (error instanceof Error) {
            if (error.name === 'AbortError') {
              throw new Error(`Version API request timed out after ${timeout}ms`);
            }
            if (error.message.includes('Network Error')) {
              throw new Error('Network error: Unable to connect to version API');
            }
            if (error.message.includes('timeout')) {
              throw new Error(`Version API request timed out after ${timeout}ms`);
            }
          }
          
          throw error;
        }
      },
      {
        service: 'versionApi',
        operation: 'getCurrentVersion',
        timeout,
        useCache
      },
      2 // Max 2 retries
    );
  },

  /**
   * Gets version health information
   * Features comprehensive error handling with retry logic
   * @param timeout - Request timeout in milliseconds (default: 5000)
   * @returns Promise<VersionHealthResponse> - Health check information
   */
  async getVersionHealth(timeout: number = 5000): Promise<VersionHealthResponse> {
    return withErrorHandling(
      async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
          const response = await axiosInstance.get<VersionHealthResponse>('/api/version/health', {
            signal: controller.signal,
            timeout: timeout
          });

          clearTimeout(timeoutId);
          return response.data;
        } catch (error) {
          clearTimeout(timeoutId);
          
          // Re-throw with enhanced error information
          if (error instanceof Error) {
            if (error.name === 'AbortError') {
              throw new Error(`Version health API request timed out after ${timeout}ms`);
            }
            if (error.message.includes('Network Error')) {
              throw new Error('Network error: Unable to connect to version health API');
            }
          }
          
          throw error;
        }
      },
      {
        service: 'versionApi',
        operation: 'getVersionHealth',
        timeout
      },
      2 // Max 2 retries
    );
  },

  /**
   * Cache management functions
   */
  cache: {
    /**
     * Gets cached version if available
     * @returns Cached version info or null
     */
    getCached(): VersionInfo | null {
      return versionCache.getCachedVersion();
    },

    /**
     * Invalidates cached version data
     */
    invalidate(): void {
      versionCache.invalidateCache();
    },

    /**
     * Checks if version is currently cached
     * @returns True if valid cache exists
     */
    isCached(): boolean {
      return versionCache.isCached();
    },

    /**
     * Gets cache statistics
     * @returns Cache statistics object
     */
    getStats() {
      return versionCache.getStats();
    },

    /**
     * Gets cache hit ratio as percentage
     * @returns Hit ratio (0-100) or null if no requests made
     */
    getHitRatio(): number | null {
      return versionCache.getHitRatio();
    },

    /**
     * Gets remaining cache time in milliseconds
     * @returns Remaining time or null if no cache
     */
    getRemainingTime(): number | null {
      return versionCache.getRemainingCacheTime();
    },

    /**
     * Clears all cache data
     */
    clear(): void {
      versionCache.clearAll();
    }
  }
};

/**
 * Extracts semantic version from full GitHub tag format
 * Examples:
 * - "v1.0.38-dev.20251223.1" -> "1.0.38"
 * - "1.2.3-staging.20251224.5" -> "1.2.3"
 * - "v2.1.0" -> "2.1.0"
 * - "1.0.0" -> "1.0.0"
 * @param fullVersion - Full version string from GitHub tag
 * @returns Semantic version string
 */
function extractSemanticVersion(fullVersion: string): string {
  if (!fullVersion) {
    return '0.0.0';
  }

  // Remove 'v' prefix if present
  const version = fullVersion.startsWith('v') ? fullVersion.substring(1) : fullVersion;
  
  // Extract semantic version part (before any dash)
  // Pattern: MAJOR.MINOR.PATCH (before any environment/build suffixes)
  const semanticMatch = version.match(/^(\d+\.\d+\.\d+)/);
  
  if (semanticMatch) {
    return semanticMatch[1];
  }
  
  // Fallback: return the version as-is if no pattern matches
  console.warn(`Could not extract semantic version from: ${fullVersion}`);
  return version;
}

/**
 * Detects environment from version string
 * @param version - Full version string
 * @returns Environment string (dev, staging, prod, unknown)
 */
function detectEnvironment(version: string): string {
  if (!version) {
    return 'unknown';
  }
  
  const lowerVersion = version.toLowerCase();
  
  if (lowerVersion.includes('-dev.') || lowerVersion.includes('dev')) {
    return 'dev';
  }
  if (lowerVersion.includes('-staging.') || lowerVersion.includes('staging')) {
    return 'staging';
  }
  if (lowerVersion.includes('-prod.') || lowerVersion.includes('production')) {
    return 'prod';
  }
  
  // If no environment suffix, assume production
  return 'prod';
}

export default versionApi;