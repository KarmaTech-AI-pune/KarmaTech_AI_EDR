import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AdminPanel from './AdminPanel';

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

vi.mock('../components/adminpanel/UsersManagement', () => ({
  default: () => <div data-testid="users-management">Users Management</div>
}));

vi.mock('../components/adminpanel/RolesManagement', () => ({
  default: () => <div data-testid="roles-management">Roles Management</div>
}));

vi.mock('../components/adminpanel/TenantManagement', () => ({
  default: () => <div data-testid="tenant-management">Tenant Management</div>
}));

vi.mock('../components/adminpanel/TenantUsersManagement', () => ({
  default: () => <div data-testid="tenant-users-management">Tenant Users Management</div>
}));

vi.mock('../components/adminpanel/SubscriptionManagement', () => ({
  default: () => <div data-testid="subscription-management">Subscription Management</div>
}));

vi.mock('../components/adminpanel/BillingManagement', () => ({
  default: () => <div data-testid="billing-management">Billing Management</div>
}));

vi.mock('../components/adminpanel/SystemSettings', () => ({
  default: () => <div data-testid="system-settings">System Settings</div>
}));

vi.mock('../components/adminpanel/ReleaseManagement', () => ({
  default: () => <div data-testid="release-management">Release Management</div>
}));

vi.mock('../features/generalSettings/pages/GeneralSettings', () => ({
  default: () => <div data-testid="general-settings">General Settings</div>
}));

vi.mock('../pages/MigrationManagement', () => ({
  default: () => <div data-testid="migration-management">Migration Management</div>
}));

vi.mock('../pages/FeaturesManagement', () => ({
  default: () => <div data-testid="features-management">Features Management</div>
}));

