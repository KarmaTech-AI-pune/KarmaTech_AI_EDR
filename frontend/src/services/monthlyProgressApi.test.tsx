import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
vi.unmock('axios');

import { MonthlyProgressAPI } from './monthlyProgressApi';
import { axiosInstance } from './axiosConfig';
import MockAdapter from 'axios-mock-adapter';

describe('MonthlyProgressAPI', () => {
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

  describe('getMonthlyReports', () => {
    it('returns reports successfully', async () => {
      mockAxios.onGet('/api/projects/1/monthlyprogress').reply(200, [{ id: 1 }]);
      const result = await MonthlyProgressAPI.getMonthlyReports('1');
      expect(result).toEqual([{ id: 1 }]);
    });

    it('throws custom error on failure', async () => {
      mockAxios.onGet('/api/projects/1/monthlyprogress').reply(500);
      await expect(MonthlyProgressAPI.getMonthlyReports('1')).rejects.toThrow('Failed to load monthly reports');
    });
  });

  describe('getMonthlyReportByYearMonth', () => {
    it('returns report successfully', async () => {
      mockAxios.onGet('/api/projects/1/monthlyprogress/year/2023/month/5').reply(200, { id: 1, month: 'May' });
      const result = await MonthlyProgressAPI.getMonthlyReportByYearMonth('1', 2023, 5);
      expect(result.month).toBe('May');
    });

    it('throws custom error on failure', async () => {
      mockAxios.onGet('/api/projects/1/monthlyprogress/year/2023/month/5').reply(500);
      await expect(MonthlyProgressAPI.getMonthlyReportByYearMonth('1', 2023, 5)).rejects.toThrow('Failed to load monthly report');
    });
  });

  describe('getManpowerResources', () => {
    it('returns manpower resources', async () => {
      mockAxios.onGet('/api/projects/1/WBS/manpowerresources').reply(200, { projectId: 1, resources: [] });
      const result = await MonthlyProgressAPI.getManpowerResources('1');
      expect(result.projectId).toBe(1);
    });

    it('throws custom error on failure', async () => {
      mockAxios.onGet('/api/projects/1/WBS/manpowerresources').reply(500);
      await expect(MonthlyProgressAPI.getManpowerResources('1')).rejects.toThrow('Failed to load manpower resources');
    });
  });

  describe('submitMonthlyProgress', () => {
    it('updates existing monthly progress via PUT', async () => {
      mockAxios.onPut('/api/projects/1/monthlyprogress/year/2023/month/5').reply(200, { success: true });
      const result = await MonthlyProgressAPI.submitMonthlyProgress('1', { year: 2023, month: 5, data: 'test' });
      expect(result.success).toBe(true);
    });

    it('falls back to POST on 404 PUT (first save)', async () => {
      mockAxios.onPut('/api/projects/1/monthlyprogress/year/2023/month/5').reply(404);
      mockAxios.onPost('/api/projects/1/monthlyprogress').reply(200, { created: true });
      const result = await MonthlyProgressAPI.submitMonthlyProgress('1', { year: 2023, month: 5, data: 'test' });
      expect(result.created).toBe(true);
    });

    it('throws error when POST fallback also fails', async () => {
      mockAxios.onPut('/api/projects/1/monthlyprogress/year/2023/month/5').reply(404);
      mockAxios.onPost('/api/projects/1/monthlyprogress').reply(500);
      await expect(MonthlyProgressAPI.submitMonthlyProgress('1', { year: 2023, month: 5 })).rejects.toThrow('Failed to create monthly progress');
    });

    it('throws custom error on non-404 failure', async () => {
      mockAxios.onPut('/api/projects/1/monthlyprogress/year/2023/month/5').reply(500);
      await expect(MonthlyProgressAPI.submitMonthlyProgress('1', { year: 2023, month: 5 })).rejects.toThrow('Failed to submit monthly progress');
    });
  });

  describe('updateMonthlyProgress', () => {
    it('updates successfully', async () => {
      mockAxios.onPut('/api/projects/1/monthlyprogress/year/2023/month/5').reply(200, { updated: true });
      const result = await MonthlyProgressAPI.updateMonthlyProgress('1', 2023, 5, { data: 'test' });
      expect(result.updated).toBe(true);
    });

    it('throws custom error on failure', async () => {
      mockAxios.onPut('/api/projects/1/monthlyprogress/year/2023/month/5').reply(500);
      await expect(MonthlyProgressAPI.updateMonthlyProgress('1', 2023, 5, {})).rejects.toThrow('Failed to update monthly progress');
    });
  });

  describe('deleteMonthlyProgress', () => {
    it('deletes successfully', async () => {
      mockAxios.onDelete('/api/projects/1/monthlyprogress/year/2023/month/5').reply(200, { deleted: true });
      const result = await MonthlyProgressAPI.deleteMonthlyProgress('1', 2023, 5);
      expect(result.deleted).toBe(true);
    });

    it('throws custom error on failure', async () => {
      mockAxios.onDelete('/api/projects/1/monthlyprogress/year/2023/month/5').reply(500);
      await expect(MonthlyProgressAPI.deleteMonthlyProgress('1', 2023, 5)).rejects.toThrow('Failed to delete monthly progress');
    });
  });
});
