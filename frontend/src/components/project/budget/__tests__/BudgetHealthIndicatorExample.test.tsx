import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import BudgetHealthDisplayComponent from '../BudgetHealthIndicatorExample';

vi.mock('../../../../api/budgetHealthApi', () => ({
  getBudgetHealth: vi.fn().mockResolvedValue({
    status: 'Healthy',
    utilizationPercentage: 50,
    estimatedBudget: 1000,
    actualCost: 500
  })
}));

describe('BudgetHealthIndicatorExample', () => {
  it('BudgetHealthDisplayComponent renders without crashing', async () => {
    render(<BudgetHealthDisplayComponent projectId="1" />);
    // Since it tests an async loading state, wait for the main content or indicator to show
    await waitFor(() => {
      expect(screen.getByText(/Budget Health/i)).toBeInTheDocument();
    });
  });
});
