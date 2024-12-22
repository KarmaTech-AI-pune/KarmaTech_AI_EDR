import { AuthUser } from '../models/userModel';
import { axiosInstance } from './axiosConfig';

export const getAllUsers = async (): Promise<AuthUser[]> => {
  try {
    const response = await axiosInstance.get('/api/user');
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const getUserById = async (id: number): Promise<AuthUser> => {
  try {
    const response = await axiosInstance.get(`/api/user/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user with id ${id}:`, error);
    throw error;
  }
};

export const createUser = async (user: Omit<AuthUser, 'id'>): Promise<AuthUser> => {
  try {
    const response = await axiosInstance.post('/api/user', user);
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const updateUser = async (id: number, user: Partial<AuthUser>): Promise<AuthUser> => {
  try {
    const response = await axiosInstance.put(`/api/user/${id}`, user);
    return response.data;
  } catch (error) {
    console.error(`Error updating user with id ${id}:`, error);
    throw error;
  }
};

export const deleteUser = async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/api/user/${id}`);
  } catch (error) {
    console.error(`Error deleting user with id ${id}:`, error);
    throw error;
  }
};
