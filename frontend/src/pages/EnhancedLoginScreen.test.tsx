import { vi, describe, expect, beforeEach, afterEach, test, Mocked, MockedFunction } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Mock the API service before other imports
vi.mock('../services/enhancedAuthApi', () => ({
    enhancedAuthApi: {
        getAvailableTenants: vi.fn(),
        superAdminLogin: vi.fn(),
        tenantLogin: vi.fn(),
        logout: vi.fn(),
        checkAuth: vi.fn(),
        getCurrentUser: vi.fn(),
        isTokenExpired: vi.fn(),
        isSuperAdmin: vi.fn(),
        getCurrentTenantContext: vi.fn(),
        login: vi.fn(),
    }
}));

// Mock VersionDisplay
vi.mock('../components/VersionDisplay', () => ({
    default: () => <div data-testid="mock-version-display">Version 1.2.3</div>
}));

// Mock the navigation hook before imports
vi.mock('../hooks/useAppNavigation', () => ({
    useAppNavigation: vi.fn(() => ({
        navigateToHome: vi.fn(),
        navigateToLogin: vi.fn(),
        navigateToBusinessDevelopment: vi.fn(),
        navigateToProjectManagement: vi.fn(),
        navigateToAdmin: vi.fn(),
        navigateToBusinessDevelopmentDetails: vi.fn(),
        navigateToProjectDetails: vi.fn(),
        navigateToGoNoGoForm: vi.fn(),
        navigateToBidPreparation: vi.fn(),
        navigateToProjectResources: vi.fn(),
    })),
}));

import { EnhancedLoginScreen } from './EnhancedLoginScreen';
import { enhancedAuthApi } from '../services/enhancedAuthApi';
import { projectManagementAppContext } from '../App';
import { useAppNavigation } from '../hooks/useAppNavigation';
import { Tenant } from '../models/tenantModel';
import { UserWithRole } from '../types';

