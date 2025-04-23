import axios from 'axios';
import { CheckReviewRow } from '../models';

const API_URL = 'http://localhost:5245/api/checkreview';

// Create a new check review
export const createCheckReview = async (checkReview: Omit<CheckReviewRow, 'id'>): Promise<CheckReviewRow> => {
  try {
    // Convert projectId from string to integer for backend
    const formattedData = {
      ...checkReview,
      projectId: parseInt(checkReview.projectId),
      // Add createdBy field if not present
      createdBy: checkReview.createdBy || 'System'
    };

    console.log('Sending check review data to backend:', formattedData);
    const response = await axios.post(API_URL, formattedData);
    return response.data;
  } catch (error) {
    console.error('Error creating check review:', error);
    throw error;
  }
};

// Read all check reviews for a specific project
export const getCheckReviewsByProject = async (projectId: string): Promise<CheckReviewRow[]> => {
  try {
    // Convert projectId to integer for backend
    const parsedProjectId = parseInt(projectId);
    console.log(`Fetching check reviews for project ID: ${parsedProjectId}`);
    const response = await axios.get(`${API_URL}/project/${parsedProjectId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching check reviews:', error);
    throw error;
  }
};

// Read a specific check review
export const getCheckReview = async (id: string): Promise<CheckReviewRow> => {
  try {
    // Convert id to integer for backend
    const parsedId = parseInt(id);
    console.log(`Fetching check review with ID: ${parsedId}`);
    const response = await axios.get(`${API_URL}/${parsedId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching check review:', error);
    throw error;
  }
};

// Update a check review
export const updateCheckReview = async (id: string, updatedReview: Partial<CheckReviewRow>): Promise<CheckReviewRow> => {
  try {
    // Format data for backend
    const formattedData = {
      id: parseInt(id),
      ...updatedReview,
      // Convert projectId to integer if it exists
      projectId: updatedReview.projectId ? parseInt(updatedReview.projectId) : undefined,
      // Add updatedBy field if not present
      updatedBy: updatedReview.updatedBy || 'System'
    };

    console.log(`Updating check review with ID: ${id}`, formattedData);
    const response = await axios.put(`${API_URL}/${id}`, formattedData);
    return response.data;
  } catch (error) {
    console.error('Error updating check review:', error);
    throw error;
  }
};

// Delete a check review
export const deleteCheckReview = async (id: string): Promise<boolean> => {
  try {
    if (!id && id !== '0') {
      throw new Error('ID is required for deletion');
    }

    // Convert id to integer for backend
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) {
      console.warn(`ID '${id}' could not be parsed as an integer, using original value`);
      // If we can't parse it as an integer, we'll try to use the original string
      // This might happen if we're using activityNo as a fallback

      // Try to find the review by activityNo
      try {
        console.log(`Attempting to find review by activityNo: ${id}`);
        const response = await axios.get(`${API_URL}/by-activity-no/${id}`);
        if (response.data && response.data.id) {
          console.log(`Found review with ID: ${response.data.id} for activityNo: ${id}`);
          const deleteResponse = await axios.delete(`${API_URL}/${response.data.id}`);
          console.log('Delete response:', deleteResponse);
          return true;
        }
      } catch (findError) {
        console.error('Error finding review by activityNo:', findError);
      }

      throw new Error(`Invalid ID format: ${id}`);
    }

    console.log(`Deleting check review with ID: ${parsedId}`);

    // Add more detailed logging
    console.log(`DELETE request to: ${API_URL}/${parsedId}`);

    const response = await axios.delete(`${API_URL}/${parsedId}`);
    console.log('Delete response:', response);
    return true;
  } catch (error: any) {
    console.error('Error deleting check review:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    throw error;
  }
};
