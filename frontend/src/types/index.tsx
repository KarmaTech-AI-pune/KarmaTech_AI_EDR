// File: frontend/src/types/index.ts
// Purpose: typescript types

export type screensArrayType = {
    [key : string] : JSX.Element
}

export type User = {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

export type projectManagementAppContextType  = {
    screenState: string,
    setScreenState: React.Dispatch<React.SetStateAction<string>>,
    isAuthenticated: boolean,
    setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>
    user: User | null;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    handleLogout: () => void;
    selectedProject?: Project | null;
    setSelectedProject?: React.Dispatch<React.SetStateAction<Project | null>>;
    currentGoNoGoDecision: GoNoGoDecision | null;
    setCurrentGoNoGoDecision: React.Dispatch<React.SetStateAction<GoNoGoDecision | null>>;
}

export enum ProjectStatus {
  'Opportunity' = 0,
  'Decision Pending' = 1,
  'Cancelled' = 2,
  'Bid Submitted' = 3,
  'Bid Rejected' = 4,
  'Bid Accepted' = 5,
  'In Progress'  = 6,
  'Completed' = 7
}

export type Project = {
  id: number;
  name: string;
  clientName: string;
  clientSector: string;
  sector: string;
  estimatedCost: number;
  startDate?: string;
  endDate?: string;
  status: ProjectStatus;
  progress: number;
  contractType: string;
  currency: string;
  createdAt: string;
  createdBy: string;
  budget?: number;
  priority?: string;
}

export type ProjectFormData = Omit<Project, 'id'>;

export type ProjectItemProps = {
  project: Project;
  onProjectDeleted?: (projectId: number) => void;
  onProjectUpdated?: () => void;
}

export type ProjectFormType = {
  project?: Project;
  onSubmit: (data: ProjectFormData) => void;
  onCancel?: () => void;
}

export type Credentials = {
  username: string;
  password: string;
}

export type LoginResponse = {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

export type OpportunityTracking = {
  id: number;
  projectId: number;
  stage: string;
  strategicRanking: string;
  bidFees?: number;
  emd?: number;
  formOfEMD?: string;
  bidManager: string;
  contactPersonAtClient?: string;
  dateOfSubmission?: string;
  percentageChanceOfProjectHappening?: number;
  percentageChanceOfNJSSuccess?: number;
  likelyCompetition?: string;
  grossRevenue?: number;
  netNJSRevenue?: number;
  followUpComments?: string;
  notes?: string;
  probableQualifyingCriteria?: string;
  month: number;
  year: number;
  trackedBy: string;
  createdAt: string;
  createdBy: string;
  lastModifiedAt?: string;
  lastModifiedBy?: string;
}

export enum GoNoGoStatus {
  'Green' = 0,
  'Amber' = 1,
  'Red' = 2
}

export interface GoNoGoDecision {
  id: number;
  projectId: number;
  bidType: string;
  sector: string;
  tenderFee: number;
  emdAmount: number;
  submissionMode: string;

  // Scoring Criteria
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
  decisionComments?: string;

  // Approval Information
  completedDate: Date;
  completedBy: string;
  reviewedDate?: Date;
  reviewedBy?: string;
  approvedDate?: Date;
  approvedBy?: string;

  // Action Plan
  actionPlan?: string;

  // Audit Fields
  createdAt: Date;
  createdBy: string;
  lastModifiedAt?: Date;
  lastModifiedBy?: string;
}
