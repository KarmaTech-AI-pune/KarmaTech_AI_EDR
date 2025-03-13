import { axiosInstance } from './axiosConfig';
import { BidPreparationStatus } from './bidVersionHistoryApi';

export interface DocumentCategory {
  id: string;
  name: string;
  level: number;
  parentId?: string;
  children: DocumentCategory[];
  isRequired: boolean;
  isEnclosed: boolean;
  date?: Date;
  remarks?: string;
}

export interface BidPreparationData {
  id: number;
  documentCategoriesJson: string;
  opportunityId: number;
  userId: string;
  createdDate: Date;
  modifiedDate: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  version: number;
  status: BidPreparationStatus; 
  comments?: string;
}

const getBidPreparationData = async (_id: number | undefined): Promise<BidPreparationData> => {
  const response = await axiosInstance.get(`/api/BidPreparation?opportunityId=${_id}`);
  return response.data;
};

const updateBidPreparationData = async (
  documentCategories: DocumentCategory[], 
  opportunityId: number | undefined, 
  comments?: string
): Promise<boolean> => {
  const response = await axiosInstance.put('/api/BidPreparation', {
    documentCategoriesJson: JSON.stringify(documentCategories),
    opportunityId: opportunityId ? Number(opportunityId) : undefined,
    comments
  });
  return response.data;
};

const submitForApproval = async (opportunityId: number | undefined): Promise<boolean> => {
  if (!opportunityId) {
    throw new Error('Opportunity ID is required');
  }
  const response = await axiosInstance.post(`/api/BidPreparation/${Number(opportunityId)}/submit`);
  return response.data;
};

const approveOrReject = async (
  opportunityId: number | undefined, 
  isApproved: boolean, 
  comments: string
): Promise<boolean> => {
  if (!opportunityId) {
    throw new Error('Opportunity ID is required');
  }
  const response = await axiosInstance.post(`/api/BidPreparation/${Number(opportunityId)}/approve`, {
    opportunityId: Number(opportunityId),
    isApproved,
    comments
  });
  return response.data;
};

export const bidPreparationApi = {
  getBidPreparationData,
  updateBidPreparationData,
  submitForApproval,
  approveOrReject
};
