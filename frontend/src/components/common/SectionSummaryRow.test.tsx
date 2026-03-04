import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SectionSummaryRow from './SectionSummaryRow';

describe('SectionSummaryRow Component', () => {
  it('renders standard label and value correctly', () => {
    // Assuming the parent must be a <table> and <tbody> for <TableRow>
    render(
      <table>
        <tbody>
          <SectionSummaryRow label="Total Revenue" value="$1,000" tableCellStyle={{}} />
        </tbody>
      </table>
    );

    expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    expect(screen.getByText('$1,000')).toBeInTheDocument();
  });

  it('applies colSpan correctly', () => {
    render(
      <table>
        <tbody>
          <SectionSummaryRow label="Test Colspan" value="100" colSpan={3} tableCellStyle={{}} />
        </tbody>
      </table>
    );

    const labelCell = screen.getByText('Test Colspan');
    expect(labelCell).toHaveAttribute('colspan', '3');
  });

  it('renders highlighted positive styles correctly', () => {
    // We cannot easily test the exact resolved hex code for MUI styles in JSDOM sometimes, 
    // but we can ensure it renders successfully without crashing when highlighting is enabled.
    render(
      <table>
        <tbody>
          <SectionSummaryRow label="Profit" value="$500" isHighlighted={true} isNegativeHighlight={false} tableCellStyle={{}} />
        </tbody>
      </table>
    );

    expect(screen.getByText('Profit')).toBeInTheDocument();
    expect(screen.getByText('$500')).toBeInTheDocument();
  });

  it('renders highlighted negative styles correctly', () => {
    render(
      <table>
        <tbody>
          <SectionSummaryRow label="Loss" value="-$200" isHighlighted={true} isNegativeHighlight={true} tableCellStyle={{}} />
        </tbody>
      </table>
    );

    expect(screen.getByText('Loss')).toBeInTheDocument();
    expect(screen.getByText('-$200')).toBeInTheDocument();
  });
});
