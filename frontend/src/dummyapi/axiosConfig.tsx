import axios from 'axios';
import { useLoading } from '../context/LoadingContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to add token to all requests
axiosInstance.interceptors.request.use(
  (config) => {
    // const { setLoading } = useLoading(); // Hooks cannot be called here
    // setLoading(true);
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
  (response) => {
    // const { setLoading } = useLoading(); // Hooks cannot be called here
    // setLoading(false);
    return response;
  },
  (error) => {
    console.error('Detailed Response error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    // const { setLoading } = useLoading(); // Hooks cannot be called here
    // setLoading(false);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);
