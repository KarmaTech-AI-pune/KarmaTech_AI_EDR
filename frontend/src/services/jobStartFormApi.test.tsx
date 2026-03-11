import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
vi.unmock('axios');

import { axiosInstance } from '../dummyapi/axiosConfig';
import MockAdapter from 'axios-mock-adapter';
import {
  submitJobStartForm,
  getJobStartFormByProjectId,
  getJobStartFormById,
  updateJobStartForm,
  getWBSResourceData,
  SimpleJobStartFormData,
} from './jobStartFormApi';

describe('jobStartFormApi', () => {
  let mockAxios: MockAdapter;

  const mockFormData: SimpleJobStartFormData = {
    projectId: 1,
    time: { totalTimeCost: 5000 },
    expenses: { totalExpenses: 2000 },
    grandTotal: 7000,
    projectFees: 8000,
    serviceTax: { percentage: 18, amount: 1440 } as any,
    totalProjectFees: 9440,
    profit: 2440,
    profitPercentage: 30,
    formTitle: 'Test JSF',
    description: 'Test form',
    startDate: '2023-01-01',
    preparedBy: 'John',
    selections: [],
    resources: [],
  };

  beforeEach(() => {
    mockAxios = new MockAdapter(axiosInstance);
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    mockAxios.restore();
    vi.restoreAllMocks();
  });

  describe('submitJobStartForm', () => {
    it('posts transformed payload to correct endpoint', async () => {
      mockAxios.onPost('/api/projects/1/jobstartforms').reply((config) => {
        const data = JSON.parse(config.data);
        expect(data.projectId).toBe(1);
        expect(data.totalTimeCost).toBe(5000);
        expect(data.totalExpenses).toBe(2000);
        expect(data.serviceTaxPercentage).toBe(18);
        expect(data.serviceTaxAmount).toBe(1440);
        expect(data.formTitle).toBe('Test JSF');
        return [200, { id: 1 }];
      });

      const result = await submitJobStartForm(1, mockFormData);
      expect(result.id).toBe(1);
    });

    it('uses defaults for optional fields', async () => {
      const minimalData: SimpleJobStartFormData = {
        projectId: 1,
        time: { totalTimeCost: 0 },
        expenses: { totalExpenses: 0 },
        grandTotal: 0,
        projectFees: 0,
        serviceTax: { percentage: 0, amount: 0 } as any,
        totalProjectFees: 0,
        profit: 0,
      };

      mockAxios.onPost('/api/projects/1/jobstartforms').reply((config) => {
        const data = JSON.parse(config.data);
        expect(data.formTitle).toBe('Job Start Form');
        expect(data.description).toBe('');
        expect(data.preparedBy).toBe('');
        expect(data.selections).toEqual([]);
        expect(data.resources).toEqual([]);
        return [200, { id: 2 }];
      });

      await submitJobStartForm(1, minimalData);
    });

    it('throws on error', async () => {
      mockAxios.onPost('/api/projects/1/jobstartforms').reply(500);
      await expect(submitJobStartForm(1, mockFormData)).rejects.toThrow();
    });
  });

  describe('getJobStartFormByProjectId', () => {
    it('returns forms array', async () => {
      mockAxios.onGet('/api/projects/1/jobstartforms').reply(200, [{ formId: 1 }]);
      const result = await getJobStartFormByProjectId(1);
      expect(result).toHaveLength(1);
    });

    it('throws on error', async () => {
      mockAxios.onGet('/api/projects/1/jobstartforms').reply(500);
      await expect(getJobStartFormByProjectId(1)).rejects.toThrow();
    });
  });

  describe('getJobStartFormById', () => {
    it('returns single form', async () => {
      mockAxios.onGet('/api/projects/1/jobstartforms/5').reply(200, { formId: 5 });
      const result = await getJobStartFormById(1, 5);
      expect(result.formId).toBe(5);
    });

    it('throws on error', async () => {
      mockAxios.onGet('/api/projects/1/jobstartforms/5').reply(500);
      await expect(getJobStartFormById(1, 5)).rejects.toThrow();
    });
  });

  describe('updateJobStartForm', () => {
    it('puts transformed payload with formId', async () => {
      mockAxios.onPut('/api/projects/1/jobstartforms/5').reply((config) => {
        const data = JSON.parse(config.data);
        expect(data.formId).toBe(5);
        expect(data.projectId).toBe(1);
        expect(data.totalTimeCost).toBe(5000);
        return [200, { formId: 5 }];
      });

      const result = await updateJobStartForm(1, 5, mockFormData);
      expect(result.formId).toBe(5);
    });

    it('throws on error', async () => {
      mockAxios.onPut('/api/projects/1/jobstartforms/5').reply(500);
      await expect(updateJobStartForm(1, 5, mockFormData)).rejects.toThrow();
    });
  });

  describe('getWBSResourceData', () => {
    it('returns WBS resource data', async () => {
      mockAxios.onGet('/api/projects/1/jobstartforms/wbsresources').reply(200, { resources: [] });
      const result = await getWBSResourceData(1);
      expect(result.resources).toEqual([]);
    });

    it('throws on error', async () => {
      mockAxios.onGet('/api/projects/1/jobstartforms/wbsresources').reply(500);
      await expect(getWBSResourceData(1)).rejects.toThrow();
    });
  });
});
