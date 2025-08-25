import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoginScreen } from './LoginScreen';
import { authApi } from '../services/authApi';
import { projectManagementAppContext } from '../App';
import { useAppNavigation } from '../hooks/useAppNavigation';
import { UserWithRole } from '../types';

// Mock dependencies
vi.mock('../services/authApi');
vi.mock('../hooks/useAppNavigation');
vi.mock('react-router-dom', async (importOriginal: () => Promise<any>) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    Navigate: vi.fn(({ to }) => `Navigate to ${to}`), // Mock Navigate component
  };
});

const mockSetIsAuthenticated = vi.fn();
const mockSetUser = vi.fn();
const mockNavigateToHome = vi.fn();

const mockUser: UserWithRole = {
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
    permissions: []
  }
};

const renderLoginScreen = (isAuthenticated: boolean = false) => {
  return render(
    <projectManagementAppContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated: mockSetIsAuthenticated,
        user: isAuthenticated ? mockUser : null,
        setUser: mockSetUser,
        handleLogout: vi.fn(),
        selectedProject: null,
        setSelectedProject: vi.fn(),
        currentGoNoGoDecision: null,
        setCurrentGoNoGoDecision: vi.fn(),
        goNoGoDecisionStatus: null,
        setGoNoGoDecisionStatus: vi.fn(),
        goNoGoVersionNumber: null,
        setGoNoGoVersionNumber: vi.fn(),
        currentUser: isAuthenticated ? mockUser : null,
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
      }}
    >
      <LoginScreen />
    </projectManagementAppContext.Provider>
  );
};

describe('LoginScreen Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useAppNavigation as vi.Mock).mockReturnValue({
      navigateToHome: mockNavigateToHome,
    });
    localStorage.clear(); // Clear localStorage before each test
  });

  it('renders the login form', () => {
    renderLoginScreen();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
    expect(screen.getByText(/KarmaTech AI Project Management Application/i)).toBeInTheDocument();
  });

  it('updates email and password on input change', () => {
    renderLoginScreen();
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  it('handles successful login', async () => {
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

  it('handles failed login and displays error message', async () => {
    (authApi.login as vi.Mock).mockResolvedValue({
      success: false,
      message: 'Invalid credentials',
    });

    renderLoginScreen();

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'wrong@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalled();
      expect(localStorage.getItem('token')).toBeNull();
      expect(mockSetIsAuthenticated).not.toHaveBeenCalled();
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('handles API call error during login', async () => {
    (authApi.login as vi.Mock).mockRejectedValue(new Error('Network error'));

    renderLoginScreen();

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalled();
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('redirects to home if already authenticated', () => {
    const { getByText } = renderLoginScreen(true); // Render with isAuthenticated = true
    expect(getByText('Navigate to /')).toBeInTheDocument();
  });

  it('clears error message on subsequent login attempt', async () => {
    (authApi.login as vi.Mock)
      .mockResolvedValueOnce({ success: false, message: 'First error' })
      .mockResolvedValueOnce({ success: true, token: 'mock-token', user: mockUser });

    renderLoginScreen();

    // First failed attempt
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'wrong@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    await waitFor(() => expect(screen.getByText('First error')).toBeInTheDocument());

    // Second successful attempt
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => {
      expect(screen.queryByText('First error')).not.toBeInTheDocument();
      expect(mockNavigateToHome).toHaveBeenCalled();
    });
  });
});
