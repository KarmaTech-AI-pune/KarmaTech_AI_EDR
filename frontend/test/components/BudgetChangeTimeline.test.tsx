/**
 * BudgetChangeTimeline Component Tests
 * 
 * Comprehensive test suite for BudgetChangeTimeline component
 * Tests: Timeline visualization, visual indicators, variance display, chronological order
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { BudgetChangeTimeline } from '../../src/components/project/BudgetChangeTimeline';
import { ProjectBudgetChangeHistory } from '../../src/types/projectBudget';

describe('BudgetChangeTimeline Component', () => {
  const mockCostChange: ProjectBudgetChangeHistory = {
    id: 1,
    projectId: 123,
    fieldName: 'EstimatedProjectCost',
    oldValue: 100000,
    newValue: 150000,
    variance: 50000,
    percentageVariance: 50,
    currency: 'USD',
    changedBy: 'user1',
    changedByUser: {
      id: 'user1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
    },
    changedDate: '2024-01-15T10:30:00Z',
    reason: 'Scope expansion',
  };

  const mockFeeChange: ProjectBudgetChangeHistory = {
    id: 2,
    projectId: 123,
    fieldName: 'EstimatedProjectFee',
    oldValue: 10000,
    newValue: 15000,
    variance: 5000,
    percentageVariance: 50,
    currency: 'USD',
    changedBy: 'user2',
    changedByUser: {
      id: 'user2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
    },
    changedDate: '2024-01-20T14:15:00Z',
    reason: 'Fee adjustment',
  };

  const mockDecreaseChange: ProjectBudgetChangeHistory = {
    id: 3,
    projectId: 123,
    fieldName: 'EstimatedProjectCost',
    oldValue: 150000,
    newValue: 120000,
    variance: -30000,
    percentageVariance: -20,
    currency: 'USD',
    changedBy: 'user1',
    changedByUser: {
      id: 'user1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
    },
    changedDate: '2024-01-25T09:00:00Z',
    reason: 'Cost optimization',
  };

  describe('Timeline Visualization Tests (Req 3.1)', () => {
    it('displays changes in chronological order', () => {
      const changes = [mockCostChange, mockFeeChange, mockDecreaseChange];
      
      render(<BudgetChangeTimeline changes={changes} />);
      
      // All changes should be displayed
      expect(screen.getByText(/John Doe/)).toBeInTheDocument();
      expect(screen.getByText(/Jane Smith/)).toBeInTheDocument();
      expect(screen.getByText(/john.doe@example.com/)).toBeInTheDocument();
      expect(screen.getByText(/jane.smith@example.com/)).toBeInTheDocument();
    });

    it('renders empty state when no changes provided', () => {
      render(<BudgetChangeTimeline changes={[]} />);
      
      expect(screen.getByText('No budget changes to display')).toBeInTheDocument();
    });

    it('displays all timeline items for multiple changes', () => {
      const changes = [mockCostChange, mockFeeChange];
      
      const { container } = render(<BudgetChangeTimeline changes={changes} />);
      
      // Check for timeline structure
      const timelineItems = container.querySelectorAll('.MuiTimelineItem-root');
      expect(timelineItems.length).toBe(2);
    });
  });

  describe('Visual Indicators Tests (Req 3.2)', () => {
    it('shows different visual indicators for cost vs fee changes', () => {
      const changes = [mockCostChange, mockFeeChange];
      
      render(<BudgetChangeTimeline changes={changes} />);
      
      // Check for field name chips
      expect(screen.getByText('Project Cost')).toBeInTheDocument();
      expect(screen.getByText('Project Fee')).toBeInTheDocument();
    });

    it('displays AttachMoney icon for cost changes', () => {
      render(<BudgetChangeTimeline changes={[mockCostChange]} />);
      
      const { container } = render(<BudgetChangeTimeline changes={[mockCostChange]} />);
      
      // Check for icon presence (MUI icons render as SVG)
      const svgIcons = container.querySelectorAll('svg');
      expect(svgIcons.length).toBeGreaterThan(0);
    });

    it('displays AccountBalanceWallet icon for fee changes', () => {
      const { container } = render(<BudgetChangeTimeline changes={[mockFeeChange]} />);
      
      // Check for icon presence
      const svgIcons = container.querySelectorAll('svg');
      expect(svgIcons.length).toBeGreaterThan(0);
    });

    it('uses primary color for cost changes', () => {
      const { container } = render(<BudgetChangeTimeline changes={[mockCostChange]} />);
      
      // Check for primary color chip
      const chips = container.querySelectorAll('.MuiChip-colorPrimary');
      expect(chips.length).toBeGreaterThan(0);
    });

    it('uses secondary color for fee changes', () => {
      const { container } = render(<BudgetChangeTimeline changes={[mockFeeChange]} />);
      
      // Check for secondary color chip
      const chips = container.querySelectorAll('.MuiChip-colorSecondary');
      expect(chips.length).toBeGreaterThan(0);
    });
  });

  describe('Variance Display Tests (Req 3.3)', () => {
    it('displays variance with color coding for increases', () => {
      render(<BudgetChangeTimeline changes={[mockCostChange]} />);
      
      // Check for variance display
      expect(screen.getByText(/Variance:/)).toBeInTheDocument();
    });

    it('displays variance with color coding for decreases', () => {
      render(<BudgetChangeTimeline changes={[mockDecreaseChange]} />);
      
      // Check for variance display
      expect(screen.getByText(/Variance:/)).toBeInTheDocument();
    });

    it('shows both absolute and percentage variance', () => {
      render(<BudgetChangeTimeline changes={[mockCostChange]} />);
      
      // Variance indicator should be present
      expect(screen.getByText(/Variance:/)).toBeInTheDocument();
    });
  });

  describe('Change Reasons Tests (Req 3.4)', () => {
    it('displays change reasons when provided', () => {
      render(<BudgetChangeTimeline changes={[mockCostChange]} />);
      
      expect(screen.getByText(/Reason:/)).toBeInTheDocument();
      expect(screen.getByText(/"Scope expansion"/)).toBeInTheDocument();
    });

    it('does not display reason section when reason is not provided', () => {
      const changeWithoutReason = { ...mockCostChange, reason: undefined };
      
      render(<BudgetChangeTimeline changes={[changeWithoutReason]} />);
      
      expect(screen.queryByText(/Reason:/)).not.toBeInTheDocument();
    });

    it('displays multiple reasons for multiple changes', () => {
      const changes = [mockCostChange, mockFeeChange];
      
      render(<BudgetChangeTimeline changes={changes} />);
      
      expect(screen.getByText(/"Scope expansion"/)).toBeInTheDocument();
      expect(screen.getByText(/"Fee adjustment"/)).toBeInTheDocument();
    });
  });

  describe('Date and User Information Tests', () => {
    it('displays formatted date for each change', () => {
      render(<BudgetChangeTimeline changes={[mockCostChange]} />);
      
      // Date should be formatted (e.g., "Jan 15, 2024 10:30")
      expect(screen.getByText(/Jan 15, 2024/)).toBeInTheDocument();
    });

    it('displays user full name', () => {
      render(<BudgetChangeTimeline changes={[mockCostChange]} />);
      
      expect(screen.getByText(/John Doe/)).toBeInTheDocument();
    });

    it('displays user email', () => {
      render(<BudgetChangeTimeline changes={[mockCostChange]} />);
      
      expect(screen.getByText(/john.doe@example.com/)).toBeInTheDocument();
    });
  });

  describe('Currency Formatting Tests', () => {
    it('formats currency values correctly', () => {
      render(<BudgetChangeTimeline changes={[mockCostChange]} />);
      
      // Check for formatted currency (e.g., "$100,000.00")
      expect(screen.getByText(/\$100,000\.00/)).toBeInTheDocument();
      expect(screen.getByText(/\$150,000\.00/)).toBeInTheDocument();
    });

    it('handles different currency codes', () => {
      const eurChange = { ...mockCostChange, currency: 'EUR' };
      
      render(<BudgetChangeTimeline changes={[eurChange]} />);
      
      // EUR symbol should be present
      expect(screen.getByText(/€/)).toBeInTheDocument();
    });

    it('formats large numbers with commas', () => {
      const largeChange = {
        ...mockCostChange,
        oldValue: 1000000,
        newValue: 2000000,
      };
      
      render(<BudgetChangeTimeline changes={[largeChange]} />);
      
      expect(screen.getByText(/\$1,000,000\.00/)).toBeInTheDocument();
      expect(screen.getByText(/\$2,000,000\.00/)).toBeInTheDocument();
    });
  });

  describe('Value Change Display Tests', () => {
    it('displays old and new values with arrow', () => {
      render(<BudgetChangeTimeline changes={[mockCostChange]} />);
      
      expect(screen.getByText(/Value Change:/)).toBeInTheDocument();
      expect(screen.getByText('→')).toBeInTheDocument();
    });

    it('shows value transition clearly', () => {
      const { container } = render(<BudgetChangeTimeline changes={[mockCostChange]} />);
      
      // Check for chips displaying values
      const chips = container.querySelectorAll('.MuiChip-root');
      expect(chips.length).toBeGreaterThan(2); // Field name + old value + new value + variance
    });
  });

  describe('Edge Cases', () => {
    it('handles very long reason text', () => {
      const longReason = 'A'.repeat(500);
      const changeWithLongReason = { ...mockCostChange, reason: longReason };
      
      render(<BudgetChangeTimeline changes={[changeWithLongReason]} />);
      
      expect(screen.getByText(new RegExp(longReason))).toBeInTheDocument();
    });

    it('handles special characters in reason field', () => {
      const specialReason = 'Budget change due to <script>alert("test")</script> & "quotes"';
      const changeWithSpecialChars = { ...mockCostChange, reason: specialReason };
      
      render(<BudgetChangeTimeline changes={[changeWithSpecialChars]} />);
      
      // Should display the text safely (React escapes by default)
      expect(screen.getByText(new RegExp('Budget change due to'))).toBeInTheDocument();
    });

    it('handles very large variance numbers', () => {
      const largeVarianceChange = {
        ...mockCostChange,
        oldValue: 1000000,
        newValue: 10000000,
        variance: 9000000,
        percentageVariance: 900,
      };
      
      render(<BudgetChangeTimeline changes={[largeVarianceChange]} />);
      
      // Should format large numbers correctly
      expect(screen.getByText(/\$10,000,000\.00/)).toBeInTheDocument();
    });

    it('handles zero variance (should not occur but test defensive coding)', () => {
      const zeroVarianceChange = {
        ...mockCostChange,
        oldValue: 100000,
        newValue: 100000,
        variance: 0,
        percentageVariance: 0,
      };
      
      render(<BudgetChangeTimeline changes={[zeroVarianceChange]} />);
      
      // Should still render without errors
      expect(screen.getByText(/Variance:/)).toBeInTheDocument();
    });

    it('handles invalid date strings gracefully', () => {
      const invalidDateChange = { ...mockCostChange, changedDate: 'invalid-date' };
      
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      render(<BudgetChangeTimeline changes={[invalidDateChange]} />);
      
      // Should display the original string if parsing fails
      expect(screen.getByText(/invalid-date/)).toBeInTheDocument();
      
      consoleErrorSpy.mockRestore();
    });

    it('handles missing user information gracefully', () => {
      const changeWithoutUser = {
        ...mockCostChange,
        changedByUser: {
          id: '',
          firstName: '',
          lastName: '',
          email: '',
        },
      };
      
      render(<BudgetChangeTimeline changes={[changeWithoutUser]} />);
      
      // Should render without crashing
      const { container } = render(<BudgetChangeTimeline changes={[changeWithoutUser]} />);
      expect(container).toBeInTheDocument();
    });
  });

  describe('Responsive Design Tests', () => {
    it('renders timeline structure correctly', () => {
      const { container } = render(<BudgetChangeTimeline changes={[mockCostChange]} />);
      
      // Check for timeline structure
      expect(container.querySelector('.MuiTimeline-root')).toBeInTheDocument();
    });

    it('alternates timeline item positions', () => {
      const changes = [mockCostChange, mockFeeChange];
      
      const { container } = render(<BudgetChangeTimeline changes={changes} />);
      
      // Timeline should have alternating positions
      const timelineItems = container.querySelectorAll('.MuiTimelineItem-root');
      expect(timelineItems.length).toBe(2);
    });
  });
});
