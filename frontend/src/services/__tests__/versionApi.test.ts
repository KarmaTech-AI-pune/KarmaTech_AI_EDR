import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { versionApi, type CurrentVersionResponse, type VersionInfo } from '../versionApi';
import { axiosInstance } from '../axiosConfig';

// Mock axios instance
vi.mock('../axiosConfig', () => ({
  axiosInstance: {
    get: vi.fn()
  }
}));

const mockedAxios = vi.mocked(axiosInstance);

describe('versionApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getCurrentVersion', () => {
    it('should fetch and process version information correctly', async () => {
      // Arrange
      const mockResponse: CurrentVersionResponse = {
        success: true,
        data: {
          version: 'v1.0.38-dev.20251223.1',
          buildDate: '2024-12-23T10:30:00Z',
          commitHash: 'abc123def456',
          assemblyVersion: '1.0.38.0',
          fileVersion: '1.0.38.0',
          productVersion: '1.0.38-dev.20251223.1'
        },
        timestamp: '2024-12-23T10:30:00Z'
      };

      mockedAxios.get.mockResolvedValueOnce({ data: mockResponse });

      // Act
      const result = await versionApi.getCurrentVersion();

      // Assert
      expect(result).toEqual({
        version: '1.0.38',
        displayVersion: 'v1.0.38',
        fullVersion: 'v1.0.38-dev.20251223.1',
        buildDate: '2024-12-23T10:30:00Z',
        commitHash: 'abc123def456',
        environment: 'dev'
      });

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/version', {
        signal: expect.any(AbortSignal),
        timeout: 5000
      });
    });

    it('should extract semantic version from various formats', async () => {
      const testCases = [
        { input: 'v1.0.38-dev.20251223.1', expected: '1.0.38' },
        { input: '2.1.5-staging.20251224.2', expected: '2.1.5' },
        { input: 'v3.2.1', expected: '3.2.1' },
        { input: '1.0.0', expected: '1.0.0' },
        { input: '', expected: '0.0.0' }
      ];

      for (const testCase of testCases) {
        const mockResponse: CurrentVersionResponse = {
          success: true,
          data: {
            version: testCase.input,
            buildDate: '2024-12-23T10:30:00Z',
            commitHash: 'abc123',
            assemblyVersion: '1.0.0.0',
            fileVersion: '1.0.0.0',
            productVersion: testCase.input
          },
          timestamp: '2024-12-23T10:30:00Z'
        };

        mockedAxios.get.mockResolvedValueOnce({ data: mockResponse });

        const result = await versionApi.getCurrentVersion();
        expect(result.version).toBe(testCase.expected);
      }
    });

    it('should detect environment correctly', async () => {
      const testCases = [
        { version: 'v1.0.38-dev.20251223.1', expectedEnv: 'dev' },
        { version: '1.2.3-staging.20251224.1', expectedEnv: 'staging' },
        { version: 'v2.0.0-prod.20251225.1', expectedEnv: 'prod' },
        { version: 'v1.0.0', expectedEnv: 'prod' },
        { version: '', expectedEnv: 'unknown' }
      ];

      for (const testCase of testCases) {
        const mockResponse: CurrentVersionResponse = {
          success: true,
          data: {
            version: testCase.version,
            buildDate: '2024-12-23T10:30:00Z',
            commitHash: 'abc123',
            assemblyVersion: '1.0.0.0',
            fileVersion: '1.0.0.0',
            productVersion: testCase.version
          },
          timestamp: '2024-12-23T10:30:00Z'
        };

        mockedAxios.get.mockResolvedValueOnce({ data: mockResponse });

        const result = await versionApi.getCurrentVersion();
        expect(result.environment).toBe(testCase.expectedEnv);
      }
    });

    it('should handle API timeout errors', async () => {
      // Arrange
      const abortError = new Error('Request aborted');
      abortError.name = 'AbortError';
      mockedAxios.get.mockRejectedValueOnce(abortError);

      // Act & Assert
      await expect(versionApi.getCurrentVersion(1000)).rejects.toThrow(
        'Version API request timed out after 1000ms'
      );
    });

    it('should handle network errors', async () => {
      // Arrange
      const networkError = new Error('Network Error');
      mockedAxios.get.mockRejectedValueOnce(networkError);

      // Act & Assert
      await expect(versionApi.getCurrentVersion()).rejects.toThrow(
        'Network error: Unable to connect to version API'
      );
    });

    it('should handle unsuccessful API response', async () => {
      // Arrange
      const mockResponse: CurrentVersionResponse = {
        success: false,
        data: {
          version: '',
          buildDate: '',
          commitHash: '',
          assemblyVersion: '',
          fileVersion: '',
          productVersion: ''
        },
        timestamp: '2024-12-23T10:30:00Z'
      };

      mockedAxios.get.mockResolvedValueOnce({ data: mockResponse });

      // Act & Assert
      await expect(versionApi.getCurrentVersion()).rejects.toThrow(
        'Failed to fetch version information'
      );
    });

    it('should handle generic errors', async () => {
      // Arrange
      const genericError = new Error('Something went wrong');
      mockedAxios.get.mockRejectedValueOnce(genericError);

      // Act & Assert
      await expect(versionApi.getCurrentVersion()).rejects.toThrow(
        'Failed to fetch version information'
      );
    });
  });

  describe('getVersionHealth', () => {
    it('should fetch version health information correctly', async () => {
      // Arrange
      const mockHealthResponse = {
        status: 'healthy',
        version: '1.0.38',
        commitHash: 'abc123def456',
        buildDate: '2024-12-23T10:30:00Z',
        environment: 'dev',
        uptime: '1d 2h 30m 45s',
        timestamp: '2024-12-23T10:30:00Z',
        checks: {
          api: 'healthy',
          memory: 'healthy',
          disk: 'healthy',
          version_file: 'healthy'
        }
      };

      mockedAxios.get.mockResolvedValueOnce({ data: mockHealthResponse });

      // Act
      const result = await versionApi.getVersionHealth();

      // Assert
      expect(result).toEqual(mockHealthResponse);
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/version/health', {
        signal: expect.any(AbortSignal),
        timeout: 5000
      });
    });

    it('should handle health API timeout errors', async () => {
      // Arrange
      const abortError = new Error('Request aborted');
      abortError.name = 'AbortError';
      mockedAxios.get.mockRejectedValueOnce(abortError);

      // Act & Assert
      await expect(versionApi.getVersionHealth(2000)).rejects.toThrow(
        'Version health API request timed out after 2000ms'
      );
    });

    it('should handle health API network errors', async () => {
      // Arrange
      const networkError = new Error('Network Error');
      mockedAxios.get.mockRejectedValueOnce(networkError);

      // Act & Assert
      await expect(versionApi.getVersionHealth()).rejects.toThrow(
        'Network error: Unable to connect to version health API'
      );
    });
  });
});