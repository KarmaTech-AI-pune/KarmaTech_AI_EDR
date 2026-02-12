import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { VersionDisplay } from '../VersionDisplay';
import * as versionUtils from '../../utils/version';
import { versionApi } from '../../services/versionApi';

// Mock the version utilities
vi.mock('../../utils/version', () => ({
  getVersionInfo: vi.fn(() => ({
    version: '1.12.0',
    buildDate: '2024-12-04T10:30:00.000Z',
    displayVersion: 'v1.12.0'
  })),
  isDevelopmentBuild: vi.fn(() => false)
}));

// Mock the version API
vi.mock('../../services/versionApi', () => ({
  versionApi: {
    getCurrentVersion: vi.fn()
  }
}));

describe('VersionDisplay', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset to default mock values
    vi.mocked(versionUtils.getVersionInfo).mockReturnValue({
      version: '1.12.0',
      buildDate: '2024-12-04T10:30:00.000Z',
      displayVersion: 'v1.12.0'
    });
    vi.mocked(versionUtils.isDevelopmentBuild).mockReturnValue(false);
    vi.mocked(versionApi.getCurrentVersion).mockResolvedValue({
      version: '1.13.0',
      displayVersion: 'v1.13.0',
      fullVersion: 'v1.13.0-dev.20241204.1',
      buildDate: '2024-12-04T12:00:00.000Z',
      commitHash: 'abc123',
      environment: 'dev'
    });
  });

  it('should render version with default prefix', () => {
    render(<VersionDisplay />);
    
    expect(screen.getByText('Version v1.12.0')).toBeInTheDocument();
  });

  it('should render version with custom prefix', () => {
    render(<VersionDisplay prefix="App Version" />);
    
    expect(screen.getByText('App Version v1.12.0')).toBeInTheDocument();
  });

  it('should show development indicator for dev builds', () => {
    vi.mocked(versionUtils.getVersionInfo).mockReturnValue({
      version: 'dev',
      buildDate: '2024-12-04T10:30:00.000Z',
      displayVersion: 'vdev'
    });
    vi.mocked(versionUtils.isDevelopmentBuild).mockReturnValue(true);
    
    render(<VersionDisplay showDevIndicator={true} />);
    
    expect(screen.getByText('Version vdev (dev)')).toBeInTheDocument();
  });

  it('should hide development indicator when showDevIndicator is false', () => {
    vi.mocked(versionUtils.getVersionInfo).mockReturnValue({
      version: 'dev',
      buildDate: '2024-12-04T10:30:00.000Z',
      displayVersion: 'vdev'
    });
    vi.mocked(versionUtils.isDevelopmentBuild).mockReturnValue(true);
    
    render(<VersionDisplay showDevIndicator={false} />);
    
    expect(screen.getByText('Version vdev')).toBeInTheDocument();
    expect(screen.queryByText('Version vdev (dev)')).not.toBeInTheDocument();
  });

  it('should apply custom typography props', () => {
    render(<VersionDisplay variant="h6" color="primary" />);
    
    const versionElement = screen.getByText('Version v1.12.0');
    expect(versionElement).toHaveClass('MuiTypography-h6');
  });

  it('should handle click when clickable is true', () => {
    const onVersionClick = vi.fn();
    render(<VersionDisplay clickable={true} onVersionClick={onVersionClick} />);
    
    const versionElement = screen.getByText('Version v1.12.0');
    fireEvent.click(versionElement);
    
    expect(onVersionClick).toHaveBeenCalledWith('1.12.0');
  });

  it('should handle keyboard navigation when clickable', () => {
    const onVersionClick = vi.fn();
    render(<VersionDisplay clickable={true} onVersionClick={onVersionClick} />);
    
    const versionElement = screen.getByText('Version v1.12.0');
    fireEvent.keyDown(versionElement, { key: 'Enter' });
    
    expect(onVersionClick).toHaveBeenCalledWith('1.12.0');
  });

  it('should fetch version from API when fetchVersionFromAPI is true', async () => {
    render(<VersionDisplay fetchVersionFromAPI={true} />);
    
    // Should show loading skeleton initially
    expect(screen.getByTestId('version-skeleton')).toBeInTheDocument();
    
    // Wait for API call to complete
    await waitFor(() => {
      expect(screen.getByText('Version v1.13.0')).toBeInTheDocument();
    });
    
    expect(versionApi.getCurrentVersion).toHaveBeenCalled();
  });

  it('should show fallback version when API fails', async () => {
    vi.mocked(versionApi.getCurrentVersion).mockRejectedValue(new Error('API Error'));
    
    render(<VersionDisplay fetchVersionFromAPI={true} />);
    
    // Wait for API call to fail and fallback to be used
    await waitFor(() => {
      expect(screen.getByText('Version v1.12.0')).toBeInTheDocument();
    });
  });
});