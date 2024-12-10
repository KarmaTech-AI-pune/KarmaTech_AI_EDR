export type OpportunityTracking = {
    id: number;
    projectId: number | null;  // Modified to allow null
    stage: string;
    strategicRanking: string;
    bidFees?: number;
    emd?: number;
    formOfEMD?: string;
    bidManagerId: number;
    reviewManagerId?: number; // New field for Vice President BD
    approvalManagerId?: number; // New field for Regional Manager
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
    operation: string;
    workName: string;
    client: string;
    clientSector: string;
    likelyStartDate: string;
    status: string;
    currency: string;
    capitalValue: number;
    durationOfProject: number;
    fundingStream: string;
    contractType: string;
    workflowId: number; // Changed from workflowStatus to workflowId
  }
  