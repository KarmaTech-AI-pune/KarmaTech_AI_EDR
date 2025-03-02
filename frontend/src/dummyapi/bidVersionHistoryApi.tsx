import { ChecklistItem } from './bidPreparationApi';

export interface BidVersion {
  number: number;
  createdBy: string;
  createdAt: string;
  checklist: ChecklistItem[];
}

export interface BidVersionHistory {
  versions: BidVersion[];
  currentReviewer: 'BDM' | 'RM' | 'RD';
  currentChecklist: ChecklistItem[];
}

// Store version history data in memory
let versionHistory: BidVersionHistory = {
  versions: [],
  currentReviewer: 'BDM',
  currentChecklist: []
};

export const getBidVersionHistory = () => {
  return Promise.resolve(versionHistory);
};

export const updateCurrentChecklist = (checklist: ChecklistItem[]) => {
  versionHistory.currentChecklist = checklist;
  return Promise.resolve(versionHistory);
};

export const sendToApprove = (checklist: ChecklistItem[], reviewer: string) => {
  const newVersion: BidVersion = {
    number: versionHistory.versions.length + 1,
    createdBy: reviewer,
    createdAt: new Date().toLocaleString(),
    checklist
  };

  // Add new version to the beginning of the array
  versionHistory.versions.unshift(newVersion);

  // Update current reviewer
  if (versionHistory.currentReviewer === 'BDM') {
    versionHistory.currentReviewer = 'RM';
  } else if (versionHistory.currentReviewer === 'RM') {
    versionHistory.currentReviewer = 'RD';
  }

  return Promise.resolve(versionHistory);
};

export const resetVersionHistory = () => {
  versionHistory = {
    versions: [],
    currentReviewer: 'BDM',
    currentChecklist: []
  };
  return Promise.resolve(versionHistory);
};
