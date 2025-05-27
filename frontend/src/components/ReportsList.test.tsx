import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { ReportsList } from './ReportsList';

describe('ReportsList Component', () => {
  it('should render the "Reports" title', () => {
    render(<ReportsList />);
    const titleElement = screen.getByRole('heading', { name: /Reports/i });
    expect(titleElement).toBeInTheDocument();
  });

  it('should render a list of reports', () => {
    render(<ReportsList />);
    const listElement = screen.getByRole('list');
    expect(listElement).toBeInTheDocument();
  });

  it('should display each report name and date', () => {
    render(<ReportsList />);
    const reportItems = screen.getAllByRole('listitem');
    expect(reportItems.length).toBe(3);
    
    // Check report names
    expect(screen.getByText(/Monthly Progress Report/i)).toBeInTheDocument();
    expect(screen.getByText(/Resource Utilization Report/i)).toBeInTheDocument();
    expect(screen.getByText(/Financial Summary/i)).toBeInTheDocument();
    
    // Check report dates
    expect(screen.getByText(/Generated on: 2023-05-01/i)).toBeInTheDocument();
    expect(screen.getByText(/Generated on: 2023-05-15/i)).toBeInTheDocument();
    expect(screen.getByText(/Generated on: 2023-05-30/i)).toBeInTheDocument();
  });
});
