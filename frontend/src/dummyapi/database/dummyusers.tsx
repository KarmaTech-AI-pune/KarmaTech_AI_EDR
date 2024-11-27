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
    "name": "John Doe",
    "username": "PM1",
    "password": "password",
    "role": UserRole.ProjectManager
  },
  "3" : {
    "name": "Jane Smith",
    "username": "PM2",
    "password": "password",
    "role": UserRole.ProjectManager
  },
  "4" : {
    "name": "Mike Johnson",
    "username": "SPM1", 
    "password": "password",
    "role": UserRole.SeniorProjectManager
  },
  "5" : {
    "name": "Emily Davis",
    "username": "SPM2",
    "password": "password", 
    "role": UserRole.SeniorProjectManager
  },
  "6" : {
    "name": "David Wilson",
    "username": "RM1",
    "password": "password",
    "role": UserRole.RegionalManager
  },
  "7" : {
    "name": "Sarah Thompson",
    "username": "RM2",
    "password": "password",
    "role": UserRole.RegionalManager  
  },
  "8" : {
    "name": "Chris Lee",
    "username": "BDM1",
    "password": "password",
    "role": UserRole.BusinessDevelopmentManager
  },
  "9" : {
    "name": "Lisa Chen",
    "username": "BDM2",
    "password": "password",
    "role": UserRole.BusinessDevelopmentManager
  },
  "10" : {
    "name": "Mark Taylor",
    "username": "SME1",
    "password": "password",
    "role": UserRole.SubjectMatterExpert
  },
  "11" : {
    "name": "Jennifer Harris",  
    "username": "SME2",
    "password": "password",
    "role": UserRole.SubjectMatterExpert
  },
  "12" : {
    "name": "Barry Thompson",
    "username": "RM3",
    "password": "password",
    "role": UserRole.RegionalManager  
  },
  "15" : {
    "name": "Michael Brown",
    "username": "RD1",
    "password": "password",
    "role": UserRole.RegionalDirector
  },
  "16" : {
    "name": "Susan White",
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
