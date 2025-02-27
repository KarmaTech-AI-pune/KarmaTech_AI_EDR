export interface ChecklistItem {
  id: string;
  srNo: number;
  description: string;
  remarks: string;
  enclosed: boolean;
  date: Date | null;
  isSubItem?: boolean;
  hasSubcategories?: boolean;
  parentId?: string;
  categoryIndex?: number;
}

// Store checklist data in memory
let checklist: ChecklistItem[] = [];

export const getBidPreparationChecklist = () => {
  return Promise.resolve(checklist);
};

export const updateBidPreparationChecklist = (updatedChecklist: ChecklistItem[]) => {
  checklist = updatedChecklist;
  return Promise.resolve(checklist);
};

export const saveBidPreparationChecklist = (newChecklist: ChecklistItem[]) => {
  checklist = newChecklist;
  return Promise.resolve(checklist);
};
