import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
vi.unmock('axios');

import { goNoGoOpportunityApi } from './goNoGoOpportunityApi';
import { axiosInstance } from './axiosConfig';
import MockAdapter from 'axios-mock-adapter';

describe('goNoGoOpportunityApi', () => {
  let mockAxios: MockAdapter;

  beforeEach(() => {
    mockAxios = new MockAdapter(axiosInstance);
    // Suppress console logs in tests
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    mockAxios.restore();
    vi.restoreAllMocks();
  });

  describe('getScoringCriteria', () => {
    it('returns and maps scoring criteria', async () => {
      mockAxios.onGet('/api/GoNoGoDecisionOpportunity/GetScoringCriteria').reply(200, [
        { Id: 1, Label: 'Test Crit', ByWhom: 'User1', ByDate: '2023-01-01', Comments: 'None', Score: 5, ShowComments: true }
      ]);
      const result = await goNoGoOpportunityApi.getScoringCriteria();
      expect(result).toHaveLength(1);
      expect(result[0].Id).toBe(1);
      expect(result[0].Label).toBe('Test Crit');
      expect(result[0].ByWhom).toBe('User1');
      expect(result[0].ByDate).toBe('2023-01-01');
      expect(result[0].Comments).toBe('None');
      expect(result[0].Score).toBe(5);
      expect(result[0].ShowComments).toBe(true);
    });

    it('handles defaults when fields are missing', async () => {
      mockAxios.onGet('/api/GoNoGoDecisionOpportunity/GetScoringCriteria').reply(200, [{}]);
      const result = await goNoGoOpportunityApi.getScoringCriteria();
      expect(result[0]).toEqual({
        Id: 0,
        Label: '',
        ByWhom: '',
        ByDate: '',
        Comments: '',
        Score: 0,
        ShowComments: false
      });
    });

    it('returns empty array on error', async () => {
      mockAxios.onGet('/api/GoNoGoDecisionOpportunity/GetScoringCriteria').reply(500);
      const result = await goNoGoOpportunityApi.getScoringCriteria();
      expect(result).toEqual([]);
    });
  });

  describe('getScoringRanges', () => {
    it('returns and maps scoring ranges', async () => {
      mockAxios.onGet('/api/GoNoGoDecisionOpportunity/GetScoringRange').reply(200, [
        { Id: 1, Value: 10, Label: 'High Score', Range: 'high' }
      ]);
      const result = await goNoGoOpportunityApi.getScoringRanges();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
      expect(result[0].value).toBe(10);
      expect(result[0].label).toBe('High Score');
      expect(result[0].range).toBe('high');
    });

    it('handles defaults when fields are missing', async () => {
      mockAxios.onGet('/api/GoNoGoDecisionOpportunity/GetScoringRange').reply(200, [{}]);
      const result = await goNoGoOpportunityApi.getScoringRanges();
      expect(result[0]).toEqual({
        id: 0,
        value: 0,
        label: '',
        range: 'low'
      });
    });

    it('returns empty array on error', async () => {
      mockAxios.onGet('/api/GoNoGoDecisionOpportunity/GetScoringRange').reply(500);
      const result = await goNoGoOpportunityApi.getScoringRanges();
      expect(result).toEqual([]);
    });
  });

  describe('getScoringDescriptions', () => {
    it('returns and maps scoring descriptions', async () => {
      mockAxios.onGet('/api/GoNoGoDecisionOpportunity/GetScoringRDescription').reply(200, [
        { Id: 1, Label: 'Risk', High: 'High Risk', Medium: 'Medium Risk', Low: 'Low Risk' }
      ]);
      const result = await goNoGoOpportunityApi.getScoringDescriptions();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
      expect(result[0].label).toBe('Risk');
      expect(result[0].high).toBe('High Risk');
      expect(result[0].medium).toBe('Medium Risk');
      expect(result[0].low).toBe('Low Risk');
    });

    it('handles defaults when fields are missing', async () => {
      mockAxios.onGet('/api/GoNoGoDecisionOpportunity/GetScoringRDescription').reply(200, [{}]);
      const result = await goNoGoOpportunityApi.getScoringDescriptions();
      expect(result[0]).toEqual({
        id: 0,
        label: '',
        high: '',
        medium: '',
        low: ''
      });
    });

    it('returns empty array on error', async () => {
      mockAxios.onGet('/api/GoNoGoDecisionOpportunity/GetScoringRDescription').reply(500);
      const result = await goNoGoOpportunityApi.getScoringDescriptions();
      expect(result).toEqual([]);
    });
  });
});
