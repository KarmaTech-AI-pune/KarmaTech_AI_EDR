import { AuthUser, UserRole } from "../models";
import { users, } from "./database/dummyusers";
import { axiosInstance } from './axiosConfig';

// Mutable array to store users
let mutableUsers = [...users];

// Create a new user
export const createUser = (userData: Omit<AuthUser, 'id'>): AuthUser => {
  const newId = Math.max(...mutableUsers.map(user => user.id)) + 1;
  const newUser: AuthUser = {
    ...userData,
    id: newId,
  };
  
  // Check if username already exists
  if (mutableUsers.some(user => user.username === userData.username)) {
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


export const getUserById = (id: number): AuthUser | undefined => {
  return mutableUsers.find(user => user.id === id);
};

export const getUserByUsername = (username: string): AuthUser | undefined => {
  return mutableUsers.find(user => user.username === username);
};

export const getUsersByRole = (role: UserRole): AuthUser[] => {
  return mutableUsers.filter(user => user.role === role);
};

// Update user
export const updateUser = (id: string, userData: Partial<AuthUser>): AuthUser => {
  const userIndex = mutableUsers.findIndex(user => user.id === id);
  if (userIndex === -1) {
    throw new Error('User not found');
  }

  // Check if username is being updated and if it already exists
  if (userData.username && 
      userData.username !== mutableUsers[userIndex].username && 
      mutableUsers.some(user => user.username === userData.username)) {
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
export const deleteUser = (id: number): boolean => {
  const initialLength = mutableUsers.length;
  mutableUsers = mutableUsers.filter(user => user.id !== id);
  return mutableUsers.length !== initialLength;
};

// Search users by name or username
export const searchUsers = (query: string): AuthUser[] => {
  const lowercaseQuery = query.toLowerCase();
  return mutableUsers.filter(user => 
    user.name.toLowerCase().includes(lowercaseQuery) || 
    user.username.toLowerCase().includes(lowercaseQuery)
  );
};

// Reset users to original state
export const resetUsers = (): void => {
  mutableUsers = [...users];
};

export const validateUser = (username: string, password: string): AuthUser | null => {
  const user = getUserByUsername(username);
  if (user && user.password === password) {
    return user;
  }
  return null;
};

// User management utilities
export const isAdmin = (user: AuthUser): boolean => {
  return user.role === UserRole.Admin;
};