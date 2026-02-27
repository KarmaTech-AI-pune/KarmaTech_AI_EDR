import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import BusinessDevelopmentCharts from './BusinessDevelopmentCharts';

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="recharts-responsive-container">{children}</div>,
  BarChart: ({ children }: any) => <div data-testid="recharts-bar-chart">{children}</div>,
  Bar: ({ name, onClick }: any) => (
    <div 
      data-testid={`recharts-bar-${name}`} 
      onClick={() => onClick({ name: name === 'Business Development Manager' ? 'Opportunity Tracking' : 'Go/No Go' })}
    >
      {name}
    </div>
  ),
  XAxis: () => <div data-testid="recharts-x-axis" />,
  YAxis: () => <div data-testid="recharts-y-axis" />,
  CartesianGrid: () => <div data-testid="recharts-cartesian-grid" />,
  Tooltip: () => <div data-testid="recharts-tooltip" />,
  Legend: () => <div data-testid="recharts-legend" />
}));

describe('BusinessDevelopmentCharts Component', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially and waits for it to finish', async () => {
    render(<BusinessDevelopmentCharts />);
    
    // The component fetches on mount, so initially it shows loading
    expect(screen.getByText('Loading chart data...')).toBeInTheDocument();
    
    // Wait for internal fetch to finish to prevent unhandled state updates
    await waitFor(() => {
      expect(screen.queryByText('Loading chart data...')).not.toBeInTheDocument();
    });
  });

  it('renders the chart and allows popup interaction', async () => {
    render(<BusinessDevelopmentCharts />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText('Loading chart data...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Status of Opportunities')).toBeInTheDocument();
    
    expect(screen.getByText('Business Development Manager')).toBeInTheDocument();
    expect(screen.getByText('Regional Manager')).toBeInTheDocument();
    expect(screen.getByText('Regional Director')).toBeInTheDocument();

    // Test popup interaction
    const bdmBar = screen.getByTestId('recharts-bar-Business Development Manager');
    fireEvent.click(bdmBar);

    // Verify popup appears with Opportunity Tracking data
    await waitFor(() => {
      expect(screen.getByText(/in the BDM state/)).toBeInTheDocument();
    });
  });
});
