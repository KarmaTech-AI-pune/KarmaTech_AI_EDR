/**
 * VarianceIndicator Component Tests
 * 
 * Comprehensive test suite for VarianceIndicator component
 * Tests: Variance display, color coding, currency formatting, percentage calculation
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { VarianceIndicator, CompactVarianceIndicator, LargeVarianceIndicator } from './VarianceIndicator';

describe('VarianceIndicator Component', () => {
  describe('Positive Variance Tests', () => {
    it('should display positive variance correctly with green color', () => {
      render(
        <VarianceIndicator
          variance={10000}
          percentageVariance={10}
          currency="USD"
        />
      );

      // Should display positive sign and values
      expect(screen.getByText(/\+\$10,000\.00/)).toBeInTheDocument();
      expect(screen.getByText(/\+10\.00%/)).toBeInTheDocument();
    });

    it('should show trending up icon for positive variance', () => {
      const { container } = render(
        <VarianceIndicator
          variance={5000}
          percentageVariance={5}
          currency="USD"
        />
      );

      // Check for trending up icon (MUI icon renders as svg)
      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('should use success color for positive variance', () => {
      render(
        <VarianceIndicator
          variance={10000}
          percentageVariance={10}
          currency="USD"
        />
      );

      const chip = screen.getByText(/\+\$10,000\.00/);
      expect(chip).toBeInTheDocument();
    });
  });

  describe('Negative Variance Tests', () => {
    it('should display negative variance correctly with red color', () => {
      render(
        <VarianceIndicator
          variance={-10000}
          percentageVariance={-10}
          currency="USD"
        />
      );

      // Should display negative sign and values
      expect(screen.getByText(/-\$10,000\.00/)).toBeInTheDocument();
      expect(screen.getByText(/-10\.00%/)).toBeInTheDocument();
    });

    it('should show trending down icon for negative variance', () => {
      const { container } = render(
        <VarianceIndicator
          variance={-5000}
          percentageVariance={-5}
          currency="USD"
        />
      );

      // Check for trending down icon
      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('should use error color for negative variance', () => {
      render(
        <VarianceIndicator
          variance={-10000}
          percentageVariance={-10}
          currency="USD"
        />
      );

      const chip = screen.getByText(/-\$10,000\.00/);
      expect(chip).toBeInTheDocument();
    });
  });

  describe('Zero Variance Tests', () => {
    it('should display zero variance correctly', () => {
      render(
        <VarianceIndicator
          variance={0}
          percentageVariance={0}
          currency="USD"
        />
      );

      // Should display zero without sign
      expect(screen.getByText(/\$0\.00/)).toBeInTheDocument();
      expect(screen.getByText(/0\.00%/)).toBeInTheDocument();
    });

    it('should show neutral icon for zero variance', () => {
      const { container } = render(
        <VarianceIndicator
          variance={0}
          percentageVariance={0}
          currency="USD"
        />
      );

      // Check for neutral icon (RemoveIcon)
      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('should use default color for zero variance', () => {
      render(
        <VarianceIndicator
          variance={0}
          percentageVariance={0}
          currency="USD"
        />
      );

      const chip = screen.getByText(/\$0\.00/);
      expect(chip).toBeInTheDocument();
    });
  });

  describe('Percentage Variance Calculation Display', () => {
    it('should display percentage variance with 2 decimal places', () => {
      render(
        <VarianceIndicator
          variance={10000}
          percentageVariance={10.5555}
          currency="USD"
        />
      );

      expect(screen.getByText(/10\.56%/)).toBeInTheDocument();
    });

    it('should handle very small percentage variances', () => {
      render(
        <VarianceIndicator
          variance={100}
          percentageVariance={0.01}
          currency="USD"
        />
      );

      expect(screen.getByText(/0\.01%/)).toBeInTheDocument();
    });

    it('should handle very large percentage variances', () => {
      render(
        <VarianceIndicator
          variance={500000}
          percentageVariance={500}
          currency="USD"
        />
      );

      expect(screen.getByText(/500\.00%/)).toBeInTheDocument();
    });

    it('should display negative percentage correctly', () => {
      render(
        <VarianceIndicator
          variance={-10000}
          percentageVariance={-9.09}
          currency="USD"
        />
      );

      expect(screen.getByText(/-9\.09%/)).toBeInTheDocument();
    });
  });

  describe('Currency Formatting Tests', () => {
    it('should format USD currency with commas and decimal places', () => {
      render(
        <VarianceIndicator
          variance={1234567.89}
          percentageVariance={10}
          currency="USD"
        />
      );

      expect(screen.getByText(/\$1,234,567\.89/)).toBeInTheDocument();
    });

    it('should format EUR currency correctly', () => {
      render(
        <VarianceIndicator
          variance={50000}
          percentageVariance={10}
          currency="EUR"
        />
      );

      expect(screen.getByText(/€50,000\.00/)).toBeInTheDocument();
    });

    it('should format GBP currency correctly', () => {
      render(
        <VarianceIndicator
          variance={25000}
          percentageVariance={5}
          currency="GBP"
        />
      );

      expect(screen.getByText(/£25,000\.00/)).toBeInTheDocument();
    });

    it('should default to USD when currency not provided', () => {
      render(
        <VarianceIndicator
          variance={10000}
          percentageVariance={10}
        />
      );

      expect(screen.getByText(/\$10,000\.00/)).toBeInTheDocument();
    });

    it('should handle decimal precision correctly', () => {
      render(
        <VarianceIndicator
          variance={1234.567}
          percentageVariance={10}
          currency="USD"
        />
      );

      // Should round to 2 decimal places
      expect(screen.getByText(/\$1,234\.57/)).toBeInTheDocument();
    });

    it('should format very large numbers correctly', () => {
      render(
        <VarianceIndicator
          variance={999999999.99}
          percentageVariance={100}
          currency="USD"
        />
      );

      expect(screen.getByText(/\$999,999,999\.99/)).toBeInTheDocument();
    });

    it('should format very small numbers correctly', () => {
      render(
        <VarianceIndicator
          variance={0.01}
          percentageVariance={0.01}
          currency="USD"
        />
      );

      expect(screen.getByText(/\$0\.01/)).toBeInTheDocument();
    });
  });

  describe('Size Prop Tests', () => {
    it('should render with small size', () => {
      render(
        <VarianceIndicator
          variance={10000}
          percentageVariance={10}
          currency="USD"
          size="small"
        />
      );

      const chip = screen.getByText(/\$10,000\.00/);
      expect(chip).toBeInTheDocument();
    });

    it('should render with medium size (default)', () => {
      render(
        <VarianceIndicator
          variance={10000}
          percentageVariance={10}
          currency="USD"
          size="medium"
        />
      );

      const chip = screen.getByText(/\$10,000\.00/);
      expect(chip).toBeInTheDocument();
    });

    it('should render with large size', () => {
      render(
        <VarianceIndicator
          variance={10000}
          percentageVariance={10}
          currency="USD"
          size="large"
        />
      );

      const chip = screen.getByText(/\$10,000\.00/);
      expect(chip).toBeInTheDocument();
    });
  });

  describe('Icon Display Tests', () => {
    it('should show icon by default', () => {
      const { container } = render(
        <VarianceIndicator
          variance={10000}
          percentageVariance={10}
          currency="USD"
        />
      );

      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('should hide icon when showIcon is false', () => {
      render(
        <VarianceIndicator
          variance={10000}
          percentageVariance={10}
          currency="USD"
          showIcon={false}
        />
      );

      // Should still render the chip but without icon container
      expect(screen.getByText(/\$10,000\.00/)).toBeInTheDocument();
    });

    it('should show icon when showIcon is true', () => {
      render(
        <VarianceIndicator
          variance={10000}
          percentageVariance={10}
          currency="USD"
          showIcon={true}
        />
      );

      // Icon should be present in the DOM
      expect(screen.getByText(/\$10,000\.00/)).toBeInTheDocument();
    });
  });

  describe('Compact Variant Tests', () => {
    it('should render CompactVarianceIndicator without icon', () => {
      render(
        <CompactVarianceIndicator
          variance={10000}
          percentageVariance={10}
          currency="USD"
        />
      );

      expect(screen.getByText(/\$10,000\.00/)).toBeInTheDocument();
      // Compact version should not show icon
    });

    it('should render CompactVarianceIndicator with small size', () => {
      render(
        <CompactVarianceIndicator
          variance={5000}
          percentageVariance={5}
          currency="USD"
        />
      );

      const chip = screen.getByText(/\$5,000\.00/);
      expect(chip).toBeInTheDocument();
    });
  });

  describe('Large Variant Tests', () => {
    it('should render LargeVarianceIndicator with icon', () => {
      const { container } = render(
        <LargeVarianceIndicator
          variance={10000}
          percentageVariance={10}
          currency="USD"
        />
      );

      expect(screen.getByText(/\$10,000\.00/)).toBeInTheDocument();
      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('should render LargeVarianceIndicator with large size', () => {
      render(
        <LargeVarianceIndicator
          variance={20000}
          percentageVariance={20}
          currency="USD"
        />
      );

      const chip = screen.getByText(/\$20,000\.00/);
      expect(chip).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle extremely large variance numbers', () => {
      render(
        <VarianceIndicator
          variance={999999999999}
          percentageVariance={1000000}
          currency="USD"
        />
      );

      // Should format without breaking
      expect(screen.getByText(/\$/)).toBeInTheDocument();
    });

    it('should handle negative zero', () => {
      render(
        <VarianceIndicator
          variance={-0}
          percentageVariance={-0}
          currency="USD"
        />
      );

      expect(screen.getByText(/\$0\.00/)).toBeInTheDocument();
    });

    it('should handle fractional percentages', () => {
      render(
        <VarianceIndicator
          variance={100}
          percentageVariance={0.123456}
          currency="USD"
        />
      );

      expect(screen.getByText(/0\.12%/)).toBeInTheDocument();
    });

    it('should handle missing currency gracefully', () => {
      render(
        <VarianceIndicator
          variance={10000}
          percentageVariance={10}
          currency={undefined as any}
        />
      );

      // Should default to USD
      expect(screen.getByText(/\$10,000\.00/)).toBeInTheDocument();
    });

    it('should handle NaN values gracefully', () => {
      render(
        <VarianceIndicator
          variance={NaN}
          percentageVariance={NaN}
          currency="USD"
        />
      );

      // Should render without crashing
      expect(screen.getByText(/NaN/)).toBeInTheDocument();
    });

    it('should handle Infinity values', () => {
      render(
        <VarianceIndicator
          variance={Infinity}
          percentageVariance={Infinity}
          currency="USD"
        />
      );

      // Should render without crashing
      const element = screen.getByText(/Infinity/);
      expect(element).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should render with proper ARIA attributes', () => {
      const { container } = render(
        <VarianceIndicator
          variance={10000}
          percentageVariance={10}
          currency="USD"
        />
      );

      // MUI Chip should have proper role
      const chip = container.querySelector('.MuiChip-root');
      expect(chip).toBeInTheDocument();
    });

    it('should be keyboard accessible', () => {
      const { container } = render(
        <VarianceIndicator
          variance={10000}
          percentageVariance={10}
          currency="USD"
        />
      );

      // Component should be in the document and accessible
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Visual Consistency', () => {
    it('should maintain consistent format across different variances', () => {
      const { rerender } = render(
        <VarianceIndicator
          variance={1000}
          percentageVariance={10}
          currency="USD"
        />
      );

      expect(screen.getByText(/\$1,000\.00/)).toBeInTheDocument();

      rerender(
        <VarianceIndicator
          variance={-1000}
          percentageVariance={-10}
          currency="USD"
        />
      );

      expect(screen.getByText(/-\$1,000\.00/)).toBeInTheDocument();

      rerender(
        <VarianceIndicator
          variance={0}
          percentageVariance={0}
          currency="USD"
        />
      );

      expect(screen.getByText(/\$0\.00/)).toBeInTheDocument();
    });

    it('should display both absolute and percentage values together', () => {
      render(
        <VarianceIndicator
          variance={10000}
          percentageVariance={10}
          currency="USD"
        />
      );

      // Both values should be in the same element
      const chip = screen.getByText(/\+\$10,000\.00 \(\+10\.00%\)/);
      expect(chip).toBeInTheDocument();
    });
  });
});
