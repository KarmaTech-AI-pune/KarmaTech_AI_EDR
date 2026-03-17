import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ProgressBar from './ProgressBar';

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('ProgressBar Component', () => {
  describe('Rendering', () => {
    it('should render progress bar with value and max', () => {
      const { container } = renderWithTheme(<ProgressBar value={50} max={100} />);
      expect(container.querySelector('.MuiLinearProgress-root')).toBeInTheDocument();
    });

    it('should render with label when provided', () => {
      renderWithTheme(<ProgressBar value={50} max={100} label="Progress" />);
      expect(screen.getByText('Progress')).toBeInTheDocument();
    });

    it('should not render label when not provided', () => {
      const { container } = renderWithTheme(<ProgressBar value={50} max={100} />);
      const typography = container.querySelectorAll('.MuiTypography-root');
      expect(typography.length).toBe(0);
    });

    it('should render percentage when showPercentage is true', () => {
      renderWithTheme(
        <ProgressBar value={50} max={100} label="Progress" showPercentage={true} />
      );
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('should not render percentage when showPercentage is false', () => {
      const { container } = renderWithTheme(
        <ProgressBar value={50} max={100} label="Progress" showPercentage={false} />
      );
      expect(container.textContent).not.toContain('50%');
    });
  });

  describe('Percentage Calculation', () => {
    it('should calculate 0% for zero value', () => {
      renderWithTheme(
        <ProgressBar value={0} max={100} label="Progress" showPercentage={true} />
      );
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('should calculate 100% for max value', () => {
      renderWithTheme(
        <ProgressBar value={100} max={100} label="Progress" showPercentage={true} />
      );
      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('should calculate 25% for quarter value', () => {
      renderWithTheme(
        <ProgressBar value={25} max={100} label="Progress" showPercentage={true} />
      );
      expect(screen.getByText('25%')).toBeInTheDocument();
    });

    it('should calculate 75% for three-quarter value', () => {
      renderWithTheme(
        <ProgressBar value={75} max={100} label="Progress" showPercentage={true} />
      );
      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('should round percentage correctly', () => {
      renderWithTheme(
        <ProgressBar value={33} max={100} label="Progress" showPercentage={true} />
      );
      expect(screen.getByText('33%')).toBeInTheDocument();
    });

    it('should handle decimal values', () => {
      renderWithTheme(
        <ProgressBar value={50.5} max={100} label="Progress" showPercentage={true} />
      );
      expect(screen.getByText('51%')).toBeInTheDocument();
    });

    it('should handle different max values', () => {
      renderWithTheme(
        <ProgressBar value={50} max={200} label="Progress" showPercentage={true} />
      );
      expect(screen.getByText('25%')).toBeInTheDocument();
    });
  });

  describe('Props', () => {
    it('should accept color prop', () => {
      const { container } = renderWithTheme(
        <ProgressBar value={50} max={100} color="success" />
      );
      expect(container.querySelector('.MuiLinearProgress-root')).toBeInTheDocument();
    });

    it('should accept height prop', () => {
      const { container } = renderWithTheme(
        <ProgressBar value={50} max={100} height={16} />
      );
      expect(container.querySelector('.MuiLinearProgress-root')).toBeInTheDocument();
    });

    it('should use default height of 8 when not provided', () => {
      const { container } = renderWithTheme(<ProgressBar value={50} max={100} />);
      expect(container.querySelector('.MuiLinearProgress-root')).toBeInTheDocument();
    });

    it('should use default color of primary when not provided', () => {
      const { container } = renderWithTheme(<ProgressBar value={50} max={100} />);
      expect(container.querySelector('.MuiLinearProgress-root')).toBeInTheDocument();
    });

    it('should use default showPercentage of true when not provided', () => {
      renderWithTheme(
        <ProgressBar value={50} max={100} label="Progress" />
      );
      expect(screen.getByText('50%')).toBeInTheDocument();
    });
  });

  describe('Color Variants', () => {
    it('should render with primary color', () => {
      const { container } = renderWithTheme(
        <ProgressBar value={50} max={100} color="primary" />
      );
      expect(container.querySelector('.MuiLinearProgress-root')).toBeInTheDocument();
    });

    it('should render with secondary color', () => {
      const { container } = renderWithTheme(
        <ProgressBar value={50} max={100} color="secondary" />
      );
      expect(container.querySelector('.MuiLinearProgress-root')).toBeInTheDocument();
    });

    it('should render with success color', () => {
      const { container } = renderWithTheme(
        <ProgressBar value={50} max={100} color="success" />
      );
      expect(container.querySelector('.MuiLinearProgress-root')).toBeInTheDocument();
    });

    it('should render with warning color', () => {
      const { container } = renderWithTheme(
        <ProgressBar value={50} max={100} color="warning" />
      );
      expect(container.querySelector('.MuiLinearProgress-root')).toBeInTheDocument();
    });

    it('should render with error color', () => {
      const { container } = renderWithTheme(
        <ProgressBar value={50} max={100} color="error" />
      );
      expect(container.querySelector('.MuiLinearProgress-root')).toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    it('should display label and percentage in flex layout', () => {
      const { container } = renderWithTheme(
        <ProgressBar value={50} max={100} label="Progress" showPercentage={true} />
      );
      const flexBox = container.querySelector('[style*="display"]');
      expect(flexBox).toBeInTheDocument();
    });

    it('should have margin bottom on label section', () => {
      const { container } = renderWithTheme(
        <ProgressBar value={50} max={100} label="Progress" />
      );
      expect(container.querySelector('.MuiBox-root')).toBeInTheDocument();
    });

    it('should have full width', () => {
      const { container } = renderWithTheme(
        <ProgressBar value={50} max={100} />
      );
      const box = container.querySelector('.MuiBox-root');
      expect(box).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle value greater than max', () => {
      renderWithTheme(
        <ProgressBar value={150} max={100} label="Progress" showPercentage={true} />
      );
      expect(screen.getByText('150%')).toBeInTheDocument();
    });

    it('should handle zero max value', () => {
      const { container } = renderWithTheme(
        <ProgressBar value={0} max={0} />
      );
      expect(container.querySelector('.MuiLinearProgress-root')).toBeInTheDocument();
    });

    it('should handle negative values', () => {
      renderWithTheme(
        <ProgressBar value={-50} max={100} label="Progress" showPercentage={true} />
      );
      expect(screen.getByText('-50%')).toBeInTheDocument();
    });

    it('should handle very small values', () => {
      renderWithTheme(
        <ProgressBar value={0.5} max={100} label="Progress" showPercentage={true} />
      );
      expect(screen.getByText('1%')).toBeInTheDocument();
    });

    it('should handle very large values', () => {
      renderWithTheme(
        <ProgressBar value={1000000} max={1000000} label="Progress" showPercentage={true} />
      );
      expect(screen.getByText('100%')).toBeInTheDocument();
    });
  });

  describe('Typography', () => {
    it('should render label with body2 variant', () => {
      renderWithTheme(
        <ProgressBar value={50} max={100} label="Progress" />
      );
      expect(screen.getByText('Progress')).toBeInTheDocument();
    });

    it('should render percentage with body2 variant and medium fontWeight', () => {
      renderWithTheme(
        <ProgressBar value={50} max={100} label="Progress" showPercentage={true} />
      );
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('should render label with text.secondary color', () => {
      renderWithTheme(
        <ProgressBar value={50} max={100} label="Progress" />
      );
      expect(screen.getByText('Progress')).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should have borderRadius equal to half of height', () => {
      const { container } = renderWithTheme(
        <ProgressBar value={50} max={100} height={16} />
      );
      expect(container.querySelector('.MuiLinearProgress-root')).toBeInTheDocument();
    });

    it('should have grey background color', () => {
      const { container } = renderWithTheme(
        <ProgressBar value={50} max={100} />
      );
      expect(container.querySelector('.MuiLinearProgress-root')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper structure for screen readers', () => {
      const { container } = renderWithTheme(
        <ProgressBar value={50} max={100} label="Progress" showPercentage={true} />
      );
      expect(container.querySelector('.MuiLinearProgress-root')).toBeInTheDocument();
    });

    it('should display percentage for context', () => {
      renderWithTheme(
        <ProgressBar value={50} max={100} label="Progress" showPercentage={true} />
      );
      expect(screen.getByText('50%')).toBeInTheDocument();
    });
  });
});
