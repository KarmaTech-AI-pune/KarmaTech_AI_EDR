import { Credentials, LoginResponse, UserWithRole } from '../types';
// import { Credentials, LoginResponse } from '../types';
import { Role } from '../models';
import { 
    validateUser, 
} from './usersApi';
import { rolesApi } from './rolesApi';

export const authApi = {
  login: async (credentials: Credentials): Promise<LoginResponse> => {
    try {
      const user = validateUser(credentials.username, credentials.password);
      
      if (user) {
        // Simulate token generation
        const token = `dummy_token_${user.userName}_${Date.now()}`;
        
        // Get role details
        const roleDetails: Role = {
          id: user.roles[0].name,
          name: user.roles[0].name,
          permissions: rolesApi.getRolePermissions(user.roles[0])
        };

        // Create user with role details
        const userWithRole: UserWithRole = {
          id: user.id,
          userName : user.userName,
          name: user.name,
          email: user.email,
          roles: user.roles,
          roleDetails: roleDetails,
          standardRate: user.standardRate,
          isConsultant: user.isConsultant,
          createdAt: user.createdAt,
          avatar: user.avatar
        };

        // Store full user information in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userWithRole));
        
        return {
          success: true,
          user: userWithRole,
          token: token,
          message: 'Login successful'
        };
      }
      
      return {
        success: false,
        message: 'Invalid username or password'
      };
    } catch {
      return {
        success: false,
        message: 'An error occurred during login'
      };
    }
  },

  logout: async (): Promise<void> => {
    try {
      // Remove token and user information
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  checkAuth: async (): Promise<boolean> => {
    // Check if both token and user exist
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  },

  getCurrentUser: async (): Promise<UserWithRole | null> => {
    try {
      // Retrieve user from localStorage
      const storedUser = localStorage.getItem('user');
      
      if (storedUser) {
        return JSON.parse(storedUser);
      }

      return null;
    } catch {
      return null;
    }
  }
};
