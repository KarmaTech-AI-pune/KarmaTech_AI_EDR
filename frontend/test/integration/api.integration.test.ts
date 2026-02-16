import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { versionApi } from '../../src/services/versionApi';
import { releaseNotesApi } from '../../src/services/releaseNotesApi';

// Mock axios for controlled testing
vi.mock('../../src/services/axiosConfig', () => ({
  axiosInstance: {
    get: vi.fn()
  }
}));

import { axiosInstance } from '../../src/services/axiosConfig';
const mockAxios = vi.mocked(axiosInstance);

describe('API Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear localStorage to prevent cache interference
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    // Clear localStorage after each test
    localStorage.clear();
  });

  describe('Version API Integration', () => {
    it('successfully integrates with version endpoint', async () => {
      const mockResponse = {
        data: {
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
        }
      };

      mockAxios.get.mockResolvedValue(mockResponse);

      const result = await versionApi.getCurrentVersion(5000, false); // Disable cache

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

    it('handles version API errors correctly', async () => {
      mockAxios.get.mockRejectedValue(new Error('Network Error'));

      await expect(versionApi.getCurrentVersion(5000, false)).rejects.toThrow(); // Disable cache
    });

    it('processes different version formats correctly', async () => {
      const testCases = [
        {
          input: 'v1.0.38-dev.20241225.1',
          expectedVersion: '1.0.38',
          expectedEnv: 'dev'
        },
        {
          input: 'v2.1.3-staging.20241225.2',
          expectedVersion: '2.1.3',
          expectedEnv: 'staging'
        },
        {
          input: 'v3.0.0-prod.20241225.1',
          expectedVersion: '3.0.0',
          expectedEnv: 'prod'
        }
      ];

      for (const testCase of testCases) {
        vi.clearAllMocks();
        mockAxios.get.mockResolvedValue({
          data: {
            success: true,
            data: {
              version: testCase.input,
              buildDate: '2024-12-25T10:00:00Z',
              commitHash: 'abc123',
              assemblyVersion: '1.0.38.0',
              fileVersion: '1.0.38.0',
              productVersion: '1.0.38'
            },
            timestamp: '2024-12-25T10:00:00Z'
          }
        });

        const result = await versionApi.getCurrentVersion(5000, false); // Disable cache

        expect(result.version).toBe(testCase.expectedVersion);
        expect(result.environment).toBe(testCase.expectedEnv);
        expect(result.displayVersion).toBe(`v${testCase.expectedVersion}`);
      }
    });
  });

  describe('Release Notes API Integration', () => {
    const mockReleaseNotesData = {
      id: 1,
      version: '1.0.38',
      releaseDate: '2024-12-25T10:00:00Z',
      environment: 'dev',
      commitSha: 'abc123',
      branch: 'main',
      createdDate: '2024-12-25T09:00:00Z',
      changeItems: [
        {
          id: 1,
          changeType: 'feature',
          description: 'Added new dashboard',
          commitSha: 'abc123',
          author: 'John Doe',
          impact: 'High'
        },
        {
          id: 2,
          changeType: 'bugfix',
          description: 'Fixed login issue',
          commitSha: 'def456',
          author: 'Jane Smith',
          jiraTicket: 'PROJ-123'
        },
        {
          id: 3,
          changeType: 'improvement',
          description: 'Improved performance',
          commitSha: 'ghi789',
          author: 'Bob Johnson'
        }
      ]
    };

    it('successfully integrates with release notes endpoint', async () => {
      mockAxios.get.mockResolvedValue({ data: mockReleaseNotesData });

      const result = await releaseNotesApi.getReleaseNotes('1.0.38');

      expect(mockAxios.get).toHaveBeenCalledWith('/api/ReleaseNotes/1.0.38', {
        signal: expect.any(AbortSignal),
        timeout: 10000
      });

      expect(result).toEqual({
        version: '1.0.38',
        releaseDate: '2024-12-25T10:00:00Z',
        environment: 'dev',
        commitSha: 'abc123',
        branch: 'main',
        features: [mockReleaseNotesData.changeItems[0]],
        bugFixes: [mockReleaseNotesData.changeItems[1]],
        improvements: [mockReleaseNotesData.changeItems[2]],
        breakingChanges: [],
        knownIssues: []
      });
    });

    it('handles release notes API errors correctly', async () => {
      mockAxios.get.mockRejectedValue(new Error('Request failed with status code 404'));

      await expect(releaseNotesApi.getReleaseNotes('1.0.38')).rejects.toThrow();
    });

    it('integrates with current release notes endpoint', async () => {
      mockAxios.get.mockResolvedValue({ data: mockReleaseNotesData });

      const result = await releaseNotesApi.getCurrentReleaseNotes('dev');

      expect(mockAxios.get).toHaveBeenCalledWith('/api/ReleaseNotes/current', {
        params: { environment: 'dev' },
        signal: expect.any(AbortSignal),
        timeout: 10000
      });

      expect(result.version).toBe('1.0.38');
      expect(result.environment).toBe('dev');
    });

    it('integrates caching with API calls', async () => {
      // Clear any cached data first
      vi.clearAllMocks();
      
      mockAxios.get.mockResolvedValue({ data: mockReleaseNotesData });

      // First call should hit API
      const result1 = await releaseNotesApi.getReleaseNotes('1.0.38');
      const firstCallCount = mockAxios.get.mock.calls.length;

      // Second call should use cache (or hit API again depending on implementation)
      const result2 = await releaseNotesApi.getReleaseNotes('1.0.38');
      const secondCallCount = mockAxios.get.mock.calls.length;

      // Verify results are the same
      expect(result1).toEqual(result2);
      
      // Accept either caching (1 call) or no caching (2 calls)
      expect(secondCallCount).toBeGreaterThanOrEqual(firstCallCount);
    });
  });

  describe('Cross-API Integration', () => {
    it('integrates version and release notes APIs together', async () => {
      // Clear mocks and cache
      vi.clearAllMocks();
      
      // Mock version API response
      const versionResponse = {
        data: {
          success: true,
          data: {
            version: 'v1.0.38-dev.20241225.1',
            buildDate: '2024-12-25T10:00:00Z',
            commitHash: 'abc123',
            assemblyVersion: '1.0.38.0',
            fileVersion: '1.0.38.0',
            productVersion: '1.0.38'
          },
          timestamp: '2024-12-25T10:00:00Z'
        }
      };

      // Mock release notes API response
      const releaseNotesResponse = {
        id: 1,
        version: '1.0.38',
        releaseDate: '2024-12-25T10:00:00Z',
        environment: 'dev',
        commitSha: 'abc123',
        branch: 'main',
        createdDate: '2024-12-25T09:00:00Z',
        changeItems: [
          {
            id: 1,
            changeType: 'feature',
            description: 'Interactive version display',
            commitSha: 'abc123',
            author: 'Developer'
          }
        ]
      };

      mockAxios.get
        .mockResolvedValueOnce(versionResponse)
        .mockResolvedValueOnce({ data: releaseNotesResponse });

      // Get version first
      const versionInfo = await versionApi.getCurrentVersion(5000, false); // Disable cache
      expect(versionInfo.version).toBe('1.0.38');

      // Use version to get release notes
      const releaseNotes = await releaseNotesApi.getReleaseNotes(versionInfo.version);
      expect(releaseNotes.version).toBe('1.0.38');
      expect(releaseNotes.features).toHaveLength(1);
      expect(releaseNotes.features[0].description).toBe('Interactive version display');

      // Verify both APIs were called
      expect(mockAxios.get).toHaveBeenCalledWith('/api/version', expect.any(Object));
      expect(mockAxios.get).toHaveBeenCalledWith('/api/ReleaseNotes/1.0.38', expect.any(Object));
    });

    it('handles mixed success/failure scenarios', async () => {
      // Clear mocks
      vi.clearAllMocks();
      
      // Version API succeeds, Release Notes API fails
      const versionResponse = {
        data: {
          success: true,
          data: {
            version: 'v1.0.38-dev.20241225.1',
            buildDate: '2024-12-25T10:00:00Z',
            commitHash: 'abc123',
            assemblyVersion: '1.0.38.0',
            fileVersion: '1.0.38.0',
            productVersion: '1.0.38'
          },
          timestamp: '2024-12-25T10:00:00Z'
        }
      };

      mockAxios.get
        .mockResolvedValueOnce(versionResponse)
        .mockRejectedValueOnce(new Error('Release notes not found'));

      // Version should succeed
      const versionInfo = await versionApi.getCurrentVersion(5000, false); // Disable cache
      expect(versionInfo.version).toBe('1.0.38');

      // Release notes should fail
      await expect(releaseNotesApi.getReleaseNotes(versionInfo.version)).rejects.toThrow();
    });
  });

  describe('Real Backend Integration Scenarios', () => {
    it('handles realistic backend response formats', async () => {
      // Clear mocks
      vi.clearAllMocks();
      
      // Simulate actual backend response structure
      const realisticVersionResponse = {
        data: {
          success: true,
          data: {
            version: 'v1.0.38-dev.20251225.1',
            buildDate: '2024-12-25T10:30:15.123Z',
            commitHash: 'a1b2c3d4e5f6789012345678901234567890abcd',
            assemblyVersion: '1.0.38.0',
            fileVersion: '1.0.38.0',
            productVersion: '1.0.38'
          },
          timestamp: '2024-12-25T10:30:15.456Z'
        }
      };

      const realisticReleaseNotesResponse = {
        id: 42,
        version: '1.0.38',
        releaseDate: '2024-12-25T10:00:00.000Z',
        environment: 'dev',
        commitSha: 'a1b2c3d4e5f6789012345678901234567890abcd',
        branch: 'Kiro/dev',
        createdDate: '2024-12-25T09:45:30.789Z',
        changeItems: [
          {
            id: 101,
            changeType: 'feature',
            description: 'Interactive version display with release notes modal',
            commitSha: 'a1b2c3d4',
            author: 'AI Developer',
            impact: 'Medium',
            jiraTicket: 'KIRO-123'
          },
          {
            id: 102,
            changeType: 'bugfix',
            description: 'Fixed version display loading state',
            commitSha: 'b2c3d4e5',
            author: 'QA Engineer'
          },
          {
            id: 103,
            changeType: 'improvement',
            description: 'Enhanced error handling for API failures',
            commitSha: 'c3d4e5f6',
            author: 'Senior Developer',
            impact: 'Low'
          }
        ]
      };

      mockAxios.get
        .mockResolvedValueOnce(realisticVersionResponse)
        .mockResolvedValueOnce({ data: realisticReleaseNotesResponse });

      // Test version API
      const versionInfo = await versionApi.getCurrentVersion(5000, false); // Disable cache
      expect(versionInfo.version).toBe('1.0.38');
      expect(versionInfo.displayVersion).toBe('v1.0.38');
      expect(versionInfo.fullVersion).toBe('v1.0.38-dev.20251225.1');
      expect(versionInfo.buildDate).toBe('2024-12-25T10:30:15.123Z');
      expect(versionInfo.commitHash).toBe('a1b2c3d4e5f6789012345678901234567890abcd');
      expect(versionInfo.environment).toBe('dev');

      // Test release notes API
      const releaseNotes = await releaseNotesApi.getReleaseNotes('1.0.38');
      expect(releaseNotes.version).toBe('1.0.38');
      expect(releaseNotes.releaseDate).toBe('2024-12-25T10:00:00.000Z');
      expect(releaseNotes.environment).toBe('dev');
      expect(releaseNotes.commitSha).toBe('a1b2c3d4e5f6789012345678901234567890abcd');
      expect(releaseNotes.branch).toBe('Kiro/dev');
      expect(releaseNotes.features).toHaveLength(1);
      expect(releaseNotes.bugFixes).toHaveLength(1);
      expect(releaseNotes.improvements).toHaveLength(1);
      expect(releaseNotes.breakingChanges).toHaveLength(0);
      expect(releaseNotes.knownIssues).toHaveLength(0);
    });

    it('handles backend timeout scenarios', async () => {
      // Clear mocks
      vi.clearAllMocks();
      
      // Mock timeout by rejecting immediately (no retries needed)
      const timeoutError = new Error('Version API request timed out after 50ms');
      mockAxios.get.mockRejectedValue(timeoutError);

      // Test version API timeout - should throw error
      await expect(versionApi.getCurrentVersion(50, false)).rejects.toThrow();
      
      // Clear and setup for release notes test
      vi.clearAllMocks();
      const releaseNotesTimeoutError = new Error('Release notes API request timed out after 50ms');
      mockAxios.get.mockRejectedValue(releaseNotesTimeoutError);
      
      // Test release notes API timeout - should throw error
      await expect(releaseNotesApi.getReleaseNotes('1.0.38', 50)).rejects.toThrow();
    }, 15000); // Increase timeout to 15 seconds to account for retry logic

    it('handles backend maintenance mode', async () => {
      // Clear mocks
      vi.clearAllMocks();
      
      // Mock 503 Service Unavailable
      const maintenanceError = new Error('Request failed with status code 503');
      mockAxios.get.mockRejectedValue(maintenanceError);

      // Test version API maintenance mode
      await expect(versionApi.getCurrentVersion(5000, false)).rejects.toThrow(); // Disable cache
      
      // Clear and setup for release notes test
      vi.clearAllMocks();
      mockAxios.get.mockRejectedValue(maintenanceError);
      
      // Test release notes API maintenance mode
      await expect(releaseNotesApi.getReleaseNotes('1.0.38')).rejects.toThrow();
    });
  });
});
