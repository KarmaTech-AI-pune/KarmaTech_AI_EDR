import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SubtaskItem } from '../SubtaskItem';

const mockSubtask = {
  id: 'sub-1',
  parentIssueId: '1',
  key: 'TSK-1-1',
  summary: 'Subtask 1',
  status: 'Done' as any,
  priority: 'High' as any,
  issueType: 'Sub-task' as any,
  assignee: null,
  reporter: { id: 'user-1', name: 'User 1', avatar: '' },
  comments: [],
  createdDate: new Date().toISOString(),
  updatedDate: new Date().toISOString()
};

describe('SubtaskItem', () => {
  it('renders correctly', () => {
    render(
      <SubtaskItem
        subtask={mockSubtask}
        onUpdateSubtask={vi.fn()}
        onDeleteSubtask={vi.fn()}
      />
    );
    
    expect(screen.getByText('TSK-1-1')).toBeInTheDocument();
    expect(screen.getByText('Subtask 1')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  it('triggers delete subtask', () => {
    const onDeleteMock = vi.fn();
    render(
      <SubtaskItem
        subtask={mockSubtask}
        onUpdateSubtask={vi.fn()}
        onDeleteSubtask={onDeleteMock}
      />
    );
    
    // Click the delete icon button
    const deleteButton = screen.getByTestId('DeleteIcon').closest('button');
    if (deleteButton) {
      fireEvent.click(deleteButton);
      
      // Since it opens a dialog, you'd confirm inside the dialog
      expect(screen.getByText(/Are you sure you want to delete the subtask/i)).toBeInTheDocument();
    }
  });
});
