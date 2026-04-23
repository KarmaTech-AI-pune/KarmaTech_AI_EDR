import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MetricsGrid from './MetricsGrid';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme();

const renderWithTheme = (ui: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {ui}
    </ThemeProvider>
  );
};

describe('MetricsGrid Component', () => {
  const mockMetrics = {
    totalRevenue: 5000000,
    totalRevenueActual: 4800000,
    totalRevenueChange: 5,
    totalRevenueChangeType: 'positive' as const,
    profitMargin: 12.5,
    profitMarginChange: 2,
    profitMarginChangeType: 'positive' as const,
    revenueAtRisk: 150000,
    revenueAtRiskChange: 1,
    revenueAtRiskChangeType: 'negative' as const,
    approvalDelays: 4,
    approvalDelaysChange: 2,
    approvalDelaysChangeType: 'negative' as const,
  };

  it('renders all 5 metric cards with formatted data', () => {
    renderWithTheme(<MetricsGrid metrics={mockMetrics} />);

    // Titles
    expect(screen.getByText('Total Revenue-Expected')).toBeInTheDocument();
    expect(screen.getByText('Total Revenue-Actual')).toBeInTheDocument();
    expect(screen.getByText('Expected Gross Profit %')).toBeInTheDocument();
    expect(screen.getByText('Actual Gross Profit %')).toBeInTheDocument();
    expect(screen.getByText('Revenue at Risk')).toBeInTheDocument();
    expect(screen.getByText('Pending Approvals')).toBeInTheDocument();

    // Values (allowing flexible formatting based on formatCurrency logic handling millions/thousands)
    expect(screen.getByText('$5.0M')).toBeInTheDocument();
    expect(screen.getByText('$4.8M')).toBeInTheDocument();
    expect(screen.getByText('12.50%')).toBeInTheDocument();
    expect(screen.getByText('$150K')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });
});
