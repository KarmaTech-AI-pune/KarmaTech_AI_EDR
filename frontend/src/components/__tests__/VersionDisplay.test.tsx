import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VersionDisplay } from '../VersionDisplay';
import * as versionUtils from '../../utils/version';

// Mock the version utilities
vi.mock('../../utils/version', () => ({
  getVersionInfo: vi.fn(() => ({
    version: '1.12.0',
    buildDate: '2024-12-04T10:30:00.000Z',
    displayVersion: 'v1.12.0'
  })),
  isDevelopmentBuild: vi.fn(() => false)
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
});