import { OpportunityHistory } from "../types";
import { opportunityHistories, getOpportunityHistoryById, getHistoriesByOpportunityId } from "./database/dummyOpportunityHistory";

// Get all history entries
export const getAllOpportunityHistories = async (): Promise<OpportunityHistory[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(opportunityHistories);
    }, 500);
  });
};

// Get history by ID

// Get histories by opportunity ID
export const getOpportunityHistoriesByOpportunityId = async (opportunityId: number): Promise<OpportunityHistory[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(getHistoriesByOpportunityId(opportunityId));
    }, 500);
  });
};

// Add new history entry
export const addOpportunityHistory = async (history: Omit<OpportunityHistory, "id">): Promise<OpportunityHistory> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newHistory: OpportunityHistory = {
        id: Math.max(...opportunityHistories.map(h => h.id)) + 1,
        ...history
      };
      opportunityHistories.push(newHistory);
      resolve(newHistory);
    }, 500);
  });
};
