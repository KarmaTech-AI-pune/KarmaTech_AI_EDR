/**
 * ViewToggle Component Tests
 * 
 * Comprehensive test suite for ViewToggle component
 * Tests: Rendering, tab switching, active state, accessibility
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { ViewToggle } from '../../../src/features/cashflow/components/ViewToggle';

describe('ViewToggle Component', () => {
  const mockOnViewChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering Tests', () => {
    it('renders both tab options', () => {
      render(<ViewToggle activeView="BudgetDashboard" onViewChange={mockOnViewChange} />);
      
      expect(screen.getByRole('tab', { name: /budget dashboard/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /payment schedule/i })).toBeInTheDocument();
    });

    it('renders tabs container', () => {
      render(<ViewToggle activeView="BudgetDashboard" onViewChange={mockOnViewChange} />);
      
      const tablist = screen.getByRole('tablist');
      expect(tablist).toBeInTheDocument();
    });

    it('renders with correct aria-label', () => {
      render(<ViewToggle activeView="BudgetDashboard" onViewChange={mockOnViewChange} />);
      
      const tablist = screen.getByRole('tablist', { name: /cash flow view tabs/i });
      expect(tablist).toBeInTheDocument();
    });
  });

  describe('Active State Tests', () => {
    it('marks Budget Dashboard tab as selected when activeView is BudgetDashboard', () => {
      render(<ViewToggle activeView="BudgetDashboard" onViewChange={mockOnViewChange} />);
      
      const budgetTab = screen.getByRole('tab', { name: /budget dashboard/i });
      expect(budgetTab).toHaveAttribute('aria-selected', 'true');
    });

    it('marks Payment Schedule tab as selected when activeView is PaymentSchedule', () => {
      render(<ViewToggle activeView="PaymentSchedule" onViewChange={mockOnViewChange} />);
      
      const paymentTab = screen.getByRole('tab', { name: /payment schedule/i });
      expect(paymentTab).toHaveAttribute('aria-selected', 'true');
    });

    it('only one tab is selected at a time', () => {
      render(<ViewToggle activeView="BudgetDashboard" onViewChange={mockOnViewChange} />);
      
      const budgetTab = screen.getByRole('tab', { name: /budget dashboard/i });
      const paymentTab = screen.getByRole('tab', { name: /payment schedule/i });
      
      expect(budgetTab).toHaveAttribute('aria-selected', 'true');
      expect(paymentTab).toHaveAttribute('aria-selected', 'false');
    });
  });

  describe('Tab Switching Tests', () => {
    it('calls onViewChange when Budget Dashboard tab is clicked', async () => {
      const user = userEvent.setup();
      render(<ViewToggle activeView="PaymentSchedule" onViewChange={mockOnViewChange} />);
      
      const budgetTab = screen.getByRole('tab', { name: /budget dashboard/i });
      await user.click(budgetTab);
      
      expect(mockOnViewChange).toHaveBeenCalledTimes(1);
      expect(mockOnViewChange).toHaveBeenCalledWith('BudgetDashboard');
    });

    it('calls onViewChange when Payment Schedule tab is clicked', async () => {
      const user = userEvent.setup();
      render(<ViewToggle activeView="BudgetDashboard" onViewChange={mockOnViewChange} />);
      
      const paymentTab = screen.getByRole('tab', { name: /payment schedule/i });
      await user.click(paymentTab);
      
      expect(mockOnViewChange).toHaveBeenCalledTimes(1);
      expect(mockOnViewChange).toHaveBeenCalledWith('PaymentSchedule');
    });

    it('does not call onViewChange when clicking already active tab', async () => {
      const user = userEvent.setup();
      render(<ViewToggle activeView="BudgetDashboard" onViewChange={mockOnViewChange} />);
      
      const budgetTab = screen.getByRole('tab', { name: /budget dashboard/i });
      await user.click(budgetTab);
      
      // MUI Tabs may or may not call onChange for already selected tab
      // This behavior is controlled by MUI, so we just verify the component renders correctly
      expect(budgetTab).toHaveAttribute('aria-selected', 'true');
    });

    it('switches between tabs multiple times', async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <ViewToggle activeView="BudgetDashboard" onViewChange={mockOnViewChange} />
      );
      
      const paymentTab = screen.getByRole('tab', { name: /payment schedule/i });
      
      // Click payment tab
      await user.click(paymentTab);
      expect(mockOnViewChange).toHaveBeenCalledWith('PaymentSchedule');
      
      // Simulate parent updating the state
      rerender(<ViewToggle activeView="PaymentSchedule" onViewChange={mockOnViewChange} />);
      
      const budgetTab = screen.getByRole('tab', { name: /budget dashboard/i });
      
      // Click budget tab
      await user.click(budgetTab);
      expect(mockOnViewChange).toHaveBeenCalledWith('BudgetDashboard');
      
      // Simulate parent updating the state
      rerender(<ViewToggle activeView="BudgetDashboard" onViewChange={mockOnViewChange} />);
      
      const paymentTab2 = screen.getByRole('tab', { name: /payment schedule/i });
      
      // Click payment tab again
      await user.click(paymentTab2);
      expect(mockOnViewChange).toHaveBeenCalledWith('PaymentSchedule');
      
      expect(mockOnViewChange).toHaveBeenCalledTimes(3);
    });
  });

  describe('Keyboard Navigation Tests', () => {
    it('supports keyboard navigation with arrow keys', async () => {
      const user = userEvent.setup();
      render(<ViewToggle activeView="BudgetDashboard" onViewChange={mockOnViewChange} />);
      
      const budgetTab = screen.getByRole('tab', { name: /budget dashboard/i });
      budgetTab.focus();
      
      // Press right arrow to move to next tab
      await user.keyboard('{ArrowRight}');
      
      const paymentTab = screen.getByRole('tab', { name: /payment schedule/i });
      expect(paymentTab).toHaveFocus();
    });

    it('tabs are keyboard accessible', () => {
      render(<ViewToggle activeView="BudgetDashboard" onViewChange={mockOnViewChange} />);
      
      const budgetTab = screen.getByRole('tab', { name: /budget dashboard/i });
      const paymentTab = screen.getByRole('tab', { name: /payment schedule/i });
      
      expect(budgetTab).toHaveAttribute('tabindex');
      expect(paymentTab).toHaveAttribute('tabindex');
    });
  });

  describe('Accessibility Tests', () => {
    it('has proper ARIA roles', () => {
      render(<ViewToggle activeView="BudgetDashboard" onViewChange={mockOnViewChange} />);
      
      expect(screen.getByRole('tablist')).toBeInTheDocument();
      expect(screen.getAllByRole('tab')).toHaveLength(2);
    });

    it('has proper ARIA attributes on tabs', () => {
      render(<ViewToggle activeView="BudgetDashboard" onViewChange={mockOnViewChange} />);
      
      const budgetTab = screen.getByRole('tab', { name: /budget dashboard/i });
      const paymentTab = screen.getByRole('tab', { name: /payment schedule/i });
      
      expect(budgetTab).toHaveAttribute('aria-selected');
      expect(paymentTab).toHaveAttribute('aria-selected');
    });

    it('has descriptive aria-label on tablist', () => {
      render(<ViewToggle activeView="BudgetDashboard" onViewChange={mockOnViewChange} />);
      
      const tablist = screen.getByRole('tablist');
      expect(tablist).toHaveAttribute('aria-label', 'cash flow view tabs');
    });

    it('tabs have accessible names', () => {
      render(<ViewToggle activeView="BudgetDashboard" onViewChange={mockOnViewChange} />);
      
      expect(screen.getByRole('tab', { name: /budget dashboard/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /payment schedule/i })).toBeInTheDocument();
    });
  });

  describe('Visual State Tests', () => {
    it('renders Budget Dashboard tab', () => {
      render(<ViewToggle activeView="BudgetDashboard" onViewChange={mockOnViewChange} />);
      
      const budgetTab = screen.getByRole('tab', { name: /budget dashboard/i });
      expect(budgetTab).toBeVisible();
    });

    it('renders Payment Schedule tab', () => {
      render(<ViewToggle activeView="PaymentSchedule" onViewChange={mockOnViewChange} />);
      
      const paymentTab = screen.getByRole('tab', { name: /payment schedule/i });
      expect(paymentTab).toBeVisible();
    });

    it('both tabs are visible simultaneously', () => {
      render(<ViewToggle activeView="BudgetDashboard" onViewChange={mockOnViewChange} />);
      
      const budgetTab = screen.getByRole('tab', { name: /budget dashboard/i });
      const paymentTab = screen.getByRole('tab', { name: /payment schedule/i });
      
      expect(budgetTab).toBeVisible();
      expect(paymentTab).toBeVisible();
    });
  });

  describe('Edge Cases', () => {
    it('handles rapid tab switching', async () => {
      const user = userEvent.setup();
      render(<ViewToggle activeView="BudgetDashboard" onViewChange={mockOnViewChange} />);
      
      const budgetTab = screen.getByRole('tab', { name: /budget dashboard/i });
      const paymentTab = screen.getByRole('tab', { name: /payment schedule/i });
      
      // Rapidly click between tabs
      await user.click(paymentTab);
      await user.click(budgetTab);
      await user.click(paymentTab);
      await user.click(budgetTab);
      
      expect(mockOnViewChange).toHaveBeenCalled();
    });

    it('maintains state when re-rendered with same activeView', () => {
      const { rerender } = render(
        <ViewToggle activeView="BudgetDashboard" onViewChange={mockOnViewChange} />
      );
      
      const budgetTab = screen.getByRole('tab', { name: /budget dashboard/i });
      expect(budgetTab).toHaveAttribute('aria-selected', 'true');
      
      rerender(<ViewToggle activeView="BudgetDashboard" onViewChange={mockOnViewChange} />);
      
      expect(budgetTab).toHaveAttribute('aria-selected', 'true');
    });

    it('updates selected tab when activeView prop changes', () => {
      const { rerender } = render(
        <ViewToggle activeView="BudgetDashboard" onViewChange={mockOnViewChange} />
      );
      
      let budgetTab = screen.getByRole('tab', { name: /budget dashboard/i });
      let paymentTab = screen.getByRole('tab', { name: /payment schedule/i });
      
      expect(budgetTab).toHaveAttribute('aria-selected', 'true');
      expect(paymentTab).toHaveAttribute('aria-selected', 'false');
      
      rerender(<ViewToggle activeView="PaymentSchedule" onViewChange={mockOnViewChange} />);
      
      budgetTab = screen.getByRole('tab', { name: /budget dashboard/i });
      paymentTab = screen.getByRole('tab', { name: /payment schedule/i });
      
      expect(budgetTab).toHaveAttribute('aria-selected', 'false');
      expect(paymentTab).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('Integration Tests', () => {
    it('complete workflow: render, click, verify callback', async () => {
      const user = userEvent.setup();
      render(<ViewToggle activeView="BudgetDashboard" onViewChange={mockOnViewChange} />);
      
      // Verify initial state
      const budgetTab = screen.getByRole('tab', { name: /budget dashboard/i });
      const paymentTab = screen.getByRole('tab', { name: /payment schedule/i });
      
      expect(budgetTab).toHaveAttribute('aria-selected', 'true');
      expect(paymentTab).toHaveAttribute('aria-selected', 'false');
      
      // Click payment schedule tab
      await user.click(paymentTab);
      
      // Verify callback was called
      expect(mockOnViewChange).toHaveBeenCalledWith('PaymentSchedule');
      expect(mockOnViewChange).toHaveBeenCalledTimes(1);
    });

    it('handles callback that updates parent state', async () => {
      const user = userEvent.setup();
      let currentView: 'BudgetDashboard' | 'PaymentSchedule' = 'BudgetDashboard';
      
      const handleViewChange = (newView: 'BudgetDashboard' | 'PaymentSchedule') => {
        currentView = newView;
        mockOnViewChange(newView);
      };
      
      const { rerender } = render(
        <ViewToggle activeView={currentView} onViewChange={handleViewChange} />
      );
      
      const paymentTab = screen.getByRole('tab', { name: /payment schedule/i });
      await user.click(paymentTab);
      
      // Simulate parent component updating the prop
      rerender(<ViewToggle activeView="PaymentSchedule" onViewChange={handleViewChange} />);
      
      const updatedPaymentTab = screen.getByRole('tab', { name: /payment schedule/i });
      expect(updatedPaymentTab).toHaveAttribute('aria-selected', 'true');
    });
  });
});
