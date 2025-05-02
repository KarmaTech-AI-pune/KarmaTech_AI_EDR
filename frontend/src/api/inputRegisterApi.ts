import { axiosInstance } from '../services/axiosConfig';
import { InputRegisterRow } from '../models/inputRegisterRowModel';

// Helper function to ensure boolean values are properly formatted
const formatBooleanValue = (value: any): boolean => {
  // Convert string 'true'/'false' to actual boolean
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }
  // Ensure it's a boolean
  return Boolean(value);
};

// Create a new input register entry
export const createInputRegister = async (data: Omit<InputRegisterRow, 'id'>): Promise<InputRegisterRow> => {
  try {
    // Create a clean payload with properly formatted values
    const payload = {
      projectId: parseInt(data.projectId),
      dataReceived: data.dataReceived || '',
      receiptDate: data.receiptDate || new Date().toISOString().split('T')[0],
      receivedFrom: data.receivedFrom || '',
      filesFormat: data.filesFormat || '',
      noOfFiles: typeof data.noOfFiles === 'number' ? data.noOfFiles : 0,
      fitForPurpose: formatBooleanValue(data.fitForPurpose),
      check: formatBooleanValue(data.check),
      checkedBy: data.checkedBy || '',
      checkedDate: data.checkedDate || null,
      custodian: data.custodian || '',
      storagePath: data.storagePath || '',
      remarks: data.remarks || '',
      createdBy: 'CurrentUser' // This should be replaced with actual user info
    };

    console.log('Creating input register with payload:', JSON.stringify(payload));
    // The backend will assign the next sequential ID automatically
    const response = await axiosInstance.post(`/api/InputRegister`, payload);

    return {
      ...response.data,
      id: response.data.id.toString(),
      projectId: response.data.projectId.toString()
    };
  } catch (error) {
    console.error('Error creating input register:', error);
    throw error;
  }
};

// Get all input register entries for a specific project
export const getInputRegisterByProject = async (projectId: string): Promise<InputRegisterRow[]> => {
  try {
    const response = await axiosInstance.get(`/api/InputRegister/project/${projectId}`);

    return response.data.map((item: any) => ({
      ...item,
      id: item.id.toString(),
      projectId: item.projectId.toString()
    }));
  } catch (error) {
    console.error('Error fetching input registers for project:', error);
    throw error;
  }
};

// Get a specific input register entry by ID
export const getInputRegisterById = async (id: string): Promise<InputRegisterRow | undefined> => {
  try {
    const response = await axiosInstance.get(`/api/InputRegister/${id}`);

    return {
      ...response.data,
      id: response.data.id.toString(),
      projectId: response.data.projectId.toString()
    };
  } catch (error) {
    console.error('Error fetching input register by ID:', error);
    throw error;
  }
};

// Update an input register entry
export const updateInputRegister = async (id: string, data: Partial<InputRegisterRow>): Promise<InputRegisterRow | undefined> => {
  try {
    // First get the current data to ensure we have complete information
    const currentData = await getInputRegisterById(id);
    if (!currentData) {
      throw new Error(`Input register with ID ${id} not found`);
    }

    // Create a complete payload with properly formatted values
    const payload = {
      id: parseInt(id),
      projectId: parseInt(data.projectId as string || currentData.projectId),
      dataReceived: data.dataReceived || currentData.dataReceived,
      receiptDate: data.receiptDate || currentData.receiptDate,
      receivedFrom: data.receivedFrom || currentData.receivedFrom,
      filesFormat: data.filesFormat || currentData.filesFormat,
      noOfFiles: typeof data.noOfFiles === 'number' ? data.noOfFiles : currentData.noOfFiles,
      fitForPurpose: data.fitForPurpose !== undefined ? formatBooleanValue(data.fitForPurpose) : formatBooleanValue(currentData.fitForPurpose),
      check: data.check !== undefined ? formatBooleanValue(data.check) : formatBooleanValue(currentData.check),
      checkedBy: data.checkedBy !== undefined ? data.checkedBy : currentData.checkedBy,
      checkedDate: data.checkedDate !== undefined ? data.checkedDate : currentData.checkedDate,
      custodian: data.custodian !== undefined ? data.custodian : currentData.custodian,
      storagePath: data.storagePath !== undefined ? data.storagePath : currentData.storagePath,
      remarks: data.remarks !== undefined ? data.remarks : currentData.remarks,
      updatedBy: 'CurrentUser' // This should be replaced with actual user info
    };

    console.log('Updating input register with payload:', JSON.stringify(payload));
    const response = await axiosInstance.put(`/api/InputRegister/${id}`, payload);

    return {
      ...response.data,
      id: response.data.id.toString(),
      projectId: response.data.projectId.toString()
    };
  } catch (error) {
    console.error('Error updating input register:', error);
    throw error;
  }
};

// Delete an input register entry
export const deleteInputRegister = async (id: string): Promise<boolean> => {
  try {
    await axiosInstance.delete(`/api/InputRegister/${id}`);
    return true;
  } catch (error) {
    console.error('Error deleting input register:', error);
    throw error;
  }
};
