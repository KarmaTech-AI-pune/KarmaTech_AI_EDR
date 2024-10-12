// File: frontend/src/services/api.ts
// Purpose: API service for making backend requests

import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api'; // TODO: Update with actual API URL

export const getProjects = (): Promise<any> => {
  // TODO: Implement get projects API call
  return Promise.resolve([]);
};

export const createProject = (projectData: any): Promise<any> => {
  // TODO: Implement create project API call
  return Promise.resolve({});
};
