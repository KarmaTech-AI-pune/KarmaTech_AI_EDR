import { axiosInstance } from '../services/axiosConfig';
import { ChangeControl } from '../models';

const API_URL = '/api/projects';

// Create a new change control
export const createChangeControl = async (projectId: string | number, changeControl: Omit<ChangeControl, 'id'>): Promise<ChangeControl> => {
  try {
    // Convert projectId to number if it's a string
    const projectIdNum = typeof projectId === 'string' ? parseInt(projectId) : projectId;

    // Ensure required fields are present
    if (!changeControl.originator) {
      throw new Error("Originator is required");
    }
    if (!changeControl.description) {
      throw new Error("Description is required");
    }
    if (!changeControl.dateLogged) {
      throw new Error("Date Logged is required");
    }

    // Format data for backend
    const formattedData = {
      projectId: projectIdNum,
      srNo: changeControl.srNo || 1,
      dateLogged: new Date(changeControl.dateLogged).toISOString(),
      originator: changeControl.originator || "",
      description: changeControl.description || "",
      costImpact: changeControl.costImpact || "",
      timeImpact: changeControl.timeImpact || "",
      resourcesImpact: changeControl.resourcesImpact || "",
      qualityImpact: changeControl.qualityImpact || "",
      changeOrderStatus: changeControl.changeOrderStatus || "",
      clientApprovalStatus: changeControl.clientApprovalStatus || "",
      claimSituation: changeControl.claimSituation || ""
      // CreatedBy and UpdatedBy will be set automatically in the backend
    };

    // Log the exact data being sent
    console.log(`Creating change control for project ID: ${projectIdNum}`, JSON.stringify(formattedData, null, 2));

    // Make the API call
    const response = await axiosInstance.post(`${API_URL}/${projectIdNum}/changecontrols`, formattedData);
    return response.data;
  } catch (error) {
    console.error('Error creating change control:', error);
    throw error;
  }
};

// Get all change controls for a project
export const getChangeControlsByProjectId = async (projectId: string | number): Promise<ChangeControl[]> => {
  try {
    // Convert projectId to number if it's a string
    const projectIdNum = typeof projectId === 'string' ? parseInt(projectId) : projectId;

    console.log(`Fetching change controls for project ID: ${projectIdNum}`);
    const response = await axiosInstance.get(`${API_URL}/${projectIdNum}/changecontrols`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching change controls for project ${projectId}:`, error);
    throw error;
  }
};

// Get a specific change control
export const getChangeControlById = async (projectId: string | number, id: string | number): Promise<ChangeControl> => {
  try {
    // Convert projectId and id to numbers if they're strings
    const projectIdNum = typeof projectId === 'string' ? parseInt(projectId) : projectId;
    const idNum = typeof id === 'string' ? parseInt(id) : id;

    console.log(`Fetching change control with ID: ${idNum} for project: ${projectIdNum}`);
    const response = await axiosInstance.get(`${API_URL}/${projectIdNum}/changecontrols/${idNum}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching change control ${id}:`, error);
    throw error;
  }
};

// Update a change control
export const updateChangeControl = async (projectId: string | number, id: string | number, changeControl: Partial<ChangeControl>): Promise<ChangeControl> => {
  try {
    // Convert projectId and id to numbers if they're strings
    const projectIdNum = typeof projectId === 'string' ? parseInt(projectId) : projectId;
    const idNum = typeof id === 'string' ? parseInt(id) : id;

    // Ensure required fields are present
    if (!changeControl.originator) {
      throw new Error("Originator is required");
    }
    if (!changeControl.description) {
      throw new Error("Description is required");
    }
    if (!changeControl.dateLogged) {
      throw new Error("Date Logged is required");
    }

    // Format data for backend
    const formattedData = {
      id: idNum,
      projectId: projectIdNum,
      srNo: changeControl.srNo,
      dateLogged: new Date(changeControl.dateLogged).toISOString(),
      originator: changeControl.originator || "",
      description: changeControl.description || "",
      costImpact: changeControl.costImpact || "",
      timeImpact: changeControl.timeImpact || "",
      resourcesImpact: changeControl.resourcesImpact || "",
      qualityImpact: changeControl.qualityImpact || "",
      changeOrderStatus: changeControl.changeOrderStatus || "",
      clientApprovalStatus: changeControl.clientApprovalStatus || "",
      claimSituation: changeControl.claimSituation || ""
      // UpdatedBy will be set automatically in the backend
    };

    console.log(`Updating change control with ID: ${idNum} for project: ${projectIdNum}`, JSON.stringify(formattedData, null, 2));
    const response = await axiosInstance.put(`${API_URL}/${projectIdNum}/changecontrols/${idNum}`, formattedData);
    return response.data;
  } catch (error) {
    console.error(`Error updating change control ${id}:`, error);
    throw error;
  }
};

// Delete a change control
export const deleteChangeControl = async (projectId: string | number, id: string | number): Promise<void> => {
  try {
    // Convert projectId and id to numbers if they're strings
    const projectIdNum = typeof projectId === 'string' ? parseInt(projectId) : projectId;
    const idNum = typeof id === 'string' ? parseInt(id) : id;

    console.log(`Deleting change control with ID: ${idNum} for project: ${projectIdNum}`);
    await axiosInstance.delete(`${API_URL}/${projectIdNum}/changecontrols/${idNum}`);
  } catch (error) {
    console.error(`Error deleting change control ${id}:`, error);
    throw error;
  }
};
