import { PendingApproval, MilestoneData, TaskItem, AISuggestion } from '../types/dashboard';

export const pendingApprovals: PendingApproval[] = [
  { id: 1, project: 'E-commerce Platform', manager: 'Sarah Johnson', days: 12, impact: 'High' },
  { id: 2, project: 'Mobile Banking App', manager: 'Mike Chen', days: 8, impact: 'Medium' },
  { id: 3, project: 'AI Analytics Tool', manager: 'David Wilson', days: 15, impact: 'Critical' }
];

export const milestoneData: MilestoneData[] = [
  {
    id: 1,
    project: 'E-commerce Platform',
    milestone: 'M1 - Design Complete',
    expectedAmount: 50000,
    status: 'Overdue',
    daysDelayed: 12,
    penalty: 2500
  },
  {
    id: 2,
    project: 'Mobile Banking App',
    milestone: 'M2 - Development',
    expectedAmount: 75000,
    status: 'On Track',
    daysDelayed: 0,
    penalty: 0
  },
  {
    id: 3,
    project: 'AI Analytics Tool',
    milestone: 'M3 - Testing',
    expectedAmount: 90000,
    status: 'At Risk',
    daysDelayed: 5,
    penalty: 1800
  }
];

export const taskItems: TaskItem[] = [
  { id: 1, title: 'Fix P3 project delays', category: 'urgent_important' },
  { id: 2, title: 'Resolve approval bottlenecks', category: 'urgent_important' },
  { id: 3, title: 'Resource planning Q2', category: 'important_not_urgent' },
  { id: 4, title: 'Process improvements', category: 'important_not_urgent' },
  { id: 5, title: 'Client meeting requests', category: 'urgent_not_important' },
  { id: 6, title: 'Status report updates', category: 'urgent_not_important' },
  { id: 7, title: 'Archive old documents', category: 'neither' },
  { id: 8, title: 'Review training materials', category: 'neither' }
];

export const aiSuggestions: AISuggestion[] = [
  {
    id: 1,
    type: 'success',
    title: 'Resource Reallocation',
    description: 'Move 2 developers from Project R1 to E-commerce Platform',
    icon: 'CheckCircle'
  },
  {
    id: 2,
    type: 'warning',
    title: 'Approval Escalation',
    description: 'Escalate Mobile Banking approvals to Director level',
    icon: 'Warning'
  }
];
