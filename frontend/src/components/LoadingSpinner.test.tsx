import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LoadingSpinner from './LoadingSpinner';
import * as LoadingContext from '../context/LoadingContext';

describe('LoadingSpinner Component', () => {
  it('does not render when isLoading is false', () => {
    // Mock the hook to return isLoading: false
    vi.spyOn(LoadingContext, 'useLoading').mockReturnValue({
      isLoading: false,
      setLoading: vi.fn(),
    });

    const { container } = render(<LoadingSpinner />);
    
    // Container should be empty
    expect(container.firstChild).toBeNull();
  });

  it('renders the spinner when isLoading is true', () => {
    // Mock the hook to return isLoading: true
    vi.spyOn(LoadingContext, 'useLoading').mockReturnValue({
      isLoading: true,
      setLoading: vi.fn(),
    });

    const { container } = render(<LoadingSpinner />);
    
    // Check if the overlay and spinner divs exist based on class names
    expect(container.querySelector('.loading-spinner-overlay')).toBeInTheDocument();
    expect(container.querySelector('.loading-spinner')).toBeInTheDocument();
  });
});
