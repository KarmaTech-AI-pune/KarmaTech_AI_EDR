import { axiosInstance } from '../dummyapi/axiosConfig'; // Use the existing configured Axios instance
import { ServiceTaxData } from '../types'; // Import only what we need

// Simplified interfaces for the JobStartForm component
interface SimpleTimeData {
  totalTimeCost: number;
}

interface SimpleExpensesData {
  totalExpenses: number;
}

// Simplified JobStartFormData for the component
export interface SimpleJobStartFormData {
  formId?: number | string;
  projectId: number | string | undefined;
  time: SimpleTimeData;
  expenses: SimpleExpensesData;
  grandTotal: number;
  projectFees: number;
  serviceTax: ServiceTaxData;
  serviceTaxPercentage?: number; // Added for compatibility with backend
  serviceTaxAmount?: number; // Added for compatibility with backend
  totalProjectFees: number;
  profit: number;
  profitPercentage?: number;
  formTitle?: string;
  description?: string;
  startDate?: string;
  preparedBy?: string;
  selections?: any[];
  resources?: JobStartFormResourceData[];
  status?: string; // Added for workflow status
}

// Interface for JobStartFormResourceData
export interface JobStartFormResourceData {
  wbsTaskId?: number | string | null;
  taskType: number;
  description: string;
  rate: number;
  units: number;
  budgetedCost: number;
  remarks?: string;
  employeeName?: string;
  name?: string;
}

const API_URL = '/api/projects'; // Base URL for projects

/**
 * Submits the Job Start Form data to the backend.
 * IMPORTANT: This sends the detailed frontend data structure.
 * The backend endpoint /api/projects/{projectId}/jobstartforms
 * MUST be updated to accept this structure for the request to succeed.
 *
 * @param projectId The ID of the project.
 * @param formData The detailed Job Start Form data collected from the frontend.
 * @returns A promise that resolves with the response data from the backend.
 */
export const submitJobStartForm = async (projectId: number | string, formData: SimpleJobStartFormData): Promise<any> => {
  // Transform the nested frontend data structure to the flat DTO expected by the backend
  const payload = {
    // Assuming FormId is 0 or not needed for creation, backend generates it
    projectId: Number(projectId), // Ensure projectId is a number
    // Map calculated values from nested structure to flat structure
    totalTimeCost: formData.time.totalTimeCost,
    totalExpenses: formData.expenses.totalExpenses,
    serviceTaxPercentage: formData.serviceTax.percentage,
    serviceTaxAmount: formData.serviceTax.amount,
    grandTotal: formData.grandTotal,
    projectFees: formData.projectFees,
    totalProjectFees: formData.totalProjectFees,
    profit: formData.profit,
    profitPercentage: formData.profitPercentage,
    // Default values for required fields
    formTitle: formData.formTitle || 'Job Start Form',
    description: formData.description || '',
    startDate: formData.startDate || new Date().toISOString(),
    preparedBy: formData.preparedBy || '',
    // Include selections if available
    selections: formData.selections || [],
    // Include resources for Time and Expenses
    resources: formData.resources || []
  };

  try {
    // Send the transformed payload
    const response = await axiosInstance.post(`${API_URL}/${projectId}/jobstartforms`, payload);
    return response.data;
  } catch (error) {
    console.error('Error submitting Job Start Form:', error);
    // Re-throw the error to be caught by the calling component
    throw error;
  }
};

/**
 * Fetches a specific Job Start Form by its ID for a given project.
 *
 * @param projectId The ID of the project.
 * @param formId The ID of the Job Start Form to fetch.
 * @returns A promise that resolves with the Job Start Form data.
 */
export const getJobStartFormByProjectId = async (projectId: number | string): Promise<SimpleJobStartFormData[]> => {
  try {
    const response = await axiosInstance.get(`${API_URL}/${projectId}/jobstartforms`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching Job Start Forms for project ${projectId}:`, error);
    throw error;
  }
};

export const getJobStartFormById = async (projectId: number | string, formId: number | string): Promise<SimpleJobStartFormData> => {
  try {
    const response = await axiosInstance.get(`${API_URL}/${projectId}/jobstartforms/${formId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching Job Start Form with ID ${formId} for project ${projectId}:`, error);
    // Re-throw the error to be caught by the calling component
    throw error;
  }
};

/**
 * Updates an existing Job Start Form data on the backend.
 *
 * @param projectId The ID of the project.
 * @param formId The ID of the Job Start Form to update.
 * @param formData The detailed Job Start Form data collected from the frontend.
 * @returns A promise that resolves with the response data from the backend.
 */
export const updateJobStartForm = async (projectId: number | string, formId: number | string, formData: SimpleJobStartFormData): Promise<any> => {
  // Transform the nested frontend data structure to the flat DTO expected by the backend
  // This transformation should match the one in submitJobStartForm
  const payload = {
    formId: Number(formId), // Include formId for update
    projectId: Number(projectId),
    totalTimeCost: formData.time.totalTimeCost,
    totalExpenses: formData.expenses.totalExpenses,
    serviceTaxPercentage: formData.serviceTax.percentage,
    serviceTaxAmount: formData.serviceTax.amount,
    grandTotal: formData.grandTotal,
    projectFees: formData.projectFees,
    totalProjectFees: formData.totalProjectFees,
    profit: formData.profit,
    profitPercentage: formData.profitPercentage,
    formTitle: formData.formTitle || 'Job Start Form',
    description: formData.description || '',
    startDate: formData.startDate || new Date().toISOString(),
    preparedBy: formData.preparedBy || '',
    selections: formData.selections || [],
    // Include resources for Time and Expenses
    resources: formData.resources || []
  };

  try {
    // Send the transformed payload using PUT
    const response = await axiosInstance.put(`${API_URL}/${projectId}/jobstartforms/${formId}`, payload);
    return response.data;
  } catch (error) {
    console.error(`Error updating Job Start Form with ID ${formId} for project ${projectId}:`, error);
    // Re-throw the error to be caught by the calling component
    throw error;
  }
};

/**
 * Fetches WBS resource data for a specific project to be used in JobStartForm.
 * This data comes from the WBS form and includes resource allocations.
 *
 * @param projectId The ID of the project.
 * @returns A promise that resolves with the WBS resource data.
 */
export const getWBSResourceData = async (projectId: number | string): Promise<any> => {
  try {
    const response = await axiosInstance.get(`${API_URL}/${projectId}/jobstartforms/wbsresources`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching WBS resource data for project ${projectId}:`, error);
    // Re-throw the error to be caught by the calling component
    throw error;
  }
};
