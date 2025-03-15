import { axiosInstance } from '../services/axiosConfig';
import { 
  OpportunityTracking, 
  normalizeOpportunityTracking, 
  prepareOpportunityTrackingForSubmission 
} from '../models/opportunityTrackingModel';
import { OpportunityHistory } from '../models/opportunityHistoryModel';

type OpportunityStage = 'A' | 'B' | 'C' | 'D' | 'E';
type OpportunityTrackingStatus = 
  'Bid Under Preparation' | 
  'Bid Submitted' | 
  'Bid Rejected' | 
  'Bid Accepted'
 

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
  bidFees?: number;
  emd?: number;
  formOfEMD?: string;
  contactPersonAtClient?: string;
  dateOfSubmission?: string;
  percentageChanceOfProjectHappening?: number;
  percentageChanceOfNJSSuccess?: number;
  likelyCompetition?: string;
  grossRevenue?: number;
  netNJSRevenue?: number;
  followUpComments?: string;
  notes?: string;
  probableQualifyingCriteria?: string;
  currentHistory?: OpportunityHistory[];

  // Audit fields
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

// Mapping functions to convert frontend types to backend numeric values
const mapStageToBackend = (stage: OpportunityStage | undefined): number => {
  switch (stage) {
    case 'A':
      return 1;
    case 'B':
      return 2;
    case 'C':
      return 3;
    case 'D':
      return 4;
    case 'E':
      return 5;
    default:
      return 1; // Default to A
  }
};

const mapStageFromBackend = (stage: number): OpportunityStage => {
  switch (stage) {
    case 1:
      return 'A';
    case 2:
      return 'B';
    case 3:
      return 'C';
    case 4:
      return 'D';
    case 5:
      return 'E';
    default:
      return 'A'; // Default to A
  }
};

