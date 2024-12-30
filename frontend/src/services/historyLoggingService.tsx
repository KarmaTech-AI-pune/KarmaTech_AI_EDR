import { addOpportunityHistory } from '../dummyapi/dummyOpportunityHistoryApi';
import { OpportunityHistory } from '../models';

export class HistoryLoggingService {
    private static formatDate(): string {
        return new Date().toISOString();
    }

    private static async createHistoryEntry(
        opportunityId: string,
        description: string
    ): Promise<OpportunityHistory> {
        const historyEntry: Omit<OpportunityHistory, 'id'> = {
            opportunityId,
            date: this.formatDate(),
            description
        };

        try {
            return await addOpportunityHistory(historyEntry);
        } catch (error) {
            console.error('Failed to create history entry:', error);
            throw error;
        }
    }

    static async logNewProject(
        opportunityId: string,
        projectName: string,
        createdBy: string
    ): Promise<OpportunityHistory> {
        const description = `New project "${projectName}" created by ${createdBy}`;
        return await this.createHistoryEntry(opportunityId, description);
    }

    static async logSentOpportunityForApproval(
        opportunityId: string,
        sentBy: string,
        approver: string,
        comments?: string
    ): Promise<OpportunityHistory> {
        const description = comments
            ? `Opportunity sent for approval to ${approver} by ${sentBy}. Comments: ${comments}`
            : `Opportunity sent for approval to ${approver} by ${sentBy}`;
        return await this.createHistoryEntry(opportunityId, description);
    }

    static async logApprovalDecision(
        opportunityId: string,
        decision: 'approved' | 'rejected',
        decidedBy: string,
        comments?: string
    ): Promise<OpportunityHistory> {
        const description = comments
            ? `Opportunity ${decision} by ${decidedBy}. Comments: ${comments}`
            : `Opportunity ${decision} by ${decidedBy}`;
        return await this.createHistoryEntry(opportunityId, description);
    }

    static async logSentForReview(
        opportunityId: string,
        sentBy: string,
        reviewer: string,
        comments?: string
    ): Promise<OpportunityHistory> {
        const description = comments
            ? `Opportunity sent for review to ${reviewer} by ${sentBy}. Comments: ${comments}`
            : `Opportunity sent for review to ${reviewer} by ${sentBy}`;
        return await this.createHistoryEntry(opportunityId, description);
    }

    static async logReviewDecision(
        opportunityId: string,
        decision: 'approved' | 'rejected',
        reviewedBy: string,
        comments?: string
    ): Promise<OpportunityHistory> {
        const description = comments
            ? `Review ${decision} by ${reviewedBy}. Comments: ${comments}`
            : `Review ${decision} by ${reviewedBy}`;
        return await this.createHistoryEntry(opportunityId, description);
    }

    static async logStatusChange(
        opportunityId: string,
        oldStatus: string,
        newStatus: string,
        changedBy: string
    ): Promise<OpportunityHistory> {
        const description = `Status changed from "${oldStatus}" to "${newStatus}" by ${changedBy}`;
        return await this.createHistoryEntry(opportunityId, description);
    }

    static async logCustomEvent(
        opportunityId: string,
        event: string,
        user: string,
        details?: string
    ): Promise<OpportunityHistory> {
        const description = details
            ? `${event} by ${user}. Details: ${details}`
            : `${event} by ${user}`;
        return await this.createHistoryEntry(opportunityId, description);
    }
}
