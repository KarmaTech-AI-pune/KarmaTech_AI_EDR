import { BidPreparationStatus } from '../dummyapi/bidVersionHistoryApi';

export const getStatusLabel = (status: BidPreparationStatus): string => {
  switch (status) {
    case BidPreparationStatus.Approved:
      return 'Approved';
    case BidPreparationStatus.Rejected:
      return 'Rejected';
    case BidPreparationStatus.PendingApproval:
      return 'Pending Approval';
    case BidPreparationStatus.Draft:
    default:
      return 'Draft';
  }
};
