import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ConfirmationDialog } from './ConfirmationDialog';

describe('ConfirmationDialog Component', () => {
  it('renders correctly when open', () => {
    const title = 'Delete Item';
    const description = 'Are you sure you want to delete this item?';

    render(
      <ConfirmationDialog
        open={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title={title}
        description={description}
      />
    );

    expect(screen.getByText(title)).toBeInTheDocument();
    expect(screen.getByText(description)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
  });

  it('does not render content when closed', () => {
    const { queryByText } = render(
      <ConfirmationDialog
        open={false}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Test Title"
        description="Test Description"
      />
    );

    expect(queryByText('Test Title')).not.toBeInTheDocument();
    expect(queryByText('Test Description')).not.toBeInTheDocument();
  });

  it('calls onConfirm when confirm button is clicked', () => {
    const mockOnConfirm = vi.fn();

    render(
      <ConfirmationDialog
        open={true}
        onClose={vi.fn()}
        onConfirm={mockOnConfirm}
        title="Confirm Title"
        description="Confirm Description"
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /confirm/i }));
    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when cancel button is clicked', () => {
    const mockOnClose = vi.fn();

    render(
      <ConfirmationDialog
        open={true}
        onClose={mockOnClose}
        onConfirm={vi.fn()}
        title="Cancel Title"
        description="Cancel Description"
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
