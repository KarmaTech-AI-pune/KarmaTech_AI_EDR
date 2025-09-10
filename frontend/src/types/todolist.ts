export interface TeamMember {
  name: string;
  avatar: string;
  id: string;
}

export interface Issue {
  id: string;
  key: string;
  summary: string;
  description: string;
  issueType: 'Story' | 'Task' | 'Bug' | 'Epic';
  priority: 'Lowest' | 'Low' | 'Medium' | 'High' | 'Highest';
  assignee: TeamMember | null;
  reporter: TeamMember;
  status: 'To Do' | 'In Progress' | 'Review' | 'Done';
  storyPoints: number;
  fixVersion: string;
  components: string[];
  flagged: boolean;
  attachments: number;
  comments: number;
  subtasks: number;
  completedSubtasks: number;
  createdDate: string;
  updatedDate: string;
}

export interface NewIssueFormState {
  summary: string;
  description: string;
  issueType: Issue['issueType'];
  priority: Issue['priority'];
  assignee: string; // Stores assignee ID
  storyPoints: string; // Stores story points as a string for the select input
  components: string; // Stores component as a string
  fixVersion: string; // Stores fix version as a string
}
