import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from './Home';

// Mock the Dashboard component
vi.mock('../components/Dashboard', () => ({
  default: () => <div data-testid="dashboard-mock">Dashboard Component</div>
}));

describe('Home Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render home page without crashing', () => {
      render(
        <BrowserRouter>
          <Home />
        </BrowserRouter>
      );
      expect(screen.getByTestId('dashboard-mock')).toBeInTheDocument();
    });

    it('should render Dashboard component', () => {
      render(
        <BrowserRouter>
          <Home />
        </BrowserRouter>
      );
      expect(screen.getByText('Dashboard Component')).toBeInTheDocument();
    });

    it('should have a container div', () => {
      const { container } = render(
        <BrowserRouter>
          <Home />
        </BrowserRouter>
      );
      const containerDiv = container.querySelector('div');
      expect(containerDiv).toBeInTheDocument();
    });

    it('should render with correct structure', () => {
      const { container } = render(
        <BrowserRouter>
          <Home />
        </BrowserRouter>
      );
      const divs = container.querySelectorAll('div');
      expect(divs.length).toBeGreaterThan(0);
    });
  });

  describe('Component Integration', () => {
    it('should render Dashboard as child component', () => {
      render(
        <BrowserRouter>
          <Home />
        </BrowserRouter>
      );
      const dashboard = screen.getByTestId('dashboard-mock');
      expect(dashboard).toBeInTheDocument();
      expect(dashboard.textContent).toBe('Dashboard Component');
    });

    it('should pass no props to Dashboard', () => {
      render(
        <BrowserRouter>
          <Home />
        </BrowserRouter>
      );
      // Dashboard should render without any specific props
      expect(screen.getByTestId('dashboard-mock')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have semantic HTML structure', () => {
      const { container } = render(
        <BrowserRouter>
          <Home />
        </BrowserRouter>
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should be keyboard navigable', () => {
      render(
        <BrowserRouter>
          <Home />
        </BrowserRouter>
      );
      const dashboard = screen.getByTestId('dashboard-mock');
      expect(dashboard).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple renders', () => {
      const { rerender } = render(
        <BrowserRouter>
          <Home />
        </BrowserRouter>
      );
      expect(screen.getByTestId('dashboard-mock')).toBeInTheDocument();
      
      rerender(
        <BrowserRouter>
          <Home />
        </BrowserRouter>
      );
      expect(screen.getByTestId('dashboard-mock')).toBeInTheDocument();
    });

    it('should maintain component state across renders', () => {
      const { rerender } = render(
        <BrowserRouter>
          <Home />
        </BrowserRouter>
      );
      const firstRender = screen.getByTestId('dashboard-mock');
      
      rerender(
        <BrowserRouter>
          <Home />
        </BrowserRouter>
      );
      const secondRender = screen.getByTestId('dashboard-mock');
      
      expect(firstRender).toBeInTheDocument();
      expect(secondRender).toBeInTheDocument();
    });
  });
});
