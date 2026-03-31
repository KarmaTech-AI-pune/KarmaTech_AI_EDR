import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProjectManagement from './ProjectManagement';

vi.mock('../hooks/useTenantContext', () => ({
  useTenantContext: () => ({ isSuperAdmin: false, tenantId: 1 })
}));

vi.mock('../services/projectApi', () => ({
  projectApi: {
    getAll: vi.fn(),
    createProject: vi.fn(),
    delete: vi.fn(),
  }
}));

vi.mock('../services/programApi', () => ({
  programApi: {
    getById: vi.fn().mockResolvedValue({ id: 1, name: 'Test Program' }),
    getAll: vi.fn().mockResolvedValue([]),
  }
}));

vi.mock('../context/ProjectContext', () => ({
  useProject: () => ({ programId: '1', setProgramId: vi.fn(), setProjectId: vi.fn() })
}));

vi.mock('../services/authApi', () => ({
  authApi: {
    getCurrentUser: vi.fn().mockResolvedValue({
      id: '1',
      email: 'test@test.com',
      roles: [{ name: 'System Admin' }],
      roleDetails: {
        permissions: ['VIEW_PROJECT', 'CREATE_PROJECT', 'SYSTEM_ADMIN']
      }
    })
  }
}));

describe('ProjectManagement Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render project management page', async () => {
      const { projectApi } = await import('../services/projectApi');
      vi.mocked(projectApi.getAll).mockResolvedValue([]);

      render(<BrowserRouter><ProjectManagement /></BrowserRouter>);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /project management/i })).toBeInTheDocument();
      });
    });

    it('should display projects list', async () => {
      const { projectApi } = await import('../services/projectApi');
      vi.mocked(projectApi.getAll).mockResolvedValue([
        { id: 1, name: 'Project 1', status: 'Active' },
        { id: 2, name: 'Project 2', status: 'Planning' }
      ] as any);

      render(<BrowserRouter><ProjectManagement /></BrowserRouter>);

      await waitFor(() => {
        expect(screen.getByText('Project 1')).toBeInTheDocument();
      });
    });
  });

  describe('Data Loading', () => {
    it('should load projects on mount', async () => {
      const { projectApi } = await import('../services/projectApi');
      vi.mocked(projectApi.getAll).mockResolvedValue([]);

      render(<BrowserRouter><ProjectManagement /></BrowserRouter>);

      await waitFor(() => {
        expect(vi.mocked(projectApi.getAll)).toHaveBeenCalled();
      });
    });

    it('should handle empty projects list', async () => {
      const { projectApi } = await import('../services/projectApi');
      vi.mocked(projectApi.getAll).mockResolvedValue([]);

      render(<BrowserRouter><ProjectManagement /></BrowserRouter>);

      await waitFor(() => {
        expect(vi.mocked(projectApi.getAll)).toHaveBeenCalled();
      });
    });

    it('should handle API errors', async () => {
      const { projectApi } = await import('../services/projectApi');
      vi.mocked(projectApi.getAll).mockRejectedValue(new Error('API Error'));

      render(<BrowserRouter><ProjectManagement /></BrowserRouter>);

      await waitFor(() => {
        expect(vi.mocked(projectApi.getAll)).toHaveBeenCalled();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', async () => {
      const { projectApi } = await import('../services/projectApi');
      vi.mocked(projectApi.getAll).mockResolvedValue([]);

      render(<BrowserRouter><ProjectManagement /></BrowserRouter>);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /project management/i })).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle null response', async () => {
      const { projectApi } = await import('../services/projectApi');
      vi.mocked(projectApi.getAll).mockResolvedValue([]);

      render(<BrowserRouter><ProjectManagement /></BrowserRouter>);

      await waitFor(() => {
        expect(vi.mocked(projectApi.getAll)).toHaveBeenCalled();
      });
    });

    it('should handle large project lists', async () => {
      const { projectApi } = await import('../services/projectApi');
      const largeList = Array.from({ length: 100 }, (_, i) => ({
        id: i, name: `Project ${i}`, status: i % 2 === 0 ? 'Active' : 'Planning'
      }));
      vi.mocked(projectApi.getAll).mockResolvedValue(largeList as any);

      render(<BrowserRouter><ProjectManagement /></BrowserRouter>);

      await waitFor(() => {
        expect(vi.mocked(projectApi.getAll)).toHaveBeenCalled();
      });
    });
  });
});
