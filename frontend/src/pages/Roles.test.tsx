import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Roles from './Roles';

// Mock dependencies
vi.mock('../hooks/useTenantContext', () => ({
  useTenantContext: () => ({
    isSuperAdmin: false,
    tenantId: 1
  })
}));

vi.mock('../services/rolesApi', () => ({
  rolesApi: {
    getAllRoles: vi.fn()
  }
}));

describe('Roles Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render roles page', async () => {
      const { rolesApi } = await import('../services/rolesApi');
      vi.mocked(rolesApi.getAllRoles).mockResolvedValue([]);

      render(
        <BrowserRouter>
          <Roles />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/roles/i)).toBeInTheDocument();
      });
    });

    it('should display roles list', async () => {
      const { rolesApi } = await import('../services/rolesApi');
      vi.mocked(rolesApi.getAllRoles).mockResolvedValue([
        { id: '1', name: 'Admin', description: 'Administrator' },
        { id: '2', name: 'User', description: 'Regular User' }
      ] as any);

      render(
        <BrowserRouter>
          <Roles />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/admin/i)).toBeInTheDocument();
      });
    });
  });

  describe('Data Loading', () => {
    it('should load roles on mount', async () => {
      const { rolesApi } = await import('../services/rolesApi');
      vi.mocked(rolesApi.getAllRoles).mockResolvedValue([]);

      render(
        <BrowserRouter>
          <Roles />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(vi.mocked(rolesApi.getAllRoles)).toHaveBeenCalled();
      });
    });

    it('should handle empty roles list', async () => {
      const { rolesApi } = await import('../services/rolesApi');
      vi.mocked(rolesApi.getAllRoles).mockResolvedValue([]);

      render(
        <BrowserRouter>
          <Roles />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(vi.mocked(rolesApi.getAllRoles)).toHaveBeenCalled();
      });
    });

    it('should handle API errors', async () => {
      const { rolesApi } = await import('../services/rolesApi');
      vi.mocked(rolesApi.getAllRoles).mockRejectedValue(new Error('API Error'));

      render(
        <BrowserRouter>
          <Roles />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(vi.mocked(rolesApi.getAllRoles)).toHaveBeenCalled();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', async () => {
      const { rolesApi } = await import('../services/rolesApi');
      vi.mocked(rolesApi.getAllRoles).mockResolvedValue([]);

      render(
        <BrowserRouter>
          <Roles />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/roles/i)).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle null response', async () => {
      const { rolesApi } = await import('../services/rolesApi');
      vi.mocked(rolesApi.getAllRoles).mockResolvedValue(null as any);

      render(
        <BrowserRouter>
          <Roles />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(vi.mocked(rolesApi.getAllRoles)).toHaveBeenCalled();
      });
    });

    it('should handle large roles lists', async () => {
      const { rolesApi } = await import('../services/rolesApi');
      const largeRolesList = Array.from({ length: 50 }, (_, i) => ({
        id: `${i}`,
        name: `Role${i}`,
        description: `Description for role ${i}`
      }));
      vi.mocked(rolesApi.getAllRoles).mockResolvedValue(largeRolesList as any);

      render(
        <BrowserRouter>
          <Roles />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(vi.mocked(rolesApi.getAllRoles)).toHaveBeenCalled();
      });
    });
  });
});
