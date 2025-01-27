import { OpportunityHistory } from "./opportunityHistoryModel";

// Local type definitions
type OpportunityStage = 'A' | 'B' | 'C' | 'D' | 'E';
type OpportunityTrackingStatus = 
  'Bid Under Preparation' | 
  'Bid Submitted' | 
  'Under Evaluation' | 
  'Awarded' | 
  'Not Awarded';


export interface OpportunityTracking {
  id: number;
  projectId?: number | null;
  stage: OpportunityStage;
  strategicRanking: string;
  bidManagerId?: string;
  reviewManagerId?: string;
  approvalManagerId?: string;
  operation: string;
  workName: string;
  client: string;
  clientSector: string;
  likelyStartDate: Date | string;
  status: OpportunityTrackingStatus;
  currency: string;
  capitalValue: number;
  durationOfProject: number;
  fundingStream: string;
  contractType: string;

  // Optional fields
  bidFees: number;
  emd: number;
  formOfEMD?: string;
  contactPersonAtClient?: string;
  dateOfSubmission?: Date | string;
  percentageChanceOfProjectHappening?: number;
  percentageChanceOfNJSSuccess?: number;
  likelyCompetition?: string;
  grossRevenue: number;
  netNJSRevenue: number;
  followUpComments?: string;
  notes?: string;
  probableQualifyingCriteria?: string;

  // Audit fields
  createdAt: Date | string;
  updatedAt: Date | string;
  createdBy: string;
  updatedBy: string;
  currentHistory?: OpportunityHistory | OpportunityHistory[];
}

// Utility function to convert string dates to Date objects
export function normalizeOpportunityTracking(opp: Partial<OpportunityTracking> | null | undefined): Partial<OpportunityTracking> {
  if (!opp) return {};
  const normalized: Partial<OpportunityTracking> = { ...opp };

  if (opp.likelyStartDate) {
    normalized.likelyStartDate = opp.likelyStartDate instanceof Date 
      ? opp.likelyStartDate 
      : new Date(opp.likelyStartDate);
  }

  if (opp.dateOfSubmission) {
    normalized.dateOfSubmission = opp.dateOfSubmission instanceof Date 
      ? opp.dateOfSubmission 
      : new Date(opp.dateOfSubmission);
  }

  if (opp.createdAt) {
    normalized.createdAt = opp.createdAt instanceof Date 
      ? opp.createdAt 
      : new Date(opp.createdAt);
  }

  if (opp.updatedAt) {
    normalized.updatedAt = opp.updatedAt instanceof Date 
      ? opp.updatedAt 
      : new Date(opp.updatedAt);
  }

  // Normalize currentHistory: convert array to first item if it's an array
  if (opp.currentHistory && Array.isArray(opp.currentHistory)) {
    normalized.currentHistory = opp.currentHistory.length > 0 
      ? opp.currentHistory[0] 
      : undefined;
  }

  return normalized;
}

// Utility function to convert dates to ISO string for API submission
export function prepareOpportunityTrackingForSubmission(opp: Partial<OpportunityTracking> | null | undefined): Partial<OpportunityTracking> {
  if (!opp) return {};
  const prepared: Partial<OpportunityTracking> = { ...opp };

  if (opp.likelyStartDate instanceof Date) {
    prepared.likelyStartDate = opp.likelyStartDate.toISOString().split('T')[0];
  }

  if (opp.dateOfSubmission instanceof Date) {
    prepared.dateOfSubmission = opp.dateOfSubmission.toISOString().split('T')[0];
  }

  if (opp.createdAt instanceof Date) {
    prepared.createdAt = opp.createdAt.toISOString();
  }

  if (opp.updatedAt instanceof Date) {
    prepared.updatedAt = opp.updatedAt.toISOString();
  }

  // Prepare currentHistory: convert single item to array if it exists
  if (opp.currentHistory) {
    prepared.currentHistory = Array.isArray(opp.currentHistory) 
      ? opp.currentHistory.filter(Boolean)  // Remove any undefined/null items
      : [opp.currentHistory];
  }

  return prepared;
}
