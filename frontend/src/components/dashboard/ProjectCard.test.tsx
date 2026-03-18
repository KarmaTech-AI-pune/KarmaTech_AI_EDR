import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ProjectCard from './ProjectCard';

describe('ProjectCard Component', () => {
  const mockProject = {
    id: "proj123",
    name: "Infrastructure Upgrade",
    region: "Europe",
    status: "falling_behind" as const, // Matches 'falling_behind' | 'scope_issue' | 'cost_overrun' | 'on_track'
    severity: "P3" as const, // Matches SEVERITY_COLORS
    delay: 15,
    budget: 500000,
    spent: 450000,
    timeline: "Q3 2024",
    issues: ["Resource Shortage", "Permit Delay", "Vendor Issue"]
  };

  it('renders static fields correctly', () => {
    render(<ProjectCard project={mockProject} onViewActionPlan={vi.fn()} />);

    expect(screen.getByText('Infrastructure Upgrade')).toBeInTheDocument();
    expect(screen.getByText('Europe')).toBeInTheDocument();
    expect(screen.getByText('P3')).toBeInTheDocument();
    expect(screen.getByText('15 days delayed')).toBeInTheDocument();
    
    // Issues list
    expect(screen.getByText('Resource Shortage')).toBeInTheDocument();
    expect(screen.getByText('Permit Delay')).toBeInTheDocument();
    expect(screen.getByText('Vendor Issue')).toBeInTheDocument();
  });

  it('renders computed components correctly', () => {
    render(<ProjectCard project={mockProject} onViewActionPlan={vi.fn()} />);
    
    expect(screen.getByText('90%')).toBeInTheDocument(); // Ratio calculation
    
    // Basic currency match checks without mocking formatter this time, allows fallback formatCurrency string structures
    expect(screen.getByText(/\$450K/)).toBeInTheDocument();
    expect(screen.getByText(/\$500K/)).toBeInTheDocument();
  });

  it('triggers onViewActionPlan correctly when clicked', () => {
    const mockViewActionPlan = vi.fn();
    render(<ProjectCard project={mockProject} onViewActionPlan={mockViewActionPlan} />);

    const actionButton = screen.getByRole('button', { name: /view action plan/i });
    fireEvent.click(actionButton);

    expect(mockViewActionPlan).toHaveBeenCalledWith('proj123');
  });
});
