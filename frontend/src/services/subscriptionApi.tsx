import { axiosInstance } from './axiosConfig';
import { 
  SubscriptionPlan, 
  CreateSubscriptionPlanRequest, 
  UpdateSubscriptionPlanRequest,
  SubscriptionStats 
} from '../models/subscriptionModel';

export const getSubscriptionPlans = async (): Promise<SubscriptionPlan[]> => {
  const response = await axiosInstance.get(`api/subscriptions/plans`);
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

export const getSubscriptionStats = async (): Promise<SubscriptionStats> => {
  const response = await axiosInstance.get(`api/subscriptions/stats`);
  return response.data;
};
