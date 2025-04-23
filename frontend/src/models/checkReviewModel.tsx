export interface CheckReviewRow {
    id?: string;
    projectId: string;
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
    createdAt?: string;
    updatedAt?: string;
    createdBy?: string;
    updatedBy?: string;
  }
