import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
vi.unmock('axios');

import * as userApi from './userApi';
import { axiosInstance } from './axiosConfig';
import MockAdapter from 'axios-mock-adapter';

describe('userApi', () => {
  let mockAxios: MockAdapter;

  beforeEach(() => {
    mockAxios = new MockAdapter(axiosInstance);
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.clearAllMocks();
  });

  afterEach(() => {
    mockAxios.restore();
    vi.restoreAllMocks();
  });

  describe('login', () => {
    it('returns token on success', async () => {
      mockAxios.onPost('/api/user/login').reply(200, { success: true, token: 'abc' });
      const result = await userApi.login('user', 'pass');
      expect(result.success).toBe(true);
      expect(result.token).toBe('abc');
    });

    it('throws error on failure', async () => {
      mockAxios.onPost('/api/user/login').reply(500);
      await expect(userApi.login('user', 'pass')).rejects.toThrow();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('getRoles', () => {
    it('returns roles', async () => {
      mockAxios.onGet('/api/user/roles').reply(200, ['Admin', 'User']);
      const result = await userApi.getRoles();
      expect(result).toEqual(['Admin', 'User']);
    });

    it('throws on error', async () => {
      mockAxios.onGet('/api/user/roles').reply(500);
      await expect(userApi.getRoles()).rejects.toThrow();
    });
  });

  describe('getUsersByRole', () => {
    it('returns users', async () => {
      mockAxios.onGet('/api/user/by-role/Admin').reply(200, [{ id: '1', name: 'Admin User' }]);
      const result = await userApi.getUsersByRole('Admin');
      expect(result).toEqual([{ id: '1', name: 'Admin User' }]);
    });

    it('throws on error', async () => {
      mockAxios.onGet('/api/user/by-role/Admin').reply(500);
      await expect(userApi.getUsersByRole('Admin')).rejects.toThrow();
    });
  });

  describe('getPermissions', () => {
    it('returns permissions', async () => {
      mockAxios.onGet('/api/user/permissions').reply(200, ['read', 'write']);
      const result = await userApi.getPermissions();
      expect(result).toEqual(['read', 'write']);
    });

    it('throws on error', async () => {
      mockAxios.onGet('/api/user/permissions').reply(500);
      await expect(userApi.getPermissions()).rejects.toThrow();
    });
  });

  describe('getAllUsers', () => {
    it('returns all users', async () => {
      mockAxios.onGet('/api/user').reply(200, [{ id: '1' }, { id: '2' }]);
      const result = await userApi.getAllUsers();
      expect(result).toEqual([{ id: '1' }, { id: '2' }]);
    });

    it('throws on error', async () => {
      mockAxios.onGet('/api/user').reply(500);
      await expect(userApi.getAllUsers()).rejects.toThrow();
    });
  });

  describe('getUserById', () => {
    it('returns specific user', async () => {
      mockAxios.onGet('/api/user/123').reply(200, { id: '123' });
      const result = await userApi.getUserById('123');
      expect(result).toEqual({ id: '123' });
    });

    it('throws on error', async () => {
      mockAxios.onGet('/api/user/123').reply(500);
      await expect(userApi.getUserById('123')).rejects.toThrow();
    });
  });

  describe('createUser', () => {
    it('creates user correctly mapping roles to array format required by API', async () => {
      const mockUser = {
        userName: 'newuser',
        name: 'New User',
        email: 'new@example.com',
        avatar: 'img.png',
        roles: [{ id: 'role1', name: 'Role 1', permissions: [] }],
        isConsultant: true,
        standardRate: 150
      };

      mockAxios.onPost('/api/user/Create').reply((config) => {
        const data = JSON.parse(config.data);
        expect(Array.isArray(data)).toBe(true);
        expect(data[0].userName).toBe('newuser');
        expect(data[0].IsConsultant).toBe(true);
        expect(data[0].StandardRate).toBe(150);
        return [200, { id: 'new-id', ...mockUser }];
      });

      const result = await userApi.createUser(mockUser as any);
      expect(result.id).toBe('new-id');
    });

    it('throws on error', async () => {
      mockAxios.onPost('/api/user/Create').reply(500);
      const mockUser = { userName: 'test' };
      await expect(userApi.createUser(mockUser as any)).rejects.toThrow();
    });
  });

  describe('updateUser', () => {
    it('updates user correctly', async () => {
      const mockUser = {
        userName: 'updated',
        name: 'Updated User',
        email: 'up@test.com',
        avatar: '',
        roles: [],
        isConsultant: false,
        standardRate: 100
      };

      mockAxios.onPut('/api/user/123').reply((config) => {
        const data = JSON.parse(config.data);
        expect(data.id).toBe('123');
        expect(data.userName).toBe('updated');
        return [200, { id: '123', ...mockUser }];
      });

      const result = await userApi.updateUser('123', mockUser);
      expect(result.id).toBe('123');
      expect(result.userName).toBe('updated');
    });

    it('throws on error', async () => {
      mockAxios.onPut('/api/user/123').reply(500);
      await expect(userApi.updateUser('123', {})).rejects.toThrow();
    });
  });

  describe('deleteUser', () => {
    it('deletes user successfully', async () => {
      mockAxios.onDelete('/api/user/123').reply(200);
      await userApi.deleteUser('123'); // Should not throw
      expect(console.error).not.toHaveBeenCalled();
    });

    it('logs error on failure instead of throwing', async () => {
      mockAxios.onDelete('/api/user/123').reply(500);
      await userApi.deleteUser('123'); // Should not throw, just log
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('resetUserPassword', () => {
    it('returns success on 200', async () => {
      mockAxios.onPost('/api/user/123/reset-password').reply(200, { message: 'Reset ok' });
      const result = await userApi.resetUserPassword('123');
      expect(result.success).toBe(true);
      expect(result.message).toBe('Reset ok');
    });

    it('returns failure on error', async () => {
      mockAxios.onPost('/api/user/123/reset-password').reply(400, { message: 'Reset failed' });
      const result = await userApi.resetUserPassword('123');
      expect(result.success).toBe(false);
      expect(result.message).toBe('Reset failed');
    });
  });
});
