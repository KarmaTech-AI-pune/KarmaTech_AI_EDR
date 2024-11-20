import { OpportunityTracking } from "../../types/index";

export enum WorkflowStatus {
  Initial = "Initial",
  SentForReview = "Sent for Review",
  ReviewChanges = "Review Changes",
  SentForApproval = "Sent for Approval",
  ApprovalChanges = "Approval Changes",
  Approved = "Approved"
}

// Raw opportunity tracking data
const opportunityTrackingRawData =  {
  "1":{
    "id": 1,
    "projectId": 2,
    "stage": "B",
    "strategicRanking": "H",
    "bidFees": 75000,
    "emd": 150000,
    "formOfEMD": "Bank Guarantee",
    "bidManagerId": 8,
    "reviewManagerId": undefined, 
    "approvalManagerId": undefined, 
    "contactPersonAtClient": "Rajesh Kumar",
    "dateOfSubmission": "2023-12-15",
    "percentageChanceOfProjectHappening": 75.5,
    "percentageChanceOfNJSSuccess": 65.0,
    "likelyCompetition": "L&T, HCC, Gammon",
    "grossRevenue": 7500000,
    "netNJSRevenue": 6000000,
    "followUpComments": "Client very interested in smart solutions",
    "notes": "Need to focus on IoT integration",
    "probableQualifyingCriteria": "Similar project experience, Local presence",
    "operation": "Mumbai",
    "workName": "Smart City Project",
    "client": "Mumbai Municipal Corporation", 
    "clientSector": "Government",
    "likelyStartDate": "2024-03-01",
    "status": "Bid Submitted",
    "currency": "INR",
    "capitalValue": 500000000,
    "durationOfProject": 36,
    "fundingStream": "Government Budget",
    "contractType": "EPC",
    "workflowStatus": WorkflowStatus.Initial
  },
  "2":{
    "id": 2,
    "projectId": 3,
    "stage": "A",
    "strategicRanking": "M",
    "bidFees": 50000,
    "emd": 100000,
    "formOfEMD": "Bank Draft",
    "bidManagerId": 9,
    "reviewManagerId": undefined, 
    "approvalManagerId": undefined, 
    "contactPersonAtClient": "Amit Patel",
    "dateOfSubmission": "2023-12-30",
    "percentageChanceOfProjectHappening": 60.0,
    "percentageChanceOfNJSSuccess": 55.0,
    "likelyCompetition": "Tata Projects, SPML Infra",
    "grossRevenue": 3200000,
    "netNJSRevenue": 2500000,
    "followUpComments": "Technical presentation scheduled",
    "notes": "Focus on flood prediction systems",
    "probableQualifyingCriteria": "Similar project experience, Local presence",
    "operation": "Pune",
    "workName": "River Rejuvenation",
    "client": "Pune Municipal Corporation",
    "clientSector": "Government", 
    "likelyStartDate": "2024-06-01",
    "status": "Bid Under Preparation",
    "currency": "INR",
    "capitalValue": 250000000,
    "durationOfProject": 24,
    "fundingStream": "Government Grant",
    "contractType": "Item Rate",
    "workflowStatus": WorkflowStatus.Initial
  },
  "3":{
    "id": 3,
    "projectId": 13,
    "stage": "B",
    "strategicRanking": "M",
    "bidFees": 50000,
    "emd": 100000,
    "formOfEMD": "Bank Draft",
    "bidManagerId": 8,
    "reviewManagerId": undefined, 
    "approvalManagerId": undefined, 
    "contactPersonAtClient": "Amita Patel",
    "dateOfSubmission": "2023-12-30",
    "percentageChanceOfProjectHappening": 60.0,
    "percentageChanceOfNJSSuccess": 55.0,
    "likelyCompetition": "Tata Projects, SPML Infra",
    "grossRevenue": 3200000,
    "netNJSRevenue": 2500000,
    "followUpComments": "Technical presentation scheduled",
    "notes": "Focus on flood prediction systems",
    "probableQualifyingCriteria": "Similar project experience, Local presence",
    "operation": "Nagpur",
    "workName": "Sewage Treatment Plant",
    "client": "Nagpur Municipal Corporation",
    "clientSector": "Government",
    "likelyStartDate": "2024-04-01", 
    "status": "Bid Submitted",
    "currency": "INR",
    "capitalValue": 400000000,
    "durationOfProject": 30,
    "fundingStream": "Multilateral Funding",
    "contractType": "Lump Sum",
    "workflowStatus": WorkflowStatus.Initial
  },
  "4":{
    "id": 4,
    "projectId": 15,
    "stage": "A",
    "strategicRanking": "M",
    "bidFees": 50000,
    "emd": 100000,
    "formOfEMD": "Bank Draft",
    "bidManagerId": 9,
    "reviewManagerId": undefined, 
    "approvalManagerId": undefined, 
    "contactPersonAtClient": "Amit Patel",
    "dateOfSubmission": "2023-12-30",
    "percentageChanceOfProjectHappening": 60.0,
    "percentageChanceOfNJSSuccess": 55.0,
    "likelyCompetition": "Tata Projects, SPML Infra, ABC",
    "grossRevenue": 3200000,
    "netNJSRevenue": 2500000,
    "followUpComments": "Technical presentation scheduled",
    "notes": "Focus on flood prediction systems",
    "probableQualifyingCriteria": "Similar project experience, Local presence",
    "operation": "Nashik",
    "workName": "Water Supply Scheme",
    "client": "Nashik Municipal Corporation", 
    "clientSector": "Government",
    "likelyStartDate": "2024-08-01",
    "status": "Bid Under Preparation", 
    "currency": "INR",
    "capitalValue": 600000000,
    "durationOfProject": 48,
    "fundingStream": "Government Budget",
    "contractType": "EPC",
    "workflowStatus": WorkflowStatus.Initial
  }
} as const;

