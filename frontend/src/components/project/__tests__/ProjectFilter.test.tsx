
import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ProjectFilter } from '../ProjectFilter';
import { ProjectStatus } from '../../../types/index';

describe('ProjectFilter', () => {
  const defaultProps = {
    onFilterChange: vi.fn(),
    currentFilter: '' as const, // 'const' needed for TS to accept empty string
  };

  it('renders all default statuses when no statuses are provided', () => {
    render(<ProjectFilter {...defaultProps} />);
    
    // Open select dropdown
    const select = screen.getByRole('combobox');
    fireEvent.mouseDown(select);
    
    // Check all default statuses
    const listbox = screen.getByRole('listbox');
    expect(within(listbox).getByText('All')).toBeInTheDocument();
    expect(within(listbox).getByText('Opportunity')).toBeInTheDocument();
    expect(within(listbox).getByText('Decision Pending')).toBeInTheDocument();
    expect(within(listbox).getByText('Cancelled')).toBeInTheDocument();
    expect(within(listbox).getByText('Completed')).toBeInTheDocument();
  });

  it('renders only provided statuses', () => {
    const customStatuses = [ProjectStatus.BidAccepted, ProjectStatus.InProgress];
    
    render(<ProjectFilter {...defaultProps} statuses={customStatuses} />);
    
    // Open select dropdown
    const select = screen.getByRole('combobox');
    fireEvent.mouseDown(select);
    
    const listbox = screen.getByRole('listbox');
    expect(within(listbox).getByText('All')).toBeInTheDocument();
    expect(within(listbox).getByText('Bid Accepted')).toBeInTheDocument();
    expect(within(listbox).getByText('In Progress')).toBeInTheDocument();
    
    // Ensure others are not rendered
    expect(within(listbox).queryByText('Opportunity')).not.toBeInTheDocument();
  });

  it('calls onFilterChange when a status is selected', () => {
    render(<ProjectFilter {...defaultProps} />);
    
    const select = screen.getByRole('combobox');
    fireEvent.mouseDown(select);
    
    const listbox = screen.getByRole('listbox');
    const option = within(listbox).getByText('In Progress');
    
    fireEvent.click(option);
    
    expect(defaultProps.onFilterChange).toHaveBeenCalledWith(ProjectStatus.InProgress);
  });

  it('calls onFilterChange with empty string when "All" is selected', () => {
    render(<ProjectFilter {...defaultProps} currentFilter={ProjectStatus.InProgress} />);
    
    const select = screen.getByRole('combobox');
    fireEvent.mouseDown(select);
    
    const listbox = screen.getByRole('listbox');
    const option = within(listbox).getByText('All');
    
    fireEvent.click(option);
    
    expect(defaultProps.onFilterChange).toHaveBeenCalledWith('');
  });
});