const mockEnhancedAuthApi = enhancedAuthApi as Mocked<typeof enhancedAuthApi>;
const mockUseAppNavigation = useAppNavigation as MockedFunction<typeof useAppNavigation>;

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
    const user = userEvent.setup();

    afterEach(() => {
        vi.clearAllMocks();
    });

    const mockTenants: Tenant[] = [
        { id: 1, name: 'Tenant One', domain: 'tenantone', status: 0, companyName: 'Company A', createdAt: '2023-01-01T00:00:00Z', maxUsers: 10, maxProjects: 5, isActive: true, isIsolated: false },
        { id: 2, name: 'Tenant Two', domain: 'tenanttwo', status: 0, companyName: 'Company B', createdAt: '2023-01-01T00:00:00Z', maxUsers: 10, maxProjects: 5, isActive: true, isIsolated: false },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        mockEnhancedAuthApi.getAvailableTenants.mockImplementation(async () => {
            console.log('TEST: Mock getAvailableTenants called');
            return [...mockTenants];
        });
        mockEnhancedAuthApi.tenantLogin.mockImplementation(async (_creds: any, tenant: string) => {
             console.log('TEST: Mock tenantLogin called', tenant);
             return { success: true, token: 'token', user: { id: 'test' } as any }; 
        });
        mockEnhancedAuthApi.superAdminLogin.mockImplementation(async (_creds: any) => {
             console.log('TEST: Mock superAdminLogin called');
             return { success: true, token: 'token', user: { id: 'test' } as any }; 
        });
    });

    // Test 1: Renders correctly and fetches tenants
    test('renders EnhancedLoginScreen and fetches available tenants', async () => {
        renderLoginScreen();

        expect(screen.getByText('KarmaTech-AI EDR(Enterprise Digital Runner)')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Super Admin Login/i })).toBeInTheDocument();

        await waitFor(() => {
            expect(mockEnhancedAuthApi.getAvailableTenants).toHaveBeenCalled();
        }, { timeout: 5000 });
        
        await user.click(screen.getByRole('tab', { name: /Tenant Login/i }));
        
        await waitFor(() => {
            expect(screen.getByRole('combobox', { name: /select tenant/i })).toBeInTheDocument();
        }, { timeout: 5000 });
        
        const tenantSelect = screen.getByRole('combobox', { name: /select tenant/i });
        expect(tenantSelect).toHaveTextContent('Tenant One');
    });

    // Test 2: Handles input changes
    test('handles email and password input changes', async () => {
        renderLoginScreen();

        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');

        await user.type(emailInput, 'test@example.com');
        await user.type(passwordInput, 'password123');

        expect(emailInput).toHaveValue('test@example.com');
        expect(passwordInput).toHaveValue('password123');
    });

    // Test 3: Super Admin Login Success
    test('handles super admin login successfully', async () => {
        const mockUser: UserWithRole = {
            id: '1', userName: 'superadmin', name: 'Super Admin', email: 'superadmin@example.com',
            roles: [{ id: 'role1', name: 'SuperAdmin', permissions: [] }],
            standardRate: 0, isConsultant: false, createdAt: '2023-01-01T00:00:00Z', isSuperAdmin: true,
        };
        mockEnhancedAuthApi.superAdminLogin.mockResolvedValue({
            success: true, token: 'superadmin-token', user: mockUser,
        });

        renderLoginScreen();

        await user.type(screen.getByLabelText('Email'), 'superadmin@example.com');
        await user.type(screen.getByLabelText('Password'), 'password');
        await user.click(screen.getByRole('button', { name: /Super Admin Login/i }));

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
            success: false, message: 'Invalid credentials',
        });

        renderLoginScreen();

        await user.type(screen.getByLabelText('Email'), 'wrong@example.com');
        await user.type(screen.getByLabelText('Password'), 'wrongpass');
        await user.click(screen.getByRole('button', { name: /Super Admin Login/i }));

        await waitFor(() => {
            expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
        }, { timeout: 5000 });
    });

    // Test 5: Tenant Login Success
    test('handles tenant login successfully', async () => {
        const mockUser: UserWithRole = {
            id: '2', userName: 'tenantadmin', name: 'Tenant Admin', email: 'tenantadmin@example.com',
            roles: [{ id: 'role2', name: 'TenantAdmin', permissions: [] }],
            standardRate: 0, isConsultant: false, createdAt: '2023-01-01T00:00:00Z', tenantRole: 'TenantAdmin',
        };
        mockEnhancedAuthApi.tenantLogin.mockResolvedValue({
            success: true, token: 'tenantadmin-token', user: mockUser,
        });

        renderLoginScreen();
        await user.click(screen.getByRole('tab', { name: /Tenant Login/i }));

        const tenantSelect = await screen.findByRole('combobox', { name: /select tenant/i });
        await user.click(tenantSelect);
        
        const listbox = await screen.findByRole('listbox');
        const tenantOneOption = within(listbox).getByRole('option', { name: /tenant one/i });
        await user.click(tenantOneOption);
        await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());

        await user.type(screen.getByLabelText(/Email/i), 'tenantadmin@example.com');
        await user.type(screen.getByLabelText(/Password/i), 'password');
        await user.click(screen.getByRole('button', { name: /Login to tenantone/i }));

        await waitFor(() => {
            expect(mockEnhancedAuthApi.tenantLogin).toHaveBeenCalledWith(
                { email: 'tenantadmin@example.com', password: 'password' },
                'tenantone'
            );
        });
        expect(mockSetUser).toHaveBeenCalledWith(mockUser);
        expect(mockNavigateToHome).toHaveBeenCalledTimes(1);
    });

    // Test 6: Tenant Login Failure
    test('displays error on tenant login failure', async () => {
        mockEnhancedAuthApi.tenantLogin.mockResolvedValue({
            success: false, message: 'Invalid credentials or tenant access denied',
        });

        renderLoginScreen();
        await user.click(screen.getByRole('tab', { name: /Tenant Login/i }));

        const tenantSelect = await screen.findByRole('combobox', { name: /select tenant/i });
        await user.click(tenantSelect);
        const listbox = await screen.findByRole('listbox');
        await user.click(within(listbox).getByRole('option', { name: /tenant one/i }));
        await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());

        await user.type(screen.getByLabelText(/Email/i), 'wrong@example.com');
        await user.type(screen.getByLabelText(/Password/i), 'wrongpass');
        await user.click(screen.getByRole('button', { name: /Login to tenantone/i }));

        await waitFor(() => {
            expect(screen.getByText('Invalid credentials or tenant access denied')).toBeInTheDocument();
        });
    });

    // Test 7: Tab switching
    test('switches between Super Admin and Tenant Login tabs', async () => {
        renderLoginScreen();
        expect(screen.getByRole('tab', { name: /Super Admin Login/i })).toHaveAttribute('aria-selected', 'true');

        await user.click(screen.getByRole('tab', { name: /Tenant Login/i }));
        expect(screen.getByRole('tab', { name: /Tenant Login/i })).toHaveAttribute('aria-selected', 'true');
        expect(screen.getByText('Tenant-Specific Access')).toBeInTheDocument();
    });

    // Test 8: Quick Login for Super Admin
    test('handles quick login for Super Admin', async () => {
        renderLoginScreen();
        await user.click(screen.getByRole('button', { name: /^Super Admin$/i }));

        await waitFor(() => {
            expect(mockEnhancedAuthApi.superAdminLogin).toHaveBeenCalledWith({
                email: 'superadmin@example.com', password: 'password',
            });
        });
        expect(mockNavigateToHome).toHaveBeenCalledTimes(1);
    });

    // Test 9: Quick Login for Tenant Admin
    test('handles quick login for Tenant Admin', async () => {
        renderLoginScreen();
        await user.click(screen.getByRole('tab', { name: /Tenant Login/i }));

        const tenantSelect = await screen.findByRole('combobox', { name: /select tenant/i });
        await user.click(tenantSelect);
        const listbox = await screen.findByRole('listbox');
        await user.click(within(listbox).getByRole('option', { name: /tenant one/i }));
        await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());

        await user.click(screen.getByRole('button', { name: /Tenant Admin/i }));

        await waitFor(() => {
            expect(mockEnhancedAuthApi.tenantLogin).toHaveBeenCalledWith(
                { email: 'tenantadmin@example.com', password: 'password' },
                'tenantone'
            );
        });
        expect(mockNavigateToHome).toHaveBeenCalledTimes(1);
    });

    // Test 10: Loading state during tenant fetch
    test('shows loading state when fetching tenants', async () => {
        mockEnhancedAuthApi.getAvailableTenants.mockReturnValue(new Promise(() => { })); // Never resolve
        renderLoginScreen();
        await user.click(screen.getByRole('tab', { name: /Tenant Login/i }));

        await waitFor(() => {
            expect(screen.getByText('Loading tenants...')).toBeInTheDocument();
        });
        const tenantSelect = screen.getByRole('combobox', { name: /select tenant/i });
        expect(tenantSelect).toHaveAttribute('aria-disabled', 'true');
    });

    // Test 11: Error state during tenant fetch
    test('displays error if tenant fetch fails', async () => {
        mockEnhancedAuthApi.getAvailableTenants.mockRejectedValue(new Error('Network error'));
        renderLoginScreen();

        await waitFor(() => {
            expect(screen.getByText(/Failed to load available tenants/i)).toBeInTheDocument();
        });
    });

    // Test 12: Loading state during login
    test('shows loading state during super admin login', async () => {
        mockEnhancedAuthApi.superAdminLogin.mockReturnValue(new Promise(() => { })); // Never resolve
        renderLoginScreen();

        await user.type(screen.getByLabelText('Email'), 'superadmin@example.com');
        await user.type(screen.getByLabelText('Password'), 'password');
        await user.click(screen.getByRole('button', { name: /Super Admin Login/i }));

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /Logging in.../i })).toBeDisabled();
        });
    });

    // Test 13: Error alert closes
    test('error alert can be closed', async () => {
        mockEnhancedAuthApi.superAdminLogin.mockResolvedValue({
            success: false, message: 'Invalid credentials',
        });
        renderLoginScreen();
        await user.click(screen.getByRole('button', { name: /Super Admin Login/i }));

        await waitFor(() => {
            expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
        });

        await user.click(screen.getByRole('button', { name: /Close/i }));
        await waitFor(() => expect(screen.queryByText('Invalid credentials')).not.toBeInTheDocument());
    });

    // Test 14: Refresh tenants button
    test('refresh tenants button fetches tenants again', async () => {
        renderLoginScreen();
        await user.click(screen.getByRole('tab', { name: /Tenant Login/i }));
        
        // Wait for initial fetch to finish and dropdown to show "Select Tenant" as value or first tenant
        await waitFor(() => {
            expect(screen.getByRole('combobox', { name: /select tenant/i })).toBeInTheDocument();
        }, { timeout: 5000 });

        mockEnhancedAuthApi.getAvailableTenants.mockClear();
        mockEnhancedAuthApi.getAvailableTenants.mockResolvedValueOnce([
            { id: 3, name: 'Tenant Three', domain: 'tenantthree', status: 0, companyName: 'Company C', createdAt: '2023-01-01T00:00:00Z', maxUsers: 10, maxProjects: 5, isActive: true, isIsolated: false },
        ]);

        await user.click(screen.getByRole('button', { name: /🔄/i }));

        await waitFor(() => {
            expect(mockEnhancedAuthApi.getAvailableTenants).toHaveBeenCalledTimes(1);
        });
    });

    // Test 15: No tenants available state
    test('displays "No tenants available" when no tenants are fetched', async () => {
        mockEnhancedAuthApi.getAvailableTenants.mockResolvedValue([]);
        renderLoginScreen();
        await user.click(screen.getByRole('tab', { name: /Tenant Login/i }));

        await waitFor(() => {
            // Check for the text in a more flexible way
            expect(screen.getByText(/No tenants available/i)).toBeInTheDocument();
        }, { timeout: 5000 });
        
        const tenantSelect = screen.getByRole('combobox', { name: /select tenant/i });
        expect(tenantSelect).toHaveAttribute('aria-disabled', 'true');
    });

    // Test 16: Selected tenant information display
    test('displays selected tenant information', async () => {
        renderLoginScreen();
        await user.click(screen.getByRole('tab', { name: /Tenant Login/i }));

        const tenantSelect = await screen.findByRole('combobox', { name: /select tenant/i });
        await user.click(tenantSelect);
        const listbox = await screen.findByRole('listbox');
        await user.click(within(listbox).getByRole('option', { name: /tenant one/i }));
        await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());

        await waitFor(() => {
            expect(screen.getByText(/Selected Tenant Information:/i)).toBeInTheDocument();
            // Use flexible matchers because of <strong> tags splitting text
            expect(screen.getByText(/Name:/i).parentElement).toHaveTextContent(/Tenant One/i);
            expect(screen.getByText(/Domain:/i).parentElement).toHaveTextContent(/tenantone.localhost/i);
            expect(screen.getByText(/Company:/i).parentElement).toHaveTextContent(/Company A/i);
        });
    });
});









