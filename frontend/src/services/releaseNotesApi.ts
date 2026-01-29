import { axiosInstance } from './axiosConfig';
import { withErrorHandling } from '../utils/errorHandling';

/**
 * Cache configuration constants
 */
const CACHE_CONFIG = {
  // Cache keys
  RELEASE_NOTES_KEY: 'release_notes_',
  CURRENT_RELEASE_KEY: 'current_release_notes_',
  RELEASE_HISTORY_KEY: 'release_history_',
  SEARCH_RESULTS_KEY: 'search_results_',
  
  // Cache expiration times (in milliseconds)
  RELEASE_NOTES_EXPIRY: 24 * 60 * 60 * 1000, // 24 hours (release notes don't change)
  CURRENT_RELEASE_EXPIRY: 30 * 60 * 1000, // 30 minutes (current version may change)
  DEV_VERSION_EXPIRY: 5 * 60 * 1000, // 5 minutes (dev versions change frequently)
  HISTORY_EXPIRY: 15 * 60 * 1000, // 15 minutes
  SEARCH_EXPIRY: 10 * 60 * 1000, // 10 minutes
} as const;

/**
 * Interface for cached data with expiration
 */
interface CachedData<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

/**
 * Interface for individual change items within release notes
 */
export interface ChangeItem {
  id: number;
  changeType: string; // Feature, BugFix, Improvement, Breaking
  description: string;
  commitSha?: string;
  jiraTicket?: string;
  impact?: 'Low' | 'Medium' | 'High';
  author?: string;
}

/**
 * Interface for release notes data from the backend API
 */
export interface ReleaseNotesData {
  id: number;
  version: string;
  releaseDate: string; // ISO date string
  environment: string;
  commitSha?: string;
  branch?: string;
  createdDate: string; // ISO date string
  changeItems: ChangeItem[];
}

/**
 * Processed release notes organized by change type for frontend display
 */
export interface ProcessedReleaseNotes {
  version: string;
  releaseDate: string;
  environment: string;
  commitSha?: string;
  branch?: string;
  features: ChangeItem[];
  bugFixes: ChangeItem[];
  improvements: ChangeItem[];
  breakingChanges: ChangeItem[];
  knownIssues?: string[];
}

/**
 * API response wrapper for release notes endpoints
 */
export interface ReleaseNotesResponse {
  success?: boolean;
  data?: ReleaseNotesData;
  message?: string;
  timestamp?: string;
}

/**
 * Release Notes API service for fetching release notes information with caching
 */
