/**
 * BudgetHealthIndicator Component Tests
 * 
 * Tests for the BudgetHealthIndicator component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BudgetHealthIndicator, CompactBudgetHealthIndicator } from './BudgetHealthIndicator';

describe('BudgetHealthIndicator', () => {
  it('should render with Healthy status and green color', () => {
    render(
      <BudgetHealthIndicator
        status="Healthy"
        utilizationPercentage={75.5}
        showTooltip={false}
      />
    );

    // Check if the component renders with correct text
    expect(screen.getByText(/Healthy/)).toBeInTheDocument();
    expect(screen.getByText(/75.5%/)).toBeInTheDocument();
  });

  it('should render with Warning status and yellow color', () => {
    render(
      <BudgetHealthIndicator
        status="Warning"
        utilizationPercentage={95.0}
        showTooltip={false}
      />
    );

    // Check if the component renders with correct text
    expect(screen.getByText(/Warning/)).toBeInTheDocument();
    expect(screen.getByText(/95.0%/)).toBeInTheDocument();
  });

  it('should render with Critical status and red color', () => {
    render(
      <BudgetHealthIndicator
        status="Critical"
        utilizationPercentage={105.2}
        showTooltip={false}
      />
    );

    // Check if the component renders with correct text
    expect(screen.getByText(/Critical/)).toBeInTheDocument();
    expect(screen.getByText(/105.2%/)).toBeInTheDocument();
  });

  it('should format utilization percentage to 1 decimal place', () => {
    render(
      <BudgetHealthIndicator
        status="Healthy"
        utilizationPercentage={85.678}
        showTooltip={false}
      />
    );

    // Should round to 1 decimal place
    expect(screen.getByText(/85.7%/)).toBeInTheDocument();
  });

  it('should render without icon when showIcon is false', () => {
    const { container } = render(
      <BudgetHealthIndicator
        status="Healthy"
        utilizationPercentage={75.0}
        showIcon={false}
        showTooltip={false}
      />
    );

    // Check that no icon is rendered
    const icons = container.querySelectorAll('svg');
    expect(icons.length).toBe(0);
  });

  it('should render with icon when showIcon is true', () => {
    const { container } = render(
      <BudgetHealthIndicator
        status="Healthy"
        utilizationPercentage={75.0}
        showIcon={true}
        showTooltip={false}
      />
    );

    // Check that an icon is rendered
    const icons = container.querySelectorAll('svg');
    expect(icons.length).toBeGreaterThan(0);
  });

  it('should render compact version with small size', () => {
    const { container } = render(
      <CompactBudgetHealthIndicator
        status="Warning"
        utilizationPercentage={92.5}
        showTooltip={false}
      />
    );

    // Check that the component renders
    expect(screen.getByText(/Warning/)).toBeInTheDocument();
    expect(screen.getByText(/92.5%/)).toBeInTheDocument();

    // Check for small size class (MUI applies size-specific classes)
    const chip = container.querySelector('.MuiChip-sizeSmall');
    expect(chip).toBeInTheDocument();
  });
});
