import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Signup from './Signup';
import { authApi } from '../services/authApi';
import { projectManagementAppContext } from '../App';
import { projectManagementAppContextType } from '../types';
import { vi, describe, test, beforeEach, expect } from 'vitest';


// Mock the authApi
vi.mock('../services/authApi', () => ({
    authApi: {
        signup: vi.fn(),
    },
}));

// Mock react-router-dom's useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await (importOriginal as any)(); // Cast to any to allow spread
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        Navigate: vi.fn(({ to }) => `Navigate to ${to}`), // Mock Navigate component
    };
});

// Mock the projectManagementAppContext
const mockProjectManagementAppContext = {
    isAuthenticated: false,
    setIsAuthenticated: vi.fn(),
    user: null,
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
} as projectManagementAppContextType;

const renderSignupScreen = (isAuthenticated: boolean = false) => {
    mockProjectManagementAppContext.isAuthenticated = isAuthenticated;
    return render(
        <BrowserRouter>
            <projectManagementAppContext.Provider value={mockProjectManagementAppContext}>
                <Signup />
            </projectManagementAppContext.Provider>
        </BrowserRouter>
    );
};

describe('Signup', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockProjectManagementAppContext.isAuthenticated = false; // Reset auth state for each test
    });

    test('renders signup form elements', () => {
        renderSignupScreen();

        expect(screen.getByLabelText(/company name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/company address/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/choose your subdomain/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/subscription plan/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
        expect(screen.getByText(/create account/i)).toBeInTheDocument();
    });

    test('navigates to home if already authenticated', () => {
        renderSignupScreen(true);
        expect(screen.queryByLabelText(/company name/i)).not.toBeInTheDocument();
        expect(screen.getByText('Navigate to /')).toBeInTheDocument();
    });

    test('handles successful signup', async () => {
        (authApi.signup as vi.Mock).mockResolvedValue({
            success: true,
            message: 'Signup successful!',
        });

        renderSignupScreen();

        fireEvent.change(screen.getByLabelText(/company name/i), { target: { value: 'TestCo' } });
        fireEvent.change(screen.getByLabelText(/company address/i), { target: { value: '123 Test St' } });
        fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'John' } });
        fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Doe' } });
        fireEvent.change(screen.getByLabelText(/phone number/i), { target: { value: '1234567890' } });
        fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'john.doe@testco.com' } });
        fireEvent.change(screen.getByLabelText(/choose your subdomain/i), { target: { value: 'testco' } });
        fireEvent.change(screen.getByLabelText(/subscription plan/i), { target: { value: 'Professional' } });

        fireEvent.click(screen.getByRole('button', { name: /create account/i }));

        await waitFor(() => {
            expect(authApi.signup).toHaveBeenCalledWith({
                firstName: 'John',
                lastName: 'Doe',
                emailAddress: 'john.doe@testco.com',
                phoneNumber: '1234567890',
                companyName: 'TestCo',
                companyAddress: '123 Test St',
                subdomain: 'testco',
                subscriptionPlan: 'Professional',
            });
            expect(screen.getByText(/signup successful!/i)).toBeInTheDocument();
            expect(mockNavigate).toHaveBeenCalledWith('/login');
        });
    });

    test('displays error message on failed signup', async () => {
        (authApi.signup as vi.Mock).mockResolvedValue({
            success: false,
            message: 'Email already registered',
        });

        renderSignupScreen();

        fireEvent.change(screen.getByLabelText(/company name/i), { target: { value: 'TestCo' } });
        fireEvent.change(screen.getByLabelText(/company address/i), { target: { value: '123 Test St' } });
        fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'John' } });
        fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Doe' } });
        fireEvent.change(screen.getByLabelText(/phone number/i), { target: { value: '1234567890' } });
        fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'john.doe@testco.com' } });
        fireEvent.change(screen.getByLabelText(/choose your subdomain/i), { target: { value: 'testco' } });
        fireEvent.change(screen.getByLabelText(/subscription plan/i), { target: { value: 'Starter' } });

        fireEvent.click(screen.getByRole('button', { name: /create account/i }));

        await waitFor(() => {
            expect(authApi.signup).toHaveBeenCalled();
            expect(screen.getByText(/email already registered/i)).toBeInTheDocument();
            expect(mockNavigate).not.toHaveBeenCalled();
        });
    });

    test('displays generic error message on API error', async () => {
        (authApi.signup as vi.Mock).mockRejectedValue(new Error('Network error'));

        renderSignupScreen();

        fireEvent.change(screen.getByLabelText(/company name/i), { target: { value: 'TestCo' } });
        fireEvent.change(screen.getByLabelText(/company address/i), { target: { value: '123 Test St' } });
        fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'John' } });
        fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Doe' } });
        fireEvent.change(screen.getByLabelText(/phone number/i), { target: { value: '1234567890' } });
        fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'john.doe@testco.com' } });
        fireEvent.change(screen.getByLabelText(/choose your subdomain/i), { target: { value: 'testco' } });
        fireEvent.change(screen.getByLabelText(/subscription plan/i), { target: { value: 'Starter' } });

        fireEvent.click(screen.getByRole('button', { name: /create account/i }));

        await waitFor(() => {
            expect(authApi.signup).toHaveBeenCalled();
            expect(screen.getByText(/an unexpected error occurred during signup\./i)).toBeInTheDocument();
            expect(mockNavigate).not.toHaveBeenCalled();
        });
    });

    test('form validation displays errors for invalid input', async () => {
        renderSignupScreen();

        fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'invalid-email' } });
        fireEvent.click(screen.getByRole('button', { name: /create account/i }));

        await waitFor(() => {
            expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
            expect(authApi.signup).not.toHaveBeenCalled();
        });
    });

    test('loading state is handled correctly', async () => {
        (authApi.signup as vi.Mock).mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ success: true }), 100)));

        renderSignupScreen();

        fireEvent.change(screen.getByLabelText(/company name/i), { target: { value: 'TestCo' } });
        fireEvent.change(screen.getByLabelText(/company address/i), { target: { value: '123 Test St' } });
        fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'John' } });
        fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Doe' } });
        fireEvent.change(screen.getByLabelText(/phone number/i), { target: { value: '1234567890' } });
        fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'john.doe@testco.com' } });
        fireEvent.change(screen.getByLabelText(/choose your subdomain/i), { target: { value: 'testco' } });
        fireEvent.change(screen.getByLabelText(/subscription plan/i), { target: { value: 'Starter' } });

        fireEvent.click(screen.getByRole('button', { name: /create account/i }));

        expect(screen.getByRole('button', { name: /create account/i })).toBeDisabled();
        expect(screen.getByRole('progressbar')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
            expect(screen.getByRole('button', { name: /create account/i })).not.toBeDisabled();
        });
    });
});
