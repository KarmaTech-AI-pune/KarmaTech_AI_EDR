import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CreateIssueModal } from '../CreateIssueModal';

const defaultNewIssue = {
  summary: '',
  description: '',
  issueType: 'Task' as any,
  priority: 'Medium' as any,
  assignee: '',
  storyPoints: '',
  estimatedHours: '',
  remainingHours: '',
  labels: '',
  components: '',
  fixVersion: '',
};

describe('CreateIssueModal', () => {
  it('renders modal with correct title', () => {
    render(
      <CreateIssueModal
        showCreateModal={true}
        setShowCreateModal={vi.fn()}
        newIssue={defaultNewIssue}
        setNewIssue={vi.fn()}
        createIssue={vi.fn()}
      />
    );

    expect(screen.getByText('Create issue')).toBeInTheDocument();
    expect(screen.getByLabelText(/Summary \*/i)).toBeInTheDocument();
  });

  it('calls createIssue on submit', () => {
    const createIssueMock = vi.fn();
    const setNewIssueMock = vi.fn();
    render(
      <CreateIssueModal
        showCreateModal={true}
        setShowCreateModal={vi.fn()}
        newIssue={{ ...defaultNewIssue, summary: 'Test Issue' }}
        setNewIssue={setNewIssueMock}
        createIssue={createIssueMock}
      />
    );

    const createButton = screen.getByRole('button', { name: /Create/i });
    fireEvent.click(createButton);
    expect(createIssueMock).toHaveBeenCalled();
  });

  it('calls setShowCreateModal(false) on cancel', () => {
    const setShowMock = vi.fn();
    render(
      <CreateIssueModal
        showCreateModal={true}
        setShowCreateModal={setShowMock}
        newIssue={defaultNewIssue}
        setNewIssue={vi.fn()}
        createIssue={vi.fn()}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);
    expect(setShowMock).toHaveBeenCalledWith(false);
  });
});
