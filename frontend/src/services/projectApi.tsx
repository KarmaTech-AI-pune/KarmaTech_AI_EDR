import { Project } from '../types';
import { axiosInstance } from './axiosConfig';

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
