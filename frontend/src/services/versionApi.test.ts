import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { versionApi, VersionInfo, CurrentVersionResponse, VersionHealthResponse } from './versionApi';
import { axiosInstance } from './axiosConfig';
import { versionCache } from '../utils/versionCache';

// Mock dependencies
vi.mock('./axiosConfig', () => ({
  axiosInstance: {
    get: vi.fn(),
  },
}));

vi.mock('../utils/versionCache', () => ({
  versionCache: {
    getCachedVersion: vi.fn(),
    setCachedVersion: vi.fn(),
    invalidateCache: vi.fn(),
    isCached: vi.fn(),
    getStats: vi.fn(),
    getHitRatio: vi.fn(),
    getRemainingCacheTime: vi.fn(),
    clearAll: vi.fn(),
  },
}));

vi.mock('../utils/errorHandling', () => ({
  withErrorHandling: vi.fn((fn) => fn()),
}));

const mockAxiosGet = vi.mocked(axiosInstance.get);
const mockVersionCache = vi.mocked(versionCache);

describe('versionApi Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('getCurrentVersion', () => {
    it('should return cached version if available and useCache is true', async () => {
      const mockCachedVersion: VersionInfo = {
        version: '1.2.3',
        displayVersion: 'v1.2.3',
        fullVersion: 'v1.2.3-dev',
        buildDate: '2023-01-01',
        commitHash: 'abc123',
        environment: 'dev',
      };
      mockVersionCache.getCachedVersion.mockReturnValue(mockCachedVersion);

      const result = await versionApi.getCurrentVersion(5000, true);

      expect(mockVersionCache.getCachedVersion).toHaveBeenCalled();
      expect(mockAxiosGet).not.toHaveBeenCalled();
      expect(result).toEqual(mockCachedVersion);
    });

    it('should extract semantic version and environment correctly from GitHub tag', async () => {
      mockVersionCache.getCachedVersion.mockReturnValue(null);

      const mockResponse: { data: CurrentVersionResponse } = {
        data: {
          success: true,
          data: {
            version: 'v1.0.38-dev.20251223.1',
            buildDate: '2023-01-01T00:00:00Z',
            commitHash: 'abc123def456',
            assemblyVersion: '1.0.38.0',
            fileVersion: '1.0.38.0',
            productVersion: '1.0.38',
          },
          timestamp: '2023-01-01T00:00:00Z',
        },
      };

      mockAxiosGet.mockResolvedValue(mockResponse);

      const result = await versionApi.getCurrentVersion(5000, false);

      expect(result.version).toBe('1.0.38');
      expect(result.displayVersion).toBe('v1.0.38');
      expect(result.fullVersion).toBe('v1.0.38-dev.20251223.1');
      expect(result.environment).toBe('dev');
      expect(result.buildDate).toBe('2023-01-01T00:00:00Z');
      expect(result.commitHash).toBe('abc123def456');
      expect(mockVersionCache.setCachedVersion).not.toHaveBeenCalled(); // useCache is false
    });

    it('should extract semantic version perfectly with no suffix', async () => {
      mockVersionCache.getCachedVersion.mockReturnValue(null);

      mockAxiosGet.mockResolvedValue({
        data: {
          success: true,
          data: {
            version: 'v2.1.0',
            buildDate: '2023-01-01T00:00:00Z',
            commitHash: 'xyz789',
            assemblyVersion: '2.1.0.0',
            fileVersion: '2.1.0.0',
            productVersion: '2.1.0',
          },
          timestamp: '2023-01-01T00:00:00Z',
        },
      });

      const result = await versionApi.getCurrentVersion(5000, false);

      expect(result.version).toBe('2.1.0');
      expect(result.displayVersion).toBe('v2.1.0');
      expect(result.environment).toBe('prod'); // No environment suffix = prod
    });

    it('should handle staging environment detection', async () => {
      mockVersionCache.getCachedVersion.mockReturnValue(null);

      mockAxiosGet.mockResolvedValue({
        data: {
          success: true,
          data: {
            version: 'v1.5.2-staging.20251223.3',
            buildDate: '2023-01-01T00:00:00Z',
            commitHash: 'staging123',
            assemblyVersion: '1.5.2.0',
            fileVersion: '1.5.2.0',
            productVersion: '1.5.2',
          },
          timestamp: '2023-01-01T00:00:00Z',
        },
      });

      const result = await versionApi.getCurrentVersion(5000, false);

      expect(result.version).toBe('1.5.2');
      expect(result.environment).toBe('staging');
    });

    it('should throw error when api returns unsuccessful response', async () => {
      mockVersionCache.getCachedVersion.mockReturnValue(null);

      mockAxiosGet.mockResolvedValue({
        data: {
          success: false,
          data: null,
          timestamp: '2023-01-01T00:00:00Z',
        },
      });

      await expect(versionApi.getCurrentVersion(5000, false)).rejects.toThrow(
        'API returned unsuccessful response'
      );
    });

    it('should bypass cache when useCache is false', async () => {
      mockAxiosGet.mockResolvedValue({
        data: {
          success: true,
          data: {
            version: 'v1.0.0',
            buildDate: '2023-01-01T00:00:00Z',
            commitHash: 'test123',
            assemblyVersion: '1.0.0.0',
            fileVersion: '1.0.0.0',
            productVersion: '1.0.0',
          },
          timestamp: '2023-01-01T00:00:00Z',
        },
      });

      await versionApi.getCurrentVersion(5000, false);

      expect(mockVersionCache.getCachedVersion).not.toHaveBeenCalled();
      expect(mockAxiosGet).toHaveBeenCalled();
    });

    it('should cache version when useCache is true', async () => {
      mockVersionCache.getCachedVersion.mockReturnValue(null);

      const mockResponse = {
        data: {
          success: true,
          data: {
            version: 'v1.0.0',
            buildDate: '2023-01-01T00:00:00Z',
            commitHash: 'test123',
            assemblyVersion: '1.0.0.0',
            fileVersion: '1.0.0.0',
            productVersion: '1.0.0',
          },
          timestamp: '2023-01-01T00:00:00Z',
        },
      };

      mockAxiosGet.mockResolvedValue(mockResponse);

      const result = await versionApi.getCurrentVersion(5000, true);

      expect(mockVersionCache.setCachedVersion).toHaveBeenCalledWith(result);
    });

    it('should handle malformed version strings gracefully', async () => {
      mockVersionCache.getCachedVersion.mockReturnValue(null);

      mockAxiosGet.mockResolvedValue({
        data: {
          success: true,
          data: {
            version: 'invalid-version-format',
            buildDate: '2023-01-01T00:00:00Z',
            commitHash: 'test123',
            assemblyVersion: '1.0.0.0',
            fileVersion: '1.0.0.0',
            productVersion: '1.0.0',
          },
          timestamp: '2023-01-01T00:00:00Z',
        },
      });

      const result = await versionApi.getCurrentVersion(5000, false);

      expect(result.version).toBe('invalid-version-format');
      expect(result.displayVersion).toBe('vinvalid-version-format');
      expect(console.warn).toHaveBeenCalledWith(
        'Could not extract semantic version from: invalid-version-format'
      );
    });

    it('should handle empty version string', async () => {
      mockVersionCache.getCachedVersion.mockReturnValue(null);

      mockAxiosGet.mockResolvedValue({
        data: {
          success: true,
          data: {
            version: '',
            buildDate: '2023-01-01T00:00:00Z',
            commitHash: 'test123',
            assemblyVersion: '1.0.0.0',
            fileVersion: '1.0.0.0',
            productVersion: '1.0.0',
          },
          timestamp: '2023-01-01T00:00:00Z',
        },
      });

      const result = await versionApi.getCurrentVersion(5000, false);

      expect(result.version).toBe('0.0.0');
      expect(result.environment).toBe('unknown');
    });
  });

  describe('getVersionHealth', () => {
    it('should successfully fetch version health', async () => {
      const mockHealthResponse: VersionHealthResponse = {
        status: 'Healthy',
        version: 'v1.0.38',
        commitHash: 'abc123',
        buildDate: '2023-01-01T00:00:00Z',
        environment: 'dev',
        uptime: '1d 2h 30m',
        timestamp: '2023-01-01T00:00:00Z',
        checks: {
          api: 'Healthy',
          memory: 'Healthy',
          disk: 'Healthy',
          version_file: 'Healthy',
        },
      };

      mockAxiosGet.mockResolvedValue({ data: mockHealthResponse });

      const result = await versionApi.getVersionHealth(5000);

      expect(mockAxiosGet).toHaveBeenCalledWith('/api/version/health', {
        signal: expect.any(AbortSignal),
        timeout: 5000,
      });
      expect(result).toEqual(mockHealthResponse);
    });

    it('should handle health API errors', async () => {
      mockAxiosGet.mockRejectedValue(new Error('Health API error'));

      await expect(versionApi.getVersionHealth(5000)).rejects.toThrow('Health API error');
    });
  });

  describe('cache management', () => {
    it('forwards calls to versionCache', () => {
      const mockStats = { hits: 5, misses: 2, total: 7 };
      mockVersionCache.getStats.mockReturnValue(mockStats);
      mockVersionCache.getHitRatio.mockReturnValue(71.43);
      mockVersionCache.getRemainingCacheTime.mockReturnValue(30000);
      mockVersionCache.isCached.mockReturnValue(true);

      // Test getCached
      versionApi.cache.getCached();
      expect(mockVersionCache.getCachedVersion).toHaveBeenCalled();

      // Test invalidate
      versionApi.cache.invalidate();
      expect(mockVersionCache.invalidateCache).toHaveBeenCalled();

      // Test isCached
      const isCached = versionApi.cache.isCached();
      expect(mockVersionCache.isCached).toHaveBeenCalled();
      expect(isCached).toBe(true);

      // Test getStats
      const stats = versionApi.cache.getStats();
      expect(mockVersionCache.getStats).toHaveBeenCalled();
      expect(stats).toEqual(mockStats);

      // Test getHitRatio
      const hitRatio = versionApi.cache.getHitRatio();
      expect(mockVersionCache.getHitRatio).toHaveBeenCalled();
      expect(hitRatio).toBe(71.43);

      // Test getRemainingTime
      const remainingTime = versionApi.cache.getRemainingTime();
      expect(mockVersionCache.getRemainingCacheTime).toHaveBeenCalled();
      expect(remainingTime).toBe(30000);

      // Test clear
      versionApi.cache.clear();
      expect(mockVersionCache.clearAll).toHaveBeenCalled();
    });
  });

  describe('environment detection', () => {
    it.each([
      ['v1.0.0-dev.20251223.1', 'dev'],
      ['v1.0.0-staging.20251223.1', 'staging'],
      ['v1.0.0-prod.20251223.1', 'prod'],
      ['v1.0.0', 'prod'], // No suffix = prod
      ['1.0.0-development', 'dev'],
      ['1.0.0-production', 'prod'],
      ['', 'unknown'],
    ])('should detect environment correctly for version %s', async (version, expectedEnv) => {
      mockVersionCache.getCachedVersion.mockReturnValue(null);

      mockAxiosGet.mockResolvedValue({
        data: {
          success: true,
          data: {
            version,
            buildDate: '2023-01-01T00:00:00Z',
            commitHash: 'test123',
            assemblyVersion: '1.0.0.0',
            fileVersion: '1.0.0.0',
            productVersion: '1.0.0',
          },
          timestamp: '2023-01-01T00:00:00Z',
        },
      });

      const result = await versionApi.getCurrentVersion(5000, false);
      expect(result.environment).toBe(expectedEnv);
    });
  });

  describe('semantic version extraction', () => {
    it.each([
      ['v1.0.38-dev.20251223.1', '1.0.38'],
      ['1.2.3-staging.20251224.5', '1.2.3'],
      ['v2.1.0', '2.1.0'],
      ['1.0.0', '1.0.0'],
      ['v10.25.100-prod.20251225.10', '10.25.100'],
      ['', '0.0.0'],
      ['invalid', 'invalid'],
    ])('should extract semantic version from %s to %s', async (fullVersion, expectedSemantic) => {
      mockVersionCache.getCachedVersion.mockReturnValue(null);

      mockAxiosGet.mockResolvedValue({
        data: {
          success: true,
          data: {
            version: fullVersion,
            buildDate: '2023-01-01T00:00:00Z',
            commitHash: 'test123',
            assemblyVersion: '1.0.0.0',
            fileVersion: '1.0.0.0',
            productVersion: '1.0.0',
          },
          timestamp: '2023-01-01T00:00:00Z',
        },
      });

      const result = await versionApi.getCurrentVersion(5000, false);
      expect(result.version).toBe(expectedSemantic);
      expect(result.displayVersion).toBe(`v${expectedSemantic}`);
    });
  });
});