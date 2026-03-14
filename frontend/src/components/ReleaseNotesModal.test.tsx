import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ReleaseNotesModal from './ReleaseNotesModal';
import { releaseNotesApi } from '../services/releaseNotesApi';

vi.mock('../services/releaseNotesApi', () => ({
  releaseNotesApi: {
    getReleaseHistory: vi.fn(),
    getReleaseNotes: vi.fn(),
  }
}));

describe('ReleaseNotesModal Component', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    vi.mocked(releaseNotesApi.getReleaseHistory).mockResolvedValue([
      { version: '1.2.0', releaseDate: '2026-02-16' }
    ] as any);
    
    vi.mocked(releaseNotesApi.getReleaseNotes).mockResolvedValue({
      version: '1.2.0',
      releaseDate: '2026-02-16',
      features: [{ id: 1, changeType: 'Feature', description: 'Test newly added feature' }],
      bugFixes: [],
      improvements: [],
      breakingChanges: []
    } as any);
  });

  it('renders correctly when open', async () => {
    render(
      <ReleaseNotesModal version="1.2.0" isOpen={true} onClose={mockOnClose} />
    );

    // Dialog title should be present
    expect(screen.getByText('Release Notes')).toBeInTheDocument();
    
    // Wait for the API to resolve and content to render
    await waitFor(() => {
      expect(screen.getByText('v1.2.0')).toBeInTheDocument();
      expect(screen.getByText('Test newly added feature')).toBeInTheDocument();
    });
  });

  it('does not render when closed', () => {
    render(
      <ReleaseNotesModal version="1.2.0" isOpen={false} onClose={mockOnClose} />
    );

    expect(screen.queryByText('Release Notes')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    render(
      <ReleaseNotesModal version="1.2.0" isOpen={true} onClose={mockOnClose} />
    );

    await waitFor(() => {
      expect(screen.getByText('v1.2.0')).toBeInTheDocument();
    });

    const closeButtons = screen.getAllByRole('button', { name: /close/i });
    fireEvent.click(closeButtons[0]);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
