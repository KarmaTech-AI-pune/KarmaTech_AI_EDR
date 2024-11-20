import { OpportunityTracking } from '../types';
import { opportunityTrackings } from './database/dummyopportunityTracking';
import { WorkflowStatus } from './database/dummyopportunityTracking';

// Create a mutable copy of the opportunity trackings for the dummy API
let mutableOpportunityTrackings: OpportunityTracking[] = [...opportunityTrackings];

export const opportunityApi = {
  getAll: async (): Promise<OpportunityTracking[]> => {
    try {
      return [...mutableOpportunityTrackings];
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      throw new Error('Failed to fetch opportunities');
    }
  },

  getByUserId: async (userId: number): Promise<OpportunityTracking[]> => {
    try {
      const opportunities = mutableOpportunityTrackings.filter(opp => opp.bidManagerId === userId);
      if (!opportunities.length) {
        console.warn(`No opportunities found for user ${userId}`);
      }
      return opportunities;
    } catch (error) {
      console.error(`Error fetching opportunities for user ${userId}:`, error);
      throw new Error(`Failed to fetch opportunities for user ${userId}`);
    }
  },

  getByReviewManagerId: async (userId: number): Promise<OpportunityTracking[]> => {
    try {
      const opportunities = mutableOpportunityTrackings.filter(opp => opp.reviewManagerId === userId);
      if (!opportunities.length) {
        console.warn(`No opportunities found for review manager ${userId}`);
      }
      return opportunities;
    } catch (error) {
      console.error(`Error fetching opportunities for review manager ${userId}:`, error);
      throw new Error(`Failed to fetch opportunities for review manager ${userId}`);
    }
  },

  getById: async (id: number): Promise<OpportunityTracking> => {
    try {
      const opportunity = mutableOpportunityTrackings.find(opp => opp.id === id);
      if (!opportunity) {
        throw new Error(`Opportunity with id ${id} not found`);
      }
      return { ...opportunity };
    } catch (error) {
      console.error(`Error fetching opportunity ${id}:`, error);
      throw error;
    }
  },

  getByProjectId: async (projectId: number): Promise<OpportunityTracking[]> => {
    try {
      const opportunities = mutableOpportunityTrackings.filter(opp => opp.projectId === projectId);
      if (!opportunities.length) {
        console.warn(`No opportunities found for project ${projectId}`);
      }
      return opportunities.map(opp => ({ ...opp }));
    } catch (error) {
      console.error(`Error fetching opportunities for project ${projectId}:`, error);
      throw new Error(`Failed to fetch opportunities for project ${projectId}`);
    }
  },

  create: async (opportunityData: Partial<OpportunityTracking>): Promise<OpportunityTracking> => {
    try {
      if (!opportunityData.bidManagerId) {
        throw new Error('Bid Manager ID is required');
      }

      const newId = Math.max(...mutableOpportunityTrackings.map(opp => opp.id), 0) + 1;

      const newOpportunity: OpportunityTracking = {
        id: newId,
        projectId: opportunityData.projectId || null,
        stage: opportunityData.stage || 'A',
        strategicRanking: opportunityData.strategicRanking || 'M',
        bidManagerId: opportunityData.bidManagerId,
        operation: opportunityData.operation || '',
        workName: opportunityData.workName || '',
        client: opportunityData.client || '',
        clientSector: opportunityData.clientSector || '',
        likelyStartDate: opportunityData.likelyStartDate || new Date().toISOString().split('T')[0],
        status: opportunityData.status || 'Bid Under Preparation',
        currency: opportunityData.currency || 'INR',
        capitalValue: opportunityData.capitalValue || 0,
        durationOfProject: opportunityData.durationOfProject || 0,
        fundingStream: opportunityData.fundingStream || '',
        contractType: opportunityData.contractType || '',
        workflowStatus: opportunityData.workflowStatus || WorkflowStatus.Initial,
        // Optional fields
        bidFees: opportunityData.bidFees,
        emd: opportunityData.emd,
        formOfEMD: opportunityData.formOfEMD,
        contactPersonAtClient: opportunityData.contactPersonAtClient,
        dateOfSubmission: opportunityData.dateOfSubmission,
        percentageChanceOfProjectHappening: opportunityData.percentageChanceOfProjectHappening,
        percentageChanceOfNJSSuccess: opportunityData.percentageChanceOfNJSSuccess,
        likelyCompetition: opportunityData.likelyCompetition,
        grossRevenue: opportunityData.grossRevenue,
        netNJSRevenue: opportunityData.netNJSRevenue,
        followUpComments: opportunityData.followUpComments,
        notes: opportunityData.notes,
        probableQualifyingCriteria: opportunityData.probableQualifyingCriteria,
      };
      
      mutableOpportunityTrackings.push(newOpportunity);
      return { ...newOpportunity };
    } catch (error) {
      console.error('Error creating opportunity:', error);
      throw error;
    }
  },

  update: async (opportunityData: OpportunityTracking): Promise<OpportunityTracking> => {
    try {
      if (!opportunityData.id) {
        throw new Error('Opportunity ID is required for update');
      }

      const index = mutableOpportunityTrackings.findIndex(opp => opp.id === opportunityData.id);
      if (index === -1) {
        throw new Error(`Opportunity with id ${opportunityData.id} not found`);
      }

      // Validate workflow status
      if (!Object.values(WorkflowStatus).includes(opportunityData.workflowStatus)) {
        throw new Error('Invalid workflow status');
      }
      
      mutableOpportunityTrackings = [
        ...mutableOpportunityTrackings.slice(0, index),
        { ...opportunityData },
        ...mutableOpportunityTrackings.slice(index + 1)
      ];

      return { ...opportunityData };
    } catch (error) {
      console.error('Error updating opportunity:', error);
      throw error;
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      const index = mutableOpportunityTrackings.findIndex(opp => opp.id === id);
      if (index === -1) {
        throw new Error(`Opportunity with id ${id} not found`);
      }
      
      mutableOpportunityTrackings = [
        ...mutableOpportunityTrackings.slice(0, index),
        ...mutableOpportunityTrackings.slice(index + 1)
      ];
    } catch (error) {
      console.error(`Error deleting opportunity ${id}:`, error);
      throw error;
    }
  }
};
