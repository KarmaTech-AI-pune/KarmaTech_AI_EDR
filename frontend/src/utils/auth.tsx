// File: frontend/src/utils/auth.ts
// Purpose: Authentication utility functions
import axios from 'axios';

interface Credentials {
    username: string;
    password: string;
  }
  
  export const login = async (credentials: Credentials): Promise<boolean> => {
    try {
      const response = await axios.post('/api/user/login', credentials);
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
  