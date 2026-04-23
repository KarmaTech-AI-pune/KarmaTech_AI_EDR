import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DashboardLayout from './DashboardLayout';
import { dashboardService } from '../../services/dashboardService';

// Mock child components to isolate DashboardLayout rendering
vi.mock('./DashboardHeader', () => ({ default: () => <div data-testid="mock-dashboard-header" /> }));
vi.mock('./MetricsGrid', () => ({ default: () => <div data-testid="mock-metrics-grid" /> }));
vi.mock('./PriorityProjectsPanel', () => ({ default: () => <div data-testid="mock-priority-projects" /> }));
vi.mock('./CashflowChart', () => ({ default: () => <div data-testid="mock-cashflow-chart" /> }));
vi.mock('./RegionalPortfolio', () => ({ default: () => <div data-testid="mock-regional-portfolio" /> }));
vi.mock('./NPVProfitability', () => ({ default: () => <div data-testid="mock-npv-profitability" /> }));
vi.mock('./PendingApprovals', () => ({ default: () => <div data-testid="mock-pending-approvals" /> }));
vi.mock('./TaskPriorityMatrix', () => ({ default: () => <div data-testid="mock-task-priority" /> }));
vi.mock('./MilestoneBillingTracker', () => ({ default: () => <div data-testid="mock-milestone-billing" /> }));

// Mock dashboard service
vi.mock('../../services/dashboardService', () => ({
  dashboardService: {
    getPendingForms: vi.fn(),
    getTotalRevenueExpected: vi.fn(),
    getTotalRevenueActual: vi.fn(),
    getProfitMargin: vi.fn(),
    getRevenueAtRisk: vi.fn(),
    getProjectsAtRisk: vi.fn(),
    getMonthlyCashflow: vi.fn(),
    getRegionalPortfolio: vi.fn(),
    getNpvProfitability: vi.fn(),
    getMilestoneBilling: vi.fn(),
    getTaskPriorityMatrix: vi.fn(),
  }
}));

describe('DashboardLayout Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const setupSuccessfulApiCalls = () => {
    vi.mocked(dashboardService.getPendingForms).mockResolvedValue({ totalPendingForms: 5, pendingForms: [] } as any);
    vi.mocked(dashboardService.getTotalRevenueExpected).mockResolvedValue({ totalRevenue: 1000000, changeType: 'Positive' } as any);
    vi.mocked(dashboardService.getTotalRevenueActual).mockResolvedValue({ totalRevenue: 950000, changeType: 'Positive' } as any);
    vi.mocked(dashboardService.getProfitMargin).mockResolvedValue({ profitMargin: 15, changeType: 'Positive' } as any);
    vi.mocked(dashboardService.getRevenueAtRisk).mockResolvedValue({ revenueAtRisk: 50000, changeType: 'Negative' } as any);
    vi.mocked(dashboardService.getProjectsAtRisk).mockResolvedValue({ count: 2, projects: [] } as any);
    vi.mocked(dashboardService.getMonthlyCashflow).mockResolvedValue([]);
    vi.mocked(dashboardService.getRegionalPortfolio).mockResolvedValue([]);
    vi.mocked(dashboardService.getNpvProfitability).mockResolvedValue({
      baseNpv: 0,
      optimisticNpv: 0,
      pessimisticNpv: 0,
      avgProfitabilityIndex: 0,
      projectCount: 0,
      lastUpdated: new Date().toISOString()
    } as any);
    vi.mocked(dashboardService.getMilestoneBilling).mockResolvedValue([]);
    vi.mocked(dashboardService.getTaskPriorityMatrix).mockResolvedValue([]);
  };

  it('shows loading state initially', () => {
    setupSuccessfulApiCalls();
    render(<DashboardLayout />);
    // CircularProgress is a bit hard to select by text, so we check for the implicit progressbar role
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders correctly after data loads', async () => {
    setupSuccessfulApiCalls();
    render(<DashboardLayout />);

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Check that all child components are rendered
    expect(screen.getByTestId('mock-dashboard-header')).toBeInTheDocument();
    expect(screen.getByTestId('mock-metrics-grid')).toBeInTheDocument();
    expect(screen.getByTestId('mock-priority-projects')).toBeInTheDocument();
    expect(screen.getByTestId('mock-cashflow-chart')).toBeInTheDocument();
    expect(screen.getByTestId('mock-regional-portfolio')).toBeInTheDocument();
    expect(screen.getByTestId('mock-npv-profitability')).toBeInTheDocument();
    expect(screen.getByTestId('mock-pending-approvals')).toBeInTheDocument();
    expect(screen.getByTestId('mock-task-priority')).toBeInTheDocument();
    expect(screen.getByTestId('mock-milestone-billing')).toBeInTheDocument();
  });

  it('shows error state if an API call fails', async () => {
    // Make one call fail
    setupSuccessfulApiCalls();
    vi.mocked(dashboardService.getTotalRevenueExpected).mockRejectedValue(new Error('API failure'));

    render(<DashboardLayout />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load dashboard data. Please try again later.')).toBeInTheDocument();
    });

    expect(screen.queryByTestId('mock-dashboard-header')).not.toBeInTheDocument();
  });
});