export const releaseNotesApi = {
  /**
   * Gets release notes for a specific version with caching and comprehensive error handling
   * @param version - Version string (e.g., "1.0.38" or "v1.0.38")
   * @param timeout - Request timeout in milliseconds (default: 10000)
   * @returns Promise<ProcessedReleaseNotes> - Organized release notes data
   */
  async getReleaseNotes(version: string, timeout: number = 10000): Promise<ProcessedReleaseNotes> {
    // Clean version string (remove 'v' prefix if present)
    const cleanVersion = version.startsWith('v') ? version.substring(1) : version;
    const cacheKey = `${CACHE_CONFIG.RELEASE_NOTES_KEY}${cleanVersion}`;

    // Try to get from cache first
    const cachedData = getCachedData<ProcessedReleaseNotes>(cacheKey);
    if (cachedData) {
      console.log(`Returning cached release notes for version ${cleanVersion}`);
      return cachedData;
    }

    return withErrorHandling(
      async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
          const response = await axiosInstance.get<ReleaseNotesData>(`/api/ReleaseNotes/${cleanVersion}`, {
            signal: controller.signal,
            timeout: timeout
          });

          clearTimeout(timeoutId);

          if (!response.data) {
            throw new Error('No release notes data received from API');
          }

          const processedData = processReleaseNotesData(response.data);
          
          // Cache the result - use longer expiry for stable versions, shorter for dev versions
          const expiry = isDevelopmentVersion(cleanVersion) 
            ? CACHE_CONFIG.DEV_VERSION_EXPIRY 
            : CACHE_CONFIG.RELEASE_NOTES_EXPIRY;
          
          setCachedData(cacheKey, processedData, expiry);
          console.log(`Cached release notes for version ${cleanVersion} (expiry: ${expiry}ms)`);

          return processedData;
        } catch (error) {
          clearTimeout(timeoutId);
          
          // Enhanced error handling with specific error types
          if (error instanceof Error) {
            if (error.name === 'AbortError') {
              throw new Error(`Release notes API request timed out after ${timeout}ms`);
            }
            if (error.message.includes('Network Error')) {
              throw new Error('Network error: Unable to connect to release notes API');
            }
            if (error.message.includes('timeout')) {
              throw new Error(`Release notes API request timed out after ${timeout}ms`);
            }
            if (error.message.includes('404')) {
              throw new Error(`Release notes not found for version ${version}`);
            }
          }
          
          throw error;
        }
      },
      {
        service: 'releaseNotesApi',
        operation: 'getReleaseNotes',
        version: cleanVersion,
        timeout
      },
      3 // Max 3 retries for release notes
    );
  },

  /**
   * Gets release notes for the current deployed version with caching
   * @param environment - Environment to get release notes for (default: "dev")
   * @param timeout - Request timeout in milliseconds (default: 10000)
   * @returns Promise<ProcessedReleaseNotes> - Current version release notes
   */
  async getCurrentReleaseNotes(environment: string = 'dev', timeout: number = 10000): Promise<ProcessedReleaseNotes> {
    try {
      const cacheKey = `${CACHE_CONFIG.CURRENT_RELEASE_KEY}${environment}`;

      // Try to get from cache first
      const cachedData = getCachedData<ProcessedReleaseNotes>(cacheKey);
      if (cachedData) {
        console.log(`Returning cached current release notes for environment ${environment}`);
        return cachedData;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await axiosInstance.get<ReleaseNotesData>('/api/ReleaseNotes/current', {
        params: { environment },
        signal: controller.signal,
        timeout: timeout
      });

      clearTimeout(timeoutId);

      if (!response.data) {
        throw new Error('No current release notes data received from API');
      }

      const processedData = processReleaseNotesData(response.data);
      
      // Cache the result with appropriate expiry based on environment
      const expiry = environment === 'dev' 
        ? CACHE_CONFIG.DEV_VERSION_EXPIRY 
        : CACHE_CONFIG.CURRENT_RELEASE_EXPIRY;
      
      setCachedData(cacheKey, processedData, expiry);
      console.log(`Cached current release notes for environment ${environment} (expiry: ${expiry}ms)`);

      return processedData;
    } catch (error) {
      console.error(`Error fetching current release notes for environment ${environment}:`, error);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error(`Current release notes API request timed out after ${timeout}ms`);
        }
        if (error.message.includes('Network Error')) {
          throw new Error('Network error: Unable to connect to release notes API');
        }
        if (error.message.includes('timeout')) {
          throw new Error(`Current release notes API request timed out after ${timeout}ms`);
        }
        if (error.message.includes('404')) {
          throw new Error(`No release notes found for current version in ${environment} environment`);
        }
      }
      
      throw new Error(`Failed to fetch current release notes for ${environment} environment`);
    }
  },

  /**
   * Gets paginated release history with caching
   * @param environment - Environment filter (optional)
   * @param skip - Number of records to skip (default: 0)
   * @param take - Number of records to take (default: 10)
   * @param timeout - Request timeout in milliseconds (default: 10000)
   * @returns Promise<ProcessedReleaseNotes[]> - Array of release notes
   */
  async getReleaseHistory(
    environment?: string, 
    skip: number = 0, 
    take: number = 10, 
    timeout: number = 10000
  ): Promise<ProcessedReleaseNotes[]> {
    try {
      const cacheKey = `${CACHE_CONFIG.RELEASE_HISTORY_KEY}${environment || 'all'}_${skip}_${take}`;

      // Try to get from cache first
      const cachedData = getCachedData<ProcessedReleaseNotes[]>(cacheKey);
      if (cachedData) {
        console.log(`Returning cached release history for environment ${environment || 'all'}`);
        return cachedData;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const params: Record<string, any> = { skip, take };
      if (environment) {
        params.environment = environment;
      }

      const response = await axiosInstance.get<ReleaseNotesData[]>('/api/ReleaseNotes/history', {
        params,
        signal: controller.signal,
        timeout: timeout
      });

      clearTimeout(timeoutId);

      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid release history data received from API');
      }

      const processedData = response.data.map(processReleaseNotesData);
      
      // Cache the result
      setCachedData(cacheKey, processedData, CACHE_CONFIG.HISTORY_EXPIRY);
      console.log(`Cached release history for environment ${environment || 'all'}`);

      return processedData;
    } catch (error) {
      console.error('Error fetching release history:', error);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error(`Release history API request timed out after ${timeout}ms`);
        }
        if (error.message.includes('Network Error')) {
          throw new Error('Network error: Unable to connect to release notes API');
        }
        if (error.message.includes('timeout')) {
          throw new Error(`Release history API request timed out after ${timeout}ms`);
        }
      }
      
      throw new Error('Failed to fetch release history');
    }
  },

  /**
   * Searches release notes by criteria with caching
   * @param searchTerm - Search term (optional)
   * @param environment - Environment filter (optional)
   * @param fromDate - Start date filter (optional)
   * @param toDate - End date filter (optional)
   * @param skip - Number of records to skip (default: 0)
   * @param take - Number of records to take (default: 10)
   * @param timeout - Request timeout in milliseconds (default: 10000)
   * @returns Promise<ProcessedReleaseNotes[]> - Array of matching release notes
   */
  async searchReleaseNotes(
    searchTerm?: string,
    environment?: string,
    fromDate?: Date,
    toDate?: Date,
    skip: number = 0,
    take: number = 10,
    timeout: number = 10000
  ): Promise<ProcessedReleaseNotes[]> {
    try {
      // Create cache key from search parameters
      const searchParams = [
        searchTerm || 'null',
        environment || 'null',
        fromDate?.toISOString().split('T')[0] || 'null',
        toDate?.toISOString().split('T')[0] || 'null',
        skip.toString(),
        take.toString()
      ].join('_');
      const cacheKey = `${CACHE_CONFIG.SEARCH_RESULTS_KEY}${searchParams}`;

      // Try to get from cache first
      const cachedData = getCachedData<ProcessedReleaseNotes[]>(cacheKey);
      if (cachedData) {
        console.log(`Returning cached search results for: ${searchTerm || 'all'}`);
        return cachedData;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const params: Record<string, any> = { skip, take };
      if (searchTerm) params.searchTerm = searchTerm;
      if (environment) params.environment = environment;
      if (fromDate) params.fromDate = fromDate.toISOString();
      if (toDate) params.toDate = toDate.toISOString();

      const response = await axiosInstance.get<ReleaseNotesData[]>('/api/ReleaseNotes/search', {
        params,
        signal: controller.signal,
        timeout: timeout
      });

      clearTimeout(timeoutId);

      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid search results received from API');
      }

      const processedData = response.data.map(processReleaseNotesData);
      
      // Cache the result
      setCachedData(cacheKey, processedData, CACHE_CONFIG.SEARCH_EXPIRY);
      console.log(`Cached search results for: ${searchTerm || 'all'}`);

      return processedData;
    } catch (error) {
      console.error('Error searching release notes:', error);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error(`Release notes search request timed out after ${timeout}ms`);
        }
        if (error.message.includes('Network Error')) {
          throw new Error('Network error: Unable to connect to release notes API');
        }
        if (error.message.includes('timeout')) {
          throw new Error(`Release notes search request timed out after ${timeout}ms`);
        }
      }
      
      throw new Error('Failed to search release notes');
    }
  },

  /**
   * Clears all cached release notes data
   */
  clearCache(): void {
    try {
      const keys = Object.keys(localStorage);
      const releaseNotesKeys = keys.filter(key => 
        key.startsWith(CACHE_CONFIG.RELEASE_NOTES_KEY) ||
        key.startsWith(CACHE_CONFIG.CURRENT_RELEASE_KEY) ||
        key.startsWith(CACHE_CONFIG.RELEASE_HISTORY_KEY) ||
        key.startsWith(CACHE_CONFIG.SEARCH_RESULTS_KEY)
      );

      releaseNotesKeys.forEach(key => localStorage.removeItem(key));
      console.log(`Cleared ${releaseNotesKeys.length} cached release notes entries`);
    } catch (error) {
      console.warn('Failed to clear release notes cache:', error);
    }
  },

  /**
   * Clears cached data for a specific version (useful for development versions)
   * @param version - Version to clear from cache
   */
  clearVersionCache(version: string): void {
    try {
      const cleanVersion = version.startsWith('v') ? version.substring(1) : version;
      const versionKey = `${CACHE_CONFIG.RELEASE_NOTES_KEY}${cleanVersion}`;
      
      localStorage.removeItem(versionKey);
      console.log(`Cleared cache for version ${cleanVersion}`);
    } catch (error) {
      console.warn(`Failed to clear cache for version ${version}:`, error);
    }
  },

  /**
   * Clears cached data for a specific environment
   * @param environment - Environment to clear from cache
   */
  clearEnvironmentCache(environment: string): void {
    try {
      const keys = Object.keys(localStorage);
      const environmentKeys = keys.filter(key => 
        key.includes(`_${environment}`) || key.includes(`${environment}_`)
      );

      environmentKeys.forEach(key => localStorage.removeItem(key));
      console.log(`Cleared ${environmentKeys.length} cached entries for environment ${environment}`);
    } catch (error) {
      console.warn(`Failed to clear cache for environment ${environment}:`, error);
    }
  }
};

