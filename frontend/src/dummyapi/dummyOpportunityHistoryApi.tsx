import { OpportunityHistory } from '../models';
import { opportunityHistories, getHistoriesByOpportunityId } from "./database/dummyOpportunityHistory";

// Get all history entries
export const getAllOpportunityHistories = async (): Promise<OpportunityHistory[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(opportunityHistories);
    }, 500);
  });
};

// Get histories by opportunity ID
export const getOpportunityHistoriesByOpportunityId = async (opportunityId: string): Promise<OpportunityHistory[]> => {
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
      // Convert existing IDs to numbers, find max, then convert back to string
      const maxId = Math.max(...opportunityHistories.map(h => h.id)) + 1;
      const newHistory: OpportunityHistory = {
        id: maxId,
        ...history
      };
      opportunityHistories.push(newHistory);
      resolve(newHistory);
    }, 500);
  });
};
