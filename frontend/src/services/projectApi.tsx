import { axiosInstance } from './axiosConfig';
import { ProjectFormData } from '../types/index.tsx';
import { Project } from '../models';

export const projectApi = {
  createProject: async (projectData: ProjectFormData) => {
    try {
      const formattedData = {
        ...projectData,
        projectNo: parseInt(projectData.projectNo, 10),
        estimatedProjectCost: Number(projectData.estimatedProjectCost),
        estimatedProjectFee: Number(projectData.estimatedProjectFee || 0),
        percentage: Number(projectData.percentage || 0),
        startDate: projectData.startDate ? new Date(projectData.startDate).toISOString() : null,
        endDate: projectData.endDate ? new Date(projectData.endDate).toISOString() : null,
        opportunityTrackingId: projectData.opportunityTrackingId || 0,
        programId: projectData.programId || 0, // Ensure programId is included
      };
      const response = await axiosInstance.post(`api/Project`, formattedData);
      return response.data;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  },

  getAll: async (programId: number) => {
    try {
      const response = await axiosInstance.get(`api/Project?programId=${programId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting all projects:', error);
      throw error;
    }
  },

  getByUserId: async (userId:string) => {
    try {
      const response = await axiosInstance.get(`api/Project/getByUserId/${userId}`);
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

  update: async (projectId: string, projectData: Project, budgetReason?: string) => {
    try {
      // Make sure we're sending the correct data format to the backend
      const formattedData = {
        id: parseInt(projectId),
        name: projectData.name,
        details: projectData.details || '',
        clientName: projectData.clientName,
        projectNo: parseInt(projectData.projectNo), // Convert to integer as backend expects int
        typeOfClient: projectData.typeOfClient || '',
        projectManagerId: projectData.projectManagerId,
        seniorProjectManagerId: projectData.seniorProjectManagerId || '',
        regionalManagerId: projectData.regionalManagerId,
        office: projectData.office || '',  // Ensure office is never null
        region: projectData.region || '',   // Ensure region is never null
        typeOfJob: projectData.typeOfJob || '',  // Ensure typeOfJob is never null
        sector: projectData.sector || '',
        feeType: projectData.feeType || '',  // Ensure feeType is never null
        estimatedProjectCost: Number(projectData.estimatedProjectCost),
        estimatedProjectFee: Number(projectData.estimatedProjectFee || 0),  // Ensure budget is never null
        percentage: Number(projectData.percentage || 0),
        priority: projectData.priority || 'Medium',  // Ensure priority is never null
        currency: projectData.currency || 'INR',
        startDate: projectData.startDate ? new Date(projectData.startDate) : null, // Convert to proper date format
        endDate: projectData.endDate ? new Date(projectData.endDate) : null, // Convert to proper date format
        status: projectData.status,
        progress: 0, // Add missing required field
        letterOfAcceptance: projectData.letterOfAcceptance,
        opportunityTrackingId: projectData.opportunityTrackingId || 0, // Ensure it's not null
        programId: projectData.programId || 0, // Ensure programId is included
        // Add missing fields with default values
        createdAt: new Date(),
        lastModifiedAt: new Date(),
        createdBy: projectData.projectManagerId,
        lastModifiedBy: projectData.projectManagerId,
        // Include budget reason if provided
        budgetReason: budgetReason || undefined
      };

      // Log the data being sent
      console.log('Sending update data:', JSON.stringify(formattedData, null, 2));

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
  },

  sendToReview: async(command: any)=>{
    try {
      
    const response = await axiosInstance.post(`api/PMWorkflow/sendtoreview`, command);
      return response.data;
    }
    catch (error) {
      console.error('Error getting all projects:', error);
      throw error;
    }

  }
};