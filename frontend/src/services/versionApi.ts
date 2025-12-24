import { axiosInstance } from './axiosConfig';

/**
 * Interface for the current version response from the backend API
 */
export interface CurrentVersionResponse {
  success: boolean;
  data: {
    version: string;
    buildDate: string;
    commitHash: string;
    assemblyVersion: string;
    fileVersion: string;
    productVersion: string;
  };
  timestamp: string;
}

/**
 * Interface for version health check response
 */
export interface VersionHealthResponse {
  status: string;
  version: string;
  commitHash: string;
  buildDate: string;
  environment: string;
  uptime: string;
  timestamp: string;
  checks: {
    api: string;
    memory: string;
    disk: string;
    version_file: string;
  };
}

/**
 * Processed version information for frontend use
 */
export interface VersionInfo {
  version: string;           // Semantic version only (e.g., "1.0.38")
  displayVersion: string;    // Formatted for UI display (e.g., "v1.0.38")
  fullVersion: string;       // Complete version from backend
  buildDate: string;         // ISO date string
  commitHash: string;        // Git commit hash
  environment: string;       // Environment (dev, staging, prod)
}

/**
 * Version API service for fetching version information
 */
export const versionApi = {
  /**
   * Gets the current application version from the backend
   * Extracts semantic version from full GitHub tag format
   * @param timeout - Request timeout in milliseconds (default: 5000)
   * @returns Promise<VersionInfo> - Processed version information
   */
  async getCurrentVersion(timeout: number = 5000): Promise<VersionInfo> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

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
      
      return {
        version: semanticVersion,
        displayVersion: `v${semanticVersion}`,
        fullVersion: versionData.version,
        buildDate: versionData.buildDate,
        commitHash: versionData.commitHash,
        environment: detectEnvironment(versionData.version)
      };
    } catch (error) {
      console.error('Error fetching current version:', error);
      
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
      
      throw new Error('Failed to fetch version information');
    }
  },

  /**
   * Gets version health information
   * @param timeout - Request timeout in milliseconds (default: 5000)
   * @returns Promise<VersionHealthResponse> - Health check information
   */
  async getVersionHealth(timeout: number = 5000): Promise<VersionHealthResponse> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await axiosInstance.get<VersionHealthResponse>('/api/version/health', {
        signal: controller.signal,
        timeout: timeout
      });

      clearTimeout(timeoutId);
      return response.data;
    } catch (error) {
      console.error('Error fetching version health:', error);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error(`Version health API request timed out after ${timeout}ms`);
        }
        if (error.message.includes('Network Error')) {
          throw new Error('Network error: Unable to connect to version health API');
        }
      }
      
      throw new Error('Failed to fetch version health information');
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
  let version = fullVersion.startsWith('v') ? fullVersion.substring(1) : fullVersion;
  
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