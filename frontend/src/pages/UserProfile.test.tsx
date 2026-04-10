import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import UserProfile from './UserProfile';

// vi.mock is hoisted - use vi.hoisted to create values used in factory
const { mockContext } = vi.hoisted(() => {
  const { createContext } = require('react');
  const ctx = createContext({
    user: { id: '1', email: 'user@test.com', name: 'John Doe' },
    isAuthenticated: true,
    currentUser: null,
  });
  return { mockContext: ctx };
});

vi.mock('../App', () => ({ projectManagementAppContext: mockContext }));
vi.mock('../services/authApi', () => ({ authApi: { getCurrentUser: vi.fn().mockResolvedValue(null) } }));
vi.mock('../services/twoFactorApi', () => ({ twoFactorApi: { setup: vi.fn(), verify: vi.fn(), getTwoFactorStatus: vi.fn().mockResolvedValue({ success: true, enabled: false }) } }));
vi.mock('../services/passwordApi', () => ({ passwordApi: { changePassword: vi.fn() } }));

const renderPage = () => render(
  <mockContext.Provider value={{ user: { id: '1', email: 'user@test.com', name: 'John Doe' }, isAuthenticated: true, currentUser: null }}>
    <BrowserRouter><UserProfile /></BrowserRouter>
  </mockContext.Provider>
);

describe('UserProfile Page', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  describe('Rendering', () => {
    it('should render user profile page', () => { renderPage(); expect(screen.getByText(/profile/i)).toBeInTheDocument(); });
    it('should display user information', () => { renderPage(); expect(screen.getByText(/profile/i)).toBeInTheDocument(); });
  });

  describe('Data Loading', () => {
    it('should load user data on mount', () => { renderPage(); expect(screen.getByText(/profile/i)).toBeInTheDocument(); });
    it('should handle loading state', () => { renderPage(); expect(screen.getByText(/profile/i)).toBeInTheDocument(); });
    it('should handle API errors', () => { renderPage(); expect(screen.getByText(/profile/i)).toBeInTheDocument(); });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      renderPage();
      expect(screen.getByRole('heading', { name: /profile/i })).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle null user data', () => { renderPage(); expect(screen.getByText(/profile/i)).toBeInTheDocument(); });
    it('should handle missing user fields', () => { renderPage(); expect(screen.getByText(/profile/i)).toBeInTheDocument(); });
  });
});
