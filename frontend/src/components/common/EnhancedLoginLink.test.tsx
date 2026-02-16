
import { vi, describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import EnhancedLoginLink from './EnhancedLoginLink';

// Mock the useNavigate hook
const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

describe('EnhancedLoginLink', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with correct text and buttons', () => {
    render(
      <MemoryRouter>
        <EnhancedLoginLink />
      </MemoryRouter>
    );

    expect(screen.getByText('🚀 Multi-Tenant Testing Interface')).toBeInTheDocument();
    expect(screen.getByText('Access the enhanced login system for testing Super Admin and Tenant-specific functionality')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enhanced login/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /admin panel/i })).toBeInTheDocument();
  });

  it('navigates to /enhanced-login when the "Enhanced Login" button is clicked', () => {
    render(
      <MemoryRouter>
        <EnhancedLoginLink />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /enhanced login/i }));
    expect(mockedNavigate).toHaveBeenCalledWith('/enhanced-login');
  });

  it('navigates to /admin when the "Admin Panel" button is clicked', () => {
    render(
      <MemoryRouter>
        <EnhancedLoginLink />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /admin panel/i }));
    expect(mockedNavigate).toHaveBeenCalledWith('/admin');
  });
});


