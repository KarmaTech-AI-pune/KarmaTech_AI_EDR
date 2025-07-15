import { axiosInstance } from './axiosConfig';

// Define TypeScript interfaces for API response
export interface MonthlyHourDto {
  year: number;
  month: string;
  plannedHours: number;
}

export interface ManpowerResourceDto {
  taskId: string;
  taskTitle: string;
  employeeId: string;
  employeeName: string;
  roleId: string;
  isConsultant: boolean;
  costRate: number;
  totalHours: number;
  totalCost: number;
  monthlyHours: MonthlyHourDto[];
}

export interface ManpowerResourcesResponse {
  projectId: number;
  resources: ManpowerResourceDto[];
}

import { MonthlyProgressSchemaType } from '../schemas/monthlyProgress/MonthlyProgressSchema';

export type MonthlyReport = MonthlyProgressSchemaType & {
  id: number;
  month: string;
  year: number;
  projectId: number;
};

export const MonthlyProgressAPI = {
  getMonthlyReports: async (projectId: string): Promise<MonthlyReport[]> => {
    try {
      const response = await axiosInstance.get(`/api/projects/${projectId}/monthlyprogress`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching monthly reports for project ${projectId}:`, error);
      throw new Error(`Failed to load monthly reports for project ${projectId}.`);
    }
  },

  getMonthlyReportByYearMonth: async (projectId: string, year: number, month: number): Promise<MonthlyReport> => {
    try {
      const response = await axiosInstance.get(`/api/projects/${projectId}/monthlyprogress/year/${year}/month/${month}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching monthly report for project ${projectId}, year ${year}, month ${month}:`, error);
      throw new Error(`Failed to load monthly report for project ${projectId}, year ${year}, month ${month}.`);
    }
  },
  /**
   * Get manpower resources with monthly hours for a project
   * @param projectId Project ID
   * @returns Promise with manpower resources data
   */
  getManpowerResources: async (projectId: string): Promise<ManpowerResourcesResponse> => {
    try {
      const response = await axiosInstance.get(`/api/projects/${projectId}/WBS/manpowerresources`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching manpower resources for project ${projectId}:`, error);
      throw new Error(`Failed to load manpower resources for project ${projectId}.`);
    }
  },

  /**
   * Submit monthly progress form data
   * @param projectId Project ID
   * @param formData Monthly progress form data
   * @returns Promise with submission result
   */
  submitMonthlyProgress: async (projectId: string, formData: any) => {
    const { year, month, ...data } = formData;
    try {
      const response = await axiosInstance.put(`/api/projects/${projectId}/monthlyprogress/year/${year}/month/${month}`, data);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        const response = await axiosInstance.post(`/api/projects/${projectId}/monthlyprogress`, { ...data, year, month });
        return response.data;
      }
    // Re-throw other errors
    console.error(`Error submitting monthly progress for project ${projectId}:`, error);
    throw new Error(`Failed to submit monthly progress for project ${projectId}.`);
  }
},



  updateMonthlyProgress: async (projectId: string, year: number, month: number, formData: any) => {
    try {
      const response = await axiosInstance.put(`/api/projects/${projectId}/monthlyprogress/year/${year}/month/${month}`, formData);
      return response.data;
    } catch (error) {
      console.error(`Error updating monthly progress for project ${projectId}:`, error);
      throw new Error(`Failed to update monthly progress for project ${projectId}.`);
    }
  },

  deleteMonthlyProgress: async (projectId: string, year: number, month: number) => {
    try {
      const response = await axiosInstance.delete(`/api/projects/${projectId}/monthlyprogress/year/${year}/month/${month}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting monthly progress for project ${projectId}:`, error);
      throw new Error(`Failed to delete monthly progress for project ${projectId}.`);
    }
  }
};
