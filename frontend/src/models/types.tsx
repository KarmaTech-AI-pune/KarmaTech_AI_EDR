export enum GoNoGoStatus {
  Red = 0,
  Amber = 1,
  Green = 2
}

export enum TypeOfBid {
  Lumpsum = 0,
  TimeAndExpense = 1,
  Percentage = 2
}

export enum WorkflowStatus {
  Initiated = 'Initiated',
  InProgress = 'InProgress',
  UnderReview = 'UnderReview',
  Approved = 'Approved',
  Rejected = 'Rejected',
  Completed = 'Completed'
}

export enum GoNoGoVersionStatus {
  BDM_PENDING = 'BDM_PENDING',
  BDM_APPROVED = 'BDM_APPROVED',
  RM_PENDING = 'RM_PENDING',
  RM_APPROVED = 'RM_APPROVED',
  RD_PENDING = 'RD_PENDING',
  RD_APPROVED = 'RD_APPROVED',
  COMPLETED = 'COMPLETED'
}

export enum ProjectStatus {
  Opportunity = 0,
  InProgress = 1,
  OnHold = 2,
  Completed = 3,
  Cancelled = 4
}
