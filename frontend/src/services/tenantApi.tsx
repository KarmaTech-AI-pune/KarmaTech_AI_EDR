import { axiosInstance } from './axiosConfig';
import { Tenant, CreateTenantRequest, UpdateTenantRequest } from '../models/tenantModel';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const getAllTenants = async (): Promise<Tenant[]> => {
  const response = await axiosInstance.get(`${API_BASE_URL}api/tenants`);
  return response.data;
};

export const getTenantById = async (id: number): Promise<Tenant> => {
  const response = await axiosInstance.get(`${API_BASE_URL}api/tenants/${id}`);
  return response.data;
};

export const createTenant = async (tenant: CreateTenantRequest): Promise<Tenant> => {
  // debugger;
  const response = await axiosInstance.post(`${API_BASE_URL}api/tenants`, tenant);
  return response.data;
};

export const updateTenant = async (id: number, tenant: UpdateTenantRequest): Promise<Tenant> => {
  const response = await axiosInstance.put(`${API_BASE_URL}api/tenants/${id}`, tenant);
  return response.data;
};

export const deleteTenant = async (id: number): Promise<void> => {
  await axiosInstance.delete(`${API_BASE_URL}api/tenants/${id}`);
};

export const validateSubdomain = async (subdomain: string): Promise<boolean> => {
  const response = await axiosInstance.post(`${API_BASE_URL}api/tenants/validate-subdomain`, { subdomain });
  return response.data.isValid;
};

export const suggestSubdomain = async (companyName: string): Promise<string[]> => {
  const response = await axiosInstance.post(`${API_BASE_URL}api/tenants/suggest-subdomain`, { companyName });
  return response.data.suggestions;
};

export const getTenantStats = async () => {
  const response = await axiosInstance.get(`${API_BASE_URL}api/tenants/stats`);
  return response.data;
};

// Tenant User Management APIs
export const getTenantUsers = async (tenantId: number) => {
  const response = await axiosInstance.get(`${API_BASE_URL}api/tenants/${tenantId}/users`);
  return response.data;
};

export const addTenantUser = async (tenantUser: {
  tenantId: number;
  userId: string;
  role: number;
  isActive: boolean;
}) => {
  const response = await axiosInstance.post(`${API_BASE_URL}api/tenants/${tenantUser.tenantId}/users`, tenantUser);
  return response.data;
};

export const updateTenantUser = async (tenantUserId: number, updates: {
  role?: number;
  isActive?: boolean;
}) => {
  const response = await axiosInstance.put(`${API_BASE_URL}api/tenants/users/${tenantUserId}`, updates);
  return response.data;
};

export const removeTenantUser = async (tenantUserId: number) => {
  await axiosInstance.delete(`${API_BASE_URL}api/tenants/users/${tenantUserId}`);
}; 