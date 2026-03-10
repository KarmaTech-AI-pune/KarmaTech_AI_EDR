import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
vi.unmock('axios');

import { HistoryLoggingService } from './historyLoggingService';

// Mock the dummyapi module
vi.mock('../dummyapi/dummyOpportunityHistoryApi', () => ({
  addOpportunityHistory: vi.fn().mockResolvedValue({ id: 1, opportunityId: 1, description: 'test', date: '2023-01-01' })
}));

import { addOpportunityHistory } from '../dummyapi/dummyOpportunityHistoryApi';

describe('HistoryLoggingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('logNewProject', () => {
    it('creates history entry with correct description', async () => {
      await HistoryLoggingService.logNewProject(1, 'Project X', 'John');
      expect(addOpportunityHistory).toHaveBeenCalledWith(
        expect.objectContaining({
          opportunityId: 1,
          description: 'New project "Project X" created by John'
        })
      );
    });
  });

  describe('logSentOpportunityForApproval', () => {
    it('creates entry with comments', async () => {
      await HistoryLoggingService.logSentOpportunityForApproval(1, 'John', 'Jane', 'Please review');
      expect(addOpportunityHistory).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'Opportunity sent for approval to Jane by John. Comments: Please review'
        })
      );
    });

    it('creates entry without comments', async () => {
      await HistoryLoggingService.logSentOpportunityForApproval(1, 'John', 'Jane');
      expect(addOpportunityHistory).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'Opportunity sent for approval to Jane by John'
        })
      );
    });
  });

  describe('logApprovalDecision', () => {
    it('logs approval with comments', async () => {
      await HistoryLoggingService.logApprovalDecision(1, 'approved', 'Jane', 'Good');
      expect(addOpportunityHistory).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'Opportunity approved by Jane. Comments: Good'
        })
      );
    });

    it('logs rejection without comments', async () => {
      await HistoryLoggingService.logApprovalDecision(1, 'rejected', 'Jane');
      expect(addOpportunityHistory).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'Opportunity rejected by Jane'
        })
      );
    });
  });

  describe('logSentForReview', () => {
    it('logs correctly', async () => {
      await HistoryLoggingService.logSentForReview(1, 'John', 'Jane');
      expect(addOpportunityHistory).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'Opportunity sent for review to Jane by John'
        })
      );
    });
  });

  describe('logReviewDecision', () => {
    it('logs correctly', async () => {
      await HistoryLoggingService.logReviewDecision(1, 'approved', 'Jane');
      expect(addOpportunityHistory).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'Review approved by Jane'
        })
      );
    });
  });

  describe('logStatusChange', () => {
    it('logs correctly', async () => {
      await HistoryLoggingService.logStatusChange(1, 'Draft', 'Submitted', 'John');
      expect(addOpportunityHistory).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'Status changed from "Draft" to "Submitted" by John'
        })
      );
    });
  });

  describe('logCustomEvent', () => {
    it('logs with details', async () => {
      await HistoryLoggingService.logCustomEvent(1, 'Edited', 'John', 'Changed name');
      expect(addOpportunityHistory).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'Edited by John. Details: Changed name'
        })
      );
    });

    it('logs without details', async () => {
      await HistoryLoggingService.logCustomEvent(1, 'Viewed', 'John');
      expect(addOpportunityHistory).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'Viewed by John'
        })
      );
    });
  });

  describe('error handling', () => {
    it('throws when addOpportunityHistory fails', async () => {
      vi.mocked(addOpportunityHistory).mockRejectedValueOnce(new Error('Network error'));
      await expect(HistoryLoggingService.logNewProject(1, 'P', 'U')).rejects.toThrow('Network error');
    });
  });
});
