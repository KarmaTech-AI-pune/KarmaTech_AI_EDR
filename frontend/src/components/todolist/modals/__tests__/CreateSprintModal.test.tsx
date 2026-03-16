import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CreateSprintModal } from '../CreateSprintModal';

// Mock the API call
vi.mock('../../../../data/todolistData', () => ({
  createSprintPlanAPI: vi.fn().mockResolvedValue(1),
}));

describe('CreateSprintModal', () => {
  it('renders modal with correct title and fields', () => {
    render(
      <CreateSprintModal
        showCreateModal={true}
        setShowCreateModal={vi.fn()}
        onSprintCreated={vi.fn()}
        projectId={1}
      />
    );

    expect(screen.getByText('Create New Sprint')).toBeInTheDocument();
    expect(screen.getByLabelText(/Sprint Name \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Sprint Goal/i)).toBeInTheDocument();
  });

  it('calls setShowCreateModal(false) on cancel', () => {
    const setShowMock = vi.fn();
    render(
      <CreateSprintModal
        showCreateModal={true}
        setShowCreateModal={setShowMock}
        onSprintCreated={vi.fn()}
        projectId={1}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);
    expect(setShowMock).toHaveBeenCalledWith(false);
  });
});
