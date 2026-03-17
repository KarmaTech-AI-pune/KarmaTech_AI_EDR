import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { projectManagementAppContext } from '../App';

// Mock components
const MockProtectedComponent = () => <div data-testid="protected-component">Protected Content</div>;
const MockLoginComponent = () => <div data-testid="login-component">Login Page</div>;
const MockHomeComponent = () => <div data-testid="home-component">Home Page</div>;

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Authentication Check', () => {
    it('should redirect to login when not authenticated', () => {
      const mockContext = {
        isAuthenticated: false,
        currentUser: null
      };

      render(
        <projectManagementAppContext.Provider value={mockContext as any}>
          <BrowserRouter>
            <Routes>
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<MockProtectedComponent />} />
              </Route>
              <Route path="/login" element={<MockLoginComponent />} />
            </Routes>
          </BrowserRouter>
        </projectManagementAppContext.Provider>
      );

      // Should redirect to login
      expect(screen.getByTestId('login-component')).toBeInTheDocument();
    });

    it('should render protected component when authenticated', () => {
      const mockContext = {
        isAuthenticated: true,
        currentUser: {
          id: '1',
          email: 'user@test.com',
          roleDetails: {
            permissions: ['VIEW_DASHBOARD']
          }
        }
      };

      render(
        <projectManagementAppContext.Provider value={mockContext as any}>
          <BrowserRouter>
            <Routes>
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<MockProtectedComponent />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </projectManagementAppContext.Provider>
      );

      expect(screen.getByTestId('protected-component')).toBeInTheDocument();
    });

    it('should handle missing context', () => {
      render(
        <BrowserRouter>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<MockProtectedComponent />} />
            </Route>
            <Route path="/login" element={<MockLoginComponent />} />
          </Routes>
        </BrowserRouter>
      );

      // Should redirect to login when context is missing
      expect(screen.getByTestId('login-component')).toBeInTheDocument();
    });
  });

  describe('Permission Check', () => {
    it('should allow access with required permission', () => {
      const mockContext = {
        isAuthenticated: true,
        currentUser: {
          id: '1',
          email: 'user@test.com',
          roleDetails: {
            permissions: ['ADMIN', 'VIEW_DASHBOARD']
          }
        }
      };

      render(
        <projectManagementAppContext.Provider value={mockContext as any}>
          <BrowserRouter>
            <Routes>
              <Route element={<ProtectedRoute requiredPermission="ADMIN" />}>
                <Route path="/" element={<MockProtectedComponent />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </projectManagementAppContext.Provider>
      );

      expect(screen.getByTestId('protected-component')).toBeInTheDocument();
    });

    it('should deny access without required permission', () => {
      const mockContext = {
        isAuthenticated: true,
        currentUser: {
          id: '1',
          email: 'user@test.com',
          roleDetails: {
            permissions: ['VIEW_DASHBOARD']
          }
        }
      };

      render(
        <projectManagementAppContext.Provider value={mockContext as any}>
          <BrowserRouter>
            <Routes>
              <Route element={<ProtectedRoute requiredPermission="ADMIN" />}>
                <Route path="/" element={<MockProtectedComponent />} />
              </Route>
              <Route path="/" element={<MockHomeComponent />} />
            </Routes>
          </BrowserRouter>
        </projectManagementAppContext.Provider>
      );

      // Should redirect to home when permission is missing
      expect(screen.getByTestId('home-component')).toBeInTheDocument();
    });

    it('should allow access when no specific permission required', () => {
      const mockContext = {
        isAuthenticated: true,
        currentUser: {
          id: '1',
          email: 'user@test.com',
          roleDetails: {
            permissions: ['VIEW_DASHBOARD']
          }
        }
      };

      render(
        <projectManagementAppContext.Provider value={mockContext as any}>
          <BrowserRouter>
            <Routes>
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<MockProtectedComponent />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </projectManagementAppContext.Provider>
      );

      expect(screen.getByTestId('protected-component')).toBeInTheDocument();
    });
  });

  describe('Children Rendering', () => {
    it('should render children when provided', () => {
      const mockContext = {
        isAuthenticated: true,
        currentUser: {
          id: '1',
          email: 'user@test.com',
          roleDetails: {
            permissions: []
          }
        }
      };

      render(
        <projectManagementAppContext.Provider value={mockContext as any}>
          <BrowserRouter>
            <ProtectedRoute>
              <MockProtectedComponent />
            </ProtectedRoute>
          </BrowserRouter>
        </projectManagementAppContext.Provider>
      );

      expect(screen.getByTestId('protected-component')).toBeInTheDocument();
    });

    it('should render Outlet when no children provided', () => {
      const mockContext = {
        isAuthenticated: true,
        currentUser: {
          id: '1',
          email: 'user@test.com',
          roleDetails: {
            permissions: []
          }
        }
      };

      render(
        <projectManagementAppContext.Provider value={mockContext as any}>
          <BrowserRouter>
            <Routes>
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<MockProtectedComponent />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </projectManagementAppContext.Provider>
      );

      expect(screen.getByTestId('protected-component')).toBeInTheDocument();
    });
  });

  describe('Multiple Permissions', () => {
    it('should handle multiple permissions', () => {
      const mockContext = {
        isAuthenticated: true,
        currentUser: {
          id: '1',
          email: 'user@test.com',
          roleDetails: {
            permissions: ['ADMIN', 'MANAGER', 'USER']
          }
        }
      };

      render(
        <projectManagementAppContext.Provider value={mockContext as any}>
          <BrowserRouter>
            <Routes>
              <Route element={<ProtectedRoute requiredPermission="MANAGER" />}>
                <Route path="/" element={<MockProtectedComponent />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </projectManagementAppContext.Provider>
      );

      expect(screen.getByTestId('protected-component')).toBeInTheDocument();
    });

    it('should handle empty permissions array', () => {
      const mockContext = {
        isAuthenticated: true,
        currentUser: {
          id: '1',
          email: 'user@test.com',
          roleDetails: {
            permissions: []
          }
        }
      };

      render(
        <projectManagementAppContext.Provider value={mockContext as any}>
          <BrowserRouter>
            <Routes>
              <Route element={<ProtectedRoute requiredPermission="ADMIN" />}>
                <Route path="/" element={<MockProtectedComponent />} />
              </Route>
              <Route path="/" element={<MockHomeComponent />} />
            </Routes>
          </BrowserRouter>
        </projectManagementAppContext.Provider>
      );

      expect(screen.getByTestId('home-component')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle null roleDetails', () => {
      const mockContext = {
        isAuthenticated: true,
        currentUser: {
          id: '1',
          email: 'user@test.com',
          roleDetails: null
        }
      };

      render(
        <projectManagementAppContext.Provider value={mockContext as any}>
          <BrowserRouter>
            <Routes>
              <Route element={<ProtectedRoute requiredPermission="ADMIN" />}>
                <Route path="/" element={<MockProtectedComponent />} />
              </Route>
              <Route path="/" element={<MockHomeComponent />} />
            </Routes>
          </BrowserRouter>
        </projectManagementAppContext.Provider>
      );

      expect(screen.getByTestId('home-component')).toBeInTheDocument();
    });

    it('should handle null currentUser', () => {
      const mockContext = {
        isAuthenticated: true,
        currentUser: null
      };

      render(
        <projectManagementAppContext.Provider value={mockContext as any}>
          <BrowserRouter>
            <Routes>
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<MockProtectedComponent />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </projectManagementAppContext.Provider>
      );

      expect(screen.getByTestId('protected-component')).toBeInTheDocument();
    });
  });
});
