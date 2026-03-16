import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SubtaskDetailModal } from '../SubtaskDetailModal';

const mockParentIssue = {
  id: '1',
  key: 'TSK-1',
  summary: 'Parent task',
  issueType: 'Task' as any,
  subtasks: [],
} as any;

const mockSubtask = {
  id: 'sub-1',
  key: 'TSK-1-1',
  summary: 'Subtask 1',
  description: 'Subtask desc',
  status: 'Done' as any,
  priority: 'High' as any,
  issueType: 'Sub-task' as any,
  comments: [],
  reporter: { id: 'u1', name: 'Reporter', avatar: 'R' },
} as any;

describe('SubtaskDetailModal', () => {
  it('renders subtask details when subtask is provided', () => {
    render(
      <SubtaskDetailModal
        subtask={mockSubtask}
        parentIssue={mockParentIssue}
        onClose={vi.fn()}
        onUpdateSubtask={vi.fn()}
        onDeleteSubtask={vi.fn()}
        onAddComment={vi.fn()}
        onUpdateComment={vi.fn()}
        onDeleteComment={vi.fn()}
        onFetchComments={vi.fn()}
        teamMembers={[]}
      />
    );

    expect(screen.getByText('Subtask 1')).toBeInTheDocument();
    expect(screen.getByText('Activity')).toBeInTheDocument();
  });

  it('returns null when subtask is null', () => {
    const { container } = render(
      <SubtaskDetailModal
        subtask={null}
        parentIssue={mockParentIssue}
        onClose={vi.fn()}
        onUpdateSubtask={vi.fn()}
        onDeleteSubtask={vi.fn()}
        onAddComment={vi.fn()}
        onUpdateComment={vi.fn()}
        onDeleteComment={vi.fn()}
        onFetchComments={vi.fn()}
        teamMembers={[]}
      />
    );
    expect(container.innerHTML).toBe('');
  });
});
