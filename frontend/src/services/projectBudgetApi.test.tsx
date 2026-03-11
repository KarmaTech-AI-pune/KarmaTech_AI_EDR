import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
vi.unmock('axios');

import { projectBudgetApi } from './projectBudgetApi';
import { axiosInstance } from './axiosConfig';
import MockAdapter from 'axios-mock-adapter';

describe('projectBudgetApi', () => {
  let mockAxios: MockAdapter;

  beforeEach(() => {
    mockAxios = new MockAdapter(axiosInstance);
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    mockAxios.restore();
    vi.restoreAllMocks();
  });

  describe('updateBudget', () => {
    it('updates budget successfully', async () => {
      mockAxios.onPut('/api/projects/1/budget').reply(200, { success: true });
      const result = await projectBudgetApi.updateBudget(1, { reason: 'test' } as any);
      expect(result.success).toBe(true);
    });

    it('throws validation error on 400', async () => {
      mockAxios.onPut('/api/projects/1/budget').reply(400, { message: 'Bad data' });
      await expect(projectBudgetApi.updateBudget(1, {} as any)).rejects.toThrow('Bad data');
    });

    it('throws not found on 404', async () => {
      mockAxios.onPut('/api/projects/1/budget').reply(404);
      await expect(projectBudgetApi.updateBudget(1, {} as any)).rejects.toThrow('Project 1 not found');
    });

    it('throws unauthorized on 401', async () => {
      mockAxios.onPut('/api/projects/1/budget').reply(401);
      await expect(projectBudgetApi.updateBudget(1, {} as any)).rejects.toThrow('Unauthorized');
    });

    it('throws forbidden on 403', async () => {
      mockAxios.onPut('/api/projects/1/budget').reply(403);
      await expect(projectBudgetApi.updateBudget(1, {} as any)).rejects.toThrow('permission');
    });

    it('throws generic error on 500', async () => {
      mockAxios.onPut('/api/projects/1/budget').reply(500);
      await expect(projectBudgetApi.updateBudget(1, {} as any)).rejects.toThrow('Failed to update');
    });
  });

  describe('getBudgetHistory', () => {
    it('returns history from wrapped response', async () => {
      mockAxios.onGet(/\/api\/projects\/1\/budget\/history/).reply(200, {
        success: true,
        data: { history: [{ id: 1 }] }
      });
      const result = await projectBudgetApi.getBudgetHistory({ projectId: 1 });
      expect(result).toEqual([{ id: 1 }]);
    });

    it('returns array from direct response', async () => {
      mockAxios.onGet(/\/api\/projects\/1\/budget\/history/).reply(200, [{ id: 1 }]);
      const result = await projectBudgetApi.getBudgetHistory({ projectId: 1 });
      expect(result).toEqual([{ id: 1 }]);
    });

    it('returns empty array for unexpected format', async () => {
      mockAxios.onGet(/\/api\/projects\/1\/budget\/history/).reply(200, { foo: 'bar' });
      const result = await projectBudgetApi.getBudgetHistory({ projectId: 1 });
      expect(result).toEqual([]);
    });

    it('builds query correctly with params', async () => {
      mockAxios.onGet(/\/api\/projects\/1\/budget\/history/).reply((config) => {
        expect(config.url).toContain('fieldName=EstimatedProjectCost');
        return [200, []];
      });
      await projectBudgetApi.getBudgetHistory({ projectId: 1, fieldName: 'EstimatedProjectCost' });
    });

    it('throws not found on 404', async () => {
      mockAxios.onGet(/\/api\/projects\/1\/budget\/history/).reply(404);
      await expect(projectBudgetApi.getBudgetHistory({ projectId: 1 })).rejects.toThrow('not found');
    });
  });

  describe('getBudgetVarianceSummary', () => {
    it('returns summary from wrapped response', async () => {
      mockAxios.onGet('/api/projects/1/budget/variance-summary').reply(200, {
        success: true,
        data: { totalFeeChanges: 5 }
      });
      const result = await projectBudgetApi.getBudgetVarianceSummary(1);
      expect(result.totalFeeChanges).toBe(5);
    });

    it('throws on failure', async () => {
      mockAxios.onGet('/api/projects/1/budget/variance-summary').reply(500);
      await expect(projectBudgetApi.getBudgetVarianceSummary(1)).rejects.toThrow();
    });
  });

  describe('getLatestBudgetChange', () => {
    it('returns latest change', async () => {
      mockAxios.onGet(/\/api\/projects\/1\/budget\/history/).reply(200, [{ id: 1 }]);
      const result = await projectBudgetApi.getLatestBudgetChange(1);
      expect(result).toEqual({ id: 1 });
    });

    it('returns null when no history', async () => {
      mockAxios.onGet(/\/api\/projects\/1\/budget\/history/).reply(200, []);
      const result = await projectBudgetApi.getLatestBudgetChange(1);
      expect(result).toBeNull();
    });
  });

  describe('getBudgetChangesByField', () => {
    it('returns filtered changes', async () => {
      mockAxios.onGet(/\/api\/projects\/1\/budget\/history/).reply(200, [{ id: 1 }]);
      const result = await projectBudgetApi.getBudgetChangesByField(1, 'EstimatedProjectCost');
      expect(result).toEqual([{ id: 1 }]);
    });
  });
});
