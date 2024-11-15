import { Credentials, LoginResponse, User } from '../types';
import { 
    users, 
    validateUser, 
    getUserByUsername 
} from './database/dummyusers';

export const authApi = {
  login: async (credentials: Credentials): Promise<LoginResponse> => {
    try {
      const user = validateUser(credentials.username, credentials.password);
      
      if (user) {
        // Simulate token generation
        const token = `dummy_token_${user.username}_${Date.now()}`;
        
        // Simulate storing token in localStorage
        localStorage.setItem('token', token);
        
        return {
          success: true,
          user: {
            id: user.id,
            name: user.name,
            email: user.email
          },
          token: token,
          message: 'Login successful'
        };
      }
      
      return {
        success: false,
        message: 'Invalid username or password'
      };
    } catch (error) {
      return {
        success: false,
        message: 'An error occurred during login'
      };
    }
  },

  logout: async (): Promise<void> => {
    try {
      // Simulate logout by removing token
      localStorage.removeItem('token');
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  checkAuth: async (): Promise<boolean> => {
    // Simulate authentication check by verifying token exists
    const token = localStorage.getItem('token');
    return !!token;
  },

  getCurrentUser: async (): Promise<User | null> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;

      // Extract username from token (in a real scenario, you'd decode the token)
      const username = token.split('_')[1];
      const user = getUserByUsername(username);

      if (user) {
        return {
          id: user.id,
          name: user.name,
          email: user.email
        };
      }

      return null;
    } catch (error) {
      return null;
    }
  }
};
