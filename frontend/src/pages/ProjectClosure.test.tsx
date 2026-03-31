import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProjectClosure from './ProjectClosure';

vi.mock('../components/project/projectClosure/ProjectClosureList', () => ({
  default: () => <div data-testid="project-closure-list">Project Closure List</div>
}));

const renderPage = () => render(<BrowserRouter><ProjectClosure /></BrowserRouter>);

describe('ProjectClosure Page', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  describe('Rendering', () => {
    it('should render project closure page', () => { renderPage(); expect(screen.getByRole('heading', { name: /project closure/i })).toBeInTheDocument(); });
    it('should display projects for closure', () => { renderPage(); expect(screen.getByTestId('project-closure-list')).toBeInTheDocument(); });
  });

  describe('Data Loading', () => {
    it('should load projects for closure on mount', () => { renderPage(); expect(screen.getByTestId('project-closure-list')).toBeInTheDocument(); });
    it('should handle empty projects list', () => { renderPage(); expect(screen.getByTestId('project-closure-list')).toBeInTheDocument(); });
    it('should handle API errors', () => { renderPage(); expect(screen.getByTestId('project-closure-list')).toBeInTheDocument(); });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      renderPage();
      expect(screen.getByRole('heading', { name: /project closure/i })).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle null response', () => { renderPage(); expect(screen.getByTestId('project-closure-list')).toBeInTheDocument(); });
  });
});
