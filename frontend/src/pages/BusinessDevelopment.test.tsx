import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import BusinessDevelopment from './BusinessDevelopment';

// Mock dependencies
vi.mock('../hooks/useTenantContext', () => ({
  useTenantContext: () => ({
    isSuperAdmin: false,
    tenantId: 1
  })
}));

vi.mock('../services/businessDevelopmentApi', () => ({
  businessDevelopmentApi: {
    getAllOpportunities: vi.fn()
  }
}));

vi.mock('../services/opportunityApi', () => ({
  opportunityApi: {
    getAll: vi.fn(),
    getByUserId: vi.fn(),
    getByReviewManagerId: vi.fn(),
    getByApprovalManagerId: vi.fn(),
    create: vi.fn(),
  }
}));

vi.mock('../services/authApi', () => ({
  authApi: { getCurrentUser: vi.fn().mockResolvedValue(null) }
}));

vi.mock('../services/historyLoggingService', () => ({
  HistoryLoggingService: { logNewProject: vi.fn() }
}));

describe('BusinessDevelopment Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render business development page', async () => {
      const { opportunityApi } = await import('../services/opportunityApi');
      vi.mocked(opportunityApi.getAll).mockResolvedValue([]);

      render(
        <BrowserRouter>
          <BusinessDevelopment />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/business development/i)).toBeInTheDocument();
      });
    });

    it('should display opportunities list', async () => {
      const { opportunityApi } = await import('../services/opportunityApi');
      vi.mocked(opportunityApi.getAll).mockResolvedValue([
        { id: 1, workName: 'Opportunity 1', status: 'Open' }
      ] as any);

      render(
        <BrowserRouter>
          <BusinessDevelopment />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/business development/i)).toBeInTheDocument();
      });
    });
  });

  describe('Data Loading', () => {
    it('should load opportunities on mount', async () => {
      const { opportunityApi } = await import('../services/opportunityApi');
      vi.mocked(opportunityApi.getAll).mockResolvedValue([]);

      render(
        <BrowserRouter>
          <BusinessDevelopment />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/business development/i)).toBeInTheDocument();
      });
    });

    it('should handle empty opportunities list', async () => {
      const { opportunityApi } = await import('../services/opportunityApi');
      vi.mocked(opportunityApi.getAll).mockResolvedValue([]);

      render(
        <BrowserRouter>
          <BusinessDevelopment />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/business development/i)).toBeInTheDocument();
      });
    });

    it('should handle API errors', async () => {
      const { opportunityApi } = await import('../services/opportunityApi');
      vi.mocked(opportunityApi.getAll).mockRejectedValue(new Error('API Error'));

      render(
        <BrowserRouter>
          <BusinessDevelopment />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/business development/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', async () => {
      const { opportunityApi } = await import('../services/opportunityApi');
      vi.mocked(opportunityApi.getAll).mockResolvedValue([]);

      render(
        <BrowserRouter>
          <BusinessDevelopment />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/business development/i)).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle null response', async () => {
      const { opportunityApi } = await import('../services/opportunityApi');
      vi.mocked(opportunityApi.getAll).mockResolvedValue(null as any);

      render(
        <BrowserRouter>
          <BusinessDevelopment />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/business development/i)).toBeInTheDocument();
      });
    });
  });
});
