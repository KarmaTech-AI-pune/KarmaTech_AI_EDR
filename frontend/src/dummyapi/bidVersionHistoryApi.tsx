import { axiosInstance } from './axiosConfig';

export enum BidPreparationStatus
{
    Draft=0,
    PendingApproval=1,
    Approved=2,
    Rejected=3
}
export interface BidVersionHistory {
  id: number;
  version: number;
  modifiedBy: string; 
  modifiedDate: Date;
  comments: string;  
  status: BidPreparationStatus;
}

export const getBidVersionHistory = async (opportunityId?: number): Promise<BidVersionHistory[]> => {
  if (!opportunityId) {
    return [];
  }
  const response = await axiosInstance.get(`/api/BidPreparation/versions?opportunityId=${Number(opportunityId)}`);
  return response.data;
};

export interface ChecklistUpdate {
  id?: number;
  opportunityId: number;
  documentCategoriesJson: string;
  comments?: string;
}

export const updateCurrentChecklist = async (checklist: ChecklistUpdate): Promise<void> => {
  await axiosInstance.put('/api/BidVersionHistory/current', checklist);
};
