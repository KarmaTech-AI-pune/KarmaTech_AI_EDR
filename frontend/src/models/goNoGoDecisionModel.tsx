import { GoNoGoStatus, TypeOfBid } from "./types";

export interface GoNoGoDecisionPayload {
  HeaderInfo: {
    TypeOfBid: TypeOfBid;
    Sector: string;
    TenderFee: number;
    Emd: number;
    Office: string;
    BdHead: string;
  };
  ScoringCriteria: {
    MarketingPlan: { Score: number; Comments: string; ScoringDescriptionId: number; };
    ClientRelationship: { Score: number; Comments: string; ScoringDescriptionId: number; };
    ProjectKnowledge: { Score: number; Comments: string; ScoringDescriptionId: number; };
    TechnicalEligibility: { Score: number; Comments: string; ScoringDescriptionId: number; };
    FinancialEligibility: { Score: number; Comments: string; ScoringDescriptionId: number; };
    StaffAvailability: { Score: number; Comments: string; ScoringDescriptionId: number; };
    CompetitionAssessment: { Score: number; Comments: string; ScoringDescriptionId: number; };
    CompetitivePosition: { Score: number; Comments: string; ScoringDescriptionId: number; };
    FutureWorkPotential: { Score: number; Comments: string; ScoringDescriptionId: number; };
    Profitability: { Score: number; Comments: string; ScoringDescriptionId: number; };
    BidSchedule: { Score: number; Comments: string; ScoringDescriptionId: number; };
    ResourceAvailability: { Score: number; Comments: string; ScoringDescriptionId: number; };
  };
  Summary: {
    TotalScore: number;
    Status: GoNoGoStatus;
    DecisionComments: string;
    ActionPlan: string;
  };
  MetaData: {
    OpprotunityId: number;
    Id?: number;
    CompletedDate: string;
    CompletedBy: string;
    CreatedBy: string;
  };
}

export interface HeaderInformation {
  bidType: TypeOfBid;
  sector: string;
  tenderFee: number;
  emdAmount: number;
  office: string;
  bdHead: string;
}

export interface GoNoGoDecision {
  id?: number;
  bidType: TypeOfBid;
  sector: string;
  bdHead: string;
  office: string;
  regionalBDHead?: string;
  region?: string;
  typeOfClient?: string;
  tenderFee: number;
  emdAmount: number;
  totalScore: number;
  status: GoNoGoStatus;
  opportunityId: number | null;
  projectId?: number;

  // Scoring fields
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
  bidScheduleScore: number;
  bidScheduleComments: string;
  resourceAvailabilityScore: number;
  resourceAvailabilityComments: string;

  // Metadata
  completedDate?: string;
  completedBy?: string;
  createdAt?: string;
  createdBy?: string;
  lastModifiedAt?: string;
  lastModifiedBy?: string;
  decisionComments?: string;
  actionPlan?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
  currentRole: string;
}
