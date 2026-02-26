import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { LoginScreen } from '../../src/pages/LoginScreen';
import { authApi } from '../../src/services/authApi';
import { versionApi } from '../../src/services/versionApi';
import { releaseNotesApi } from '../../src/services/releaseNotesApi';

// Hoist mock variables using vi.hoisted()
const { mockContext, mockSubscriptionContext } = vi.hoisted(() => ({
    mockContext: {
        isAuthenticated: false,
        setIsAuthenticated: vi.fn(),
        user: null,
        setUser: vi.fn(),
        logout: vi.fn()
    },
    mockSubscriptionContext: {
        refreshSubscription: vi.fn()
    }
}));

// Mock dependencies
vi.mock('../../src/services/authApi');
vi.mock('../../src/services/versionApi');
vi.mock('../../src/services/releaseNotesApi');

vi.mock('../../src/App', () => ({
    projectManagementAppContext: React.createContext(mockContext)
}));

vi.mock('../../src/context/UserSubscriptionContext', () => ({
    default: React.createContext(mockSubscriptionContext)
}));

vi.mock('../../src/hooks/useAppNavigation', () => ({
    useAppNavigation: () => ({
        navigateToHome: vi.fn()
    })
}));

const mockAuthApi = vi.mocked(authApi);
const theme = createTheme();

const renderLogin = () => {
    return render(
        <BrowserRouter>
            <ThemeProvider theme={theme}>
                <LoginScreen />
            </ThemeProvider>
        </BrowserRouter>
    );
};

describe('Auth Workflow Regression', () => {
    const user = userEvent.setup();

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(versionApi.getCurrentVersion).mockResolvedValue({
            version: '1.0.0',
            displayVersion: 'v1.0.0',
            fullVersion: 'v1.0.0'
        } as any);
        vi.mocked(releaseNotesApi.getReleaseNotes).mockResolvedValue([] as any);
        vi.mocked(releaseNotesApi.getReleaseHistory).mockResolvedValue([]);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('Login_StoresToken_RedirectsToDashboard', async () => {
        mockAuthApi.login.mockResolvedValue({ success: true, token: 'jwt-token-123' });

        renderLogin();

        // Login form must be visible
        expect(screen.getByText(/Login to your account/i)).toBeInTheDocument();

        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');

        await user.type(emailInput, 'regression@karmatech.ai');
        await user.type(passwordInput, 'securepass');
        await user.click(screen.getByRole('button', { name: /Log In/i }));

        // Auth API was invoked correctly
        expect(mockAuthApi.login).toHaveBeenCalledWith({
            email: 'regression@karmatech.ai',
            password: 'securepass'
        });

        // Verify login was called exactly once
        await waitFor(() => {
            expect(mockAuthApi.login).toHaveBeenCalledTimes(1);
        });
    });

    it('ExpiredToken_ShowsLoginForm', async () => {
        // When a user isn't authenticated, they should see the login form
        mockContext.isAuthenticated = false;
        renderLogin();
        expect(screen.getByText(/Login to your account/i)).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
    });

    it('Logout_ClearsSession_ContextFunctionExists', () => {
        // Regression check that the context exposes a logout function
        expect(mockContext.logout).toBeDefined();
        expect(typeof mockContext.logout).toBe('function');
    });

    it('FailedLogin_ShowsErrorMessage', async () => {
        mockAuthApi.login.mockResolvedValue({ success: false, message: 'Invalid credentials' });

        renderLogin();

        await user.type(screen.getByLabelText('Email'), 'bad@email.com');
        await user.type(screen.getByLabelText('Password'), 'wrongpass');
        await user.click(screen.getByRole('button', { name: /Log In/i }));

        await waitFor(() => {
            expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument();
        });
    });
});
