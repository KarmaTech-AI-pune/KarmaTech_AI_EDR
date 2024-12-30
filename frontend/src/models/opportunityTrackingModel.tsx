export type OpportunityTracking = {
    id: string;
    projectId: string | null;  // Modified to allow null
    stage: string;
    strategicRanking: string;
    bidFees?: number;
    emd?: number;
    formOfEMD?: string;
    bidManagerId: string;
    reviewManagerId?: string; // New field for Vice President BD
    approvalManagerId?: string; // New field for Regional Manager
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
    workflowId: string; // Changed from workflowStatus to workflowId
}