/**
 * Processes raw release notes data from the API into organized format for frontend display
 * @param data - Raw release notes data from API
 * @returns ProcessedReleaseNotes - Organized release notes data
 */
function processReleaseNotesData(data: ReleaseNotesData): ProcessedReleaseNotes {
  const features: ChangeItem[] = [];
  const bugFixes: ChangeItem[] = [];
  const improvements: ChangeItem[] = [];
  const breakingChanges: ChangeItem[] = [];

  // Organize change items by type
  data.changeItems?.forEach(item => {
    switch (item.changeType.toLowerCase()) {
      case 'feature':
        features.push(item);
        break;
      case 'bugfix':
      case 'bug':
      case 'fix':
        bugFixes.push(item);
        break;
      case 'improvement':
      case 'enhancement':
        improvements.push(item);
        break;
      case 'breaking':
      case 'breakingchange':
        breakingChanges.push(item);
        break;
      default:
        // Default to improvements for unknown types
        improvements.push(item);
        break;
    }
  });

  return {
    version: data.version,
    releaseDate: data.releaseDate,
    environment: data.environment,
    commitSha: data.commitSha,
    branch: data.branch,
    features,
    bugFixes,
    improvements,
    breakingChanges,
    knownIssues: [] // Can be extended later if needed
  };
}

