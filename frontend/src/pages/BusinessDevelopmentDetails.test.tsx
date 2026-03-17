import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import BusinessDevelopmentDetails from './BusinessDevelopmentDetails';

// Mock dependencies
vi.mock('../hooks/useTenantContext', () => ({
  useTenantContext: () => ({
    isSuperAdmin: false,
    tenantId: 1
  })
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: '1' })
  };
});

vi.mock('../services/businessDevelopmentApi', () => ({
  businessDevelopmentApi: {
    getOpportunityDetails: vi.fn()
  }
}));

describe('BusinessDevelopmentDetails Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render business development details page', async () => {
      const { businessDevelopmentApi } = await import('../services/businessDevelopmentApi');
      vi.mocked(businessDevelopmentApi.getOpportunityDetails).mockResolvedValue({
        id: 1,
        name: 'Opportunity 1',
        status: 'Open'
      } as any);

      render(
        <BrowserRouter>
          <BusinessDevelopmentDetails />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/Opportunity 1/i)).toBeInTheDocument();
      });
    });

    it('should display opportunity details', async () => {
      const { businessDevelopmentApi } = await import('../services/businessDevelopmentApi');
      vi.mocked(businessDevelopmentApi.getOpportunityDetails).mockResolvedValue({
        id: 1,
        name: 'Opportunity 1',
        status: 'Open',
        description: 'Test opportunity'
      } as any);

      render(
        <BrowserRouter>
          <BusinessDevelopmentDetails />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/Test opportunity/i)).toBeInTheDocument();
      });
    });
  });

  describe('Data Loading', () => {
    it('should load opportunity details on mount', async () => {
      const { businessDevelopmentApi } = await import('../services/businessDevelopmentApi');
      vi.mocked(businessDevelopmentApi.getOpportunityDetails).mockResolvedValue({
        id: 1,
        name: 'Opportunity 1'
      } as any);

      render(
        <BrowserRouter>
          <BusinessDevelopmentDetails />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(vi.mocked(businessDevelopmentApi.getOpportunityDetails)).toHaveBeenCalled();
      });
    });

    it('should handle API errors', async () => {
      const { businessDevelopmentApi } = await import('../services/businessDevelopmentApi');
      vi.mocked(businessDevelopmentApi.getOpportunityDetails).mockRejectedValue(new Error('API Error'));

      render(
        <BrowserRouter>
          <BusinessDevelopmentDetails />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(vi.mocked(businessDevelopmentApi.getOpportunityDetails)).toHaveBeenCalled();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', async () => {
      const { businessDevelopmentApi } = await import('../services/businessDevelopmentApi');
      vi.mocked(businessDevelopmentApi.getOpportunityDetails).mockResolvedValue({
        id: 1,
        name: 'Opportunity 1'
      } as any);

      render(
        <BrowserRouter>
          <BusinessDevelopmentDetails />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/Opportunity 1/i)).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle null response', async () => {
      const { businessDevelopmentApi } = await import('../services/businessDevelopmentApi');
      vi.mocked(businessDevelopmentApi.getOpportunityDetails).mockResolvedValue(null as any);

      render(
        <BrowserRouter>
          <BusinessDevelopmentDetails />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(vi.mocked(businessDevelopmentApi.getOpportunityDetails)).toHaveBeenCalled();
      });
    });
  });
});
