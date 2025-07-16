export interface GanttTask {
  id: string | number;
  text: string;
  duration: number;
  progress: number;
  parent?: string | number;
  type?: 'task' | 'project' | 'milestone';
  open?: boolean;
}

export interface GanttLink {
  id: string | number;
  source: string | number;
  target: string | number;
  type: string;
}
