import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

interface EnvironmentConfig {
  apiBaseUrl: string;
  staticIp: string;
  useStaticIp: boolean;
  tenantProtocol: string;
  tenantDomain: string;
  tenantPort: string;
}

// Environment configuration with fallbacks
const ENV_CONFIG: EnvironmentConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
  staticIp: import.meta.env.VITE_STATIC_IP || '',
  useStaticIp: import.meta.env.VITE_USE_STATIC_IP === 'true',
  tenantProtocol: import.meta.env.VITE_TENANT_PROTOCOL,
  tenantDomain: import.meta.env.VITE_TENANT_DOMAIN,
  tenantPort: import.meta.env.VITE_TENANT_PORT,
};

/**
 * Extracts tenant context from the current domain
 * @returns {string | null} The tenant subdomain or null if not found
 */
export const getTenantContext = (): string | null => {
  const hostname = window.location.hostname;
  
  // Support "tenant1.localhost" and "tenant1.dev.localhost"
  if (hostname.includes('localhost')) {
    const parts = hostname.split('.');
    
    // If it's just "localhost" or ends with ".localhost", it's a tenant subdomain or main domain
    if (parts.length > 1 && parts[parts.length - 1] === 'localhost') {
      // In development, return the full hostname as the tenant context
      // This will match "tenant1.localhost" in the database
      return hostname;
    }
    
    // Default to tenant 1 if accessed via direct localhost
    return '1';
  }

  // Normal subdomain logic for production
  const subdomain = hostname.split('.')[0];
  return subdomain && subdomain !== hostname ? hostname : '1';
};


/**
 * Constructs the appropriate API base URL based on tenant context
 * @returns {string} The API base URL
 */
const getApiBaseUrl = (): string => {
//  const tenant = getTenantContext();
//  debugger;
//  if (tenant) {
    // Construct tenant-specific API URL using environment variables
   // const { tenantProtocol, tenantDomain, tenantPort } = ENV_CONFIG;
   // return `${tenantProtocol}://${tenant}.${tenantDomain}:${tenantPort}/`;
//  }  
  return ENV_CONFIG.apiBaseUrl;
};

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
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
