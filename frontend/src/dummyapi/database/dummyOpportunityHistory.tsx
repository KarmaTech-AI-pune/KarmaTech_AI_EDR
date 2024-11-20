import { OpportunityHistory } from "../../types/index";

// Raw history data
const historyRawData = {
  "1": {
    id: 1,
    opportunityId: 1,
    date: "2023-12-15",
    description: "Project Smart City Project created"
  },
  "2": {
    id: 2,
    opportunityId: 2,
    date: "2023-12-30",
    description: "Project River Rejuvenation created"
  },
  "3": {
    id: 3,
    opportunityId: 3,
    date: "2023-12-30",
    description: "Project Sewage Treatment Plant created"
  },
  "4": {
    id: 4,
    opportunityId: 4,
    date: "2023-12-30",
    description: "Project Water Supply Scheme created"
  }
} as const;

// Transform into typed array
export const opportunityHistories: OpportunityHistory[] = Object.values(historyRawData).map(history => ({
  id: history.id,
  opportunityId: history.opportunityId,
  date: history.date,
  description: history.description
}));

// Utility functions
export const getOpportunityHistoryById = (id: number): OpportunityHistory | undefined => {
  return opportunityHistories.find(history => history.id === id);
};

export const getHistoriesByOpportunityId = (opportunityId: number): OpportunityHistory[] => {
  return opportunityHistories.filter(history => history.opportunityId === opportunityId);
};
