import { AuthUser, UserRole } from "../models";
import { users, } from "./database/dummyusers";
import { axiosInstance } from './axiosConfig';

// Mutable array to store users
let mutableUsers = [...users];

// Generate a random string ID
const generateId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const length = 10;
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Create a new user
export const createUser = (userData: Omit<AuthUser, 'id'>): AuthUser => {
  const newId = generateId();
  const newUser: AuthUser = {
    ...userData,
    id: newId,
  };
  
  // Check if userName already exists
  if (mutableUsers.some(user => user.userName === userData.userName)) {
    throw new Error('Username already exists');
  }

  mutableUsers.push(newUser);
  return newUser;
};

// Read operations
export const getAllUsers = async (): Promise<AuthUser[]> => {
  try {
    const response = await axiosInstance.get('/user');
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const getUserById = (id: string): AuthUser | undefined => {
  return mutableUsers.find(user => user.id === id);
};

export const getUserByUsername = (userName: string): AuthUser | undefined => {
  return mutableUsers.find(user => user.userName === userName);
};

export const getUsersByRole = (role: UserRole): AuthUser[] => {
  return mutableUsers.filter(user => user.roles.some(r => r.name === role));
};

// Update user
export const updateUser = (id: string, userData: Partial<AuthUser>): AuthUser => {
  const userIndex = mutableUsers.findIndex(user => user.id === id);
  if (userIndex === -1) {
    throw new Error('User not found');
  }

  // Check if userName is being updated and if it already exists
  if (userData.userName && 
      userData.userName !== mutableUsers[userIndex].userName && 
      mutableUsers.some(user => user.userName === userData.userName)) {
    throw new Error('Username already exists');
  }

  const updatedUser = {
    ...mutableUsers[userIndex],
    ...userData,
    id: mutableUsers[userIndex].id, // Ensure ID cannot be changed
  };

  mutableUsers[userIndex] = updatedUser;
  return updatedUser;
};

// Delete user
export const deleteUser = (id: string): boolean => {
  const initialLength = mutableUsers.length;
  mutableUsers = mutableUsers.filter(user => user.id !== id);
  return mutableUsers.length !== initialLength;
};

// Search users by name or userName
export const searchUsers = (query: string): AuthUser[] => {
  const lowercaseQuery = query.toLowerCase();
  return mutableUsers.filter(user => 
    user.name.toLowerCase().includes(lowercaseQuery) || 
    user.userName.toLowerCase().includes(lowercaseQuery)
  );
};

// Reset users to original state
export const resetUsers = (): void => {
  mutableUsers = [...users];
};

export const validateUser = (userName: string, password: string): AuthUser | null => {
  const user = getUserByUsername(userName);
  if (user && user.password === password) {
    return user;
  }
  return null;
};

// User management utilities
export const isAdmin = (user: AuthUser): boolean => {
  return user.roles.some(role => role.name === UserRole.Admin);
};
