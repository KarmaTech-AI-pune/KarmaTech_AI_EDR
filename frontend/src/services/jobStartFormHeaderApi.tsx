import { axiosInstance } from './axiosConfig';

export interface JobStartFormHeaderStatus {
  id: number;
  statusId: number;
  status: string;
}

export interface JobStartFormHeader {
  id: number;
  formId: number;
  projectId: number;
  createdAt: string;
  createdBy: string;
  jobStartFormHistories: JobStartFormHistory[];
}

export interface JobStartFormHistory {
  id: number;
  jobStartFormHeaderId: number;
  statusId: number;
  status: string;
  action: string;
  comments: string;
  actionDate: string;
  actionBy: string;
  assignedToId: string;
}

export const jobStartFormHeaderApi = {
  /**
   * Get the JobStartForm header for a project and form
   * @param projectId The project ID
   * @param formId The form ID
   * @returns Promise with the JobStartForm header
   */
  getJobStartFormHeader: async (projectId: number | string, formId: number | string): Promise<JobStartFormHeader> => {
    try {
      const response = await axiosInstance.get(`/api/projects/${projectId}/jobstartforms/header/${formId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching JobStartForm header for project ${projectId} and form ${formId}:`, error);
      throw new Error(`Failed to load JobStartForm header. Please check if the backend service is running.`);
    }
  },

  /**
   * Get the current status of a JobStartForm header
   * @param projectId The project ID
   * @param formId The form ID
   * @returns Promise with the current status
   */
  getJobStartFormHeaderStatus: async (projectId: number | string, formId: number | string): Promise<JobStartFormHeaderStatus> => {
    try {
      const response = await axiosInstance.get(`/api/projects/${projectId}/jobstartforms/header/${formId}/status`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching JobStartForm header status for project ${projectId} and form ${formId}:`, error);
      throw new Error(`Failed to load JobStartForm header status. Please check if the backend service is running.`);
    }
  },

  /**
   * Get the history of a JobStartForm header
   * @param projectId The project ID
   * @param formId The form ID
   * @returns Promise with the history entries
   */
  getJobStartFormHeaderHistory: async (projectId: number | string, formId: number | string): Promise<JobStartFormHistory[]> => {
    try {
      const response = await axiosInstance.get(`/api/projects/${projectId}/jobstartforms/header/${formId}/history`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching JobStartForm header history for project ${projectId} and form ${formId}:`, error);
      throw new Error(`Failed to load JobStartForm header history. Please check if the backend service is running.`);
    }
  }
};
