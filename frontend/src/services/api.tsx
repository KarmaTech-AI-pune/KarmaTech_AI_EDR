// File: frontend/src/services/api.ts
// Purpose: API service for making backend requests

import axios,{ AxiosInstance } from 'axios';
import { Project, Credentials, User, LoginResponse } from '../types';


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
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
    return Promise.reject(error);
  }
);

// Add response interceptor to handle authentication errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clean up on authentication error
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const projectApi = {
  getAll: async (): Promise<Project[]> => {
    try {
      const response = await axiosInstance.get('/project');
      return response.data;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  },

  getById: async (id: number): Promise<Project> => {
    try {
      const response = await axiosInstance.get(`/project/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching project ${id}:`, error);
      throw error;
    }
  },

  create: async (project: Omit<Project, 'id'>): Promise<Project> => {
    try {
      const response = await axiosInstance.post('/project', project);
      return response.data;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  },

  update: async (id: number, project: Project): Promise<void> => {
    try {
      await axiosInstance.put(`/project/${id}`, project);
    } catch (error) {
      console.error(`Error updating project ${id}:`, error);
      throw error;
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await axiosInstance.delete(`/project/${id}`);
    } catch (error) {
      console.error(`Error deleting project ${id}:`, error);
      throw error;
    }
  }
};

export const authApi = {
  login: async (credentials: Credentials): Promise<LoginResponse> => {
    try {
      console.log(credentials)
      const response = await axiosInstance.post('/user/login', credentials);
      const { success, user, token } = response.data;
      
      if (success && token) {
        localStorage.setItem('token', token);
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'An error occurred during login'
      };
    }
  },

  logout: async (): Promise<void> => {
    try {
      await axiosInstance.post('/user/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clean up local state, even if the API call fails
      localStorage.removeItem('token');
      delete axiosInstance.defaults.headers.common['Authorization'];
    }
  },

  checkAuth: async (): Promise<boolean> => {
    try {
      const response = await axiosInstance.get('/user/verify');
      return response.data.valid;
    } catch (error) {
      return false;
    }
  },
/*
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const response = await axiosInstance.get('/user/me');
      return response.data.user;
    } catch (error) {
      console.error('Error fetching current user:', error);
      return null;
    }
  }*/
};