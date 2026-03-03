/**
 * CashFlowHeader Component Tests
 * 
 * Comprehensive test suite for CashFlowHeader component
 * Tests: Rendering, context integration, view mode switching
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { CashFlowHeader } from '../../../src/features/cashflow/components/CashFlowHeader';
import { CashFlowProvider } from '../../../src/features/cashflow/context/CashFlowContext';

// Mock the ProjectContext
vi.mock('../../../src/context/ProjectContext', () => ({
  useProject: () => ({
    projectId: 'test-project-123',
    projectName: 'Test Project',
  }),
}));

// Mock the API hook
vi.mock('../../../src/features/cashflow/hooks/useCashFlowData', () => ({
  useCashFlowData: () => ({
    data: null,
    loading: false,
    error: null,
    refetch: vi.fn(),
    addPaymentMilestone: vi.fn(),
    fetchData: vi.fn(),
  }),
}));

describe('CashFlowHeader Component', () => {
  const renderWithProvider = (component: React.ReactElement) => {
    return render(
      <CashFlowProvider>
        {component}
      </CashFlowProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering Tests', () => {
    it('renders the header component', () => {
      renderWithProvider(<CashFlowHeader />);
      
      // Check if ViewToggle tabs are rendered
      expect(screen.getByRole('tablist')).toBeInTheDocument();
    });

    it('renders both view mode tabs', () => {
      renderWithProvider(<CashFlowHeader />);
      
      expect(screen.getByRole('tab', { name: /budget dashboard/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /payment schedule/i })).toBeInTheDocument();
    });

    it('renders within a Paper component', () => {
      const { container } = renderWithProvider(<CashFlowHeader />);
      
      const paper = container.querySelector('.MuiPaper-root');
      expect(paper).toBeInTheDocument();
    });

    it('renders ViewToggle component', () => {
      renderWithProvider(<CashFlowHeader />);
      
      const tablist = screen.getByRole('tablist', { name: /cash flow view tabs/i });
      expect(tablist).toBeInTheDocument();
    });
  });

  describe('Initial State Tests', () => {
    it('has Budget Dashboard tab selected by default', () => {
      renderWithProvider(<CashFlowHeader />);
      
      const budgetTab = screen.getByRole('tab', { name: /budget dashboard/i });
      expect(budgetTab).toHaveAttribute('aria-selected', 'true');
    });

    it('has Payment Schedule tab unselected by default', () => {
      renderWithProvider(<CashFlowHeader />);
      
      const paymentTab = screen.getByRole('tab', { name: /payment schedule/i });
      expect(paymentTab).toHaveAttribute('aria-selected', 'false');
    });
  });

  describe('View Mode Switching Tests', () => {
    it('switches to Payment Schedule view when tab is clicked', async () => {
      const user = userEvent.setup();
      renderWithProvider(<CashFlowHeader />);
      
      const paymentTab = screen.getByRole('tab', { name: /payment schedule/i });
      await user.click(paymentTab);
      
      expect(paymentTab).toHaveAttribute('aria-selected', 'true');
    });

    it('switches back to Budget Dashboard view when tab is clicked', async () => {
      const user = userEvent.setup();
      renderWithProvider(<CashFlowHeader />);
      
      // First switch to Payment Schedule
      const paymentTab = screen.getByRole('tab', { name: /payment schedule/i });
      await user.click(paymentTab);
      
      // Then switch back to Budget Dashboard
      const budgetTab = screen.getByRole('tab', { name: /budget dashboard/i });
      await user.click(budgetTab);
      
      expect(budgetTab).toHaveAttribute('aria-selected', 'true');
      expect(paymentTab).toHaveAttribute('aria-selected', 'false');
    });

    it('maintains view mode state across interactions', async () => {
      const user = userEvent.setup();
      renderWithProvider(<CashFlowHeader />);
      
      const paymentTab = screen.getByRole('tab', { name: /payment schedule/i });
      await user.click(paymentTab);
      
      expect(paymentTab).toHaveAttribute('aria-selected', 'true');
      
      // Verify state is maintained
      expect(paymentTab).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('Context Integration Tests', () => {
    it('uses viewMode from context', () => {
      renderWithProvider(<CashFlowHeader />);
      
      // The component should render with the default viewMode from context
      const budgetTab = screen.getByRole('tab', { name: /budget dashboard/i });
      expect(budgetTab).toHaveAttribute('aria-selected', 'true');
    });

    it('calls setViewMode from context when tab is clicked', async () => {
      const user = userEvent.setup();
      renderWithProvider(<CashFlowHeader />);
      
      const paymentTab = screen.getByRole('tab', { name: /payment schedule/i });
      await user.click(paymentTab);
      
      // After clicking, the tab should be selected
      expect(paymentTab).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('Accessibility Tests', () => {
    it('has proper ARIA roles', () => {
      renderWithProvider(<CashFlowHeader />);
      
      expect(screen.getByRole('tablist')).toBeInTheDocument();
      expect(screen.getAllByRole('tab')).toHaveLength(2);
    });

    it('tabs have proper ARIA attributes', () => {
      renderWithProvider(<CashFlowHeader />);
      
      const budgetTab = screen.getByRole('tab', { name: /budget dashboard/i });
      const paymentTab = screen.getByRole('tab', { name: /payment schedule/i });
      
      expect(budgetTab).toHaveAttribute('aria-selected');
      expect(paymentTab).toHaveAttribute('aria-selected');
    });

    it('has accessible tab labels', () => {
      renderWithProvider(<CashFlowHeader />);
      
      expect(screen.getByRole('tab', { name: /budget dashboard/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /payment schedule/i })).toBeInTheDocument();
    });

    it('tablist has descriptive aria-label', () => {
      renderWithProvider(<CashFlowHeader />);
      
      const tablist = screen.getByRole('tablist');
      expect(tablist).toHaveAttribute('aria-label', 'cash flow view tabs');
    });
  });

  describe('Visual Structure Tests', () => {
    it('renders Paper component with correct styling', () => {
      const { container } = renderWithProvider(<CashFlowHeader />);
      
      const paper = container.querySelector('.MuiPaper-root');
      expect(paper).toBeInTheDocument();
      expect(paper).toHaveClass('MuiPaper-elevation0');
    });

    it('renders Box container', () => {
      const { container } = renderWithProvider(<CashFlowHeader />);
      
      const box = container.querySelector('.MuiBox-root');
      expect(box).toBeInTheDocument();
    });

    it('ViewToggle is rendered inside Paper', () => {
      const { container } = renderWithProvider(<CashFlowHeader />);
      
      const paper = container.querySelector('.MuiPaper-root');
      const tablist = screen.getByRole('tablist');
      
      expect(paper).toContainElement(tablist);
    });
  });

  describe('Edge Cases', () => {
    it('handles rapid tab switching', async () => {
      const user = userEvent.setup();
      renderWithProvider(<CashFlowHeader />);
      
      const budgetTab = screen.getByRole('tab', { name: /budget dashboard/i });
      const paymentTab = screen.getByRole('tab', { name: /payment schedule/i });
      
      // Rapidly switch between tabs
      await user.click(paymentTab);
      await user.click(budgetTab);
      await user.click(paymentTab);
      await user.click(budgetTab);
      
      // Should end up on Budget Dashboard
      expect(budgetTab).toHaveAttribute('aria-selected', 'true');
    });

    it('renders correctly when re-mounted', () => {
      const { unmount } = renderWithProvider(<CashFlowHeader />);
      
      unmount();
      
      renderWithProvider(<CashFlowHeader />);
      
      expect(screen.getByRole('tablist')).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /budget dashboard/i })).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('Integration Tests', () => {
    it('complete workflow: render, switch views, verify state', async () => {
      const user = userEvent.setup();
      renderWithProvider(<CashFlowHeader />);
      
      // Initial state
      const budgetTab = screen.getByRole('tab', { name: /budget dashboard/i });
      const paymentTab = screen.getByRole('tab', { name: /payment schedule/i });
      
      expect(budgetTab).toHaveAttribute('aria-selected', 'true');
      expect(paymentTab).toHaveAttribute('aria-selected', 'false');
      
      // Switch to Payment Schedule
      await user.click(paymentTab);
      expect(paymentTab).toHaveAttribute('aria-selected', 'true');
      expect(budgetTab).toHaveAttribute('aria-selected', 'false');
      
      // Switch back to Budget Dashboard
      await user.click(budgetTab);
      expect(budgetTab).toHaveAttribute('aria-selected', 'true');
      expect(paymentTab).toHaveAttribute('aria-selected', 'false');
    });

    it('works correctly within CashFlowProvider', async () => {
      const user = userEvent.setup();
      renderWithProvider(<CashFlowHeader />);
      
      // Verify component renders and functions correctly
      expect(screen.getByRole('tablist')).toBeInTheDocument();
      
      const paymentTab = screen.getByRole('tab', { name: /payment schedule/i });
      await user.click(paymentTab);
      
      expect(paymentTab).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('Keyboard Navigation Tests', () => {
    it('supports keyboard navigation between tabs', async () => {
      const user = userEvent.setup();
      renderWithProvider(<CashFlowHeader />);
      
      const budgetTab = screen.getByRole('tab', { name: /budget dashboard/i });
      budgetTab.focus();
      
      // Press right arrow to move to next tab
      await user.keyboard('{ArrowRight}');
      
      const paymentTab = screen.getByRole('tab', { name: /payment schedule/i });
      expect(paymentTab).toHaveFocus();
    });

    it('tabs are keyboard accessible', () => {
      renderWithProvider(<CashFlowHeader />);
      
      const budgetTab = screen.getByRole('tab', { name: /budget dashboard/i });
      const paymentTab = screen.getByRole('tab', { name: /payment schedule/i });
      
      expect(budgetTab).toHaveAttribute('tabindex');
      expect(paymentTab).toHaveAttribute('tabindex');
    });
  });
});
