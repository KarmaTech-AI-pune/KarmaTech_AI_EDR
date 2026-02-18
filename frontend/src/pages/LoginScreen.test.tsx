import React from 'react';
import { BrowserRouter, Navigate } from 'react-router-dom';
import { LoginScreen } from './LoginScreen';
import { authApi } from '../services/authApi';
import { projectManagementAppContext } from '../App';
import { useAppNavigation } from '../hooks/useAppNavigation';
import { User } from '../models'; // Corrected import path for User
import { projectManagementAppContextType } from '../types'; // Import the full type
import { vi, describe, test, beforeEach, expect, afterEach } from 'vitest'; // Explicitly import vitest globals
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock the authApi
vi.mock('../services/authApi', () => ({
    authApi: {
        login: vi.fn(),
    },
}));

// Mock the useAppNavigation hook
vi.mock('../hooks/useAppNavigation', () => ({
    useAppNavigation: vi.fn(() => ({
        navigateToHome: vi.fn(),
    })),
}));

// Mock the projectManagementAppContext
const mockSetIsAuthenticated = vi.fn();
const mockSetUser = vi.fn();
// Mock other services to prevent network calls
vi.mock('../services/versionApi', () => ({
    versionApi: {
        getCurrentVersion: vi.fn().mockResolvedValue({ version: '1.0.0' }),
    },
}));

vi.mock('../services/releaseNotesApi', () => ({
    releaseNotesApi: {
        getReleaseNotes: vi.fn().mockResolvedValue([]),
    },
}));

vi.mock('../components/VersionDisplay', () => ({
    VersionDisplay: () => <div data-testid="mock-version-display">Version Display</div>,
}));

vi.mock('../components/ReleaseNotesModal', () => ({
    __esModule: true,
    default: () => <div data-testid="mock-release-notes-modal">Release Notes Modal</div>,
}));

vi.mock('../components/OTPVerification', () => ({
    OTPVerification: () => <div data-testid="mock-otp-verification">OTP Verification</div>,
}));

import UserSubscriptionContext from '../context/UserSubscriptionContext';

const mockRefreshSubscription = vi.fn();
const mockNavigateToHome = vi.fn(); // Restore mockNavigateToHome

const renderLoginScreen = (isAuthenticated: boolean = false) => {
    (useAppNavigation as vi.Mock).mockReturnValue({
        navigateToHome: mockNavigateToHome,
    });

    return render(
        <BrowserRouter>
            <projectManagementAppContext.Provider
                value={{
                    isAuthenticated,
                    setIsAuthenticated: mockSetIsAuthenticated,
                    user: null,
                    setUser: mockSetUser,
                    // Mocking all other required properties of projectManagementAppContextType
                    handleLogout: vi.fn(),
                    selectedProject: null,
                    setSelectedProject: vi.fn(),
                    currentGoNoGoDecision: null,
                    setCurrentGoNoGoDecision: vi.fn(),
                    goNoGoDecisionStatus: null,
                    setGoNoGoDecisionStatus: vi.fn(),
                    goNoGoVersionNumber: null,
                    setGoNoGoVersionNumber: vi.fn(), // Corrected setter name
                    currentUser: null,
                    setCurrentUser: vi.fn(),
                    canEditOpportunity: false,
                    setCanEditOpportunity: vi.fn(),
                    canDeleteOpportunity: false,
                    setCanDeleteOpportunity: vi.fn(),
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
                } as projectManagementAppContextType} // Cast to the full type
            >
                <UserSubscriptionContext.Provider value={{
                    refreshSubscription: mockRefreshSubscription,
                    subscription: null,
                    loading: false, // Correct property name
                    error: null,
                    hasFeature: vi.fn().mockReturnValue(true) // Add missing property
                }}>
                    <LoginScreen />
                </UserSubscriptionContext.Provider>
            </projectManagementAppContext.Provider>
        </BrowserRouter>
    );
};

