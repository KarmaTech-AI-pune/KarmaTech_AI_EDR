import { axiosInstance } from '../services/axiosConfig';
import { 
  OpportunityTracking, 
  normalizeOpportunityTracking, 
  prepareOpportunityTrackingForSubmission 
} from '../models/opportunityTrackingModel';

// Backend-specific model for sending data
export interface BackendOpportunityTracking {
  id?: number;
  projectId?: number | null;
  stage: number; // Numeric representation of stage
  strategicRanking: string;
  bidManagerId?: string;
  reviewManagerId?: string;
  approvalManagerId?: string;
  operation: string;
  workName: string;
  client: string;
  clientSector: string;
  likelyStartDate: string;
  status: number; // Numeric representation of status
  currency: string;
  capitalValue: number;
  durationOfProject: number;
  fundingStream: string;
  contractType: string;

  // Optional fields
  bidFees: number;
  emd: number;
  formOfEMD?: string;
  contactPersonAtClient?: string;
  dateOfSubmission?: string;
  percentageChanceOfProjectHappening?: number;
  percentageChanceOfNJSSuccess?: number;
  likelyCompetition?: string;
  grossRevenue: number;
  netNJSRevenue: number;
  followUpComments?: string;
  notes?: string;
  probableQualifyingCriteria?: string;
}

// Mapping functions to convert frontend types to backend numeric values
const mapStageToBackend = (stage: string | undefined): number => {
  switch (stage) {
    case 'A':
      return 1;
    case 'B':
      return 2;
    case 'C':
      return 3;
    case 'D':
      return 4;
    default:
      return 0; // Default to None
  }
};
const mapStageFromBackend =(stage: number | undefined): string => {
  switch (stage) {
    case 1:
      return 'A';
    case 2:
      return 'B';
    case 3:
      return  'C';
    case 4:
      return 'D';
    default:
      return 'None'; // Default to None
  }
}

const mapStatusToBackend = (status: string | undefined): number => {
  switch (status) {
    case 'Bid Under Preparation':
      return 0;
    case 'Bid Submitted':
      return 1;
    case 'Bid Rejected':
      return 2;
    case 'Bid Accepted':
      return 3;
    default:
      return 0; // Default to Bid Under Preparation
  }
};

const mapStatusFromBackend = (status: number | undefined): string => {
  switch (status) {
    case 0:
      return 'Bid Under Preparation';
    case 1:
      return 'Bid Submitted';
    case 2:
      return 'Bid Rejected';     
    case 3:
      return 'Bid Accepted';
    default:
      return 'Bid Under Preparation'; // Default to Bid Under Preparation
  }
};
export const opportunityApi = {
  // Utility function to convert string IDs to numbers
  convertStringToNumberId: (id: string | number): number => {
    return typeof id === 'string' ? parseInt(id, 10) : id;
  },

  create: async (opportunityData: Partial<OpportunityTracking>): Promise<OpportunityTracking> => {
    try {
      if (!opportunityData.bidManagerId) {
        throw new Error('Bid Manager ID is required');
      }
  
      // Normalize and prepare data for submission
      const normalizedData = normalizeOpportunityTracking(opportunityData);
      const preparedData = prepareOpportunityTrackingForSubmission(normalizedData);

      // Prepare the opportunity object with default values and convert to backend model
      const command: BackendOpportunityTracking = {       
        stage: mapStageToBackend(preparedData.stage || 'A'),
        strategicRanking: preparedData.strategicRanking || 'M',
        bidManagerId: preparedData.bidManagerId,
        operation: preparedData.operation || '',
        workName: preparedData.workName || '',
        client: preparedData.client || '',
        clientSector: preparedData.clientSector || '',
        likelyStartDate: preparedData.likelyStartDate instanceof Date 
          ? preparedData.likelyStartDate.toISOString().split('T')[0] 
          : (preparedData.likelyStartDate || new Date().toISOString().split('T')[0]),
        status: mapStatusToBackend(preparedData.status || 'Bid Under Preparation'),
        currency: preparedData.currency || 'INR',
        capitalValue: preparedData.capitalValue || 0,
        durationOfProject: preparedData.durationOfProject || 0,
        fundingStream: preparedData.fundingStream || '',
        contractType: preparedData.contractType || '',
        // Optional fields
        bidFees: preparedData.bidFees,
        emd: preparedData.emd,
        formOfEMD: preparedData.formOfEMD,
        contactPersonAtClient: preparedData.contactPersonAtClient,
        dateOfSubmission: preparedData.dateOfSubmission instanceof Date 
          ? preparedData.dateOfSubmission.toISOString().split('T')[0] 
          : preparedData.dateOfSubmission,
        percentageChanceOfProjectHappening: preparedData.percentageChanceOfProjectHappening,
        percentageChanceOfNJSSuccess: preparedData.percentageChanceOfNJSSuccess,
        likelyCompetition: preparedData.likelyCompetition,
        grossRevenue: preparedData.grossRevenue,
        netNJSRevenue: preparedData.netNJSRevenue,
        followUpComments: preparedData.followUpComments,
        notes: preparedData.notes,
        probableQualifyingCriteria: preparedData.probableQualifyingCriteria       
      };
      console.log(command);
      
      // Make API call to backend
      const response = await axiosInstance.post<OpportunityTracking>('api/OpportunityTracking', command);
      
      return normalizeOpportunityTracking(response.data) as OpportunityTracking;
    } catch (error) {
      console.error('Error creating opportunity:', error);
      throw error;
    }
  },

  getByUserId: async (userId: string): Promise<OpportunityTracking[]> => {
    try {
      const response = await axiosInstance.get<OpportunityTracking[]>(`/OpportunityTracking/user/${userId}`);
      return response.data.map(opp => normalizeOpportunityTracking(opp) as OpportunityTracking);
    } catch (error) {
      console.error('Error fetching opportunities by user ID:', error);
      throw error;
    }
  },

  getByReviewManagerId: async (reviewManagerId: string): Promise<OpportunityTracking[]> => {
    try {
      const response = await axiosInstance.get<OpportunityTracking[]>(`api/OpportunityTracking/review-manager/${reviewManagerId}`);
      return response.data.map(opp => normalizeOpportunityTracking(opp) as OpportunityTracking);
    } catch (error) {
      console.error('Error fetching opportunities by review manager ID:', error);
      throw error;
    }
  },

  getByApprovalManagerId: async (approvalManagerId: string): Promise<OpportunityTracking[]> => {
    try {
      const response = await axiosInstance.get<OpportunityTracking[]>(`api/OpportunityTracking/approval-manager/${approvalManagerId}`);
      return response.data.map(opp => normalizeOpportunityTracking(opp) as OpportunityTracking);
    } catch (error) {
      console.error('Error fetching opportunities by approval manager ID:', error);
      throw error;
    }
  },

  getAll: async (): Promise<OpportunityTracking[]> => {
    try {
      const response = await axiosInstance.get<OpportunityTracking[]>('api/OpportunityTracking');
      return response.data.map(opp => ({
        ...opp,
        stage: mapStageFromBackend(opp.stage),
        status: mapStatusFromBackend(opp.status)
      })).map(opp => normalizeOpportunityTracking(opp) as OpportunityTracking);
    } catch (error) {
      console.error('Error fetching all opportunities:', error);
      throw error;
    }
  },

  delete: async (opportunityId: number): Promise<void> => {
    try {
      await axiosInstance.delete(`/OpportunityTracking/${opportunityId}`);
    } catch (error) {
      console.error('Error deleting opportunity:', error);
      throw error;
    }
  }
};
