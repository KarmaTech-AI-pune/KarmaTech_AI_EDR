import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ProjectStatusPieChart from './ProjectStatusPieChart';

// Mock recharts to avoid rendering issues in JSDOM environment
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: ({ children, onClick, data }: any) => (
    <div 
      data-testid="pie" 
      onClick={() => {
        // Find a valid item to simulate a click
        if (data && data.length > 0) {
          onClick(data[0]);
        }
      }}
    >
      {children}
    </div>
  ),
  Cell: () => <div data-testid="cell" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}));

describe('ProjectStatusPieChart Component', () => {
  it('renders loading state initially', () => {
    render(<ProjectStatusPieChart />);
    expect(screen.getByText('Loading chart data...')).toBeInTheDocument();
  });

  it('renders chart and allows dialog interaction after loading', async () => {
    render(<ProjectStatusPieChart />);

    // Wait for the mock API call to resolve
    await waitFor(() => {
      expect(screen.queryByText('Loading chart data...')).not.toBeInTheDocument();
    });

    // Verify chart rendered
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();

    // Simulate clicking on the pie chart to open dialog
    const pie = screen.getByTestId('pie');
    fireEvent.click(pie);

    // Verify dialog opens (matches dynamic title partially)
    await waitFor(() => {
      expect(screen.getByText(/Projects with Status:/)).toBeInTheDocument();
    });
    
    // We expect some text regarding the project count given the mock data structure inside the component
    expect(screen.getByText(/There are/)).toBeInTheDocument();
  });
});
