import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SystemSettings from './SystemSettings';
import * as versionUtils from '../../utils/version';

vi.mock('../../utils/version', () => ({
  getVersionInfo: vi.fn(),
}));

describe('SystemSettings Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    vi.mocked(versionUtils.getVersionInfo).mockReturnValue({
      displayVersion: 'v1.5.0-mock',
    } as any);

    // Mock window.confirm
    vi.stubGlobal('confirm', vi.fn().mockReturnValue(true));
  });

  it('renders all sections and initial fields correctly', () => {
    render(<SystemSettings />);

    // Check Headers
    expect(screen.getByText('System Settings')).toBeInTheDocument();
    expect(screen.getByText('General Settings')).toBeInTheDocument();
    expect(screen.getByText('Email Settings')).toBeInTheDocument();
    expect(screen.getByText('Security Settings')).toBeInTheDocument();
    expect(screen.getByText('Storage Settings')).toBeInTheDocument();

    // Check Default Values (from state)
    expect(screen.getByLabelText('Application Name')).toHaveValue('Project Management');
    expect(screen.getByLabelText('SMTP Server')).toHaveValue('smtp.gmail.com');
  });

  it('allows user to update fields', () => {
    render(<SystemSettings />);

    const appNameInput = screen.getByLabelText('Application Name');
    fireEvent.change(appNameInput, { target: { value: 'New App Name' } });
    
    expect(appNameInput).toHaveValue('New App Name');
  });

  it('shows success message on save click', async () => {
    render(<SystemSettings />);

    const saveButton = screen.getByRole('button', { name: /Save Settings/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Settings saved successfully!')).toBeInTheDocument();
    });
  });

  it('resets settings on reset click when confirmed', () => {
    render(<SystemSettings />);

    // Change a value to verify it triggers loadSettings (which we mock implicitly)
    const appNameInput = screen.getByLabelText('Application Name');
    fireEvent.change(appNameInput, { target: { value: 'Different App' } });

    const resetButton = screen.getByRole('button', { name: /Reset to Default/i });
    fireEvent.click(resetButton);

    // In the mock state, handleReset fires window.confirm, then loadSettings()
    // It should clear success indicators
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to reset all settings to default?');
  });
});
