import { OpportunityHistory } from "./opportunityHistoryModel";

// Local type definitions
export type OpportunityStage = 'EOI' | 'Shortlisted' | 'Proposal' | 'Awarded' | 'Lost' | string;
type OpportunityTrackingStatus =
  'Bid Under Preparation' | 
  'Bid Submitted' | 
  'Bid Rejected' | 
  'Bid Accepted'  

export interface OpportunityTracking {
  id: number;
  bidNumber?: string;
  projectId?: number | string | null;
  stage?: OpportunityStage;
  strategicRanking?: string;
  partners?: string;
  bidManagerId?: string;
  reviewManagerId?: string;
  approvalManagerId?: string;
  operation?: string;
  workName?: string;
  client?: string;
  clientSector?: string;
  likelyStartDate?: Date | string;
  status?: OpportunityTrackingStatus | string;
  currency?: string;
  capitalValue?: number;
  durationOfProject?: number;
  fundingStream?: string;
  contractType?: string;
  workflowId?: string;

  // Optional fields
  bidFees?: number;
  emd?: number;
  formOfEMD?: string;
  contactPersonAtClient?: string;
  dateOfSubmission?: Date | string;
  percentageChanceOfProjectHappening?: number;
  percentageChanceOfNJSSuccess?: number;
  likelyCompetition?: string;
  grossRevenue?: number;
  netEDRRevenue?: number;
  followUpComments?: string;
  notes?: string;
  probableQualifyingCriteria?: string;
  tentativeFee?: number;
  njseiShare?: number;

  // Audit fields
  createdAt?: Date | string;
  updatedAt?: Date | string;
  createdBy?: string;
  updatedBy?: string;
  approvalComments?: string;
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
    const year = opp.likelyStartDate.getFullYear();
    const month = String(opp.likelyStartDate.getMonth() + 1).padStart(2, '0');
    const day = String(opp.likelyStartDate.getDate()).padStart(2, '0');
    prepared.likelyStartDate = `${year}-${month}-${day}`;
  }

  if (opp.dateOfSubmission instanceof Date) {
    const year = opp.dateOfSubmission.getFullYear();
    const month = String(opp.dateOfSubmission.getMonth() + 1).padStart(2, '0');
    const day = String(opp.dateOfSubmission.getDate()).padStart(2, '0');
    prepared.dateOfSubmission = `${year}-${month}-${day}`;
  }

  if (opp.createdAt instanceof Date) {
    prepared.createdAt = opp.createdAt.toISOString();
  }

  if (opp.updatedAt instanceof Date) {
    prepared.updatedAt = opp.updatedAt.toISOString();
  }

  // Prepare currentHistory: convert single item to array if it exists
  if (opp.currentHistory) {
    // Don't modify currentHistory in the prepared object
    // This avoids type issues with the array conversion
    delete prepared.currentHistory;
    
    // Instead, add it back with the correct type based on the original
    if (Array.isArray(opp.currentHistory)) {
      prepared.currentHistory = opp.currentHistory.filter(Boolean);  // Remove any undefined/null items
    } else {
      prepared.currentHistory = opp.currentHistory;
    }
  }

  return prepared;
}

