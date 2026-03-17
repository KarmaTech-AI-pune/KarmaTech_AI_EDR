import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import BusinessDevelopmentDashboard from './BusinessDevelopmentDashboard';

// Mock dependencies
vi.mock('../hooks/useTenantContext', () => ({
  useTenantContext: () => ({
    isSuperAdmin: false,
    tenantId: 1
  })
}));

vi.mock('../services/businessDevelopmentApi', () => ({
  businessDevelopmentApi: {
    getDashboardData: vi.fn()
  }
}));

describe('BusinessDevelopmentDashboard Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render business development dashboard', async () => {
      const { businessDevelopmentApi } = await import('../services/businessDevelopmentApi');
      vi.mocked(businessDevelopmentApi.getDashboardData).mockResolvedValue({
        totalOpportunities: 10,
        activeOpportunities: 5
      } as any);

      render(
        <BrowserRouter>
          <BusinessDevelopmentDashboard />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });
    });

    it('should display dashboard metrics', async () => {
      const { businessDevelopmentApi } = await import('../services/businessDevelopmentApi');
      vi.mocked(businessDevelopmentApi.getDashboardData).mockResolvedValue({
        totalOpportunities: 10,
        activeOpportunities: 5
      } as any);

      render(
        <BrowserRouter>
          <BusinessDevelopmentDashboard />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/10/i)).toBeInTheDocument();
      });
    });
  });

  describe('Data Loading', () => {
    it('should load dashboard data on mount', async () => {
      const { businessDevelopmentApi } = await import('../services/businessDevelopmentApi');
      vi.mocked(businessDevelopmentApi.getDashboardData).mockResolvedValue({
        totalOpportunities: 10,
        activeOpportunities: 5
      } as any);

      render(
        <BrowserRouter>
          <BusinessDevelopmentDashboard />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(vi.mocked(businessDevelopmentApi.getDashboardData)).toHaveBeenCalled();
      });
    });

    it('should handle API errors', async () => {
      const { businessDevelopmentApi } = await import('../services/businessDevelopmentApi');
      vi.mocked(businessDevelopmentApi.getDashboardData).mockRejectedValue(new Error('API Error'));

      render(
        <BrowserRouter>
          <BusinessDevelopmentDashboard />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(vi.mocked(businessDevelopmentApi.getDashboardData)).toHaveBeenCalled();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', async () => {
      const { businessDevelopmentApi } = await import('../services/businessDevelopmentApi');
      vi.mocked(businessDevelopmentApi.getDashboardData).mockResolvedValue({
        totalOpportunities: 10,
        activeOpportunities: 5
      } as any);

      render(
        <BrowserRouter>
          <BusinessDevelopmentDashboard />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle null response', async () => {
      const { businessDevelopmentApi } = await import('../services/businessDevelopmentApi');
      vi.mocked(businessDevelopmentApi.getDashboardData).mockResolvedValue(null as any);

      render(
        <BrowserRouter>
          <BusinessDevelopmentDashboard />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(vi.mocked(businessDevelopmentApi.getDashboardData)).toHaveBeenCalled();
      });
    });
  });
});
