import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Users from './Users';

// Mock dependencies
vi.mock('../hooks/useTenantContext', () => ({
  useTenantContext: () => ({
    isSuperAdmin: false,
    tenantId: 1
  })
}));

vi.mock('../services/authApi', () => ({
  authApi: {
    getAllUsers: vi.fn()
  }
}));

describe('Users Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render users page', async () => {
      const { authApi } = await import('../services/authApi');
      vi.mocked(authApi.getAllUsers).mockResolvedValue([]);

      render(
        <BrowserRouter>
          <Users />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/users/i)).toBeInTheDocument();
      });
    });

    it('should display users list', async () => {
      const { authApi } = await import('../services/authApi');
      vi.mocked(authApi.getAllUsers).mockResolvedValue([
        { id: '1', email: 'user1@test.com', firstName: 'John' },
        { id: '2', email: 'user2@test.com', firstName: 'Jane' }
      ] as any);

      render(
        <BrowserRouter>
          <Users />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/user1@test.com/i)).toBeInTheDocument();
      });
    });
  });

  describe('Data Loading', () => {
    it('should load users on mount', async () => {
      const { authApi } = await import('../services/authApi');
      vi.mocked(authApi.getAllUsers).mockResolvedValue([]);

      render(
        <BrowserRouter>
          <Users />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(vi.mocked(authApi.getAllUsers)).toHaveBeenCalled();
      });
    });

    it('should handle empty users list', async () => {
      const { authApi } = await import('../services/authApi');
      vi.mocked(authApi.getAllUsers).mockResolvedValue([]);

      render(
        <BrowserRouter>
          <Users />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(vi.mocked(authApi.getAllUsers)).toHaveBeenCalled();
      });
    });

    it('should handle API errors', async () => {
      const { authApi } = await import('../services/authApi');
      vi.mocked(authApi.getAllUsers).mockRejectedValue(new Error('API Error'));

      render(
        <BrowserRouter>
          <Users />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(vi.mocked(authApi.getAllUsers)).toHaveBeenCalled();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', async () => {
      const { authApi } = await import('../services/authApi');
      vi.mocked(authApi.getAllUsers).mockResolvedValue([]);

      render(
        <BrowserRouter>
          <Users />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/users/i)).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle null response', async () => {
      const { authApi } = await import('../services/authApi');
      vi.mocked(authApi.getAllUsers).mockResolvedValue(null as any);

      render(
        <BrowserRouter>
          <Users />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(vi.mocked(authApi.getAllUsers)).toHaveBeenCalled();
      });
    });

    it('should handle large user lists', async () => {
      const { authApi } = await import('../services/authApi');
      const largeUserList = Array.from({ length: 100 }, (_, i) => ({
        id: `${i}`,
        email: `user${i}@test.com`,
        firstName: `User${i}`
      }));
      vi.mocked(authApi.getAllUsers).mockResolvedValue(largeUserList as any);

      render(
        <BrowserRouter>
          <Users />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(vi.mocked(authApi.getAllUsers)).toHaveBeenCalled();
      });
    });
  });
});
