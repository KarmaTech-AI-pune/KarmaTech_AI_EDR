import { OpportunityTracking } from "../../types/index";

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
    "bidManager": "John Smith",
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
    "month": 11,
    "year": 2023,
    "trackedBy": "System",
    "createdAt": "2023-11-01",
    "createdBy": "System",
    "lastModifiedAt": "2023-11-15",
    "lastModifiedBy": "System"
  },
  "2":{
    "id": 2,
    "projectId": 3,
    "stage": "A",
    "strategicRanking": "M",
    "bidFees": 50000,
    "emd": 100000,
    "formOfEMD": "Bank Draft",
    "bidManager": "Sarah Johnson",
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
    "month": 11,
    "year": 2023,
    "trackedBy": "System",
    "createdAt": "2023-11-15",
    "createdBy": "System",
    "lastModifiedAt": "2023-11-20",
    "lastModifiedBy": "System"
  },
  "3":{
    "id": 3,
    "projectId": 13,
    "stage": "B",
    "strategicRanking": "M",
    "bidFees": 50000,
    "emd": 100000,
    "formOfEMD": "Bank Draft",
    "bidManager": "John Johnson",
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
    "month": 11,
    "year": 2023,
    "trackedBy": "System",
    "createdAt": "2023-11-15",
    "createdBy": "System",
    "lastModifiedAt": "2023-11-20",
    "lastModifiedBy": "System"
  },
  "4":{
    "id": 4,
    "projectId": 15,
    "stage": "A",
    "strategicRanking": "M",
    "bidFees": 50000,
    "emd": 100000,
    "formOfEMD": "Bank Draft",
    "bidManager": "Sarah Johnson",
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
    "month": 11,
    "year": 2023,
    "trackedBy": "System",
    "createdAt": "2023-11-15",
    "createdBy": "System",
    "lastModifiedAt": "2023-11-20",
    "lastModifiedBy": "System"
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
  bidManager: tracking.bidManager,
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
  month: tracking.month,
  year: tracking.year,
  trackedBy: tracking.trackedBy,
  createdAt: tracking.createdAt,
  createdBy: tracking.createdBy,
  lastModifiedAt: tracking.lastModifiedAt,
  lastModifiedBy: tracking.lastModifiedBy
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

export const getOpportunitiesByBidManager = (bidManager: string): OpportunityTracking[] => {
  return opportunityTrackings.filter(opportunity => opportunity.bidManager === bidManager);
};

export const getOpportunitiesByMonthYear = (month: number, year: number): OpportunityTracking[] => {
  return opportunityTrackings.filter(opportunity => 
    opportunity.month === month && opportunity.year === year
  );
};

