import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Enable sending cookies in cross-origin requests
});

// Add request interceptor to add token to all requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
  (response) => response,
  (error) => {
    console.error('Detailed Response error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);
// Helper function to ensure token is included in requests
export const ensureAuthHeader = (config?: AxiosRequestConfig): AxiosRequestConfig => {
  const token = localStorage.getItem('token');
  const newConfig = config ? { ...config } : {};

  if (!newConfig.headers) {
    newConfig.headers = {};
  }

  if (token) {
    newConfig.headers.Authorization = `Bearer ${token}`;
  }

  return newConfig;
};

