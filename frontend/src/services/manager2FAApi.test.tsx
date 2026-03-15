import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
vi.unmock('axios');

import { manager2FAApi } from './manager2FAApi';
import { axiosInstance } from './axiosConfig';
import MockAdapter from 'axios-mock-adapter';

describe('manager2FAApi', () => {
  let mockAxios: MockAdapter;

  beforeEach(() => {
    mockAxios = new MockAdapter(axiosInstance);
    vi.clearAllMocks();
  });

  afterEach(() => {
    mockAxios.restore();
  });

  describe('getUsers2FAStatus', () => {
    it('returns users on success', async () => {
      const mockUsers = [{ id: '1', name: 'User1', email: 'u1@test.com', twoFactorEnabled: true, role: 'Admin' }];
      mockAxios.onGet(/api\/manager\/twofactor\/users-status/).reply(200, {
        users: mockUsers,
        message: 'Success'
      });
      
      const result = await manager2FAApi.getUsers2FAStatus();
      expect(result.success).toBe(true);
      expect(result.users).toEqual(mockUsers);
      expect(result.message).toBe('Success');
    });

    it('handles failure', async () => {
      mockAxios.onGet(/api\/manager\/twofactor\/users-status/).reply(500, { message: 'Failed to fetch' });
      
      const result = await manager2FAApi.getUsers2FAStatus();
      expect(result.success).toBe(false);
      expect(result.users).toEqual([]);
      expect(result.message).toBe('Failed to fetch');
    });
  });

  describe('enableUser2FA', () => {
    it('returns success on 200', async () => {
      mockAxios.onPost(/api\/manager\/twofactor\/enable/).reply((config) => {
        expect(JSON.parse(config.data).userId).toBe('user-1');
        return [200, { message: 'Enabled' }];
      });
      
      const result = await manager2FAApi.enableUser2FA('user-1');
      expect(result.success).toBe(true);
      expect(result.message).toBe('Enabled');
    });

    it('handles failure', async () => {
      mockAxios.onPost(/api\/manager\/twofactor\/enable/).reply(400, { message: 'Error' });
      const result = await manager2FAApi.enableUser2FA('user-1');
      expect(result.success).toBe(false);
    });
  });

  describe('disableUser2FA', () => {
    it('returns success on 200', async () => {
      mockAxios.onPost(/api\/manager\/twofactor\/disable/).reply((config) => {
        expect(JSON.parse(config.data).userId).toBe('user-1');
        return [200, { message: 'Disabled' }];
      });
      
      const result = await manager2FAApi.disableUser2FA('user-1');
      expect(result.success).toBe(true);
      expect(result.message).toBe('Disabled');
    });

    it('handles failure', async () => {
      mockAxios.onPost(/api\/manager\/twofactor\/disable/).reply(400, { message: 'Error' });
      const result = await manager2FAApi.disableUser2FA('user-1');
      expect(result.success).toBe(false);
    });
  });

  describe('get2FAStatistics', () => {
    it('returns statistics on success', async () => {
      const mockStats = { totalUsers: 10, enabledUsers: 5, disabledUsers: 5, coveragePercentage: 50 };
      mockAxios.onGet(/api\/manager\/twofactor\/statistics/).reply(200, {
        statistics: mockStats,
        message: 'Success'
      });
      
      const result = await manager2FAApi.get2FAStatistics();
      expect(result.success).toBe(true);
      expect(result.statistics).toEqual(mockStats);
    });

    it('handles failure', async () => {
      mockAxios.onGet(/api\/manager\/twofactor\/statistics/).reply(500);
      
      const result = await manager2FAApi.get2FAStatistics();
      expect(result.success).toBe(false);
      expect(result.statistics.totalUsers).toBe(0);
      expect(result.message).toBe('Failed to load 2FA statistics');
    });
  });

  describe('bulkEnable2FA', () => {
    it('returns success on 200', async () => {
      mockAxios.onPost(/api\/manager\/twofactor\/bulk-enable/).reply((config) => {
        expect(JSON.parse(config.data).userIds).toEqual(['1', '2']);
        return [200, { message: 'Bulk enabled' }];
      });
      
      const result = await manager2FAApi.bulkEnable2FA(['1', '2']);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Bulk enabled');
    });

    it('handles failure', async () => {
      mockAxios.onPost(/api\/manager\/twofactor\/bulk-enable/).reply(400);
      const result = await manager2FAApi.bulkEnable2FA(['1']);
      expect(result.success).toBe(false);
    });
  });

  describe('bulkDisable2FA', () => {
    it('returns success on 200', async () => {
      mockAxios.onPost(/api\/manager\/twofactor\/bulk-disable/).reply((config) => {
        expect(JSON.parse(config.data).userIds).toEqual(['1', '2']);
        return [200, { message: 'Bulk disabled' }];
      });
      
      const result = await manager2FAApi.bulkDisable2FA(['1', '2']);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Bulk disabled');
    });

    it('handles failure', async () => {
      mockAxios.onPost(/api\/manager\/twofactor\/bulk-disable/).reply(400);
      const result = await manager2FAApi.bulkDisable2FA(['1']);
      expect(result.success).toBe(false);
    });
  });

  describe('send2FAReminder', () => {
    it('returns success on 200', async () => {
      mockAxios.onPost(/api\/manager\/twofactor\/send-reminder/).reply((config) => {
        expect(JSON.parse(config.data).userIds).toEqual(['1']);
        return [200, { message: 'Reminder sent' }];
      });
      
      const result = await manager2FAApi.send2FAReminder(['1']);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Reminder sent');
    });

    it('returns success without userIds', async () => {
      mockAxios.onPost(/api\/manager\/twofactor\/send-reminder/).reply((config) => {
        expect(JSON.parse(config.data).userIds).toEqual([]);
        return [200, { message: 'All reminders sent' }];
      });
      
      const result = await manager2FAApi.send2FAReminder();
      expect(result.success).toBe(true);
    });

    it('handles failure', async () => {
      mockAxios.onPost(/api\/manager\/twofactor\/send-reminder/).reply(400);
      const result = await manager2FAApi.send2FAReminder();
      expect(result.success).toBe(false);
    });
  });

  describe('get2FAAuditLog', () => {
    it('returns audit log on success with dates', async () => {
      const mockLog = [{ id: '1', userId: 'u1', userName: 'User', action: 'enabled', performedBy: 'Admin', performedByName: 'Admin', timestamp: '2023-01-01' }];
      
      mockAxios.onGet(/api\/manager\/twofactor\/audit-log/).reply((config) => {
        expect(config.url).toContain('startDate=2023-01-01');
        expect(config.url).toContain('endDate=2023-01-31');
        return [200, { auditLog: mockLog }];
      });
      
      const result = await manager2FAApi.get2FAAuditLog('2023-01-01', '2023-01-31');
      expect(result.success).toBe(true);
      expect(result.auditLog).toEqual(mockLog);
    });

    it('returns audit log without dates', async () => {
      mockAxios.onGet(/api\/manager\/twofactor\/audit-log/).reply((config) => {
        expect(config.url).not.toContain('startDate');
        return [200, { auditLog: [] }];
      });
      
      const result = await manager2FAApi.get2FAAuditLog();
      expect(result.success).toBe(true);
    });

    it('handles failure', async () => {
      mockAxios.onGet(/api\/manager\/twofactor\/audit-log/).reply(500);
      const result = await manager2FAApi.get2FAAuditLog();
      expect(result.success).toBe(false);
      expect(result.auditLog).toEqual([]);
    });
  });
});
