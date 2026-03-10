import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Layout from './Layout';
import { projectManagementAppContext } from '../App';

vi.mock('./LoadingSpinner', () => ({
  default: () => <div data-testid="mock-loading-spinner" />
}));

// Mock React.lazy so we can avoid Suspense errors in the test
vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    lazy: () => {
      // Override lazy to just return a synchronous dummy component
      return () => <div data-testid="mock-navbar" />;
    },
  };
});

describe('Layout Component', () => {
  const renderLayout = (route = '/', isAuthenticated = true) => {
    const mockContext = { isAuthenticated };
    
    return render(
      <projectManagementAppContext.Provider value={mockContext as any}>
        <MemoryRouter initialEntries={[route]}>
          <Layout />
        </MemoryRouter>
      </projectManagementAppContext.Provider>
    );
  };

  it('renders Layout with Navbar when authenticated and not on login page', async () => {
    renderLayout('/', true);
    
    expect(screen.getByTestId('mock-loading-spinner')).toBeInTheDocument();
    
    // With React.lazy mocked, the component should render synchronously
    expect(screen.getByTestId('mock-navbar')).toBeInTheDocument();
  });

  it('does not render Navbar when on login page', () => {
    renderLayout('/login', true);
    expect(screen.queryByTestId('mock-navbar')).not.toBeInTheDocument();
  });

  it('does not render Navbar when not authenticated', () => {
    renderLayout('/dashboard', false);
    expect(screen.queryByTestId('mock-navbar')).not.toBeInTheDocument();
  });
});
