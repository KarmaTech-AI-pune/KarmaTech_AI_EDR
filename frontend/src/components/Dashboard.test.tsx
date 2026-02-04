import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { projectManagementAppContext } from '../App'
import { PermissionType } from '../models'
import { UserWithRole } from '../types'
import Dashboard from './Dashboard'

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
    };
  };

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the dashboard with user name', () => {
    const mockContext = createMockContext()

    render(
      <projectManagementAppContext.Provider value={mockContext}>
        <Dashboard />
      </projectManagementAppContext.Provider>
    )

    expect(screen.getByText(/Welcome, Test User!/i)).toBeInTheDocument()
  })

  it('renders ProjectManagement when user has VIEW_PROJECT permission', () => {
    const mockContext = createMockContext([PermissionType.VIEW_PROJECT])

    render(
      <projectManagementAppContext.Provider value={mockContext}>
        <Dashboard />
      </projectManagementAppContext.Provider>
    )

    expect(screen.getByTestId('project-management')).toBeInTheDocument()
    expect(screen.queryByTestId('business-development')).not.toBeInTheDocument()
  })

  it('renders BusinessDevelopment when user does not have VIEW_PROJECT permission', () => {
    const mockContext = createMockContext([PermissionType.VIEW_BUSINESS_DEVELOPMENT])

    render(
      <projectManagementAppContext.Provider value={mockContext}>
        <Dashboard />
      </projectManagementAppContext.Provider>
    )

    expect(screen.getByTestId('business-development')).toBeInTheDocument()
    expect(screen.queryByTestId('project-management')).not.toBeInTheDocument()
  })

  it('renders all required dashboard components', () => {
    const mockContext = createMockContext()

    render(
      <projectManagementAppContext.Provider value={mockContext}>
        <Dashboard />
      </projectManagementAppContext.Provider>
    )

    expect(screen.getByTestId('resource-management')).toBeInTheDocument()
    expect(screen.getByTestId('reports-list')).toBeInTheDocument()
    expect(screen.getByTestId('notification-center')).toBeInTheDocument()
  })

  // Test case: Displays generic "User" when currentUser name is not available
  it('displays generic "User" when currentUser name is not available', () => {
    const mockContext = createMockContext([], {
      id: '1',
      userName: 'testuser',
      name: '', // Empty name
      email: 'test@example.com',
      roles: [],
      standardRate: 100,
      isConsultant: false,
      createdAt: new Date().toISOString(),
      roleDetails: {
        id: '1',
        name: 'Test Role',
        permissions: []
      }
    })

    render(
      <projectManagementAppContext.Provider value={mockContext}>
        <Dashboard />
      </projectManagementAppContext.Provider>
    )

    expect(screen.getByText(/Welcome, User!/i)).toBeInTheDocument()
  })

  // Test case: Displays generic "User" when currentUser is null
  it('displays generic "User" when currentUser is null', () => {
    const mockContext = createMockContext([], null) // Pass null for currentUser

    render(
      <projectManagementAppContext.Provider value={mockContext}>
        <Dashboard />
      </projectManagementAppContext.Provider>
    )

    expect(screen.getByText(/Welcome, User!/i)).toBeInTheDocument()
  })

  // Test case: Renders AlertsPanel component
  it('renders AlertsPanel component', () => {
    const mockContext = createMockContext()
    render(
      <projectManagementAppContext.Provider value={mockContext}>
        <Dashboard />
      </projectManagementAppContext.Provider>
    )
    expect(screen.getByTestId('alerts-panel')).toBeInTheDocument()
  })
})
