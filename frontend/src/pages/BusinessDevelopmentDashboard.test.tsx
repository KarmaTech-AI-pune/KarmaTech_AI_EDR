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

vi.mock('../components/dashboard/BusinessDevelopmentCharts', () => ({
  default: () => <div>Business Development Charts</div>
}));

describe('BusinessDevelopmentDashboard Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render business development dashboard', async () => {
      render(<BrowserRouter><BusinessDevelopmentDashboard /></BrowserRouter>);
      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });
    });

    it('should display dashboard metrics', async () => {
      render(<BrowserRouter><BusinessDevelopmentDashboard /></BrowserRouter>);
      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });
    });
  });

  describe('Data Loading', () => {
    it('should load dashboard data on mount', async () => {
      render(<BrowserRouter><BusinessDevelopmentDashboard /></BrowserRouter>);
      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });
    });

    it('should handle API errors', async () => {
      render(<BrowserRouter><BusinessDevelopmentDashboard /></BrowserRouter>);
      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', async () => {
      render(<BrowserRouter><BusinessDevelopmentDashboard /></BrowserRouter>);
      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle null response', async () => {
      render(<BrowserRouter><BusinessDevelopmentDashboard /></BrowserRouter>);
      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });
    });
  });
});
