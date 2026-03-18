import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PendingApprovals from './PendingApprovals';

describe('PendingApprovals Component', () => {
  const mockApprovals = [
    {
      id: 1,
      project: 'Project Alpha',
      formName: 'Budget Request',
      manager: 'John Doe',
      days: 3,
      impact: 'High' as const,
    },
    {
      id: 2,
      project: 'Project Beta',
      formName: 'Resource Extension',
      manager: 'Jane Smith',
      days: 1,
      impact: 'Medium' as const,
    }
  ];

  it('renders correctly with given approvals', () => {
    render(
      <PendingApprovals 
        approvals={mockApprovals} 
        onEscalate={vi.fn()} 
        onRemind={vi.fn()} 
      />
    );

    expect(screen.getByText('Pending Approvals')).toBeInTheDocument();
    expect(screen.getByText('2 Pending')).toBeInTheDocument();
    
    // First item
    expect(screen.getByText('Budget Request - Project Alpha')).toBeInTheDocument();
    expect(screen.getByText('Manager: John Doe')).toBeInTheDocument();
    expect(screen.getByText('3 days overdue')).toBeInTheDocument();
    expect(screen.getByText('High Impact')).toBeInTheDocument();

    // Second item
    expect(screen.getByText('Resource Extension - Project Beta')).toBeInTheDocument();
    expect(screen.getByText('Manager: Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('1 days overdue')).toBeInTheDocument();
    expect(screen.getByText('Medium Impact')).toBeInTheDocument();
  });

  it('calls onEscalate when escalate button is clicked', () => {
    const mockEscalate = vi.fn();
    render(
      <PendingApprovals 
        approvals={mockApprovals} 
        onEscalate={mockEscalate} 
        onRemind={vi.fn()} 
      />
    );

    const escalateButtons = screen.getAllByRole('button', { name: /escalate/i });
    fireEvent.click(escalateButtons[0]);

    expect(mockEscalate).toHaveBeenCalledWith(1); // ID 1
  });

  it('calls onRemind when remind button is clicked', () => {
    const mockRemind = vi.fn();
    render(
      <PendingApprovals 
        approvals={mockApprovals} 
        onEscalate={vi.fn()} 
        onRemind={mockRemind} 
      />
    );

    const remindButtons = screen.getAllByRole('button', { name: /remind/i });
    fireEvent.click(remindButtons[1]);

    expect(mockRemind).toHaveBeenCalledWith(2); // ID 2
  });
});
