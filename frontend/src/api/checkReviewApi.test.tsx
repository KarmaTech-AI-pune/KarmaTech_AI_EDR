import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
vi.unmock('axios');

import {
  createCheckReview,
  getCheckReviewsByProject,
  getCheckReview,
  updateCheckReview,
  deleteCheckReview,
} from './checkReviewApi';
import { axiosInstance } from '../services/axiosConfig';
import MockAdapter from 'axios-mock-adapter';

describe('checkReviewApi', () => {
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

  it('createCheckReview posts formatted data', async () => {
    mockAxios.onPost('/api/checkreview').reply(200, { id: 1 });
    const result = await createCheckReview({ projectId: '5' } as any);
    expect(result.id).toBe(1);
  });

  it('getCheckReviewsByProject returns reviews', async () => {
    mockAxios.onGet('/api/checkreview/project/5').reply(200, [{ id: 1 }]);
    const result = await getCheckReviewsByProject('5');
    expect(result).toHaveLength(1);
  });

  it('getCheckReview returns single review', async () => {
    mockAxios.onGet('/api/checkreview/1').reply(200, { id: 1 });
    const result = await getCheckReview('1');
    expect(result.id).toBe(1);
  });

  it('updateCheckReview puts data', async () => {
    mockAxios.onPut('/api/checkreview/1').reply(200, { id: 1 });
    const result = await updateCheckReview('1', { projectId: '5' } as any);
    expect(result.id).toBe(1);
  });

  it('deleteCheckReview succeeds', async () => {
    mockAxios.onDelete('/api/checkreview/1').reply(200);
    const result = await deleteCheckReview('1');
    expect(result).toBe(true);
  });

  it('deleteCheckReview throws on empty id', async () => {
    await expect(deleteCheckReview('')).rejects.toThrow('ID is required');
  });

  it('deleteCheckReview throws on NaN id', async () => {
    // For non-parsable IDs, it tries to find by activityNo then throws
    mockAxios.onGet('/api/checkreview/by-activity-no/abc').reply(404);
    await expect(deleteCheckReview('abc')).rejects.toThrow('Invalid ID format');
  });
});
