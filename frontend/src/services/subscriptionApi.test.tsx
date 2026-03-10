import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
vi.unmock('axios');

import {
  getSubscriptionPlans,
  getAllFeatures,
  getSubscriptionPlanById,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
  createTenantSubscription,
  cancelTenantSubscription,
  updateTenantSubscription,
  addFeatureToPlan,
  removeFeatureFromPlan,
  getSubscriptionStats,
  getUserSubscriptionDetails,
} from './subscriptionApi';
import { axiosInstance } from './axiosConfig';
import MockAdapter from 'axios-mock-adapter';

describe('subscriptionApi', () => {
  let mockAxios: MockAdapter;

  beforeEach(() => {
    mockAxios = new MockAdapter(axiosInstance);
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    mockAxios.restore();
    vi.restoreAllMocks();
  });

  it('getSubscriptionPlans returns plans from wrapped response', async () => {
    mockAxios.onGet('api/subscriptions/plans?includeFeatures=true').reply(200, { plans: [{ id: 1 }] });
    const result = await getSubscriptionPlans();
    expect(result).toEqual([{ id: 1 }]);
  });

  it('getSubscriptionPlans returns plans from direct response', async () => {
    mockAxios.onGet('api/subscriptions/plans?includeFeatures=true').reply(200, [{ id: 1 }]);
    const result = await getSubscriptionPlans();
    expect(result).toEqual([{ id: 1 }]);
  });

  it('getAllFeatures', async () => {
    mockAxios.onGet('api/Feature').reply(200, [{ id: 1, name: 'Feature1' }]);
    const result = await getAllFeatures();
    expect(result).toHaveLength(1);
  });

  it('getSubscriptionPlanById', async () => {
    mockAxios.onGet('api/subscriptions/plans/1').reply(200, { id: 1 });
    const result = await getSubscriptionPlanById(1);
    expect(result.id).toBe(1);
  });

  it('createSubscriptionPlan', async () => {
    mockAxios.onPost('api/subscriptions/plans').reply(200, { id: 1 });
    const result = await createSubscriptionPlan({} as any);
    expect(result.id).toBe(1);
  });

  it('updateSubscriptionPlan', async () => {
    mockAxios.onPut('api/subscriptions/plans/1').reply(200, { id: 1 });
    const result = await updateSubscriptionPlan(1, {} as any);
    expect(result.id).toBe(1);
  });

  it('deleteSubscriptionPlan', async () => {
    mockAxios.onDelete('api/subscriptions/plans/1').reply(200);
    await deleteSubscriptionPlan(1);
  });

  it('createTenantSubscription', async () => {
    mockAxios.onPost('api/subscriptions/tenants/1/subscribe').reply(200, { success: true });
    const result = await createTenantSubscription(1, 2);
    expect(result).toBe(true);
  });

  it('cancelTenantSubscription', async () => {
    mockAxios.onPost('api/subscriptions/tenants/1/cancel').reply(200, { success: true });
    const result = await cancelTenantSubscription(1);
    expect(result).toBe(true);
  });

  it('updateTenantSubscription', async () => {
    mockAxios.onPut('api/subscriptions/tenants/1/plan').reply(200, { success: true });
    const result = await updateTenantSubscription(1, 2);
    expect(result).toBe(true);
  });

  it('addFeatureToPlan', async () => {
    mockAxios.onPost('api/subscriptions/plans/1/features/2').reply(200);
    const result = await addFeatureToPlan(1, 2);
    expect(result).toBe(true);
  });

  it('removeFeatureFromPlan', async () => {
    mockAxios.onDelete('api/subscriptions/plans/1/features/2').reply(200);
    const result = await removeFeatureFromPlan(1, 2);
    expect(result).toBe(true);
  });

  it('getSubscriptionStats', async () => {
    mockAxios.onGet('api/subscriptions/stats').reply(200, { totalPlans: 10 });
    const result = await getSubscriptionStats();
    expect(result.totalPlans).toBe(10);
  });

  it('getUserSubscriptionDetails returns data', async () => {
    const result = await getUserSubscriptionDetails();
    // This function returns from a local dummy API, so just ensure it doesn't throw
    expect(result).toBeDefined();
  });
});
