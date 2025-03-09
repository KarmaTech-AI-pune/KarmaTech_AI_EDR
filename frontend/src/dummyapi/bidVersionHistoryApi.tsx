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
  debugger;
  const response = await axiosInstance.get(`/api/BidPreparation/versions?opportunityId=${opportunityId}`);
 
  return response.data;
};

export const updateCurrentChecklist = async (checklist: any): Promise<void> => {
  await axiosInstance.put('/api/BidVersionHistory/current', checklist);
};
