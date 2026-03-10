import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
vi.unmock('axios');

import { pmWorkflowApi } from './pmWorkflowApi';
import { axiosInstance } from '../services/axiosConfig';
import MockAdapter from 'axios-mock-adapter';

describe('pmWorkflowApi', () => {
  let mockAxios: MockAdapter;

  beforeEach(() => {
    mockAxios = new MockAdapter(axiosInstance);
  });

  afterEach(() => {
    mockAxios.restore();
    vi.restoreAllMocks();
  });

  it('sendToReview', async () => {
    mockAxios.onPost('/api/PMWorkflow/sendToReview').reply(200, { id: 1 });
    const result = await pmWorkflowApi.sendToReview({} as any);
    expect(result.id).toBe(1);
  });

  it('sendToApproval', async () => {
    mockAxios.onPost('/api/PMWorkflow/sendToApproval').reply(200, { id: 2 });
    const result = await pmWorkflowApi.sendToApproval({} as any);
    expect(result.id).toBe(2);
  });

  it('requestChanges', async () => {
    mockAxios.onPost('/api/PMWorkflow/requestChanges').reply(200, { id: 3 });
    const result = await pmWorkflowApi.requestChanges({} as any);
    expect(result.id).toBe(3);
  });

  it('approvedByRDOrRM', async () => {
    mockAxios.onPost('/api/PMWorkflow/approve').reply(200, { id: 4 });
    const result = await pmWorkflowApi.approvedByRDOrRM({} as any);
    expect(result.id).toBe(4);
  });

  it('rejectByRDOrRM', async () => {
    mockAxios.onPost('/api/PMWorkflow/requestChanges').reply(200, { id: 5 });
    const result = await pmWorkflowApi.rejectByRDOrRM({} as any);
    expect(result.id).toBe(5);
  });

  it('getWorkflowHistory', async () => {
    mockAxios.onGet('/api/PMWorkflow/history/project/1').reply(200, { history: [] });
    const result = await pmWorkflowApi.getWorkflowHistory('project', 1);
    expect(result.history).toEqual([]);
  });

  it('canViewEntity', async () => {
    mockAxios.onGet('/api/PMWorkflow/canView/project/1').reply(200, true);
    const result = await pmWorkflowApi.canViewEntity('project', 1);
    expect(result).toBe(true);
  });
});
