import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
vi.unmock('axios');

import { wbsWorkflowApi } from './wbsWorkflowApi';
import { axiosInstance } from './axiosConfig';
import MockAdapter from 'axios-mock-adapter';
import { PMWorkflowHistory } from '../models/pmWorkflowModel';

describe('wbsWorkflowApi', () => {
  let mockAxios: MockAdapter;

  beforeEach(() => {
    mockAxios = new MockAdapter(axiosInstance);
  });

  afterEach(() => {
    mockAxios.restore();
    vi.restoreAllMocks();
  });

  const mockResponse: PMWorkflowHistory = { id: 1, action: 'test' } as any;

  describe('sendToReview', () => {
    it('sends data correctly and returns response', async () => {
      const payload = { entityId: 1, entityType: 'WBS', assignedToId: 'user-1', action: 'send' };
      mockAxios.onPost('/api/PMWorkflow/sendToReview').reply((config) => {
        expect(JSON.parse(config.data)).toEqual(payload);
        return [200, mockResponse];
      });

      const result = await wbsWorkflowApi.sendToReview(payload);
      expect(result).toEqual(mockResponse);
    });

    it('throws on error', async () => {
      mockAxios.onPost('/api/PMWorkflow/sendToReview').reply(500);
      await expect(wbsWorkflowApi.sendToReview({} as any)).rejects.toThrow();
    });
  });

  describe('sendToApproval', () => {
    it('sends data correctly and returns response', async () => {
      const payload = { entityId: 1, entityType: 'WBS', assignedToId: 'user-1', action: 'send' };
      mockAxios.onPost('/api/PMWorkflow/sendToApproval').reply((config) => {
        expect(JSON.parse(config.data)).toEqual(payload);
        return [200, mockResponse];
      });

      const result = await wbsWorkflowApi.sendToApproval(payload);
      expect(result).toEqual(mockResponse);
    });

    it('throws on error', async () => {
      mockAxios.onPost('/api/PMWorkflow/sendToApproval').reply(500);
      await expect(wbsWorkflowApi.sendToApproval({} as any)).rejects.toThrow();
    });
  });

  describe('requestChanges', () => {
    it('sends data correctly and returns response', async () => {
      const payload = { entityId: 1, entityType: 'WBS', assignedToId: 'user-1', comments: 'Needs work', action: 'request' };
      mockAxios.onPost('/api/PMWorkflow/requestChanges').reply((config) => {
        expect(JSON.parse(config.data)).toEqual(payload);
        return [200, mockResponse];
      });

      const result = await wbsWorkflowApi.requestChanges(payload);
      expect(result).toEqual(mockResponse);
    });

    it('throws on error', async () => {
      mockAxios.onPost('/api/PMWorkflow/requestChanges').reply(500);
      await expect(wbsWorkflowApi.requestChanges({} as any)).rejects.toThrow();
    });
  });

  describe('approve', () => {
    it('sends data correctly and returns response', async () => {
      const payload = { entityId: 1, entityType: 'WBS', action: 'approve' };
      mockAxios.onPost('/api/PMWorkflow/approve').reply((config) => {
        expect(JSON.parse(config.data)).toEqual(payload);
        return [200, mockResponse];
      });

      const result = await wbsWorkflowApi.approve(payload);
      expect(result).toEqual(mockResponse);
    });

    it('throws on error', async () => {
      mockAxios.onPost('/api/PMWorkflow/approve').reply(500);
      await expect(wbsWorkflowApi.approve({} as any)).rejects.toThrow();
    });
  });

  describe('getWorkflowHistory', () => {
    it('fetches history successfully', async () => {
      mockAxios.onGet('/api/PMWorkflow/history/Project/5').reply(200, [mockResponse]);
      const result = await wbsWorkflowApi.getWorkflowHistory('Project', 5);
      expect(result).toEqual([mockResponse]);
    });

    it('throws on error', async () => {
      mockAxios.onGet('/api/PMWorkflow/history/Project/5').reply(500);
      await expect(wbsWorkflowApi.getWorkflowHistory('Project', 5)).rejects.toThrow();
    });
  });

  describe('canView', () => {
    it('returns boolean successfully', async () => {
      mockAxios.onGet('/api/PMWorkflow/canView/Project/5').reply(200, true);
      const result = await wbsWorkflowApi.canView('Project', 5);
      expect(result).toBe(true);
    });

    it('throws on error', async () => {
      mockAxios.onGet('/api/PMWorkflow/canView/Project/5').reply(500);
      await expect(wbsWorkflowApi.canView('Project', 5)).rejects.toThrow();
    });
  });
});
