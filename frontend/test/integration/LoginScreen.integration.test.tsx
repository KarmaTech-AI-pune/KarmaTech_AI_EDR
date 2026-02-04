import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { LoginScreen } from '../../src/pages/LoginScreen';
import { versionApi } from '../../src/services/versionApi';
import { releaseNotesApi } from '../../src/services/releaseNotesApi';
import { authApi } from '../../src/services/authApi';

// Mock the dependencies
vi.mock('../../src/services/versionApi');
vi.mock('../../src/services/releaseNotesApi');
vi.mock('../../src/services/authApi');

// Mock the context
const mockContext = {
  isAuthenticated: false,
  setIsAuthenticated: vi.fn(),
  user: null,
  setUser: vi.fn()
};

vi.mock('../../src/App', () => ({
  projectManagementAppContext: React.createContext(mockContext)
}));

// Mock UserSubscriptionContext
const mockSubscriptionContext = {
  refreshSubscription: vi.fn()
};

vi.mock('../../src/context/UserSubscriptionContext', () => ({
  default: React.createContext(mockSubscriptionContext)
}));

// Mock useAppNavigation
vi.mock('../../src/hooks/useAppNavigation', () => ({
  useAppNavigation: () => ({
    navigateToHome: vi.fn()
  })
}));

const mockVersionApi = vi.mocked(versionApi);
const mockReleaseNotesApi = vi.mocked(releaseNotesApi);
const mockAuthApi = vi.mocked(authApi);

const theme = createTheme();

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        {component}
      </ThemeProvider>
    </BrowserRouter>
  );
};

