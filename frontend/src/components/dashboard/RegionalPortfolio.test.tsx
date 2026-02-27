import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import RegionalPortfolio from './RegionalPortfolio';

describe('RegionalPortfolio Component', () => {
  const mockRegionalData = [
    {
      region: "North America",
      profit: 18.5,
      q4: 12,
      revenue: 2500000
    },
    {
      region: "Europe",
      profit: 15.2,
      q4: 8,
      revenue: 1800000
    },
    {
      region: "Asia Pacific",
      profit: 12.4,
      q4: 15,
      revenue: 3200000
    }
  ];

  it('renders regional portfolio data correctly', () => {
    render(<RegionalPortfolio data={mockRegionalData} />);

    expect(screen.getByText('Regional Portfolio')).toBeInTheDocument();

    // Verify regions
    expect(screen.getByText('North America')).toBeInTheDocument();
    expect(screen.getByText('Europe')).toBeInTheDocument();
    expect(screen.getByText('Asia Pacific')).toBeInTheDocument();

    // Verify formatted percentages
    expect(screen.getByText('18.5%')).toBeInTheDocument();
    expect(screen.getByText('15.2%')).toBeInTheDocument();
    expect(screen.getByText('12.4%')).toBeInTheDocument();

    // Verify Q4 counts
    expect(screen.getByText('Q4: 12 projects')).toBeInTheDocument();
    expect(screen.getByText('Q4: 8 projects')).toBeInTheDocument();
    expect(screen.getByText('Q4: 15 projects')).toBeInTheDocument();

    // Verify loosely formatted currencies (depending on the internal formatCurrency impl mapping)
    // The previous tests indicated these translate into X.XM format, e.g. $2.5M
    expect(screen.getByText(/\$2\.5M revenue/)).toBeInTheDocument();
    expect(screen.getByText(/\$1\.8M revenue/)).toBeInTheDocument();
    expect(screen.getByText(/\$3\.2M revenue/)).toBeInTheDocument();
  });
});
