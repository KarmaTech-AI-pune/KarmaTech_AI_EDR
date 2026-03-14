import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
vi.unmock('axios');

import {
  createChangeControl,
  getChangeControlsByProjectId,
  getChangeControlById,
  updateChangeControl,
  deleteChangeControl,
} from './changeControlApi';
import { axiosInstance } from '../services/axiosConfig';
import MockAdapter from 'axios-mock-adapter';

describe('changeControlApi', () => {
  let mockAxios: MockAdapter;

  beforeEach(() => {
    mockAxios = new MockAdapter(axiosInstance);
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    mockAxios.restore();
    vi.restoreAllMocks();
  });

  describe('createChangeControl', () => {
    it('creates successfully', async () => {
      mockAxios.onPost('/api/projects/1/changecontrols').reply(200, { id: 1 });
      const result = await createChangeControl(1, {
        originator: 'John', description: 'Test', dateLogged: '2023-01-01',
      } as any);
      expect(result.id).toBe(1);
    });

    it('throws when originator is missing', async () => {
      await expect(createChangeControl(1, { description: 'Test', dateLogged: '2023-01-01' } as any))
        .rejects.toThrow('Originator is required');
    });

    it('throws when description is missing', async () => {
      await expect(createChangeControl(1, { originator: 'John', dateLogged: '2023-01-01' } as any))
        .rejects.toThrow('Description is required');
    });

    it('throws when dateLogged is missing', async () => {
      await expect(createChangeControl(1, { originator: 'John', description: 'Test' } as any))
        .rejects.toThrow('Date Logged is required');
    });
  });

  describe('getChangeControlsByProjectId', () => {
    it('returns change controls', async () => {
      mockAxios.onGet('/api/projects/1/changecontrols').reply(200, [{ id: 1 }]);
      const result = await getChangeControlsByProjectId(1);
      expect(result).toHaveLength(1);
    });

    it('converts string projectId', async () => {
      mockAxios.onGet('/api/projects/5/changecontrols').reply(200, []);
      const result = await getChangeControlsByProjectId('5');
      expect(result).toEqual([]);
    });
  });

  describe('getChangeControlById', () => {
    it('returns a change control', async () => {
      mockAxios.onGet('/api/projects/1/changecontrols/2').reply(200, { id: 2 });
      const result = await getChangeControlById(1, 2);
      expect(result.id).toBe(2);
    });
  });

  describe('updateChangeControl', () => {
    it('updates successfully', async () => {
      mockAxios.onPut('/api/projects/1/changecontrols/2').reply(200, { id: 2 });
      const result = await updateChangeControl(1, 2, {
        originator: 'John', description: 'Updated', dateLogged: '2023-01-02',
      } as any);
      expect(result.id).toBe(2);
    });

    it('throws when required fields missing', async () => {
      await expect(updateChangeControl(1, 2, {} as any)).rejects.toThrow('Originator is required');
    });
  });

  describe('deleteChangeControl', () => {
    it('deletes successfully', async () => {
      mockAxios.onDelete('/api/projects/1/changecontrols/2').reply(200);
      await deleteChangeControl(1, 2);
    });

    it('throws on error', async () => {
      mockAxios.onDelete('/api/projects/1/changecontrols/2').reply(500);
      await expect(deleteChangeControl(1, 2)).rejects.toThrow();
    });
  });
});
