import { OpportunityTracking } from '../types';
import { opportunityTrackings } from './database/dummyopportunityTracking';

export const opportunityApi = {
  getAll: async (): Promise<OpportunityTracking[]> => {
    try {
      return opportunityTrackings;
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      throw error;
    }
  },

  getById: async (id: number): Promise<OpportunityTracking> => {
    try {
      const opportunity = opportunityTrackings.find(opp => opp.id === id);
      if (!opportunity) {
        throw new Error(`Opportunity with id ${id} not found`);
      }
      return opportunity;
    } catch (error) {
      console.error(`Error fetching opportunity ${id}:`, error);
      throw error;
    }
  },

  getByProjectId: async (projectId: number): Promise<OpportunityTracking[]> => {
    try {
      return opportunityTrackings.filter(opp => opp.projectId === projectId);
    } catch (error) {
      console.error(`Error fetching opportunities for project ${projectId}:`, error);
      throw error;
    }
  },

  create: async (opportunityTracking: Partial<OpportunityTracking>): Promise<OpportunityTracking> => {
    try {
      const newOpportunity = {
        ...opportunityTracking,
        id: opportunityTrackings.length + 1,
        createdAt: new Date().toISOString(),
        createdBy: 'System',
        lastModifiedAt: new Date().toISOString(),
        lastModifiedBy: 'System'
      } as OpportunityTracking;
      
      opportunityTrackings.push(newOpportunity);
      return newOpportunity;
    } catch (error) {
      console.error('Error creating opportunity:', error);
      throw error;
    }
  },

  update: async (opportunityTracking: OpportunityTracking): Promise<OpportunityTracking> => {
    try {
      const index = opportunityTrackings.findIndex(opp => opp.id === opportunityTracking.id);
      if (index === -1) {
        throw new Error(`Opportunity with id ${opportunityTracking.id} not found`);
      }
      
      const updatedOpportunity = {
        ...opportunityTracking,
        lastModifiedAt: new Date().toISOString(),
        lastModifiedBy: 'System'
      };
      
      opportunityTrackings[index] = updatedOpportunity;
      return updatedOpportunity;
    } catch (error) {
      console.error('Error updating opportunity:', error);
      throw error;
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      const index = opportunityTrackings.findIndex(opp => opp.id === id);
      if (index === -1) {
        throw new Error(`Opportunity with id ${id} not found`);
      }
      
      opportunityTrackings.splice(index, 1);
    } catch (error) {
      console.error(`Error deleting opportunity ${id}:`, error);
      throw error;
    }
  }
};