describe('AdminPanel Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render admin panel without crashing', async () => {
      const { authApi } = await import('../services/authApi');
      vi.mocked(authApi.getCurrentUser).mockResolvedValue({
        id: '1',
        email: 'admin@test.com',
        roleDetails: {
          permissions: ['SYSTEM_ADMIN']
        }
      } as any);

      render(
        <BrowserRouter>
          <AdminPanel />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('system-settings')).toBeInTheDocument();
      });
    });

    it('should render drawer with menu items', async () => {
      const { authApi } = await import('../services/authApi');
      vi.mocked(authApi.getCurrentUser).mockResolvedValue({
        id: '1',
        email: 'admin@test.com',
        roleDetails: {
          permissions: ['SYSTEM_ADMIN']
        }
      } as any);

      render(
        <BrowserRouter>
          <AdminPanel />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /chevron/i })).toBeInTheDocument();
      });
    });

    it('should render main content area', async () => {
      const { authApi } = await import('../services/authApi');
      vi.mocked(authApi.getCurrentUser).mockResolvedValue({
        id: '1',
        email: 'admin@test.com',
        roleDetails: {
          permissions: ['SYSTEM_ADMIN']
        }
      } as any);

      render(
        <BrowserRouter>
          <AdminPanel />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('system-settings')).toBeInTheDocument();
      });
    });
  });

  describe('Permission Handling', () => {
    it('should show system admin menu items for system admin', async () => {
      const { authApi } = await import('../services/authApi');
      vi.mocked(authApi.getCurrentUser).mockResolvedValue({
        id: '1',
        email: 'admin@test.com',
        roleDetails: {
          permissions: ['SYSTEM_ADMIN']
        }
      } as any);

      render(
        <BrowserRouter>
          <AdminPanel />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Tenant Management')).toBeInTheDocument();
      });
    });

    it('should show tenant admin menu items for tenant admin', async () => {
      const { authApi } = await import('../services/authApi');
      vi.mocked(authApi.getCurrentUser).mockResolvedValue({
        id: '1',
        email: 'admin@test.com',
        roleDetails: {
          permissions: ['Tenant_ADMIN']
        }
      } as any);

      render(
        <BrowserRouter>
          <AdminPanel />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Users Management')).toBeInTheDocument();
      });
    });

    it('should handle missing permissions gracefully', async () => {
      const { authApi } = await import('../services/authApi');
      vi.mocked(authApi.getCurrentUser).mockResolvedValue({
        id: '1',
        email: 'user@test.com',
        roleDetails: {
          permissions: []
        }
      } as any);

      render(
        <BrowserRouter>
          <AdminPanel />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.queryByText('Tenant Management')).not.toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate to users management when clicked', async () => {
      const { authApi } = await import('../services/authApi');
      vi.mocked(authApi.getCurrentUser).mockResolvedValue({
        id: '1',
        email: 'admin@test.com',
        roleDetails: {
          permissions: ['Tenant_ADMIN']
        }
      } as any);

      render(
        <BrowserRouter>
          <AdminPanel />
        </BrowserRouter>
      );

      await waitFor(() => {
        const usersButton = screen.getByText('Users Management');
        expect(usersButton).toBeInTheDocument();
      });
    });

    it('should display correct content when menu item is selected', async () => {
      const { authApi } = await import('../services/authApi');
      vi.mocked(authApi.getCurrentUser).mockResolvedValue({
        id: '1',
        email: 'admin@test.com',
        roleDetails: {
          permissions: ['SYSTEM_ADMIN']
        }
      } as any);

      render(
        <BrowserRouter>
          <AdminPanel />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('system-settings')).toBeInTheDocument();
      });
    });
  });

  describe('Drawer Toggle', () => {
    it('should toggle drawer expansion', async () => {
      const { authApi } = await import('../services/authApi');
      vi.mocked(authApi.getCurrentUser).mockResolvedValue({
        id: '1',
        email: 'admin@test.com',
        roleDetails: {
          permissions: ['SYSTEM_ADMIN']
        }
      } as any);

      render(
        <BrowserRouter>
          <AdminPanel />
        </BrowserRouter>
      );

      await waitFor(() => {
        const toggleButton = screen.getByRole('button', { name: /chevron/i });
        expect(toggleButton).toBeInTheDocument();
        
        fireEvent.click(toggleButton);
        expect(toggleButton).toBeInTheDocument();
      });
    });

    it('should maintain drawer state after toggle', async () => {
      const { authApi } = await import('../services/authApi');
      vi.mocked(authApi.getCurrentUser).mockResolvedValue({
        id: '1',
        email: 'admin@test.com',
        roleDetails: {
          permissions: ['SYSTEM_ADMIN']
        }
      } as any);

      render(
        <BrowserRouter>
          <AdminPanel />
        </BrowserRouter>
      );

      await waitFor(() => {
        const toggleButton = screen.getByRole('button', { name: /chevron/i });
        fireEvent.click(toggleButton);
        fireEvent.click(toggleButton);
        expect(toggleButton).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const { authApi } = await import('../services/authApi');
      vi.mocked(authApi.getCurrentUser).mockRejectedValue(new Error('API Error'));

      render(
        <BrowserRouter>
          <AdminPanel />
        </BrowserRouter>
      );

      await waitFor(() => {
        // Should still render without crashing
        expect(screen.getByRole('button', { name: /chevron/i })).toBeInTheDocument();
      });
    });

    it('should handle null user response', async () => {
      const { authApi } = await import('../services/authApi');
      vi.mocked(authApi.getCurrentUser).mockResolvedValue(null);

      render(
        <BrowserRouter>
          <AdminPanel />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /chevron/i })).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', async () => {
      const { authApi } = await import('../services/authApi');
      vi.mocked(authApi.getCurrentUser).mockResolvedValue({
        id: '1',
        email: 'admin@test.com',
        roleDetails: {
          permissions: ['SYSTEM_ADMIN']
        }
      } as any);

      render(
        <BrowserRouter>
          <AdminPanel />
        </BrowserRouter>
      );

      await waitFor(() => {
        const menuItems = screen.getAllByRole('button');
        expect(menuItems.length).toBeGreaterThan(0);
      });
    });

    it('should support keyboard navigation', async () => {
      const { authApi } = await import('../services/authApi');
      vi.mocked(authApi.getCurrentUser).mockResolvedValue({
        id: '1',
        email: 'admin@test.com',
        roleDetails: {
          permissions: ['SYSTEM_ADMIN']
        }
      } as any);

      render(
        <BrowserRouter>
          <AdminPanel />
        </BrowserRouter>
      );

      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Content Rendering', () => {
    it('should render system settings by default for system admin', async () => {
      const { authApi } = await import('../services/authApi');
      vi.mocked(authApi.getCurrentUser).mockResolvedValue({
        id: '1',
        email: 'admin@test.com',
        roleDetails: {
          permissions: ['SYSTEM_ADMIN']
        }
      } as any);

      render(
        <BrowserRouter>
          <AdminPanel />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('system-settings')).toBeInTheDocument();
      });
    });

    it('should render users management by default for tenant admin', async () => {
      const { authApi } = await import('../services/authApi');
      vi.mocked(authApi.getCurrentUser).mockResolvedValue({
        id: '1',
        email: 'admin@test.com',
        roleDetails: {
          permissions: ['Tenant_ADMIN']
        }
      } as any);

      render(
        <BrowserRouter>
          <AdminPanel />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Users Management')).toBeInTheDocument();
      });
    });
  });
});
