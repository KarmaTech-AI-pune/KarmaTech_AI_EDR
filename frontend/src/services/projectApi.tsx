import { axiosInstance } from './axiosConfig';
import { Project } from '../models';

// Use Project type directly for form data (excluding id)
import { ProjectFormData } from '../types';

export const projectApi = {
  createProject: async (projectData: ProjectFormData) => {
    try {
      // Helper function to convert DD-MM-YYYY to ISO format
      const convertToISO = (dateStr: string | null | undefined): string | null => {
        if (!dateStr) return null;
        
        // If it's DD-MM-YYYY format, convert to YYYY-MM-DD first
        if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
          const [day, month, year] = dateStr.split('-');
          dateStr = `${year}-${month}-${day}`;
        }
        
        // Now convert to ISO format
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
          return null;
        }
        return date.toISOString();
      };

      const formattedData = {
        ...projectData,
        projectNo: parseInt(projectData.projectNo, 10),
        estimatedProjectCost: Number(projectData.estimatedProjectCost),
        estimatedProjectFee: Number(projectData.estimatedProjectFee || 0),
        percentage: Number((projectData as any).percentage || 0),
        startDate: convertToISO(projectData.startDate as any),
        endDate: convertToISO(projectData.endDate as any),
        opportunityTrackingId: projectData.opportunityTrackingId || 0,
        programId: (projectData as any).programId || 0, // Ensure programId is included
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
      // Helper function to convert DD-MM-YYYY to ISO format
      const convertToISO = (dateStr: string | Date | null | undefined): string | null => {
        if (!dateStr) return null;
        
        // If it's a Date object, convert to ISO
        if (dateStr instanceof Date) {
          if (isNaN(dateStr.getTime())) {
            return null;
          }
          return dateStr.toISOString();
        }
        
        // If it's DD-MM-YYYY format, convert to YYYY-MM-DD first
        if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
          const [day, month, year] = dateStr.split('-');
          dateStr = `${year}-${month}-${day}`;
        }
        
        // Now convert to ISO format
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
          return null;
        }
        return date.toISOString();
      };

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
        priority: projectData.priority || '',  // Ensure priority is never null
        currency: projectData.currency || 'INR',
        startDate: convertToISO(projectData.startDate), // Convert to proper ISO format
        endDate: convertToISO(projectData.endDate), // Convert to proper ISO format
        status: projectData.status,
        progress: 0, // Add missing required field
        letterOfAcceptance: projectData.letterOfAcceptance,
        opportunityTrackingId: projectData.opportunityTrackingId || 0, // Ensure it's not null
        programId: (projectData as any).programId || 0, // Ensure programId is included
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