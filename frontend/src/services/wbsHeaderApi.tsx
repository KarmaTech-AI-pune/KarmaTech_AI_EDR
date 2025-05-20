import { axiosInstance } from './axiosConfig';
import { TaskType } from '../types/wbs';

export interface WBSHeaderStatus {
  id: number;
  statusId: number;
  status: string;
}

export interface WBSHeader {
  id: number;
  projectId: number;
  taskType: TaskType;
  createdAt: string;
  createdBy: string;
  wbsHistories: WBSHistory[];
}

export interface WBSHistory {
  id: number;
  wbsTaskMonthlyHourHeaderId: number;
  statusId: number;
  status: string;
  action: string;
  comments: string;
  actionDate: string;
  actionBy: string;
  assignedToId: string;
}

export const wbsHeaderApi = {
  /**
   * Get WBS header for a project and task type
   * @param projectId Project ID
   * @param taskType Task type (Manpower or ODC)
   * @returns Promise with WBS header
   */
  getWBSHeader: async (projectId: number, taskType: TaskType): Promise<WBSHeader> => {
    try {
      const response = await axiosInstance.get(`/api/projects/${projectId}/wbs/header/${taskType}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching WBS header for project ${projectId} and task type ${taskType}:`, error);
      throw error;
    }
  },

  /**
   * Get current status of a WBS header
   * @param projectId Project ID
   * @param taskType Task type (Manpower or ODC)
   * @returns Promise with WBS header status
   */
  getWBSHeaderStatus: async (projectId: number, taskType: TaskType): Promise<WBSHeaderStatus> => {
    try {
      const response = await axiosInstance.get(`/api/projects/${projectId}/wbs/header/${taskType}/status`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching WBS header status for project ${projectId} and task type ${taskType}:`, error);
      throw error;
    }
  }
};