// Transform into typed array
export const opportunityTrackings: OpportunityTracking[] =  Object.values(opportunityTrackingRawData).map(tracking => ({
  id: tracking.id,
  projectId: tracking.projectId,
  stage: tracking.stage,
  strategicRanking: tracking.strategicRanking,
  bidFees: tracking.bidFees,
  emd: tracking.emd,
  formOfEMD: tracking.formOfEMD,
  bidManagerId: tracking.bidManagerId,
  reviewManagerId: tracking.reviewManagerId,
  approvalManagerId: tracking.approvalManagerId,
  contactPersonAtClient: tracking.contactPersonAtClient,
  dateOfSubmission: tracking.dateOfSubmission,
  percentageChanceOfProjectHappening: tracking.percentageChanceOfProjectHappening,
  percentageChanceOfNJSSuccess: tracking.percentageChanceOfNJSSuccess,
  likelyCompetition: tracking.likelyCompetition,
  grossRevenue: tracking.grossRevenue,
  netNJSRevenue: tracking.netNJSRevenue,
  followUpComments: tracking.followUpComments,
  notes: tracking.notes,
  probableQualifyingCriteria: tracking.probableQualifyingCriteria,
  operation: tracking.operation,
  workName: tracking.workName,
  client: tracking.client,
  clientSector: tracking.clientSector,
  likelyStartDate: tracking.likelyStartDate,
  status: tracking.status,
  currency: tracking.currency,
  capitalValue: tracking.capitalValue,
  durationOfProject: tracking.durationOfProject,
  fundingStream: tracking.fundingStream,
  contractType: tracking.contractType,
  workflowStatus: tracking.workflowStatus
}));

// Utility functions
export const getOpportunityById = (id: number): OpportunityTracking | undefined => {
  return opportunityTrackings.find(opportunity => opportunity.id === id);
};

export const getOpportunityByProjectId = (projectId: number): OpportunityTracking | undefined => {
  return opportunityTrackings.find(opportunity => opportunity.projectId === projectId);
};

export const getOpportunitiesByStage = (stage: string): OpportunityTracking[] => {
  return opportunityTrackings.filter(opportunity => opportunity.stage === stage);
};

export const getOpportunitiesByStrategicRanking = (ranking: string): OpportunityTracking[] => {
  return opportunityTrackings.filter(opportunity => opportunity.strategicRanking === ranking);
};

export const getOpportunitiesByBidManager = (bidManagerId: number): OpportunityTracking[] => {
  return opportunityTrackings.filter(opportunity => opportunity.bidManagerId === bidManagerId);
};

export const getOpportunitiesByWorkflowStatus = (status: WorkflowStatus): OpportunityTracking[] => {
  return opportunityTrackings.filter(opportunity => opportunity.workflowStatus === status);
};

// Updated utility function to get opportunities by review manager
export const getOpportunitiesByReviewManager = (reviewManagerId: number): OpportunityTracking[] => {
  return opportunityTrackings.filter(opportunity => {
    console.group(opportunity.workName)
    console.log("oppor_reviewID:",opportunity.reviewManagerId)
    console.log("input reviewManager", reviewManagerId)
    console.groupEnd()
    opportunity.reviewManagerId === reviewManagerId 
  }
  );
};
