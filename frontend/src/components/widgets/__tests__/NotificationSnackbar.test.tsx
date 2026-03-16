import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import NotificationSnackbar from '../NotificationSnackbar';

describe('NotificationSnackbar', () => {
  it('renders message when open is true', () => {
    const handleClose = vi.fn();

    render(
      <NotificationSnackbar
        open={true}
        message="Test alert message"
        severity="success"
        onClose={handleClose}
      />
    );

    expect(screen.getByText('Test alert message')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('does not render message when open is false', () => {
    const handleClose = vi.fn();

    render(
      <NotificationSnackbar
        open={false}
        message="Hidden alert message"
        severity="error"
        onClose={handleClose}
      />
    );

    expect(screen.queryByText('Hidden alert message')).not.toBeInTheDocument();
  });

  it('calls onClose when close icon is clicked', async () => {
    const handleClose = vi.fn();

    render(
      <NotificationSnackbar
        open={true}
        message="Test alert"
        severity="info"
        onClose={handleClose}
      />
    );

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });
});
