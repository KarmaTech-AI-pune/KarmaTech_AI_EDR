import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FeatureGuard, UpgradePrompt } from './FeatureGuard';
import * as jwtUtils from '../utils/jwtUtils';

vi.mock('../utils/jwtUtils', () => ({
  hasFeature: vi.fn(),
}));

describe('FeatureGuard Component', () => {
  it('renders children when feature is accessible', () => {
    vi.mocked(jwtUtils.hasFeature).mockReturnValue(true);
    
    render(
      <FeatureGuard feature="premium-feature">
        <div data-testid="child-content">Protected Content</div>
      </FeatureGuard>
    );

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });

  it('renders fallback when feature is not accessible', () => {
    vi.mocked(jwtUtils.hasFeature).mockReturnValue(false);
    
    render(
      <FeatureGuard 
        feature="premium-feature"
        fallback={<div data-testid="fallback-content">Fallback</div>}
      >
        <div data-testid="child-content">Protected Content</div>
      </FeatureGuard>
    );

    expect(screen.queryByTestId('child-content')).not.toBeInTheDocument();
    expect(screen.getByTestId('fallback-content')).toBeInTheDocument();
  });

  it('renders null if no fallback is provided and feature is not accessible', () => {
    vi.mocked(jwtUtils.hasFeature).mockReturnValue(false);
    
    const { container } = render(
      <FeatureGuard feature="premium-feature">
        <div data-testid="child-content">Protected Content</div>
      </FeatureGuard>
    );

    expect(screen.queryByTestId('child-content')).not.toBeInTheDocument();
    expect(container.firstChild).toBeNull();
  });
});

describe('UpgradePrompt Component', () => {
  it('renders upgrade prompt with feature name', () => {
    render(<UpgradePrompt feature="Advanced Reporting" />);
    
    expect(screen.getByText('Feature Not Available')).toBeInTheDocument();
    expect(screen.getByText(/The "Advanced Reporting" feature is not included in your current subscription plan/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Upgrade Plan' })).toBeInTheDocument();
  });
});
