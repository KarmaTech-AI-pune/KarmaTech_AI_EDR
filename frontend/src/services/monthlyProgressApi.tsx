import { axiosInstance } from './axiosConfig';

// Define TypeScript interfaces for API response
export interface PlannedHourDto {
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
  plannedHours: PlannedHourDto[];
}

export interface ManpowerResourcesResponse {
  projectId: number;
  resources: ManpowerResourceDto[];
}

export const MonthlyProgressAPI = {
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
    try {
      const response = await axiosInstance.post(`/api/projects/${projectId}/monthlyprogress`, formData);
      return response.data;
    } catch (error) {
      console.error(`Error submitting monthly progress for project ${projectId}:`, error);
      throw new Error(`Failed to submit monthly progress for project ${projectId}.`);
    }
  }
};
