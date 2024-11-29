import { Credentials, LoginResponse, User } from '../types';
import { axiosInstance } from './axiosConfig';

export const authApi = {
  login: async (credentials: Credentials): Promise<LoginResponse> => {
    try {
      const response = await axiosInstance.post('user/login', credentials);
      const { success, token } = response.data;
      
      if (success && token) {
        localStorage.setItem('token', token);
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'An error occurred during login'
      };
    }
  },

  logout: async (): Promise<void> => {
    try {
      await axiosInstance.post('user/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      delete axiosInstance.defaults.headers.common['Authorization'];
    }
  },

  checkAuth: async (): Promise<boolean> => {
    try {
      const response = await axiosInstance.get('user/verify');
      return response.data.valid;
    } catch (error) {
      return false;
    }
  },

  getCurrentUser: async (): Promise<User | null> => {
    try {
      const response = await axiosInstance.get('user/me');
      return response.data.user;
    } catch (error) {
      return null;
    }
  }
};
