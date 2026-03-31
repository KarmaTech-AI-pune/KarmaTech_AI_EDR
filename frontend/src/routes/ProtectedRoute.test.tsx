import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// Create a shared context instance BEFORE mocking
const { mockContext } = vi.hoisted(() => {
  const { createContext } = require('react');
  const ctx = createContext(null);
  return { mockContext: ctx };
});

// Mock App so ProtectedRoute uses our shared context instance
vi.mock('../App', () => ({
  projectManagementAppContext: mockContext,
}));

import ProtectedRoute from './ProtectedRoute';

const MockProtected = () => <div data-testid="protected-component">Protected</div>;
const MockLogin = () => <div data-testid="login-component">Login</div>;
const MockHome = () => <div data-testid="home-component">Home</div>;

const renderRoute = (contextValue: any, ui: React.ReactNode) =>
  render(
    <mockContext.Provider value={contextValue}>
      <MemoryRouter initialEntries={['/']}>{ui}</MemoryRouter>
    </mockContext.Provider>
  );

describe('ProtectedRoute', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('Authentication Check', () => {
    it('should redirect to login when not authenticated', () => {
      renderRoute({ isAuthenticated: false, currentUser: null },
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<MockProtected />} />
          </Route>
          <Route path="/login" element={<MockLogin />} />
        </Routes>
      );
      expect(screen.getByTestId('login-component')).toBeInTheDocument();
    });

    it('should render protected component when authenticated', () => {
      renderRoute({ isAuthenticated: true, currentUser: { id: '1', roleDetails: { permissions: ['VIEW_DASHBOARD'] } } },
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<MockProtected />} />
          </Route>
          <Route path="/login" element={<MockLogin />} />
        </Routes>
      );
      expect(screen.getByTestId('protected-component')).toBeInTheDocument();
    });

    it('should handle missing context', () => {
      render(
        <mockContext.Provider value={null}>
          <MemoryRouter initialEntries={['/']}>
            <Routes>
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<MockProtected />} />
              </Route>
              <Route path="/login" element={<MockLogin />} />
            </Routes>
          </MemoryRouter>
        </mockContext.Provider>
      );
      expect(screen.getByTestId('login-component')).toBeInTheDocument();
    });
  });

  describe('Permission Check', () => {
    it('should allow access with required permission', () => {
      renderRoute({ isAuthenticated: true, currentUser: { id: '1', roleDetails: { permissions: ['ADMIN', 'VIEW_DASHBOARD'] } } },
        <Routes>
          <Route element={<ProtectedRoute requiredPermission={'ADMIN' as any} />}>
            <Route path="/" element={<MockProtected />} />
          </Route>
          <Route path="/login" element={<MockLogin />} />
        </Routes>
      );
      expect(screen.getByTestId('protected-component')).toBeInTheDocument();
    });

    it('should deny access without required permission', () => {
      renderRoute({ isAuthenticated: true, currentUser: { id: '1', roleDetails: { permissions: ['VIEW_DASHBOARD'] } } },
        <Routes>
          <Route element={<ProtectedRoute requiredPermission={'ADMIN' as any} />}>
            <Route path="/" element={<MockProtected />} />
          </Route>
          <Route path="/login" element={<MockLogin />} />
        </Routes>
      );
      expect(screen.queryByTestId('protected-component')).not.toBeInTheDocument();
    });

    it('should allow access when no specific permission required', () => {
      renderRoute({ isAuthenticated: true, currentUser: { id: '1', roleDetails: { permissions: ['VIEW_DASHBOARD'] } } },
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<MockProtected />} />
          </Route>
          <Route path="/login" element={<MockLogin />} />
        </Routes>
      );
      expect(screen.getByTestId('protected-component')).toBeInTheDocument();
    });
  });

  describe('Children Rendering', () => {
    it('should render children when provided', () => {
      renderRoute({ isAuthenticated: true, currentUser: { id: '1', roleDetails: { permissions: [] } } },
        <ProtectedRoute><MockProtected /></ProtectedRoute>
      );
      expect(screen.getByTestId('protected-component')).toBeInTheDocument();
    });

    it('should render Outlet when no children provided', () => {
      renderRoute({ isAuthenticated: true, currentUser: { id: '1', roleDetails: { permissions: [] } } },
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<MockProtected />} />
          </Route>
          <Route path="/login" element={<MockLogin />} />
        </Routes>
      );
      expect(screen.getByTestId('protected-component')).toBeInTheDocument();
    });
  });

  describe('Multiple Permissions', () => {
    it('should handle multiple permissions', () => {
      renderRoute({ isAuthenticated: true, currentUser: { id: '1', roleDetails: { permissions: ['ADMIN', 'MANAGER', 'USER'] } } },
        <Routes>
          <Route element={<ProtectedRoute requiredPermission={'MANAGER' as any} />}>
            <Route path="/" element={<MockProtected />} />
          </Route>
          <Route path="/login" element={<MockLogin />} />
        </Routes>
      );
      expect(screen.getByTestId('protected-component')).toBeInTheDocument();
    });

    it('should handle empty permissions array', () => {
      renderRoute({ isAuthenticated: true, currentUser: { id: '1', roleDetails: { permissions: [] } } },
        <Routes>
          <Route element={<ProtectedRoute requiredPermission={'ADMIN' as any} />}>
            <Route path="/" element={<MockProtected />} />
          </Route>
          <Route path="/login" element={<MockLogin />} />
        </Routes>
      );
      expect(screen.queryByTestId('protected-component')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle null roleDetails', () => {
      renderRoute({ isAuthenticated: true, currentUser: { id: '1', roleDetails: null } },
        <Routes>
          <Route element={<ProtectedRoute requiredPermission={'ADMIN' as any} />}>
            <Route path="/" element={<MockProtected />} />
          </Route>
          <Route path="/login" element={<MockLogin />} />
        </Routes>
      );
      // When roleDetails is null, permissions check is skipped and access is granted
      expect(screen.getByTestId('protected-component')).toBeInTheDocument();
    });

    it('should handle null currentUser', () => {
      renderRoute({ isAuthenticated: true, currentUser: null },
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<MockProtected />} />
          </Route>
          <Route path="/login" element={<MockLogin />} />
        </Routes>
      );
      expect(screen.getByTestId('protected-component')).toBeInTheDocument();
    });
  });
});