const mapStatusToBackend = (status: OpportunityTrackingStatus | undefined): number => {
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

const mapStatusFromBackend = (status: number): OpportunityTrackingStatus => {
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
      const initialNormalizedData = normalizeOpportunityTracking(opportunityData);
      const preparedData = prepareOpportunityTrackingForSubmission(initialNormalizedData);

      // Prepare the opportunity object with default values and convert to backend model
      const command: BackendOpportunityTracking = {
        stage: mapStageToBackend(preparedData.stage as OpportunityStage || 'A'),
        strategicRanking: preparedData.strategicRanking || 'M',
        bidManagerId: preparedData.bidManagerId,
        approvalManagerId: preparedData.approvalManagerId|| undefined,
        reviewManagerId: preparedData.reviewManagerId || undefined,
        operation: preparedData.operation || '',
        workName: preparedData.workName || '',
        client: preparedData.client || '',
        clientSector: preparedData.clientSector || '',
        likelyStartDate: preparedData.likelyStartDate instanceof Date
          ? preparedData.likelyStartDate.toISOString().split('T')[0]
          : (preparedData.likelyStartDate || new Date().toISOString().split('T')[0]),
        status: mapStatusToBackend(preparedData.status as OpportunityTrackingStatus || 'Bid Under Preparation'),
        currency: preparedData.currency || 'INR',
        capitalValue: preparedData.capitalValue || 0,
        durationOfProject: preparedData.durationOfProject || 0,
        fundingStream: preparedData.fundingStream || '',
        contractType: preparedData.contractType || '',
        // Optional fields
        bidFees: preparedData.bidFees || 0,
        emd: preparedData.emd || 0,
        formOfEMD: preparedData.formOfEMD,
        contactPersonAtClient: preparedData.contactPersonAtClient,
        dateOfSubmission: preparedData.dateOfSubmission instanceof Date
          ? preparedData.dateOfSubmission.toISOString().split('T')[0]
          : preparedData.dateOfSubmission,
        percentageChanceOfProjectHappening: preparedData.percentageChanceOfProjectHappening,
        percentageChanceOfNJSSuccess: preparedData.percentageChanceOfNJSSuccess,
        likelyCompetition: preparedData.likelyCompetition,
        grossRevenue: preparedData.grossRevenue || 0,
        netNJSRevenue: preparedData.netNJSRevenue || 0,
        followUpComments: preparedData.followUpComments,
        notes: preparedData.notes,
        probableQualifyingCriteria: preparedData.probableQualifyingCriteria,
        currentHistory: preparedData.currentHistory
          ? (Array.isArray(preparedData.currentHistory)
            ? preparedData.currentHistory
            : [preparedData.currentHistory]) as OpportunityHistory[]
          : undefined
      };
      
      // Make API call to backend
      const response = await axiosInstance.post<OpportunityTracking>('api/OpportunityTracking', command);
      
      // Normalize the response data, including audit fields
      const normalizedData = {
        ...response.data,
        createdAt: response.data.createdAt ? new Date(response.data.createdAt) : undefined,
        updatedAt: response.data.updatedAt ? new Date(response.data.updatedAt) : undefined,
        createdBy: response.data.createdBy,
        updatedBy: response.data.updatedBy
      };
      
      return normalizeOpportunityTracking(normalizedData) as OpportunityTracking;
    } catch (error) {
      console.error('Error creating opportunity:', error);
      throw error;
    }
  },

  update: async (opportunityId: number, opportunityData: Partial<OpportunityTracking>): Promise<OpportunityTracking> => {
    try {
      // Normalize and prepare data for submission
      const normalizedData = normalizeOpportunityTracking(opportunityData);
      const preparedData = prepareOpportunityTrackingForSubmission(normalizedData);
 
      // Prepare the opportunity object with default values and convert to backend model
      const command: BackendOpportunityTracking = {
        id: opportunityId,
        stage: mapStageToBackend(preparedData.stage as OpportunityStage || 'A'),
        strategicRanking: preparedData.strategicRanking || 'M',
        bidManagerId: preparedData.bidManagerId,
        approvalManagerId: preparedData.approvalManagerId|| undefined,
        reviewManagerId: preparedData.reviewManagerId || undefined,
        operation: preparedData.operation || '',
        workName: preparedData.workName || '',
        client: preparedData.client || '',
        clientSector: preparedData.clientSector || '',
        likelyStartDate: preparedData.likelyStartDate instanceof Date
          ? preparedData.likelyStartDate.toISOString().split('T')[0]
          : (preparedData.likelyStartDate || new Date().toISOString().split('T')[0]),
        status: mapStatusToBackend(preparedData.status as OpportunityTrackingStatus || 'Bid Under Preparation'),
        currency: preparedData.currency || 'INR',
        capitalValue: preparedData.capitalValue || 0,
        durationOfProject: preparedData.durationOfProject || 0,
        fundingStream: preparedData.fundingStream || '',
        contractType: preparedData.contractType || '',
        // Optional fields
        bidFees: preparedData.bidFees || 0,
        emd: preparedData.emd || 0,
        formOfEMD: preparedData.formOfEMD,
        contactPersonAtClient: preparedData.contactPersonAtClient,
        dateOfSubmission: preparedData.dateOfSubmission instanceof Date
          ? preparedData.dateOfSubmission.toISOString().split('T')[0]
          : preparedData.dateOfSubmission,
        percentageChanceOfProjectHappening: preparedData.percentageChanceOfProjectHappening,
        percentageChanceOfNJSSuccess: preparedData.percentageChanceOfNJSSuccess,
        likelyCompetition: preparedData.likelyCompetition,
        grossRevenue: preparedData.grossRevenue || 0,
        netNJSRevenue: preparedData.netNJSRevenue || 0,
        followUpComments: preparedData.followUpComments,
        notes: preparedData.notes,
        probableQualifyingCriteria: preparedData.probableQualifyingCriteria,
        currentHistory: preparedData.currentHistory 
          ? Array.isArray(preparedData.currentHistory) 
            ? preparedData.currentHistory 
            : [preparedData.currentHistory]
          : undefined
      };
      
      // Make API call to backend
      const response = await axiosInstance.put<OpportunityTracking>(`api/OpportunityTracking/${opportunityId}`, command);
      
      // Normalize the response data, including audit fields
      const updatedData = {
        ...response.data,
        createdAt: response.data.createdAt ? new Date(response.data.createdAt) : undefined,
        updatedAt: response.data.updatedAt ? new Date(response.data.updatedAt) : undefined,
        createdBy: response.data.createdBy,
        updatedBy: response.data.updatedBy
      };
      
      return normalizeOpportunityTracking(updatedData) as OpportunityTracking;
    } catch (error) {
      console.error('Error updating opportunity:', error);
      throw error;
    }
  },

  getByUserId: async (userId: string): Promise<OpportunityTracking[]> => {
    try {
      const response = await axiosInstance.get<OpportunityTracking[]>(`api/OpportunityTracking/bid-manager/${userId}`);
      return response.data
        .map(opp => ({
          ...opp,
          stage: mapStageFromBackend(Number(opp.stage)),  // Mapping the stage
          status: mapStatusFromBackend(Number(opp.status)), // Mapping the status
          createdAt: opp.createdAt ? new Date(opp.createdAt) : undefined,
          updatedAt: opp.updatedAt ? new Date(opp.updatedAt) : undefined
        }))
        .map(opp => normalizeOpportunityTracking(opp) as OpportunityTracking); // Normalizing the data
    } catch (error) {
      console.error('Error fetching opportunities by user ID:', error);
      throw error;
    }
  },

  getByReviewManagerId: async (reviewManagerId: string): Promise<OpportunityTracking[]> => {
    try {
      const response = await axiosInstance.get<OpportunityTracking[]>(`api/OpportunityTracking/regional-manager/${reviewManagerId}`);
     return response.data
        .map(opp => ({
          ...opp,
          stage: mapStageFromBackend(Number(opp.stage)),  // Mapping the stage
          status: mapStatusFromBackend(Number(opp.status)), // Mapping the status
          createdAt: opp.createdAt ? new Date(opp.createdAt) : undefined,
          updatedAt: opp.updatedAt ? new Date(opp.updatedAt) : undefined
        }))
        .map(opp => normalizeOpportunityTracking(opp) as OpportunityTracking); // Normalizing the data
    }catch (error) {
      console.error('Error fetching opportunities by review manager ID:', error);
      throw error;
    }
  },

  getByApprovalManagerId: async (approvalManagerId: string): Promise<OpportunityTracking[]> => {
    try {
      const response = await axiosInstance.get<OpportunityTracking[]>(`api/OpportunityTracking/regional-director/${approvalManagerId}`);
      return response.data
        .map(opp => ({
          ...opp,
          stage: mapStageFromBackend(Number(opp.stage)),  // Mapping the stage
          status: mapStatusFromBackend(Number(opp.status)), // Mapping the status
          createdAt: opp.createdAt ? new Date(opp.createdAt) : undefined,
          updatedAt: opp.updatedAt ? new Date(opp.updatedAt) : undefined
        }))
        .map(opp => normalizeOpportunityTracking(opp) as OpportunityTracking); // Normalizing the data
    } catch (error) {
      console.error('Error fetching opportunities by approval manager ID:', error);
      throw error;
    }
  },

  getAll: async (): Promise<OpportunityTracking[]> => {
    try {
      debugger;
      const response = await axiosInstance.get<BackendOpportunityTracking[]>('api/OpportunityTracking');
      console.log(response)
      return response.data.map(opp => ({
        ...opp,
        stage: mapStageFromBackend(Number(opp.stage)),
        status: mapStatusFromBackend(Number(opp.status)),
        createdAt: opp.createdAt ? new Date(opp.createdAt) : undefined,
        updatedAt: opp.updatedAt ? new Date(opp.updatedAt) : undefined
      })).map(opp => normalizeOpportunityTracking(opp) as OpportunityTracking);
    } catch (error) {
      console.error('Error fetching all opportunities:', error);
      throw error;
    }
  },

  getById: async (opportunityId: number): Promise<OpportunityTracking> => {
    try {
      const response = await axiosInstance.get<BackendOpportunityTracking>(`api/OpportunityTracking/${opportunityId}`);
      console.log(response)
      const opp = response.data;
      return normalizeOpportunityTracking({
        ...opp,
        stage: mapStageFromBackend(Number(opp.stage)),
        status: mapStatusFromBackend(Number(opp.status)),
        createdAt: opp.createdAt ? new Date(opp.createdAt) : undefined,
        updatedAt: opp.updatedAt ? new Date(opp.updatedAt) : undefined
      }) as OpportunityTracking;
    } catch (error) {
      console.error('Error fetching opportunity:', error);
      throw error;
    }
  },

  delete: async (opportunityId: number): Promise<void> => {
    try {
      await axiosInstance.delete(`api/OpportunityTracking/${opportunityId}`);
    } catch (error) {
      console.error('Error deleting opportunity:', error);
      throw error;
    }
  },

  // Additional methods for sending to review, approval, etc.
  sendToReview: async (opportunityId: number, reviewManagerId: string): Promise<OpportunityTracking> => {
    try {
      const response = await axiosInstance.post<OpportunityTracking>('api/OpportunityTracking/SendToReview', { 
        opportunityId, 
        reviewManagerId 
      });
      const normalizedResponse = {
        ...response.data,
        createdAt: response.data.createdAt ? new Date(response.data.createdAt) : undefined,
        updatedAt: response.data.updatedAt ? new Date(response.data.updatedAt) : undefined
      };
      return normalizeOpportunityTracking(normalizedResponse) as OpportunityTracking;
    } catch (error) {
      console.error('Error sending opportunity to review:', error);
      throw error;
    }
  },

  sendToApproval: async (opportunityId: number, approvalManagerId: string): Promise<OpportunityTracking> => {
    try {
      const response = await axiosInstance.post<OpportunityTracking>('api/OpportunityTracking/SendToApproval', { 
        opportunityId, 
        approvalManagerId 
      });
      const normalizedResponse = {
        ...response.data,
        createdAt: response.data.createdAt ? new Date(response.data.createdAt) : undefined,
        updatedAt: response.data.updatedAt ? new Date(response.data.updatedAt) : undefined
      };
      return normalizeOpportunityTracking(normalizedResponse) as OpportunityTracking;
    } catch (error) {
      console.error('Error sending opportunity to approval:', error);
      throw error;
    }
  },

  sendToApprove: async (opportunityId: number, regionalDirectorId: string): Promise<OpportunityTracking> => {
    try {
      const response = await axiosInstance.post<OpportunityTracking>('api/OpportunityTracking/SendToApprove', { 
        opportunityId, 
        regionalDirectorId 
      });
      const normalizedResponse = {
        ...response.data,
        createdAt: response.data.createdAt ? new Date(response.data.createdAt) : undefined,
        updatedAt: response.data.updatedAt ? new Date(response.data.updatedAt) : undefined
      };
      return normalizeOpportunityTracking(normalizedResponse) as OpportunityTracking;
    } catch (error) {
      console.error('Error sending opportunity to approve:', error);
      throw error;
    }
  },

  reject: async (opportunityId: number, rejectionReason: string): Promise<OpportunityTracking> => {
    try {
      const response = await axiosInstance.post<OpportunityTracking>('api/OpportunityTracking/Reject', { 
        opportunityId, 
        rejectionReason 
      });
      const normalizedResponse = {
        ...response.data,
        createdAt: response.data.createdAt ? new Date(response.data.createdAt) : undefined,
        updatedAt: response.data.updatedAt ? new Date(response.data.updatedAt) : undefined
      };
      return normalizeOpportunityTracking(normalizedResponse) as OpportunityTracking;
    } catch (error) {
      console.error('Error rejecting opportunity:', error);
      throw error;
    }
  }
};
