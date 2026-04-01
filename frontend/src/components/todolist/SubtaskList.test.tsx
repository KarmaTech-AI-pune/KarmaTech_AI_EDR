import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SubtaskList } from './SubtaskList';
import { Issue } from '../../types/todolist';

const mockIssue: Issue = {
  id: '1',
  key: 'TSK-1',
  summary: 'Test task',
  description: 'Test description',
  issueType: 'Task' as any,
  priority: 'High' as any,
  status: 'To Do' as any,
  assignee: null,
  reporter: { id: 'user-1', name: 'User 1', avatar: '' },
  storyPoints: 5,
  fixVersion: 'v1.0.0',
  components: [],
  attachments: 2,
  comments: [],
  flagged: false,
  isExpanded: true,
  createdDate: new Date().toISOString(),
  updatedDate: new Date().toISOString(),
  subtasks: [
    {
      id: 'sub-1',
      parentIssueId: '1',
      key: 'TSK-1-1',
      summary: 'Subtask 1',
      status: 'Done',
      priority: 'High',
      issueType: 'Sub-task',
      assignee: null,
      reporter: { id: 'user-1', name: 'User 1', avatar: '' },
      comments: [],
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString()
    },
    {
      id: 'sub-2',
      parentIssueId: '1',
      key: 'TSK-1-2',
      summary: 'Subtask 2',
      status: 'To Do',
      priority: 'Medium',
      issueType: 'Sub-task',
      assignee: null,
      reporter: { id: 'user-1', name: 'User 1', avatar: '' },
      comments: [],
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString()
    }
  ],
};

describe('SubtaskList', () => {
  it('renders subtask list with progress', () => {
    render(
      <SubtaskList
        issue={mockIssue}
        onUpdateIssue={vi.fn()}
        onCreateSubtask={vi.fn()}
        onUpdateSubtask={vi.fn()}
        onDeleteSubtask={vi.fn()}
      />
    );

    // Total subtasks = 2, Done = 1 (50%)
    expect(screen.getByText('Subtasks (1/2)')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('renders create subtask input when triggered', () => {
    const onCreateSubtaskMock = vi.fn();
    render(
      <SubtaskList
        issue={mockIssue}
        onUpdateIssue={vi.fn()}
        onCreateSubtask={onCreateSubtaskMock}
        onUpdateSubtask={vi.fn()}
        onDeleteSubtask={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Create subtask/i }));

    const input = screen.getByPlaceholderText('What needs to be done?');
    expect(input).toBeInTheDocument();

    // Simulate entry
    fireEvent.change(input, { target: { value: 'New Subtask' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });
  });
});