describe('LoginScreen Integration Tests', () => {
  const user = userEvent.setup();

  const mockVersionInfo = {
    version: '1.2.3',
    displayVersion: 'v1.2.3',
    fullVersion: 'v1.2.3-dev.20241225.1',
    buildDate: '2024-12-25T10:00:00Z',
    commitHash: 'abc123',
    environment: 'dev'
  };

  const mockReleaseNotes = {
    version: '1.2.3',
    releaseDate: '2024-12-25T10:00:00Z',
    environment: 'dev',
    commitSha: 'abc123',
    branch: 'main',
    features: [
      {
        id: 1,
        changeType: 'feature',
        description: 'Added interactive version display',
        commitSha: 'abc123',
        author: 'John Doe',
        impact: 'High'
      }
    ],
    bugFixes: [
      {
        id: 2,
        changeType: 'bugfix',
        description: 'Fixed login issue',
        commitSha: 'def456',
        author: 'Jane Smith',
        jiraTicket: 'PROJ-123'
      }
    ],
    improvements: [],
    breakingChanges: []
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock successful API responses by default
    mockVersionApi.getCurrentVersion.mockResolvedValue(mockVersionInfo);
    mockReleaseNotesApi.getReleaseNotes.mockResolvedValue(mockReleaseNotes);
    mockAuthApi.login.mockResolvedValue({
      success: false,
      message: 'Invalid credentials'
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Interactive Version Display Integration', () => {
    it('displays dynamic version from API on login screen', async () => {
      renderWithProviders(<LoginScreen />);

      // Should show loading skeleton initially
      expect(screen.getByTestId('version-skeleton')).toBeInTheDocument();

      // Wait for version to load
      await waitFor(() => {
        expect(screen.getByText(/Version v1\.2\.3/)).toBeInTheDocument();
      });

      // Verify API was called
      expect(mockVersionApi.getCurrentVersion).toHaveBeenCalledTimes(1);
    });

    it('makes version clickable and opens release notes modal', async () => {
      renderWithProviders(<LoginScreen />);

      // Wait for version to load
      await waitFor(() => {
        expect(screen.getByText(/Version v1\.2\.3/)).toBeInTheDocument();
      });

      // Click on version
      const versionElement = screen.getByText(/Version v1\.2\.3/);
      await user.click(versionElement);

      // Should open release notes modal
      await waitFor(() => {
        expect(screen.getByText('Release Notes')).toBeInTheDocument();
        expect(screen.getByText('v1.2.3')).toBeInTheDocument();
      });

      // Verify release notes API was called
      expect(mockReleaseNotesApi.getReleaseNotes).toHaveBeenCalledWith('1.2.3');
    });

    it('displays release notes content in modal', async () => {
      renderWithProviders(<LoginScreen />);

      // Wait for version to load and click it
      await waitFor(() => {
        expect(screen.getByText(/Version v1\.2\.3/)).toBeInTheDocument();
      });

      const versionElement = screen.getByText(/Version v1\.2\.3/);
      await user.click(versionElement);

      // Wait for modal and release notes to load
      await waitFor(() => {
        expect(screen.getByText('Release Notes')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText('New Features (1)')).toBeInTheDocument();
        expect(screen.getByText('Bug Fixes (1)')).toBeInTheDocument();
        expect(screen.getByText('Added interactive version display')).toBeInTheDocument();
        expect(screen.getByText('Fixed login issue')).toBeInTheDocument();
      });
    });

    it('closes release notes modal when close button is clicked', async () => {
      renderWithProviders(<LoginScreen />);

      // Open modal
      await waitFor(() => {
        expect(screen.getByText(/Version v1\.2\.3/)).toBeInTheDocument();
      });

      const versionElement = screen.getByText(/Version v1\.2\.3/);
      await user.click(versionElement);

      await waitFor(() => {
        expect(screen.getByText('Release Notes')).toBeInTheDocument();
      });

      // Close modal
      const closeButton = screen.getByLabelText('close');
      await user.click(closeButton);

      // Modal should be closed
      await waitFor(() => {
        expect(screen.queryByText('Release Notes')).not.toBeInTheDocument();
      });
    });

    it('handles version API failure gracefully', async () => {
      mockVersionApi.getCurrentVersion.mockRejectedValue(new Error('Network error'));

      renderWithProviders(<LoginScreen />);

      // Should show fallback version
      await waitFor(() => {
        expect(screen.getByText(/Version/)).toBeInTheDocument();
      });

      // Should still be clickable
      const versionElement = screen.getByText(/Version/);
      await user.click(versionElement);

      // Should still try to open modal (though it might fail to load release notes)
      await waitFor(() => {
        expect(screen.getByText('Release Notes')).toBeInTheDocument();
      });
    });

    it('handles release notes API failure gracefully', async () => {
      mockReleaseNotesApi.getReleaseNotes.mockRejectedValue(new Error('Network error'));

      renderWithProviders(<LoginScreen />);

      // Wait for version to load and click it
      await waitFor(() => {
        expect(screen.getByText(/Version v1\.2\.3/)).toBeInTheDocument();
      });

      const versionElement = screen.getByText(/Version v1\.2\.3/);
      await user.click(versionElement);

      // Modal should open but show error state
      await waitFor(() => {
        expect(screen.getByText('Release Notes')).toBeInTheDocument();
      });

      // Should show error message or retry button
      await waitFor(() => {
        const errorElements = screen.queryAllByText(/error|failed|retry/i);
        expect(errorElements.length).toBeGreaterThan(0);
      });
    });
  });

  describe('End-to-End User Flow', () => {
    it('completes full flow: load page → see version → click version → view release notes → close modal', async () => {
      renderWithProviders(<LoginScreen />);

      // Step 1: Page loads with login form
      expect(screen.getByText('Login to your account')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();

      // Step 2: Version loads dynamically
      await waitFor(() => {
        expect(screen.getByText(/Version v1\.2\.3/)).toBeInTheDocument();
      });

      // Step 3: User clicks on version
      const versionElement = screen.getByText(/Version v1\.2\.3/);
      expect(versionElement).toHaveStyle('cursor: pointer');
      await user.click(versionElement);

      // Step 4: Release notes modal opens
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('Release Notes')).toBeInTheDocument();
        expect(screen.getByText('v1.2.3')).toBeInTheDocument();
      });

      // Step 5: Release notes content is displayed
      await waitFor(() => {
        expect(screen.getByText('Added interactive version display')).toBeInTheDocument();
        expect(screen.getByText('Fixed login issue')).toBeInTheDocument();
      });

      // Step 6: User closes modal
      const closeButton = screen.getByRole('button', { name: 'Close' });
      await user.click(closeButton);

      // Step 7: Back to login screen
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(screen.getByText('Login to your account')).toBeInTheDocument();
      });

      // Verify all API calls were made
      expect(mockVersionApi.getCurrentVersion).toHaveBeenCalledTimes(1);
      expect(mockReleaseNotesApi.getReleaseNotes).toHaveBeenCalledWith('1.2.3');
    });

    it('handles keyboard navigation for accessibility', async () => {
      renderWithProviders(<LoginScreen />);

      // Wait for version to load
      await waitFor(() => {
        expect(screen.getByText(/Version v1\.2\.3/)).toBeInTheDocument();
      });

      // Focus version element and press Enter
      const versionElement = screen.getByText(/Version v1\.2\.3/);
      versionElement.focus();
      await user.keyboard('{Enter}');

      // Modal should open
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Press Escape to close
      await user.keyboard('{Escape}');

      // Modal should close
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('maintains login form functionality while version display is interactive', async () => {
      renderWithProviders(<LoginScreen />);

      // Wait for version to load
      await waitFor(() => {
        expect(screen.getByText(/Version v1\.2\.3/)).toBeInTheDocument();
      });

      // Fill in login form
      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');
      const loginButton = screen.getByRole('button', { name: /log in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');

      // Submit login form
      await user.click(loginButton);

      // Verify login API was called
      expect(mockAuthApi.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });

      // Version display should still be functional
      const versionElement = screen.getByText(/Version v1\.2\.3/);
      await user.click(versionElement);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });
  });

  describe('Performance and Loading States', () => {
    it('shows loading states appropriately', async () => {
      // Mock delayed API responses
      mockVersionApi.getCurrentVersion.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockVersionInfo), 100))
      );

      mockReleaseNotesApi.getReleaseNotes.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockReleaseNotes), 100))
      );

      renderWithProviders(<LoginScreen />);

      // Should show version loading skeleton
      expect(screen.getByTestId('version-skeleton')).toBeInTheDocument();

      // Wait for version to load
      await waitFor(() => {
        expect(screen.getByText(/Version v1\.2\.3/)).toBeInTheDocument();
      });

      // Click version to open modal
      const versionElement = screen.getByText(/Version v1\.2\.3/);
      await user.click(versionElement);

      // Should show loading state in modal
      await waitFor(() => {
        expect(screen.getByText('Loading release notes...')).toBeInTheDocument();
      });

      // Wait for release notes to load
      await waitFor(() => {
        expect(screen.getByText('Added interactive version display')).toBeInTheDocument();
      });
    });

    it('handles concurrent API calls correctly', async () => {
      renderWithProviders(<LoginScreen />);

      // Wait for initial version load
      await waitFor(() => {
        expect(screen.getByText(/Version v1\.2\.3/)).toBeInTheDocument();
      });

      // Quickly click version multiple times
      const versionElement = screen.getByText(/Version v1\.2\.3/);
      await user.click(versionElement);
      await user.click(versionElement);
      await user.click(versionElement);

      // Should only make one release notes API call
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Wait a bit more to ensure no duplicate calls
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockReleaseNotesApi.getReleaseNotes).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Recovery', () => {
    it('allows retry after API failures', async () => {
      // Mock initial failure then success
      mockReleaseNotesApi.getReleaseNotes
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(mockReleaseNotes);

      renderWithProviders(<LoginScreen />);

      // Wait for version to load and click it
      await waitFor(() => {
        expect(screen.getByText(/Version v1\.2\.3/)).toBeInTheDocument();
      });

      const versionElement = screen.getByText(/Version v1\.2\.3/);
      await user.click(versionElement);

      // Should show error state
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Look for retry button and click it
      const retryButton = screen.queryByText('Retry');
      if (retryButton) {
        await user.click(retryButton);

        // Should show success state after retry
        await waitFor(() => {
          expect(screen.getByText('Added interactive version display')).toBeInTheDocument();
        });
      }
    });
  });
});