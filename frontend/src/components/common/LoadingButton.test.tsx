import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LoadingButton from './LoadingButton';

describe('LoadingButton Component', () => {
  it('renders regular text when not loading', () => {
    render(
      <LoadingButton
        onClick={vi.fn()}
        text="Submit Data"
        loadingText="Submitting..."
        loading={false}
      />
    );

    expect(screen.getByRole('button')).toHaveTextContent('Submit Data');
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('renders loading text and spinner when loading', () => {
    render(
      <LoadingButton
        onClick={vi.fn()}
        text="Submit Data"
        loadingText="Submitting..."
        loading={true}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Submitting...');
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('calls onClick handler when clicked and not loading/disabled', () => {
    const mockOnClick = vi.fn();
    render(
      <LoadingButton
        onClick={mockOnClick}
        text="Click Me"
        loadingText="Wait..."
      />
    );

    fireEvent.click(screen.getByRole('button'));
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled and prevents click when loading', () => {
    const mockOnClick = vi.fn();
    render(
      <LoadingButton
        onClick={mockOnClick}
        text="Click Me"
        loadingText="Wait..."
        loading={true}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();

    fireEvent.click(button);
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('is disabled when the disabled prop is true', () => {
    render(
      <LoadingButton
        onClick={vi.fn()}
        text="Disabled Btn"
        loadingText="Wait..."
        disabled={true}
      />
    );

    expect(screen.getByRole('button')).toBeDisabled();
  });
});
