import { axiosInstance } from '../services/axiosConfig';
import { BudgetHealth } from '../types/budgetHealth';

const API_URL = '/api/Project';

/**
 * Get budget health status for a project
 * @param projectId - The project ID
 * @returns Promise<BudgetHealth> - Budget health information
 */
export const getBudgetHealth = async (projectId: string | number): Promise<BudgetHealth> => {
  try {
    // Convert projectId to number if it's a string
    const projectIdNum = typeof projectId === 'string' ? parseInt(projectId) : projectId;

    console.log(`Fetching budget health for project ID: ${projectIdNum}`);
    const response = await axiosInstance.get(`${API_URL}/${projectIdNum}/budget/health`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching budget health for project ${projectId}:`, error);
    throw error;
  }
};
