import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AlertsPanel } from './AlertsPanel';

// Mock the navigation hook
const mockNavigateToBusinessDevelopment = vi.fn();
vi.mock('../hooks/useAppNavigation', () => ({
  useAppNavigation: () => ({
    navigateToBusinessDevelopment: mockNavigateToBusinessDevelopment,
  }),
}));

describe('AlertsPanel Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the Alerts header correctly', () => {
    render(<AlertsPanel />);
    expect(screen.getByText('Alerts!')).toBeInTheDocument();
  });

  it('renders a list of alerts when available', () => {
    render(<AlertsPanel />);
    
    // Check for the titles of the alerts
    expect(screen.getByText('Water Treatment Plan')).toBeInTheDocument();
    expect(screen.getByText('ETP installation in Odisha')).toBeInTheDocument();
  });

  it('calls navigation handler when an alert is clicked', () => {
    render(<AlertsPanel />);
    
    // Click the first alert
    const firstAlertTitle = screen.getByText('Water Treatment Plan');
    fireEvent.click(firstAlertTitle);

    expect(mockNavigateToBusinessDevelopment).toHaveBeenCalledTimes(1);
  });
});
