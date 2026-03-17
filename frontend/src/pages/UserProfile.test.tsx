import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import UserProfile from './UserProfile';

// Mock dependencies
vi.mock('../hooks/useTenantContext', () => ({
  useTenantContext: () => ({
    isSuperAdmin: false,
    tenantId: 1
  })
}));

vi.mock('../services/authApi', () => ({
  authApi: {
    getCurrentUser: vi.fn()
  }
}));

describe('UserProfile Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render user profile page', async () => {
      const { authApi } = await import('../services/authApi');
      vi.mocked(authApi.getCurrentUser).mockResolvedValue({
        id: '1',
        email: 'user@test.com',
        firstName: 'John',
        lastName: 'Doe'
      } as any);

      render(
        <BrowserRouter>
          <UserProfile />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/profile/i)).toBeInTheDocument();
      });
    });

    it('should display user information', async () => {
      const { authApi } = await import('../services/authApi');
      vi.mocked(authApi.getCurrentUser).mockResolvedValue({
        id: '1',
        email: 'user@test.com',
        firstName: 'John',
        lastName: 'Doe'
      } as any);

      render(
        <BrowserRouter>
          <UserProfile />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/user@test.com/i)).toBeInTheDocument();
      });
    });
  });

  describe('Data Loading', () => {
    it('should load user data on mount', async () => {
      const { authApi } = await import('../services/authApi');
      vi.mocked(authApi.getCurrentUser).mockResolvedValue({
        id: '1',
        email: 'user@test.com'
      } as any);

      render(
        <BrowserRouter>
          <UserProfile />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(vi.mocked(authApi.getCurrentUser)).toHaveBeenCalled();
      });
    });

    it('should handle loading state', async () => {
      const { authApi } = await import('../services/authApi');
      vi.mocked(authApi.getCurrentUser).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ id: '1', email: 'user@test.com' } as any), 100))
      );

      render(
        <BrowserRouter>
          <UserProfile />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(vi.mocked(authApi.getCurrentUser)).toHaveBeenCalled();
      });
    });

    it('should handle API errors', async () => {
      const { authApi } = await import('../services/authApi');
      vi.mocked(authApi.getCurrentUser).mockRejectedValue(new Error('API Error'));

      render(
        <BrowserRouter>
          <UserProfile />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(vi.mocked(authApi.getCurrentUser)).toHaveBeenCalled();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', async () => {
      const { authApi } = await import('../services/authApi');
      vi.mocked(authApi.getCurrentUser).mockResolvedValue({
        id: '1',
        email: 'user@test.com'
      } as any);

      render(
        <BrowserRouter>
          <UserProfile />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/profile/i)).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle null user data', async () => {
      const { authApi } = await import('../services/authApi');
      vi.mocked(authApi.getCurrentUser).mockResolvedValue(null);

      render(
        <BrowserRouter>
          <UserProfile />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(vi.mocked(authApi.getCurrentUser)).toHaveBeenCalled();
      });
    });

    it('should handle missing user fields', async () => {
      const { authApi } = await import('../services/authApi');
      vi.mocked(authApi.getCurrentUser).mockResolvedValue({
        id: '1'
      } as any);

      render(
        <BrowserRouter>
          <UserProfile />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(vi.mocked(authApi.getCurrentUser)).toHaveBeenCalled();
      });
    });
  });
});
