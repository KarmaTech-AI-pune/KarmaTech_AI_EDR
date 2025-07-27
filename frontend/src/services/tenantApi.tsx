import axios from 'axios';
import { Tenant, CreateTenantRequest, UpdateTenantRequest } from '../models/tenantModel';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const getAllTenants = async (): Promise<Tenant[]> => {
  const response = await axios.get(`${API_BASE_URL}api/tenants`);
  return response.data;
};

export const getTenantById = async (id: number): Promise<Tenant> => {
  const response = await axios.get(`${API_BASE_URL}api/tenants/${id}`);
  return response.data;
};

export const createTenant = async (tenant: CreateTenantRequest): Promise<Tenant> => {
  debugger;
  const response = await axios.post(`${API_BASE_URL}api/tenants`, tenant);
  return response.data;
};

export const updateTenant = async (id: number, tenant: UpdateTenantRequest): Promise<Tenant> => {
  const response = await axios.put(`${API_BASE_URL}api/tenants/${id}`, tenant);
  return response.data;
};

export const deleteTenant = async (id: number): Promise<void> => {
  await axios.delete(`${API_BASE_URL}api/tenants/${id}`);
};

export const validateSubdomain = async (subdomain: string): Promise<boolean> => {
  const response = await axios.post(`${API_BASE_URL}api/tenants/validate-subdomain`, { subdomain });
  return response.data.isValid;
};

export const suggestSubdomain = async (companyName: string): Promise<string[]> => {
  const response = await axios.post(`${API_BASE_URL}api/tenants/suggest-subdomain`, { companyName });
  return response.data.suggestions;
};

export const getTenantStats = async () => {
  const response = await axios.get(`${API_BASE_URL}api/tenants/stats`);
  return response.data;
}; 