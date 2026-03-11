import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import BudgetHealthDisplay, { BudgetHealthList, BudgetHealthTable } from '../BudgetHealthIndicatorExample';
import { getBudgetHealth } from '../../../../api/budgetHealthApi';
import { BudgetHealthStatus } from '../../../../types/budgetHealth';

// Mock Dependencies
vi.mock('../../../../api/budgetHealthApi', () => ({
  getBudgetHealth: vi.fn(),
}));

vi.mock('../BudgetHealthIndicator', () => ({
  BudgetHealthIndicator: () => <div data-testid="budget-health-indicator">Full Indicator</div>,
  CompactBudgetHealthIndicator: () => <div data-testid="compact-budget-health-indicator">Compact Indicator</div>
}));

describe('BudgetHealthDisplay', () => {
  const mockHealthData = {
    projectId: 1,
    estimatedBudget: 100000,
    actualCost: 50000,
    remainingBudget: 50000,
    utilizationPercentage: 50,
    status: 'Healthy' as BudgetHealthStatus,
    lastCalculatedAt: '2025-01-01T00:00:00Z',
    currency: 'USD'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    (getBudgetHealth as any).mockImplementation(() => new Promise(() => {}));
    
    render(<BudgetHealthDisplay projectId={1} />);
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders error message on API failure', async () => {
    (getBudgetHealth as any).mockRejectedValue(new Error('Network error'));
    
    render(<BudgetHealthDisplay projectId={1} />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load budget health information')).toBeInTheDocument();
    });
  });

  it('renders full version with correct data', async () => {
    (getBudgetHealth as any).mockResolvedValue(mockHealthData);
    
    render(<BudgetHealthDisplay projectId={1} />);
    
    await waitFor(() => {
      expect(screen.getByText('Budget Health')).toBeInTheDocument();
      expect(screen.getByTestId('budget-health-indicator')).toBeInTheDocument();
      expect(screen.getByText(/100,000|1,00,000/)).toBeInTheDocument(); // Estimated Budget
      expect(screen.getByText(/50,000/)).toBeInTheDocument();  // Actual Cost
      expect(screen.getByText(/50\.0/)).toBeInTheDocument();    // Utilization
    });
  });

  it('renders compact version when compact prop is true', async () => {
    (getBudgetHealth as any).mockResolvedValue(mockHealthData);
    
    render(<BudgetHealthDisplay projectId={1} compact />);
    
    await waitFor(() => {
      expect(screen.getByTestId('compact-budget-health-indicator')).toBeInTheDocument();
      expect(screen.queryByText('Budget Health')).not.toBeInTheDocument(); // Full view title
    });
  });
});

describe('BudgetHealthList', () => {
  it('renders a list of BudgetHealthDisplay components', async () => {
    (getBudgetHealth as any).mockResolvedValue({
      estimatedBudget: 10000,
      actualCost: 5000,
      utilizationPercentage: 50,
      status: 'Healthy' as BudgetHealthStatus,
    });
    
    render(<BudgetHealthList projectIds={[1, 2]} />);
    
    await waitFor(() => {
      const indicators = screen.getAllByTestId('budget-health-indicator');
      expect(indicators).toHaveLength(2);
    });
  });
});

describe('BudgetHealthTable', () => {
  it('renders a table of CompactBudgetHealthIndicator components with project names', async () => {
    (getBudgetHealth as any).mockResolvedValue({
      estimatedBudget: 10000,
      actualCost: 5000,
      utilizationPercentage: 50,
      status: 'Healthy' as BudgetHealthStatus,
    });
    
    const projects = [
      { id: 1, name: 'Project Alpha' },
      { id: 2, name: 'Project Beta' }
    ];
    
    render(<BudgetHealthTable projects={projects} />);
    
    await waitFor(() => {
      expect(screen.getByText('Project Alpha')).toBeInTheDocument();
      expect(screen.getByText('Project Beta')).toBeInTheDocument();
      
      const compactIndicators = screen.getAllByTestId('compact-budget-health-indicator');
      expect(compactIndicators).toHaveLength(2);
    });
  });
});
