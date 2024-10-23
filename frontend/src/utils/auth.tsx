// File: frontend/src/utils/auth.ts
// Purpose: Authentication utility functions
import axios from 'axios';

interface Credentials {
    username: string;
    password: string;
  }
  const API_BASE_URL = 'http://localhost:5245/api'

  export const login = async (credentials: Credentials): Promise<boolean> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/user/login`, credentials);
      if (response.data.success) {
        // Store token or user info in localStorage if needed
        return true;
      }
      return false;
    }catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Login error:', error.response?.data || error.message);
      } else {
        console.error('Login error:', error);
      }
      return false;
    }
  };
  
  export const logout = (): void => {
    // TODO: Implement logout logic
  };
  
  export const isAuthenticated = (): boolean => {
    // TODO: Implement authentication check
    return false;
  };
  