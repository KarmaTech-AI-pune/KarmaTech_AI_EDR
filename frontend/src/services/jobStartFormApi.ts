import { axiosInstance } from '../dummyapi/axiosConfig'; // Use the existing configured Axios instance
import { JobStartFormData } from '../types'; // Assuming a type definition exists or will be created for the detailed form data

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
export const submitJobStartForm = async (projectId: number | string, formData: JobStartFormData): Promise<any> => {
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

    // TODO: Add mapping for other fields if they exist in formData or need to be passed
    // e.g., FormTitle, Description, StartDate, PreparedBy, Selections
    // Example (if these fields were added to JobStartFormData):
    // formTitle: formData.formTitle,
    // description: formData.description,
    // startDate: formData.startDate,
    // preparedBy: formData.preparedBy,
    // selections: formData.selections // Assuming selections are already in the correct DTO format
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
export const getJobStartFormByProjectId = async (projectId: number | string): Promise<JobStartFormData> => {
  try {
    const response = await axiosInstance.get(`${API_URL}/${projectId}/jobstartforms`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching Job Start Forms for project ${projectId}:`, error);
    throw error;
  }
};

export const getJobStartFormById = async (projectId: number | string, formId: number | string): Promise<JobStartFormData> => {
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
export const updateJobStartForm = async (projectId: number | string, formId: number | string, formData: JobStartFormData): Promise<any> => {
  // Transform the nested frontend data structure to the flat DTO expected by the backend
  // This transformation should ideally match the one in submitJobStartForm
  // or be adapted if the update endpoint expects a different structure.
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
    // TODO: Add mapping for other fields if they exist in formData or need to be passed
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

// Add other Job Start Form related API functions here if needed (e.g., fetching data)
