import { axiosInstance } from './axiosConfig';

export interface BidVersionHistory {
  id: number;
  version: number;
  modifiedBy: string;
  modifiedDate: Date;
  comments: string;
}

export const getBidVersionHistory = async (): Promise<BidVersionHistory[]> => {
  const response = await axiosInstance.get('/api/BidVersionHistory');
  return response.data;
};

export const updateCurrentChecklist = async (checklist: any): Promise<void> => {
  await axiosInstance.put('/api/BidVersionHistory/current', checklist);
};
