import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import FeatureGate from './FeatureGate';
import { useUserSubscription } from '../../hooks/useUserSubscription';
import LockedOverlay from '../common/LockedOverlay';

// Mock the hook
vi.mock('../../hooks/useUserSubscription');

// Mock LockedOverlay component
vi.mock('../common/LockedOverlay', () => ({
  default: () => <div data-testid="locked-overlay">Feature Locked</div>
}));

describe('FeatureGate Component', () => {
  const mockUseUserSubscription = useUserSubscription as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should display loading message when loading is true', () => {
      mockUseUserSubscription.mockReturnValue({
        hasFeature: vi.fn(),
        loading: true,
        error: null,
        subscription: null
      });

      render(
        <FeatureGate featureName="premium-feature">
          <div>Premium Content</div>
        </FeatureGate>
      );

      expect(screen.getByText('Loading features...')).toBeInTheDocument();
    });

    it('should not render children while loading', () => {
      mockUseUserSubscription.mockReturnValue({
        hasFeature: vi.fn(),
        loading: true,
        error: null,
        subscription: null
      });

      render(
        <FeatureGate featureName="premium-feature">
          <div>Premium Content</div>
        </FeatureGate>
      );

      expect(screen.queryByText('Premium Content')).not.toBeInTheDocument();
    });

    it('should not render LockedOverlay while loading', () => {
      mockUseUserSubscription.mockReturnValue({
        hasFeature: vi.fn(),
        loading: true,
        error: null,
        subscription: null
      });

      render(
        <FeatureGate featureName="premium-feature">
          <div>Premium Content</div>
        </FeatureGate>
      );

      expect(screen.queryByTestId('locked-overlay')).not.toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should display error message when error exists', () => {
      const errorMessage = 'Failed to load subscription';
      mockUseUserSubscription.mockReturnValue({
        hasFeature: vi.fn(),
        loading: false,
        error: errorMessage,
        subscription: null
      });

      render(
        <FeatureGate featureName="premium-feature">
          <div>Premium Content</div>
        </FeatureGate>
      );

      expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
    });

    it('should not render children when error exists', () => {
      mockUseUserSubscription.mockReturnValue({
        hasFeature: vi.fn(),
        loading: false,
        error: 'Some error',
        subscription: null
      });

      render(
        <FeatureGate featureName="premium-feature">
          <div>Premium Content</div>
        </FeatureGate>
      );

      expect(screen.queryByText('Premium Content')).not.toBeInTheDocument();
    });

    it('should not render LockedOverlay when error exists', () => {
      mockUseUserSubscription.mockReturnValue({
        hasFeature: vi.fn(),
        loading: false,
        error: 'Some error',
        subscription: null
      });

      render(
        <FeatureGate featureName="premium-feature">
          <div>Premium Content</div>
        </FeatureGate>
      );

      expect(screen.queryByTestId('locked-overlay')).not.toBeInTheDocument();
    });
  });

  describe('Feature Available', () => {
    it('should render children when feature is available', () => {
      mockUseUserSubscription.mockReturnValue({
        hasFeature: vi.fn().mockReturnValue(true),
        loading: false,
        error: null,
        subscription: { plan: 'premium' }
      });

      render(
        <FeatureGate featureName="premium-feature">
          <div>Premium Content</div>
        </FeatureGate>
      );

      expect(screen.getByText('Premium Content')).toBeInTheDocument();
    });

    it('should not render LockedOverlay when feature is available', () => {
      mockUseUserSubscription.mockReturnValue({
        hasFeature: vi.fn().mockReturnValue(true),
        loading: false,
        error: null,
        subscription: { plan: 'premium' }
      });

      render(
        <FeatureGate featureName="premium-feature">
          <div>Premium Content</div>
        </FeatureGate>
      );

      expect(screen.queryByTestId('locked-overlay')).not.toBeInTheDocument();
    });

    it('should call hasFeature with correct feature name', () => {
      const hasFeatureMock = vi.fn().mockReturnValue(true);
      mockUseUserSubscription.mockReturnValue({
        hasFeature: hasFeatureMock,
        loading: false,
        error: null,
        subscription: { plan: 'premium' }
      });

      render(
        <FeatureGate featureName="advanced-analytics">
          <div>Advanced Analytics</div>
        </FeatureGate>
      );

      expect(hasFeatureMock).toHaveBeenCalledWith('advanced-analytics');
    });

    it('should render multiple children when feature is available', () => {
      mockUseUserSubscription.mockReturnValue({
        hasFeature: vi.fn().mockReturnValue(true),
        loading: false,
        error: null,
        subscription: { plan: 'premium' }
      });

      render(
        <FeatureGate featureName="premium-feature">
          <div>Content 1</div>
          <div>Content 2</div>
          <div>Content 3</div>
        </FeatureGate>
      );

      expect(screen.getByText('Content 1')).toBeInTheDocument();
      expect(screen.getByText('Content 2')).toBeInTheDocument();
      expect(screen.getByText('Content 3')).toBeInTheDocument();
    });
  });

  describe('Feature Not Available', () => {
    it('should render LockedOverlay when feature is not available', () => {
      mockUseUserSubscription.mockReturnValue({
        hasFeature: vi.fn().mockReturnValue(false),
        loading: false,
        error: null,
        subscription: { plan: 'free' }
      });

      render(
        <FeatureGate featureName="premium-feature">
          <div>Premium Content</div>
        </FeatureGate>
      );

      expect(screen.getByTestId('locked-overlay')).toBeInTheDocument();
    });

    it('should not render children when feature is not available', () => {
      mockUseUserSubscription.mockReturnValue({
        hasFeature: vi.fn().mockReturnValue(false),
        loading: false,
        error: null,
        subscription: { plan: 'free' }
      });

      render(
        <FeatureGate featureName="premium-feature">
          <div>Premium Content</div>
        </FeatureGate>
      );

      expect(screen.queryByText('Premium Content')).not.toBeInTheDocument();
    });

    it('should call hasFeature with correct feature name when not available', () => {
      const hasFeatureMock = vi.fn().mockReturnValue(false);
      mockUseUserSubscription.mockReturnValue({
        hasFeature: hasFeatureMock,
        loading: false,
        error: null,
        subscription: { plan: 'free' }
      });

      render(
        <FeatureGate featureName="enterprise-feature">
          <div>Enterprise Content</div>
        </FeatureGate>
      );

      expect(hasFeatureMock).toHaveBeenCalledWith('enterprise-feature');
    });
  });

  describe('Props', () => {
    it('should accept featureName prop', () => {
      const hasFeatureMock = vi.fn().mockReturnValue(true);
      mockUseUserSubscription.mockReturnValue({
        hasFeature: hasFeatureMock,
        loading: false,
        error: null,
        subscription: { plan: 'premium' }
      });

      render(
        <FeatureGate featureName="test-feature">
          <div>Content</div>
        </FeatureGate>
      );

      expect(hasFeatureMock).toHaveBeenCalledWith('test-feature');
    });

    it('should accept children prop', () => {
      mockUseUserSubscription.mockReturnValue({
        hasFeature: vi.fn().mockReturnValue(true),
        loading: false,
        error: null,
        subscription: { plan: 'premium' }
      });

      render(
        <FeatureGate featureName="feature">
          <div data-testid="child-element">Child Content</div>
        </FeatureGate>
      );

      expect(screen.getByTestId('child-element')).toBeInTheDocument();
    });

    it('should handle complex children elements', () => {
      mockUseUserSubscription.mockReturnValue({
        hasFeature: vi.fn().mockReturnValue(true),
        loading: false,
        error: null,
        subscription: { plan: 'premium' }
      });

      render(
        <FeatureGate featureName="feature">
          <div>
            <h1>Title</h1>
            <p>Description</p>
            <button>Action</button>
          </div>
        </FeatureGate>
      );

      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
    });
  });

  describe('Different Feature Names', () => {
    it('should handle different feature names', () => {
      const hasFeatureMock = vi.fn().mockReturnValue(true);
      mockUseUserSubscription.mockReturnValue({
        hasFeature: hasFeatureMock,
        loading: false,
        error: null,
        subscription: { plan: 'premium' }
      });

      const { rerender } = render(
        <FeatureGate featureName="feature-1">
          <div>Content 1</div>
        </FeatureGate>
      );

      expect(hasFeatureMock).toHaveBeenCalledWith('feature-1');

      rerender(
        <FeatureGate featureName="feature-2">
          <div>Content 2</div>
        </FeatureGate>
      );

      expect(hasFeatureMock).toHaveBeenCalledWith('feature-2');
    });

    it('should handle feature names with special characters', () => {
      const hasFeatureMock = vi.fn().mockReturnValue(true);
      mockUseUserSubscription.mockReturnValue({
        hasFeature: hasFeatureMock,
        loading: false,
        error: null,
        subscription: { plan: 'premium' }
      });

      render(
        <FeatureGate featureName="feature-with-dashes_and_underscores">
          <div>Content</div>
        </FeatureGate>
      );

      expect(hasFeatureMock).toHaveBeenCalledWith('feature-with-dashes_and_underscores');
    });
  });

  describe('Subscription States', () => {
    it('should handle free subscription', () => {
      mockUseUserSubscription.mockReturnValue({
        hasFeature: vi.fn().mockReturnValue(false),
        loading: false,
        error: null,
        subscription: { plan: 'free' }
      });

      render(
        <FeatureGate featureName="premium-feature">
          <div>Premium Content</div>
        </FeatureGate>
      );

      expect(screen.getByTestId('locked-overlay')).toBeInTheDocument();
    });

    it('should handle premium subscription', () => {
      mockUseUserSubscription.mockReturnValue({
        hasFeature: vi.fn().mockReturnValue(true),
        loading: false,
        error: null,
        subscription: { plan: 'premium' }
      });

      render(
        <FeatureGate featureName="premium-feature">
          <div>Premium Content</div>
        </FeatureGate>
      );

      expect(screen.getByText('Premium Content')).toBeInTheDocument();
    });

    it('should handle enterprise subscription', () => {
      mockUseUserSubscription.mockReturnValue({
        hasFeature: vi.fn().mockReturnValue(true),
        loading: false,
        error: null,
        subscription: { plan: 'enterprise' }
      });

      render(
        <FeatureGate featureName="enterprise-feature">
          <div>Enterprise Content</div>
        </FeatureGate>
      );

      expect(screen.getByText('Enterprise Content')).toBeInTheDocument();
    });

    it('should handle null subscription', () => {
      mockUseUserSubscription.mockReturnValue({
        hasFeature: vi.fn().mockReturnValue(false),
        loading: false,
        error: null,
        subscription: null
      });

      render(
        <FeatureGate featureName="feature">
          <div>Content</div>
        </FeatureGate>
      );

      expect(screen.getByTestId('locked-overlay')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty feature name', () => {
      const hasFeatureMock = vi.fn().mockReturnValue(false);
      mockUseUserSubscription.mockReturnValue({
        hasFeature: hasFeatureMock,
        loading: false,
        error: null,
        subscription: { plan: 'premium' }
      });

      render(
        <FeatureGate featureName="">
          <div>Content</div>
        </FeatureGate>
      );

      expect(hasFeatureMock).toHaveBeenCalledWith('');
    });

    it('should handle null children gracefully', () => {
      mockUseUserSubscription.mockReturnValue({
        hasFeature: vi.fn().mockReturnValue(true),
        loading: false,
        error: null,
        subscription: { plan: 'premium' }
      });

      const { container } = render(
        <FeatureGate featureName="feature">
          {null}
        </FeatureGate>
      );

      expect(container).toBeInTheDocument();
    });

    it('should handle undefined children gracefully', () => {
      mockUseUserSubscription.mockReturnValue({
        hasFeature: vi.fn().mockReturnValue(true),
        loading: false,
        error: null,
        subscription: { plan: 'premium' }
      });

      const { container } = render(
        <FeatureGate featureName="feature">
          {undefined}
        </FeatureGate>
      );

      expect(container).toBeInTheDocument();
    });
  });

  describe('Hook Integration', () => {
    it('should call useUserSubscription hook', () => {
      mockUseUserSubscription.mockReturnValue({
        hasFeature: vi.fn().mockReturnValue(true),
        loading: false,
        error: null,
        subscription: { plan: 'premium' }
      });

      render(
        <FeatureGate featureName="feature">
          <div>Content</div>
        </FeatureGate>
      );

      expect(mockUseUserSubscription).toHaveBeenCalled();
    });

    it('should use hasFeature function from hook', () => {
      const hasFeatureMock = vi.fn().mockReturnValue(true);
      mockUseUserSubscription.mockReturnValue({
        hasFeature: hasFeatureMock,
        loading: false,
        error: null,
        subscription: { plan: 'premium' }
      });

      render(
        <FeatureGate featureName="test-feature">
          <div>Content</div>
        </FeatureGate>
      );

      expect(hasFeatureMock).toHaveBeenCalled();
    });
  });

  describe('Conditional Rendering', () => {
    it('should switch from loading to content', async () => {
      const { rerender } = render(
        <FeatureGate featureName="feature">
          <div>Content</div>
        </FeatureGate>
      );

      mockUseUserSubscription.mockReturnValue({
        hasFeature: vi.fn().mockReturnValue(true),
        loading: false,
        error: null,
        subscription: { plan: 'premium' }
      });

      rerender(
        <FeatureGate featureName="feature">
          <div>Content</div>
        </FeatureGate>
      );

      await waitFor(() => {
        expect(screen.getByText('Content')).toBeInTheDocument();
      });
    });

    it('should switch from loading to error', async () => {
      const { rerender } = render(
        <FeatureGate featureName="feature">
          <div>Content</div>
        </FeatureGate>
      );

      mockUseUserSubscription.mockReturnValue({
        hasFeature: vi.fn(),
        loading: false,
        error: 'Failed to load',
        subscription: null
      });

      rerender(
        <FeatureGate featureName="feature">
          <div>Content</div>
        </FeatureGate>
      );

      await waitFor(() => {
        expect(screen.getByText('Error: Failed to load')).toBeInTheDocument();
      });
    });
  });
});
