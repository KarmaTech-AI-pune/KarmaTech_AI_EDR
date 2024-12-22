import { Role } from '../models/userModel';
import { axiosInstance } from './axiosConfig';

export const getAllRoles = async (): Promise<Role[]> => {
  try {
    const response = await axiosInstance.get('/api/role');
    return response.data;
  } catch (error) {
    console.error('Error fetching roles:', error);
    throw error;
  }
};

export const getRoleById = async (id: string): Promise<Role> => {
  try {
    const response = await axiosInstance.get(`/api/role/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching role with id ${id}:`, error);
    throw error;
  }
};