describe('LoginScreen', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

    let localStorageSetItemSpy: vi.SpyInstance;
    let localStorageGetItemSpy: vi.SpyInstance;

    beforeEach(() => {
        vi.clearAllMocks(); // Use vi.clearAllMocks

        const store: Record<string, string> = {};
        const localStorageMock = {
            getItem: vi.fn((key: string) => store[key] || null),
            setItem: vi.fn((key: string, value: string) => {
                store[key] = value.toString();
            }),
            removeItem: vi.fn((key: string) => {
                delete store[key];
            }),
            clear: vi.fn(() => {
                for (const key in store) delete store[key];
            }),
            length: 0,
            key: vi.fn(),
        };

        Object.defineProperty(window, 'localStorage', {
            value: localStorageMock,
            writable: true
        });

        localStorageSetItemSpy = window.localStorage.setItem as unknown as vi.SpyInstance;
        localStorageGetItemSpy = window.localStorage.getItem as unknown as vi.SpyInstance;
    });

    test('renders login form elements', () => {
        renderLoginScreen();

        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
        expect(screen.getByText(/login to your account/i)).toBeInTheDocument();
    });

    test('navigates to home if already authenticated', () => {
        renderLoginScreen(true);
        // Since Navigate is a component, we can't directly assert its call.
        // We can check if the LoginScreen content is not rendered,
        // or if the mock navigation was called if it were an imperative navigation.
        // For declarative Navigate, we'd typically test the routing setup.
        // For this unit test, we'll ensure the login form is not visible.
        expect(screen.queryByLabelText(/email/i)).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /log in/i })).not.toBeInTheDocument();
    });

    test('handles successful login', async () => {
        const mockUser: User = {
            id: '1',
            userName: 'testuser',
            name: 'Test User',
            email: 'test@example.com',
            standardRate: 100,
            isConsultant: false,
            createdAt: '2023-01-01T00:00:00Z',
            roles: [],
        };
        (authApi.login as vi.Mock).mockResolvedValue({
            success: true,
            token: 'mock-token',
            user: mockUser,
        });

        renderLoginScreen();

        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
        fireEvent.click(screen.getByRole('button', { name: /log in/i }));

        await waitFor(() => {
            expect(authApi.login).toHaveBeenCalledWith({
                email: 'test@example.com',
                password: 'password123',
            });
            expect(localStorage.getItem('token')).toBe('mock-token');
            expect(mockSetUser).toHaveBeenCalledWith(mockUser);
            expect(mockSetIsAuthenticated).toHaveBeenCalledWith(true);
            expect(mockNavigateToHome).toHaveBeenCalled();
        });
    });

    test('displays error message on failed login (invalid credentials)', async () => {
        (authApi.login as vi.Mock).mockResolvedValue({
            success: false,
            message: 'Invalid credentials',
        });

        renderLoginScreen();

        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'wrong@example.com' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpass' } });
        fireEvent.click(screen.getByRole('button', { name: /log in/i }));

        await waitFor(() => {
            expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
            expect(mockSetIsAuthenticated).not.toHaveBeenCalled();
            expect(mockSetUser).not.toHaveBeenCalled();
            expect(mockNavigateToHome).not.toHaveBeenCalled();
        });
    });

    test('displays generic error message on API error', async () => {
        (authApi.login as vi.Mock).mockRejectedValue(new Error('Network error'));

        renderLoginScreen();

        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
        fireEvent.click(screen.getByRole('button', { name: /log in/i }));

        await waitFor(() => expect(screen.getByText(/Network error/i)).toBeInTheDocument());
        expect(mockSetIsAuthenticated).not.toHaveBeenCalled();
        expect(mockSetUser).not.toHaveBeenCalled();
        expect(mockNavigateToHome).not.toHaveBeenCalled();
    });

    test('displays error if token fails to set in local storage', async () => {
        const mockUser: User = {
            id: '1',
            userName: 'testuser',
            name: 'Test User',
            email: 'test@example.com',
            standardRate: 100,
            isConsultant: false,
            createdAt: '2023-01-01T00:00:00Z',
            roles: [],
        };
        (authApi.login as vi.Mock).mockResolvedValue({
            success: true,
            token: 'mock-token',
            user: mockUser,
        });

        // Mock localStorage.setItem to do nothing
        localStorageSetItemSpy.mockImplementation(() => {});

        // Mock localStorage.getItem to return null (simulate token not found)
        localStorageGetItemSpy.mockImplementation(() => null);


        renderLoginScreen();

        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
        fireEvent.click(screen.getByRole('button', { name: /log in/i }));

        await waitFor(() => {
            expect(authApi.login).toHaveBeenCalled();
            expect(localStorageSetItemSpy).toHaveBeenCalledWith('token', 'mock-token');
            expect(localStorageGetItemSpy).toHaveBeenCalledWith('token');
        });
        await waitFor(() => expect(screen.getByText(/failed to set authentication token/i)).toBeInTheDocument());
        
        expect(mockSetIsAuthenticated).not.toHaveBeenCalled();
        expect(mockSetUser).not.toHaveBeenCalled();
        expect(mockNavigateToHome).not.toHaveBeenCalled();

        localStorageSetItemSpy.mockRestore();
        localStorageGetItemSpy.mockRestore();
    });
});






