import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProjectHeaderWidget } from '../ProjectHeaderWidget';

describe('ProjectHeaderWidget', () => {
  const mockProject = {
    id: 1,
    projectNo: 'PRJ-1234',
    name: 'Apollo Implementation',
    clientName: 'Global Corp',
    typeOfClient: 'Private',
    startDate: '2023-01-15',
    endDate: '2023-10-30',
    estimatedProjectCost: 5000000,
    feeType: 'Fixed',
    office: 'Mumbai',
    sector: 'Technology',
    region: 'APAC',
    priority: 'High',
    currency: 'INR'
  };

  it('renders summary view initially', () => {
    render(
      <ProjectHeaderWidget project={mockProject as any} />
    );

    // Formats as Global Corp-PRJ-1234
    expect(screen.getByText('Global Corp-PRJ-1234')).toBeInTheDocument();
    
    // Formats 5000000 in INR
    expect(screen.getAllByText(/₹50,00,000/)[0]).toBeInTheDocument();
  });

  it('expands to show full details on click', () => {
    render(
      <ProjectHeaderWidget project={mockProject as any} />
    );

    // Look for the container that toggles expansion
    // Since there's no specific role on the Box, we can find it by text and click its parent or closest clickable.
    const summaryText = screen.getByText('Global Corp-PRJ-1234');
    fireEvent.click(summaryText); // This bubbles up to the Box onClick

    // Now it should show 'PROJECT DETAILS' header
    expect(screen.getByText('PROJECT DETAILS')).toBeInTheDocument();

    // Now verify the detailed fields
    expect(screen.getByText('Apollo Implementation')).toBeInTheDocument();
    expect(screen.getByText(/Type of Client/i)).toBeInTheDocument();
    expect(screen.getByText('Private')).toBeInTheDocument();
    expect(screen.getByText(/Fee Type/i)).toBeInTheDocument();
    expect(screen.getByText('Fixed')).toBeInTheDocument();
  });

  it('formats dates as correctly localized representation EN-GB', () => {
     render(
      <ProjectHeaderWidget project={mockProject as any} />
    );
     // 2023-01-15 -> 15/01/2023
     expect(screen.getAllByText('15/01/2023')[0]).toBeInTheDocument();
  });
});
