import { axiosInstance } from './axiosConfig';
import { ProjectFormData } from '../types/index.tsx';
import { Project } from '../models';

export const projectApi = {
  createProject: async (projectData: ProjectFormData, programId?: number) => {
    try {
      if (!programId) {
        throw new Error('programId is required to create a project. Please select a program first.');
      }
      
      const formattedData = {
        ...projectData,
        projectNo: parseInt(projectData.projectNo, 10),
        estimatedProjectCost: Number(projectData.estimatedProjectCost),
        estimatedProjectFee: Number(projectData.estimatedProjectFee || 0),
        percentage: Number(projectData.percentage || 0),
        startDate: projectData.startDate ? new Date(projectData.startDate).toISOString() : null,
        endDate: projectData.endDate ? new Date(projectData.endDate).toISOString() : null,
        opportunityTrackingId: projectData.opportunityTrackingId || 0,
      };
      const response = await axiosInstance.post(`api/Project/${programId}`, formattedData);
      return response.data;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  },

  getAll: async (programId?: number) => {
    try {
      if (programId) {
        const response = await axiosInstance.get(`api/Project/${programId}`);
        return response.data;
      } else {
        // If no programId is provided, get all projects across all programs
        // First, get all programs
        const programsResponse = await axiosInstance.get('/api/Program');
        const programs = programsResponse.data;
        
        // Then get projects for each program
        const allProjects = [];
        for (const program of programs) {
          try {
            const projectsResponse = await axiosInstance.get(`api/Project/${program.id}`);
            allProjects.push(...projectsResponse.data);
          } catch (error) {
            // If a program has no projects, continue with the next one
            console.warn(`No projects found for program ${program.id}:`, error);
          }
        }
        
        return allProjects;
      }
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
 

  getById: async (projectId: string, programId?: number) => {
    try {
      if (programId) {
        const response = await axiosInstance.get(`api/Project/program/${programId}/project/${projectId}`);
        return response.data;
      } else {
        // Fallback: try to get the project without program context
        // This might not work with the current backend, but we'll try the old endpoint
        try {
          const response = await axiosInstance.get(`api/Project/${projectId}`);
          return response.data;
        } catch (fallbackError) {
          throw new Error('programId is required to get project details. Please provide the program context.');
        }
      }
    } catch (error) {
      console.error(`Error getting project ${projectId}:`, error);
      throw error;
    }
  },

  update: async (projectId: string, projectData: Project, programId?: number) => {
    try {
      if (!programId) {
        throw new Error('programId is required to update a project. Please provide the program context.');
      }
      
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
        startDate: projectData.startDate ? new Date(projectData.startDate) : null, // Convert to proper date format
        endDate: projectData.endDate ? new Date(projectData.endDate) : null, // Convert to proper date format
        status: projectData.status,
        progress: 0, // Add missing required field
        letterOfAcceptance: projectData.letterOfAcceptance,
        opportunityTrackingId: projectData.opportunityTrackingId || 0, // Ensure it's not null
        // Add missing fields with default values
        createdAt: new Date(),
        lastModifiedAt: new Date(),
        createdBy: projectData.projectManagerId,
        lastModifiedBy: projectData.projectManagerId
      };

      // Log the data being sent
      console.log('Sending update data:', JSON.stringify(formattedData, null, 2));

      const response = await axiosInstance.put(`api/Project/${programId}/${projectId}`, formattedData);
      return response.data;
    } catch (error) {
      console.error(`Error updating project ${projectId}:`, error);
      throw error;
    }
  },

  delete: async (projectId: string, programId?: number) => {
    try {
      if (!programId) {
        throw new Error('programId is required to delete a project. Please provide the program context.');
      }
      
      console.log(`Deleting project with ID: ${projectId}`);
      const response = await axiosInstance.delete(`api/Project/${programId}/${projectId}`);
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
  // Send the change control for review
      //  await axiosInstance.post(`/api/projects/${projectId}/changecontrols/${changeControlId}/workflow/sendtoreview`, {
        //  entityId: changeControlId,
         // entityType: 'ChangeControl',
         // assignedToId: selectedReviewer,
         // comments: `Sent for review by ${currentUser}`
       // });
};
