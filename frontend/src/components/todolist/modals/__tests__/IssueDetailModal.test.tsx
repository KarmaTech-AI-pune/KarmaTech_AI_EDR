import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { IssueDetailModal } from '../IssueDetailModal';

// Mock the context and API calls
vi.mock('../../../../context/ProjectContext', () => ({
  useProject: () => ({ projectId: 1 }),
}));

vi.mock('../../../../services/projectApi', () => ({
  projectApi: { getById: vi.fn().mockResolvedValue(null) },
}));

vi.mock('../../../../services/userApi', () => ({
  getUserById: vi.fn().mockResolvedValue(null),
}));

vi.mock('../../../../data/todolistData', () => ({
  updateIssueTimeAPI: vi.fn().mockResolvedValue({}),
}));

const mockIssue = {
  id: '1',
  key: 'TSK-1',
  summary: 'Test task',
  description: 'Test description',
  issueType: 'Task' as any,
  priority: 'High' as any,
  status: 'To Do' as any,
  storyPoints: 5,
  attachments: 0,
  comments: [],
  flagged: false,
  isExpanded: true,
  subtasks: [],
  reporter: { id: 'u1', name: 'Reporter', avatar: 'R' },
  assignee: { id: 'u2', name: 'Assignee', avatar: 'A' },
} as any;

describe('IssueDetailModal', () => {
  it('renders issue details when issue is provided', () => {
    render(
      <IssueDetailModal
        showIssueDetail={mockIssue}
        setShowIssueDetail={vi.fn()}
        setEditingIssue={vi.fn()}
        onDeleteIssue={vi.fn()}
        onToggleFlag={vi.fn()}
        onUpdateIssue={vi.fn()}
        onCreateSubtask={vi.fn()}
        onUpdateSubtask={vi.fn()}
        onDeleteSubtask={vi.fn()}
        onAddComment={vi.fn()}
        onUpdateComment={vi.fn()}
        onDeleteComment={vi.fn()}
        onAddSubtaskComment={vi.fn()}
        onUpdateSubtaskComment={vi.fn()}
        onDeleteSubtaskComment={vi.fn()}
        onFetchTaskComments={vi.fn()}
        onFetchSubtaskComments={vi.fn()}
        teamMembers={[]}
      />
    );

    expect(screen.getByText('Test task')).toBeInTheDocument();
    expect(screen.getByText('Task')).toBeInTheDocument();
  });

  it('returns null when showIssueDetail is null', () => {
    const { container } = render(
      <IssueDetailModal
        showIssueDetail={null}
        setShowIssueDetail={vi.fn()}
        setEditingIssue={vi.fn()}
        onDeleteIssue={vi.fn()}
        onToggleFlag={vi.fn()}
        onUpdateIssue={vi.fn()}
        onCreateSubtask={vi.fn()}
        onUpdateSubtask={vi.fn()}
        onDeleteSubtask={vi.fn()}
        onAddComment={vi.fn()}
        onUpdateComment={vi.fn()}
        onDeleteComment={vi.fn()}
        onAddSubtaskComment={vi.fn()}
        onUpdateSubtaskComment={vi.fn()}
        onDeleteSubtaskComment={vi.fn()}
        onFetchTaskComments={vi.fn()}
        onFetchSubtaskComments={vi.fn()}
        teamMembers={[]}
      />
    );
    expect(container.innerHTML).toBe('');
  });
});
