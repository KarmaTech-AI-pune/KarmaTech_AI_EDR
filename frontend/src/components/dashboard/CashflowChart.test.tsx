import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CashflowChart from './CashflowChart';

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="recharts-responsive-container">{children}</div>,
  BarChart: ({ children }: any) => <div data-testid="recharts-bar-chart">{children}</div>,
  Bar: ({ name }: any) => <div data-testid={`recharts-bar-${name}`}>{name}</div>,
  XAxis: () => <div data-testid="recharts-x-axis" />,
  YAxis: () => <div data-testid="recharts-y-axis" />,
  CartesianGrid: () => <div data-testid="recharts-cartesian-grid" />,
  Tooltip: () => <div data-testid="recharts-tooltip" />,
  Legend: () => <div data-testid="recharts-legend" />
}));

describe('CashflowChart Component', () => {
  const mockData = [
    { month: 'Jan', planned: 50, actual: 45, variance: -5 },
    { month: 'Feb', planned: 60, actual: 65, variance: 5 },
  ];

  it('renders header and chart', () => {
    render(<CashflowChart data={mockData} />);

    expect(screen.getByText('Monthly Cashflow Analysis')).toBeInTheDocument();
    
    // Default timeframe
    expect(screen.getByText('This Year')).toBeInTheDocument();

    // Verify Legend items (mocked as plain divs)
    expect(screen.getByText('Planned Revenue')).toBeInTheDocument();
    expect(screen.getByText('Actual Revenue')).toBeInTheDocument();
  });

  it('can change the timeframe via select dropdown', () => {
    render(<CashflowChart data={mockData} />);

    const selectButton = screen.getByRole('combobox');
    fireEvent.mouseDown(selectButton);

    const listbox = screen.getByRole('listbox');
    const option = within(listbox).getByText('Last Year');
    
    fireEvent.click(option);

    expect(screen.getAllByText('Last Year').length).toBeGreaterThan(0);
  });
});
