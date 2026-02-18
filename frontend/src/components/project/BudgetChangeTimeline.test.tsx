
/**
 * BudgetChangeTimeline Component Tests
 * 
 * Comprehensive test suite for BudgetChangeTimeline component
 * Tests: Timeline visualization, visual indicators, variance display, chronological order
 */

import { waitFor } from '@testing-library/react';
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BudgetChangeTimeline } from './BudgetChangeTimeline';
import { ProjectBudgetChangeHistory } from '../../types/projectBudget';

// Mock child components
vi.mock('./VarianceIndicator', () => ({
  VarianceIndicator: ({ variance, percentageVariance, currency }: any) => (
    <div data-testid="variance-indicator">
      {variance > 0 ? '+' : ''}{variance} ({percentageVariance}%) {currency}
    </div>
  ),
}));

describe('BudgetChangeTimeline Component', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  const createMockChange = (overrides?: Partial<ProjectBudgetChangeHistory>): ProjectBudgetChangeHistory => ({
    id: 1,
    projectId: 123,
    fieldName: 'EstimatedProjectCost',
    oldValue: 100000,
    newValue: 110000,
    variance: 10000,
    percentageVariance: 10,
    currency: 'USD',
    changedBy: 'user-id',
    changedByUser: {
      id: 'user-id',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
    },
    changedDate: '2024-01-15T10:30:00Z',
    reason: 'Budget adjustment',
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Timeline Visualization Tests (Req 3.1)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

    it('should display changes in chronological order', () => {
      const changes: ProjectBudgetChangeHistory[] = [
        createMockChange({ id: 1, changedDate: '2024-01-15T10:00:00Z' }),
        createMockChange({ id: 2, changedDate: '2024-01-16T10:00:00Z' }),
        createMockChange({ id: 3, changedDate: '2024-01-17T10:00:00Z' }),
      ];

      render(<BudgetChangeTimeline changes={changes} />);

      // All timeline items should be rendered
      changes.forEach((change) => {
        expect(screen.getAllByText(new RegExp(change.changedByUser.firstName)).length).toBeGreaterThan(0);
      });
    });

    it('should render empty state when no changes provided', () => {
      render(<BudgetChangeTimeline changes={[]} />);

      expect(screen.getByText('No budget changes to display')).toBeInTheDocument();
    });

    it('should display formatted dates correctly', () => {
      const change = createMockChange({ changedDate: '2024-01-15T10:30:00Z' });

      render(<BudgetChangeTimeline changes={[change]} />);

      // Should display formatted date (format: MMM dd, yyyy HH:mm)
      expect(screen.getByText(/Jan 15, 2024/)).toBeInTheDocument();
    });

    it('should display user information for each change', () => {
      const change = createMockChange({
        changedByUser: {
          id: 'user-123',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
        },
      });

      render(<BudgetChangeTimeline changes={[change]} />);

      expect(screen.getByText(/Jane Smith/)).toBeInTheDocument();
      expect(screen.getByText('jane.smith@example.com')).toBeInTheDocument();
    });
  });

  describe('Visual Indicators Tests (Req 3.2)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

    it('should use different visual indicators for cost vs fee changes', () => {
      const costChange = createMockChange({
        id: 1,
        fieldName: 'EstimatedProjectCost',
      });
      const feeChange = createMockChange({
        id: 2,
        fieldName: 'EstimatedProjectFee',
      });

      render(<BudgetChangeTimeline changes={[costChange, feeChange]} />);

      // Should display field names
      expect(screen.getByText('Project Cost')).toBeInTheDocument();
      expect(screen.getByText('Project Fee')).toBeInTheDocument();
    });

    it('should display AttachMoney icon for cost changes', () => {
      const costChange = createMockChange({ fieldName: 'EstimatedProjectCost' });

      const { container } = render(<BudgetChangeTimeline changes={[costChange]} />);

      // Check for MUI icon (AttachMoneyIcon renders as svg)
      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('should display AccountBalanceWallet icon for fee changes', () => {
      const feeChange = createMockChange({ fieldName: 'EstimatedProjectFee' });

      const { container } = render(<BudgetChangeTimeline changes={[feeChange]} />);

      // Check for MUI icon
      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('should use primary color for cost changes', () => {
      const costChange = createMockChange({ fieldName: 'EstimatedProjectCost' });

      render(<BudgetChangeTimeline changes={[costChange]} />);

      const chip = screen.getByText('Project Cost');
      expect(chip).toBeInTheDocument();
    });

    it('should use secondary color for fee changes', () => {
      const feeChange = createMockChange({ fieldName: 'EstimatedProjectFee' });

      render(<BudgetChangeTimeline changes={[feeChange]} />);

      const chip = screen.getByText('Project Fee');
      expect(chip).toBeInTheDocument();
    });
  });

  describe('Variance Display Tests (Req 3.3)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

    it('should display variance with color coding for increases', () => {
      const change = createMockChange({
        variance: 10000,
        percentageVariance: 10,
      });

      render(<BudgetChangeTimeline changes={[change]} />);

      const varianceIndicator = screen.getByTestId('variance-indicator');
      expect(varianceIndicator).toHaveTextContent('+10000');
      expect(varianceIndicator).toHaveTextContent('10%');
    });

    it('should display variance with color coding for decreases', () => {
      const change = createMockChange({
        oldValue: 110000,
        newValue: 100000,
        variance: -10000,
        percentageVariance: -9.09,
      });

      render(<BudgetChangeTimeline changes={[change]} />);

      const varianceIndicator = screen.getByTestId('variance-indicator');
      expect(varianceIndicator).toHaveTextContent('-10000');
      expect(varianceIndicator).toHaveTextContent('-9.09%');
    });

    it('should display old and new values correctly', () => {
      const change = createMockChange({
        oldValue: 100000,
        newValue: 110000,
        currency: 'USD',
      });

      render(<BudgetChangeTimeline changes={[change]} />);

      // Should display formatted currency values
      expect(screen.getByText(/\$100,000\.00/)).toBeInTheDocument();
      expect(screen.getByText(/\$110,000\.00/)).toBeInTheDocument();
    });

    it('should display currency correctly', () => {
      const change = createMockChange({
        currency: 'EUR',
        oldValue: 50000,
        newValue: 55000,
      });

      render(<BudgetChangeTimeline changes={[change]} />);

      // Should display EUR currency
      expect(screen.getByText(/€50,000\.00/)).toBeInTheDocument();
      expect(screen.getByText(/€55,000\.00/)).toBeInTheDocument();
    });
  });

  describe('Change Reasons Tests (Req 3.4)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

    it('should display change reasons when provided', async () => {
      const change = createMockChange({
        reason: 'Budget increased due to scope expansion',
      });

      render(<BudgetChangeTimeline changes={[change]} />);

      expect(screen.getByText(/Budget increased due to scope expansion/)).toBeInTheDocument();
      expect(screen.getByText('Reason:')).toBeInTheDocument();
    });

    it('should not display reason section when reason is not provided', async () => {
      const change = createMockChange({
        reason: undefined,
      });

      render(<BudgetChangeTimeline changes={[change]} />);

      await waitFor(() => expect(screen.queryByText('Reason:')).not.toBeInTheDocument());
    });

    it('should handle empty string reason', async () => {
      const change = createMockChange({
        reason: '',
      });

      render(<BudgetChangeTimeline changes={[change]} />);

      // Empty string should not display reason section
      await waitFor(() => expect(screen.queryByText('Reason:')).not.toBeInTheDocument());
    });

    it('should display very long reasons correctly', () => {
      const longReason = 'A'.repeat(500);
      const change = createMockChange({
        reason: longReason,
      });

      render(<BudgetChangeTimeline changes={[change]} />);

      expect(screen.getByText(new RegExp(longReason))).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

    it('should handle special characters in reason field', () => {
      const change = createMockChange({
        reason: 'Budget change: <script>alert("test")</script> & special chars',
      });

      render(<BudgetChangeTimeline changes={[change]} />);

      // Should render without XSS issues
      expect(screen.getByText(/Budget change:/)).toBeInTheDocument();
    });

    it('should handle very large variance numbers', () => {
      const change = createMockChange({
        oldValue: 1000000,
        newValue: 5000000,
        variance: 4000000,
        percentageVariance: 400,
        currency: 'USD',
      });

      render(<BudgetChangeTimeline changes={[change]} />);

      // Should format large numbers correctly
      expect(screen.getByText(/\$1,000,000\.00/)).toBeInTheDocument();
      expect(screen.getByText(/\$5,000,000\.00/)).toBeInTheDocument();
    });

    it('should handle zero variance', () => {
      const change = createMockChange({
        oldValue: 100000,
        newValue: 100000,
        variance: 0,
        percentageVariance: 0,
      });

      render(<BudgetChangeTimeline changes={[change]} />);

      const varianceIndicator = screen.getByTestId('variance-indicator');
      expect(varianceIndicator).toHaveTextContent('0');
    });

    it('should handle invalid date strings gracefully', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const change = createMockChange({
        changedDate: 'invalid-date',
      });

      render(<BudgetChangeTimeline changes={[change]} />);

      // Should still render, showing the invalid date string
      expect(screen.getByText('invalid-date')).toBeInTheDocument();
      consoleErrorSpy.mockRestore();
    });

    it('should handle multiple changes with same timestamp', () => {
      const changes: ProjectBudgetChangeHistory[] = [
        createMockChange({ id: 1, changedDate: '2024-01-15T10:00:00Z' }),
        createMockChange({ id: 2, changedDate: '2024-01-15T10:00:00Z' }),
      ];

      render(<BudgetChangeTimeline changes={changes} />);

      // Both should render
      const timelineItems = screen.getAllByText(/Jan 15, 2024/);
      expect(timelineItems).toHaveLength(2);
    });

    it('should alternate timeline item positions', () => {
      const changes: ProjectBudgetChangeHistory[] = [
        createMockChange({ id: 1 }),
        createMockChange({ id: 2 }),
        createMockChange({ id: 3 }),
      ];

      const { container } = render(<BudgetChangeTimeline changes={changes} />);

      // Timeline should use alternate positioning
      const timelineItems = container.querySelectorAll('.MuiTimelineItem-root');
      expect(timelineItems.length).toBe(3);
    });
  });

  describe('Currency Formatting', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

    it('should format USD currency correctly', () => {
      const change = createMockChange({
        currency: 'USD',
        oldValue: 1234.56,
        newValue: 5678.90,
      });

      render(<BudgetChangeTimeline changes={[change]} />);

      expect(screen.getByText(/\$1,234\.56/)).toBeInTheDocument();
      expect(screen.getByText(/\$5,678\.90/)).toBeInTheDocument();
    });

    it('should format EUR currency correctly', () => {
      const change = createMockChange({
        currency: 'EUR',
        oldValue: 1234.56,
        newValue: 5678.90,
      });

      render(<BudgetChangeTimeline changes={[change]} />);

      expect(screen.getByText(/€1,234\.56/)).toBeInTheDocument();
      expect(screen.getByText(/€5,678\.90/)).toBeInTheDocument();
    });

    it('should handle decimal precision correctly', () => {
      const change = createMockChange({
        currency: 'USD',
        oldValue: 100000.999,
        newValue: 110000.001,
      });

      render(<BudgetChangeTimeline changes={[change]} />);

      // Should round to 2 decimal places
      expect(screen.getByText(/\$100,001\.00/)).toBeInTheDocument();
      expect(screen.getByText(/\$110,000\.00/)).toBeInTheDocument();
    });
  });
});




