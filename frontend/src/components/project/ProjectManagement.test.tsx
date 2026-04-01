import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProjectManagement from './ProjectManagement';

// Mock the child components to avoid testing their massive rendering logic
vi.mock('../dashboard/ProjectStatusPieChart', () => ({
  default: () => <div data-testid="mock-pie-chart">Pie Chart</div>
}));

describe('ProjectManagement', () => {
  it('renders the Project Management page correctly', () => {
    render(<ProjectManagement />);

    expect(screen.getByText('Project Management')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /\+ Initialize Project/i })).toBeInTheDocument();
    expect(screen.getByTestId('mock-pie-chart')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search projects')).toBeInTheDocument();
  });
});
