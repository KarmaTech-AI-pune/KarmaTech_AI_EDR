import { axiosInstance } from './axiosConfig';

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
}

const getBidPreparationData = async (id: number | undefined): Promise<BidPreparationData> => {
  const response = await axiosInstance.get('/api/BidPreparation');
  return response.data;
};

const updateBidPreparationData = async (documentCategories: DocumentCategory[], opportunityId: number | undefined): Promise<boolean> => {
  const response = await axiosInstance.put('/api/BidPreparation', {
    documentCategoriesJson: JSON.stringify(documentCategories),
    opportunityId,
    userId:''
  });
  return response.data;
};

export const bidPreparationApi = {
  getBidPreparationData,
  updateBidPreparationData
};
