import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
vi.unmock('axios');

import { getBudgetHealth } from './budgetHealthApi';
import { axiosInstance } from '../services/axiosConfig';
import MockAdapter from 'axios-mock-adapter';

describe('budgetHealthApi', () => {
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

  it('returns budget health for numeric projectId', async () => {
    mockAxios.onGet('/api/Project/1/budget/health').reply(200, { status: 'healthy' });
    const result = await getBudgetHealth(1);
    expect(result.status).toBe('healthy');
  });

  it('converts string projectId to number', async () => {
    mockAxios.onGet('/api/Project/5/budget/health').reply(200, { status: 'at-risk' });
    const result = await getBudgetHealth('5');
    expect(result.status).toBe('at-risk');
  });

  it('throws on error', async () => {
    mockAxios.onGet('/api/Project/1/budget/health').reply(500);
    await expect(getBudgetHealth(1)).rejects.toThrow();
  });
});
