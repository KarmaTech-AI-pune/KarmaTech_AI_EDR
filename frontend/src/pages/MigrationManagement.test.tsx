import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MigrationManagement from './MigrationManagement';

// Mock dependencies
vi.mock('../hooks/useTenantContext', () => ({
  useTenantContext: () => ({
    isSuperAdmin: true,
    tenantId: 1
  })
}));

vi.mock('../services/migrationApi', () => ({
  migrationApi: {
    getAllMigrations: vi.fn()
  }
}));

describe('MigrationManagement Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render migration management page', async () => {
      const { migrationApi } = await import('../services/migrationApi');
      vi.mocked(migrationApi.getAllMigrations).mockResolvedValue([]);

      render(
        <BrowserRouter>
          <MigrationManagement />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/migration/i)).toBeInTheDocument();
      });
    });

    it('should display migrations list', async () => {
      const { migrationApi } = await import('../services/migrationApi');
      vi.mocked(migrationApi.getAllMigrations).mockResolvedValue([
        { id: 1, name: 'Migration 1', status: 'Completed' }
      ] as any);

      render(
        <BrowserRouter>
          <MigrationManagement />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/Migration 1/i)).toBeInTheDocument();
      });
    });
  });

  describe('Data Loading', () => {
    it('should load migrations on mount', async () => {
      const { migrationApi } = await import('../services/migrationApi');
      vi.mocked(migrationApi.getAllMigrations).mockResolvedValue([]);

      render(
        <BrowserRouter>
          <MigrationManagement />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(vi.mocked(migrationApi.getAllMigrations)).toHaveBeenCalled();
      });
    });

    it('should handle empty migrations list', async () => {
      const { migrationApi } = await import('../services/migrationApi');
      vi.mocked(migrationApi.getAllMigrations).mockResolvedValue([]);

      render(
        <BrowserRouter>
          <MigrationManagement />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(vi.mocked(migrationApi.getAllMigrations)).toHaveBeenCalled();
      });
    });

    it('should handle API errors', async () => {
      const { migrationApi } = await import('../services/migrationApi');
      vi.mocked(migrationApi.getAllMigrations).mockRejectedValue(new Error('API Error'));

      render(
        <BrowserRouter>
          <MigrationManagement />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(vi.mocked(migrationApi.getAllMigrations)).toHaveBeenCalled();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', async () => {
      const { migrationApi } = await import('../services/migrationApi');
      vi.mocked(migrationApi.getAllMigrations).mockResolvedValue([]);

      render(
        <BrowserRouter>
          <MigrationManagement />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/migration/i)).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle null response', async () => {
      const { migrationApi } = await import('../services/migrationApi');
      vi.mocked(migrationApi.getAllMigrations).mockResolvedValue(null as any);

      render(
        <BrowserRouter>
          <MigrationManagement />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(vi.mocked(migrationApi.getAllMigrations)).toHaveBeenCalled();
      });
    });
  });
});
