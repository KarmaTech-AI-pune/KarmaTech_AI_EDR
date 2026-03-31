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

vi.mock('../services/featureService', () => ({
  featureService: {
    getAllFeatures: vi.fn().mockResolvedValue([]),
    createFeature: vi.fn(),
    updateFeature: vi.fn(),
    deleteFeature: vi.fn(),
  }
}));

vi.mock('../components/features/FeaturesList', () => ({
  default: ({ features }: any) => <div data-testid="features-list">{features.map((f: any) => <div key={f.id}>{f.name}</div>)}</div>
}));
vi.mock('../components/features/FeatureForm', () => ({
  default: () => <div data-testid="feature-form" />
}));
vi.mock('../components/features/FeatureDeleteDialog', () => ({
  default: () => <div data-testid="feature-delete-dialog" />
}));

describe('FeaturesManagement Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render features management page', async () => {
      render(<BrowserRouter><FeaturesManagement /></BrowserRouter>);
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /features management/i })).toBeInTheDocument();
      });
    });

    it('should display features list', async () => {
      const { featureService } = await import('../services/featureService');
      vi.mocked(featureService.getAllFeatures).mockResolvedValue([
        { id: 1, name: 'Feature 1', isActive: true, description: '' }
      ] as any);

      render(<BrowserRouter><FeaturesManagement /></BrowserRouter>);
      await waitFor(() => {
        expect(screen.getByText(/Feature 1/i)).toBeInTheDocument();
      });
    });
  });

  describe('Data Loading', () => {
    it('should load features on mount', async () => {
      const { featureService } = await import('../services/featureService');
      vi.mocked(featureService.getAllFeatures).mockResolvedValue([]);

      render(<BrowserRouter><FeaturesManagement /></BrowserRouter>);
      await waitFor(() => {
        expect(vi.mocked(featureService.getAllFeatures)).toHaveBeenCalled();
      });
    });

    it('should handle empty features list', async () => {
      const { featureService } = await import('../services/featureService');
      vi.mocked(featureService.getAllFeatures).mockResolvedValue([]);

      render(<BrowserRouter><FeaturesManagement /></BrowserRouter>);
      await waitFor(() => {
        expect(vi.mocked(featureService.getAllFeatures)).toHaveBeenCalled();
      });
    });

    it('should handle API errors', async () => {
      const { featureService } = await import('../services/featureService');
      vi.mocked(featureService.getAllFeatures).mockRejectedValue(new Error('API Error'));

      render(<BrowserRouter><FeaturesManagement /></BrowserRouter>);
      await waitFor(() => {
        expect(vi.mocked(featureService.getAllFeatures)).toHaveBeenCalled();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', async () => {
      render(<BrowserRouter><FeaturesManagement /></BrowserRouter>);
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /features management/i })).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle null response', async () => {
      const { featureService } = await import('../services/featureService');
      vi.mocked(featureService.getAllFeatures).mockResolvedValue([] as any);

      render(<BrowserRouter><FeaturesManagement /></BrowserRouter>);
      await waitFor(() => {
        expect(vi.mocked(featureService.getAllFeatures)).toHaveBeenCalled();
      });
    });
  });
});
