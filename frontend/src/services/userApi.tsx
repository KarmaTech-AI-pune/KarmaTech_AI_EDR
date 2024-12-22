import { AuthUser } from '../models/userModel';
import { axiosInstance } from './axiosConfig';

interface RoleDto {
  id: string;
  name: string;
}

interface UpdateUserCommand {
  id: string;
  userName: string;
  email: string;
  standardRate: number;
  isConsultant: boolean;
  roles: RoleDto[];
  avatar?: string;
}

interface CreateUserCommand {
  userName: string;
  email: string;
  password: string;
  standardRate: number;
  isConsultant: boolean;
  roles: RoleDto[];
  avatar?: string;
}

export const getAllUsers = async (): Promise<AuthUser[]> => {
  try {
    const response = await axiosInstance.get('/api/User');
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const getUserById = async (id: string): Promise<AuthUser> => {
  try {
    const response = await axiosInstance.get(`/api/User/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user with id ${id}:`, error);
    throw error;
  }
};

export const createUser = async (user: Omit<AuthUser, 'id'>): Promise<AuthUser> => {
  try {
    const command: CreateUserCommand = {
      userName: user.userName,
      email: user.email,
      password: user.password || '',
      standardRate: Number(user.standardRate) || 0,
      isConsultant: user.isConsultant || false,
      roles: user.roles || [],
      avatar: user.avatar
    };
    const response = await axiosInstance.post('/api/User/Create', command);
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const updateUser = async (id: string, user: Partial<AuthUser>): Promise<AuthUser> => {
  try {
    // Map roles to RoleDto format
    const roleDtos: RoleDto[] = user.roles?.map(role => ({
      id: role.id,
      name: role.name
    })) || [];

    const updateCommand: UpdateUserCommand = {
      id: id,
      userName: user.userName || '',
      email: user.email || '',
      standardRate: Number(user.standardRate) || 0,
      isConsultant: user.isConsultant || false,
      roles: roleDtos,
      avatar: user.avatar
    };

    const response = await axiosInstance.put(`/api/User/${id}`, updateCommand);
    return response.data;
  } catch (error) {
    console.error(`Error updating user with id ${id}:`, error);
    throw error;
  }
};

export const deleteUser = async (id: string): Promise<void> => {
  try {
    await axiosInstance.delete(`/api/User/${id}`);
  } catch (error) {
    console.error(`Error deleting user with id ${id}:`, error);
    throw error;
  }
};
