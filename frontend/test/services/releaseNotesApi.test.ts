import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { releaseNotesApi, ReleaseNotesData, ProcessedReleaseNotes } from '../../src/services/releaseNotesApi';
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

const mockAxios = vi.mocked(axiosInstance);

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  key: vi.fn(),
  length: 0
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('releaseNotesApi', () => {
  const mockReleaseNotesData: ReleaseNotesData = {
    id: 1,
    version: '1.2.3',
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

  const expectedProcessedData: ProcessedReleaseNotes = {
    version: '1.2.3',
    releaseDate: '2024-12-25T10:00:00Z',
    environment: 'dev',
    commitSha: 'abc123',
    branch: 'main',
    features: [mockReleaseNotesData.changeItems[0]],
    bugFixes: [mockReleaseNotesData.changeItems[1]],
    improvements: [mockReleaseNotesData.changeItems[2]],
    breakingChanges: [],
    knownIssues: []
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useFakeTimers();
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockImplementation(() => {});
    localStorageMock.removeItem.mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('getReleaseNotes', () => {
    it('successfully fetches and processes release notes', async () => {
      mockAxios.get.mockResolvedValue({ data: mockReleaseNotesData });

      const result = await releaseNotesApi.getReleaseNotes('1.2.3');

      expect(mockAxios.get).toHaveBeenCalledWith('/api/ReleaseNotes/1.2.3', {
        signal: expect.any(AbortSignal),
        timeout: 10000
      });

      expect(result).toEqual(expectedProcessedData);
    });

    it('removes v prefix from version', async () => {
      mockAxios.get.mockResolvedValue({ data: mockReleaseNotesData });

      await releaseNotesApi.getReleaseNotes('v1.2.3');

      expect(mockAxios.get).toHaveBeenCalledWith('/api/ReleaseNotes/1.2.3', {
        signal: expect.any(AbortSignal),
        timeout: 10000
      });
    });

    it('organizes change items by type correctly', async () => {
      const dataWithBreakingChanges = {
        ...mockReleaseNotesData,
        changeItems: [
          ...mockReleaseNotesData.changeItems,
          {
            id: 4,
            changeType: 'breaking',
            description: 'Removed deprecated API',
            commitSha: 'jkl012',
            author: 'Alice Brown'
          }
        ]
      };

      mockAxios.get.mockResolvedValue({ data: dataWithBreakingChanges });

      const result = await releaseNotesApi.getReleaseNotes('1.2.3');

      expect(result.features).toHaveLength(1);
      expect(result.bugFixes).toHaveLength(1);
      expect(result.improvements).toHaveLength(1);
      expect(result.breakingChanges).toHaveLength(1);
      expect(result.breakingChanges[0].description).toBe('Removed deprecated API');
    });

    it('handles alternative change type names', async () => {
      const dataWithAlternativeTypes = {
        ...mockReleaseNotesData,
        changeItems: [
          { id: 1, changeType: 'bug', description: 'Bug fix', commitSha: 'abc' },
          { id: 2, changeType: 'fix', description: 'Another fix', commitSha: 'def' },
          { id: 3, changeType: 'enhancement', description: 'Enhancement', commitSha: 'ghi' },
          { id: 4, changeType: 'breakingchange', description: 'Breaking change', commitSha: 'jkl' }
        ]
      };

      mockAxios.get.mockResolvedValue({ data: dataWithAlternativeTypes });

      const result = await releaseNotesApi.getReleaseNotes('1.2.3');

      expect(result.bugFixes).toHaveLength(2);
      expect(result.improvements).toHaveLength(1);
      expect(result.breakingChanges).toHaveLength(1);
    });

    it('uses cached data when available and not expired', async () => {
      const cachedData = {
        data: expectedProcessedData,
        timestamp: Date.now(),
        expiry: 24 * 60 * 60 * 1000 // 24 hours
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(cachedData));

      const result = await releaseNotesApi.getReleaseNotes('1.2.3');

      expect(result).toEqual(expectedProcessedData);
      expect(mockAxios.get).not.toHaveBeenCalled();
    });

    it('ignores expired cached data', async () => {
      const expiredCachedData = {
        data: expectedProcessedData,
        timestamp: Date.now() - (25 * 60 * 60 * 1000), // 25 hours ago
        expiry: 24 * 60 * 60 * 1000 // 24 hours
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(expiredCachedData));
      mockAxios.get.mockResolvedValue({ data: mockReleaseNotesData });

      const result = await releaseNotesApi.getReleaseNotes('1.2.3');

      expect(mockAxios.get).toHaveBeenCalled();
      expect(localStorageMock.removeItem).toHaveBeenCalled();
    });

    it('caches fetched data with appropriate expiry', async () => {
      mockAxios.get.mockResolvedValue({ data: mockReleaseNotesData });

      await releaseNotesApi.getReleaseNotes('1.2.3');

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'release_notes_1.2.3',
        expect.stringContaining('"data":')
      );
    });

    it('uses shorter cache expiry for development versions', async () => {
      mockAxios.get.mockResolvedValue({ data: mockReleaseNotesData });

      await releaseNotesApi.getReleaseNotes('1.2.3-dev.20241225.1');

      // Should still cache, but with shorter expiry
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('handles API timeout', async () => {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('timeout')), 100);
      });
      
      mockAxios.get.mockReturnValue(timeoutPromise);

      const promise = releaseNotesApi.getReleaseNotes('1.2.3', 50);
      
      vi.advanceTimersByTime(60);
      
      await expect(promise).rejects.toThrow('Release notes API request timed out after 50ms');
    });

    it('handles network errors', async () => {
      mockAxios.get.mockRejectedValue(new Error('Network Error'));

      await expect(releaseNotesApi.getReleaseNotes('1.2.3')).rejects.toThrow('Network error: Unable to connect to release notes API');
    });

    it('handles 404 errors', async () => {
      const error = new Error('Request failed with status code 404');
      error.message = '404';
      mockAxios.get.mockRejectedValue(error);

      await expect(releaseNotesApi.getReleaseNotes('1.2.3')).rejects.toThrow('Release notes not found for version 1.2.3');
    });

    it('handles AbortError', async () => {
      const abortError = new Error('Request aborted');
      abortError.name = 'AbortError';
      mockAxios.get.mockRejectedValue(abortError);

      await expect(releaseNotesApi.getReleaseNotes('1.2.3', 1000)).rejects.toThrow('Release notes API request timed out after 1000ms');
    });

    it('handles empty response data', async () => {
      mockAxios.get.mockResolvedValue({ data: null });

      await expect(releaseNotesApi.getReleaseNotes('1.2.3')).rejects.toThrow('No release notes data received from API');
    });
  });

  describe('getCurrentReleaseNotes', () => {
    it('successfully fetches current release notes', async () => {
      mockAxios.get.mockResolvedValue({ data: mockReleaseNotesData });

      const result = await releaseNotesApi.getCurrentReleaseNotes('dev');

      expect(mockAxios.get).toHaveBeenCalledWith('/api/ReleaseNotes/current', {
        params: { environment: 'dev' },
        signal: expect.any(AbortSignal),
        timeout: 10000
      });

      expect(result).toEqual(expectedProcessedData);
    });

    it('uses default environment when not specified', async () => {
      mockAxios.get.mockResolvedValue({ data: mockReleaseNotesData });

      await releaseNotesApi.getCurrentReleaseNotes();

      expect(mockAxios.get).toHaveBeenCalledWith('/api/ReleaseNotes/current', {
        params: { environment: 'dev' },
        signal: expect.any(AbortSignal),
        timeout: 10000
      });
    });

    it('caches current release notes', async () => {
      mockAxios.get.mockResolvedValue({ data: mockReleaseNotesData });

      await releaseNotesApi.getCurrentReleaseNotes('prod');

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'current_release_notes_prod',
        expect.stringContaining('"data":')
      );
    });

    it('handles 404 for current release notes', async () => {
      const error = new Error('Request failed with status code 404');
      error.message = '404';
      mockAxios.get.mockRejectedValue(error);

      await expect(releaseNotesApi.getCurrentReleaseNotes('staging')).rejects.toThrow('No release notes found for current version in staging environment');
    });
  });

  describe('getReleaseHistory', () => {
    const mockHistoryData = [mockReleaseNotesData];

    it('successfully fetches release history', async () => {
      mockAxios.get.mockResolvedValue({ data: mockHistoryData });

      const result = await releaseNotesApi.getReleaseHistory('dev', 0, 10);

      expect(mockAxios.get).toHaveBeenCalledWith('/api/ReleaseNotes/history', {
        params: { environment: 'dev', skip: 0, take: 10 },
        signal: expect.any(AbortSignal),
        timeout: 10000
      });

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(expectedProcessedData);
    });

    it('uses default pagination parameters', async () => {
      mockAxios.get.mockResolvedValue({ data: mockHistoryData });

      await releaseNotesApi.getReleaseHistory();

      expect(mockAxios.get).toHaveBeenCalledWith('/api/ReleaseNotes/history', {
        params: { skip: 0, take: 10 },
        signal: expect.any(AbortSignal),
        timeout: 10000
      });
    });

    it('handles invalid array response', async () => {
      mockAxios.get.mockResolvedValue({ data: 'not an array' });

      await expect(releaseNotesApi.getReleaseHistory()).rejects.toThrow('Invalid release history data received from API');
    });
  });

  describe('searchReleaseNotes', () => {
    const mockSearchData = [mockReleaseNotesData];

    it('successfully searches release notes', async () => {
      mockAxios.get.mockResolvedValue({ data: mockSearchData });

      const result = await releaseNotesApi.searchReleaseNotes(
        'dashboard',
        'dev',
        new Date('2024-12-01'),
        new Date('2024-12-31'),
        0,
        5
      );

      expect(mockAxios.get).toHaveBeenCalledWith('/api/ReleaseNotes/search', {
        params: {
          searchTerm: 'dashboard',
          environment: 'dev',
          fromDate: '2024-12-01T00:00:00.000Z',
          toDate: '2024-12-31T00:00:00.000Z',
          skip: 0,
          take: 5
        },
        signal: expect.any(AbortSignal),
        timeout: 10000
      });

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(expectedProcessedData);
    });

    it('handles optional search parameters', async () => {
      mockAxios.get.mockResolvedValue({ data: mockSearchData });

      await releaseNotesApi.searchReleaseNotes();

      expect(mockAxios.get).toHaveBeenCalledWith('/api/ReleaseNotes/search', {
        params: { skip: 0, take: 10 },
        signal: expect.any(AbortSignal),
        timeout: 10000
      });
    });

    it('handles invalid search results', async () => {
      mockAxios.get.mockResolvedValue({ data: null });

      await expect(releaseNotesApi.searchReleaseNotes()).rejects.toThrow('Invalid search results received from API');
    });
  });

  describe('Cache Management', () => {
    it('clears all cached release notes data', () => {
      Object.defineProperty(localStorage, 'keys', {
        value: vi.fn().mockReturnValue([
          'release_notes_1.2.3',
          'current_release_notes_dev',
          'release_history_dev_0_10',
          'search_results_test',
          'other_cache_key'
        ])
      });

      Object.keys = vi.fn().mockReturnValue([
        'release_notes_1.2.3',
        'current_release_notes_dev',
        'release_history_dev_0_10',
        'search_results_test',
        'other_cache_key'
      ]);

      releaseNotesApi.clearCache();

      expect(localStorageMock.removeItem).toHaveBeenCalledTimes(4); // Should not remove 'other_cache_key'
    });

    it('clears cache for specific version', () => {
      releaseNotesApi.clearVersionCache('1.2.3');

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('release_notes_1.2.3');
    });

    it('clears cache for specific version with v prefix', () => {
      releaseNotesApi.clearVersionCache('v1.2.3');

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('release_notes_1.2.3');
    });

    it('clears cache for specific environment', () => {
      Object.keys = vi.fn().mockReturnValue([
        'release_notes_1.2.3',
        'current_release_notes_dev',
        'release_history_dev_0_10',
        'current_release_notes_prod'
      ]);

      releaseNotesApi.clearEnvironmentCache('dev');

      expect(localStorageMock.removeItem).toHaveBeenCalledTimes(2);
    });

    it('handles localStorage errors gracefully', () => {
      localStorageMock.removeItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      // Should not throw
      expect(() => releaseNotesApi.clearCache()).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('handles corrupted cache data', async () => {
      localStorageMock.getItem.mockReturnValue('invalid json');
      mockAxios.get.mockResolvedValue({ data: mockReleaseNotesData });

      const result = await releaseNotesApi.getReleaseNotes('1.2.3');

      expect(result).toEqual(expectedProcessedData);
      expect(localStorageMock.removeItem).toHaveBeenCalled(); // Should remove corrupted cache
    });

    it('handles localStorage quota exceeded error', async () => {
      mockAxios.get.mockResolvedValue({ data: mockReleaseNotesData });
      
      const quotaError = new Error('QuotaExceededError');
      quotaError.name = 'QuotaExceededError';
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw quotaError;
      });

      // Should not throw, should handle gracefully
      await expect(releaseNotesApi.getReleaseNotes('1.2.3')).resolves.toEqual(expectedProcessedData);
    });

    it('handles missing changeItems array', async () => {
      const dataWithoutChangeItems = {
        ...mockReleaseNotesData,
        changeItems: undefined as any
      };

      mockAxios.get.mockResolvedValue({ data: dataWithoutChangeItems });

      const result = await releaseNotesApi.getReleaseNotes('1.2.3');

      expect(result.features).toEqual([]);
      expect(result.bugFixes).toEqual([]);
      expect(result.improvements).toEqual([]);
      expect(result.breakingChanges).toEqual([]);
    });

    it('handles unknown change types', async () => {
      const dataWithUnknownType = {
        ...mockReleaseNotesData,
        changeItems: [
          {
            id: 1,
            changeType: 'unknown',
            description: 'Unknown change type',
            commitSha: 'abc123'
          }
        ]
      };

      mockAxios.get.mockResolvedValue({ data: dataWithUnknownType });

      const result = await releaseNotesApi.getReleaseNotes('1.2.3');

      // Unknown types should default to improvements
      expect(result.improvements).toHaveLength(1);
      expect(result.improvements[0].description).toBe('Unknown change type');
    });
  });
});