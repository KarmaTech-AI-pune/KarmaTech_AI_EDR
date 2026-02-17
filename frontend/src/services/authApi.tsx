import { Credentials, LoginResponse, UserWithRole } from '../types';
import { PermissionType } from '../models';
import { axiosInstance } from './axiosConfig';
import { getTenantContext } from './axiosConfig';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  sub: string;
  email: string;
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name': string;
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': string;
  Permissions: [];
  exp: number;
  iss: string;
  aud: string;
  jti: string;
  SubscriptionPlanId?: number; // Add SubscriptionPlanId to the decoded token interface
}

export const authApi = {
  login: async (credentials: Credentials): Promise<LoginResponse> => {
    try {
      const tenantContext = getTenantContext();
      
      // Ensure we have a tenant context
      if (!tenantContext) {
        console.error('No tenant context available');
        return {
          success: false,
          message: 'Invalid tenant configuration'
        };
      }

      // Ensure proper headers are set for the login request
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-Context': tenantContext
        }
      };
      const response = await axiosInstance.post('api/user/login', credentials, config);
      const { success, token } = response.data;
      
      if (success && token) {
        // Store token
        localStorage.setItem('token', token);

        // Decode token and store user data
        const decodedToken = jwtDecode<DecodedToken>(token);
        const role = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
        const permissions = decodedToken.Permissions;
        const temp = normalizePermissions(permissions);

        // Create user with role details
        const userWithRole: UserWithRole = {
          id: decodedToken.sub,
          userName: decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
          name: decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
          email: decodedToken.email,
          avatar: response.data.user.avatar,
          roles: [{
            id: role,
            name: role,
            permissions: temp.map(p => PermissionType[p as keyof typeof PermissionType])
          }],
          roleDetails: {
            id: role,
            name: role,
            permissions: temp.map(p => PermissionType[p as keyof typeof PermissionType])
          },
          standardRate: response.data.user.standardRate,
          isConsultant: response.data.user.isConsultant,
          createdAt: response.data.user.createdAt,
          tenantId: response.data.user.tenantId,
          tenantDomain: response.data.user.tenantDomain,
          twoFactorEnabled: response.data.user.twoFactorEnabled,
          features: response.data.user.features || [], // Store features from login response
        };

        // Store user information
        localStorage.setItem('user', JSON.stringify(userWithRole));
        
        return {
          success: true,
          user: userWithRole,
          token: token,
          message: 'Login successful'
        };
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
      await axiosInstance.post('api/user/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete axiosInstance.defaults.headers.common['Authorization'];
    }
  },

  checkAuth: async (): Promise<boolean> => {
      try {
      const token = localStorage.getItem('token');
      if (!token) return false;

      const decodedToken = jwtDecode<DecodedToken>(token);
      // Check if token is expired
      if (decodedToken.exp * 1000 < Date.now()) {
        await authApi.logout();
        return false;
      }    
      return true;
    } catch (error) {
      return false;
    }
  },
// Handle permissions being either a string or an array
 
  getCurrentUser: async (): Promise<UserWithRole | null> => {
    try {
      // Retrieve user from localStorage
      const storedUser = localStorage.getItem('user');
      
      if (storedUser) {
        return JSON.parse(storedUser);
      }

      ////const response = await axiosInstance.get('api/user/me');
      //const user = response.data.user;
      //localStorage.setItem('user', JSON.stringify(user));
      return null;
    } catch (error) {
      return null;
    }
  },

  isTokenExpired: (): boolean => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return true;

      const decodedToken = jwtDecode<DecodedToken>(token);
      return decodedToken.exp * 1000 < Date.now();
    } catch (error) {
      return true;
    }
  },

  signup: async (signupData: any): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await axiosInstance.post('/api/CreateAccount', signupData);
      if (response.status === 201) {
        return { success: true, message: 'Account created successfully!' };
      } else {
        return { success: false, message: response.data?.message || 'Account creation failed.' };
      }
    } catch (error: any) {
      console.error('Signup API error:', error);
      return { success: false, message: error.response?.data?.message || 'An unexpected error occurred during signup.' };
    }
  }
};

function normalizePermissions(permissions: any) {
 
    // If permissions is an array, join it into a single string and split by commas
    if (Array.isArray(permissions)) {
      return permissions
        .join(',')   // Join all array elements into one string
        .split(',')  // Split the string by commas
        .map(p => p.trim())  // Trim spaces around each permission
        .filter((value, index, self) => self.indexOf(value) === index);  // Remove duplicates
    }
    // If permissions is a string, just split and process
    else if (typeof permissions === 'string') {
      return permissions
        .split(',')  // Split by commas
        .map(p => p.trim())  // Trim spaces
        .filter((value, index, self) => self.indexOf(value) === index);  // Remove duplicates
    }
    return []; // Return an empty array if the format is unexpected
  
};
