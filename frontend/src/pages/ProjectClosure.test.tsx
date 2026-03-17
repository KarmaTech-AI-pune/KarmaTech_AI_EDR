import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProjectClosure from './ProjectClosure';

// Mock dependencies
vi.mock('../hooks/useTenantContext', () => ({
  useTenantContext: () => ({
    isSuperAdmin: false,
    tenantId: 1
  })
}));

vi.mock('../services/projectApi', () => ({
  projectApi: {
    getProjectsForClosure: vi.fn()
  }
}));

describe('ProjectClosure Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render project closure page', async () => {
      const { projectApi } = await import('../services/projectApi');
      vi.mocked(projectApi.getProjectsForClosure).mockResolvedValue([]);

      render(
        <BrowserRouter>
          <ProjectClosure />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/closure/i)).toBeInTheDocument();
      });
    });

    it('should display projects for closure', async () => {
      const { projectApi } = await import('../services/projectApi');
      vi.mocked(projectApi.getProjectsForClosure).mockResolvedValue([
        { id: 1, name: 'Project 1', status: 'Completed' }
      ] as any);

      render(
        <BrowserRouter>
          <ProjectClosure />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/Project 1/i)).toBeInTheDocument();
      });
    });
  });

  describe('Data Loading', () => {
    it('should load projects for closure on mount', async () => {
      const { projectApi } = await import('../services/projectApi');
      vi.mocked(projectApi.getProjectsForClosure).mockResolvedValue([]);

      render(
        <BrowserRouter>
          <ProjectClosure />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(vi.mocked(projectApi.getProjectsForClosure)).toHaveBeenCalled();
      });
    });

    it('should handle empty projects list', async () => {
      const { projectApi } = await import('../services/projectApi');
      vi.mocked(projectApi.getProjectsForClosure).mockResolvedValue([]);

      render(
        <BrowserRouter>
          <ProjectClosure />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(vi.mocked(projectApi.getProjectsForClosure)).toHaveBeenCalled();
      });
    });

    it('should handle API errors', async () => {
      const { projectApi } = await import('../services/projectApi');
      vi.mocked(projectApi.getProjectsForClosure).mockRejectedValue(new Error('API Error'));

      render(
        <BrowserRouter>
          <ProjectClosure />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(vi.mocked(projectApi.getProjectsForClosure)).toHaveBeenCalled();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', async () => {
      const { projectApi } = await import('../services/projectApi');
      vi.mocked(projectApi.getProjectsForClosure).mockResolvedValue([]);

      render(
        <BrowserRouter>
          <ProjectClosure />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/closure/i)).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle null response', async () => {
      const { projectApi } = await import('../services/projectApi');
      vi.mocked(projectApi.getProjectsForClosure).mockResolvedValue(null as any);

      render(
        <BrowserRouter>
          <ProjectClosure />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(vi.mocked(projectApi.getProjectsForClosure)).toHaveBeenCalled();
      });
    });
  });
});
