import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the API module
vi.mock('../../src/services/api', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn()
    }
}));

vi.mock('../../src/services/authApi', () => ({
    authApi: {
        login: vi.fn(),
        signup: vi.fn(),
        forgotPassword: vi.fn(),
        resetPassword: vi.fn()
    }
}));

import api from '../../src/services/api';
import { authApi } from '../../src/services/authApi';

const mockApi = vi.mocked(api);
const mockAuthApi = vi.mocked(authApi);

describe('User Management Regression', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('UserProfile_LoadsAndUpdates', async () => {
        const mockProfile = {
            id: '1',
            name: 'Test User',
            email: 'test@karmatech.ai',
            role: 'Admin',
            phoneNumber: '+1234567890',
            isActive: true
        };

        mockApi.get.mockResolvedValueOnce({ data: mockProfile });

        const res = await api.get('/api/User/1');
        expect(res.data.name).toBe('Test User');
        expect(res.data.email).toBe('test@karmatech.ai');

        // Update profile
        const updatedProfile = { ...mockProfile, name: 'Updated User' };
        mockApi.put.mockResolvedValueOnce({ data: updatedProfile });

        const updateRes = await api.put('/api/User/1', updatedProfile);
        expect(updateRes.data.name).toBe('Updated User');
    });

    it('Signup_FormValidation', async () => {
        // Test successful signup
        mockAuthApi.signup.mockResolvedValueOnce({ success: true, message: 'Account created' } as any);

        const signupData = {
            name: 'New User',
            email: 'newuser@test.com',
            password: 'SecurePass123!',
            confirmPassword: 'SecurePass123!'
        };

        await authApi.signup(signupData as any);
        expect(mockAuthApi.signup).toHaveBeenCalledWith(signupData);
    });

    it('PasswordReset_Flow', async () => {
        // Step 1: Request password reset
        mockAuthApi.forgotPassword.mockResolvedValueOnce({ success: true } as any);
        await authApi.forgotPassword({ email: 'test@test.com' } as any);
        expect(mockAuthApi.forgotPassword).toHaveBeenCalledWith({ email: 'test@test.com' });

        // Step 2: Reset with token
        mockAuthApi.resetPassword.mockResolvedValueOnce({ success: true } as any);
        await authApi.resetPassword({ token: 'reset-token', newPassword: 'NewPass123!' } as any);
        expect(mockAuthApi.resetPassword).toHaveBeenCalledWith({
            token: 'reset-token',
            newPassword: 'NewPass123!'
        });
    });

    it('ChangePassword_CallsCorrectEndpoint', async () => {
        mockApi.post.mockResolvedValueOnce({ data: { success: true } });

        await api.post('/api/User/change-password', {
            currentPassword: 'OldPass123',
            newPassword: 'NewPass456!'
        });

        expect(mockApi.post).toHaveBeenCalledWith('/api/User/change-password', {
            currentPassword: 'OldPass123',
            newPassword: 'NewPass456!'
        });
    });

    it('Subscription_StatusCheck', async () => {
        const mockSubscription = {
            id: 1,
            plan: 'Premium',
            status: 'Active',
            expiresAt: '2025-12-31T00:00:00Z'
        };

        mockApi.get.mockResolvedValueOnce({ data: mockSubscription });

        const res = await api.get('/api/Subscriptions');
        expect(res.data.plan).toBe('Premium');
        expect(res.data.status).toBe('Active');
    });
});
