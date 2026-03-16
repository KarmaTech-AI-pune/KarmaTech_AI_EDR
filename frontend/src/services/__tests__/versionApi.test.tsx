import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { versionApi } from '../versionApi';
import { axiosInstance } from '../axiosConfig';
import { versionCache } from '../../utils/versionCache';

// Mock dependencies
vi.mock('../axiosConfig', () => ({
  axiosInstance: {
    get: vi.fn(),
  },
}));

vi.mock('../../utils/versionCache', () => ({
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

// We don't want tests to take full timeouts during `withErrorHandling` retries
vi.mock('../../utils/errorHandling', () => ({
  withErrorHandling: async (fn: any) => {
    return fn();
  },
}));

const mockAxiosGet = vi.mocked(axiosInstance.get);

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
      const mockCachedVersion = {
        version: '1.2.3',
        displayVersion: 'v1.2.3',
        fullVersion: 'v1.2.3-dev',
        buildDate: '2023-01-01',
        commitHash: 'abc',
        environment: 'dev',
      };
      vi.mocked(versionCache.getCachedVersion).mockReturnValueOnce(mockCachedVersion);

      const result = await versionApi.getCurrentVersion(5000, true);

      expect(versionCache.getCachedVersion).toHaveBeenCalled();
      expect(mockAxiosGet).not.toHaveBeenCalled();
      expect(result).toEqual(mockCachedVersion);
    });

    it('should extract semantic version and environment correctly from GitHub tag', async () => {
      vi.mocked(versionCache.getCachedVersion).mockReturnValueOnce(null);

      const mockResponse = {
        data: {
          success: true,
          data: {
            version: 'v1.0.38-dev.20251223.1',
            buildDate: '2025-12-23T00:00:00Z',
            commitHash: '12345abcde',
            assemblyVersion: '1.0.0.0',
            fileVersion: '1.0.0.0',
            productVersion: '1.0.38',
          },
          timestamp: '2025-12-23T00:00:00Z',
        },
      };

      mockAxiosGet.mockResolvedValueOnce(mockResponse);

      const result = await versionApi.getCurrentVersion(5000, true);

      expect(mockAxiosGet).toHaveBeenCalledWith('/api/version', expect.any(Object));
      expect(result).toEqual({
        version: '1.0.38',
        displayVersion: 'v1.0.38',
        fullVersion: 'v1.0.38-dev.20251223.1',
        buildDate: '2025-12-23T00:00:00Z',
        commitHash: '12345abcde',
        environment: 'dev',
      });
      expect(versionCache.setCachedVersion).toHaveBeenCalledWith(result);
    });

    it('should extract semantic version perfectly with no suffix', async () => {
      vi.mocked(versionCache.getCachedVersion).mockReturnValueOnce(null);

      mockAxiosGet.mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            version: 'v2.1.0',
            buildDate: '',
            commitHash: '',
            assemblyVersion: '',
            fileVersion: '',
            productVersion: '',
          },
        },
      });

      const result = await versionApi.getCurrentVersion();
      expect(result.version).toBe('2.1.0');
      expect(result.environment).toBe('prod'); // Default to prod when no env suffix
    });

    it('should throw error when api returns unsuccessful response', async () => {
      vi.mocked(versionCache.getCachedVersion).mockReturnValueOnce(null);

      mockAxiosGet.mockResolvedValueOnce({
        data: { success: false },
      });

      await expect(versionApi.getCurrentVersion()).rejects.toThrow('API returned unsuccessful response');
    });

    it('should bypass cache when useCache is false', async () => {
      mockAxiosGet.mockResolvedValueOnce({
        data: {
          success: true,
          data: { version: '1.0.0', buildDate: '', commitHash: '', assemblyVersion: '', fileVersion: '', productVersion: '' }
        }
      });

      await versionApi.getCurrentVersion(5000, false);

      expect(versionCache.getCachedVersion).not.toHaveBeenCalled();
      expect(mockAxiosGet).toHaveBeenCalled();
    });
  });

  describe('getVersionHealth', () => {
    it('should successfully fetch version health', async () => {
      const mockHealthResponse = {
        data: {
          status: 'Healthy',
          version: '1.0.0',
          commitHash: 'abc',
          buildDate: '2023-01-01',
          environment: 'prod',
          uptime: '1d',
          timestamp: 'now',
          checks: { api: 'Healthy', memory: 'Healthy', disk: 'Healthy', version_file: 'Healthy' }
        }
      };
      
      mockAxiosGet.mockResolvedValueOnce(mockHealthResponse);

      const result = await versionApi.getVersionHealth();

      expect(mockAxiosGet).toHaveBeenCalledWith('/api/version/health', expect.any(Object));
      expect(result).toEqual(mockHealthResponse.data);
    });
  });

  describe('cache management', () => {
    it('forwards calls to versionCache', () => {
      versionApi.cache.getCached();
      expect(versionCache.getCachedVersion).toHaveBeenCalled();

      versionApi.cache.invalidate();
      expect(versionCache.invalidateCache).toHaveBeenCalled();

      versionApi.cache.isCached();
      expect(versionCache.isCached).toHaveBeenCalled();

      versionApi.cache.getStats();
      expect(versionCache.getStats).toHaveBeenCalled();

      versionApi.cache.getHitRatio();
      expect(versionCache.getHitRatio).toHaveBeenCalled();

      versionApi.cache.getRemainingTime();
      expect(versionCache.getRemainingCacheTime).toHaveBeenCalled();

      versionApi.cache.clear();
      expect(versionCache.clearAll).toHaveBeenCalled();
    });
  });
});
