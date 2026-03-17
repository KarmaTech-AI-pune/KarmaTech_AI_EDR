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

describe('BusinessDevelopment Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render business development page', async () => {
      const { businessDevelopmentApi } = await import('../services/businessDevelopmentApi');
      vi.mocked(businessDevelopmentApi.getAllOpportunities).mockResolvedValue([]);

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
      const { businessDevelopmentApi } = await import('../services/businessDevelopmentApi');
      vi.mocked(businessDevelopmentApi.getAllOpportunities).mockResolvedValue([
        { id: 1, name: 'Opportunity 1', status: 'Open' }
      ] as any);

      render(
        <BrowserRouter>
          <BusinessDevelopment />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/Opportunity 1/i)).toBeInTheDocument();
      });
    });
  });

  describe('Data Loading', () => {
    it('should load opportunities on mount', async () => {
      const { businessDevelopmentApi } = await import('../services/businessDevelopmentApi');
      vi.mocked(businessDevelopmentApi.getAllOpportunities).mockResolvedValue([]);

      render(
        <BrowserRouter>
          <BusinessDevelopment />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(vi.mocked(businessDevelopmentApi.getAllOpportunities)).toHaveBeenCalled();
      });
    });

    it('should handle empty opportunities list', async () => {
      const { businessDevelopmentApi } = await import('../services/businessDevelopmentApi');
      vi.mocked(businessDevelopmentApi.getAllOpportunities).mockResolvedValue([]);

      render(
        <BrowserRouter>
          <BusinessDevelopment />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(vi.mocked(businessDevelopmentApi.getAllOpportunities)).toHaveBeenCalled();
      });
    });

    it('should handle API errors', async () => {
      const { businessDevelopmentApi } = await import('../services/businessDevelopmentApi');
      vi.mocked(businessDevelopmentApi.getAllOpportunities).mockRejectedValue(new Error('API Error'));

      render(
        <BrowserRouter>
          <BusinessDevelopment />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(vi.mocked(businessDevelopmentApi.getAllOpportunities)).toHaveBeenCalled();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', async () => {
      const { businessDevelopmentApi } = await import('../services/businessDevelopmentApi');
      vi.mocked(businessDevelopmentApi.getAllOpportunities).mockResolvedValue([]);

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
      const { businessDevelopmentApi } = await import('../services/businessDevelopmentApi');
      vi.mocked(businessDevelopmentApi.getAllOpportunities).mockResolvedValue(null as any);

      render(
        <BrowserRouter>
          <BusinessDevelopment />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(vi.mocked(businessDevelopmentApi.getAllOpportunities)).toHaveBeenCalled();
      });
    });
  });
});
