import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
vi.unmock('axios');

import { projectApi } from './projectApi';
import { axiosInstance } from './axiosConfig';
import MockAdapter from 'axios-mock-adapter';
import { ProjectFormData } from '../types';
import { Project } from '../models';

describe('projectApi', () => {
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

  describe('createProject', () => {
    it('formats data correctly and returns response', async () => {
      const mockFormData: ProjectFormData = {
        name: 'Test Project',
        projectNo: '123',
        estimatedProjectCost: 1000,
        estimatedProjectFee: 200,
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        projectManagerId: 'pm-1',
        clientName: 'Client X',
        status: 'Active',
        letterOfAcceptance: true,
        opportunityTrackingId: 5,
      } as any;

      mockAxios.onPost('api/Project').reply((config) => {
        const payload = JSON.parse(config.data);
        expect(payload.projectNo).toBe(123);
        expect(payload.estimatedProjectCost).toBe(1000);
        expect(payload.estimatedProjectFee).toBe(200);
        expect(payload.opportunityTrackingId).toBe(5);
        expect(payload.startDate).toContain('2023-01-01');
        return [200, { id: 1, ...payload }];
      });

      const result = await projectApi.createProject(mockFormData);
      expect(result.id).toBe(1);
    });

    it('handles missing optional fields', async () => {
      const mockFormData: ProjectFormData = {
        name: 'Test Project 2',
        projectNo: '456',
        estimatedProjectCost: 500,
      } as any;

      mockAxios.onPost('api/Project').reply((config) => {
        const payload = JSON.parse(config.data);
        expect(payload.estimatedProjectFee).toBe(0);
        expect(payload.startDate).toBeNull();
        expect(payload.endDate).toBeNull();
        expect(payload.opportunityTrackingId).toBe(0);
        expect(payload.programId).toBe(0);
        return [200, { id: 2 }];
      });

      await projectApi.createProject(mockFormData);
    });

    it('throws on error', async () => {
      mockAxios.onPost('api/Project').reply(500);
      await expect(projectApi.createProject({} as any)).rejects.toThrow();
    });
  });

  describe('getAll', () => {
    it('fetches projects by programId', async () => {
      mockAxios.onGet('api/Project?programId=10').reply(200, [{ id: 1, name: 'Proj 1' }]);
      const result = await projectApi.getAll(10);
      expect(result).toEqual([{ id: 1, name: 'Proj 1' }]);
    });

    it('throws on error', async () => {
      mockAxios.onGet('api/Project?programId=10').reply(500);
      await expect(projectApi.getAll(10)).rejects.toThrow();
    });
  });

  describe('getByUserId', () => {
    it('fetches projects by userId', async () => {
      mockAxios.onGet('api/Project/getByUserId/user-1').reply(200, [{ id: 2 }]);
      const result = await projectApi.getByUserId('user-1');
      expect(result).toEqual([{ id: 2 }]);
    });

    it('throws on error', async () => {
      mockAxios.onGet('api/Project/getByUserId/user-1').reply(500);
      await expect(projectApi.getByUserId('user-1')).rejects.toThrow();
    });
  });

  describe('getById', () => {
    it('fetches specific project', async () => {
      mockAxios.onGet('api/Project/5').reply(200, { id: 5, name: 'Proj 5' });
      const result = await projectApi.getById('5');
      expect(result).toEqual({ id: 5, name: 'Proj 5' });
    });

    it('throws on error', async () => {
      mockAxios.onGet('api/Project/5').reply(500);
      await expect(projectApi.getById('5')).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('formats data correctly for update', async () => {
      const mockProject: Project = {
        name: 'Updated Project',
        projectNo: '789',
        estimatedProjectCost: 2000,
        projectManagerId: 'pm-2',
        clientName: 'Client Y',
        status: 'Active',
      } as any;

      mockAxios.onPut('api/Project/5').reply((config) => {
        const payload = JSON.parse(config.data);
        expect(payload.id).toBe(5);
        expect(payload.projectNo).toBe(789);
        expect(payload.estimatedProjectCost).toBe(2000);
        expect(payload.office).toBe('');
        expect(payload.budgetReason).toBe('Cost change');
        expect(payload.progress).toBe(0);
        return [200, { success: true }];
      });

      const result = await projectApi.update('5', mockProject, 'Cost change');
      expect(result.success).toBe(true);
    });

    it('handles date fields', async () => {
      const mockProject: Project = {
        name: 'Date Test',
        projectNo: '000',
        estimatedProjectCost: 0,
        startDate: '2023-05-01T00:00:00.000Z',
        endDate: '2023-06-01T00:00:00.000Z'
      } as any;

      mockAxios.onPut('api/Project/6').reply((config) => {
        const payload = JSON.parse(config.data);
        expect(payload.startDate).toBe('2023-05-01T00:00:00.000Z');
        expect(payload.endDate).toBe('2023-06-01T00:00:00.000Z');
        return [200, { id: 6 }];
      });

      await projectApi.update('6', mockProject);
    });

    it('throws on error', async () => {
      mockAxios.onPut('api/Project/5').reply(500);
      await expect(projectApi.update('5', {} as any)).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('deletes specific project', async () => {
      mockAxios.onDelete('api/Project/5').reply(200, { success: true });
      const result = await projectApi.delete('5');
      expect(result).toEqual({ success: true });
    });

    it('throws on error', async () => {
      mockAxios.onDelete('api/Project/5').reply(500);
      await expect(projectApi.delete('5')).rejects.toThrow();
    });
  });

  describe('sendToReview', () => {
    it('sends project to review', async () => {
      const command = { projectId: 5, reviewerId: 'user-2' };
      mockAxios.onPost('api/PMWorkflow/sendtoreview').reply((config) => {
        expect(JSON.parse(config.data)).toEqual(command);
        return [200, { success: true }];
      });
      
      const result = await projectApi.sendToReview(command);
      expect(result).toEqual({ success: true });
    });

    it('throws on error', async () => {
      mockAxios.onPost('api/PMWorkflow/sendtoreview').reply(500);
      await expect(projectApi.sendToReview({})).rejects.toThrow();
    });
  });
});
