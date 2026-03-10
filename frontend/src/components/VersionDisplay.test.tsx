import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import VersionDisplay from './VersionDisplay';
import { versionApi } from '../services/versionApi';
import * as versionUtils from '../utils/version';

vi.mock('../services/versionApi', () => ({
  versionApi: {
    getCurrentVersion: vi.fn(),
  }
}));

vi.mock('../utils/version', () => ({
  getVersionInfo: vi.fn(),
  isDevelopmentBuild: vi.fn(),
}));

describe('VersionDisplay Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    vi.mocked(versionUtils.getVersionInfo).mockReturnValue({
      displayVersion: 'v1.0.0-local',
      buildDate: '2026-01-01T00:00:00Z',
      version: '1.0.0',
    } as any);
    
    vi.mocked(versionUtils.isDevelopmentBuild).mockReturnValue(true);
  });

  it('renders fallback version correctly by default', () => {
    render(<VersionDisplay />);
    
    expect(screen.getByText('Version 1.0.0')).toBeInTheDocument();
  });

  it('renders API version when fetchVersionFromAPI is true', async () => {
    vi.mocked(versionApi.getCurrentVersion).mockResolvedValue({
      displayVersion: 'v1.2.0-prod',
      version: '1.2.0',
      buildDate: '2026-02-01T00:00:00Z'
    } as any);

    render(<VersionDisplay fetchVersionFromAPI={true} />);

    // initially might show skeleton or fallback, then resolves:
    await waitFor(() => {
      expect(screen.getByText('Version 1.2.0')).toBeInTheDocument();
    });
  });

  it('renders forced version with custom prefix', () => {
    render(<VersionDisplay forceVersion="2.5.0" prefix="App V" />);
    
    expect(screen.getByText('App V 2.5.0')).toBeInTheDocument();
  });

  it('calls onVersionClick when clickable is true and text is clicked', () => {
    const mockOnClick = vi.fn();
    
    render(
      <VersionDisplay 
        clickable={true} 
        onVersionClick={mockOnClick} 
      />
    );

    fireEvent.click(screen.getByText('Version 1.0.0'));
    expect(mockOnClick).toHaveBeenCalledWith('1.0.0');
  });
});
