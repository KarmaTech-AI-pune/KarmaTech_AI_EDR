import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EnhancedLoginScreen } from './EnhancedLoginScreen';
import { enhancedAuthApi } from '../services/enhancedAuthApi';
import { projectManagementAppContext } from '../App';
import { useAppNavigation } from '../hooks/useAppNavigation';
import { Tenant } from '../models/tenantModel';
import { UserWithRole } from '../types';

// Mock the API service
vi.mock('../services/enhancedAuthApi');
const mockEnhancedAuthApi = enhancedAuthApi as jest.Mocked<typeof enhancedAuthApi>;

// Mock the navigation hook
vi.mock('../hooks/useAppNavigation');
const mockUseAppNavigation = useAppNavigation as jest.MockedFunction<typeof useAppNavigation>;

// Mock the context
const mockSetIsAuthenticated = vi.fn();
const mockSetUser = vi.fn();
const mockHandleLogout = vi.fn();
const mockSetSelectedProject = vi.fn();
const mockSetCurrentGoNoGoDecision = vi.fn();
const mockSetGoNoGoDecisionStatus = vi.fn();
const mockSetGoNoGoVersionNumber = vi.fn();
const mockSetCurrentUser = vi.fn();
const mockSetCanEditOpportunity = vi.fn();
const mockSetCanDeleteOpportunity = vi.fn();
const mockSetCanReviewBD = vi.fn();
const mockSetCanApproveBD = vi.fn();
const mockSetCanSubmitForApproval = vi.fn();
const mockSetProjectCanSubmitForReview = vi.fn();
const mockSetProjectCanSubmitForApproval = vi.fn();
const mockSetProjectCanApprove = vi.fn();

const mockNavigateToHome = vi.fn();

const renderLoginScreen = (isAuthenticated = false) => {
    mockUseAppNavigation.mockReturnValue({
        navigateToHome: mockNavigateToHome,
        navigateToLogin: vi.fn(),
        navigateToBusinessDevelopment: vi.fn(),
        navigateToProjectManagement: vi.fn(),
        navigateToAdmin: vi.fn(),
        navigateToBusinessDevelopmentDetails: vi.fn(),
        navigateToProjectDetails: vi.fn(),
        navigateToGoNoGoForm: vi.fn(),
        navigateToBidPreparation: vi.fn(),
        navigateToProjectResources: vi.fn(),
    });

    return render(
        <projectManagementAppContext.Provider value={{
            isAuthenticated,
            setIsAuthenticated: mockSetIsAuthenticated,
            user: null,
            setUser: mockSetUser,
            handleLogout: mockHandleLogout,
            selectedProject: null,
            setSelectedProject: mockSetSelectedProject,
            currentGoNoGoDecision: null,
            setCurrentGoNoGoDecision: mockSetCurrentGoNoGoDecision,
            goNoGoDecisionStatus: null,
            setGoNoGoDecisionStatus: mockSetGoNoGoDecisionStatus,
            goNoGoVersionNumber: null,
            setGoNoGoVersionNumber: mockSetGoNoGoVersionNumber,
            currentUser: null,
            setCurrentUser: mockSetCurrentUser,
            canEditOpportunity: false,
            setCanEditOpportunity: mockSetCanEditOpportunity,
            canDeleteOpportunity: false,
            setCanDeleteOpportunity: mockSetCanDeleteOpportunity,
            canReviewBD: false,
            setCanReviewBD: mockSetCanReviewBD,
            canApproveBD: false,
            setCanApproveBD: mockSetCanApproveBD,
            canSubmitForApproval: false,
            setCanSubmitForApproval: mockSetCanSubmitForApproval,
            canProjectSubmitForReview: false,
            setProjectCanSubmitForReview: mockSetProjectCanSubmitForReview,
            canProjectSubmitForApproval: false,
            setProjectCanSubmitForApproval: mockSetProjectCanSubmitForApproval,
            canProjectCanApprove: false,
            setProjectCanApprove: mockSetProjectCanApprove,
        }}>
            <EnhancedLoginScreen />
        </projectManagementAppContext.Provider>
    );
};

