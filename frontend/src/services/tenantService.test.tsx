import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
vi.unmock('axios');

import { tenantService } from './tenantService';
import { axiosInstance } from './axiosConfig';
import MockAdapter from 'axios-mock-adapter';

describe('tenantService', () => {
  let mockAxios: MockAdapter;

  beforeEach(() => {
    mockAxios = new MockAdapter(axiosInstance);
    // Suppress console.error in tests for intentional errors
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    mockAxios.restore();
    vi.restoreAllMocks();
  });

  describe('getSubscriptionPlanFeatures', () => {
    it('returns parsed features when successful', async () => {
      const mockFeatures = { "feature1": true, "feature2": false };
      mockAxios.onGet('api/tenants/1').reply(200, {
        subscriptionPlan: {
          featuresJson: JSON.stringify(mockFeatures)
        }
      });

      const result = await tenantService.getSubscriptionPlanFeatures(1);
      expect(result).toEqual(mockFeatures);
    });

    it('returns null if subscriptionPlan is missing', async () => {
      mockAxios.onGet('api/tenants/1').reply(200, {});

      const result = await tenantService.getSubscriptionPlanFeatures(1);
      expect(result).toBeNull();
    });

    it('returns null if featuresJson is missing', async () => {
      mockAxios.onGet('api/tenants/1').reply(200, {
        subscriptionPlan: {}
      });

      const result = await tenantService.getSubscriptionPlanFeatures(1);
      expect(result).toBeNull();
    });

    it('returns null and logs error if API fails', async () => {
      mockAxios.onGet('api/tenants/1').reply(500);

      const result = await tenantService.getSubscriptionPlanFeatures(1);
      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });

    it('returns null and logs error if JSON parse fails', async () => {
      mockAxios.onGet('api/tenants/1').reply(200, {
        subscriptionPlan: {
          featuresJson: 'invalid-json'
        }
      });

      const result = await tenantService.getSubscriptionPlanFeatures(1);
      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });
  });
});
