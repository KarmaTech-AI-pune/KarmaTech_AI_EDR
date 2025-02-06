import { WorkflowStatus } from './workflowModel';

export enum GoNoGoStatus {
    'Green' = 0,
    'Amber' = 1,
    'Red' = 2
}

export interface GoNoGoDecision {
    projectId: string;
    workflowInstanceId?: string;
    currentVersion?: number;
    workflowStatus?: WorkflowStatus;
    bidType: string;
    sector: string;
    tenderFee: number;
    emdAmount: number;
    // Removed submissionMode
  
    // Rest of the interface remains the same
    marketingPlanScore: number;
    marketingPlanComments: string;
    clientRelationshipScore: number;
    clientRelationshipComments: string;
    projectKnowledgeScore: number;
    projectKnowledgeComments: string;
    technicalEligibilityScore: number;
    technicalEligibilityComments: string;
    financialEligibilityScore: number;
    financialEligibilityComments: string;
    staffAvailabilityScore: number;
    staffAvailabilityComments: string;
    competitionAssessmentScore: number;
    competitionAssessmentComments: string;
    competitivePositionScore: number;
    competitivePositionComments: string;
    futureWorkPotentialScore: number;
    futureWorkPotentialComments: string;
    profitabilityScore: number;
    profitabilityComments: string;
    resourceAvailabilityScore: number;
    resourceAvailabilityComments: string;
    bidScheduleScore: number;
    bidScheduleComments: string;
  
    // Total Score and Decision
    totalScore: number;
    status: GoNoGoStatus;
    decisionComments: string;
  
    // Approval Information
    completedDate: string;
    completedBy: string;
    reviewedDate?: string;
    reviewedBy?: string;
    approvedDate?: string;
    approvedBy?: string;
  
    // Action Plan
    actionPlan?: string;
  
    // Audit Fields
    createdAt: string;
    createdBy: string;
    lastModifiedAt?: string;
    lastModifiedBy?: string;
  }
