import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getEnhancedWorkflowStatus } from './workflowStatusFormatter';

// Mock the dummyOpporunityWorkflow module
vi.mock('../dummyapi/database/dummyOpporunityWorkflow', () => ({
  getWorkflowStatusById: vi.fn((id: number) => {
    const statuses: Record<number, { status: string }> = {
      1: { status: 'Initial' },
      2: { status: 'Sent for Review' },
      3: { status: 'Review Changes' },
      4: { status: 'Sent for Approval' },
      5: { status: 'Approval Changes' },
      6: { status: 'Approved' },
    };
    return statuses[id] || null;
  }),
}));

describe('getEnhancedWorkflowStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns "Initial" for status 1', () => {
    expect(getEnhancedWorkflowStatus(1, null, null, null, null)).toBe('Initial');
  });

  it('returns reviewer info for status 2 when reviewer present', () => {
    const result = getEnhancedWorkflowStatus(2, 'John', 'Regional Manager', null, null);
    expect(result).toBe('Awaiting Review at John (Regional Manager)');
  });

  it('returns fallback for status 2 when no reviewer', () => {
    expect(getEnhancedWorkflowStatus(2, null, null, null, null)).toBe('Sent for Review');
  });

  it('returns reviewer rejection for status 3 when reviewer present', () => {
    const result = getEnhancedWorkflowStatus(3, 'Jane', 'Regional Manager', null, null);
    expect(result).toBe('Rejected by Jane (Regional Manager)');
  });

  it('returns fallback for status 3 when no reviewer', () => {
    expect(getEnhancedWorkflowStatus(3, null, null, null, null)).toBe('Review Changes Required');
  });

  it('returns approver info for status 4 when approver present', () => {
    const result = getEnhancedWorkflowStatus(4, null, null, 'Alice', 'Regional Director');
    expect(result).toBe('Awaiting Approval at Alice (Regional Director)');
  });

  it('returns fallback for status 4 when no approver', () => {
    expect(getEnhancedWorkflowStatus(4, null, null, null, null)).toBe('Sent for Approval');
  });

  it('returns approver rejection for status 5 when approver present', () => {
    const result = getEnhancedWorkflowStatus(5, null, null, 'Bob', 'Regional Director');
    expect(result).toBe('Rejected by Bob (Regional Director)');
  });

  it('returns fallback for status 5 when no approver', () => {
    expect(getEnhancedWorkflowStatus(5, null, null, null, null)).toBe('Approval Changes Required');
  });

  it('returns approved by for status 6 when approver present', () => {
    const result = getEnhancedWorkflowStatus(6, null, null, 'Charlie', 'Regional Director');
    expect(result).toBe('Approved by Charlie (Regional Director)');
  });

  it('returns fallback for status 6 when no approver', () => {
    expect(getEnhancedWorkflowStatus(6, null, null, null, null)).toBe('Approved');
  });

  it('returns "Unknown Status" for unrecognized status ID', () => {
    expect(getEnhancedWorkflowStatus(99, null, null, null, null)).toBe('Unknown Status');
  });

  it('uses default designation when reviewer designation is null', () => {
    const result = getEnhancedWorkflowStatus(2, 'John', null, null, null);
    expect(result).toBe('Awaiting Review at John (Regional Manager)');
  });

  it('uses default designation when approver designation is null', () => {
    const result = getEnhancedWorkflowStatus(4, null, null, 'Alice', null);
    expect(result).toBe('Awaiting Approval at Alice (Regional Director)');
  });
});
