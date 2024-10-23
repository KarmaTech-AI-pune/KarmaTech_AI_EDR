// File: frontend/src/services/api.ts
// Purpose: API service for making backend requests

import axios from 'axios';
import { Project } from '../types';


const API_BASE_URL = 'http://localhost:5245/api'; // TODO: Update with actual API URL

export const projectApi = {
  getAll: async (): Promise<Project[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/project`);
      return response.data;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  },

  getById: async (id: number): Promise<Project> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/project/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching project ${id}:`, error);
      throw error;
    }
  },

  create: async (project: Omit<Project, 'id'>): Promise<Project> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/project`, project);
      return response.data;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  },

  update: async (id: number, project: Project): Promise<void> => {
    try {
      await axios.put(`${API_BASE_URL}/project/${id}`, project);
    } catch (error) {
      console.error(`Error updating project ${id}:`, error);
      throw error;
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await axios.delete(`${API_BASE_URL}/project/${id}`);
    } catch (error) {
      console.error(`Error deleting project ${id}:`, error);
      throw error;
    }
  }
};
