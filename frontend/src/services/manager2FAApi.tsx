import { axiosInstance } from './axiosConfig';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5245/';

export interface User2FAStatus {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  twoFactorEnabled: boolean;
  lastLogin?: string;
  role: string;
}

export interface Users2FAStatusResponse {
  success: boolean;
  users: User2FAStatus[];
  message?: string;
}

export interface Manager2FAResponse {
  success: boolean;
  message: string;
}

export const manager2FAApi = {
  /**
   * Get all users with their 2FA status
   */
  getUsers2FAStatus: async (): Promise<Users2FAStatusResponse> => {
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}api/manager/twofactor/users-status`);
      
      return {
        success: true,
        users: response.data.users || [],
        message: response.data.message
      };
    } catch (error: any) {
      return {
        success: false,
        users: [],
        message: error.response?.data?.message || 'Failed to load users 2FA status'
      };
    }
  },

  /**
   * Enable 2FA for a specific user (manager action)
   */
  enableUser2FA: async (userId: string): Promise<Manager2FAResponse> => {
    try {
      const response = await axiosInstance.post(`${API_BASE_URL}api/manager/twofactor/enable`, {
        userId
      });
      
      return {
        success: true,
        message: response.data.message || '2FA enabled successfully for user'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to enable 2FA for user'
      };
    }
  },

  /**
   * Disable 2FA for a specific user (manager action)
   */
  disableUser2FA: async (userId: string): Promise<Manager2FAResponse> => {
    try {
      const response = await axiosInstance.post(`${API_BASE_URL}api/manager/twofactor/disable`, {
        userId
      });
      
      return {
        success: true,
        message: response.data.message || '2FA disabled successfully for user'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to disable 2FA for user'
      };
    }
  },

  /**
   * Get 2FA statistics for the organization
   */
  get2FAStatistics: async (): Promise<{
    success: boolean;
    statistics: {
      totalUsers: number;
      enabledUsers: number;
      disabledUsers: number;
      coveragePercentage: number;
    };
    message?: string;
  }> => {
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}api/manager/twofactor/statistics`);
      
      return {
        success: true,
        statistics: response.data.statistics,
        message: response.data.message
      };
    } catch (error: any) {
      return {
        success: false,
        statistics: {
          totalUsers: 0,
          enabledUsers: 0,
          disabledUsers: 0,
          coveragePercentage: 0
        },
        message: error.response?.data?.message || 'Failed to load 2FA statistics'
      };
    }
  },

  /**
   * Bulk enable 2FA for multiple users
   */
  bulkEnable2FA: async (userIds: string[]): Promise<Manager2FAResponse> => {
    try {
      const response = await axiosInstance.post(`${API_BASE_URL}api/manager/twofactor/bulk-enable`, {
        userIds
      });
      
      return {
        success: true,
        message: response.data.message || '2FA enabled successfully for selected users'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to enable 2FA for selected users'
      };
    }
  },

  /**
   * Bulk disable 2FA for multiple users
   */
  bulkDisable2FA: async (userIds: string[]): Promise<Manager2FAResponse> => {
    try {
      const response = await axiosInstance.post(`${API_BASE_URL}api/manager/twofactor/bulk-disable`, {
        userIds
      });
      
      return {
        success: true,
        message: response.data.message || '2FA disabled successfully for selected users'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to disable 2FA for selected users'
      };
    }
  },

  /**
   * Send 2FA setup reminder to users who don't have it enabled
   */
  send2FAReminder: async (userIds?: string[]): Promise<Manager2FAResponse> => {
    try {
      const response = await axiosInstance.post(`${API_BASE_URL}api/manager/twofactor/send-reminder`, {
        userIds: userIds || []
      });
      
      return {
        success: true,
        message: response.data.message || '2FA setup reminders sent successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send 2FA setup reminders'
      };
    }
  },

  /**
   * Get 2FA audit log for compliance tracking
   */
  get2FAAuditLog: async (startDate?: string, endDate?: string): Promise<{
    success: boolean;
    auditLog: Array<{
      id: string;
      userId: string;
      userName: string;
      action: 'enabled' | 'disabled';
      performedBy: string;
      performedByName: string;
      timestamp: string;
      reason?: string;
    }>;
    message?: string;
  }> => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const response = await axiosInstance.get(`${API_BASE_URL}api/manager/twofactor/audit-log?${params}`);
      
      return {
        success: true,
        auditLog: response.data.auditLog || [],
        message: response.data.message
      };
    } catch (error: any) {
      return {
        success: false,
        auditLog: [],
        message: error.response?.data?.message || 'Failed to load 2FA audit log'
      };
    }
  }
};
