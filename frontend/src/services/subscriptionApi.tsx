import { axiosInstance } from './axiosConfig';
import { 
  SubscriptionPlan, 
  CreateSubscriptionPlanRequest, 
  UpdateSubscriptionPlanRequest,
  SubscriptionStats,
  Feature
} from '../models/subscriptionModel';
import { SubscriptionData } from '../types/subscriptionType';
import { getUserPlan } from '../dummyapi/subscriptionPlanData';

export const getSubscriptionPlans = async (): Promise<SubscriptionPlan[]> => {
  const response = await axiosInstance.get(`api/subscriptions/plans`);
  // Handle DTO response potentially wrapping plans
  return response.data.plans || response.data;
};

export const getAllFeatures = async (): Promise<Feature[]> => {
  const response = await axiosInstance.get(`api/Feature`);
  return response.data;
};

export const getSubscriptionPlanById = async (id: number): Promise<SubscriptionPlan> => {
  const response = await axiosInstance.get(`api/subscriptions/plans/${id}`);
  return response.data;
};

export const createSubscriptionPlan = async (plan: CreateSubscriptionPlanRequest): Promise<SubscriptionPlan> => {
  const response = await axiosInstance.post(`api/subscriptions/plans`, plan);
  return response.data;
};

export const updateSubscriptionPlan = async (id: number, plan: UpdateSubscriptionPlanRequest): Promise<SubscriptionPlan> => {
  const response = await axiosInstance.put(`api/subscriptions/plans/${id}`, plan);
  return response.data;
};

export const deleteSubscriptionPlan = async (id: number): Promise<void> => {
  await axiosInstance.delete(`api/subscriptions/plans/${id}`);
};

export const createTenantSubscription = async (tenantId: number, planId: number): Promise<boolean> => {
  const response = await axiosInstance.post(`api/subscriptions/tenants/${tenantId}/subscribe`, { planId });
  return response.data.success;   
};
  
export const cancelTenantSubscription = async (tenantId: number): Promise<boolean> => {
  const response = await axiosInstance.post(`api/subscriptions/tenants/${tenantId}/cancel`);
  return response.data.success;
};

export const updateTenantSubscription = async (tenantId: number, planId: number): Promise<boolean> => {
  const response = await axiosInstance.put(`api/subscriptions/tenants/${tenantId}/plan`, { planId });
  return response.data.success;
};

export const addFeatureToPlan = async (planId: number, featureId: number): Promise<boolean> => {
    const response = await axiosInstance.post(`api/subscriptions/plans/${planId}/features/${featureId}`);
    return response.status === 200;
};

export const removeFeatureFromPlan = async (planId: number, featureId: number): Promise<boolean> => {
    const response = await axiosInstance.delete(`api/subscriptions/plans/${planId}/features/${featureId}`);
    return response.status === 200;
};

export const getSubscriptionStats = async (): Promise<SubscriptionStats> => {
  const response = await axiosInstance.get(`api/subscriptions/stats`);
  return response.data;
};

export const getUserSubscriptionDetails =async (): Promise<SubscriptionData | null> => {
    try {
      // const response = await axiosInstance.get<SubscriptionData>("/api/user/subscription");
      // return response.data;
      const data = getUserPlan(1);
      return Promise.resolve(data);
    } catch (error) {
      console.error("Error fetching subscription details:", error);
      return null;
    }
};