describe('EnhancedLoginScreen', () => {
    const mockTenants: Tenant[] = [
        { id: 1, name: 'Tenant One', domain: 'tenantone', status: 0, companyName: 'Company A', createdAt: '2023-01-01T00:00:00Z', maxUsers: 10, maxProjects: 5, isActive: true },
        { id: 2, name: 'Tenant Two', domain: 'tenanttwo', status: 0, companyName: 'Company B', createdAt: '2023-01-01T00:00:00Z', maxUsers: 10, maxProjects: 5, isActive: true },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        mockEnhancedAuthApi.getAvailableTenants.mockResolvedValue(mockTenants);
    });

    // Test 1: Renders correctly and fetches tenants
    test('renders EnhancedLoginScreen and fetches available tenants', async () => {
        renderLoginScreen();

        expect(screen.getByText('KarmaTech-AI EDR(Enterprise Digital Runner)')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Super Admin Login/i })).toBeInTheDocument();

        // Check if tenants are fetched and displayed in the select dropdown
        await waitFor(() => {
            expect(mockEnhancedAuthApi.getAvailableTenants).toHaveBeenCalledTimes(1);
        });
        fireEvent.click(screen.getByRole('tab', { name: /Tenant Login/i }));
        await waitFor(() => {
            expect(screen.getByLabelText('Select Tenant')).toBeInTheDocument();
        });
    });

    // Test 2: Handles input changes
    test('handles email and password input changes', async () => {
        renderLoginScreen();

        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        expect(emailInput).toHaveValue('test@example.com');
        expect(passwordInput).toHaveValue('password123');
    });

    // Test 3: Super Admin Login Success
    test('handles super admin login successfully', async () => {
        const mockUser: UserWithRole = {
            id: '1',
            userName: 'superadmin',
            name: 'Super Admin',
            email: 'superadmin@example.com',
            roles: [{ id: 'role1', name: 'SuperAdmin', permissions: [] }],
            standardRate: 0,
            isConsultant: false,
            createdAt: '2023-01-01T00:00:00Z',
            isSuperAdmin: true,
        };
        mockEnhancedAuthApi.superAdminLogin.mockResolvedValue({
            success: true,
            token: 'superadmin-token',
            user: mockUser,
        });

        renderLoginScreen();

        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'superadmin@example.com' } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password' } });
        fireEvent.click(screen.getByRole('button', { name: /Super Admin Login/i }));

        await waitFor(() => {
            expect(mockEnhancedAuthApi.superAdminLogin).toHaveBeenCalledWith({
                email: 'superadmin@example.com',
                password: 'password',
            });
        });
        expect(mockSetUser).toHaveBeenCalledWith(mockUser);
        expect(mockSetIsAuthenticated).toHaveBeenCalledWith(true);
        expect(mockNavigateToHome).toHaveBeenCalledTimes(1);
    });

    // Test 4: Super Admin Login Failure
    test('displays error on super admin login failure', async () => {
        mockEnhancedAuthApi.superAdminLogin.mockResolvedValue({
            success: false,
            message: 'Invalid credentials',
        });

        renderLoginScreen();

        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'wrong@example.com' } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrongpass' } });
        fireEvent.click(screen.getByRole('button', { name: /Super Admin Login/i }));

        await waitFor(() => {
            expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
        });
        expect(mockSetIsAuthenticated).not.toHaveBeenCalled();
        expect(mockNavigateToHome).not.toHaveBeenCalled();
    });

    // Test 5: Tenant Login Success
    test('handles tenant login successfully', async () => {
        const mockUser: UserWithRole = {
            id: '2',
            userName: 'tenantadmin',
            name: 'Tenant Admin',
            email: 'tenantadmin@example.com',
            roles: [{ id: 'role2', name: 'TenantAdmin', permissions: [] }],
            standardRate: 0,
            isConsultant: false,
            createdAt: '2023-01-01T00:00:00Z',
            tenantRole: 'TenantAdmin',
        };
        mockEnhancedAuthApi.tenantLogin.mockResolvedValue({
            success: true,
            token: 'tenantadmin-token',
            user: mockUser,
        });

        renderLoginScreen();

        fireEvent.click(screen.getByRole('tab', { name: /Tenant Login/i }));

        await waitFor(() => {
            expect(screen.getByLabelText('Select Tenant')).toBeInTheDocument();
        });

        // Select a tenant
        fireEvent.mouseDown(screen.getByLabelText('Select Tenant'));
        const tenantOneMenuItem = await screen.findByText('Tenant One');
        fireEvent.click(tenantOneMenuItem);

        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'tenantadmin@example.com' } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password' } });
        fireEvent.click(screen.getByRole('button', { name: /Login to tenantone/i }));

        await waitFor(() => {
            expect(mockEnhancedAuthApi.tenantLogin).toHaveBeenCalledWith(
                { email: 'tenantadmin@example.com', password: 'password' },
                'tenantone'
            );
        });
        expect(mockSetUser).toHaveBeenCalledWith(mockUser);
        expect(mockSetIsAuthenticated).toHaveBeenCalledWith(true);
        expect(mockNavigateToHome).toHaveBeenCalledTimes(1);
    });

    // Test 6: Tenant Login Failure
    test('displays error on tenant login failure', async () => {
        mockEnhancedAuthApi.tenantLogin.mockResolvedValue({
            success: false,
            message: 'Invalid credentials or tenant access denied',
        });

        renderLoginScreen();

        fireEvent.click(screen.getByRole('tab', { name: /Tenant Login/i }));

        await waitFor(() => {
            expect(screen.getByLabelText('Select Tenant')).toBeInTheDocument();
        });

        fireEvent.mouseDown(screen.getByLabelText('Select Tenant'));
        const tenantOneMenuItem = await screen.findByText('Tenant One');
        fireEvent.click(tenantOneMenuItem);

        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'wrong@example.com' } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrongpass' } });
        fireEvent.click(screen.getByRole('button', { name: /Login to tenantone/i }));

        await waitFor(() => {
            expect(screen.getByText('Invalid credentials or tenant access denied')).toBeInTheDocument();
        });
        expect(mockSetIsAuthenticated).not.toHaveBeenCalled();
        expect(mockNavigateToHome).not.toHaveBeenCalled();
    });

    // Test 7: Tab switching
    test('switches between Super Admin and Tenant Login tabs', async () => {
        renderLoginScreen();

        // Initially on Super Admin tab
        expect(screen.getByRole('tab', { name: /Super Admin Login/i })).toHaveAttribute('aria-selected', 'true');
        expect(screen.getByText('Super Administrator Access')).toBeInTheDocument();

        // Switch to Tenant Login tab
        fireEvent.click(screen.getByRole('tab', { name: /Tenant Login/i }));
        expect(screen.getByRole('tab', { name: /Tenant Login/i })).toHaveAttribute('aria-selected', 'true');
        expect(screen.getByText('Tenant-Specific Access')).toBeInTheDocument();
        expect(screen.queryByText('Super Administrator Access')).not.toBeInTheDocument();
    });

    // Test 8: Quick Login for Super Admin
    test('handles quick login for Super Admin', async () => {
        const mockUser: UserWithRole = {
            id: '3',
            userName: 'superadmin',
            name: 'Super Admin',
            email: 'superadmin@example.com',
            roles: [{ id: 'role1', name: 'SuperAdmin', permissions: [] }],
            standardRate: 0,
            isConsultant: false,
            createdAt: '2023-01-01T00:00:00Z',
            isSuperAdmin: true,
        };
        mockEnhancedAuthApi.superAdminLogin.mockResolvedValue({
            success: true,
            token: 'quick-superadmin-token',
            user: mockUser,
        });

        renderLoginScreen();

        fireEvent.click(screen.getByRole('button', { name: /Super Admin/i })); // Quick login button

        await waitFor(() => {
            expect(mockEnhancedAuthApi.superAdminLogin).toHaveBeenCalledWith({
                email: 'superadmin@example.com',
                password: 'password',
            });
        });
        expect(mockSetUser).toHaveBeenCalledWith(mockUser);
        expect(mockSetIsAuthenticated).toHaveBeenCalledWith(true);
        expect(mockNavigateToHome).toHaveBeenCalledTimes(1);
    });

    // Test 9: Quick Login for Tenant Admin
    test('handles quick login for Tenant Admin', async () => {
        const mockUser: UserWithRole = {
            id: '4',
            userName: 'tenantadmin',
            name: 'Tenant Admin',
            email: 'tenantadmin@example.com',
            roles: [{ id: 'role2', name: 'TenantAdmin', permissions: [] }],
            standardRate: 0,
            isConsultant: false,
            createdAt: '2023-01-01T00:00:00Z',
            tenantRole: 'TenantAdmin',
        };
        mockEnhancedAuthApi.tenantLogin.mockResolvedValue({
            success: true,
            token: 'quick-tenantadmin-token',
            user: mockUser,
        });

        renderLoginScreen();

        fireEvent.click(screen.getByRole('tab', { name: /Tenant Login/i }));
        await waitFor(() => {
            expect(screen.getByLabelText('Select Tenant')).toBeInTheDocument();
        });

        fireEvent.mouseDown(screen.getByLabelText('Select Tenant'));
        const tenantOneMenuItem = await screen.findByText('Tenant One');
        fireEvent.click(tenantOneMenuItem);

        fireEvent.click(screen.getByRole('button', { name: /Tenant Admin/i })); // Quick login button

        await waitFor(() => {
            expect(mockEnhancedAuthApi.tenantLogin).toHaveBeenCalledWith(
                { email: 'tenantadmin@example.com', password: 'password' },
                'tenantone'
            );
        });
        expect(mockSetUser).toHaveBeenCalledWith(mockUser);
        expect(mockSetIsAuthenticated).toHaveBeenCalledWith(true);
        expect(mockNavigateToHome).toHaveBeenCalledTimes(1);
    });

    // Test 10: Loading state during tenant fetch
    test('shows loading state when fetching tenants', async () => {
        mockEnhancedAuthApi.getAvailableTenants.mockReturnValue(new Promise(() => { })); // Never resolve

        renderLoginScreen();

        fireEvent.click(screen.getByRole('tab', { name: /Tenant Login/i }));

        await waitFor(() => {
            expect(screen.getByText('Loading tenants...')).toBeInTheDocument();
        });
        expect(screen.getByLabelText('Select Tenant')).toBeDisabled();
    });

    // Test 11: Error state during tenant fetch
    test('displays error if tenant fetch fails', async () => {
        mockEnhancedAuthApi.getAvailableTenants.mockRejectedValue(new Error('Network error'));

        renderLoginScreen();

        await waitFor(() => {
            expect(screen.getByText('Failed to load available tenants')).toBeInTheDocument();
        });
    });

    // Test 12: Loading state during login
    test('shows loading state during super admin login', async () => {
        mockEnhancedAuthApi.superAdminLogin.mockReturnValue(new Promise(() => { })); // Never resolve

        renderLoginScreen();

        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'superadmin@example.com' } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password' } });
        fireEvent.click(screen.getByRole('button', { name: /Super Admin Login/i }));

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /Logging in.../i })).toBeDisabled();
        });
    });

    // Test 13: Error alert closes
    test('error alert can be closed', async () => {
        mockEnhancedAuthApi.superAdminLogin.mockResolvedValue({
            success: false,
            message: 'Invalid credentials',
        });

        renderLoginScreen();

        fireEvent.click(screen.getByRole('button', { name: /Super Admin Login/i }));

        await waitFor(() => {
            expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole('button', { name: /Close/i })); // Close button on Alert

        expect(screen.queryByText('Invalid credentials')).not.toBeInTheDocument();
    });

    // Test 14: Refresh tenants button
    test('refresh tenants button fetches tenants again', async () => {
        renderLoginScreen();

        fireEvent.click(screen.getByRole('tab', { name: /Tenant Login/i }));
        await waitFor(() => {
            expect(screen.getByLabelText('Select Tenant')).toBeInTheDocument();
        });

        // Clear previous calls to ensure we count only the refresh
        mockEnhancedAuthApi.getAvailableTenants.mockClear();
        mockEnhancedAuthApi.getAvailableTenants.mockResolvedValueOnce([
            { id: 3, name: 'Tenant Three', domain: 'tenantthree', status: 0, companyName: 'Company C', createdAt: '2023-01-01T00:00:00Z', maxUsers: 10, maxProjects: 5, isActive: true },
        ]);

        fireEvent.click(screen.getByRole('button', { name: /🔄/i }));

        await waitFor(() => {
            expect(mockEnhancedAuthApi.getAvailableTenants).toHaveBeenCalledTimes(1);
            expect(screen.getByText('Tenant Three')).toBeInTheDocument();
        });
    });

    // Test 15: No tenants available state
    test('displays "No tenants available" when no tenants are fetched', async () => {
        mockEnhancedAuthApi.getAvailableTenants.mockResolvedValue([]);

        renderLoginScreen();

        fireEvent.click(screen.getByRole('tab', { name: /Tenant Login/i }));

        await waitFor(() => {
            expect(screen.getByText('No tenants available')).toBeInTheDocument();
        });
        expect(screen.getByLabelText('Select Tenant')).toBeDisabled();
    });

    // Test 16: Selected tenant information display
    test('displays selected tenant information', async () => {
        renderLoginScreen();

        fireEvent.click(screen.getByRole('tab', { name: /Tenant Login/i }));
        await waitFor(() => {
            expect(screen.getByLabelText('Select Tenant')).toBeInTheDocument();
        });

        fireEvent.mouseDown(screen.getByLabelText('Select Tenant'));
        const tenantOneMenuItem = await screen.findByText('Tenant One');
        fireEvent.click(tenantOneMenuItem);

        await waitFor(() => {
            expect(screen.getByText(/Selected Tenant Information:/i)).toBeInTheDocument();
            expect(screen.getByText(/Name: Tenant One/i)).toBeInTheDocument();
            expect(screen.getByText(/Domain: tenantone.localhost/i)).toBeInTheDocument();
            expect(screen.getByText(/Status:/i)).toBeInTheDocument();
            expect(screen.getByText(/Company: Company A/i)).toBeInTheDocument();
        });
    });
});
