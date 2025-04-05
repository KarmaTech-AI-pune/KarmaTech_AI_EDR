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
  try {
    const response = await axiosInstance.post(`${API_URL}/${projectId}/jobstartforms`, formData);
    return response.data;
  } catch (error) {
    console.error('Error submitting Job Start Form:', error);
    // Re-throw the error to be caught by the calling component
    throw error;
  }
};

// Add other Job Start Form related API functions here if needed (e.g., fetching data)
