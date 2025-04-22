import { AuthUser } from '../models/userModel';
import { axiosInstance } from './axiosConfig';

interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: AuthUser;
}

export const login = async (username: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await axiosInstance.post('/api/user/login', {
      username,
      password
    });
    return response.data;
  } catch (error) {
    console.error('Error during login:', error);
    throw error;
  }
};

export const getRoles = async (): Promise<string[]> => {
  try {
    const response = await axiosInstance.get('/api/user/roles');
    return response.data;
  } catch (error) {
    console.error('Error fetching roles:', error);
    throw error;
  }
};

export const getUsersByRole = async (roleName: string): Promise<AuthUser[]> => {
  try {
    const response = await axiosInstance.get(`/api/user/by-role/${roleName}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching users with role ${roleName}:`, error);
    throw error;
  }
};

export const getPermissions = async (): Promise<string[]> => {
  try {
    const response = await axiosInstance.get('/api/user/permissions');
    return response.data;
  } catch (error) {
    console.error('Error fetching permissions:', error);
    throw error;
  }
};


export const getAllUsers = async (): Promise<AuthUser[]> => {
  try {
    const response = await axiosInstance.get('/api/user');
    console.log(response.data)
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
    // Convert Role[] to RoleDto[]
    const roles = user.roles;
    
    const createUserData = {
      userName: user.userName,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      roles: roles,
      IsConsultant: user.isConsultant,
      StandardRate: user.standardRate
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
    const roles = user.roles || [];
    
    const updateUserData = {
      id,
      userName: user.userName,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      roles: roles,
      isConsultant: false,
      standardRate: 0
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
