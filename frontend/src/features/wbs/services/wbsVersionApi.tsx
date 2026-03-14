import { axiosInstance } from '../../../services/axiosConfig';
import { WBSVersion, WBSVersionDetails } from '../types/wbs';

export const wbsVersionApi = {
  /**
   * Get all WBS versions for a project
   * @param projectId Project ID
   * @returns Promise with list of WBS versions
   */
  getWBSVersions: async (projectId: string): Promise<WBSVersion[]> => {
    try {
      const response = await axiosInstance.get(`/api/projects/${projectId}/wbs/versions`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching WBS versions for project ${projectId}:`, error);
      throw error;
    }
  },

  /**
   * Get the latest WBS version for a project
   * @param projectId Project ID
   * @returns Promise with latest WBS version details
   */
  getLatestWBSVersion: async (projectId: string): Promise<WBSVersionDetails> => {
    try {
      const response = await axiosInstance.get(`/api/projects/${projectId}/wbs/versions/latest`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching latest WBS version for project ${projectId}:`, error);
      throw error;
    }
  },

  /**
   * Get a specific WBS version details
   * @param projectId Project ID
   * @param version Version number string
   * @returns Promise with WBS version details
   */
  getWBSVersion: async (projectId: string, version: string): Promise<WBSVersionDetails> => {
    try {
      const response = await axiosInstance.get(`/api/projects/${projectId}/wbs/versions/${version}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching WBS version ${version} for project ${projectId}:`, error);
      throw error;
    }
  },

  /**
   * Activate a specific WBS version
   * @param projectId Project ID
   * @param version Version number string
   * @returns Promise
   */
  activateWBSVersion: async (projectId: string, version: string): Promise<void> => {
    try {
      await axiosInstance.post(`/api/projects/${projectId}/wbs/versions/${version}/activate`);
    } catch (error) {
      console.error(`Error activating WBS version ${version} for project ${projectId}:`, error);
      throw error;
    }
  }
};
