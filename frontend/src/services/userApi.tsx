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

export const getUserById = async (id: string): Promise<AuthUser> => {
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
    // Convert UserRole[] to RoleDto[]
    const roles = user.roles.map(role => ({ name: role }));
    
    const createUserData = {
      userName: user.userName,
      name: user.name,
      email: user.email,
      standardRate: user.standardRate,
      isConsultant: user.isConsultant,
      avatar: user.avatar,
      roles: roles
      // Note: Password is set to "Admin@123" by backend
    };
    
    const response = await axiosInstance.post('/api/user/Create', createUserData);
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const updateUser = async (id: string, user: Partial<AuthUser>): Promise<AuthUser> => {
  try {
    // Convert UserRole[] to RoleDto[]
    const roles = user.roles?.map(role => ({ name: role })) || [];
    
    const updateUserData = {
      id,
      userName: user.userName,
      name: user.name,
      email: user.email,
      standardRate: user.standardRate,
      isConsultant: user.isConsultant,
      avatar: user.avatar,
      roles: roles
    };
    
    const response = await axiosInstance.put(`/api/user/${id}`, updateUserData);
    return response.data;
  } catch (error) {
    console.error(`Error updating user with id ${id}:`, error);
    throw error;
  }
};

export const deleteUser = async (id: string): Promise<void> => {
  try {
    await axiosInstance.delete(`/api/user/${id}`);
  } catch (error) {
    console.error(`Error deleting user with id ${id}:`, error);
  }
};
