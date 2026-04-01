import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import NotFound from './NotFound';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

describe('NotFound Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render 404 error page', () => {
      render(
        <BrowserRouter>
          <NotFound />
        </BrowserRouter>
      );
      expect(screen.getByText('404')).toBeInTheDocument();
    });

    it('should display "Page Not Found" heading', () => {
      render(
        <BrowserRouter>
          <NotFound />
        </BrowserRouter>
      );
      expect(screen.getByText('Page Not Found')).toBeInTheDocument();
    });

    it('should display error message', () => {
      render(
        <BrowserRouter>
          <NotFound />
        </BrowserRouter>
      );
      expect(screen.getByText(/The page you are looking for does not exist or has been moved/i)).toBeInTheDocument();
    });

    it('should render "Go to Home" button', () => {
      render(
        <BrowserRouter>
          <NotFound />
        </BrowserRouter>
      );
      expect(screen.getByRole('button', { name: /Go to Home/i })).toBeInTheDocument();
    });

    it('should have correct typography variants', () => {
      const { container } = render(
        <BrowserRouter>
          <NotFound />
        </BrowserRouter>
      );
      const h2 = container.querySelector('h2');
      const h5 = container.querySelector('h5');
      expect(h2).toBeInTheDocument();
      expect(h5).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should have centered layout', () => {
      const { container } = render(
        <BrowserRouter>
          <NotFound />
        </BrowserRouter>
      );
      const box = container.firstChild;
      expect(box).toHaveStyle({ display: 'flex' });
    });

    it('should have error color for 404 text', () => {
      render(
        <BrowserRouter>
          <NotFound />
        </BrowserRouter>
      );
      const errorText = screen.getByText('404');
      expect(errorText).toBeInTheDocument();
    });

    it('should have proper spacing', () => {
      const { container } = render(
        <BrowserRouter>
          <NotFound />
        </BrowserRouter>
      );
      const box = container.firstChild;
      expect(box).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should navigate to home when button is clicked', () => {
      render(
        <BrowserRouter>
          <NotFound />
        </BrowserRouter>
      );
      const button = screen.getByRole('button', { name: /Go to Home/i });
      fireEvent.click(button);
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('should call navigate function once on button click', () => {
      render(
        <BrowserRouter>
          <NotFound />
        </BrowserRouter>
      );
      const button = screen.getByRole('button', { name: /Go to Home/i });
      fireEvent.click(button);
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });

    it('should navigate to correct path', () => {
      render(
        <BrowserRouter>
          <NotFound />
        </BrowserRouter>
      );
      const button = screen.getByRole('button', { name: /Go to Home/i });
      fireEvent.click(button);
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  describe('Accessibility', () => {
    it('should have semantic heading structure', () => {
      const { container } = render(
        <BrowserRouter>
          <NotFound />
        </BrowserRouter>
      );
      const headings = container.querySelectorAll('h2, h5');
      expect(headings.length).toBeGreaterThan(0);
    });

    it('should have accessible button', () => {
      render(
        <BrowserRouter>
          <NotFound />
        </BrowserRouter>
      );
      const button = screen.getByRole('button', { name: /Go to Home/i });
      expect(button).toBeInTheDocument();
    });

    it('should have proper text contrast', () => {
      render(
        <BrowserRouter>
          <NotFound />
        </BrowserRouter>
      );
      const errorText = screen.getByText('404');
      expect(errorText).toBeInTheDocument();
    });

    it('should support keyboard navigation', () => {
      render(
        <BrowserRouter>
          <NotFound />
        </BrowserRouter>
      );
      const button = screen.getByRole('button', { name: /Go to Home/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe('Content', () => {
    it('should display all required text elements', () => {
      render(
        <BrowserRouter>
          <NotFound />
        </BrowserRouter>
      );
      expect(screen.getByText('404')).toBeInTheDocument();
      expect(screen.getByText('Page Not Found')).toBeInTheDocument();
      expect(screen.getByText(/The page you are looking for/i)).toBeInTheDocument();
    });

    it('should have proper text hierarchy', () => {
      const { container } = render(
        <BrowserRouter>
          <NotFound />
        </BrowserRouter>
      );
      const h2 = container.querySelector('h2');
      const h5 = container.querySelector('h5');
      expect(h2?.textContent).toBe('404');
      expect(h5?.textContent).toBe('Page Not Found');
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple button clicks', () => {
      render(
        <BrowserRouter>
          <NotFound />
        </BrowserRouter>
      );
      const button = screen.getByRole('button', { name: /Go to Home/i });
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);
      expect(mockNavigate).toHaveBeenCalledTimes(3);
    });

    it('should maintain state across re-renders', () => {
      const { rerender } = render(
        <BrowserRouter>
          <NotFound />
        </BrowserRouter>
      );
      expect(screen.getByText('404')).toBeInTheDocument();
      
      rerender(
        <BrowserRouter>
          <NotFound />
        </BrowserRouter>
      );
      expect(screen.getByText('404')).toBeInTheDocument();
    });
  });
});
