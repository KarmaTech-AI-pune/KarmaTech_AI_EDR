import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { LoginResponse, UserWithRole } from '../types';
import { Credentials } from '../types/auth';
import { PermissionType } from '../models';
import { Tenant } from '../models/tenantModel';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Enhanced axios instance with tenant context

// Normalize permissions from string to array
const normalizePermissions = (permissions: string | string[]): string[] => {
  if (typeof permissions === 'string') {
    return permissions.split(',').map(p => p.trim()).filter(Boolean);
  }
  return permissions || [];
};

// Enhanced decoded token interface
interface EnhancedDecodedToken {
  sub: string;
  email: string;
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name': string;
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': string;
  Permissions: string;
  Features?: string;
  IsSuperAdmin?: string;
  UserType?: string;
  TenantRole?: string;
  TenantId?: string;
  TenantDomain?: string;
  exp: number;
  iss: string;
  aud: string;
  jti: string;
}

export const enhancedAuthApi = {
  // Login with tenant context detection
  login: async (credentials: Credentials, tenantContext?: string): Promise<LoginResponse> => {
    try {
      // debugger;
      // Determine API endpoint based on tenant context
      let apiUrl = `${API_BASE_URL}api/user/login`;

      // If tenant context is provided, use tenant-specific endpoint
      if (tenantContext) {
        // For now, use the main API endpoint but pass tenant context in headers
        // This avoids CORS issues while still supporting multi-tenant login
        apiUrl = `${API_BASE_URL}api/user/login`;
      }

      const headers: any = {};
      if (tenantContext) {
        headers['X-Tenant-Context'] = tenantContext;
      }

      const response = await axios.post(apiUrl, credentials, { headers });
      const { success, token } = response.data;

      if (success && token) {
        // Store token
        localStorage.setItem('token', token);

        // Decode token and extract user information
        const decodedToken = jwtDecode<EnhancedDecodedToken>(token);
        const role = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
        const permissions = normalizePermissions(decodedToken.Permissions);

        // Extract features
        let features: string[] = [];
        if (decodedToken.Features) {
          features = decodedToken.Features.split(',').map(f => f.trim()).filter(Boolean);
        }

        // Determine user type
        const isSuperAdmin = decodedToken.IsSuperAdmin === 'true';
        const userType = decodedToken.UserType;
        const tenantRole = decodedToken.TenantRole;

        // Create user with enhanced role details
        const userWithRole: UserWithRole = {
          id: decodedToken.sub,
          userName: decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
          name: decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
          email: decodedToken.email,
          avatar: response.data.user.avatar,
          roles: [{
            id: role,
            name: role,
            permissions: permissions.map(p => PermissionType[p as keyof typeof PermissionType])
          }],
          roleDetails: {
            id: role,
            name: role,
            permissions: permissions.map(p => PermissionType[p as keyof typeof PermissionType])
          },
          standardRate: response.data.user.standardRate,
          isConsultant: response.data.user.isConsultant,
          createdAt: response.data.user.createdAt,
          // Enhanced properties
          isSuperAdmin: isSuperAdmin,
          userType: userType,
          tenantRole: tenantRole,
          tenantContext: tenantContext,
          tenantId: decodedToken.TenantId ? parseInt(decodedToken.TenantId) : undefined,
          tenantDomain: decodedToken.TenantDomain,
          features: features
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
        message: error.response?.data?.message || 'An error occurred during login',
        errorCode: error.response?.data?.errorCode
      };
    }
  },

  // Super admin login (no tenant context)
  superAdminLogin: async (credentials: Credentials): Promise<LoginResponse> => {
    return enhancedAuthApi.login(credentials);
  },

  // Tenant-specific login
  tenantLogin: async (credentials: Credentials, tenantSubdomain: string): Promise<LoginResponse> => {
    return enhancedAuthApi.login(credentials, tenantSubdomain);
  },

  // Get available tenants for login
  getAvailableTenants: async (): Promise<Tenant[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}api/tenants`);
      return response.data;
    } catch (error) {
      console.error('Error fetching tenants:', error);
      throw new Error('Failed to fetch available tenants');
    }
  },

  logout: async (): Promise<void> => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const decodedToken = jwtDecode<EnhancedDecodedToken>(token);
        const isSuperAdmin = decodedToken.IsSuperAdmin === 'true';

        // Use appropriate logout endpoint
        let logoutUrl = `${API_BASE_URL}/user/logout`;
        if (!isSuperAdmin && decodedToken.UserType === 'TenantUser') {
          // Tenant-specific logout
          logoutUrl = `${API_BASE_URL.replace('localhost:5000', 'tenant1.localhost:5000')}/user/logout`;
        }

        await axios.post(logoutUrl);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  checkAuth: async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;

      const decodedToken = jwtDecode<EnhancedDecodedToken>(token);

      // Check if token is expired
      if (decodedToken.exp * 1000 < Date.now()) {
        await enhancedAuthApi.logout();
        return false;
      }

      // For tenant users, verify tenant context
      if (decodedToken.UserType === 'TenantUser') {
        const currentHost = window.location.hostname;
        const tenantDomain = decodedToken.TenantDomain;

        // Validate tenant domain matches current host
        if (tenantDomain && !currentHost.includes(tenantDomain)) {
          console.warn('Tenant domain mismatch', { tenantDomain, currentHost });
          return false;
        }

        // Additional validation for production environments
        if (process.env.NODE_ENV === 'production') {
          // Ensure user is on the correct subdomain
          const expectedSubdomain = tenantDomain?.split('.')[0];
          const currentSubdomain = currentHost.split('.')[0];

          if (expectedSubdomain && currentSubdomain !== expectedSubdomain) {
            console.warn('Tenant subdomain mismatch', { expectedSubdomain, currentSubdomain });
            return false;
          }
        }
      }

      // For super admin, ensure they're on the main domain
      if (decodedToken.UserType === 'SuperAdmin') {
        const currentHost = window.location.hostname;
        if (currentHost.includes('localhost')) {
          // In development, super admin can be on any localhost subdomain
          return true;
        } else {
          // In production, super admin should be on main domain
          const mainDomain = process.env.VITE_MAIN_DOMAIN || 'edr.com';
          if (!currentHost.includes(mainDomain) || currentHost.split('.')[0] !== mainDomain.split('.')[0]) {
            console.warn('Super admin on wrong domain', { currentHost, mainDomain });
            return false;
          }
        }
      }

      return true;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  },

  getCurrentUser: async (): Promise<UserWithRole | null> => {
    try {
      const storedUser = localStorage.getItem('user');

      if (storedUser) {
        const user = JSON.parse(storedUser);

        // Verify user type matches current context
        const token = localStorage.getItem('token');
        if (token) {
          const decodedToken = jwtDecode<EnhancedDecodedToken>(token);
          const currentHost = window.location.hostname;

          // For tenant users, ensure they're on the correct subdomain
          if (decodedToken.UserType === 'TenantUser' && !currentHost.includes('localhost:5173')) {
            const tenantSubdomain = currentHost.split('.')[0];
            if (tenantSubdomain !== user.tenantContext) {
              console.warn('Tenant context mismatch, redirecting to correct tenant');
              window.location.href = `http://${user.tenantContext}.localhost:5000`;
              return null;
            }
          }
        }

        return user;
      }

      return null;
    } catch (error) {
      return null;
    }
  },

  isTokenExpired: (): boolean => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return true;

      const decodedToken = jwtDecode<EnhancedDecodedToken>(token);
      return decodedToken.exp * 1000 < Date.now();
    } catch (error) {
      return true;
    }
  },

  // Check if current user is super admin
  isSuperAdmin: (): boolean => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        return user.isSuperAdmin === true;
      }
      return false;
    } catch (error) {
      return false;
    }
  },

  // Get current tenant context
  getCurrentTenantContext: (): string | null => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        return user.tenantContext || null;
      }
      return null;
    } catch (error) {
      return null;
    }
  }
};