/**
 * Checks if a version is a development version (contains dev, alpha, beta, rc, etc.)
 * @param version - Version string to check
 * @returns boolean - True if it's a development version
 */
function isDevelopmentVersion(version: string): boolean {
  const devPatterns = /-(dev|alpha|beta|rc|snapshot|preview|canary)/i;
  return devPatterns.test(version);
}

/**
 * Gets cached data from localStorage with expiration check
 * @param key - Cache key
 * @returns T | null - Cached data or null if expired/not found
 */
function getCachedData<T>(key: string): T | null {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) {
      return null;
    }

    const parsedCache: CachedData<T> = JSON.parse(cached);
    const now = Date.now();

    // Check if cache has expired
    if (now > parsedCache.timestamp + parsedCache.expiry) {
      localStorage.removeItem(key);
      return null;
    }

    return parsedCache.data;
  } catch (error) {
    console.warn(`Failed to get cached data for key ${key}:`, error);
    // Remove corrupted cache entry
    try {
      localStorage.removeItem(key);
    } catch (removeError) {
      console.warn(`Failed to remove corrupted cache entry ${key}:`, removeError);
    }
    return null;
  }
}

/**
 * Sets data in localStorage cache with expiration
 * @param key - Cache key
 * @param data - Data to cache
 * @param expiry - Expiration time in milliseconds
 */
function setCachedData<T>(key: string, data: T, expiry: number): void {
  try {
    const cacheData: CachedData<T> = {
      data,
      timestamp: Date.now(),
      expiry
    };

    localStorage.setItem(key, JSON.stringify(cacheData));
  } catch (error) {
    console.warn(`Failed to cache data for key ${key}:`, error);
    
    // If localStorage is full, try to clear old release notes cache entries
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      try {
        clearOldCacheEntries();
        // Try to cache again after cleanup
        localStorage.setItem(key, JSON.stringify({
          data,
          timestamp: Date.now(),
          expiry
        }));
      } catch (retryError) {
        console.warn(`Failed to cache data after cleanup for key ${key}:`, retryError);
      }
    }
  }
}

/**
 * Clears old cache entries to free up localStorage space
 */
function clearOldCacheEntries(): void {
  try {
    const keys = Object.keys(localStorage);
    const releaseNotesKeys = keys.filter(key => 
      key.startsWith(CACHE_CONFIG.RELEASE_NOTES_KEY) ||
      key.startsWith(CACHE_CONFIG.CURRENT_RELEASE_KEY) ||
      key.startsWith(CACHE_CONFIG.RELEASE_HISTORY_KEY) ||
      key.startsWith(CACHE_CONFIG.SEARCH_RESULTS_KEY)
    );

    const now = Date.now();
    let removedCount = 0;

    releaseNotesKeys.forEach(key => {
      try {
        const cached = localStorage.getItem(key);
        if (cached) {
          const parsedCache: CachedData<any> = JSON.parse(cached);
          // Remove if expired or older than 1 hour
          if (now > parsedCache.timestamp + parsedCache.expiry || 
              now > parsedCache.timestamp + (60 * 60 * 1000)) {
            localStorage.removeItem(key);
            removedCount++;
          }
        }
      } catch (error) {
        // Remove corrupted entries
        localStorage.removeItem(key);
        removedCount++;
      }
    });

    console.log(`Cleared ${removedCount} old cache entries to free up space`);
  } catch (error) {
    console.warn('Failed to clear old cache entries:', error);
  }
}

export default releaseNotesApi;