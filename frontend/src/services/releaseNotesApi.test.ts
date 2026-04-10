import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { releaseNotesApi, ReleaseNotesData } from './releaseNotesApi';
import { axiosInstance } from './axiosConfig';

// Mock axios
vi.mock('./axiosConfig', () => ({
  axiosInstance: {
    get: vi.fn()
  }
}));

const mockAxios = vi.mocked(axiosInstance);

describe('releaseNotesApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
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
      { id: 1, changeType: 'Feature', description: 'Added', commitSha: 'abc123', author: 'dev@ex.com' }
    ]
  };

  describe('getReleaseNotes', () => {
    it('should throw error when API fails after retries', async () => {
      (mockAxios.get as import('vitest').Mock).mockRejectedValue(new Error('Network Error'));

      const promise = releaseNotesApi.getReleaseNotes('1.0.38');
      promise.catch(() => {}); // Prevent unhandled rejection warning
      
      // withErrorHandling uses retries. Advancing timers significantly.
      for (let i = 0; i < 10; i++) {
        await vi.advanceTimersByTimeAsync(50000);
      }

      await expect(promise).rejects.toThrow(/problem with the server/i);
    }, 20000);

    it('should fetch release notes', async () => {
        (mockAxios.get as import('vitest').Mock).mockResolvedValue({ data: mockReleaseNotesData });
        const result = await releaseNotesApi.getReleaseNotes('1.0.38');
        expect(result.version).toBe('1.0.38');
    });
  });

  describe('cache management', () => {
    it('should clear all cache', () => {
      localStorage.setItem('release_notes_1.0.38', JSON.stringify({
        data: { version: '1.0.38' },
        timestamp: Date.now(),
        expiry: 1000
      }));
      releaseNotesApi.clearCache();
      expect(localStorage.getItem('release_notes_1.0.38')).toBeNull();
    });
  });
});