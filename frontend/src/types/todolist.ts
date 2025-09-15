export interface TeamMember {
  name: string;
  avatar: string;
  id: string;
}

export interface Subtask {
  id: string;
  parentIssueId: string;
  key: string; // e.g., PROJ-123-1, PROJ-123-2
  summary: string;
  description?: string;
  priority: "Lowest" | "Low" | "Medium" | "High" | "Highest";
  status: "To Do" | "In Progress" | "Review" | "Done";
  assignee: TeamMember | null;
  reporter: TeamMember;
  issueType: "Sub-task";
  storyPoints?: number;
  attachments: number;
  comments: number;
  createdDate: string;
  updatedDate: string;
}

export interface Issue {
  id: string;
  key: string;
  summary: string;
  description: string;
  issueType: "Story" | "Task" | "Bug" | "Epic";
  priority: "Lowest" | "Low" | "Medium" | "High" | "Highest";
  assignee: TeamMember | null;
  reporter: TeamMember;
  status: "To Do" | "In Progress" | "Review" | "Done";
  storyPoints: number;
  fixVersion: string;
  components: string[];
  flagged: boolean;
  attachments: number;
  comments: number;
  subtasks: Subtask[];
  isExpanded: boolean;
  createdDate: string;
  updatedDate: string;
}

export interface NewIssueFormState {
  summary: string;
  description: string;
  issueType: Issue["issueType"];
  priority: Issue["priority"];
  assignee: string; // Stores assignee ID
  labels: string; // Stores labels as a string
  storyPoints: string; // Stores story points as a string for the select input
  components: string; // Stores component as a string
  fixVersion: string; // Stores fix version as a string
}

export interface NewSubtaskFormState {
  summary: string;
  description?: string;
  assignee: string;
  priority: Subtask["priority"];
  storyPoints?: string;
}
