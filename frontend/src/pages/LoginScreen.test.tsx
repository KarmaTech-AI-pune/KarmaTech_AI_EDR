import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, Navigate } from 'react-router-dom';
import { LoginScreen } from './LoginScreen';
import { authApi } from '../services/authApi';
import { projectManagementAppContext } from '../App';
import { useAppNavigation } from '../hooks/useAppNavigation';
import { User } from '../models'; // Corrected import path for User
import { projectManagementAppContextType } from '../types'; // Import the full type
import { vi, describe, test, beforeEach, expect } from 'vitest'; // Explicitly import vitest globals

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
const mockNavigateToHome = vi.fn();

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
                <LoginScreen />
            </projectManagementAppContext.Provider>
        </BrowserRouter>
    );
};

describe('LoginScreen', () => {
    let localStorageSetItemSpy: vi.SpyInstance;
    let localStorageGetItemSpy: vi.SpyInstance;

    beforeEach(() => {
        vi.clearAllMocks(); // Use vi.clearAllMocks
        localStorage.clear();

        // Mock localStorage.setItem and getItem for the specific test case
        localStorageSetItemSpy = vi.spyOn(Storage.prototype, 'setItem');
        localStorageGetItemSpy = vi.spyOn(Storage.prototype, 'getItem');
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

        await waitFor(() => {
            expect(screen.getByText(/an error occurred\. please try again\./i)).toBeInTheDocument();
            expect(mockSetIsAuthenticated).not.toHaveBeenCalled();
            expect(mockSetUser).not.toHaveBeenCalled();
            expect(mockNavigateToHome).not.toHaveBeenCalled();
        });
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

        // Mock localStorage.setItem to simulate failure or not setting the item
        localStorageSetItemSpy.mockImplementation((key: string, value: string) => {
            if (key === 'token') {
                // Simulate failure to set token by not actually setting it
                // or by immediately clearing it for the purpose of this test
                // For a more realistic scenario, we'd mock getItem to return null after setItem
            } else {
                Object.defineProperty(window, 'localStorage', {
                    value: {
                        ...window.localStorage,
                        [key]: value,
                    },
                    writable: true,
                });
            }
        });

        // Mock localStorage.getItem to return null for 'token' after setItem is called
        localStorageGetItemSpy.mockImplementation((key: string) => {
            if (key === 'token') {
                return null; // Simulate token not being found after setting
            }
            return null;
        });


        renderLoginScreen();

        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
        fireEvent.click(screen.getByRole('button', { name: /log in/i }));

        await waitFor(() => {
            expect(authApi.login).toHaveBeenCalled();
            expect(localStorageSetItemSpy).toHaveBeenCalledWith('token', 'mock-token');
            expect(localStorageGetItemSpy).toHaveBeenCalledWith('token');
            expect(screen.getByText(/failed to set authentication token/i)).toBeInTheDocument();
            expect(mockSetIsAuthenticated).not.toHaveBeenCalled();
            expect(mockSetUser).not.toHaveBeenCalled();
            expect(mockNavigateToHome).not.toHaveBeenCalled();
        });

        localStorageSetItemSpy.mockRestore();
        localStorageGetItemSpy.mockRestore();
    });
});
