import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import NPVProfitability from './NPVProfitability';

vi.mock('../../utils/formatters', () => ({
  formatCurrency: (val: number) => `$MOCKED_${val}`
}));

describe('NPVProfitability Component', () => {
  it('renders loading state when data is null', () => {
    render(<NPVProfitability data={null} />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders data correctly when provided', () => {
    const mockData = {
      currentNpv: 1250000,
      highProfitProjectsCount: 5,
      mediumProfitProjectsCount: 12,
      lowProfitProjectsCount: 3,
      whatIfAnalysis: 'If we shift 2 Low Profit projects to Medium Profit, NPV increases by 5%.',
      baseNpv: 1000000,
      optimisticNpv: 1500000,
      pessimisticNpv: 800000,
      avgProfitabilityIndex: 1.25,
      projectCount: 20,
      lastUpdated: '2023-10-27T10:00:00Z'
    };

    render(<NPVProfitability data={mockData} />);

    expect(screen.getByText('NPV & Profitability')).toBeInTheDocument();
    
    // Check formatted NPV
    expect(screen.getByText('Current NPV')).toBeInTheDocument();
    expect(screen.getByText('$MOCKED_1250000')).toBeInTheDocument(); // Uses the mocked output
    
    // Check project counts
    expect(screen.getByText('High Profit (20%+)')).toBeInTheDocument();
    expect(screen.getByText('5 projects')).toBeInTheDocument();
    
    expect(screen.getByText('Medium Profit (10-20%)')).toBeInTheDocument();
    expect(screen.getByText('12 projects')).toBeInTheDocument();
    
    expect(screen.getByText('Low Profit (5-10%)')).toBeInTheDocument();
    expect(screen.getByText('3 projects')).toBeInTheDocument();

    // Check What-If Analysis
    expect(screen.getByText('What-If Analysis')).toBeInTheDocument();
    expect(screen.getByText('If we shift 2 Low Profit projects to Medium Profit, NPV increases by 5%.')).toBeInTheDocument();
  });
});
