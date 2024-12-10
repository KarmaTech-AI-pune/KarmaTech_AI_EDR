export interface ProjectClosureComment {
    id: string;
    projectId: string;
    type: 'positives' | 'lessons-learned';
    comment: string;
  }