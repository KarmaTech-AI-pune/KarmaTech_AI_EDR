import axios from 'axios';
import { 
  SubscriptionPlan, 
  CreateSubscriptionPlanRequest, 
  UpdateSubscriptionPlanRequest,
  SubscriptionStats 
} from '../models/subscriptionModel';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/';

export const getSubscriptionPlans = async (): Promise<SubscriptionPlan[]> => {
  const response = await axios.get(`${API_BASE_URL}api/subscriptions/plans`);
  return response.data;
};

export const getSubscriptionPlanById = async (id: number): Promise<SubscriptionPlan> => {
  const response = await axios.get(`${API_BASE_URL}api/subscriptions/plans/${id}`);
  return response.data;
};

export const createSubscriptionPlan = async (plan: CreateSubscriptionPlanRequest): Promise<SubscriptionPlan> => {
  const response = await axios.post(`${API_BASE_URL}api/subscriptions/plans`, plan);
  return response.data;
};

export const updateSubscriptionPlan = async (id: number, plan: UpdateSubscriptionPlanRequest): Promise<SubscriptionPlan> => {
  const response = await axios.put(`${API_BASE_URL}api/subscriptions/plans/${id}`, plan);
  return response.data;
};

export const deleteSubscriptionPlan = async (id: number): Promise<void> => {
  await axios.delete(`${API_BASE_URL}api/subscriptions/plans/${id}`);
};

export const createTenantSubscription = async (tenantId: number, planId: number): Promise<boolean> => {
  const response = await axios.post(`${API_BASE_URL}api/subscriptions/tenants/${tenantId}/subscribe`, { planId });
  return response.data.success;   
};
  
export const cancelTenantSubscription = async (tenantId: number): Promise<boolean> => {
  const response = await axios.post(`${API_BASE_URL}api/subscriptions/tenants/${tenantId}/cancel`);
  return response.data.success;
};

export const updateTenantSubscription = async (tenantId: number, planId: number): Promise<boolean> => {
  const response = await axios.put(`${API_BASE_URL}api/subscriptions/tenants/${tenantId}/plan`, { planId });
  return response.data.success;
};

export const getSubscriptionStats = async (): Promise<SubscriptionStats> => {
  const response = await axios.get(`${API_BASE_URL}api/subscriptions/stats`);
  return response.data;
}; 