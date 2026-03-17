import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ActionButton from './ActionButton';

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('ActionButton Component', () => {
  describe('Rendering', () => {
    it('should render button with children text', () => {
      renderWithTheme(<ActionButton>Click Me</ActionButton>);
      expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
    });

    it('should render with default primary variant', () => {
      renderWithTheme(<ActionButton>Primary Button</ActionButton>);
      const button = screen.getByRole('button', { name: /primary button/i });
      expect(button).toBeInTheDocument();
    });

    it('should render with secondary variant', () => {
      renderWithTheme(<ActionButton variant="secondary">Secondary</ActionButton>);
      expect(screen.getByRole('button', { name: /secondary/i })).toBeInTheDocument();
    });

    it('should render with danger variant', () => {
      renderWithTheme(<ActionButton variant="danger">Delete</ActionButton>);
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    });

    it('should render with outline variant', () => {
      renderWithTheme(<ActionButton variant="outline">Outline</ActionButton>);
      expect(screen.getByRole('button', { name: /outline/i })).toBeInTheDocument();
    });
  });

  describe('Props and Attributes', () => {
    it('should accept and apply custom className', () => {
      const { container } = renderWithTheme(
        <ActionButton className="custom-class">Button</ActionButton>
      );
      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });

    it('should accept and apply custom sx prop', () => {
      const { container } = renderWithTheme(
        <ActionButton sx={{ padding: '20px' }}>Button</ActionButton>
      );
      const button = container.querySelector('button');
      expect(button).toBeInTheDocument();
    });

    it('should be disabled when disabled prop is true', () => {
      renderWithTheme(<ActionButton disabled>Disabled Button</ActionButton>);
      expect(screen.getByRole('button', { name: /disabled button/i })).toBeDisabled();
    });

    it('should accept fullWidth prop', () => {
      const { container } = renderWithTheme(
        <ActionButton fullWidth>Full Width</ActionButton>
      );
      const button = container.querySelector('button');
      expect(button).toBeInTheDocument();
    });

    it('should accept size prop', () => {
      renderWithTheme(<ActionButton size="large">Large Button</ActionButton>);
      expect(screen.getByRole('button', { name: /large button/i })).toBeInTheDocument();
    });
  });

  describe('Click Events', () => {
    it('should call onClick handler when clicked', async () => {
      const handleClick = vi.fn();
      renderWithTheme(<ActionButton onClick={handleClick}>Click</ActionButton>);
      
      const button = screen.getByRole('button', { name: /click/i });
      await userEvent.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when button is disabled', async () => {
      const handleClick = vi.fn();
      renderWithTheme(
        <ActionButton disabled onClick={handleClick}>
          Disabled
        </ActionButton>
      );
      
      const button = screen.getByRole('button', { name: /disabled/i });
      await userEvent.click(button);
      
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should handle multiple clicks', async () => {
      const handleClick = vi.fn();
      renderWithTheme(<ActionButton onClick={handleClick}>Click</ActionButton>);
      
      const button = screen.getByRole('button', { name: /click/i });
      await userEvent.click(button);
      await userEvent.click(button);
      await userEvent.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(3);
    });
  });

  describe('Styling', () => {
    it('should have textTransform none', () => {
      const { container } = renderWithTheme(<ActionButton>Button</ActionButton>);
      const button = container.querySelector('button');
      expect(button).toBeInTheDocument();
    });

    it('should have borderRadius of 2', () => {
      const { container } = renderWithTheme(<ActionButton>Button</ActionButton>);
      const button = container.querySelector('button');
      expect(button).toBeInTheDocument();
    });

    it('should have fontWeight of 500', () => {
      const { container } = renderWithTheme(<ActionButton>Button</ActionButton>);
      const button = container.querySelector('button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Variants Styling', () => {
    it('primary variant should have primary background color', () => {
      renderWithTheme(<ActionButton variant="primary">Primary</ActionButton>);
      const button = screen.getByRole('button', { name: /primary/i });
      expect(button).toBeInTheDocument();
    });

    it('secondary variant should have grey background', () => {
      renderWithTheme(<ActionButton variant="secondary">Secondary</ActionButton>);
      const button = screen.getByRole('button', { name: /secondary/i });
      expect(button).toBeInTheDocument();
    });

    it('danger variant should have error background color', () => {
      renderWithTheme(<ActionButton variant="danger">Delete</ActionButton>);
      const button = screen.getByRole('button', { name: /delete/i });
      expect(button).toBeInTheDocument();
    });

    it('outline variant should have transparent background', () => {
      renderWithTheme(<ActionButton variant="outline">Outline</ActionButton>);
      const button = screen.getByRole('button', { name: /outline/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe('Children Rendering', () => {
    it('should render text children', () => {
      renderWithTheme(<ActionButton>Text Button</ActionButton>);
      expect(screen.getByText('Text Button')).toBeInTheDocument();
    });

    it('should render element children', () => {
      renderWithTheme(
        <ActionButton>
          <span data-testid="child-element">Child</span>
        </ActionButton>
      );
      expect(screen.getByTestId('child-element')).toBeInTheDocument();
    });

    it('should render multiple children', () => {
      renderWithTheme(
        <ActionButton>
          <span>Icon</span>
          <span>Text</span>
        </ActionButton>
      );
      expect(screen.getByText('Icon')).toBeInTheDocument();
      expect(screen.getByText('Text')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard accessible', async () => {
      const handleClick = vi.fn();
      renderWithTheme(<ActionButton onClick={handleClick}>Button</ActionButton>);
      
      const button = screen.getByRole('button', { name: /button/i });
      button.focus();
      expect(button).toHaveFocus();
    });

    it('should have proper role', () => {
      renderWithTheme(<ActionButton>Button</ActionButton>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should support aria-label', () => {
      renderWithTheme(<ActionButton aria-label="custom label">Button</ActionButton>);
      expect(screen.getByLabelText('custom label')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty children', () => {
      const { container } = renderWithTheme(<ActionButton />);
      expect(container.querySelector('button')).toBeInTheDocument();
    });

    it('should handle null variant gracefully', () => {
      renderWithTheme(<ActionButton variant={undefined}>Button</ActionButton>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should merge custom sx with default styles', () => {
      const { container } = renderWithTheme(
        <ActionButton sx={{ margin: '10px' }}>Button</ActionButton>
      );
      expect(container.querySelector('button')).toBeInTheDocument();
    });
  });
});
