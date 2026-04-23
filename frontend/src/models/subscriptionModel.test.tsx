import { describe, it, expect } from 'vitest';
import { 
  Feature, 
  SubscriptionPlan, 
  PlanFeatures, 
  CreateSubscriptionPlanRequest,
  UpdateSubscriptionPlanRequest,
  SubscriptionStats
} from './subscriptionModel';

describe('SubscriptionModel', () => {
  describe('Feature Interface', () => {
    it('should create a valid Feature object', () => {
      const feature: Feature = {
        id: 1,
        name: 'Advanced Reporting',
        description: 'Access to advanced reporting features',
        isActive: true
      };

      expect(feature.id).toBe(1);
      expect(feature.name).toBe('Advanced Reporting');
      expect(feature.description).toBe('Access to advanced reporting features');
      expect(feature.isActive).toBe(true);
    });

    it('should handle inactive feature', () => {
      const feature: Feature = {
        id: 2,
        name: 'Beta Feature',
        description: 'Experimental feature in beta',
        isActive: false
      };

      expect(feature.isActive).toBe(false);
    });

    it('should handle feature with different data types', () => {
      const features: Feature[] = [
        { id: 1, name: 'Feature 1', description: 'Description 1', isActive: true },
        { id: 2, name: 'Feature 2', description: 'Description 2', isActive: false },
        { id: 3, name: 'Feature 3', description: 'Description 3', isActive: true }
      ];

      expect(features).toHaveLength(3);
      expect(features.filter(f => f.isActive)).toHaveLength(2);
      expect(features.filter(f => !f.isActive)).toHaveLength(1);
    });
  });

  describe('SubscriptionPlan Interface', () => {
    it('should create a valid SubscriptionPlan object', () => {
      const features: Feature[] = [
        { id: 1, name: 'Basic Reporting', description: 'Basic reports', isActive: true },
        { id: 2, name: 'User Management', description: 'Manage users', isActive: true }
      ];

      const subscriptionPlan: SubscriptionPlan = {
        id: 1,
        name: 'Professional Plan',
        description: 'Perfect for growing teams',
        monthlyPrice: 29.99,
        yearlyPrice: 299.99,
        maxUsers: 10,
        maxProjects: 50,
        maxStorageGB: 100,
        isActive: true,
        stripePriceId: 'price_1234567890',
        features: features,
        tenants: 5
      };

      expect(subscriptionPlan.id).toBe(1);
      expect(subscriptionPlan.name).toBe('Professional Plan');
      expect(subscriptionPlan.description).toBe('Perfect for growing teams');
      expect(subscriptionPlan.monthlyPrice).toBe(29.99);
      expect(subscriptionPlan.yearlyPrice).toBe(299.99);
      expect(subscriptionPlan.maxUsers).toBe(10);
      expect(subscriptionPlan.maxProjects).toBe(50);
      expect(subscriptionPlan.maxStorageGB).toBe(100);
      expect(subscriptionPlan.isActive).toBe(true);
      expect(subscriptionPlan.stripePriceId).toBe('price_1234567890');
      expect(subscriptionPlan.features).toHaveLength(2);
      expect(subscriptionPlan.tenants).toBe(5);
    });

    it('should handle plan with optional fields', () => {
      const subscriptionPlan: SubscriptionPlan = {
        id: 2,
        name: 'Basic Plan',
        monthlyPrice: 9.99,
        yearlyPrice: 99.99,
        maxUsers: 3,
        maxProjects: 10,
        maxStorageGB: 25,
        isActive: true,
        features: []
      };

      expect(subscriptionPlan.description).toBeUndefined();
      expect(subscriptionPlan.stripePriceId).toBeUndefined();
      expect(subscriptionPlan.tenants).toBeUndefined();
      expect(subscriptionPlan.features).toEqual([]);
    });

    it('should handle inactive plan', () => {
      const subscriptionPlan: SubscriptionPlan = {
        id: 3,
        name: 'Deprecated Plan',
        description: 'No longer available',
        monthlyPrice: 19.99,
        yearlyPrice: 199.99,
        maxUsers: 5,
        maxProjects: 25,
        maxStorageGB: 50,
        isActive: false,
        features: []
      };

      expect(subscriptionPlan.isActive).toBe(false);
    });

    it('should handle plan with multiple features', () => {
      const features: Feature[] = [
        { id: 1, name: 'Advanced Analytics', description: 'Detailed analytics', isActive: true },
        { id: 2, name: 'API Access', description: 'REST API access', isActive: true },
        { id: 3, name: 'Priority Support', description: '24/7 support', isActive: true },
        { id: 4, name: 'Custom Integrations', description: 'Custom integrations', isActive: true }
      ];

      const subscriptionPlan: SubscriptionPlan = {
        id: 4,
        name: 'Enterprise Plan',
        description: 'For large organizations',
        monthlyPrice: 99.99,
        yearlyPrice: 999.99,
        maxUsers: 100,
        maxProjects: 500,
        maxStorageGB: 1000,
        isActive: true,
        stripePriceId: 'price_enterprise_123',
        features: features,
        tenants: 50
      };

      expect(subscriptionPlan.features).toHaveLength(4);
      expect(subscriptionPlan.features.every(f => f.isActive)).toBe(true);
    });
  });

  describe('PlanFeatures Interface', () => {
    it('should create a valid PlanFeatures object', () => {
      const planFeatures: PlanFeatures = {
        'advancedReporting': true,
        'apiAccess': false,
        'prioritySupport': true,
        'customIntegrations': false,
        'unlimitedProjects': true
      };

      expect(planFeatures['advancedReporting']).toBe(true);
      expect(planFeatures['apiAccess']).toBe(false);
      expect(planFeatures['prioritySupport']).toBe(true);
      expect(planFeatures['customIntegrations']).toBe(false);
      expect(planFeatures['unlimitedProjects']).toBe(true);
    });

    it('should handle dynamic feature keys', () => {
      const planFeatures: PlanFeatures = {};
      
      // Dynamically add features
      planFeatures['feature1'] = true;
      planFeatures['feature2'] = false;
      planFeatures['feature3'] = true;

      expect(Object.keys(planFeatures)).toHaveLength(3);
      expect(planFeatures['feature1']).toBe(true);
      expect(planFeatures['feature2']).toBe(false);
      expect(planFeatures['feature3']).toBe(true);
    });
  });

  describe('CreateSubscriptionPlanRequest Interface', () => {
    it('should create a valid CreateSubscriptionPlanRequest object', () => {
      const createRequest: CreateSubscriptionPlanRequest = {
        name: 'New Plan',
        description: 'A new subscription plan',
        monthlyPrice: 39.99,
        yearlyPrice: 399.99,
        maxUsers: 15,
        maxProjects: 75,
        maxStorageGB: 150,
        isActive: true,
        featureIds: [1, 2, 3, 4]
      };

      expect(createRequest.name).toBe('New Plan');
      expect(createRequest.description).toBe('A new subscription plan');
      expect(createRequest.monthlyPrice).toBe(39.99);
      expect(createRequest.yearlyPrice).toBe(399.99);
      expect(createRequest.maxUsers).toBe(15);
      expect(createRequest.maxProjects).toBe(75);
      expect(createRequest.maxStorageGB).toBe(150);
      expect(createRequest.isActive).toBe(true);
      expect(createRequest.featureIds).toEqual([1, 2, 3, 4]);
    });

    it('should handle request with optional fields', () => {
      const createRequest: CreateSubscriptionPlanRequest = {
        name: 'Minimal Plan',
        monthlyPrice: 19.99,
        yearlyPrice: 199.99,
        maxUsers: 5,
        maxProjects: 20,
        maxStorageGB: 50,
        featureIds: [1, 2]
      };

      expect(createRequest.description).toBeUndefined();
      expect(createRequest.isActive).toBeUndefined();
      expect(createRequest.featureIds).toEqual([1, 2]);
    });

    it('should handle request with empty feature list', () => {
      const createRequest: CreateSubscriptionPlanRequest = {
        name: 'Basic Plan',
        monthlyPrice: 9.99,
        yearlyPrice: 99.99,
        maxUsers: 1,
        maxProjects: 5,
        maxStorageGB: 10,
        featureIds: []
      };

      expect(createRequest.featureIds).toEqual([]);
    });
  });

  describe('UpdateSubscriptionPlanRequest Interface', () => {
    it('should create a valid UpdateSubscriptionPlanRequest object', () => {
      const updateRequest: UpdateSubscriptionPlanRequest = {
        id: 1,
        name: 'Updated Plan Name',
        description: 'Updated description',
        monthlyPrice: 34.99,
        yearlyPrice: 349.99,
        maxUsers: 12,
        maxProjects: 60,
        maxStorageGB: 120,
        isActive: false,
        featureIds: [1, 3, 5],
        stripePriceId: 'price_updated_123'
      };

      expect(updateRequest.id).toBe(1);
      expect(updateRequest.name).toBe('Updated Plan Name');
      expect(updateRequest.description).toBe('Updated description');
      expect(updateRequest.monthlyPrice).toBe(34.99);
      expect(updateRequest.yearlyPrice).toBe(349.99);
      expect(updateRequest.maxUsers).toBe(12);
      expect(updateRequest.maxProjects).toBe(60);
      expect(updateRequest.maxStorageGB).toBe(120);
      expect(updateRequest.isActive).toBe(false);
      expect(updateRequest.featureIds).toEqual([1, 3, 5]);
      expect(updateRequest.stripePriceId).toBe('price_updated_123');
    });

    it('should handle partial update request', () => {
      const updateRequest: UpdateSubscriptionPlanRequest = {
        id: 2,
        name: 'Partially Updated Plan',
        monthlyPrice: 24.99
      };

      expect(updateRequest.id).toBe(2);
      expect(updateRequest.name).toBe('Partially Updated Plan');
      expect(updateRequest.monthlyPrice).toBe(24.99);
      expect(updateRequest.description).toBeUndefined();
      expect(updateRequest.yearlyPrice).toBeUndefined();
      expect(updateRequest.maxUsers).toBeUndefined();
      expect(updateRequest.maxProjects).toBeUndefined();
      expect(updateRequest.maxStorageGB).toBeUndefined();
      expect(updateRequest.isActive).toBeUndefined();
      expect(updateRequest.featureIds).toBeUndefined();
      expect(updateRequest.stripePriceId).toBeUndefined();
    });

    it('should handle update with only ID', () => {
      const updateRequest: UpdateSubscriptionPlanRequest = {
        id: 3
      };

      expect(updateRequest.id).toBe(3);
      expect(Object.keys(updateRequest)).toHaveLength(1);
    });
  });

  describe('SubscriptionStats Interface', () => {
    it('should create a valid SubscriptionStats object', () => {
      const stats: SubscriptionStats = {
        totalPlans: 5,
        activePlans: 4,
        totalSubscribers: 150,
        monthlyRevenue: 4500.75
      };

      expect(stats.totalPlans).toBe(5);
      expect(stats.activePlans).toBe(4);
      expect(stats.totalSubscribers).toBe(150);
      expect(stats.monthlyRevenue).toBe(4500.75);
    });

    it('should handle zero values', () => {
      const stats: SubscriptionStats = {
        totalPlans: 0,
        activePlans: 0,
        totalSubscribers: 0,
        monthlyRevenue: 0
      };

      expect(stats.totalPlans).toBe(0);
      expect(stats.activePlans).toBe(0);
      expect(stats.totalSubscribers).toBe(0);
      expect(stats.monthlyRevenue).toBe(0);
    });

    it('should handle large numbers', () => {
      const stats: SubscriptionStats = {
        totalPlans: 25,
        activePlans: 20,
        totalSubscribers: 10000,
        monthlyRevenue: 250000.99
      };

      expect(stats.totalPlans).toBe(25);
      expect(stats.activePlans).toBe(20);
      expect(stats.totalSubscribers).toBe(10000);
      expect(stats.monthlyRevenue).toBe(250000.99);
    });

    it('should calculate derived metrics', () => {
      const stats: SubscriptionStats = {
        totalPlans: 10,
        activePlans: 8,
        totalSubscribers: 200,
        monthlyRevenue: 6000
      };

      // Calculate derived metrics
      const activePlanPercentage = (stats.activePlans / stats.totalPlans) * 100;
      const averageRevenuePerSubscriber = stats.monthlyRevenue / stats.totalSubscribers;

      expect(activePlanPercentage).toBe(80);
      expect(averageRevenuePerSubscriber).toBe(30);
    });
  });

  describe('Type Safety and Validation', () => {
    it('should enforce number types for pricing fields', () => {
      const plan: SubscriptionPlan = {
        id: 1,
        name: 'Test Plan',
        monthlyPrice: 29.99,
        yearlyPrice: 299.99,
        maxUsers: 10,
        maxProjects: 50,
        maxStorageGB: 100,
        isActive: true,
        features: []
      };

      expect(typeof plan.monthlyPrice).toBe('number');
      expect(typeof plan.yearlyPrice).toBe('number');
      expect(typeof plan.maxUsers).toBe('number');
      expect(typeof plan.maxProjects).toBe('number');
      expect(typeof plan.maxStorageGB).toBe('number');
    });

    it('should enforce boolean type for isActive field', () => {
      const feature: Feature = {
        id: 1,
        name: 'Test Feature',
        description: 'Test description',
        isActive: true
      };

      const plan: SubscriptionPlan = {
        id: 1,
        name: 'Test Plan',
        monthlyPrice: 19.99,
        yearlyPrice: 199.99,
        maxUsers: 5,
        maxProjects: 25,
        maxStorageGB: 50,
        isActive: false,
        features: [feature]
      };

      expect(typeof feature.isActive).toBe('boolean');
      expect(typeof plan.isActive).toBe('boolean');
    });

    it('should enforce array type for features and featureIds', () => {
      const features: Feature[] = [
        { id: 1, name: 'Feature 1', description: 'Desc 1', isActive: true }
      ];

      const plan: SubscriptionPlan = {
        id: 1,
        name: 'Test Plan',
        monthlyPrice: 19.99,
        yearlyPrice: 199.99,
        maxUsers: 5,
        maxProjects: 25,
        maxStorageGB: 50,
        isActive: true,
        features: features
      };

      const createRequest: CreateSubscriptionPlanRequest = {
        name: 'New Plan',
        monthlyPrice: 29.99,
        yearlyPrice: 299.99,
        maxUsers: 10,
        maxProjects: 50,
        maxStorageGB: 100,
        featureIds: [1, 2, 3]
      };

      expect(Array.isArray(plan.features)).toBe(true);
      expect(Array.isArray(createRequest.featureIds)).toBe(true);
    });
  });
});