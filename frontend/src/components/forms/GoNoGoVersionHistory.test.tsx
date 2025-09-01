import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import GoNoGoVersionHistory from './GoNoGoVersionHistory';
import { GoNoGoVersionDto } from '../../models/goNoGoVersionModel';
import { GoNoGoVersionStatus } from '../../models/workflowModel';

describe('GoNoGoVersionHistory', () => {
  const mockVersions: GoNoGoVersionDto[] = [
    {
      id: 1,
      goNoGoDecisionHeaderId: 1,
      versionNumber: 1,
      formData: JSON.stringify({ Summary: { TotalScore: 30 } }),
      status: GoNoGoVersionStatus.BDM_PENDING,
      createdBy: 'BDM User',
      createdAt: '2023-01-01T10:00:00Z',
    },
    {
      id: 2,
      goNoGoDecisionHeaderId: 1,
      versionNumber: 2,
      formData: JSON.stringify({ Summary: { TotalScore: 60 } }),
      status: GoNoGoVersionStatus.RM_PENDING,
      createdBy: 'RM User',
      createdAt: '2023-01-02T11:00:00Z',
    },
    {
      id: 3,
      goNoGoDecisionHeaderId: 1,
      versionNumber: 3,
      formData: JSON.stringify({ Summary: { TotalScore: 80 } }),
      status: GoNoGoVersionStatus.RD_PENDING,
      createdBy: 'RD User',
      createdAt: '2023-01-03T12:00:00Z',
    },
    {
      id: 4,
      goNoGoDecisionHeaderId: 1,
      versionNumber: 4,
      formData: JSON.stringify({ Summary: { TotalScore: 85 } }),
      status: GoNoGoVersionStatus.RD_APPROVED,
      createdBy: 'RD User',
      createdAt: '2023-01-04T13:00:00Z',
    },
  ];

  const mockOnVersionSelect = vi.fn();
  const mockOnApprove = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render version history correctly', () => {
    render(
      <GoNoGoVersionHistory
        versions={mockVersions}
        currentVersion={2}
        onVersionSelect={mockOnVersionSelect}
        onApprove={mockOnApprove}
        userRole="Regional Manager"
        score={0}
      />
    );

    expect(screen.getByText('Version History')).toBeInTheDocument();
    expect(screen.getByText('Version 1')).toBeInTheDocument();
    expect(screen.getByText('Version 2')).toBeInTheDocument();
    expect(screen.getByText('Version 3')).toBeInTheDocument();
    expect(screen.getByText('Version 4')).toBeInTheDocument();

    // Check if version 2 is selected
    expect(screen.getByText('Version 2').closest('li')).toHaveClass('Mui-selected');

    // Check created by and date
    expect(screen.getByText(/Created by BDM User on/)).toBeInTheDocument();
    expect(screen.getByText(/Created by RM User on/)).toBeInTheDocument();
  });

  it('should call onVersionSelect when a version is clicked', () => {
    render(
      <GoNoGoVersionHistory
        versions={mockVersions}
        currentVersion={1}
        onVersionSelect={mockOnVersionSelect}
        onApprove={mockOnApprove}
        userRole="Business Development Manager"
        score={0}
      />
    );

    fireEvent.click(screen.getByText('Version 3'));
    expect(mockOnVersionSelect).toHaveBeenCalledTimes(1);
    expect(mockOnVersionSelect).toHaveBeenCalledWith(mockVersions[2]);
  });

  it('should show "Sent to Approve" button for BDM_PENDING status if user is BDM', () => {
    render(
      <GoNoGoVersionHistory
        versions={mockVersions}
        currentVersion={1}
        onVersionSelect={mockOnVersionSelect}
        onApprove={mockOnApprove}
        userRole="Business Development Manager"
        score={0}
      />
    );

    const bdmPendingVersion = screen.getByText('Version 1').closest('li');
    expect(bdmPendingVersion).toBeInTheDocument();
    const approveButton = screen.getByRole('button', { name: 'Sent to Approve' });
    expect(approveButton).toBeInTheDocument();
    fireEvent.click(approveButton);
    expect(mockOnApprove).toHaveBeenCalledTimes(1);
    expect(mockOnApprove).toHaveBeenCalledWith(mockVersions[0]);
  });

  it('should show "Sent to Approve" button for RM_PENDING status if user is RM', () => {
    render(
      <GoNoGoVersionHistory
        versions={mockVersions}
        currentVersion={1}
        onVersionSelect={mockOnVersionSelect}
        onApprove={mockOnApprove}
        userRole="Regional Manager"
        score={0}
      />
    );

    const rmPendingVersion = screen.getByText('Version 2').closest('li');
    expect(rmPendingVersion).toBeInTheDocument();
    const approveButton = screen.getByRole('button', { name: 'Sent to Approve' });
    expect(approveButton).toBeInTheDocument();
    fireEvent.click(approveButton);
    expect(mockOnApprove).toHaveBeenCalledTimes(1);
    expect(mockOnApprove).toHaveBeenCalledWith(mockVersions[1]);
  });

  it('should not show "Sent to Approve" button for RD_PENDING status if user is BDM', () => {
    render(
      <GoNoGoVersionHistory
        versions={mockVersions}
        currentVersion={1}
        onVersionSelect={mockOnVersionSelect}
        onApprove={mockOnApprove}
        userRole="Business Development Manager"
        score={0}
      />
    );

    const rdPendingVersion = screen.getByText('Version 3').closest('li');
    expect(rdPendingVersion).toBeInTheDocument();
    expect(rdPendingVersion).not.toContainElement(screen.queryByRole('button', { name: 'Sent to Approve' }));
  });

  it('should not show "Sent to Approve" button for RD_APPROVED status', () => {
    render(
      <GoNoGoVersionHistory
        versions={mockVersions}
        currentVersion={1}
        onVersionSelect={mockOnVersionSelect}
        onApprove={mockOnApprove}
        userRole="Regional Director"
        score={0}
      />
    );

    const rdApprovedVersion = screen.getByText('Version 4').closest('li');
    expect(rdApprovedVersion).toBeInTheDocument();
    expect(rdApprovedVersion).not.toContainElement(screen.queryByRole('button', { name: 'Sent to Approve' }));
  });

  it('should apply correct chip colors based on status', () => {
    render(
      <GoNoGoVersionHistory
        versions={mockVersions}
        currentVersion={1}
        onVersionSelect={mockOnVersionSelect}
        onApprove={mockOnApprove}
        userRole="Business Development Manager"
        score={0}
      />
    );

    expect(screen.getByText('1').closest('.MuiChip-root')).toHaveClass('MuiChip-colorWarning'); // BDM_PENDING
    expect(screen.getByText('2').closest('.MuiChip-root')).toHaveClass('MuiChip-colorWarning'); // RM_PENDING
    expect(screen.getByText('3').closest('.MuiChip-root')).toHaveClass('MuiChip-colorWarning'); // RD_PENDING
    expect(screen.getByText('4').closest('.MuiChip-root')).toHaveClass('MuiChip-colorSuccess'); // RD_APPROVED
  });

  it('should display correct score from formData', () => {
    render(
      <GoNoGoVersionHistory
        versions={mockVersions}
        currentVersion={1}
        onVersionSelect={mockOnVersionSelect}
        onApprove={mockOnApprove}
        userRole="Business Development Manager"
        score={0}
      />
    );

    expect(screen.getByText('Score: 30')).toBeInTheDocument();
    expect(screen.getByText('Score: 60')).toBeInTheDocument();
    expect(screen.getByText('Score: 80')).toBeInTheDocument();
    expect(screen.getByText('Score: 85')).toBeInTheDocument();
  });
});
