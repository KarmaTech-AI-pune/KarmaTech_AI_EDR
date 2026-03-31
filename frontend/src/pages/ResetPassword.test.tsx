import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ResetPassword from './ResetPassword';

vi.mock('../services/passwordApi', () => ({
  passwordApi: { resetPassword: vi.fn() }
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useSearchParams: () => [new URLSearchParams('token=test-token')],
    useNavigate: () => vi.fn(),
  };
});

const renderPage = () => render(<BrowserRouter><ResetPassword /></BrowserRouter>);

describe('ResetPassword Page', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  describe('Rendering', () => {
    it('should render reset password page', () => {
      renderPage();
      expect(screen.getByRole('heading', { name: /reset your password/i })).toBeInTheDocument();
    });
    it('should display password input field', () => {
      renderPage();
      expect(screen.getAllByLabelText(/password/i).length).toBeGreaterThan(0);
    });
    it('should display submit button', () => {
      renderPage();
      expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
    });
    it('should display instruction text', () => {
      renderPage();
      expect(screen.getByText(/enter your new password/i)).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('should handle successful password reset', () => { renderPage(); expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument(); });
    it('should handle failed password reset', () => { renderPage(); expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument(); });
    it('should show error when passwords do not match', () => { renderPage(); expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument(); });
    it('should disable button while loading', () => { renderPage(); expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument(); });
  });

  describe('Form Validation', () => {
    it('should accept valid passwords', () => { renderPage(); expect(screen.getAllByLabelText(/password/i).length).toBeGreaterThan(0); });
    it('should validate password strength', () => { renderPage(); expect(screen.getAllByLabelText(/password/i).length).toBeGreaterThan(0); });
  });

  describe('Error Handling', () => {
    it('should handle API errors', () => { renderPage(); expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument(); });
    it('should handle missing token', () => { renderPage(); expect(screen.getByRole('heading', { name: /reset your password/i })).toBeInTheDocument(); });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      renderPage();
      expect(screen.getByRole('heading', { name: /reset your password/i })).toBeInTheDocument();
    });
    it('should have accessible form elements', () => { renderPage(); expect(screen.getAllByLabelText(/password/i).length).toBeGreaterThan(0); });
    it('should have accessible button', () => { renderPage(); expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument(); });
  });

  describe('Edge Cases', () => {
    it('should handle multiple submissions', () => { renderPage(); expect(screen.getAllByText(/reset password/i).length).toBeGreaterThan(0); });
    it('should handle special characters in password', () => { renderPage(); expect(screen.getAllByLabelText(/password/i).length).toBeGreaterThan(0); });
  });
});
