import { User } from '../../types';

// Expanded Role enum to include more specific roles
export enum UserRole {
  Admin = 'Admin',
  ProjectManager = 'Project Manager', //Project Management
  ProjectCoordinator = 'Project Coordinator', //Project Management
  Director = 'Director', //All
  RegionalDirector = 'Regional Director', //All
  ManagingDirector = 'Managing Director', //All
  BusinessDevelopmentManager = 'Business Development Manager', //BD
  SalesProfessional = 'Sales Professional' //BD
}

// Extend the User type to include auth-related fields
export interface AuthUser extends User {
  username: string;
  password: string; // Note: In a real app, passwords should be hashed
  role: UserRole;
}

// Raw users data
const usersRawData = {
  "1" : {
    "username": "admin",
    "password": "password",
    "role": UserRole.Admin
  },
  "2" : {
    "username": "projectmanager",
    "password": "password",
    "role": UserRole.ProjectManager
  },
  "3" : {
    "username": "projectcoordinator",
    "password": "password",
    "role": UserRole.ProjectCoordinator 
  },
  "4" : {
    "username": "director",
    "password": "password",
    "role": UserRole.Director
  },
  "5" : {
    "username": "regionaldirector",
    "password": "password",
    "role": UserRole.RegionalDirector
  },
  "6" : {
    "username": "managingdirector",
    "password": "password",
    "role": UserRole.ManagingDirector 
  },
  "7" : {
    "username": "businessdevelopmentmanager",
    "password": "password",
    "role": UserRole.BusinessDevelopmentManager
  },
  "8" : {
    "username": "salesprofessional",
    "password": "password",
    "role": UserRole.SalesProfessional
  },
} as const;

// Transform into typed array
export const users: AuthUser[] = Object.values(usersRawData).map(user => ({
  id: 1, // Adding required User fields
  name: 'Admin User',
  email: 'admin@example.com',
  username: user.username,
  password: user.password,
  role: user.role,
  createdAt: new Date().toISOString(), // Adding additional fields
  lastLogin: null
}));

// Utility functions
export const getUserByUsername = (username: string): AuthUser | undefined => {
  return users.find(user => user.username === username);
};

export const getUserById = (id: number): AuthUser | undefined => {
  return users.find(user => user.id === id);
};

export const getUsersByRole = (role: UserRole): AuthUser[] => {
  return users.filter(user => user.role === role);
};

// Authentication utility
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
