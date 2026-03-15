import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LockedOverlay from './LockedOverlay';

describe('LockedOverlay Component', () => {
  it('renders the locked features messaging', () => {
    render(<LockedOverlay />);

    expect(screen.getByText('Feature Locked')).toBeInTheDocument();
    expect(
      screen.getByText('This feature is not available for your current subscription.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Please upgrade your plan to unlock this feature.')
    ).toBeInTheDocument();
  });

  it('renders children elements passed to it', () => {
    render(
      <LockedOverlay>
        <div data-testid="locked-child">This content is behind the overlay</div>
      </LockedOverlay>
    );

    expect(screen.getByTestId('locked-child')).toBeInTheDocument();
    expect(screen.getByText('This content is behind the overlay')).toBeInTheDocument();
  });
});
