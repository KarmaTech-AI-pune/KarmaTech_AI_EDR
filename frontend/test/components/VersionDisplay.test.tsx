import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { VersionDisplay } from '../../src/components/VersionDisplay';
import { versionApi } from '../../src/services/versionApi';
import { globalErrorHandler } from '../../src/utils/errorHandling';
import { globalOfflineManager } from '../../src/utils/offlineSupport';

// Mock the dependencies
vi.mock('../../src/services/versionApi');
vi.mock('../../src/utils/errorHandling', () => ({
  globalErrorHandler: {
    handleError: vi.fn()
  },
  shouldShowRetry: vi.fn(),
  createUserFriendlyMessage: vi.fn()
}));
vi.mock('../../src/utils/offlineSupport');

// Create a mock for isDevelopmentBuild that can be changed per test
const mockIsDevelopmentBuild = vi.fn(() => false);
vi.mock('../../src/utils/version', () => ({
  getVersionInfo: () => ({
    displayVersion: 'v1.0.0',
    buildDate: '2024-01-01T00:00:00Z',
    version: '1.0.0'
  }),
  isDevelopmentBuild: () => mockIsDevelopmentBuild()
}));

const mockVersionApi = vi.mocked(versionApi);
const mockGlobalErrorHandler = vi.mocked(globalErrorHandler);
const mockGlobalOfflineManager = vi.mocked(globalOfflineManager);

// Mock offline state hook
vi.mock('../../src/utils/offlineSupport', async () => {
  const actual = await vi.importActual('../../src/utils/offlineSupport');
  return {
    ...actual,
    useOfflineState: () => ({ isOffline: false, lastOnline: null }),
    globalOfflineManager: {
      getCachedVersionInfo: vi.fn(),
      cacheVersionInfo: vi.fn()
    }
  };
});

