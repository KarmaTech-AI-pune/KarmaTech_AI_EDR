import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
vi.unmock('axios');

import { getScoringDescriptions } from './scoringDescriptionApi';
import { axiosInstance } from './axiosConfig';
import MockAdapter from 'axios-mock-adapter';

describe('scoringDescriptionApi', () => {
  let mockAxios: MockAdapter;

  beforeEach(() => {
    mockAxios = new MockAdapter(axiosInstance);
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    mockAxios.restore();
    vi.restoreAllMocks();
  });

  describe('getScoringDescriptions', () => {
    it('returns descriptions successfully', async () => {
      const mockData = {
        descriptions: {
          'Risk': { high: 'H', medium: 'M', low: 'L' }
        }
      };
      
      mockAxios.onGet('/api/ScoringDescription').reply(200, mockData);
      
      const result = await getScoringDescriptions();
      expect(result).toEqual(mockData);
    });

    it('throws error on failure', async () => {
      mockAxios.onGet('/api/ScoringDescription').reply(500);
      await expect(getScoringDescriptions()).rejects.toThrow();
    });
  });
});
