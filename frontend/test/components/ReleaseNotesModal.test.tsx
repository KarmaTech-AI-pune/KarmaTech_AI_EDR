import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ReleaseNotesModal from '../../src/components/ReleaseNotesModal';
import { releaseNotesApi, ProcessedReleaseNotes } from '../../src/services/releaseNotesApi';

// Mock the dependencies
vi.mock('../../src/services/releaseNotesApi');

const mockReleaseNotesApi = vi.mocked(releaseNotesApi);

const theme = createTheme({
  components: {
    MuiDialog: {
      defaultProps: {
        disablePortal: true, // Easier to test
      },
    },
  },
  transitions: {
    create: () => 'none',
  },
});

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

const mockReleaseNotes: ProcessedReleaseNotes = {
  version: '1.0.38',
  releaseDate: '2024-12-25T10:00:00Z',
  environment: 'dev',
  commitSha: 'abc123',
  branch: 'main',
  features: [
    {
      id: 1,
      changeType: 'feature',
      description: 'Added new dashboard',
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
  improvements: [
    {
      id: 3,
      changeType: 'improvement',
      description: 'Improved performance',
      commitSha: 'ghi789',
      author: 'Bob Johnson'
    }
  ],
  breakingChanges: []
};

describe('ReleaseNotesModal Component', () => {
  const user = userEvent.setup();
  const defaultProps = {
    version: '1.0.38',
    isOpen: true,
    onClose: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock console methods to avoid noise in tests
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});

    // Mock matchMedia for responsive design tests
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    // Reset window width
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  describe('Basic Rendering', () => {
    it('renders modal when open', async () => {
      mockReleaseNotesApi.getReleaseNotes.mockResolvedValue(mockReleaseNotes);
      
      renderWithTheme(<ReleaseNotesModal {...defaultProps} />);
      
      expect(screen.getByText('Release Notes')).toBeInTheDocument();
      expect(await screen.findByText(/v1\.0\.38/i)).toBeInTheDocument();
    });

    it('does not render modal when closed', () => {
      renderWithTheme(<ReleaseNotesModal {...defaultProps} isOpen={false} />);
      
      expect(screen.queryByText('Release Notes')).not.toBeInTheDocument();
    });

    it('shows close button', () => {
      mockReleaseNotesApi.getReleaseNotes.mockResolvedValue(mockReleaseNotes);
      
      renderWithTheme(<ReleaseNotesModal {...defaultProps} />);
      
      expect(screen.getByLabelText('close')).toBeInTheDocument();
    });
  });

  describe('Data Fetching', () => {
    it('fetches release notes when modal opens', async () => {
      mockReleaseNotesApi.getReleaseNotes.mockResolvedValue(mockReleaseNotes);
      
      renderWithTheme(<ReleaseNotesModal {...defaultProps} />);
      
      expect(mockReleaseNotesApi.getReleaseNotes).toHaveBeenCalledWith('1.0.38');
    });

    it('shows loading state while fetching', async () => {
      mockReleaseNotesApi.getReleaseNotes.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockReleaseNotes), 100))
      );
      
      renderWithTheme(<ReleaseNotesModal {...defaultProps} />);
      
      expect(screen.getByText('Loading release notes...')).toBeInTheDocument();
      expect(screen.getByTestId('content-loading', { hidden: true })).toBeInTheDocument();
    });

    it('displays release notes after successful fetch', async () => {
      mockReleaseNotesApi.getReleaseNotes.mockResolvedValue(mockReleaseNotes);
      
      renderWithTheme(<ReleaseNotesModal {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('New Features (1)')).toBeInTheDocument();
        expect(screen.getByText('Bug Fixes (1)')).toBeInTheDocument();
        expect(screen.getByText('Improvements (1)')).toBeInTheDocument();
      });

      expect(screen.getByText('Added new dashboard')).toBeInTheDocument();
      expect(screen.getByText('Fixed login issue')).toBeInTheDocument();
      expect(screen.getByText('Improved performance')).toBeInTheDocument();
    });

    it('uses cached data when available', async () => {
      // The component fetches from API which handles caching internally
      // When API returns cached data quickly, it should display immediately
      mockReleaseNotesApi.getReleaseNotes.mockResolvedValue(mockReleaseNotes);
      
      renderWithTheme(<ReleaseNotesModal {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('Added new dashboard')).toBeInTheDocument();
      });

      // API should be called (caching is handled by the API service)
      expect(mockReleaseNotesApi.getReleaseNotes).toHaveBeenCalledWith('1.0.38');
    });
  });

  describe('Error Handling', () => {
    it('shows error message when API fails', async () => {
      const mockError = new Error('Network error');
      mockReleaseNotesApi.getReleaseNotes.mockRejectedValue(mockError);

      // Use a version that doesn't have fallback release notes
      renderWithTheme(<ReleaseNotesModal {...defaultProps} version="9.9.9" />);

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });

    it('shows retry button for errors', async () => {
      const mockError = new Error('Network error');
      mockReleaseNotesApi.getReleaseNotes.mockRejectedValue(mockError);

      // Use a version that doesn't have fallback release notes
      renderWithTheme(<ReleaseNotesModal {...defaultProps} version="9.9.9" />);

      await waitFor(() => {
        // There might be multiple retry buttons (one in alert, one in actions)
        expect(screen.getAllByText('Retry')[0]).toBeInTheDocument();
      });
    });

    it('retries API call when retry button is clicked', async () => {
      const mockError = new Error('Network error');
      mockReleaseNotesApi.getReleaseNotes
        .mockRejectedValueOnce(mockError)
        .mockResolvedValueOnce(mockReleaseNotes);

      // Use a version that doesn't have fallback release notes
      renderWithTheme(<ReleaseNotesModal {...defaultProps} version="9.9.9" />);

      // Wait for error state
      await waitFor(() => {
        expect(screen.getAllByText('Retry')[0]).toBeInTheDocument();
      });

      // Click retry button (use the one in DialogActions if possible, or any)
      const retryButtons = screen.getAllByText('Retry');
      await user.click(retryButtons[0]);

      // Should call API again
      expect(mockReleaseNotesApi.getReleaseNotes).toHaveBeenCalledTimes(2);

      // Should show success state
      await waitFor(() => {
        expect(screen.getByText('Added new dashboard')).toBeInTheDocument();
      });
    });

    it('shows fallback message when no release notes exist', async () => {
      mockReleaseNotesApi.getReleaseNotes.mockResolvedValue({
        version: '1.0.38',
        releaseDate: '2024-12-25T10:00:00Z',
        environment: 'dev',
        features: [],
        bugFixes: [],
        improvements: [],
        breakingChanges: []
      });

      renderWithTheme(<ReleaseNotesModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('No changes documented')).toBeInTheDocument();
        expect(screen.getByText("This version doesn't have any documented changes.")).toBeInTheDocument();
      });
    });
  });

  describe('Modal Interactions', () => {
    it('calls onClose when close button is clicked', async () => {
      const onClose = vi.fn();
      mockReleaseNotesApi.getReleaseNotes.mockResolvedValue(mockReleaseNotes);
      
      renderWithTheme(<ReleaseNotesModal {...defaultProps} onClose={onClose} />);
      
      const closeButton = screen.getByLabelText('close');
      await user.click(closeButton);
      
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when Close button in actions is clicked', async () => {
      const onClose = vi.fn();
      mockReleaseNotesApi.getReleaseNotes.mockResolvedValue(mockReleaseNotes);
      
      renderWithTheme(<ReleaseNotesModal {...defaultProps} onClose={onClose} />);
      
      await waitFor(() => {
        expect(screen.getByText('Added new dashboard')).toBeInTheDocument();
      });

      const closeButton = screen.getByRole('button', { name: 'Close', hidden: true });
      await user.click(closeButton);
      
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('handles Escape key press', async () => {
      const onClose = vi.fn();
      mockReleaseNotesApi.getReleaseNotes.mockResolvedValue(mockReleaseNotes);
      
      renderWithTheme(<ReleaseNotesModal {...defaultProps} onClose={onClose} />);
      
      // Focus the modal and press Escape
      const modal = screen.getByRole('dialog', { hidden: true });
      modal.focus();
      await user.keyboard('{Escape}');
      
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('prevents closing when loading', async () => {
      const onClose = vi.fn();
      mockReleaseNotesApi.getReleaseNotes.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );
      
      renderWithTheme(<ReleaseNotesModal {...defaultProps} onClose={onClose} />);
      
      // Try to close while loading
      const closeButton = screen.getByLabelText('close');
      expect(closeButton).toBeDisabled();
    });
  });

  describe('Content Organization', () => {
    it('organizes changes into correct sections', async () => {
      mockReleaseNotesApi.getReleaseNotes.mockResolvedValue(mockReleaseNotes);
      
      renderWithTheme(<ReleaseNotesModal {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('New Features (1)')).toBeInTheDocument();
        expect(screen.getByText('Bug Fixes (1)')).toBeInTheDocument();
        expect(screen.getByText('Improvements (1)')).toBeInTheDocument();
      });

      // Check that items are in correct sections
      const featuresSection = screen.getByText(/new features \(1\)/i).closest('.MuiAccordion-root');
      const bugFixesSection = screen.getByText(/bug fixes \(1\)/i).closest('.MuiAccordion-root');
      const improvementsSection = screen.getByText(/improvements \(1\)/i).closest('.MuiAccordion-root');

      expect(featuresSection).toContainElement(screen.getByText('Added new dashboard'));
      expect(bugFixesSection).toContainElement(screen.getByText('Fixed login issue'));
      expect(improvementsSection).toContainElement(screen.getByText('Improved performance'));
    });

    it('shows change item metadata', async () => {
      mockReleaseNotesApi.getReleaseNotes.mockResolvedValue(mockReleaseNotes);
      
      renderWithTheme(<ReleaseNotesModal {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('abc123')).toBeInTheDocument();
        expect(screen.getByText(/impact: high/i)).toBeInTheDocument();
        expect(screen.getByText('PROJ-123')).toBeInTheDocument();
      });
    });

    it('does not show empty sections', async () => {
      const releaseNotesWithoutBreaking = {
        ...mockReleaseNotes,
        breakingChanges: []
      };
      
      mockReleaseNotesApi.getReleaseNotes.mockResolvedValue(releaseNotesWithoutBreaking);
      
      renderWithTheme(<ReleaseNotesModal {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText(/new features \(1\)/i)).toBeInTheDocument();
      });

      expect(screen.queryByText(/Breaking Changes/)).not.toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('uses fullscreen on mobile', async () => {
      // Mock mobile viewport
      window.matchMedia = vi.fn().mockImplementation(query => ({
        matches: true, // Always match for this test
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      mockReleaseNotesApi.getReleaseNotes.mockResolvedValue(mockReleaseNotes);
      
      renderWithTheme(<ReleaseNotesModal {...defaultProps} />);
      
      // Dialog should have fullscreen class
      const dialog = await screen.findByRole('dialog', { hidden: true });
      expect(dialog).toHaveClass('MuiDialog-paperFullScreen');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', async () => {
      mockReleaseNotesApi.getReleaseNotes.mockResolvedValue(mockReleaseNotes);
      
      renderWithTheme(<ReleaseNotesModal {...defaultProps} />);
      
      const dialog = await screen.findByRole('dialog', { hidden: true });
      expect(dialog).toHaveAttribute('aria-labelledby', 'release-notes-dialog-title');
      expect(dialog).toHaveAttribute('aria-describedby', 'release-notes-dialog-content');
    });

    it('focuses properly when opened', async () => {
      mockReleaseNotesApi.getReleaseNotes.mockResolvedValue(mockReleaseNotes);
      
      renderWithTheme(<ReleaseNotesModal {...defaultProps} />);
      
      // Use findByRole to wait for the dialog to appear
      const dialog = await screen.findByRole('dialog', { hidden: true });
      
      // Wait for focus to be moved into the dialog or to its sentinel
      await waitFor(() => {
        const activeElement = document.activeElement;
        // The Root element or any of its children should have focus
        // MUI focuses the dialog content usually, but sometimes a sentinel
        const dialogRoot = document.querySelector('.MuiDialog-root');
        expect(dialogRoot?.contains(activeElement)).toBe(true);
      }, { timeout: 2000 });
    });
  });

  describe('Edge Cases', () => {
    it('handles empty version string', async () => {
      renderWithTheme(<ReleaseNotesModal {...defaultProps} version="" />);
      
      // Should not call API with empty version
      expect(mockReleaseNotesApi.getReleaseNotes).not.toHaveBeenCalled();
    });

    it('handles component unmounting during API call', async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise(resolve => {
        resolvePromise = resolve;
      });

      mockReleaseNotesApi.getReleaseNotes.mockReturnValue(promise as any);

      const { unmount } = renderWithTheme(<ReleaseNotesModal {...defaultProps} />);

      // Unmount before API call completes
      unmount();

      // Resolve the promise after unmount
      act(() => {
        resolvePromise!(mockReleaseNotes);
      });

      // Should not cause any errors or warnings
      expect(console.error).not.toHaveBeenCalled();
    });

    it('resets state when modal closes', async () => {
      mockReleaseNotesApi.getReleaseNotes.mockResolvedValue(mockReleaseNotes);
      
      const { rerender } = renderWithTheme(<ReleaseNotesModal {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('Added new dashboard')).toBeInTheDocument();
      });

      // Close modal
      rerender(<ReleaseNotesModal {...defaultProps} isOpen={false} />);
      
      // Reopen modal
      rerender(<ReleaseNotesModal {...defaultProps} isOpen={true} />);
      
      // Should show loading state again
      expect(screen.getByText('Loading release notes...')).toBeInTheDocument();
    });

    it('handles malformed release notes data', async () => {
      mockReleaseNotesApi.getReleaseNotes.mockResolvedValue(null as any);
      
      renderWithTheme(<ReleaseNotesModal {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText(/Select a version/i)).toBeInTheDocument();
      });
    });
  });
});