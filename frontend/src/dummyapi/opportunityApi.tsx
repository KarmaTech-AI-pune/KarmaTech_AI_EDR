import { OpportunityTracking } from '../types';
import { opportunityTrackings } from './database/dummyopportunityTracking';

// Create a mutable copy of the opportunity trackings for the dummy API
let mutableOpportunityTrackings: OpportunityTracking[] = [...opportunityTrackings];

export const opportunityApi = {
  getAll: async (): Promise<OpportunityTracking[]> => {
    try {
      return [...mutableOpportunityTrackings];
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      throw error;
    }
  },

  // New method to get opportunities by user ID (Bid Manager)
  getByUserId: async (userId: number): Promise<OpportunityTracking[]> => {
    try {
      return mutableOpportunityTrackings.filter(opp => opp.bidManagerId === userId);
    } catch (error) {
      console.error(`Error fetching opportunities for user ${userId}:`, error);
      throw error;
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
      return opportunities.map(opp => ({ ...opp }));
    } catch (error) {
      console.error(`Error fetching opportunities for project ${projectId}:`, error);
      throw error;
    }
  },

  // Rest of the existing methods remain the same...
  create: async (opportunityData: Partial<OpportunityTracking>): Promise<OpportunityTracking> => {
    try {
      // Generate a new ID
      const newId = Math.max(...mutableOpportunityTrackings.map(opp => opp.id), 0) + 1;

      // Create the new opportunity with required fields
      const newOpportunity: OpportunityTracking = {
        id: newId,
        projectId: opportunityData.projectId || 0,
        stage: opportunityData.stage || 'A',
        strategicRanking: opportunityData.strategicRanking || 'M',
        bidManagerId: opportunityData.bidManagerId || 0,
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
        probableQualifyingCriteria: opportunityData.probableQualifyingCriteria
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
      const index = mutableOpportunityTrackings.findIndex(opp => opp.id === opportunityData.id);
      if (index === -1) {
        throw new Error(`Opportunity with id ${opportunityData.id} not found`);
      }
      
      // Create a new array with the updated opportunity
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
      
      // Create a new array without the deleted opportunity
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
