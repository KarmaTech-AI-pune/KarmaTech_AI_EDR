import { Project } from '../types/dashboard';

export const priorityProjects: Project[] = [
  {
    id: 'P001',
    name: 'E-commerce Platform',
    severity: 'P3',
    status: 'falling_behind',
    delay: 15,
    region: 'North America',
    budget: 250000,
    spent: 180000,
    timeline: '65%',
    issues: ['Scope creep', 'Resource shortage']
  },
  {
    id: 'P002',
    name: 'Mobile Banking App',
    severity: 'P5',
    status: 'scope_issue',
    delay: 8,
    region: 'Europe',
    budget: 180000,
    spent: 120000,
    timeline: '55%',
    issues: ['Technical complexity', 'Client approval delays']
  },
  {
    id: 'P003',
    name: 'AI Analytics Tool',
    severity: 'P3',
    status: 'cost_overrun',
    delay: 22,
    region: 'Asia Pacific',
    budget: 320000,
    spent: 280000,
    timeline: '70%',
    issues: ['Infrastructure costs', 'Extended testing']
  }
];
