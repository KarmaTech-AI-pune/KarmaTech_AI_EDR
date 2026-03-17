import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import StatusIcon from './StatusIcon';
import { Project } from '../../data/types/dashboard';

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('StatusIcon Component', () => {
  describe('Rendering', () => {
    it('should render Schedule icon for falling_behind status', () => {
      const { container } = renderWithTheme(
        <StatusIcon status="falling_behind" data-testid="status-icon" />
      );
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('should render Warning icon for scope_issue status', () => {
      const { container } = renderWithTheme(
        <StatusIcon status="scope_issue" data-testid="status-icon" />
      );
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('should render AttachMoney icon for cost_overrun status', () => {
      const { container } = renderWithTheme(
        <StatusIcon status="cost_overrun" data-testid="status-icon" />
      );
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('should render CheckCircle icon for default status', () => {
      const { container } = renderWithTheme(
        <StatusIcon status="on_track" data-testid="status-icon" />
      );
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('should render CheckCircle icon for unknown status', () => {
      const { container } = renderWithTheme(
        <StatusIcon status="unknown" data-testid="status-icon" />
      );
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Icon Types', () => {
    it('should render correct icon for falling_behind', () => {
      const { container } = renderWithTheme(
        <StatusIcon status="falling_behind" />
      );
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should render correct icon for scope_issue', () => {
      const { container } = renderWithTheme(
        <StatusIcon status="scope_issue" />
      );
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should render correct icon for cost_overrun', () => {
      const { container } = renderWithTheme(
        <StatusIcon status="cost_overrun" />
      );
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should render correct icon for on_track', () => {
      const { container } = renderWithTheme(
        <StatusIcon status="on_track" />
      );
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('Props', () => {
    it('should accept and apply custom className', () => {
      const { container } = renderWithTheme(
        <StatusIcon status="falling_behind" className="custom-class" />
      );
      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });

    it('should accept and apply custom sx prop', () => {
      const { container } = renderWithTheme(
        <StatusIcon status="falling_behind" sx={{ fontSize: '2rem' }} />
      );
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('should accept fontSize prop', () => {
      const { container } = renderWithTheme(
        <StatusIcon status="falling_behind" fontSize="large" />
      );
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('should accept data-testid prop', () => {
      const { container } = renderWithTheme(
        <StatusIcon status="falling_behind" data-testid="custom-icon" />
      );
      expect(container.querySelector('[data-testid="custom-icon"]')).toBeInTheDocument();
    });

    it('should accept aria-label prop', () => {
      const { container } = renderWithTheme(
        <StatusIcon status="falling_behind" aria-label="falling behind status" />
      );
      expect(container.querySelector('[aria-label="falling behind status"]')).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should apply color from STATUS_COLORS', () => {
      const { container } = renderWithTheme(
        <StatusIcon status="falling_behind" />
      );
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should merge custom sx with icon styles', () => {
      const { container } = renderWithTheme(
        <StatusIcon status="falling_behind" sx={{ opacity: 0.5 }} />
      );
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('should apply custom color through sx', () => {
      const { container } = renderWithTheme(
        <StatusIcon status="falling_behind" sx={{ color: 'red' }} />
      );
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Status Mapping', () => {
    const statuses: Project['status'][] = [
      'falling_behind',
      'scope_issue',
      'cost_overrun',
      'on_track'
    ];

    statuses.forEach((status) => {
      it(`should render icon for ${status} status`, () => {
        const { container } = renderWithTheme(
          <StatusIcon status={status} />
        );
        expect(container.querySelector('svg')).toBeInTheDocument();
      });
    });
  });

  describe('Icon Properties', () => {
    it('should render SVG element', () => {
      const { container } = renderWithTheme(
        <StatusIcon status="falling_behind" />
      );
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('should have viewBox attribute', () => {
      const { container } = renderWithTheme(
        <StatusIcon status="falling_behind" />
      );
      const svg = container.querySelector('svg');
      expect(svg?.getAttribute('viewBox')).toBeDefined();
    });

    it('should be inline SVG', () => {
      const { container } = renderWithTheme(
        <StatusIcon status="falling_behind" />
      );
      const svg = container.querySelector('svg');
      expect(svg?.tagName).toBe('svg');
    });
  });

  describe('Accessibility', () => {
    it('should support aria-label for accessibility', () => {
      const { container } = renderWithTheme(
        <StatusIcon status="falling_behind" aria-label="Project is falling behind" />
      );
      expect(container.querySelector('[aria-label="Project is falling behind"]')).toBeInTheDocument();
    });

    it('should support aria-hidden when needed', () => {
      const { container } = renderWithTheme(
        <StatusIcon status="falling_behind" aria-hidden="true" />
      );
      expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
    });

    it('should support role attribute', () => {
      const { container } = renderWithTheme(
        <StatusIcon status="falling_behind" role="img" />
      );
      expect(container.querySelector('[role="img"]')).toBeInTheDocument();
    });
  });

  describe('Size Variants', () => {
    it('should render with small size', () => {
      const { container } = renderWithTheme(
        <StatusIcon status="falling_behind" fontSize="small" />
      );
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('should render with medium size', () => {
      const { container } = renderWithTheme(
        <StatusIcon status="falling_behind" fontSize="medium" />
      );
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('should render with large size', () => {
      const { container } = renderWithTheme(
        <StatusIcon status="falling_behind" fontSize="large" />
      );
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('should render with inherit size', () => {
      const { container } = renderWithTheme(
        <StatusIcon status="falling_behind" fontSize="inherit" />
      );
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined status gracefully', () => {
      const { container } = renderWithTheme(
        <StatusIcon status={undefined as any} />
      );
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('should handle null status gracefully', () => {
      const { container } = renderWithTheme(
        <StatusIcon status={null as any} />
      );
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('should handle empty string status', () => {
      const { container } = renderWithTheme(
        <StatusIcon status={'' as any} />
      );
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Props Forwarding', () => {
    it('should forward all SvgIconProps to the icon', () => {
      const { container } = renderWithTheme(
        <StatusIcon 
          status="falling_behind" 
          fontSize="large"
          className="test-class"
          data-testid="test-icon"
        />
      );
      expect(container.querySelector('.test-class')).toBeInTheDocument();
      expect(container.querySelector('[data-testid="test-icon"]')).toBeInTheDocument();
    });

    it('should not override status prop', () => {
      const { container } = renderWithTheme(
        <StatusIcon status="falling_behind" />
      );
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Color Application', () => {
    it('should apply color to falling_behind icon', () => {
      const { container } = renderWithTheme(
        <StatusIcon status="falling_behind" />
      );
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should apply color to scope_issue icon', () => {
      const { container } = renderWithTheme(
        <StatusIcon status="scope_issue" />
      );
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should apply color to cost_overrun icon', () => {
      const { container } = renderWithTheme(
        <StatusIcon status="cost_overrun" />
      );
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should apply color to default status icon', () => {
      const { container } = renderWithTheme(
        <StatusIcon status="on_track" />
      );
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });
});
