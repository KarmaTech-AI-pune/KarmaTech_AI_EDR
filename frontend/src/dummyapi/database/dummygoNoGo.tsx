import { GoNoGoDecision, GoNoGoStatus } from "../../types/index";
// Raw Go/No-Go data
const goNoGoRawData ={
  "1": {
    "projectId": 1,
    "bidType": "Lumpsum",
    "sector": "Water",
    "tenderFee": 5000,
    "emdAmount": 100068,
    "marketingPlanScore": 8,
    "marketingPlanComments": "Strong marketing strategy in water sector",
    "clientRelationshipScore": 7,
    "clientRelationshipComments": "Good relationship with municipality",
    "projectKnowledgeScore": 8,
    "projectKnowledgeComments": "Extensive experience in water supply projects",
    "technicalEligibilityScore": 9,
    "technicalEligibilityComments": "Meets all technical requirements",
    "financialEligibilityScore": 8,
    "financialEligibilityComments": "Strong financial position",
    "staffAvailabilityScore": 7,
    "staffAvailabilityComments": "Required staff available",
    "competitionAssessmentScore": 8,
    "competitionAssessmentComments": "Limited competition in this sector",
    "competitivePositionScore": 8,
    "competitivePositionComments": "Strong market position",
    "futureWorkPotentialScore": 9,
    "futureWorkPotentialComments": "High potential for similar projects",
    "profitabilityScore": 8,
    "profitabilityComments": "Good profit margins expected",
    "resourceAvailabilityScore": 7,
    "resourceAvailabilityComments": "Resources can be allocated",
    "bidScheduleScore": 8,
    "bidScheduleComments": "Timeline is achievable",
    "totalScore": 95,
    "status": "Green",
    "decisionComments": "Project aligns with our expertise",
    "completedDate": "2022-11-15",
    "completedBy": "System"
  },
  "2": {
    "projectId": 4,
    "bidType": "EPC",
    "sector": "Smart City",
    "tenderFee": 7500,
    "emdAmount": 150000,
    "marketingPlanScore": 7,
    "marketingPlanComments": "Developing marketing strategy",
    "clientRelationshipScore": 8,
    "clientRelationshipComments": "Strong relationship with authority",
    "projectKnowledgeScore": 7,
    "projectKnowledgeComments": "Good understanding of requirements",
    "technicalEligibilityScore": 8,
    "technicalEligibilityComments": "Meets technical criteria",
    "financialEligibilityScore": 8,
    "financialEligibilityComments": "Financially capable",
    "staffAvailabilityScore": 6,
    "staffAvailabilityComments": "Some resource allocation needed",
    "competitionAssessmentScore": 7,
    "competitionAssessmentComments": "Moderate competition",
    "competitivePositionScore": 7,
    "competitivePositionComments": "Good market position",
    "futureWorkPotentialScore": 8,
    "futureWorkPotentialComments": "Potential for future smart city projects",
    "profitabilityScore": 7,
    "profitabilityComments": "Acceptable profit margins",
    "resourceAvailabilityScore": 6,
    "resourceAvailabilityComments": "Resource planning required",
    "bidScheduleScore": 7,
    "bidScheduleComments": "Timeline manageable",
    "totalScore": 86,
    "status": "Amber",
    "decisionComments": "Proceed with careful resource planning",
    "completedDate": "2023-10-15",
    "completedBy": "System"
  },
  "3": {
    "projectId": 5,
    "bidType": "Design-Build",
    "sector": "Coastal",
    "tenderFee": 4500,
    "emdAmount": 90000,
    "marketingPlanScore": 5,
    "marketingPlanComments": "Limited market presence in coastal sector",
    "clientRelationshipScore": 6,
    "clientRelationshipComments": "New client relationship",
    "projectKnowledgeScore": 5,
    "projectKnowledgeComments": "Limited experience in coastal projects",
    "technicalEligibilityScore": 6,
    "technicalEligibilityComments": "Some technical gaps identified",
    "financialEligibilityScore": 7,
    "financialEligibilityComments": "Financial requirements met",
    "staffAvailabilityScore": 4,
    "staffAvailabilityComments": "Resource constraints identified",
    "competitionAssessmentScore": 5,
    "competitionAssessmentComments": "Strong competition in sector",
    "competitivePositionScore": 5,
    "competitivePositionComments": "Limited competitive advantage",
    "futureWorkPotentialScore": 6,
    "futureWorkPotentialComments": "Moderate future potential",
    "profitabilityScore": 5,
    "profitabilityComments": "Low profit margins expected",
    "resourceAvailabilityScore": 4,
    "resourceAvailabilityComments": "Significant resource gaps",
    "bidScheduleScore": 6,
    "bidScheduleComments": "Timeline challenging",
    "totalScore": 64,
    "status": "Red",
    "decisionComments": "Project risks outweigh potential benefits",
    "completedDate": "2023-05-15",
    "completedBy": "System"
  }
} as const;

