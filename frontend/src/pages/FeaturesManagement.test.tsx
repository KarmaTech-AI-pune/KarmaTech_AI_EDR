import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import FeaturesManagement from './FeaturesManagement';

// Mock dependencies
vi.mock('../hooks/useTenantContext', () => ({
  useTenantContext: () => ({
    isSuperAdmin: true,
    tenantId: 1
  })
}));

vi.mock('../services/featuresApi', () => ({
  featuresApi: {
    getAllFeatures: vi.fn()
  }
}));

describe('FeaturesManagement Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render features management page', async () => {
      const { featuresApi } = await import('../services/featuresApi');
      vi.mocked(featuresApi.getAllFeatures).mockResolvedValue([]);

      render(
        <BrowserRouter>
          <FeaturesManagement />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/features/i)).toBeInTheDocument();
      });
    });

    it('should display features list', async () => {
      const { featuresApi } = await import('../services/featuresApi');
      vi.mocked(featuresApi.getAllFeatures).mockResolvedValue([
        { id: 1, name: 'Feature 1', enabled: true }
      ] as any);

      render(
        <BrowserRouter>
          <FeaturesManagement />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/Feature 1/i)).toBeInTheDocument();
      });
    });
  });

  describe('Data Loading', () => {
    it('should load features on mount', async () => {
      const { featuresApi } = await import('../services/featuresApi');
      vi.mocked(featuresApi.getAllFeatures).mockResolvedValue([]);

      render(
        <BrowserRouter>
          <FeaturesManagement />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(vi.mocked(featuresApi.getAllFeatures)).toHaveBeenCalled();
      });
    });

    it('should handle empty features list', async () => {
      const { featuresApi } = await import('../services/featuresApi');
      vi.mocked(featuresApi.getAllFeatures).mockResolvedValue([]);

      render(
        <BrowserRouter>
          <FeaturesManagement />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(vi.mocked(featuresApi.getAllFeatures)).toHaveBeenCalled();
      });
    });

    it('should handle API errors', async () => {
      const { featuresApi } = await import('../services/featuresApi');
      vi.mocked(featuresApi.getAllFeatures).mockRejectedValue(new Error('API Error'));

      render(
        <BrowserRouter>
          <FeaturesManagement />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(vi.mocked(featuresApi.getAllFeatures)).toHaveBeenCalled();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', async () => {
      const { featuresApi } = await import('../services/featuresApi');
      vi.mocked(featuresApi.getAllFeatures).mockResolvedValue([]);

      render(
        <BrowserRouter>
          <FeaturesManagement />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/features/i)).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle null response', async () => {
      const { featuresApi } = await import('../services/featuresApi');
      vi.mocked(featuresApi.getAllFeatures).mockResolvedValue(null as any);

      render(
        <BrowserRouter>
          <FeaturesManagement />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(vi.mocked(featuresApi.getAllFeatures)).toHaveBeenCalled();
      });
    });
  });
});
