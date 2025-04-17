import { axiosInstance } from './axiosConfig';
import { ProjectFormData } from '../types/index.tsx';
import { Project } from '../models';

export const projectApi = {
  createProject: async (projectData: ProjectFormData) => {
    try {
      const response = await axiosInstance.post(`api/Project`, projectData);
      return response.data;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  },

  getAll: async () => {
    try {
      const response = await axiosInstance.get(`api/Project`);
      return response.data;
    } catch (error) {
      console.error('Error getting all projects:', error);
      throw error;
    }
  },

  getById: async (projectId: string) => {
    try {
      const response = await axiosInstance.get(`api/Project/${projectId}`);
      return response.data;
    } catch (error) {
      console.error(`Error getting project ${projectId}:`, error);
      throw error;
    }
  },

  update: async (projectId: string, projectData: Project) => {
    try {
      // Make sure we're sending the correct data format to the backend
      const formattedData = {
        id: parseInt(projectId),
        name: projectData.name,
        clientName: projectData.clientName,
        projectNo: projectData.projectNo,
        typeOfClient: projectData.typeOfClient,
        projectManagerId: projectData.projectManagerId,
        seniorProjectManagerId: projectData.seniorProjectManagerId,
        regionalManagerId: projectData.regionalManagerId,
        office: projectData.office || '',  // Ensure office is never null
        region: projectData.region || '',   // Ensure region is never null
        typeOfJob: projectData.typeOfJob || '',  // Ensure typeOfJob is never null
        sector: projectData.sector,
        feeType: projectData.feeType || '',  // Ensure feeType is never null
        estimatedCost: Number(projectData.estimatedCost),
        budget: Number(projectData.budget || 0),  // Ensure budget is never null
        priority: projectData.priority || '',  // Ensure priority is never null
        currency: projectData.currency,
        startDate: projectData.startDate,
        endDate: projectData.endDate,
        status: projectData.status,
        letterOfAcceptance: projectData.letterOfAcceptance,
        opportunityTrackingId: projectData.opportunityTrackingId,
        details: projectData.details,
        fundingStream: projectData.fundingStream
      };

      // Log the problematic fields
      console.log('Sending update data with specific focus on:');
      console.log('Office:', formattedData.office);
      console.log('TypeOfJob:', formattedData.typeOfJob);
      console.log('Budget:', formattedData.budget);
      console.log('Priority:', formattedData.priority);

      const response = await axiosInstance.put(`api/Project/${projectId}`, formattedData);
      return response.data;
    } catch (error) {
      console.error(`Error updating project ${projectId}:`, error);
      throw error;
    }
  },

  delete: async (projectId: string) => {
    try {
      console.log(`Deleting project with ID: ${projectId}`);
      const response = await axiosInstance.delete(`api/Project/${projectId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting project ${projectId}:`, error);
      throw error;
    }
  }
};
