import { GoNoGoStatus, TypeOfBid } from "./types";

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
  opprotunityId: number | null;
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
