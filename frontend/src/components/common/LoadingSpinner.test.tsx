import { render, screen } from '@testing-library/react';
import LoadingSpinner from './LoadingSpinner';
import { describe, it, expect } from 'vitest';

describe('LoadingSpinner Component', () => {
  it('renders when loading is true', () => {
    render(<LoadingSpinner loading={true} />);
    
    // Check that the CircularProgress is rendered
    const spinner = screen.getByRole('progressbar');
    expect(spinner).toBeInTheDocument();
  });

  it('does not render when loading is false', () => {
    render(<LoadingSpinner loading={false} />);
    
    // Check that the CircularProgress is not rendered
    const spinner = screen.queryByRole('progressbar');
    expect(spinner).not.toBeInTheDocument();
  });

  it('has correct styling when loading', () => {
    const { container } = render(<LoadingSpinner loading={true} />);
    
    // Check that the Backdrop is visible
    const backdrop = container.firstChild;
    expect(backdrop).toHaveStyle('display: flex');
  });

  it('has correct styling when not loading', () => {
    const { container } = render(<LoadingSpinner loading={false} />);
    
    // Check that the Backdrop is hidden
    const backdrop = container.firstChild;
    expect(backdrop).toHaveStyle('display: none');
  });

  it('has correct z-index to appear above other content', () => {
    const { container } = render(<LoadingSpinner loading={true} />);
    
    // Check that the z-index is set to a high value
    // Note: The exact value depends on the theme, but we can check it's set
    const backdrop = container.firstChild;
    const style = window.getComputedStyle(backdrop as Element);
    expect(parseInt(style.zIndex)).toBeGreaterThan(0);
  });

  // Accessibility tests
  it('has appropriate accessibility attributes when loading', () => {
    render(<LoadingSpinner loading={true} />);
    
    // Check that the CircularProgress has appropriate ARIA attributes
    const spinner = screen.getByRole('progressbar');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute('aria-valuenow');
  });

  it('has appropriate ARIA attributes', () => {
    render(<LoadingSpinner loading={true} />);
    
    // Check that the CircularProgress has appropriate ARIA attributes
    const spinner = screen.getByRole('progressbar');
    expect(spinner).toHaveAttribute('aria-valuenow');
  });

  it('does not block user interaction when not loading', () => {
    const { container } = render(<LoadingSpinner loading={false} />);
    
    // Check that the Backdrop is not interactive
    const backdrop = container.firstChild;
    expect(backdrop).not.toHaveAttribute('aria-hidden', 'false');
  });
});
