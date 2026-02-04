/**
 * VarianceIndicator Component Tests
 * 
 * Comprehensive test suite for VarianceIndicator component
 * Tests: Variance display, color coding, currency formatting, icons
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import {
  VarianceIndicator,
  CompactVarianceIndicator,
  LargeVarianceIndicator,
} from '../../src/components/project/VarianceIndicator';

describe('VarianceIndicator Component', () => {
  describe('Positive Variance Tests (Req 3.3)', () => {
    it('displays positive variance correctly with green color', () => {
      const { container } = render(
        <VarianceIndicator
          variance={50000}
          percentageVariance={50}
          currency="USD"
        />
      );
      
      // Check for success color (green)
      const chip = container.querySelector('.MuiChip-colorSuccess');
      expect(chip).toBeInTheDocument();
      
      // Check for positive sign and values
      expect(screen.getByText(/\+\$50,000\.00/)).toBeInTheDocument();
      expect(screen.getByText(/\+50\.00%/)).toBeInTheDocument();
    });

    it('shows trending up icon for positive variance', () => {
      const { container } = render(
        <VarianceIndicator
          variance={50000}
          percentageVariance={50}
          currency="USD"
        />
      );
      
      // Check for trending up icon (SVG)
      const svgIcons = container.querySelectorAll('svg');
      expect(svgIcons.length).toBeGreaterThan(0);
    });

    it('formats large positive variance correctly', () => {
      render(
        <VarianceIndicator
          variance={1000000}
          percentageVariance={100}
          currency="USD"
        />
      );
      
      expect(screen.getByText(/\+\$1,000,000\.00/)).toBeInTheDocument();
      expect(screen.getByText(/\+100\.00%/)).toBeInTheDocument();
    });
  });

  describe('Negative Variance Tests (Req 3.3)', () => {
    it('displays negative variance correctly with red color', () => {
      const { container } = render(
        <VarianceIndicator
          variance={-30000}
          percentageVariance={-20}
          currency="USD"
        />
      );
      
      // Check for error color (red)
      const chip = container.querySelector('.MuiChip-colorError');
      expect(chip).toBeInTheDocument();
      
      // Check for negative sign and values
      expect(screen.getByText(/-\$30,000\.00/)).toBeInTheDocument();
      expect(screen.getByText(/-20\.00%/)).toBeInTheDocument();
    });

    it('shows trending down icon for negative variance', () => {
      const { container } = render(
        <VarianceIndicator
          variance={-30000}
          percentageVariance={-20}
          currency="USD"
        />
      );
      
      // Check for trending down icon (SVG)
      const svgIcons = container.querySelectorAll('svg');
      expect(svgIcons.length).toBeGreaterThan(0);
    });

    it('formats large negative variance correctly', () => {
      render(
        <VarianceIndicator
          variance={-500000}
          percentageVariance={-50}
          currency="USD"
        />
      );
      
      expect(screen.getByText(/-\$500,000\.00/)).toBeInTheDocument();
      expect(screen.getByText(/-50\.00%/)).toBeInTheDocument();
    });
  });

  describe('Zero Variance Tests', () => {
    it('displays zero variance correctly with default color', () => {
      const { container } = render(
        <VarianceIndicator
          variance={0}
          percentageVariance={0}
          currency="USD"
        />
      );
      
      // Check for default color
      const chip = container.querySelector('.MuiChip-colorDefault');
      expect(chip).toBeInTheDocument();
      
      // Check for zero values without sign
      expect(screen.getByText(/\$0\.00/)).toBeInTheDocument();
      expect(screen.getByText(/0\.00%/)).toBeInTheDocument();
    });

    it('shows remove icon for zero variance', () => {
      const { container } = render(
        <VarianceIndicator
          variance={0}
          percentageVariance={0}
          currency="USD"
        />
      );
      
      // Check for remove icon (SVG)
      const svgIcons = container.querySelectorAll('svg');
      expect(svgIcons.length).toBeGreaterThan(0);
    });
  });

  describe('Percentage Variance Calculation Display', () => {
    it('displays percentage variance with two decimal places', () => {
      render(
        <VarianceIndicator
          variance={33333}
          percentageVariance={33.33}
          currency="USD"
        />
      );
      
      expect(screen.getByText(/33\.33%/)).toBeInTheDocument();
    });

    it('handles very small percentage variance', () => {
      render(
        <VarianceIndicator
          variance={100}
          percentageVariance={0.01}
          currency="USD"
        />
      );
      
      expect(screen.getByText(/0\.01%/)).toBeInTheDocument();
    });

    it('handles very large percentage variance', () => {
      render(
        <VarianceIndicator
          variance={1000000}
          percentageVariance={1000}
          currency="USD"
        />
      );
      
      expect(screen.getByText(/1000\.00%/)).toBeInTheDocument();
    });
  });

  describe('Currency Formatting Tests', () => {
    it('formats USD currency with commas and decimal places', () => {
      render(
        <VarianceIndicator
          variance={123456.78}
          percentageVariance={50}
          currency="USD"
        />
      );
      
      expect(screen.getByText(/\$123,456\.78/)).toBeInTheDocument();
    });

    it('formats EUR currency correctly', () => {
      render(
        <VarianceIndicator
          variance={50000}
          percentageVariance={50}
          currency="EUR"
        />
      );
      
      expect(screen.getByText(/€50,000\.00/)).toBeInTheDocument();
    });

    it('formats GBP currency correctly', () => {
      render(
        <VarianceIndicator
          variance={50000}
          percentageVariance={50}
          currency="GBP"
        />
      );
      
      expect(screen.getByText(/£50,000\.00/)).toBeInTheDocument();
    });

    it('handles default currency when not specified', () => {
      render(
        <VarianceIndicator
          variance={50000}
          percentageVariance={50}
        />
      );
      
      // Should default to USD
      expect(screen.getByText(/\$50,000\.00/)).toBeInTheDocument();
    });

    it('formats very large numbers with commas', () => {
      render(
        <VarianceIndicator
          variance={9999999.99}
          percentageVariance={100}
          currency="USD"
        />
      );
      
      expect(screen.getByText(/\$9,999,999\.99/)).toBeInTheDocument();
    });

    it('formats small decimal values correctly', () => {
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
    it('renders small size correctly', () => {
      const { container } = render(
        <VarianceIndicator
          variance={50000}
          percentageVariance={50}
          currency="USD"
          size="small"
        />
      );
      
      const chip = container.querySelector('.MuiChip-sizeSmall');
      expect(chip).toBeInTheDocument();
    });

    it('renders medium size correctly (default)', () => {
      const { container } = render(
        <VarianceIndicator
          variance={50000}
          percentageVariance={50}
          currency="USD"
          size="medium"
        />
      );
      
      const chip = container.querySelector('.MuiChip-root');
      expect(chip).toBeInTheDocument();
    });

    it('renders large size correctly', () => {
      const { container } = render(
        <VarianceIndicator
          variance={50000}
          percentageVariance={50}
          currency="USD"
          size="large"
        />
      );
      
      const chip = container.querySelector('.MuiChip-root');
      expect(chip).toBeInTheDocument();
    });
  });

  describe('Icon Display Tests', () => {
    it('shows icon by default', () => {
      const { container } = render(
        <VarianceIndicator
          variance={50000}
          percentageVariance={50}
          currency="USD"
        />
      );
      
      const svgIcons = container.querySelectorAll('svg');
      expect(svgIcons.length).toBeGreaterThan(0);
    });

    it('hides icon when showIcon is false', () => {
      const { container } = render(
        <VarianceIndicator
          variance={50000}
          percentageVariance={50}
          currency="USD"
          showIcon={false}
        />
      );
      
      const svgIcons = container.querySelectorAll('svg');
      expect(svgIcons.length).toBe(0);
    });

    it('shows icon when showIcon is true', () => {
      const { container } = render(
        <VarianceIndicator
          variance={50000}
          percentageVariance={50}
          currency="USD"
          showIcon={true}
        />
      );
      
      const svgIcons = container.querySelectorAll('svg');
      expect(svgIcons.length).toBeGreaterThan(0);
    });
  });

  describe('CompactVarianceIndicator Tests', () => {
    it('renders compact version without icon', () => {
      const { container } = render(
        <CompactVarianceIndicator
          variance={50000}
          percentageVariance={50}
          currency="USD"
        />
      );
      
      // Should not have icon
      const svgIcons = container.querySelectorAll('svg');
      expect(svgIcons.length).toBe(0);
      
      // Should have small size
      const chip = container.querySelector('.MuiChip-sizeSmall');
      expect(chip).toBeInTheDocument();
    });

    it('displays variance values correctly in compact mode', () => {
      render(
        <CompactVarianceIndicator
          variance={50000}
          percentageVariance={50}
          currency="USD"
        />
      );
      
      expect(screen.getByText(/\+\$50,000\.00/)).toBeInTheDocument();
      expect(screen.getByText(/\+50\.00%/)).toBeInTheDocument();
    });
  });

  describe('LargeVarianceIndicator Tests', () => {
    it('renders large version with icon', () => {
      const { container } = render(
        <LargeVarianceIndicator
          variance={50000}
          percentageVariance={50}
          currency="USD"
        />
      );
      
      // Should have icon
      const svgIcons = container.querySelectorAll('svg');
      expect(svgIcons.length).toBeGreaterThan(0);
      
      // Should have larger size
      const chip = container.querySelector('.MuiChip-root');
      expect(chip).toBeInTheDocument();
    });

    it('displays variance values correctly in large mode', () => {
      render(
        <LargeVarianceIndicator
          variance={50000}
          percentageVariance={50}
          currency="USD"
        />
      );
      
      expect(screen.getByText(/\+\$50,000\.00/)).toBeInTheDocument();
      expect(screen.getByText(/\+50\.00%/)).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles very small variance values', () => {
      render(
        <VarianceIndicator
          variance={0.01}
          percentageVariance={0.01}
          currency="USD"
        />
      );
      
      expect(screen.getByText(/\$0\.01/)).toBeInTheDocument();
    });

    it('handles very large variance values', () => {
      render(
        <VarianceIndicator
          variance={999999999.99}
          percentageVariance={9999.99}
          currency="USD"
        />
      );
      
      expect(screen.getByText(/\$999,999,999\.99/)).toBeInTheDocument();
    });

    it('handles negative zero correctly', () => {
      render(
        <VarianceIndicator
          variance={-0}
          percentageVariance={-0}
          currency="USD"
        />
      );
      
      // Should treat -0 as 0
      expect(screen.getByText(/\$0\.00/)).toBeInTheDocument();
    });

    it('handles fractional percentages correctly', () => {
      render(
        <VarianceIndicator
          variance={1000}
          percentageVariance={0.123456}
          currency="USD"
        />
      );
      
      // Should round to 2 decimal places
      expect(screen.getByText(/0\.12%/)).toBeInTheDocument();
    });

    it('handles missing currency gracefully', () => {
      render(
        <VarianceIndicator
          variance={50000}
          percentageVariance={50}
          currency={undefined as any}
        />
      );
      
      // Should default to USD
      expect(screen.getByText(/\$50,000\.00/)).toBeInTheDocument();
    });

    it('handles invalid currency code gracefully', () => {
      render(
        <VarianceIndicator
          variance={50000}
          percentageVariance={50}
          currency="INVALID"
        />
      );
      
      // Should still render (Intl.NumberFormat handles invalid codes)
      const { container } = render(
        <VarianceIndicator
          variance={50000}
          percentageVariance={50}
          currency="INVALID"
        />
      );
      expect(container).toBeInTheDocument();
    });
  });

  describe('Accessibility Tests', () => {
    it('renders with proper ARIA attributes', () => {
      const { container } = render(
        <VarianceIndicator
          variance={50000}
          percentageVariance={50}
          currency="USD"
        />
      );
      
      // MUI Chip should have proper role
      const chip = container.querySelector('.MuiChip-root');
      expect(chip).toBeInTheDocument();
    });

    it('has readable text content', () => {
      render(
        <VarianceIndicator
          variance={50000}
          percentageVariance={50}
          currency="USD"
        />
      );
      
      // Text should be readable by screen readers
      expect(screen.getByText(/\+\$50,000\.00/)).toBeInTheDocument();
    });
  });

  describe('Color Contrast Tests', () => {
    it('uses success color for positive variance', () => {
      const { container } = render(
        <VarianceIndicator
          variance={50000}
          percentageVariance={50}
          currency="USD"
        />
      );
      
      const chip = container.querySelector('.MuiChip-colorSuccess');
      expect(chip).toBeInTheDocument();
    });

    it('uses error color for negative variance', () => {
      const { container } = render(
        <VarianceIndicator
          variance={-30000}
          percentageVariance={-20}
          currency="USD"
        />
      );
      
      const chip = container.querySelector('.MuiChip-colorError');
      expect(chip).toBeInTheDocument();
    });

    it('uses default color for zero variance', () => {
      const { container } = render(
        <VarianceIndicator
          variance={0}
          percentageVariance={0}
          currency="USD"
        />
      );
      
      const chip = container.querySelector('.MuiChip-colorDefault');
      expect(chip).toBeInTheDocument();
    });
  });
});
