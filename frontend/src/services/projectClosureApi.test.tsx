import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
vi.unmock('axios');

import {
  createProjectClosure,
  getAllProjectClosures,
  getProjectClosureById,
  getProjectClosureByProjectId,
  getAllProjectClosuresByProjectId,
  updateProjectClosure,
  deleteProjectClosure,
} from './projectClosureApi';
import { axiosInstance } from './axiosConfig';
import MockAdapter from 'axios-mock-adapter';

describe('projectClosureApi', () => {
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

  describe('createProjectClosure', () => {
    it('creates closure and returns data', async () => {
      mockAxios.onPost('api/ProjectClosure').reply(200, { id: 1 });
      mockAxios.onGet('api/ProjectClosure/1').reply(200, { id: 1, projectId: 5 });
      const result = await createProjectClosure({ projectId: 5 } as any);
      expect(result.id).toBe(1);
    });

    it('throws on invalid projectId (string NaN)', async () => {
      await expect(createProjectClosure({ projectId: 'abc' } as any)).rejects.toThrow('Invalid project ID');
    });

    it('throws on negative projectId', async () => {
      await expect(createProjectClosure({ projectId: -1 } as any)).rejects.toThrow('Invalid project ID');
    });

    it('throws on undefined projectId', async () => {
      await expect(createProjectClosure({} as any)).rejects.toThrow('Invalid project ID');
    });
  });

  describe('getAllProjectClosures', () => {
    it('returns formatted array', async () => {
      mockAxios.onGet('api/ProjectClosure').reply(200, [{ id: 1, createdAt: '2023-01-01' }]);
      const result = await getAllProjectClosures();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
    });

    it('wraps single object in array', async () => {
      mockAxios.onGet('api/ProjectClosure').reply(200, { id: 1 });
      const result = await getAllProjectClosures();
      expect(result).toHaveLength(1);
    });

    it('returns empty array for null data', async () => {
      mockAxios.onGet('api/ProjectClosure').reply(200, null);
      const result = await getAllProjectClosures();
      expect(result).toEqual([]);
    });

    it('throws on error', async () => {
      mockAxios.onGet('api/ProjectClosure').reply(500);
      await expect(getAllProjectClosures()).rejects.toThrow();
    });
  });

  describe('getProjectClosureById', () => {
    it('returns closure', async () => {
      mockAxios.onGet('api/ProjectClosure/1').reply(200, { id: 1 });
      const result = await getProjectClosureById(1);
      expect(result.id).toBe(1);
    });

    it('throws on error', async () => {
      mockAxios.onGet('api/ProjectClosure/1').reply(500);
      await expect(getProjectClosureById(1)).rejects.toThrow();
    });
  });

  describe('getProjectClosureByProjectId', () => {
    it('returns closure for project', async () => {
      mockAxios.onGet('api/ProjectClosure/project/5').reply(200, { id: 1, projectId: 5 });
      const result = await getProjectClosureByProjectId(5);
      expect(result.projectId).toBe(5);
    });

    it('throws on error', async () => {
      mockAxios.onGet('api/ProjectClosure/project/5').reply(500);
      await expect(getProjectClosureByProjectId(5)).rejects.toThrow();
    });
  });

  describe('getAllProjectClosuresByProjectId', () => {
    it('returns closures for project', async () => {
      mockAxios.onGet('api/ProjectClosure/project/5/all').reply(200, [{ id: 1 }]);
      const result = await getAllProjectClosuresByProjectId(5);
      expect(result).toHaveLength(1);
    });

    it('throws on error', async () => {
      mockAxios.onGet('api/ProjectClosure/project/5/all').reply(500);
      await expect(getAllProjectClosuresByProjectId(5)).rejects.toThrow();
    });
  });

  describe('updateProjectClosure', () => {
    it('updates successfully', async () => {
      mockAxios.onPut('api/ProjectClosure/1').reply(200, {});
      await updateProjectClosure(1, { id: 1, projectId: 5, createdAt: '', createdBy: '' } as any);
    });

    it('throws on invalid ID', async () => {
      await expect(updateProjectClosure(0, { projectId: 5 } as any)).rejects.toThrow('Invalid project closure ID');
    });

    it('throws on negative projectId', async () => {
      await expect(updateProjectClosure(1, { id: 1, projectId: -1, createdAt: '', createdBy: '' } as any)).rejects.toThrow('Invalid project ID');
    });
  });

  describe('deleteProjectClosure', () => {
    it('deletes successfully', async () => {
      mockAxios.onDelete('api/ProjectClosure/1').reply(200);
      await deleteProjectClosure(1);
    });

    it('throws on invalid ID', async () => {
      await expect(deleteProjectClosure(-1)).rejects.toThrow('Invalid project closure ID');
    });

    it('throws on error after retries', async () => {
      mockAxios.onDelete('api/ProjectClosure/1').reply(500);
      await expect(deleteProjectClosure(1)).rejects.toThrow();
    });
  });
});
