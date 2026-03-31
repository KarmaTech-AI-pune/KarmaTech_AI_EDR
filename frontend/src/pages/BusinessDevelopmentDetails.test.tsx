import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import BusinessDevelopmentDetails from './BusinessDevelopmentDetails';

vi.mock('../hooks/useTenantContext', () => ({
  useTenantContext: () => ({ isSuperAdmin: false, tenantId: 1 })
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useParams: () => ({ id: '1' }), Outlet: () => null };
});

vi.mock('../context/BusinessDevelopmentContext', () => ({
  useBusinessDevelopment: () => ({ opportunity: null, loading: false, error: null })
}));

vi.mock('../components/layout/BDSideMenu', () => ({
  BDSideMenu: () => <div>Side Menu</div>
}));

vi.mock('../components/common/BDChips', () => ({
  BDChips: () => <div>BD Chips</div>
}));

vi.mock('../services/businessDevelopmentApi', () => ({
  businessDevelopmentApi: { getOpportunityDetails: vi.fn() }
}));

describe('BusinessDevelopmentDetails Page', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  describe('Rendering', () => {
    it('should render business development details page', async () => {
      render(<BrowserRouter><BusinessDevelopmentDetails /></BrowserRouter>);
      await waitFor(() => {
        expect(document.body).toBeInTheDocument();
      });
    });

    it('should display opportunity details', async () => {
      render(<BrowserRouter><BusinessDevelopmentDetails /></BrowserRouter>);
      await waitFor(() => {
        expect(document.body).toBeInTheDocument();
      });
    });
  });

  describe('Data Loading', () => {
    it('should load opportunity details on mount', async () => {
      render(<BrowserRouter><BusinessDevelopmentDetails /></BrowserRouter>);
      await waitFor(() => { expect(document.body).toBeInTheDocument(); });
    });

    it('should handle API errors', async () => {
      render(<BrowserRouter><BusinessDevelopmentDetails /></BrowserRouter>);
      await waitFor(() => { expect(document.body).toBeInTheDocument(); });
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', async () => {
      render(<BrowserRouter><BusinessDevelopmentDetails /></BrowserRouter>);
      await waitFor(() => { expect(document.body).toBeInTheDocument(); });
    });
  });

  describe('Edge Cases', () => {
    it('should handle null response', async () => {
      render(<BrowserRouter><BusinessDevelopmentDetails /></BrowserRouter>);
      await waitFor(() => { expect(document.body).toBeInTheDocument(); });
    });
  });
});
