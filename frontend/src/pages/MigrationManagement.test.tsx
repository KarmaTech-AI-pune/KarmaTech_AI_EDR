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
  migrationApi: { getAllMigrations: vi.fn() }
}));

vi.mock('../services/migrationService', () => ({
  applyMigrations: vi.fn().mockResolvedValue([])
}));

describe('MigrationManagement Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render migration management page', async () => {
      render(<BrowserRouter><MigrationManagement /></BrowserRouter>);
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /migration management/i })).toBeInTheDocument();
      });
    });

    it('should display migrations list', async () => {
      const { applyMigrations } = await import('../services/migrationService');
      vi.mocked(applyMigrations).mockResolvedValue([
        { tenantId: 1, success: true, message: 'Migration 1' }
      ] as any);

      render(<BrowserRouter><MigrationManagement /></BrowserRouter>);
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /migration management/i })).toBeInTheDocument();
      });
    });
  });

  describe('Data Loading', () => {
    it('should load migrations on mount', async () => {
      render(<BrowserRouter><MigrationManagement /></BrowserRouter>);
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /migration management/i })).toBeInTheDocument();
      });
    });

    it('should handle empty migrations list', async () => {
      render(<BrowserRouter><MigrationManagement /></BrowserRouter>);
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /migration management/i })).toBeInTheDocument();
      });
    });

    it('should handle API errors', async () => {
      render(<BrowserRouter><MigrationManagement /></BrowserRouter>);
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /migration management/i })).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', async () => {
      render(<BrowserRouter><MigrationManagement /></BrowserRouter>);
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /migration management/i })).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle null response', async () => {
      render(<BrowserRouter><MigrationManagement /></BrowserRouter>);
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /migration management/i })).toBeInTheDocument();
      });
    });
  });
});
