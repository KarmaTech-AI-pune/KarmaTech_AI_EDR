import { axiosInstance } from './axiosConfig';

export interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  price: number;
  billingCycle: number;
  maxUsers: number;
  maxProjects: number;
  featuresJson: string; // JSON string of features
  stripeProductId: string | null;
  stripePriceId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TenantFeatures {
  [key: string]: boolean; // e.g., { "feature1": true, "feature2": false }
}

export const tenantService = {
  getSubscriptionPlanFeatures: async (tenantId: number): Promise<TenantFeatures | null> => {
    try {
      const response = await axiosInstance.get(`api/tenants/${tenantId}`);
      if (response.data && response.data.subscriptionPlan && response.data.subscriptionPlan.featuresJson) {
        return JSON.parse(response.data.subscriptionPlan.featuresJson) as TenantFeatures;
      }
      return null;
    } catch (error) {
      console.error('Error fetching subscription plan features:', error);
      return null;
    }
  },
};
