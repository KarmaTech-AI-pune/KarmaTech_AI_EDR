import { vi, describe, it, expect } from 'vitest'
import { getStatusLabel } from './statusUtils'
import { BidPreparationStatus } from '../dummyapi/bidVersionHistoryApi'

describe('statusUtils', () => {
  describe('getStatusLabel', () => {
    it('returns "Approved" for BidPreparationStatus.Approved (2)', () => {
      expect(getStatusLabel(BidPreparationStatus.Approved)).toBe('Approved')
    })

    it('returns "Rejected" for BidPreparationStatus.Rejected (3)', () => {
      expect(getStatusLabel(BidPreparationStatus.Rejected)).toBe('Rejected')
    })

    it('returns "Pending Approval" for BidPreparationStatus.PendingApproval (1)', () => {
      expect(getStatusLabel(BidPreparationStatus.PendingApproval)).toBe('Pending Approval')
    })

    it('returns "Draft" for BidPreparationStatus.Draft (0)', () => {
      expect(getStatusLabel(BidPreparationStatus.Draft)).toBe('Draft')
    })

    it('returns "Draft" for unknown status values', () => {
      // Test with a value that is not in the enum
      expect(getStatusLabel(999 as BidPreparationStatus)).toBe('Draft')
    })
  })
})
