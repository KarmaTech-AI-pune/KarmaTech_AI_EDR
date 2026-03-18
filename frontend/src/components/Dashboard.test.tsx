// import React from 'react';
import { render, screen, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { projectManagementAppContext } from '../App'
import { PermissionType } from '../models'
import { UserWithRole, projectManagementAppContextType } from '../types'
import Dashboard from './Dashboard'

// Mock the dashboard service to avoid API calls
vi.mock('../services/dashboardService', () => ({
  dashboardService: {
    getPendingForms: vi.fn().mockResolvedValue({ totalPendingForms: 0, pendingForms: [] }),
    getTotalRevenueExpected: vi.fn().mockResolvedValue({ totalRevenue: 1000000, changeType: 'positive' }),
    getTotalRevenueActual: vi.fn().mockResolvedValue({ totalRevenue: 950000, changeType: 'positive' }),
    getProfitMargin: vi.fn().mockResolvedValue({ profitMargin: 15.5, changeType: 'positive' }),
    getRevenueAtRisk: vi.fn().mockResolvedValue({ revenueAtRisk: 50000, changeType: 'negative' }),
    getProjectsAtRisk: vi.fn().mockResolvedValue({ projects: [] }),
    getMonthlyCashflow: vi.fn().mockResolvedValue([]),
    getRegionalPortfolio: vi.fn().mockResolvedValue([]),
    getNpvProfitability: vi.fn().mockResolvedValue({ npv: 100000, profitability: 20 }),
    getMilestoneBilling: vi.fn().mockResolvedValue([])
  }
}))

// Mock the chart components to avoid ResizeObserver issues
vi.mock('./dashboard/CashflowChart', () => ({
  default: () => <div data-testid="cashflow-chart">Cashflow Chart</div>
}))

vi.mock('./dashboard/RegionalPortfolio', () => ({
  default: () => <div data-testid="regional-portfolio">Regional Portfolio</div>
}))

vi.mock('./dashboard/MilestoneBillingTracker', () => ({
  default: () => <div data-testid="milestone-billing-tracker">Milestone Billing Tracker</div>
}))

// Mock the child components
vi.mock('./AlertsPanel', () => ({
  AlertsPanel: () => <div data-testid="alerts-panel">Alerts Panel Component</div>
}))

vi.mock('./ResourceManagement', () => ({
  ResourceManagement: () => <div data-testid="resource-management">Resource Management Component</div>
}))

vi.mock('./ReportsList', () => ({
  ReportsList: () => <div data-testid="reports-list">Reports List Component</div>
}))

vi.mock('./navigation/NotificationCenter', () => ({
  NotificationCenter: () => <div data-testid="notification-center">Notification Center Component</div>
}))

vi.mock('../pages', () => ({
  BusinessDevelopment: () => <div data-testid="business-development">Business Development Component</div>,
  ProjectManagement: () => <div data-testid="project-management">Project Management Component</div>
}))

describe('Dashboard Component', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  // Setup mock context values
  // Helper function to create a mock context for testing
  const createMockContext = (
    permissions: PermissionType[] = [],
    currentUserOverride: UserWithRole | null | undefined = undefined // Allows overriding or setting to null
  ): projectManagementAppContextType => {
    const defaultUser: UserWithRole = {
      id: '1',
      userName: 'testuser',
      name: 'Test User',
      email: 'test@example.com',
      roles: [],
      standardRate: 100,
      isConsultant: false,
      createdAt: new Date().toISOString(),
      roleDetails: {
        id: '1',
        name: 'Test Role',
        permissions: permissions,
      },
    };

    const userToUse = currentUserOverride === undefined ? defaultUser : currentUserOverride;

    return {
      // Removed screenState as it's not in projectManagementAppContextType
      isAuthenticated: true,
      setIsAuthenticated: vi.fn(),
      user: userToUse,
      setUser: vi.fn(),
      handleLogout: vi.fn(),
      selectedProject: null,
      setSelectedProject: vi.fn(),
      currentGoNoGoDecision: null,
      setCurrentGoNoGoDecision: vi.fn(),
      goNoGoDecisionStatus: null,
      setGoNoGoDecisionStatus: vi.fn(),
      goNoGoVersionNumber: null,
      setGoNoGoVersionNumber: vi.fn(),
      currentUser: userToUse,
      setCurrentUser: vi.fn(),
      canEditOpportunity: false,
      setCanEditOpportunity: vi.fn(),
      canDeleteOpportunity: false,
      setCanDeleteOpportunity: vi.fn(),
      // canSubmitForReview: false, // Removed as per App.tsx
      // setCanSubmitForReview: vi.fn(), // Removed as per App.tsx
      canReviewBD: false,
      setCanReviewBD: vi.fn(),
      canApproveBD: false,
      setCanApproveBD: vi.fn(),
      canSubmitForApproval: false,
      setCanSubmitForApproval: vi.fn(),
      canProjectSubmitForReview: false,
      setProjectCanSubmitForReview: vi.fn(),
      canProjectSubmitForApproval: false,
      setProjectCanSubmitForApproval: vi.fn(),
      canProjectCanApprove: false,
      setProjectCanApprove: vi.fn(),
    } as any;
  };

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the dashboard and loads data', async () => {
    const mockContext = createMockContext()

    render(
      <projectManagementAppContext.Provider value={mockContext}>
        <Dashboard />
      </projectManagementAppContext.Provider>
    )

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    })

    // Check that the dashboard content is rendered (DashboardLayout components)
    // The Dashboard component renders DashboardLayout which contains various dashboard widgets
    // Check for mocked chart components
    expect(screen.getByTestId('cashflow-chart')).toBeInTheDocument()
    expect(screen.getByTestId('regional-portfolio')).toBeInTheDocument()
    expect(screen.getByTestId('milestone-billing-tracker')).toBeInTheDocument()
  })

  it('shows loading spinner initially', () => {
    const mockContext = createMockContext()

    render(
      <projectManagementAppContext.Provider value={mockContext}>
        <Dashboard />
      </projectManagementAppContext.Provider>
    )

    // Should show loading spinner initially
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('handles API errors gracefully', async () => {
    // Mock API to reject
    const { dashboardService } = await import('../services/dashboardService')
    vi.mocked(dashboardService.getPendingForms).mockRejectedValue(new Error('API Error'))

    const mockContext = createMockContext()

    render(
      <projectManagementAppContext.Provider value={mockContext}>
        <Dashboard />
      </projectManagementAppContext.Provider>
    )

    // Wait for error to appear
    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText(/Failed to load dashboard data/i)).toBeInTheDocument()
    }, { timeout: 5000 })
  })
})






