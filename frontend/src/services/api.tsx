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
    // Log the full request details
    console.log('Request:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data
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
    console.log('Response:', {
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('Response error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      config: error.config
    });
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
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
      // Format dates to match backend expectations
      const formattedProject = {
        ...project,
        startDate: project.startDate ? new Date(project.startDate).toISOString() : null,
        endDate: project.endDate ? new Date(project.endDate).toISOString() : null,
        estimatedCost: Number(project.estimatedCost),
        progress: Number(project.progress)
      };

      console.log('Creating project with formatted data:', formattedProject);
      
      const response = await axiosInstance.post('/project', formattedProject);
      return response.data;
    } catch (error: any) {
      console.error('Project creation error:', {
        requestData: project,
        error: {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        }
      });
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.title ||
        'Failed to create project'
      );
    }
  },

  update: async (id: number, project: Project): Promise<void> => {
    try {
      const formattedProject = {
        ...project,
        startDate: project.startDate ? new Date(project.startDate).toISOString() : null,
        endDate: project.endDate ? new Date(project.endDate).toISOString() : null,
        estimatedCost: Number(project.estimatedCost),
        progress: Number(project.progress)
      };

      await axiosInstance.put(`/project/${id}`, formattedProject);
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
      const response = await axiosInstance.post('/user/login', credentials);
      const { success, user, token } = response.data;
      
      if (success && token) {
        localStorage.setItem('token', token);
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'An error occurred during login'
      };
    }
  },

  logout: async (): Promise<void> => {
    try {
      await axiosInstance.post('/user/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
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

  getCurrentUser: async (): Promise<User | null> => {
    try {
      const response = await axiosInstance.get('/user/me');
      return response.data.user;
    } catch (error) {
      return null;
    }
  }
};
