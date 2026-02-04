import { Project } from '../data/types/dashboard';

export const SEVERITY_COLORS = {
  P3: {
    backgroundColor: '#ffebee',
    color: '#c62828',
    borderColor: '#ffcdd2'
  },
  P5: {
    backgroundColor: '#fff3e0',
    color: '#ef6c00',
    borderColor: '#ffcc02'
  }
} as const;

export const STATUS_COLORS = {
  falling_behind: '#f44336',
  scope_issue: '#ff9800',
  cost_overrun: '#f44336',
  on_track: '#4caf50'
} as const;

export const IMPACT_COLORS = {
  Critical: {
    backgroundColor: '#ffebee',
    color: '#c62828'
  },
  High: {
    backgroundColor: '#fff3e0',
    color: '#ef6c00'
  },
  Medium: {
    backgroundColor: '#fff8e1',
    color: '#f57f17'
  },
  Low: {
    backgroundColor: '#f3e5f5',
    color: '#7b1fa2'
  }
} as const;

export const MILESTONE_STATUS_COLORS = {
  'Overdue': {
    backgroundColor: '#ffebee',
    color: '#c62828'
  },
  'On Track': {
    backgroundColor: '#e8f5e8',
    color: '#2e7d32'
  },
  'At Risk': {
    backgroundColor: '#fff3e0',
    color: '#ef6c00'
  }
} as const;

export const REGIONS = [
  'All',
  'North America',
  'Europe',
  'Asia Pacific',
  'Latin America'
] as const;

export const TIMEFRAMES = [
  { value: 'quarter', label: 'This Quarter' },
  { value: 'year', label: 'This Year' },
  { value: 'lastYear', label: 'Last Year' }
] as const;

export const getStatusIcon = (status: Project['status']) => {
  switch (status) {
    case 'falling_behind':
      return 'Schedule';
    case 'scope_issue':
      return 'Warning';
    case 'cost_overrun':
      return 'AttachMoney';
    default:
      return 'CheckCircle';
  }
};
