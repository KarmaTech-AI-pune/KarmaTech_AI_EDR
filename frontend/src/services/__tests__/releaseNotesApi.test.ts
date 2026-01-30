import { describe, it, expect, beforeEach, vi } from 'vitest';
import { releaseNotesApi, ReleaseNotesData } from '../releaseNotesApi';
import { axiosInstance } from '../axiosConfig';

// Mock axios
vi.mock('../axiosConfig', () => ({
  axiosInstance: {
    get: vi.fn()
  }
}));

const mockAxios = axiosInstance as any;

describe('releaseNotesApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear localStorage before each test
    localStorage.clear();
  });

  const mockReleaseNotesData: ReleaseNotesData = {
    id: 1,
    version: '1.0.38',
    releaseDate: '2024-12-24T10:00:00Z',
    environment: 'dev',
    commitSha: 'abc123',
    branch: 'Kiro/dev',
    createdDate: '2024-12-24T10:00:00Z',
    changeItems: [
      {
        id: 1,
        changeType: 'Feature',
        description: 'Added new feature',
        commitSha: 'abc123',
        author: 'developer@example.com'
      },
      {
        id: 2,
        changeType: 'BugFix',
        description: 'Fixed critical bug',
        commitSha: 'def456',
        author: 'developer@example.com'
      }
    ]
  };

  describe('getReleaseNotes', () => {
    it('should fetch and process release notes for a specific version', async () => {
      mockAxios.get.mockResolvedValue({ data: mockReleaseNotesData });

      const result = await releaseNotesApi.getReleaseNotes('1.0.38');

      expect(mockAxios.get).toHaveBeenCalledWith('/api/ReleaseNotes/1.0.38', expect.any(Object));
      expect(result).toEqual({
        version: '1.0.38',
        releaseDate: '2024-12-24T10:00:00Z',
        environment: 'dev',
        commitSha: 'abc123',
        branch: 'Kiro/dev',
        features: [mockReleaseNotesData.changeItems[0]],
        bugFixes: [mockReleaseNotesData.changeItems[1]],
        improvements: [],
        breakingChanges: [],
        knownIssues: []
      });
    });

    it('should handle version with v prefix', async () => {
      mockAxios.get.mockResolvedValue({ data: mockReleaseNotesData });

      await releaseNotesApi.getReleaseNotes('v1.0.38');

      expect(mockAxios.get).toHaveBeenCalledWith('/api/ReleaseNotes/1.0.38', expect.any(Object));
    });

    it('should cache release notes data', async () => {
      mockAxios.get.mockResolvedValue({ data: mockReleaseNotesData });

      // First call
      await releaseNotesApi.getReleaseNotes('1.0.38');
      expect(mockAxios.get).toHaveBeenCalledTimes(1);

      // Second call should use cache
      await releaseNotesApi.getReleaseNotes('1.0.38');
      expect(mockAxios.get).toHaveBeenCalledTimes(1);
    });

    it('should throw error when API fails', async () => {
      mockAxios.get.mockRejectedValue(new Error('Network Error'));

      await expect(releaseNotesApi.getReleaseNotes('1.0.38')).rejects.toThrow(
        'Network error: Unable to connect to release notes API'
      );
    });
  });

  describe('getCurrentReleaseNotes', () => {
    it('should fetch current release notes for environment', async () => {
      mockAxios.get.mockResolvedValue({ data: mockReleaseNotesData });

      const result = await releaseNotesApi.getCurrentReleaseNotes('dev');

      expect(mockAxios.get).toHaveBeenCalledWith('/api/ReleaseNotes/current', {
        params: { environment: 'dev' },
        signal: expect.any(AbortSignal),
        timeout: 10000
      });
      expect(result.version).toBe('1.0.38');
    });

    it('should use default environment when not specified', async () => {
      mockAxios.get.mockResolvedValue({ data: mockReleaseNotesData });

      await releaseNotesApi.getCurrentReleaseNotes();

      expect(mockAxios.get).toHaveBeenCalledWith('/api/ReleaseNotes/current', {
        params: { environment: 'dev' },
        signal: expect.any(AbortSignal),
        timeout: 10000
      });
    });
  });

  describe('cache management', () => {
    it('should clear all cache', () => {
      // Set some cache data
      localStorage.setItem('release_notes_1.0.38', JSON.stringify({
        data: mockReleaseNotesData,
        timestamp: Date.now(),
        expiry: 1000
      }));

      releaseNotesApi.clearCache();

      expect(localStorage.getItem('release_notes_1.0.38')).toBeNull();
    });

    it('should clear version-specific cache', () => {
      localStorage.setItem('release_notes_1.0.38', JSON.stringify({
        data: mockReleaseNotesData,
        timestamp: Date.now(),
        expiry: 1000
      }));

      releaseNotesApi.clearVersionCache('1.0.38');

      expect(localStorage.getItem('release_notes_1.0.38')).toBeNull();
    });
  });

  describe('data processing', () => {
    it('should organize change items by type', async () => {
      const dataWithMultipleTypes: ReleaseNotesData = {
        ...mockReleaseNotesData,
        changeItems: [
          { id: 1, changeType: 'Feature', description: 'New feature' },
          { id: 2, changeType: 'BugFix', description: 'Bug fix' },
          { id: 3, changeType: 'Improvement', description: 'Enhancement' },
          { id: 4, changeType: 'Breaking', description: 'Breaking change' },
          { id: 5, changeType: 'Unknown', description: 'Unknown type' }
        ]
      };

      mockAxios.get.mockResolvedValue({ data: dataWithMultipleTypes });

      const result = await releaseNotesApi.getReleaseNotes('1.0.38');

      expect(result.features).toHaveLength(1);
      expect(result.bugFixes).toHaveLength(1);
      expect(result.improvements).toHaveLength(2); // Enhancement + Unknown (default)
      expect(result.breakingChanges).toHaveLength(1);
    });
  });
});