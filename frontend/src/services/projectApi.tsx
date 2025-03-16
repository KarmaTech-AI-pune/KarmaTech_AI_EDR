import { axiosInstance } from './axiosConfig';
import { ProjectFormData } from '../types/index.tsx';

export const projectApi = {
  createProject: async (projectData: ProjectFormData) => {
    try {
      const response = await axiosInstance.post(`api/project`, projectData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getAll: async () => {
    try {
      const response = await axiosInstance.get(`api/project`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  delete: async (projectId: string) => {
    try {
      const response = await axiosInstance.delete(`api/project/${projectId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
