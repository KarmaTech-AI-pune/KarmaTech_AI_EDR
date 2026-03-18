import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DashboardHeader from './DashboardHeader';

describe('DashboardHeader Component', () => {
  const defaultFilters = {
    selectedRegion: 'All',
    timeframe: 'quarter'
  };

  const mockOnFiltersChange = vi.fn();
  const mockOnNotificationsClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dropdowns and buttons with correct values', () => {
    render(
      <DashboardHeader 
        filters={defaultFilters} 
        onFiltersChange={mockOnFiltersChange} 
        onNotificationsClick={mockOnNotificationsClick} 
      />
    );

    // Initial select values
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('This Quarter')).toBeInTheDocument(); // matches 'quarter' value in TIMEFRAMES usually
    
    expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument();
  });

  it('calls onNotificationsClick when notification button is clicked', () => {
    render(
      <DashboardHeader 
        filters={defaultFilters} 
        onFiltersChange={mockOnFiltersChange} 
        onNotificationsClick={mockOnNotificationsClick} 
      />
    );

    const button = screen.getByRole('button', { name: /notifications/i });
    fireEvent.click(button);

    expect(mockOnNotificationsClick).toHaveBeenCalledTimes(1);
  });

  it('calls onFiltersChange when region is updated', () => {
    render(
      <DashboardHeader 
        filters={defaultFilters} 
        onFiltersChange={mockOnFiltersChange} 
        onNotificationsClick={mockOnNotificationsClick} 
      />
    );

    // MUI Select uses role="combobox"
    const selects = screen.getAllByRole('combobox');
    const regionSelect = selects[0]; // First select is Region
    
    fireEvent.mouseDown(regionSelect);

    const listbox = screen.getByRole('listbox');
    fireEvent.click(within(listbox).getByText('North America'));

    expect(mockOnFiltersChange).toHaveBeenCalledWith({ selectedRegion: 'North America' });
  });

  it('calls onFiltersChange when timeframe is updated', () => {
    render(
      <DashboardHeader 
        filters={defaultFilters} 
        onFiltersChange={mockOnFiltersChange} 
        onNotificationsClick={mockOnNotificationsClick} 
      />
    );

    const selects = screen.getAllByRole('combobox');
    const timeframeSelect = selects[1]; // Second select is Timeframe
    
    fireEvent.mouseDown(timeframeSelect);

    const listbox = screen.getByRole('listbox');
    fireEvent.click(within(listbox).getByText('This Year')); 
    
    // We expect the value matching "This Year" in the options list (which is 'year')
    expect(mockOnFiltersChange).toHaveBeenCalledWith({ timeframe: 'year' }); 
  });
});