// Transform into typed array
export const goNoGoDecisions: GoNoGoDecision[] = Object.values(goNoGoRawData).map(decision => ({
  projectId: decision.projectId,
  bidType: decision.bidType,
  sector: decision.sector,
  tenderFee: decision.tenderFee,
  emdAmount: decision.emdAmount,
  marketingPlanScore: decision.marketingPlanScore,
  marketingPlanComments: decision.marketingPlanComments,
  clientRelationshipScore: decision.clientRelationshipScore,
  clientRelationshipComments: decision.clientRelationshipComments,
  projectKnowledgeScore: decision.projectKnowledgeScore,
  projectKnowledgeComments: decision.projectKnowledgeComments,
  technicalEligibilityScore: decision.technicalEligibilityScore,
  technicalEligibilityComments: decision.technicalEligibilityComments,
  financialEligibilityScore: decision.financialEligibilityScore,
  financialEligibilityComments: decision.financialEligibilityComments,
  staffAvailabilityScore: decision.staffAvailabilityScore,
  staffAvailabilityComments: decision.staffAvailabilityComments,
  competitionAssessmentScore: decision.competitionAssessmentScore,
  competitionAssessmentComments: decision.competitionAssessmentComments,
  competitivePositionScore: decision.competitivePositionScore,
  competitivePositionComments: decision.competitivePositionComments,
  futureWorkPotentialScore: decision.futureWorkPotentialScore,
  futureWorkPotentialComments: decision.futureWorkPotentialComments,
  profitabilityScore: decision.profitabilityScore,
  profitabilityComments: decision.profitabilityComments,
  resourceAvailabilityScore: decision.resourceAvailabilityScore,
  resourceAvailabilityComments: decision.resourceAvailabilityComments,
  bidScheduleScore: decision.bidScheduleScore,
  bidScheduleComments: decision.bidScheduleComments,
  totalScore: decision.totalScore,
  status: decision.status === "Green" ? GoNoGoStatus.Green : 
          decision.status === "Amber" ? GoNoGoStatus.Amber : 
          GoNoGoStatus.Red,
  decisionComments: decision.decisionComments,
  completedDate: decision.completedDate,
  completedBy: decision.completedBy,
  createdAt: decision.completedDate,
  createdBy: decision.completedBy
}));

// Utility functions
export const getGoNoGoByProjectId = (projectId: number): GoNoGoDecision | undefined => {
  return goNoGoDecisions.find(decision => decision.projectId === projectId);
};

export const getGoNoGoByStatus = (status: GoNoGoStatus): GoNoGoDecision[] => {
  return goNoGoDecisions.filter(decision => decision.status === status);
};

export const getGoNoGoBySector = (sector: string): GoNoGoDecision[] => {
  return goNoGoDecisions.filter(decision => decision.sector === sector);
};

export const calculateAverageScore = (): number => {
  return goNoGoDecisions.reduce((sum, decision) => sum + decision.totalScore, 0) / goNoGoDecisions.length;
};

export const getHighScoringDecisions = (threshold: number = 80): GoNoGoDecision[] => {
  return goNoGoDecisions.filter(decision => decision.totalScore >= threshold);
};
