
import { axiosInstance } from './axiosConfig';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5245/';

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}

export interface PasswordChangeResponse {
  success: boolean;
  message: string;
}

export interface PasswordValidationResponse {
  isValid: boolean;
  errors: string[];
}

export const passwordApi = {
  /**
   * Change user password
   */
  changePassword: async (request: PasswordChangeRequest): Promise<PasswordChangeResponse> => {
    try {
      const response = await axiosInstance.post(`${API_BASE_URL}api/user/change-password`, {
        currentPassword: request.currentPassword,
        newPassword: request.newPassword
      });
      
      return {
        success: true,
        message: response.data.message || 'Password changed successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to change password. Please try again.'
      };
    }
  },

  /**
   * Validate password strength
   */
  validatePassword: (password: string): PasswordValidationResponse => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      errors.push('Password must contain at least one special character (@$!%*?&)');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Check if password has been used recently (optional feature)
   */
  checkPasswordHistory: async (newPassword: string): Promise<{ isRecent: boolean; message?: string }> => {
    try {
      const response = await axiosInstance.post(`${API_BASE_URL}api/user/check-password-history`, {
        newPassword
      });
      
      return response.data;
    } catch (error: any) {
      // If the endpoint doesn't exist, assume it's not recent
      return {
        isRecent: false
      };
    }
  },

  /**
   * Send password reset email (for forgot password functionality)
   */
  sendPasswordResetEmail: async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await axiosInstance.post(`${API_BASE_URL}api/user/forgot-password`, {
        email
      });
      
      return {
        success: true,
        message: response.data.message || 'Password reset email sent successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send password reset email'
      };
    }
  },

  /**
   * Reset password with token (for forgot password flow)
   */
  resetPassword: async (token: string, newPassword: string, email: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await axiosInstance.post(`${API_BASE_URL}api/user/reset-password`, {
        token,
        newPassword,
        email
      });
      
      return {
        success: true,
        message: response.data.message || 'Password reset successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to reset password'
      };
    }
  },


  /**
  * Admin reset user password (for admin functionality)
  */
  adminResetUserPassword: async (email: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await axiosInstance.post(`${API_BASE_URL}api/user/reset-user-password`, {
        email,
        newPassword
      });
      return {
        success: true,
        message: response.data.message || 'User password reset successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to reset user password'
      };
    }
  }

};
