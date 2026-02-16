import React from 'react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { waitFor } from '@testing-library/react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import BidVersionHistory from './BidVersionHistory';
import { BidPreparationStatus, BidVersionHistory as BidVersionHistoryType } from '../../dummyapi/bidVersionHistoryApi';
import { getStatusLabel } from '../../utils/statusUtils';
import { format } from 'date-fns';

// Mock external dependencies
vi.mock('../../utils/statusUtils', () => ({
  getStatusLabel: vi.fn((status: BidPreparationStatus) => {
    const labels = {
      [BidPreparationStatus.Draft]: 'Draft',
      [BidPreparationStatus.PendingApproval]: 'Pending Approval',
      [BidPreparationStatus.Approved]: 'Approved',
      [BidPreparationStatus.Rejected]: 'Rejected',
    };
    return labels[status] || status.toString();
  }),
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
    id: 101,
    version: 1,
    status: BidPreparationStatus.Draft,
    comments: 'Initial draft',
    modifiedDate: new Date('2023-01-01T10:00:00Z'),
    modifiedBy: 'User A',
  },
  {
    id: 102,
    version: 2,
    status: BidPreparationStatus.PendingApproval,
    comments: 'Submitted for approval',
    modifiedDate: new Date('2023-01-02T10:00:00Z'),
    modifiedBy: 'User B',
  },
  {
    id: 103,
    version: 3,
    status: BidPreparationStatus.Approved,
    comments: 'Approved by RD',
    modifiedBy: 'User C',
    modifiedDate: new Date('2023-01-03T12:00:00Z'),
  },
  {
    id: 104,
    version: 4,
    status: BidPreparationStatus.Rejected,
    comments: 'Rejected by RD',
    modifiedBy: 'User D',
    modifiedDate: new Date('2023-01-04T13:00:00Z'),
  },
];

describe('BidVersionHistory', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetStatusLabel.mockImplementation((status: BidPreparationStatus) => {
      const labels = {
        [BidPreparationStatus.Draft]: 'Draft',
        [BidPreparationStatus.PendingApproval]: 'Pending Approval',
        [BidPreparationStatus.Approved]: 'Approved',
        [BidPreparationStatus.Rejected]: 'Rejected',
      };
      return labels[status] || status.toString();
    });
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
    const versionCells = screen.getAllByTestId('version-cell');
    mockVersionHistory.forEach((version, index) => {
      expect(versionCells[index]).toHaveTextContent(version.version.toString());
      expect(screen.getByText(version.modifiedBy || '')).toBeInTheDocument();
      
      const labels = {
        [BidPreparationStatus.Draft]: 'Draft',
        [BidPreparationStatus.PendingApproval]: 'Pending Approval',
        [BidPreparationStatus.Approved]: 'Approved',
        [BidPreparationStatus.Rejected]: 'Rejected',
      };
      expect(screen.getByText(labels[version.status])).toBeInTheDocument();
      
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

    const statusChips = screen.getAllByTestId('status-chip');
    expect(statusChips[0]).toHaveClass('MuiChip-colorDefault');
    expect(statusChips[1]).toHaveClass('MuiChip-colorWarning');
    expect(statusChips[2]).toHaveClass('MuiChip-colorSuccess');
    expect(statusChips[3]).toHaveClass('MuiChip-colorError');
  });

  it('should handle missing modifiedBy and comments gracefully', async () => {
    const partialHistory: BidVersionHistoryType[] = [
      {
        id: 105,
        version: 5,
        status: BidPreparationStatus.Draft,
        modifiedBy: '',
        comments: '',
        modifiedDate: new Date('2023-01-05T14:00:00Z'),
      },
    ];
    render(<BidVersionHistory versionHistory={partialHistory} />);

    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('Draft')).toBeInTheDocument();
    expect(screen.getByText(`formatted-${partialHistory[0].modifiedDate?.toISOString()}`)).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText('undefined')).not.toBeInTheDocument()); // Ensure undefined is not rendered
  });
});
