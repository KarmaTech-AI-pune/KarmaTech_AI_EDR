import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TableTemplate from './TableTemplate';
import { TableRow, TableCell } from '@mui/material';

describe('TableTemplate', () => {
  const defaultProps = {
    title: 'Test Table',
    headers: ['Column 1', 'Column 2', 'Column 3'],
    isExpanded: false,
    onToggleExpand: vi.fn(),
  };

  // Test Case 1: Renders title and headers correctly
  it('renders the title and headers correctly', () => {
    render(<TableTemplate {...defaultProps} />);
    expect(screen.getByText('Test Table')).toBeInTheDocument();
    defaultProps.headers.forEach(header => {
      expect(screen.getByText(header)).toBeInTheDocument();
    });
  });

  // Test Case 2: Renders children (table body content)
  it('renders children passed to the table body', () => {
    render(
      <TableTemplate {...defaultProps}>
        <TableRow>
          <TableCell>Data 1</TableCell>
          <TableCell>Data 2</TableCell>
          <TableCell>Data 3</TableCell>
        </TableRow>
      </TableTemplate>
    );
    expect(screen.getByText('Data 1')).toBeInTheDocument();
    expect(screen.getByText('Data 2')).toBeInTheDocument();
    expect(screen.getByText('Data 3')).toBeInTheDocument();
  });

  // Test Case 3: Handles expand/collapse functionality
  it('calls onToggleExpand when the accordion summary is clicked', () => {
    const onToggleExpandMock = vi.fn();
    render(<TableTemplate {...defaultProps} onToggleExpand={onToggleExpandMock} />);
    
    const summary = screen.getByText('Test Table').closest('.MuiAccordionSummary-root');
    if (summary) {
      fireEvent.click(summary);
    } else {
      throw new Error('Accordion summary not found');
    }
    expect(onToggleExpandMock).toHaveBeenCalledTimes(1);
  });

  // Test Case 4: Accordion is expanded when isExpanded is true
  it('accordion is expanded when isExpanded is true', () => {
    render(<TableTemplate {...defaultProps} isExpanded={true} />);
    const accordion = screen.getByText('Test Table').closest('.MuiAccordion-root');
    expect(accordion).toHaveClass('Mui-expanded');
  });

  // Test Case 5: Accordion is not expanded when isExpanded is false
  it('accordion is not expanded when isExpanded is false', () => {
    render(<TableTemplate {...defaultProps} isExpanded={false} />);
    const accordion = screen.getByText('Test Table').closest('.MuiAccordion-root');
    expect(accordion).not.toHaveClass('Mui-expanded');
  });

  // Test Case 6: Applies header alignment
  it('applies correct header alignment', () => {
    const alignHeaders: ('left' | 'center' | 'right')[] = ['left', 'center', 'right'];
    render(<TableTemplate {...defaultProps} isExpanded={true} alignHeaders={alignHeaders} />);
    
    const headerCells = screen.getAllByRole('columnheader');
    expect(headerCells[0]).toHaveStyle('text-align: left');
    expect(headerCells[1]).toHaveStyle('text-align: center');
    expect(headerCells[2]).toHaveStyle('text-align: right');
  });

  // Test Case 7: Applies header widths
  it('applies correct header widths', () => {
    const headerWidths = ['10%', '20%', 'auto'];
    render(<TableTemplate {...defaultProps} isExpanded={true} headerWidths={headerWidths} />);
    
    const headerCells = screen.getAllByRole('columnheader');
    expect(headerCells[0]).toHaveStyle('width: 10%');
    expect(headerCells[1]).toHaveStyle('width: 20%');
    expect(headerCells[2]).toHaveStyle('width: auto');
  });

  // Test Case 8: Renders with no children (empty table body)
  it('renders correctly with no children', () => {
    render(<TableTemplate {...defaultProps} isExpanded={true} />); // Ensure accordion is expanded
    // Should not throw an error and still display title and headers
    expect(screen.getByText('Test Table')).toBeInTheDocument();
    defaultProps.headers.forEach(header => {
      expect(screen.getByText(header)).toBeInTheDocument();
    });
    // No table rows should be present in the body
    const tableBody = screen.getAllByRole('rowgroup', { name: '' })[1]; // tbody is the second element with role 'rowgroup'
    expect(tableBody).toBeEmptyDOMElement();
  });

  // Test Case 9: Default props for isExpanded and onToggleExpand
  it('uses default props for isExpanded and onToggleExpand if not provided', () => {
    // Test that it doesn't crash and is not expanded by default
    render(<TableTemplate title="Default Test" headers={['A']} />);
    const accordion = screen.getByText('Default Test').closest('.MuiAccordion-root');
    expect(accordion).not.toHaveClass('Mui-expanded');
    
    // Clicking should not throw error, but onToggleExpand won't be a spy
    const summary = screen.getByText('Default Test').closest('.MuiAccordionSummary-root');
    if (summary) {
      fireEvent.click(summary);
    }
    // No explicit assertion for onToggleExpand as it's a default no-op function
  });
});
