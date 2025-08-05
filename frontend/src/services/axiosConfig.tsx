import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Function to get tenant context from domain
const getTenantContext = () => {
  const hostname = window.location.hostname;
  
  // Extract subdomain (e.g., 'companyb' from 'companyb.localhost')
  const subdomain = hostname.split('.')[0];
  if(subdomain===null || subdomain === 'localhost' || subdomain === '') {
    return null; 
  }
  return subdomain;
};

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: false
});

// Add request interceptor to add token and tenant context to all requests
axiosInstance.interceptors.request.use(
  (config) => {
    // Ensure headers object exists
    config.headers = config.headers || {};

    // Add token if exists
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add tenant context from domain
    const tenantContext = getTenantContext();
    if (tenantContext) {
      config.headers['X-Tenant-Context'] = tenantContext;
      console.log('Added tenant context:', tenantContext);
    }

    console.log('Request headers:', {
      url: config.url,
      method: config.method,
      hasAuthHeader: !!config.headers.Authorization,
      tenantContext: config.headers['X-Tenant-Context']
    });

    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle authentication errors
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('Response success:', {
      url: response.config.url,
      status: response.status,
      statusText: response.statusText
    });
    return response;
  },
  (error) => {
    console.error('Response error:', {
      url: error.config?.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });

    if (error.response?.status === 401) {
      console.warn('Unauthorized access detected - clearing token');
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

// Helper function to ensure auth and tenant headers
export const ensureHeaders = (config?: AxiosRequestConfig): AxiosRequestConfig => {
  const token = localStorage.getItem('token');
  const tenantContext = getTenantContext();
  const newConfig = config ? { ...config } : {};

  if (!newConfig.headers) {
    newConfig.headers = {};
  }

  if (token) {
    newConfig.headers.Authorization = `Bearer ${token}`;
  }

  if (tenantContext) {
    newConfig.headers['X-Tenant-Context'] = tenantContext;
  }

  return newConfig;
};
