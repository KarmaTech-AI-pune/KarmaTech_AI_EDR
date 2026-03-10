import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
vi.unmock('axios');

import { jobStartFormHeaderApi } from './jobStartFormHeaderApi';
import { axiosInstance } from './axiosConfig';
import MockAdapter from 'axios-mock-adapter';

describe('jobStartFormHeaderApi', () => {
  let mockAxios: MockAdapter;

  beforeEach(() => {
    mockAxios = new MockAdapter(axiosInstance);
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    mockAxios.restore();
    vi.restoreAllMocks();
  });

  describe('getJobStartFormHeader', () => {
    it('returns header successfully', async () => {
      mockAxios.onGet('/api/projects/1/jobstartforms/header/2').reply(200, { id: 2, formId: 2, projectId: 1 });
      const result = await jobStartFormHeaderApi.getJobStartFormHeader(1, 2);
      expect(result.id).toBe(2);
    });

    it('throws custom error on failure', async () => {
      mockAxios.onGet('/api/projects/1/jobstartforms/header/2').reply(500);
      await expect(jobStartFormHeaderApi.getJobStartFormHeader(1, 2)).rejects.toThrow('Failed to load JobStartForm header');
    });
  });

  describe('getJobStartFormHeaderStatus', () => {
    it('returns status successfully', async () => {
      mockAxios.onGet('/api/projects/1/jobstartforms/header/2/status').reply(200, { id: 1, statusId: 2, status: 'Approved' });
      const result = await jobStartFormHeaderApi.getJobStartFormHeaderStatus(1, 2);
      expect(result.status).toBe('Approved');
    });

    it('throws custom error on failure', async () => {
      mockAxios.onGet('/api/projects/1/jobstartforms/header/2/status').reply(500);
      await expect(jobStartFormHeaderApi.getJobStartFormHeaderStatus(1, 2)).rejects.toThrow('Failed to load JobStartForm header status');
    });
  });

  describe('getJobStartFormHeaderHistory', () => {
    it('returns history successfully', async () => {
      mockAxios.onGet('/api/projects/1/jobstartforms/header/2/history').reply(200, [{ id: 1, action: 'Submit' }]);
      const result = await jobStartFormHeaderApi.getJobStartFormHeaderHistory(1, 2);
      expect(result).toHaveLength(1);
    });

    it('throws custom error on failure', async () => {
      mockAxios.onGet('/api/projects/1/jobstartforms/header/2/history').reply(500);
      await expect(jobStartFormHeaderApi.getJobStartFormHeaderHistory(1, 2)).rejects.toThrow('Failed to load JobStartForm header history');
    });
  });
});
