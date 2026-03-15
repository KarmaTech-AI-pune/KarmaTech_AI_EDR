import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
vi.unmock('axios');

import { opportunityApi } from './opportunityApi';
import { axiosInstance } from './axiosConfig';
import MockAdapter from 'axios-mock-adapter';

describe('opportunityApi', () => {
  let mockAxios: MockAdapter;

  beforeEach(() => {
    mockAxios = new MockAdapter(axiosInstance);
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    mockAxios.restore();
    vi.restoreAllMocks();
  });

  describe('convertStringToNumberId', () => {
    it('converts string to number', () => {
      expect(opportunityApi.convertStringToNumberId('123')).toBe(123);
    });

    it('returns number if already a number', () => {
      expect(opportunityApi.convertStringToNumberId(456)).toBe(456);
    });
  });

  describe('create', () => {
    it('throws if bidManagerId is missing', async () => {
      await expect(opportunityApi.create({})).rejects.toThrow('Bid Manager ID is required');
    });

    it('formats data and calls create endpoint', async () => {
      const mockData = {
        bidManagerId: 'user-1',
        stage: 'A', // Should map to 1
        status: 'Bid Submitted', // Should map to 1
        likelyStartDate: new Date('2023-01-01T00:00:00.000Z'),
      } as any;

      mockAxios.onPost('api/OpportunityTracking').reply((config) => {
        const data = JSON.parse(config.data);
        expect(data.bidManagerId).toBe('user-1');
        expect(data.stage).toBe(1);
        expect(data.status).toBe(1);
        expect(data.likelyStartDate).toBe('2023-01-01');
        return [200, { id: 1, bidManagerId: 'user-1', stage: 1, status: 1 }];
      });

      const result = await opportunityApi.create(mockData);
      expect(result.id).toBe(1);
      expect(result.bidManagerId).toBe('user-1');
      expect(result.stage).toBe('A');
      expect(result.status).toBe('Bid Submitted');
    });

    it('throws error on failure', async () => {
      mockAxios.onPost('api/OpportunityTracking').reply(500);
      await expect(opportunityApi.create({ bidManagerId: 'user-1' } as any)).rejects.toThrow();
    });
  });

  describe('Workflow commands', () => {
    const mockResponse = { id: 1, stage: 2, status: 0 };
    
    it('sendToApproval', async () => {
      mockAxios.onPost('api/OpportunityTracking/SendToApproval').reply(200, mockResponse);
      const res = await opportunityApi.sendToApproval({
        opportunityId: 1,
        approvalManagerId: 'am',
        action: 'approve'
      });
      expect(res.id).toBe(1);
      expect(res.stage).toBe('B');
      expect(res.status).toBe('Bid Under Preparation');
    });

    it('RejectByRegionManagerSentToBidManager', async () => {
      mockAxios.onPost('api/OpportunityTracking/Reject').reply(200, mockResponse);
      const res = await opportunityApi.RejectByRegionManagerSentToBidManager({
        opportunityId: 1,
        approvalManagerId: '2',
        action: 'reject'
      });
      expect(res.id).toBe(1);
    });

    it('sendToReview', async () => {
      mockAxios.onPost('api/OpportunityTracking/SendToReview').reply(200, mockResponse);
      const res = await opportunityApi.sendToReview({
        opportunityId: 1,
        reviewManagerId: '2'
      });
      expect(res.id).toBe(1);
    });

    it('sendToApprove', async () => {
      mockAxios.onPost('api/OpportunityTracking/SendToApprove').reply(200, mockResponse);
      const res = await opportunityApi.sendToApprove({
        opportunityId: 1,
        approvalRegionalDirectorId: 'rd-1',
        action: 'approve'
      });
      expect(res.id).toBe(1);
    });

    it('rejectOpportunityByRegionalDirector', async () => {
      mockAxios.onPost('api/OpportunityTracking/SendToApprove').reply(200, mockResponse);
      const res = await opportunityApi.rejectOpportunityByRegionalDirector({
        opportunityId: 1,
        approvalRegionalDirectorId: 'rd-1',
        action: 'reject'
      });
      expect(res.id).toBe(1);
    });
    
    it('workflow commands throw on error', async () => {
      mockAxios.onPost('api/OpportunityTracking/SendToApproval').reply(500);
      await expect(opportunityApi.sendToApproval({ opportunityId: 1, approvalManagerId: 'am', action: '' })).rejects.toThrow();
    });
  });

  describe('Getters', () => {
    const mockArrayResponse = [{ id: 1, stage: 1, status: 1 }];

    it('getByUserId', async () => {
      mockAxios.onGet('api/OpportunityTracking/bid-manager/user-1').reply(200, mockArrayResponse);
      const res = await opportunityApi.getByUserId('user-1');
      expect(res[0].id).toBe(1);
      expect(res[0].stage).toBe('A');
    });

    it('getByReviewManagerId', async () => {
      mockAxios.onGet('api/OpportunityTracking/regional-manager/rm-1').reply(200, mockArrayResponse);
      const res = await opportunityApi.getByReviewManagerId('rm-1');
      expect(res[0].id).toBe(1);
    });

    it('getByApprovalManagerId', async () => {
      mockAxios.onGet('api/OpportunityTracking/regional-director/rd-1').reply(200, mockArrayResponse);
      const res = await opportunityApi.getByApprovalManagerId('rd-1');
      expect(res[0].id).toBe(1);
    });

    it('getAll', async () => {
      mockAxios.onGet('api/OpportunityTracking').reply(200, mockArrayResponse);
      const res = await opportunityApi.getAll();
      expect(res.length).toBe(1);
      expect(res[0].id).toBe(1);
    });

    it('getById', async () => {
      mockAxios.onGet('api/OpportunityTracking/5').reply(200, { id: 5, stage: 3, status: 2 });
      const res = await opportunityApi.getById(5);
      expect(res.id).toBe(5);
      expect(res.stage).toBe('C');
      expect(res.status).toBe('Bid Rejected');
    });

    it('getOpportunityByStatus', async () => {
      mockAxios.onGet('api/OpportunityTracking?status=1').reply(200, mockArrayResponse);
      const res = await opportunityApi.getOpportunityByStatus(1);
      expect(res[0].id).toBe(1);
    });
    
    it('getters throw on error', async () => {
      mockAxios.onGet('api/OpportunityTracking').reply(500);
      await expect(opportunityApi.getAll()).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('deletes successfully', async () => {
      mockAxios.onDelete('/OpportunityTracking/5').reply(200);
      await opportunityApi.delete(5);
    });

    it('throws on error', async () => {
      mockAxios.onDelete('/OpportunityTracking/5').reply(500);
      await expect(opportunityApi.delete(5)).rejects.toThrow();
    });
  });
});
