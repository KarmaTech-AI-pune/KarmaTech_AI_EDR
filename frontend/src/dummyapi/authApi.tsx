import { Credentials, LoginResponse, UserWithRole, Role } from '../types';
import { validateUser } from './usersApi';

export const authApi = {
  login: async (credentials: Credentials): Promise<LoginResponse> => {
    try {
      const user = validateUser(credentials.username, credentials.password);
      
      if (!user) {
        return {
          success: false,
          message: 'Invalid username or password'
        };
      }

      if (!user.roles || user.roles.length === 0) {
        return {
          success: false,
          message: 'User has no assigned roles'
        };
      }

      // Generate token
      const token = `dummy_token_${user.userName}_${Date.now()}`;

      // Map user role to include required permissions
      const roleWithPermissions: Role = {
        id: user.roles[0].id,
        name: user.roles[0].name,
        permissions: [] // Since this is a dummy API, we'll use an empty array for permissions
      };

      // Create user with role details
      const userWithRole: UserWithRole = {
        id: user.id,
        name: user.name,
        email: user.email,
        userName: user.userName,
        roles: user.roles,
        roleDetails: roleWithPermissions,
        standardRate: user.standardRate,
        isConsultant: user.isConsultant
      };

      try {
        // Store user information in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userWithRole));
      } catch (storageError) {
        console.error('Storage error:', storageError);
        return {
          success: false,
          message: 'Failed to store session data'
        };
      }

      return {
        success: true,
        user: userWithRole,
        token: token,
        message: 'Login successful'
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'An unexpected error occurred during login'
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
    } catch (error) {
      return null;
    }
  }
};
