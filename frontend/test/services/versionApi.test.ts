import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { versionApi, CurrentVersionResponse, VersionInfo } from '../../src/services/versionApi';
import { axiosInstance } from '../../src/services/axiosConfig';

// Mock axios
vi.mock('../../src/services/axiosConfig', () => ({
  axiosInstance: {
    get: vi.fn()
  }
}));

// Mock error handling utilities
vi.mock('../../src/utils/errorHandling', () => ({
  withErrorHandling: vi.fn((fn) => fn()),
  globalErrorHandler: {
    handleError: vi.fn()
  }
}));

const mockAxios = vi.mocked(axiosInstance) as unknown as { get: Mock };

describe('versionApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useFakeTimers();
    versionApi.cache.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('getCurrentVersion', () => {
    const mockApiResponse: CurrentVersionResponse = {
      success: true,
      data: {
        version: 'v1.0.38-dev.20241225.1',
        buildDate: '2024-12-25T10:00:00Z',
        commitHash: 'abc123def456',
        assemblyVersion: '1.0.38.0',
        fileVersion: '1.0.38.0',
        productVersion: '1.0.38'
      },
      timestamp: '2024-12-25T10:00:00Z'
    };

    it('successfully fetches and processes version information', async () => {
      mockAxios.get.mockResolvedValue({ data: mockApiResponse });

      const result = await versionApi.getCurrentVersion(5000, false);

      expect(mockAxios.get).toHaveBeenCalledWith('/api/version', {
        signal: expect.any(AbortSignal),
        timeout: 5000
      });

      expect(result).toEqual({
        version: '1.0.38',
        displayVersion: 'v1.0.38',
        fullVersion: 'v1.0.38-dev.20241225.1',
        buildDate: '2024-12-25T10:00:00Z',
        commitHash: 'abc123def456',
        environment: 'dev'
      });
    });

    it('extracts semantic version from full GitHub tag', async () => {
      const testCases = [
        { input: 'v1.0.38-dev.20241225.1', expected: '1.0.38' },
        { input: '2.0.0-staging.20241225.2', expected: '2.0.0' },
        { input: 'v3.1.0', expected: '3.1.0' },
        { input: '1.0.38', expected: '1.0.38' },
        { input: 'v1.0.38-prod.20241225.1', expected: '1.0.38' }
      ];

      for (const testCase of testCases) {
        mockAxios.get.mockResolvedValue({
          data: {
            ...mockApiResponse,
            data: {
              ...mockApiResponse.data,
              version: testCase.input
            }
          }
        });

        const result = await versionApi.getCurrentVersion(5000, false);
        expect(result.version).toBe(testCase.expected);
        expect(result.displayVersion).toBe(`v${testCase.expected}`);
      }
    });

    it('detects environment from version string', async () => {
      const testCases = [
        { version: 'v1.0.38-dev.20241225.1', expectedEnv: 'dev' },
        { version: 'v1.0.38-staging.20241225.1', expectedEnv: 'staging' },
        { version: 'v1.0.38-prod.20241225.1', expectedEnv: 'prod' },
        { version: 'v1.0.38', expectedEnv: 'prod' },
        { version: '1.0.38', expectedEnv: 'prod' }
      ];

      for (const testCase of testCases) {
        mockAxios.get.mockResolvedValue({
          data: {
            ...mockApiResponse,
            data: {
              ...mockApiResponse.data,
              version: testCase.version
            }
          }
        });

        const result = await versionApi.getCurrentVersion(5000, false);
        expect(result.environment).toBe(testCase.expectedEnv);
      }
    });

    it('handles API timeout', async () => {
      mockAxios.get.mockImplementation(((url: string, config: any) => {
        return new Promise((resolve, reject) => {
          const signal = config?.signal;
          if (signal?.aborted) {
            const error = new Error('Request aborted');
            error.name = 'AbortError';
            return reject(error);
          }
          signal?.addEventListener('abort', () => {
            const error = new Error('Request aborted');
            error.name = 'AbortError';
            reject(error);
          });
        });
      }) as any);

      const promise = versionApi.getCurrentVersion(50, false);
      
      // Fast-forward time to trigger timeout
      vi.advanceTimersByTime(60);
      
      await expect(promise).rejects.toThrow('Version API request timed out after 50ms');
    });

    it('handles network errors', async () => {
      mockAxios.get.mockRejectedValue(new Error('Network Error'));

      await expect(versionApi.getCurrentVersion(5000, false)).rejects.toThrow('Network error: Unable to connect to version API');
    });

    it('handles unsuccessful API response', async () => {
      mockAxios.get.mockResolvedValue({
        data: {
          ...mockApiResponse,
          success: false
        }
      });

      await expect(versionApi.getCurrentVersion(5000, false)).rejects.toThrow('API returned unsuccessful response');
    });

    it('handles AbortError', async () => {
      const abortError = new Error('Request aborted');
      abortError.name = 'AbortError';
      mockAxios.get.mockRejectedValue(abortError);

      await expect(versionApi.getCurrentVersion(1000, false)).rejects.toThrow('Version API request timed out after 1000ms');
    });

    it('uses custom timeout', async () => {
      mockAxios.get.mockResolvedValue({ data: mockApiResponse });

      await versionApi.getCurrentVersion(10000, false);

      expect(mockAxios.get).toHaveBeenCalledWith('/api/version', {
        signal: expect.any(AbortSignal),
        timeout: 10000
      });
    });

    it('handles malformed version data', async () => {
      mockAxios.get.mockResolvedValue({
        data: {
          ...mockApiResponse,
          data: {
            ...mockApiResponse.data,
            version: ''
          }
        }
      });

      const result = await versionApi.getCurrentVersion(5000, false);
      
      expect(result.version).toBe('0.0.0');
      expect(result.displayVersion).toBe('v0.0.0');
    });

    it('handles missing version data', async () => {
      mockAxios.get.mockResolvedValue({
        data: {
          ...mockApiResponse,
          data: {
            ...mockApiResponse.data,
            version: undefined as any
          }
        }
      });

      const result = await versionApi.getCurrentVersion(5000, false);
      
      expect(result.version).toBe('0.0.0');
      expect(result.displayVersion).toBe('v0.0.0');
    });
  });

  describe('getVersionHealth', () => {
    const mockHealthResponse = {
      status: 'healthy',
      version: 'v1.0.38',
      commitHash: 'abc123',
      buildDate: '2024-12-25T10:00:00Z',
      environment: 'dev',
      uptime: '1d 2h 30m',
      timestamp: '2024-12-25T10:00:00Z',
      checks: {
        api: 'healthy',
        memory: 'healthy',
        disk: 'healthy',
        version_file: 'healthy'
      }
    };

    it('successfully fetches version health information', async () => {
      mockAxios.get.mockResolvedValue({ data: mockHealthResponse });

      const result = await versionApi.getVersionHealth();

      expect(mockAxios.get).toHaveBeenCalledWith('/api/version/health', {
        signal: expect.any(AbortSignal),
        timeout: 5000
      });

      expect(result).toEqual(mockHealthResponse);
    });

    it('handles health API timeout', async () => {
      mockAxios.get.mockImplementation(((url: string, config: any) => {
        return new Promise((resolve, reject) => {
          const signal = config?.signal;
          if (signal?.aborted) {
            const error = new Error('Request aborted');
            error.name = 'AbortError';
            return reject(error);
          }
          signal?.addEventListener('abort', () => {
            const error = new Error('Request aborted');
            error.name = 'AbortError';
            reject(error);
          });
        });
      }) as any);

      const promise = versionApi.getVersionHealth(50);
      
      // Fast-forward time to trigger timeout
      vi.advanceTimersByTime(60);
      
      await expect(promise).rejects.toThrow('Version health API request timed out after 50ms');
    });

    it('handles network errors for health endpoint', async () => {
      mockAxios.get.mockRejectedValue(new Error('Network Error'));

      await expect(versionApi.getVersionHealth()).rejects.toThrow('Network error: Unable to connect to version health API');
    });

    it('handles AbortError for health endpoint', async () => {
      const abortError = new Error('Request aborted');
      abortError.name = 'AbortError';
      mockAxios.get.mockRejectedValue(abortError);

      await expect(versionApi.getVersionHealth(2000)).rejects.toThrow('Version health API request timed out after 2000ms');
    });

    it('uses custom timeout for health endpoint', async () => {
      mockAxios.get.mockResolvedValue({ data: mockHealthResponse });

      await versionApi.getVersionHealth(15000);

      expect(mockAxios.get).toHaveBeenCalledWith('/api/version/health', {
        signal: expect.any(AbortSignal),
        timeout: 15000
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles empty response data', async () => {
      mockAxios.get.mockResolvedValue({ data: null });

      await expect(versionApi.getCurrentVersion(5000, false)).rejects.toThrow();
    });

    it('handles malformed JSON response', async () => {
      mockAxios.get.mockResolvedValue({ data: 'invalid json' });

      await expect(versionApi.getCurrentVersion(5000, false)).rejects.toThrow();
    });

    it('handles missing data property', async () => {
      mockAxios.get.mockResolvedValue({
        data: {
          success: true,
          timestamp: '2024-12-25T10:00:00Z'
          // Missing data property
        }
      });

      await expect(versionApi.getCurrentVersion(5000, false)).rejects.toThrow();
    });

    it('handles partial version data', async () => {
      mockAxios.get.mockResolvedValue({
        data: {
          success: true,
          data: {
            version: 'v1.0.38',
            // Missing other properties
          },
          timestamp: '2024-12-25T10:00:00Z'
        }
      });

      const result = await versionApi.getCurrentVersion(5000, false);
      
      expect(result.version).toBe('1.0.38');
      expect(result.displayVersion).toBe('v1.0.38');
      expect(result.buildDate).toBeUndefined();
      expect(result.commitHash).toBeUndefined();
    });
  });
});
