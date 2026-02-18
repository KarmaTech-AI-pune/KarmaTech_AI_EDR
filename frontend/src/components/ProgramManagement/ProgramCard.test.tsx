import React from 'react';
import { waitFor } from '@testing-library/react';
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ProgramCard from './ProgramCard';
import { Program } from '../../types/program';

describe('ProgramCard', () => {
  const mockProgram: Program = {
    id: 1,
    name: 'Test Program',
    description: 'Test program description',
    startDate: '2025-01-01',
    endDate: '2025-12-31'
  };

  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders program name', () => {
    render(<ProgramCard program={mockProgram} />);
    expect(screen.getByText('Test Program')).toBeInTheDocument();
  });

  it('renders program description', () => {
    render(<ProgramCard program={mockProgram} />);
    expect(screen.getByText('Test program description')).toBeInTheDocument();
  });

  it('renders start date', () => {
    render(<ProgramCard program={mockProgram} />);
    expect(screen.getByText(/Start:/)).toBeInTheDocument();
  });

  it('renders end date when provided', () => {
    render(<ProgramCard program={mockProgram} />);
    expect(screen.getByText(/End:/)).toBeInTheDocument();
  });

  it('does not render end date when not provided', async () => {
    const programWithoutEndDate: Program = {
      ...mockProgram,
      endDate: null
    };
    render(<ProgramCard program={programWithoutEndDate} />);
    await waitFor(() => {
      expect(screen.queryByText(/End:/)).not.toBeInTheDocument();
    });
  });

  it('displays N/A for null start date', () => {
    const programWithNullStartDate: Program = {
      ...mockProgram,
      startDate: null
    };
    render(<ProgramCard program={programWithNullStartDate} />);
    expect(screen.getByText(/Start: N\/A/)).toBeInTheDocument();
  });

  it('formats dates using toLocaleDateString', () => {
    render(<ProgramCard program={mockProgram} />);
    // Check that dates are formatted (actual format depends on locale)
    const startDate = new Date('2025-01-01').toLocaleDateString();
    const endDate = new Date('2025-12-31').toLocaleDateString();
    expect(screen.getByText(new RegExp(startDate))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(endDate))).toBeInTheDocument();
  });

  it('renders with proper card styling', () => {
    const { container } = render(<ProgramCard program={mockProgram} />);
    const card = container.querySelector('.MuiCard-root');
    expect(card).toBeInTheDocument();
  });

  it('accepts onEdit and onDelete callbacks as props', () => {
    // Test that component accepts these props without errors
    expect(() => {
      render(<ProgramCard program={mockProgram} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    }).not.toThrow();
  });

  it('renders CardContent with program information', () => {
    const { container } = render(<ProgramCard program={mockProgram} />);
    const cardContent = container.querySelector('.MuiCardContent-root');
    expect(cardContent).toBeInTheDocument();
    expect(cardContent).toHaveTextContent('Test Program');
    expect(cardContent).toHaveTextContent('Test program description');
  });

  it('handles long program names gracefully', () => {
    const longNameProgram: Program = {
      ...mockProgram,
      name: 'A'.repeat(100)
    };
    render(<ProgramCard program={longNameProgram} />);
    expect(screen.getByText('A'.repeat(100))).toBeInTheDocument();
  });

  it('handles long descriptions gracefully', () => {
    const longDescProgram: Program = {
      ...mockProgram,
      description: 'B'.repeat(200)
    };
    render(<ProgramCard program={longDescProgram} />);
    expect(screen.getByText('B'.repeat(200))).toBeInTheDocument();
  });
});




