import { OpportunityHistory } from "../../models";

// Raw history data
const historyRawData = {
  1: {
    id: 1,
    opportunityId: 1,
    date: "2023-12-15",
    description: "Project Smart City Project created",
    statusId: 1,
    status: "Created",
    action: "Creation",
    assignedToId: "user1"
  },
  2: {
    id: 2,
    opportunityId: 2,
    date: "2023-12-30",
    description: "Project River Rejuvenation created",
    statusId: 1,
    status: "Created",
    action: "Creation",
    assignedToId: "user2"
  },
  3: {
    id: 3,
    opportunityId: 3,
    date: "2023-12-30",
    description: "Project Sewage Treatment Plant created",
    statusId: 1,
    status: "Created",
    action: "Creation",
    assignedToId: "user3"
  },
  4: {
    id: 4,
    opportunityId: 4,
    date: "2023-12-30",
    description: "Project Water Supply Scheme created",
    statusId: 1,
    status: "Created",
    action: "Creation",
    assignedToId: "user4"
  }
} as const;

// Transform into typed array
export const opportunityHistories: OpportunityHistory[] = Object.values(historyRawData).map(history => ({
  id: history.id,
  opportunityId: history.opportunityId,
  date: history.date,
  description: history.description,
  statusId: history.statusId,
  status: history.status,
  action: history.action,
  assignedToId: history.assignedToId
}));

// Utility functions
export const getOpportunityHistoryById = (id: number): OpportunityHistory | undefined => {
  return opportunityHistories.find(history => history.id === id);
};

export const getHistoriesByOpportunityId = (opportunityId: number): OpportunityHistory[] => {
  return opportunityHistories.filter(history => history.opportunityId === opportunityId);
};
