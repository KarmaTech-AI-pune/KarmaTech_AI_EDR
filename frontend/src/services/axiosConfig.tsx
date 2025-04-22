import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: false // Disable sending cookies in cross-origin requests to avoid CORS issues
});

// Add request interceptor to add token to all requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Ensure headers object exists
      config.headers = config.headers || {};

      // Set Authorization header with Bearer token
      config.headers.Authorization = `Bearer ${token}`;

      console.log('Request with token:', {
        url: config.url,
        method: config.method,
        hasAuthHeader: !!config.headers.Authorization
      });
    } else {
      console.warn('No token found in localStorage');
    }
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
      // You could also redirect to login page here
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Helper function to ensure token is included in requests
export const ensureAuthHeader = (config?: AxiosRequestConfig): AxiosRequestConfig => {
  const token = localStorage.getItem('token');
  const newConfig = { ...config } || {};

  if (!newConfig.headers) {
    newConfig.headers = {};
  }

  if (token) {
    newConfig.headers.Authorization = `Bearer ${token}`;
  }

  return newConfig;
};
