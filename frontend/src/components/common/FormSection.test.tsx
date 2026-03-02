
import { vi, describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FormSection from './FormSection';
import { Typography } from '@mui/material';

describe('FormSection', () => {
  const defaultProps = {
    title: 'Test Section',
    expanded: false,
    onChange: vi.fn(),
    children: <Typography>This is the content of the form section.</Typography>,
    accordionStyle: {},
  };

  // Test Case 1: Renders the title correctly
  it('renders the title correctly', () => {
    render(<FormSection {...defaultProps} />);
    expect(screen.getByText('Test Section')).toBeInTheDocument();
  });

  // Test Case 2: Renders children content correctly
  it('renders children content correctly', () => {
    render(<FormSection {...defaultProps} />);
    expect(screen.getByText('This is the content of the form section.')).toBeInTheDocument();
  });

  // Test Case 3: Calls onChange when the accordion summary is clicked
  it('calls onChange when the accordion summary is clicked', () => {
    const onChangeMock = vi.fn();
    render(<FormSection {...defaultProps} onChange={onChangeMock} />);
    
    const summary = screen.getByText('Test Section').closest('.MuiAccordionSummary-root');
    if (summary) {
      fireEvent.click(summary);
    } else {
      throw new Error('Accordion summary not found');
    }
    expect(onChangeMock).toHaveBeenCalledTimes(1);
  });

  // Test Case 4: Accordion is expanded when 'expanded' prop is true
  it('accordion is expanded when expanded prop is true', () => {
    render(<FormSection {...defaultProps} expanded={true} />);
    const accordion = screen.getByText('Test Section').closest('.MuiAccordion-root');
    expect(accordion).toHaveClass('Mui-expanded');
  });

  // Test Case 5: Accordion is not expanded when 'expanded' prop is false
  it('accordion is not expanded when expanded prop is false', () => {
    render(<FormSection {...defaultProps} expanded={false} />);
    const accordion = screen.getByText('Test Section').closest('.MuiAccordion-root');
    expect(accordion).not.toHaveClass('Mui-expanded');
  });

  // Test Case 6: Applies custom accordion styles
  it('applies custom accordion styles', () => {
    const customStyle = { border: '1px solid red' };
    render(<FormSection {...defaultProps} accordionStyle={customStyle} />);
    const accordion = screen.getByText('Test Section').closest('.MuiAccordion-root');
    expect(accordion).toHaveStyle('border: 1px solid red');
  });

  // Test Case 7: Accessibility check for expand icon
  it('expand icon has appropriate accessibility attributes', () => {
    render(<FormSection {...defaultProps} />);
    const expandIcon = screen.getByTestId('ExpandMoreIcon');
    expect(expandIcon).toBeInTheDocument();
    expect(expandIcon).toHaveAttribute('aria-hidden', 'true');
  });
});

