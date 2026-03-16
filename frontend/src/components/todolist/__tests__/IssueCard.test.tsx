import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { IssueCard } from '../IssueCard';

vi.mock('@hello-pangea/dnd', () => ({
  Draggable: ({ children }: any) => children({
    innerRef: vi.fn(),
    draggableProps: {
      'data-rbd-draggable-context-id': '1',
      'data-rbd-draggable-id': 'test-draggable',
    },
    dragHandleProps: {
      'data-rbd-drag-handle-draggable-id': 'test-draggable',
      'data-rbd-drag-handle-context-id': '1',
      tabIndex: 0,
      draggable: false,
      onDragStart: vi.fn(),
    }
  }, { isDragging: false })
}));

const mockIssue = {
  id: '1',
  key: 'TSK-1',
  summary: 'Test task',
  issueType: 'Task' as any,
  priority: 'High' as any,
  status: 'To Do' as any,
  storyPoints: 5,
  attachments: 2,
  comments: ['Comment 1'],
  flagged: true,
  subtasks: [],
} as any;

describe('IssueCard', () => {
  it('renders issue card information', () => {
    const mockClick = vi.fn();
    render(
      <IssueCard 
        issue={mockIssue}
        index={0}
        onClick={mockClick}
        onToggleFlag={vi.fn()}
      />
    );
    
    expect(screen.getByText('TSK-1')).toBeInTheDocument();
    expect(screen.getByText('Test task')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument(); // Story points
    
    // Simulate click
    fireEvent.click(screen.getByText('Test task'));
    expect(mockClick).toHaveBeenCalledWith(mockIssue);
  });
});
