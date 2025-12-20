import { Issue, TeamMember, Subtask, Comment } from '../types/todolist';
import { axiosInstance } from '../services/axiosConfig';

// API response types based on backend DTOs (camelCase)
interface SprintTaskSummaryDto {
  taskid: number;
  taskTitle: string;
  storyPoints?: number;
  taskAssigneeName: string;
  taskstatus: string;
  taskpriority: string;
}

interface SprintTaskDto {
  taskid: number;
  tenantId: number;
  taskkey: string;
  taskTitle: string;
  taskdescription: string;
  taskType: string;
  taskpriority: string;
  taskAssineid: string;
  taskAssigneeName: string;
  taskAssigneeAvatar: string;
  taskReporterId: string;
  taskReporterName: string;
  taskReporterAvatar: string;
  taskstatus: string;
  storyPoints?: number;
  attachments?: number;
  isExpanded?: boolean;
  taskcreatedDate: string;
  taskupdatedDate: string;
  acceptanceCriteria: string;
  subtasks?: SprintSubtaskDto[];
}

interface SprintSubtaskDto {
  subtaskId: number;
  subtaskkey: string;
  subtasktitle: string;
  subtaskdescription: string;
  subtaskpriority: string;
  subtaskstatus: string;
  subtaskAssineid: string;
  subtaskAssigneeName: string;
  subtaskAssigneeAvatar: string;
  subtaskReporterId: string;
  subtaskReporterName: string;
  subtaskReporterAvatar: string;
  attachments?: number;
  subtaskisExpanded?: boolean;
  subtaskcreatedDate: string;
  subtaskupdatedDate: string;
  subtaskType: string;
  taskid: string;
  estimatedHours?: number;
  comments?: SprintSubtaskCommentDto[];
}

interface SprintSubtaskCommentDto {
  subtaskCommentId: number;
  taskid: number;
  subtaskId: number;
  commentText: string;
  createdBy: string;
  createdDate: string;
}

interface SprintTaskCommentDto {
  commentId: number;
  taskid: string;
  commentText: string;
  createdBy: string;
  createdDate: string;
}

// API service functions
const apiService = {
  async fetchSprintTasksByProject(projectId: number): Promise<SprintTaskSummaryDto[]> {
    const response = await axiosInstance.get<SprintTaskSummaryDto[]>(`/api/sprint-tasks/project/${projectId}/tasks`);
    return response.data;
  },

  async fetchSprintTaskDetails(taskId: string | number): Promise<SprintTaskDto> {
    const response = await axiosInstance.get<SprintTaskDto>(`/api/sprint-tasks/${taskId}`);
    return response.data;
  },

  async fetchSprintTaskComments(taskId: string | number): Promise<SprintTaskCommentDto[]> {
    const response = await axiosInstance.get<SprintTaskCommentDto[]>(`/api/sprint-tasks/${taskId}/comments`);
    return response.data;
  },
};

// Data transformation functions
const transformPriority = (apiPriority: string): "Lowest" | "Low" | "Medium" | "High" | "Highest" => {
  const priorityMap: { [key: string]: "Lowest" | "Low" | "Medium" | "High" | "Highest" } = {
    'Lowest': 'Lowest',
    'Low': 'Low',
    'Medium': 'Medium',
    'High': 'High',
    'Highest': 'Highest',
  };
  return priorityMap[apiPriority] || 'Medium';
};

const transformStatus = (apiStatus: string): "To Do" | "In Progress" | "Review" | "Done" => {
  const statusMap: { [key: string]: "To Do" | "In Progress" | "Review" | "Done" } = {
    'To Do': 'To Do',
    'In Progress': 'In Progress',
    'Review': 'Review',
    'Done': 'Done',
    'Pending': 'To Do', // Map Pending to To Do as fallback
  };
  return statusMap[apiStatus] || 'To Do';
};

const transformIssueType = (apiType: string): "Story" | "Task" | "Bug" | "Epic" => {
  const typeMap: { [key: string]: "Story" | "Task" | "Bug" | "Epic" } = {
    'Story': 'Story',
    'Task': 'Task',
    'Bug': 'Bug',
    'Epic': 'Epic',
  };
  return typeMap[apiType] || 'Task';
};

const createTeamMember = (name: string, id: string, avatar?: string): TeamMember => ({
  name,
  avatar: avatar || name.split(' ').map(n => n[0]).join('').toUpperCase(),
  id,
});

const transformSubtask = (apiSubtask: SprintSubtaskDto): Subtask => {
  const subtask: Subtask = {
    id: apiSubtask.subtaskId.toString(),
    parentIssueId: apiSubtask.taskid?.toString() || '',
    key: apiSubtask.subtaskkey || `SUB-${apiSubtask.subtaskId}`,
    summary: apiSubtask.subtasktitle || 'Untitled Subtask',
    description: apiSubtask.subtaskdescription || '',
    priority: transformPriority(apiSubtask.subtaskpriority || 'Medium'),
    status: transformStatus(apiSubtask.subtaskstatus || 'To Do'),
    assignee: apiSubtask.subtaskAssigneeName ? createTeamMember(
      apiSubtask.subtaskAssigneeName,
      apiSubtask.subtaskAssineid || apiSubtask.subtaskAssigneeName,
      apiSubtask.subtaskAssigneeAvatar
    ) : null,
    reporter: createTeamMember(
      apiSubtask.subtaskReporterName || 'Unknown',
      apiSubtask.subtaskReporterId || 'unknown',
      apiSubtask.subtaskReporterAvatar
    ),
    issueType: 'Sub-task',
    storyPoints: apiSubtask.estimatedHours || 0,
    attachments: apiSubtask.attachments || 0,
    comments: apiSubtask.comments ? apiSubtask.comments.map(c => ({
      id: c.subtaskCommentId.toString(),
      author: createTeamMember(c.createdBy, c.createdBy),
      text: c.commentText,
      createdDate: c.createdDate,
    })) : [],
    createdDate: apiSubtask.subtaskcreatedDate || new Date().toISOString(),
    updatedDate: apiSubtask.subtaskupdatedDate || new Date().toISOString(),
  };

  return subtask;
};

