import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Navbar } from './Navbar';
import { projectManagementAppContext } from '../../App';
import { authApi } from '../../dummyapi/authApi';
import { PermissionType } from '../../models';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock the authApi
vi.mock('../../dummyapi/authApi', () => ({
  authApi: {
    getCurrentUser: vi.fn(),
    logout: vi.fn()
  }
}));

// Mock Material UI components that might cause issues in tests
vi.mock('@mui/material/Menu', () => ({
  default: ({ children, open }: { children: React.ReactNode, open: boolean }) => 
    open ? <div data-testid="menu">{children}</div> : null
}));

describe('Navbar Component', () => {
  // Mock context values
  const mockSetScreenState = vi.fn();
  const mockSetIsAuthenticated = vi.fn();
  
  const defaultContextValue = {
    screenState: 'Dashboard',
    setScreenState: mockSetScreenState,
    isAuthenticated: true,
    setIsAuthenticated: mockSetIsAuthenticated,
    user: {
      id: 'user1',
      name: 'Test User',
      userName: 'testuser',
      email: 'test@example.com',
      roles: [],
      standardRate: 100,
      isConsultant: false,
      createdAt: new Date().toISOString(),
      avatar: '/test-avatar.png'
    },
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
    currentUser: {
      id: 'user1',
      name: 'Test User',
      email: 'test@example.com',
      userName: 'testuser',
      roles: [],
      standardRate: 100,
      isConsultant: false,
      createdAt: new Date().toISOString(),
      roleDetails: {
        id: 'role1',
        name: 'Test Role',
        permissions: []
      }
    },
    setCurrentUser: vi.fn(),
    canEditOpportunity: true,
    setCanEditOpportunity: vi.fn(),
    canDeleteOpportunity: true,
    setCanDeleteOpportunity: vi.fn(),
    canSubmitForReview: true,
    setCanSubmitForReview: vi.fn(),
    canReviewBD: true,
    setCanReviewBD: vi.fn(),
    canApproveBD: true,
    setCanApproveBD: vi.fn(),
    canSubmitForApproval: true,
    setCanSubmitForApproval: vi.fn()
  };

  // Helper function to render with context
  const renderWithContext = (contextValue = defaultContextValue) => {
    return render(
      <projectManagementAppContext.Provider value={contextValue}>
        <Navbar />
      </projectManagementAppContext.Provider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementation for getCurrentUser
    vi.mocked(authApi.getCurrentUser).mockResolvedValue({
      id: 'user1',
      name: 'Test User',
      email: 'test@example.com',
      userName: 'testuser',
      roles: [],
      standardRate: 100,
      isConsultant: false,
      createdAt: new Date().toISOString(),
      roleDetails: {
        id: 'role1',
        name: 'Test Role',
        permissions: []
      }
    });
  });

  it('renders the logo', () => {
    renderWithContext();
    
    // Check for logo image
    const logoImage = screen.getAllByAltText('NJSEI ISO 9000');
    expect(logoImage.length).toBeGreaterThan(0); // Should have at least one logo (mobile or desktop)
  });

  it('renders navigation links based on user permissions', async () => {
    // Mock user with specific permissions
    vi.mocked(authApi.getCurrentUser).mockResolvedValue({
      id: 'user1',
      name: 'Test User',
      email: 'test@example.com',
      userName: 'testuser',
      roles: [],
      standardRate: 100,
      isConsultant: false,
      createdAt: new Date().toISOString(),
      roleDetails: {
        id: 'role1',
        name: 'Test Role',
        permissions: [
          PermissionType.VIEW_BUSINESS_DEVELOPMENT,
          PermissionType.VIEW_PROJECT
        ]
      }
    });
    
    renderWithContext();
    
    // First, wait for the API call to be made
    await waitFor(() => {
      expect(authApi.getCurrentUser).toHaveBeenCalled();
    });
    
    // Then, wait for the navigation links to appear
    const bdLink = await screen.findByTestId('desktop-nav-business-development', {}, { timeout: 3000 });
    expect(bdLink).toBeInTheDocument();
    
    const pmLink = await screen.findByTestId('desktop-nav-project-management', {}, { timeout: 3000 });
    expect(pmLink).toBeInTheDocument();
  });

  it('does not render navigation links when user lacks permissions', async () => {
    // Mock user with no permissions
    vi.mocked(authApi.getCurrentUser).mockResolvedValue({
      id: 'user1',
      name: 'Test User',
      email: 'test@example.com',
      userName: 'testuser',
      roles: [],
      standardRate: 100,
      isConsultant: false,
      createdAt: new Date().toISOString(),
      roleDetails: {
        id: 'role1',
        name: 'Test Role',
        permissions: []
      }
    });
    
    renderWithContext();
    
    // Wait for permissions check to complete
    await waitFor(() => {
      expect(authApi.getCurrentUser).toHaveBeenCalled();
    });
    
    // Verify navigation links are not present
    expect(screen.queryByText('Business Development')).not.toBeInTheDocument();
    expect(screen.queryByText('Project Management')).not.toBeInTheDocument();
  });

  it('shows admin icon when user has admin permissions', async () => {
    // Mock user with admin permissions
    vi.mocked(authApi.getCurrentUser).mockResolvedValue({
      id: 'user1',
      name: 'Test User',
      email: 'test@example.com',
      userName: 'testuser',
      roles: [],
      standardRate: 100,
      isConsultant: false,
      createdAt: new Date().toISOString(),
      roleDetails: {
        id: 'role1',
        name: 'Test Role',
        permissions: [PermissionType.SYSTEM_ADMIN]
      }
    });
    
    renderWithContext();
    
    // Wait for permissions check to complete
    await waitFor(() => {
      // Look for the admin icon (AdminPanelSettingsIcon)
      const adminIcon = screen.getByLabelText('Admin Panel');
      expect(adminIcon).toBeInTheDocument();
    });
  });

  it('does not show admin icon when user lacks admin permissions', async () => {
    // Mock user without admin permissions
    vi.mocked(authApi.getCurrentUser).mockResolvedValue({
      id: 'user1',
      name: 'Test User',
      email: 'test@example.com',
      userName: 'testuser',
      roles: [],
      standardRate: 100,
      isConsultant: false,
      createdAt: new Date().toISOString(),
      roleDetails: {
        id: 'role1',
        name: 'Test Role',
        permissions: [PermissionType.VIEW_PROJECT] // Not admin
      }
    });
    
    renderWithContext();
    
    // Wait for permissions check to complete
    await waitFor(() => {
      expect(authApi.getCurrentUser).toHaveBeenCalled();
    });
    
    // Verify admin icon is not present
    expect(screen.queryByLabelText('Admin Panel')).not.toBeInTheDocument();
  });

  it('opens user menu when avatar is clicked', async () => {
    renderWithContext();
    
    // Find and click the avatar
    const avatar = screen.getByAltText('Test User');
    fireEvent.click(avatar);
    
    // Check that the menu is open
    await waitFor(() => {
      const menu = screen.getByTestId('menu');
      expect(menu).toBeInTheDocument();
      
      // Check for menu items
      expect(screen.getByText('Profile')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText('Notifications')).toBeInTheDocument();
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });
  });

  it('calls logout function when logout menu item is clicked', async () => {
    // Mock successful logout
    vi.mocked(authApi.logout).mockResolvedValue(undefined);
    
    renderWithContext();
    
    // Open the user menu
    const avatar = screen.getByAltText('Test User');
    fireEvent.click(avatar);
    
    // Wait for menu to open and click logout
    await waitFor(() => {
      const logoutMenuItem = screen.getByText('Logout');
      fireEvent.click(logoutMenuItem);
    });
    
    // Verify logout was called and state was updated
    await waitFor(() => {
      expect(authApi.logout).toHaveBeenCalled();
      expect(mockSetIsAuthenticated).toHaveBeenCalledWith(false);
      expect(mockSetScreenState).toHaveBeenCalledWith('Login');
    });
  });

  it('navigates to correct screen when logo is clicked', () => {
    renderWithContext();
    
    // Find and click the logo
    const logoImages = screen.getAllByAltText('NJSEI ISO 9000');
    fireEvent.click(logoImages[0]); // Click the first logo (could be mobile or desktop)
    
    // Verify navigation to Dashboard
    expect(mockSetScreenState).toHaveBeenCalledWith('Dashboard');
  });

  it('navigates to correct screen when navigation link is clicked', async () => {
    // Mock user with permissions
    vi.mocked(authApi.getCurrentUser).mockResolvedValue({
      id: 'user1',
      name: 'Test User',
      email: 'test@example.com',
      userName: 'testuser',
      roles: [],
      standardRate: 100,
      isConsultant: false,
      createdAt: new Date().toISOString(),
      roleDetails: {
        id: 'role1',
        name: 'Test Role',
        permissions: [PermissionType.VIEW_BUSINESS_DEVELOPMENT]
      }
    });
    
    renderWithContext();
    
    // First, wait for the API call to be made
    await waitFor(() => {
      expect(authApi.getCurrentUser).toHaveBeenCalled();
    });
    
    // Then, wait for the Business Development link to appear
    const bdLink = await screen.findByTestId('desktop-nav-business-development', {}, { timeout: 3000 });
    expect(bdLink).toBeInTheDocument();
    
    // Click the link
    fireEvent.click(bdLink);
    
    // Verify navigation
    expect(mockSetScreenState).toHaveBeenCalledWith('Business Development');
  });

  it('navigates to admin panel when admin icon is clicked', async () => {
    // Mock user with admin permissions
    vi.mocked(authApi.getCurrentUser).mockResolvedValue({
      id: 'user1',
      name: 'Test User',
      email: 'test@example.com',
      userName: 'testuser',
      roles: [],
      standardRate: 100,
      isConsultant: false,
      createdAt: new Date().toISOString(),
      roleDetails: {
        id: 'role1',
        name: 'Test Role',
        permissions: [PermissionType.SYSTEM_ADMIN]
      }
    });
    
    renderWithContext();
    
    // Wait for admin icon to be rendered and click it
    await waitFor(() => {
      const adminIcon = screen.getByLabelText('Admin Panel');
      fireEvent.click(adminIcon);
    });
    
    // Verify navigation to Admin Panel
    expect(mockSetScreenState).toHaveBeenCalledWith('Admin Panel');
  });

  it('handles error during logout', async () => {
    // Mock console.error to prevent test output pollution
    const originalConsoleError = console.error;
    console.error = vi.fn();
    
    // Mock failed logout
    const logoutError = new Error('Logout failed');
    vi.mocked(authApi.logout).mockRejectedValue(logoutError);
    
    renderWithContext();
    
    // Open the user menu
    const avatar = screen.getByAltText('Test User');
    fireEvent.click(avatar);
    
    // Wait for menu to open and click logout
    await waitFor(() => {
      const logoutMenuItem = screen.getByText('Logout');
      fireEvent.click(logoutMenuItem);
    });
    
    // Verify error was logged
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Logout failed:', logoutError);
      // State should not be updated on error
      expect(mockSetIsAuthenticated).not.toHaveBeenCalled();
      expect(mockSetScreenState).not.toHaveBeenCalledWith('Login');
    });
    
    // Restore console.error
    console.error = originalConsoleError;
  });
});