// Import the mocked functions
import { shouldShowRetry, createUserFriendlyMessage } from '../../src/utils/errorHandling';
const mockShouldShowRetry = vi.mocked(shouldShowRetry);
const mockCreateUserFriendlyMessage = vi.mocked(createUserFriendlyMessage);

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('VersionDisplay Component', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the isDevelopmentBuild mock to default
    mockIsDevelopmentBuild.mockReturnValue(false);
    // Reset localStorage
    localStorage.clear();
    // Mock console methods to avoid noise in tests
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders with default fallback version', () => {
      renderWithTheme(<VersionDisplay />);
      
      expect(screen.getByText('Version v1.0.0')).toBeInTheDocument();
    });

    it('renders with custom prefix', () => {
      renderWithTheme(<VersionDisplay prefix="App Version" />);
      
      expect(screen.getByText('App Version v1.0.0')).toBeInTheDocument();
    });

    it('shows development indicator when enabled', () => {
      mockIsDevelopmentBuild.mockReturnValue(true);
      
      renderWithTheme(<VersionDisplay showDevIndicator={true} />);
      
      expect(screen.getByText('Version v1.0.0 (dev)')).toBeInTheDocument();
    });

    it('hides development indicator when disabled', () => {
      mockIsDevelopmentBuild.mockReturnValue(true);
      
      renderWithTheme(<VersionDisplay showDevIndicator={false} />);
      
      expect(screen.getByText('Version v1.0.0')).toBeInTheDocument();
      expect(screen.queryByText('Version v1.0.0 (dev)')).not.toBeInTheDocument();
    });
  });

  describe('API Integration', () => {
    it('fetches version from API when fetchVersionFromAPI is true', async () => {
      const mockVersionInfo = {
        version: '1.0.38',
        displayVersion: 'v1.0.38',
        fullVersion: 'v1.0.38-dev.20241225.1',
        buildDate: '2024-12-25T10:00:00Z',
        commitHash: 'abc123',
        environment: 'dev'
      };

      mockVersionApi.getCurrentVersion.mockResolvedValue(mockVersionInfo);

      renderWithTheme(<VersionDisplay fetchVersionFromAPI={true} />);

      // Should show loading skeleton initially
      expect(screen.getByTestId('version-skeleton')).toBeInTheDocument();

      // Wait for API call to complete
      await waitFor(() => {
        expect(screen.getByText('Version v1.0.38')).toBeInTheDocument();
      });

      expect(mockVersionApi.getCurrentVersion).toHaveBeenCalledTimes(1);
    });

    it('shows fallback version when API fails', async () => {
      const mockError = new Error('Network error');
      mockVersionApi.getCurrentVersion.mockRejectedValue(mockError);
      mockGlobalErrorHandler.handleError.mockReturnValue({
        type: 'NETWORK_ERROR',
        message: 'Network error',
        originalError: mockError,
        timestamp: Date.now(),
        context: {}
      });

      renderWithTheme(<VersionDisplay fetchVersionFromAPI={true} />);

      await waitFor(() => {
        expect(screen.getByText('Version v1.0.0')).toBeInTheDocument();
      });

      expect(mockVersionApi.getCurrentVersion).toHaveBeenCalledTimes(1);
    });

    it('uses fallback version when API is not called', async () => {
      // This test was checking for cached version, but the component doesn't use cache
      // It only uses API version or fallback version
      renderWithTheme(<VersionDisplay fetchVersionFromAPI={false} />);

      // Should show fallback version immediately (no API call)
      expect(screen.getByText('Version v1.0.0')).toBeInTheDocument();
      expect(mockVersionApi.getCurrentVersion).not.toHaveBeenCalled();
    });
  });

  describe('Interactive Behavior', () => {
    it('is clickable when clickable prop is true', () => {
      const onVersionClick = vi.fn();
      
      renderWithTheme(
        <VersionDisplay 
          clickable={true} 
          onVersionClick={onVersionClick}
        />
      );

      const versionElement = screen.getByText('Version v1.0.0');
      expect(versionElement).toHaveStyle('cursor: pointer');
    });

    it('calls onVersionClick when clicked', async () => {
      const onVersionClick = vi.fn();
      
      renderWithTheme(
        <VersionDisplay 
          clickable={true} 
          onVersionClick={onVersionClick}
        />
      );

      const versionElement = screen.getByText('Version v1.0.0');
      await user.click(versionElement);

      expect(onVersionClick).toHaveBeenCalledWith('1.0.0');
    });

    it('handles keyboard navigation (Enter key)', async () => {
      const onVersionClick = vi.fn();
      
      renderWithTheme(
        <VersionDisplay 
          clickable={true} 
          onVersionClick={onVersionClick}
        />
      );

      const versionElement = screen.getByText('Version v1.0.0');
      versionElement.focus();
      await user.keyboard('{Enter}');

      expect(onVersionClick).toHaveBeenCalledWith('1.0.0');
    });

    it('handles keyboard navigation (Space key)', async () => {
      const onVersionClick = vi.fn();
      
      renderWithTheme(
        <VersionDisplay 
          clickable={true} 
          onVersionClick={onVersionClick}
        />
      );

      const versionElement = screen.getByText('Version v1.0.0');
      versionElement.focus();
      await user.keyboard(' ');

      expect(onVersionClick).toHaveBeenCalledWith('1.0.0');
    });

    it('does not call onVersionClick when not clickable', async () => {
      const onVersionClick = vi.fn();
      
      renderWithTheme(
        <VersionDisplay 
          clickable={false} 
          onVersionClick={onVersionClick}
        />
      );

      const versionElement = screen.getByText('Version v1.0.0');
      await user.click(versionElement);

      expect(onVersionClick).not.toHaveBeenCalled();
    });
  });

  describe('Loading States', () => {
    it('shows loading skeleton while fetching from API', async () => {
      // Mock a delayed API response
      mockVersionApi.getCurrentVersion.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      renderWithTheme(<VersionDisplay fetchVersionFromAPI={true} />);

      expect(screen.getByTestId('version-skeleton')).toBeInTheDocument();
    });

    it('hides loading skeleton after API response', async () => {
      const mockVersionInfo = {
        version: '1.0.38',
        displayVersion: 'v1.0.38',
        fullVersion: 'v1.0.38',
        buildDate: '2024-12-25T10:00:00Z',
        commitHash: 'abc123',
        environment: 'prod'
      };

      mockVersionApi.getCurrentVersion.mockResolvedValue(mockVersionInfo);

      renderWithTheme(<VersionDisplay fetchVersionFromAPI={true} />);

      await waitFor(() => {
        expect(screen.queryByTestId('version-skeleton')).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('shows retry button when API fails', async () => {
      const mockError = new Error('API Error');
      mockVersionApi.getCurrentVersion.mockRejectedValue(mockError);
      mockGlobalErrorHandler.handleError.mockReturnValue({
        type: 'API_ERROR',
        message: 'API Error',
        originalError: mockError,
        timestamp: Date.now(),
        context: {}
      });

      renderWithTheme(<VersionDisplay fetchVersionFromAPI={true} />);

      await waitFor(() => {
        // Component shows RefreshIcon with aria-label "Retry fetching version"
        expect(screen.getByLabelText(/retry fetching version/i)).toBeInTheDocument();
      });
    });

    it('shows retry button for retryable errors', async () => {
      const mockError = new Error('Network Error');
      mockVersionApi.getCurrentVersion.mockRejectedValue(mockError);
      mockGlobalErrorHandler.handleError.mockReturnValue({
        type: 'NETWORK_ERROR',
        message: 'Network Error',
        originalError: mockError,
        timestamp: Date.now(),
        context: {}
      });

      // Mock shouldShowRetry to return true
      mockShouldShowRetry.mockReturnValue(true);

      renderWithTheme(<VersionDisplay fetchVersionFromAPI={true} />);

      await waitFor(() => {
        expect(screen.getByLabelText(/retry fetching version/i)).toBeInTheDocument();
      });
    });

    it('retries API call when retry button is clicked', async () => {
      const mockError = new Error('Network Error');
      mockVersionApi.getCurrentVersion
        .mockRejectedValueOnce(mockError)
        .mockResolvedValueOnce({
          version: '1.0.38',
          displayVersion: 'v1.0.38',
          fullVersion: 'v1.0.38',
          buildDate: '2024-12-25T10:00:00Z',
          commitHash: 'abc123',
          environment: 'prod'
        });

      mockGlobalErrorHandler.handleError.mockReturnValue({
        type: 'NETWORK_ERROR',
        message: 'Network Error',
        originalError: mockError,
        timestamp: Date.now(),
        context: {}
      });

      mockShouldShowRetry.mockReturnValue(true);

      renderWithTheme(<VersionDisplay fetchVersionFromAPI={true} />);

      // Wait for error state
      await waitFor(() => {
        expect(screen.getByLabelText(/retry fetching version/i)).toBeInTheDocument();
      });

      // Click retry button
      const retryButton = screen.getByLabelText(/retry fetching version/i);
      await user.click(retryButton);

      // Should call API again
      expect(mockVersionApi.getCurrentVersion).toHaveBeenCalledTimes(2);

      // Should show success state
      await waitFor(() => {
        expect(screen.getByText('Version v1.0.38')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels when clickable', () => {
      renderWithTheme(
        <VersionDisplay 
          clickable={true} 
          onVersionClick={() => {}}
        />
      );

      const versionElement = screen.getByText('Version v1.0.0');
      expect(versionElement).toHaveAttribute('role', 'button');
      expect(versionElement).toHaveAttribute('tabIndex', '0');
      expect(versionElement).toHaveAttribute('aria-label', 'Version v1.0.0, click to view release notes');
    });

    it('does not have button role when not clickable', () => {
      renderWithTheme(<VersionDisplay clickable={false} />);

      const versionElement = screen.getByText('Version v1.0.0');
      expect(versionElement).not.toHaveAttribute('role', 'button');
      expect(versionElement).not.toHaveAttribute('tabIndex');
    });
  });

  describe('Tooltip Functionality', () => {
    it('shows tooltip with build date when showBuildDate is true', async () => {
      renderWithTheme(<VersionDisplay showBuildDate={true} />);

      const versionElement = screen.getByText('Version v1.0.0');
      
      // Hover to show tooltip
      await user.hover(versionElement);

      await waitFor(() => {
        expect(screen.getByText(/Build Date:/)).toBeInTheDocument();
      });
    });

    it('shows error information in tooltip when API fails', async () => {
      const mockError = new Error('Network Error');
      mockVersionApi.getCurrentVersion.mockRejectedValue(mockError);
      mockGlobalErrorHandler.handleError.mockReturnValue({
        type: 'NETWORK_ERROR',
        message: 'Network Error',
        originalError: mockError,
        timestamp: Date.now(),
        context: {}
      });

      renderWithTheme(<VersionDisplay fetchVersionFromAPI={true} showBuildDate={true} />);

      await waitFor(() => {
        expect(screen.getByText('Version v1.0.0')).toBeInTheDocument();
      });

      const versionElement = screen.getByText('Version v1.0.0');
      await user.hover(versionElement);

      await waitFor(() => {
        // Component shows error in tooltip - look for the tooltip specifically
        // The tooltip contains "⚠️ Network Error" and "Click the warning icon to retry"
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toHaveTextContent(/Network Error/);
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles empty version response gracefully', async () => {
      mockVersionApi.getCurrentVersion.mockResolvedValue({
        version: '',
        displayVersion: '',
        fullVersion: '',
        buildDate: '',
        commitHash: '',
        environment: ''
      });

      renderWithTheme(<VersionDisplay fetchVersionFromAPI={true} />);

      await waitFor(() => {
        // Component shows just "Version" when displayVersion is empty
        expect(screen.getByText('Version')).toBeInTheDocument();
      });
    });

    it('handles malformed API response', async () => {
      mockVersionApi.getCurrentVersion.mockResolvedValue(null as any);

      renderWithTheme(<VersionDisplay fetchVersionFromAPI={true} />);

      await waitFor(() => {
        // Should fall back to default version
        expect(screen.getByText('Version v1.0.0')).toBeInTheDocument();
      });
    });

    it('handles component unmounting during API call', async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise(resolve => {
        resolvePromise = resolve;
      });

      mockVersionApi.getCurrentVersion.mockReturnValue(promise);

      const { unmount } = renderWithTheme(<VersionDisplay fetchVersionFromAPI={true} />);

      // Unmount before API call completes
      unmount();

      // Resolve the promise after unmount
      act(() => {
        resolvePromise!({
          version: '1.0.38',
          displayVersion: 'v1.0.38',
          fullVersion: 'v1.0.38',
          buildDate: '2024-12-25T10:00:00Z',
          commitHash: 'abc123',
          environment: 'prod'
        });
      });

      // Should not cause any errors or warnings
      expect(console.error).not.toHaveBeenCalled();
    });
  });
});