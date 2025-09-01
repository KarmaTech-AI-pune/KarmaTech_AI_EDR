import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import BidVersionHistory from './BidVersionHistory';
import { BidPreparationStatus, BidVersionHistory as BidVersionHistoryType } from '../../dummyapi/bidVersionHistoryApi';
import { getStatusLabel } from '../../utils/statusUtils';
import { format } from 'date-fns';

// Mock external dependencies
vi.mock('../../utils/statusUtils', () => ({
  getStatusLabel: vi.fn((status: BidPreparationStatus) => status),
}));

vi.mock('date-fns', async (importOriginal) => {
  const actual = await importOriginal() as typeof import('date-fns');
  return {
    ...actual,
    format: vi.fn((date: Date | number, formatStr: string) => {
      if (typeof date === 'number') {
        date = new Date(date);
      }
      if (formatStr === 'dd/MM/yyyy HH:mm') {
        return `formatted-${date.toISOString()}`;
      }
      return actual.format(date, formatStr);
    }),
  };
});

// Type assertions for mocked functions
const mockGetStatusLabel = vi.mocked(getStatusLabel);
const mockFormat = vi.mocked(format);

const mockVersionHistory: BidVersionHistoryType[] = [
  {
    id: 1, // Changed to number
    version: 1,
    status: BidPreparationStatus.Draft,
    comments: 'Initial draft',
    modifiedBy: 'User A',
    modifiedDate: new Date('2023-01-01T10:00:00Z'),
  },
  {
    id: 2, // Changed to number
    version: 2,
    status: BidPreparationStatus.PendingApproval,
    comments: 'Submitted for approval',
    modifiedBy: 'User B',
    modifiedDate: new Date('2023-01-02T11:00:00Z'),
  },
  {
    id: 3, // Changed to number
    version: 3,
    status: BidPreparationStatus.Approved,
    comments: 'Approved by RD',
    modifiedBy: 'User C',
    modifiedDate: new Date('2023-01-03T12:00:00Z'),
  },
  {
    id: 4, // Changed to number
    version: 4,
    status: BidPreparationStatus.Rejected,
    comments: 'Rejected by RD',
    modifiedBy: 'User D',
    modifiedDate: new Date('2023-01-04T13:00:00Z'),
  },
];

describe('BidVersionHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetStatusLabel.mockImplementation((status: BidPreparationStatus) => status.toString()); // Return string representation
    mockFormat.mockImplementation((date: Date | number, formatStr: string) => {
      if (typeof date === 'number') {
        date = new Date(date);
      }
      if (formatStr === 'dd/MM/yyyy HH:mm') {
        return `formatted-${date.toISOString()}`;
      }
      return date.toISOString(); // Fallback for other formats if needed
    });
  });

  it('should render version history table with data', () => {
    render(<BidVersionHistory versionHistory={mockVersionHistory} />);

    expect(screen.getByText('Version History')).toBeInTheDocument();
    expect(screen.getByText('Version')).toBeInTheDocument();
    expect(screen.getByText('Modified By')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Modified Date')).toBeInTheDocument();
    expect(screen.getByText('Comments')).toBeInTheDocument();

    // Check for each version entry
    mockVersionHistory.forEach((version) => {
      expect(screen.getByText(version.version.toString())).toBeInTheDocument();
      expect(screen.getByText(version.modifiedBy || '')).toBeInTheDocument();
      expect(screen.getByText(version.status)).toBeInTheDocument();
      expect(screen.getByText(`formatted-${version.modifiedDate?.toISOString()}`)).toBeInTheDocument();
      expect(screen.getByText(version.comments || '')).toBeInTheDocument();
    });
  });

  it('should display "No Data Found" when versionHistory is empty', () => {
    render(<BidVersionHistory versionHistory={[]} />);

    expect(screen.getByText('No Data Found')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('should apply correct chip colors based on status', () => {
    render(<BidVersionHistory versionHistory={mockVersionHistory} />);

    expect(screen.getByText(BidPreparationStatus.Draft)).toHaveClass('MuiChip-colorDefault');
    expect(screen.getByText(BidPreparationStatus.PendingApproval)).toHaveClass('MuiChip-colorWarning');
    expect(screen.getByText(BidPreparationStatus.Approved)).toHaveClass('MuiChip-colorSuccess');
    expect(screen.getByText(BidPreparationStatus.Rejected)).toHaveClass('MuiChip-colorError');
  });

  it('should handle missing modifiedBy and comments gracefully', () => {
    const partialHistory: BidVersionHistoryType[] = [
      {
        id: 5, // Changed to number
        version: 5,
        status: BidPreparationStatus.Draft,
        modifiedDate: new Date('2023-01-05T14:00:00Z'),
        modifiedBy: '', // Added missing property
        comments: '', // Added missing property
      },
    ];
    render(<BidVersionHistory versionHistory={partialHistory} />);

    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('Draft')).toBeInTheDocument();
    expect(screen.getByText(`formatted-${partialHistory[0].modifiedDate?.toISOString()}`)).toBeInTheDocument();
    expect(screen.queryByText('undefined')).not.toBeInTheDocument(); // Ensure undefined is not rendered
  });
});
