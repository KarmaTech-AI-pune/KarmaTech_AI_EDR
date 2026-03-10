import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
vi.unmock('axios');

import { passwordApi } from './passwordApi';
import { axiosInstance } from './axiosConfig';
import MockAdapter from 'axios-mock-adapter';

describe('passwordApi', () => {
  let mockAxios: MockAdapter;

  beforeEach(() => {
    mockAxios = new MockAdapter(axiosInstance);
    vi.clearAllMocks();
  });

  afterEach(() => {
    mockAxios.restore();
  });

  describe('changePassword', () => {
    it('returns success when API succeeds', async () => {
      mockAxios.onPost(/api\/user\/change-password/).reply(200, { message: 'Success' });
      
      const result = await passwordApi.changePassword({ currentPassword: 'old', newPassword: 'new' });
      expect(result.success).toBe(true);
      expect(result.message).toBe('Success');
    });

    it('returns failure with specific message string', async () => {
      mockAxios.onPost(/api\/user\/change-password/).reply(400, { message: 'Incorrect old password' });
      
      const result = await passwordApi.changePassword({ currentPassword: 'old', newPassword: 'new' });
      expect(result.success).toBe(false);
      expect(result.message).toBe('Incorrect old password');
    });

    it('returns standard failure message if missing from API', async () => {
      mockAxios.onPost(/api\/user\/change-password/).reply(400); // No payload
      
      const result = await passwordApi.changePassword({ currentPassword: 'old', newPassword: 'new' });
      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to change password. Please try again.');
    });
  });

  describe('validatePassword', () => {
    it('validates a strong password successfully', () => {
      const result = passwordApi.validatePassword('StrongPass1!');
      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('requires at least 8 characters', () => {
      const result = passwordApi.validatePassword('A1$aaaa'); // 7 chars
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters long');
    });

    it('requires a lowercase letter', () => {
      const result = passwordApi.validatePassword('AAAAA11!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one lowercase letter');
    });

    it('requires an uppercase letter', () => {
      const result = passwordApi.validatePassword('aaaaa11!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    it('requires a number', () => {
      const result = passwordApi.validatePassword('StrongPass!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one number');
    });

    it('requires a special character', () => {
      const result = passwordApi.validatePassword('StrongPass11');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one special character (@$!%*?&)');
    });
  });

  describe('checkPasswordHistory', () => {
    it('returns API check response', async () => {
      mockAxios.onPost(/api\/user\/check-password-history/).reply(200, { isRecent: true, message: 'Too recent' });
      
      const result = await passwordApi.checkPasswordHistory('newPass1!');
      expect(result.isRecent).toBe(true);
      expect(result.message).toBe('Too recent');
    });

    it('returns false upon API error', async () => {
      mockAxios.onPost(/api\/user\/check-password-history/).reply(404);
      
      const result = await passwordApi.checkPasswordHistory('newPass1!');
      expect(result.isRecent).toBe(false);
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('returns success on 200', async () => {
      mockAxios.onPost(/api\/user\/forgot-password/).reply(200, { message: 'Email sent' });
      
      const result = await passwordApi.sendPasswordResetEmail('a@b.com');
      expect(result.success).toBe(true);
      expect(result.message).toBe('Email sent');
    });

    it('returns failure on API error', async () => {
      mockAxios.onPost(/api\/user\/forgot-password/).reply(400, { message: 'Email not found' });
      
      const result = await passwordApi.sendPasswordResetEmail('a@b.com');
      expect(result.success).toBe(false);
      expect(result.message).toBe('Email not found');
    });
  });

  describe('resetPassword', () => {
    it('returns success on 200', async () => {
      mockAxios.onPost(/api\/user\/reset-password/).reply(200, { message: 'Reset ok' });
      
      const result = await passwordApi.resetPassword('token', 'newP', 'a@b.com');
      expect(result.success).toBe(true);
      expect(result.message).toBe('Reset ok');
    });

    it('returns failure on API error', async () => {
      mockAxios.onPost(/api\/user\/reset-password/).reply(400, { message: 'Invalid token' });
      
      const result = await passwordApi.resetPassword('token', 'newP', 'a@b.com');
      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid token');
    });
  });

  describe('adminResetUserPassword', () => {
    it('returns success on 200', async () => {
      mockAxios.onPost(/api\/user\/reset-user-password/).reply(200, { message: 'Admin reset ok' });
      
      const result = await passwordApi.adminResetUserPassword('a@b.com', 'newP');
      expect(result.success).toBe(true);
      expect(result.message).toBe('Admin reset ok');
    });

    it('returns failure on API error', async () => {
      mockAxios.onPost(/api\/user\/reset-user-password/).reply(403, { message: 'Not authorized' });
      
      const result = await passwordApi.adminResetUserPassword('a@b.com', 'newP');
      expect(result.success).toBe(false);
      expect(result.message).toBe('Not authorized');
    });
  });
});
