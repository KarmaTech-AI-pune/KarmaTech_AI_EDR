import { User } from '../../types';

// Expanded Role enum to include more specific roles
export enum UserRole {
  Admin = 'Admin', //Admin
  ProjectManager = 'Project Manager', //PM
  SeniorProjectManager = 'Senior Project Manager', //SPM
  RegionalManager = 'Regional Manager', //RM
  BusinessDevelopmentManager = 'Business Development Manager', //BDM
  SubjectMatterExpert = 'Subject Matter Expert' //SME
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
    "username": "PM",
    "password": "password",
    "role": UserRole.ProjectManager
  },
  "3" : {
    "username": "SPM",
    "password": "password",
    "role": UserRole.SeniorProjectManager
  },
  "4" : {
    "username": "RM",
    "password": "password",
    "role": UserRole.RegionalManager
  },
  "6" : {
    "username": "BDM",
    "password": "password",
    "role": UserRole.BusinessDevelopmentManager
  },
  "7" : {
    "username": "SME",
    "password": "password",
    "role": UserRole.SubjectMatterExpert
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