const transformComment = (apiComment: SprintTaskCommentDto): Comment => ({
  id: apiComment.commentId.toString(),
  author: createTeamMember(apiComment.createdBy, apiComment.createdBy),
  text: apiComment.commentText,
  createdDate: apiComment.createdDate,
});

const transformSprintTaskToIssue = async (apiTask: SprintTaskDto): Promise<Issue> => {
  let comments: Comment[] = [];
  try {
    const apiComments = await apiService.fetchSprintTaskComments(apiTask.taskid);
    comments = apiComments.map(transformComment);
  } catch (error) {
    console.warn(`Failed to fetch comments for task ${apiTask.taskid}:`, error);
  }

  const issueType = transformIssueType(apiTask.taskType || 'Task');
  const priority = transformPriority(apiTask.taskpriority || 'Medium');
  const status = transformStatus(apiTask.taskstatus || 'To Do');

  const issue: Issue = {
    id: apiTask.taskid?.toString() || `task-${Date.now()}`,
    key: apiTask.taskkey || `PROJ-${apiTask.taskid}`,
    summary: apiTask.taskTitle || 'Untitled Task',
    description: apiTask.taskdescription || '',
    issueType,
    priority,
    assignee: apiTask.taskAssigneeName ? createTeamMember(
      apiTask.taskAssigneeName,
      apiTask.taskAssineid || apiTask.taskAssigneeName,
      apiTask.taskAssigneeAvatar
    ) : null,
    reporter: createTeamMember(
      apiTask.taskReporterName || 'Unknown',
      apiTask.taskReporterId || 'unknown',
      apiTask.taskReporterAvatar
    ),
    status,
    storyPoints: apiTask.storyPoints || 0,
    fixVersion: 'Version 1.0',
    components: [],
    flagged: false,
    attachments: apiTask.attachments || 0,
    comments,
    subtasks: apiTask.subtasks ? apiTask.subtasks.map(transformSubtask) : [],
    isExpanded: apiTask.isExpanded || false,
    createdDate: apiTask.taskcreatedDate || new Date().toISOString(),
    updatedDate: apiTask.taskupdatedDate || new Date().toISOString(),
  };

  return issue;
};

// Exported data fetching functions
export const fetchIssuesFromAPI = async (projectId: number): Promise<Issue[]> => {
  try {
    // First, get the task summaries
    const taskSummaries = await apiService.fetchSprintTasksByProject(projectId);

    // Then fetch detailed information for each task
    const issues: Issue[] = [];
    for (const summary of taskSummaries) {
      try {
        const detailedTask = await apiService.fetchSprintTaskDetails(summary.taskid);
        const issue = await transformSprintTaskToIssue(detailedTask);
        issues.push(issue);
      } catch (error) {
        console.error(`Failed to fetch details for task ${summary.taskid}:`, error);
        // Create a basic issue from summary data as fallback
        const basicIssue: Issue = {
          id: summary.taskid.toString(),
          key: `TASK-${summary.taskid}`,
          summary: summary.taskTitle || 'Untitled Task',
          description: '',
          issueType: 'Task',
          priority: transformPriority(summary.taskpriority),
          assignee: summary.taskAssigneeName ? createTeamMember(summary.taskAssigneeName, summary.taskAssigneeName) : null,
          reporter: createTeamMember('Unknown', 'unknown'),
          status: transformStatus(summary.taskstatus),
          storyPoints: summary.storyPoints || 0,
          fixVersion: 'Version 1.0',
          components: [],
          flagged: false,
          attachments: 0,
          comments: [],
          subtasks: [],
          isExpanded: false,
          createdDate: new Date().toISOString(),
          updatedDate: new Date().toISOString(),
        };
        issues.push(basicIssue);
      }
    }

    return issues;
  } catch (error) {
    console.error('Failed to fetch issues from API:', error);
    throw error;
  }
};

// Keep static team members for now (you might want to fetch these from API too)
export const teamMembers: TeamMember[] = [
  { name: 'John Smith', avatar: 'JS', id: 'john' },
  { name: 'Sarah Wilson', avatar: 'SW', id: 'sarah' },
  { name: 'Mike Johnson', avatar: 'MJ', id: 'mike' },
  { name: 'Lisa Chen', avatar: 'LC', id: 'lisa' },
  { name: 'David Kim', avatar: 'DK', id: 'david' },
  { name: 'Emma Davis', avatar: 'ED', id: 'emma' },
  { name: 'Chris Wilson', avatar: 'CW', id: 'chris' }
];
