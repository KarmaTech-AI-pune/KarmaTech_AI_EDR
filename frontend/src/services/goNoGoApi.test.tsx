import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
vi.unmock('axios');

import { goNoGoApi } from './goNoGoApi';
import { axiosInstance } from './axiosConfig';
import MockAdapter from 'axios-mock-adapter';
import { GoNoGoDecision } from '../models';

describe('goNoGoApi', () => {
  let mockAxios: MockAdapter;

  beforeEach(() => {
    mockAxios = new MockAdapter(axiosInstance);
    // Suppress console logs/errors in tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    mockAxios.restore();
    vi.restoreAllMocks();
  });

  describe('getAll', () => {
    it('returns all decisions successfully', async () => {
      mockAxios.onGet('GoNoGoDecision').reply(200, [{ id: 1, title: 'Decision 1' }]);
      const result = await goNoGoApi.getAll();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
    });

    it('throws error on failure', async () => {
      mockAxios.onGet('GoNoGoDecision').reply(500);
      await expect(goNoGoApi.getAll()).rejects.toThrow();
    });
  });

  describe('getById', () => {
    it('returns decision successfully', async () => {
      mockAxios.onGet('GoNoGoDecision/5').reply(200, { id: 5 });
      const result = await goNoGoApi.getById('5');
      expect(result.id).toBe(5);
    });

    it('throws error on failure', async () => {
      mockAxios.onGet('GoNoGoDecision/5').reply(500);
      await expect(goNoGoApi.getById('5')).rejects.toThrow();
    });
  });

  describe('getByProjectId', () => {
    it('returns decision successfully', async () => {
      mockAxios.onGet('GoNoGoDecision/project/10').reply(200, { id: 8, projectId: 10 });
      const result = await goNoGoApi.getByProjectId('10');
      expect(result?.id).toBe(8);
    });

    it('returns null on 404', async () => {
      mockAxios.onGet('GoNoGoDecision/project/10').reply(404);
      const result = await goNoGoApi.getByProjectId('10');
      expect(result).toBeNull();
    });

    it('throws error on other failures', async () => {
      mockAxios.onGet('GoNoGoDecision/project/10').reply(500);
      await expect(goNoGoApi.getByProjectId('10')).rejects.toThrow();
    });
  });

  describe('create', () => {
    it('creates decision successfully', async () => {
      const mockData: GoNoGoDecision = { id: 1 } as any;
      mockAxios.onPost('GoNoGoDecision').reply((config) => {
        expect(JSON.parse(config.data)).toEqual({ id: 1 });
        return [200, { id: 1, success: true }];
      });
      const result = await goNoGoApi.create('10', mockData);
      expect((result as any).success).toBe(true);
    });

    it('throws combined string on 400 validation error', async () => {
      mockAxios.onPost('GoNoGoDecision').reply(400, { errors: ['Error 1', 'Error 2'] });
      await expect(goNoGoApi.create('10', {} as any)).rejects.toThrow('Error 1, Error 2');
    });

    it('throws error on other failures', async () => {
      mockAxios.onPost('GoNoGoDecision').reply(500);
      await expect(goNoGoApi.create('10', {} as any)).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('updates decision successfully', async () => {
      const mockData: GoNoGoDecision = { id: 5, status: 'Approved' } as any;
      mockAxios.onPut('GoNoGoDecision/5').reply((config) => {
        expect(JSON.parse(config.data)).toEqual({ id: 5, status: 'Approved' });
        return [200, { id: 5, success: true }];
      });
      const result = await goNoGoApi.update('5', mockData);
      expect((result as any).success).toBe(true);
    });

    it('throws combined string on 400 validation error', async () => {
      mockAxios.onPut('GoNoGoDecision/5').reply(400, { errors: ['Update Error'] });
      await expect(goNoGoApi.update('5', {} as any)).rejects.toThrow('Update Error');
    });

    it('throws error on other failures', async () => {
      mockAxios.onPut('GoNoGoDecision/5').reply(500);
      await expect(goNoGoApi.update('5', {} as any)).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('deletes successfully', async () => {
      mockAxios.onDelete('GoNoGoDecision/5').reply(200);
      await goNoGoApi.delete('5');
    });

    it('throws error on failure', async () => {
      mockAxios.onDelete('GoNoGoDecision/5').reply(500);
      await expect(goNoGoApi.delete('5')).rejects.toThrow();
    });
  });
});
