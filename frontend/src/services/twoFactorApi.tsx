import { axiosInstance } from './axiosConfig';
import { jwtDecode } from 'jwt-decode';
import { UserWithRole } from '../types';
import { PermissionType } from '../models';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5245/';

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
}

export interface TwoFactorLoginRequest {
  email: string;
  password: string;
}

export interface TwoFactorVerifyRequest {
  email: string;
  otpCode: string;
}

export interface TwoFactorResponse {
  success: boolean;
  message: string;
  requiresOtp?: boolean;
  token?: string;
  user?: UserWithRole;
}

export interface OtpSentResponse {
  success: boolean;
  message: string;
  email: string;
}

export const twoFactorApi = {
  // Send OTP for 2FA
  sendOtp: async (email: string): Promise<OtpSentResponse> => {
    try {
      const response = await axiosInstance.post(`${API_BASE_URL}api/twofactor/send-otp`, {
        email
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send OTP',
        email
      };
    }
  },

  // Verify OTP and complete login
  verifyOtp: async (email: string, otpCode: string): Promise<TwoFactorResponse> => {
    try {
      const response = await axiosInstance.post(`${API_BASE_URL}api/twofactor/verify-otp`, {
        email,
        otpCode
      });
      // debugger;
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
        };

        // Store user information
        localStorage.setItem('user', JSON.stringify(userWithRole));
        
        return {
          success: true,
          user: userWithRole,
          token: token,
          message: 'OTP verified successfully'
        };
      }
      
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to verify OTP'
      };
    }
  },

  // Enable 2FA for a user
  enableTwoFactor: async (userId: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await axiosInstance.post(`${API_BASE_URL}api/twofactor/enable`, userId);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to enable 2FA'
      };
    }
  },

  // Disable 2FA for a user
  disableTwoFactor: async (userId: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await axiosInstance.post(`${API_BASE_URL}api/twofactor/disable`, userId);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to disable 2FA'
      };
    }
  },

  // Get current user's 2FA status
  getTwoFactorStatus: async (userId?: string): Promise<{ success: boolean; enabled: boolean; message?: string }> => {
    try {
      const url = userId
        ? `${API_BASE_URL}api/twofactor/status/${encodeURIComponent(userId)}`
        : `${API_BASE_URL}api/twofactor/status`;
      const response = await axiosInstance.get(url);
      // debugger;
      return {
        success: true,
        enabled: Boolean(response.data?.isTwoFactorEnabled)        
      };
    } catch (error: any) {
      return {
        success: false,
        enabled: false,
        message: error.response?.data?.message || 'Failed to fetch 2FA status'
      };
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
}

