// File: frontend/src/services/api.ts
// Purpose: API service for making backend requests

import axios, { AxiosInstance } from 'axios';
import { Project, Credentials, User, LoginResponse, OpportunityTracking, GoNoGoDecision } from '../types';

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

export const goNoGoApi = {
  getAll: async (): Promise<GoNoGoDecision[]> => {
    try {
      const response = await axiosInstance.get('GoNoGoDecision');
      return response.data;
    } catch (error) {
      console.error('Error fetching Go/No-Go decisions:', error);
      throw error;
    }
  },

  getById: async (id: number): Promise<GoNoGoDecision> => {
    try {
      const response = await axiosInstance.get(`GoNoGoDecision/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching Go/No-Go decision ${id}:`, error);
      throw error;
    }
  },

  getByProjectId: async (projectId: number): Promise<GoNoGoDecision | null> => {
    try {
      const response = await axiosInstance.get(`GoNoGoDecision/project/${projectId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      console.error(`Error fetching Go/No-Go decision for project ${projectId}:`, error);
      throw error;
    }
  },

  create: async (projectId: number, data: GoNoGoDecision): Promise<GoNoGoDecision> => {
    try {
      console.log(`Creating GoNoGo Decision for Project ${projectId}:`, JSON.stringify(data));
      const response = await axiosInstance.post(`GoNoGoDecision`, data);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 400) {
        const validationErrors = error.response.data.errors;
        console.error('Validation Errors:', validationErrors);
        throw new Error(validationErrors.join(', '));
      }
      console.error(`Error creating go/no-go decision for project ${projectId}:`, error);
      throw error;
    }
  },

  update: async (id: number, data: GoNoGoDecision): Promise<GoNoGoDecision> => {
    try {
      console.log(`Updating GoNoGo Decision ${id}:`, JSON.stringify(data));
      const response = await axiosInstance.put(`GoNoGoDecision/${id}`, data);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 400) {
        const validationErrors = error.response.data.errors;
        console.error('Validation Errors:', validationErrors);
        throw new Error(validationErrors.join(', '));
      }
      console.error(`Error updating go/no-go decision ${id}:`, error);
      throw error;
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await axiosInstance.delete(`GoNoGoDecision/${id}`);
    } catch (error) {
      console.error(`Error deleting Go/No-Go decision ${id}:`, error);
      throw error;
    }
  }
};

export const opportunityApi = {
  getByProjectId: async (projectId: number): Promise<OpportunityTracking[]> => {
    try {
      const response = await axiosInstance.get(`opportunity-tracking/project/${projectId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching opportunity tracking for project ${projectId}:`, error);
      throw error;
    }
  },

  create: async (data: Partial<OpportunityTracking>): Promise<OpportunityTracking> => {
    try {
      const response = await axiosInstance.post('opportunity-tracking', data);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 400) {
        const validationErrors = error.response.data.errors;
        console.error('Validation Errors:', validationErrors);
        throw new Error(validationErrors.join(', '));
      }
      console.error('Error creating opportunity tracking:', error);
      throw error;
    }
  },

  update: async (id: number, data: Partial<OpportunityTracking>): Promise<OpportunityTracking> => {
    try {
      const response = await axiosInstance.put(`opportunity-tracking/${id}`, data);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 400) {
        const validationErrors = error.response.data.errors;
        console.error('Validation Errors:', validationErrors);
        throw new Error(validationErrors.join(', '));
      }
      console.error(`Error updating opportunity tracking ${id}:`, error);
      throw error;
    }
  }
};

export const projectApi = {
  getAll: async (): Promise<Project[]> => {
    try {
      const response = await axiosInstance.get('project');
      return response.data;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  },

  getById: async (id: number): Promise<Project> => {
    try {
      const response = await axiosInstance.get(`project/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching project ${id}:`, error);
      throw error;
    }
  },

  create: async (project: Omit<Project, 'id'>): Promise<Project> => {
    try {
      const formattedProject = {
        ...project,
        startDate: undefined,
        endDate: undefined,
        estimatedCost: Number(project.estimatedCost),
        progress: Number(project.progress)
      };

      console.log('Creating project with formatted data:', formattedProject);
      
      const response = await axiosInstance.post('project', formattedProject);
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
        startDate: project.startDate ? new Date(project.startDate).toISOString() : undefined,
        endDate: project.endDate ? new Date(project.endDate).toISOString() : undefined,
        estimatedCost: Number(project.estimatedCost),
        progress: Number(project.progress)
      };

      await axiosInstance.put(`project/${id}`, formattedProject);
    } catch (error) {
      console.error(`Error updating project ${id}:`, error);
      throw error;
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await axiosInstance.delete(`project/${id}`);
    } catch (error) {
      console.error(`Error deleting project ${id}:`, error);
      throw error;
    }
  }
};

export const authApi = {
  login: async (credentials: Credentials): Promise<LoginResponse> => {
    try {
      const response = await axiosInstance.post('user/login', credentials);
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
      await axiosInstance.post('user/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      delete axiosInstance.defaults.headers.common['Authorization'];
    }
  },

  checkAuth: async (): Promise<boolean> => {
    try {
      const response = await axiosInstance.get('user/verify');
      return response.data.valid;
    } catch (error) {
      return false;
    }
  },

  getCurrentUser: async (): Promise<User | null> => {
    try {
      const response = await axiosInstance.get('user/me');
      return response.data.user;
    } catch (error) {
      return null;
    }
  }
};
