/**
 * Project Budget API Service
 * 
 * API service layer for project budget change tracking operations.
 * Handles all HTTP requests related to budget updates and history retrieval.
 */

import { axiosInstance } from './axiosConfig';
import {
  ProjectBudgetChangeHistory,
  UpdateProjectBudgetRequest,
  ProjectBudgetUpdateResult,
  ProjectBudgetChangeHistoryListResponse,
  GetBudgetHistoryParams,
  BudgetVarianceSummary,
} from '../types/projectBudget';

/**
 * API error response structure
 */
interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
  statusCode?: number;
}

/**
 * Project Budget API service
 */
export const projectBudgetApi = {
  /**
   * Update project budget fields
   * Creates history records automatically for changed fields
   * 
   * @param projectId - The ID of the project to update
   * @param request - Budget update request with new values and optional reason
   * @returns Promise with update result including created history records
   * @throws Error if update fails or validation errors occur
   */
  updateBudget: async (
    projectId: number,
    request: UpdateProjectBudgetRequest
  ): Promise<ProjectBudgetUpdateResult> => {
    try {
      console.log(`Updating budget for project ${projectId}:`, request);
      
      const response = await axiosInstance.put<ProjectBudgetUpdateResult>(
        `/api/projects/${projectId}/budget`,
        request
      );
      
      console.log('Budget update successful:', response.data);
      return response.data;
    } catch (error: any) {
      console.error(`Error updating budget for project ${projectId}:`, error);
      
      // Handle validation errors
      if (error.response?.status === 400 || error.response?.status === 422) {
        const errorData: ApiErrorResponse = error.response.data;
        throw new Error(errorData.message || 'Validation failed');
      }
      
      // Handle not found errors
      if (error.response?.status === 404) {
        throw new Error(`Project ${projectId} not found`);
      }
      
      // Handle unauthorized errors
      if (error.response?.status === 401) {
        throw new Error('Unauthorized. Please log in again.');
      }
      
      // Handle forbidden errors
      if (error.response?.status === 403) {
        throw new Error('You do not have permission to update project budgets');
      }
      
      // Generic error
      throw new Error(
        error.response?.data?.message || 
        'Failed to update project budget. Please try again.'
      );
    }
  },

  /**
   * Get budget change history for a project
   * 
   * @param params - Query parameters including projectId and optional filters
   * @returns Promise with array of budget change history records
   * @throws Error if retrieval fails
   */
  getBudgetHistory: async (
    params: GetBudgetHistoryParams
  ): Promise<ProjectBudgetChangeHistory[]> => {
    try {
      const { projectId, fieldName, pageNumber, pageSize } = params;
      
      console.log(`Fetching budget history for project ${projectId}`, params);
      
      // Build query parameters
      const queryParams = new URLSearchParams();
      if (fieldName) {
        queryParams.append('fieldName', fieldName);
      }
      if (pageNumber !== undefined) {
        queryParams.append('pageNumber', pageNumber.toString());
      }
      if (pageSize !== undefined) {
        queryParams.append('pageSize', pageSize.toString());
      }
      
      const queryString = queryParams.toString();
      const url = `/api/projects/${projectId}/budget/history${queryString ? `?${queryString}` : ''}`;
      
      const response = await axiosInstance.get<ProjectBudgetChangeHistoryListResponse>(url);
      
      console.log('Budget history retrieved successfully:', response.data);
      
      // Handle both wrapped and unwrapped responses
      if (response.data.success !== undefined) {
        return response.data.data || [];
      }
      
      // If response is directly an array
      return Array.isArray(response.data) ? response.data : [];
    } catch (error: any) {
      console.error(`Error fetching budget history for project ${params.projectId}:`, error);
      
      // Handle not found errors
      if (error.response?.status === 404) {
        throw new Error(`Project ${params.projectId} not found`);
      }
      
      // Handle unauthorized errors
      if (error.response?.status === 401) {
        throw new Error('Unauthorized. Please log in again.');
      }
      
      // Generic error
      throw new Error(
        error.response?.data?.message || 
        'Failed to fetch budget history. Please try again.'
      );
    }
  },

  /**
   * Get budget variance summary for a project
   * Provides aggregated statistics about budget changes
   * 
   * @param projectId - The ID of the project
   * @returns Promise with budget variance summary
   * @throws Error if retrieval fails
   */
  getBudgetVarianceSummary: async (
    projectId: number
  ): Promise<BudgetVarianceSummary> => {
    try {
      console.log(`Fetching budget variance summary for project ${projectId}`);
      
      const response = await axiosInstance.get<{ success: boolean; data: BudgetVarianceSummary }>(
        `/api/projects/${projectId}/budget/variance-summary`
      );
      
      console.log('Budget variance summary retrieved successfully:', response.data);
      
      // Handle both wrapped and unwrapped responses
      if (response.data.success !== undefined) {
        return response.data.data;
      }
      
      return response.data as unknown as BudgetVarianceSummary;
    } catch (error: any) {
      console.error(`Error fetching budget variance summary for project ${projectId}:`, error);
      
      // Handle not found errors
      if (error.response?.status === 404) {
        throw new Error(`Project ${projectId} not found`);
      }
      
      // Handle unauthorized errors
      if (error.response?.status === 401) {
        throw new Error('Unauthorized. Please log in again.');
      }
      
      // Generic error
      throw new Error(
        error.response?.data?.message || 
        'Failed to fetch budget variance summary. Please try again.'
      );
    }
  },

  /**
   * Get the latest budget change for a project
   * Useful for displaying the most recent change
   * 
   * @param projectId - The ID of the project
   * @returns Promise with the latest budget change history record or null
   * @throws Error if retrieval fails
   */
  getLatestBudgetChange: async (
    projectId: number
  ): Promise<ProjectBudgetChangeHistory | null> => {
    try {
      console.log(`Fetching latest budget change for project ${projectId}`);
      
      const history = await projectBudgetApi.getBudgetHistory({
        projectId,
        pageNumber: 1,
        pageSize: 1,
      });
      
      return history.length > 0 ? history[0] : null;
    } catch (error: any) {
      console.error(`Error fetching latest budget change for project ${projectId}:`, error);
      throw error;
    }
  },

  /**
   * Get budget changes filtered by field name
   * 
   * @param projectId - The ID of the project
   * @param fieldName - The field to filter by (EstimatedProjectCost or EstimatedProjectFee)
   * @returns Promise with filtered budget change history records
   * @throws Error if retrieval fails
   */
  getBudgetChangesByField: async (
    projectId: number,
    fieldName: 'EstimatedProjectCost' | 'EstimatedProjectFee'
  ): Promise<ProjectBudgetChangeHistory[]> => {
    try {
      console.log(`Fetching ${fieldName} changes for project ${projectId}`);
      
      return await projectBudgetApi.getBudgetHistory({
        projectId,
        fieldName,
      });
    } catch (error: any) {
      console.error(`Error fetching ${fieldName} changes for project ${projectId}:`, error);
      throw error;
    }
  },
};

/**
 * Export individual functions for convenience
 */
export const {
  updateBudget,
  getBudgetHistory,
  getBudgetVarianceSummary,
  getLatestBudgetChange,
  getBudgetChangesByField,
} = projectBudgetApi;

export default projectBudgetApi;
