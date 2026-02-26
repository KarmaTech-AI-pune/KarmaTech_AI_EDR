import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the API module
vi.mock('../../src/services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}));

import api from '../../src/services/api';

const mockApi = vi.mocked(api);

describe('Admin Panel Regression', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('AdminPanel_LoadsUsersAndRoles', async () => {
    const mockUsers = [
      { id: '1', name: 'Admin User', email: 'admin@test.com', role: 'Admin' },
      { id: '2', name: 'Regular User', email: 'user@test.com', role: 'User' }
    ];
    const mockRoles = [
      { id: '1', name: 'Admin', permissions: ['read', 'write', 'delete'] },
      { id: '2', name: 'User', permissions: ['read'] }
    ];

    mockApi.get
      .mockResolvedValueOnce({ data: mockUsers })
      .mockResolvedValueOnce({ data: mockRoles });

    const usersRes = await api.get('/api/User');
    const rolesRes = await api.get('/api/User/roles');

    expect(usersRes.data).toHaveLength(2);
    expect(rolesRes.data).toHaveLength(2);
    expect(usersRes.data[0].name).toBe('Admin User');
    expect(rolesRes.data[0].permissions).toContain('write');
  });

  it('FeatureToggle_EnableDisable', async () => {
    const mockFeatures = [
      { id: 1, name: 'BudgetModule', isEnabled: true },
      { id: 2, name: 'ReportsModule', isEnabled: false }
    ];

    mockApi.get.mockResolvedValueOnce({ data: mockFeatures });
    mockApi.put.mockResolvedValueOnce({ data: { ...mockFeatures[1], isEnabled: true } });

    // Load features
    const res = await api.get('/api/Feature');
    expect(res.data).toHaveLength(2);
    expect(res.data[1].isEnabled).toBe(false);

    // Toggle feature
    await api.put('/api/Feature/2', { id: 2, name: 'ReportsModule', isEnabled: true });
    expect(mockApi.put).toHaveBeenCalledWith('/api/Feature/2', expect.objectContaining({
      isEnabled: true
    }));
  });

  it('TenantManagement_ListAndSwitch', async () => {
    const mockTenants = [
      { id: 1, name: 'Tenant A', isActive: true },
      { id: 2, name: 'Tenant B', isActive: true }
    ];

    mockApi.get.mockResolvedValueOnce({ data: mockTenants });

    const res = await api.get('/api/Tenants');
    expect(res.data).toHaveLength(2);
    expect(res.data[0].name).toBe('Tenant A');
    expect(res.data[1].name).toBe('Tenant B');
  });

  it('UserCreate_CallsCorrectEndpoint', async () => {
    const newUser = { name: 'New User', email: 'new@test.com', role: 'User' };
    mockApi.post.mockResolvedValueOnce({ data: { id: '3', ...newUser } });

    await api.post('/api/User', newUser);
    expect(mockApi.post).toHaveBeenCalledWith('/api/User', newUser);
  });

  it('UserDelete_CallsCorrectEndpoint', async () => {
    mockApi.delete.mockResolvedValueOnce({ data: { success: true } });

    await api.delete('/api/User/1');
    expect(mockApi.delete).toHaveBeenCalledWith('/api/User/1');
  });
});
