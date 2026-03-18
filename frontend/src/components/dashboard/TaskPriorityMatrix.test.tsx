import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TaskPriorityMatrix from './TaskPriorityMatrix';

describe('TaskPriorityMatrix Component', () => {
  const mockTasks = [
    {
      id: 1,
      title: 'Fix critical database issue',
      category: 'urgent_important' as const
    },
    {
      id: 2,
      title: 'Update Q3 roadmap',
      category: 'important_not_urgent' as const
    },
    {
      id: 3,
      title: 'Reply to client email',
      category: 'urgent_not_important' as const
    },
    {
      id: 4,
      title: 'Organize desk drawer',
      category: 'neither' as const
    }
  ];

  it('renders matrix quadrant headers correctly', () => {
    render(<TaskPriorityMatrix tasks={mockTasks} />);

    expect(screen.getByText('Task Priority Matrix')).toBeInTheDocument();
    
    // Quadrant titles
    expect(screen.getByText('Urgent & Important')).toBeInTheDocument();
    expect(screen.getByText('Important & Not Urgent')).toBeInTheDocument();
    expect(screen.getByText('Urgent & Not Important')).toBeInTheDocument();
    expect(screen.getByText('Neither Urgent nor Important')).toBeInTheDocument();
  });

  it('renders task items within the correct quadrants', () => {
    render(<TaskPriorityMatrix tasks={mockTasks} />);

    expect(screen.getByText('Fix critical database issue')).toBeInTheDocument();
    expect(screen.getByText('Update Q3 roadmap')).toBeInTheDocument();
    expect(screen.getByText('Reply to client email')).toBeInTheDocument();
    expect(screen.getByText('Organize desk drawer')).toBeInTheDocument();
  });
});
