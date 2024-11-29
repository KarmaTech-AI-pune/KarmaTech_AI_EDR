import { User } from '../../types';

// Expanded Role enum to include more specific roles
export enum UserRole {
  Admin = 'Admin', //Admin
  ProjectManager = 'Project Manager', //PM
  SeniorProjectManager = 'Senior Project Manager', //SPM
  RegionalManager = 'Regional Manager', //RM
  BusinessDevelopmentManager = 'Business Development Manager', //BDM
  RegionalDirector = 'Regional Director',
  SubjectMatterExpert = 'Subject Matter Expert',
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
    "name": "Admin User",
    "username": "admin",
    "password": "password",
    "role": UserRole.Admin
  },
  "2" : {
    "name": "Manasi Bapat",
    "username": "PM1",
    "password": "password",
    "role": UserRole.ProjectManager
  },
  "3" : {
    "name": "Salaiddin Ahemad",
    "username": "PM2",
    "password": "password",
    "role": UserRole.ProjectManager
  },
  "4" : {
    "name": "Vidyadhar Vengurlekar",
    "username": "SPM1", 
    "password": "password",
    "role": UserRole.SeniorProjectManager
  },
  "5" : {
    "name": "Mandar Pimputkar",
    "username": "SPM2",
    "password": "password", 
    "role": UserRole.SeniorProjectManager
  },
  "6" : {
    "name": "Vidyadhar Sontakke",
    "username": "RM1",
    "password": "password",
    "role": UserRole.RegionalManager
  },
  "7" : {
    "name": "Sanjay Ghuleria",
    "username": "RM2",
    "password": "password",
    "role": UserRole.RegionalManager  
  },
  "8" : {
    "name": "Pravin Bhawsar",
    "username": "BDM1",
    "password": "password",
    "role": UserRole.BusinessDevelopmentManager
  },
  "9" : {
    "name": "Rohit Dembi",
    "username": "BDM2",
    "password": "password",
    "role": UserRole.BusinessDevelopmentManager
  },
  "10" : {
    "name": "Nijam Ahemad",
    "username": "SME1",
    "password": "password",
    "role": UserRole.SubjectMatterExpert
  },
  "11" : {
    "name": "Mnjunath Gowda",  
    "username": "SME2",
    "password": "password",
    "role": UserRole.SubjectMatterExpert
  },
  "12" : {
    "name": "Pradipto Sarkar",
    "username": "RM3",
    "password": "password",
    "role": UserRole.RegionalManager  
  },
  "15" : {
    "name": "Yogeshwar Gokhale",
    "username": "RD1",
    "password": "password",
    "role": UserRole.RegionalDirector
  },
  "16" : {
    "name": "Vidyadhar Sontakke",
    "username": "RD2",
    "password": "password",
    "role": UserRole.RegionalDirector
  }
} as const;

// Transform into typed array
export const users: AuthUser[] = Object.entries(usersRawData).map(([id, user]) => ({
  id: Number(id),
  name: user.name,
  email: `${user.username}@example.com`,
  username: user.username,
  password: user.password,
  role: user.role,
  createdAt: new Date().toISOString(),
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
