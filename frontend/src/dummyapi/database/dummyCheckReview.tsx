export interface ICheckReviewRow {
  projectId: string; // Added foreign key to project
  activityNo: string;
  activityName: string;
  objective: string;
  references: string;
  fileName: string;
  qualityIssues: string;
  completion: string;
  checkedBy: string;
  approvedBy: string;
  actionTaken: string;
}

export const dummyCheckReviews: ICheckReviewRow[] = [];
