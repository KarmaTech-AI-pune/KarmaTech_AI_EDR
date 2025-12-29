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
  displayOrder?: number;
  estimatedHours?: number;
  actualHours?: number;
  remainingHours?: number;
  startedAt?: string;
  completedAt?: string;
  sprintPlanId?: number;
  wbsPlanId?: number;
  userTaskId?: number;
  subtasks?: SprintSubtaskDto[];
}

interface SprintSubtaskDto {
  subtaskId: number;
  subtaskkey?: string;
  tenantId?: number;
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
  subtaskcreatedDate?: string;
  subtaskupdatedDate?: string;
  subtaskType: string;
  taskid: string | number;
  displayOrder?: number;
  estimatedHours?: number;
  actualHours?: number;
  startedAt?: string;
  completedAt?: string;
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

  async updateSprintTask(task: SprintTaskDto): Promise<any> {
    const response = await axiosInstance.put('/api/sprint-tasks/single-sprint-task', task);
    return response.data;
  },

  async fetchSprintSubtaskDetails(subtaskId: string | number): Promise<SprintSubtaskDto> {
    const response = await axiosInstance.get<SprintSubtaskDto>(`/api/sprint-tasks/subtasks/${subtaskId}`);
    return response.data;
  },

  async updateSprintSubtask(subtaskId: number, subtask: SprintSubtaskDto): Promise<any> {
    const response = await axiosInstance.put(`/api/sprint-tasks/subtasks/${subtaskId}`, subtask);
    return response.data;
  },

  async createSprintTask(task: SprintTaskDto): Promise<number> {
    const response = await axiosInstance.post('/api/sprint-tasks/single-sprint-task', task);
    return response.data.taskId;
  },

  async deleteSprintTask(taskId: number): Promise<void> {
    await axiosInstance.delete(`/api/sprint-tasks/${taskId}`);
  },

  async createSprintSubtask(taskId: number, subtask: SprintSubtaskDto): Promise<number> {
    const response = await axiosInstance.post(`/api/sprint-tasks/${taskId}/subtasks`, subtask);
    return response.data.subtaskId;
  },

  async deleteSprintSubtask(subtaskId: number): Promise<void> {
    await axiosInstance.delete(`/api/sprint-tasks/subtasks/${subtaskId}`);
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

export const updateIssueAPI = async (issue: Issue): Promise<void> => {
  try {
    // Current task details to get the full DTO
    const detailedTask = await apiService.fetchSprintTaskDetails(issue.id);

    // Map updates from frontend Issue to SprintTaskDto
    const updatedDto: SprintTaskDto = {
      ...detailedTask,
      taskkey: issue.key || detailedTask.taskkey,
      taskTitle: issue.summary,
      taskdescription: issue.description,
      taskType: issue.issueType,
      taskpriority: issue.priority,
      taskstatus: issue.status,
      storyPoints: issue.storyPoints,
      taskAssineid: issue.assignee?.id || '',
      taskAssigneeName: issue.assignee?.name || '',
      taskAssigneeAvatar: issue.assignee?.avatar || '',
      taskReporterId: issue.reporter.id,
      taskReporterName: issue.reporter.name,
      taskReporterAvatar: issue.reporter.avatar,
      isExpanded: issue.isExpanded,
    };

    await apiService.updateSprintTask(updatedDto);
  } catch (error) {
    console.error(`Failed to update task ${issue.id}:`, error);
    throw error;
  }
};

export const updateSubtaskAPI = async (subtask: Subtask): Promise<void> => {
  try {
    const subtaskIdNum = parseInt(subtask.id);
    if (isNaN(subtaskIdNum)) throw new Error('Invalid subtask ID');

    // Fetch current state to avoid overwriting fields not in the frontend model
    const detailedSubtask = await apiService.fetchSprintSubtaskDetails(subtaskIdNum);

    const subtaskDto: SprintSubtaskDto = {
      ...detailedSubtask,
      subtaskkey: subtask.key || detailedSubtask.subtaskkey,
      taskid: parseInt(subtask.parentIssueId) || (detailedSubtask.taskid as number),
      subtasktitle: subtask.summary,
      subtaskdescription: subtask.description || '',
      subtaskpriority: subtask.priority,
      subtaskstatus: subtask.status,
      subtaskAssineid: subtask.assignee?.id || '',
      subtaskAssigneeName: subtask.assignee?.name || '',
      subtaskAssigneeAvatar: subtask.assignee?.avatar || '',
      subtaskReporterId: subtask.reporter.id,
      subtaskReporterName: subtask.reporter.name,
      subtaskReporterAvatar: subtask.reporter.avatar,
      subtaskType: subtask.issueType,
      attachments: subtask.attachments || detailedSubtask.attachments,
    };

    await apiService.updateSprintSubtask(subtaskIdNum, subtaskDto);
  } catch (error) {
    console.error(`Failed to update subtask ${subtask.id}:`, error);
    throw error;
  }
};

export const createIssueAPI = async (issue: Omit<Issue, 'id' | 'key' | 'subtasks' | 'comments'>): Promise<number> => {
  try {
    const taskDto: any = {
      taskTitle: issue.summary,
      taskdescription: issue.description,
      taskType: issue.issueType,
      taskpriority: issue.priority,
      taskstatus: issue.status,
      storyPoints: issue.storyPoints,
      taskAssineid: issue.assignee?.id || '',
      taskAssigneeName: issue.assignee?.name || '',
      taskAssigneeAvatar: issue.assignee?.avatar || '',
      taskReporterId: issue.reporter.id,
      taskReporterName: issue.reporter.name,
      taskReporterAvatar: issue.reporter.avatar,
      tenantId: 1, // Default tenantId
    };

    return await apiService.createSprintTask(taskDto as SprintTaskDto);
  } catch (error) {
    console.error('Failed to create task:', error);
    throw error;
  }
};

export const deleteIssueAPI = async (issueId: string): Promise<void> => {
  try {
    const taskIdNum = parseInt(issueId);
    if (isNaN(taskIdNum)) throw new Error('Invalid task ID');
    await apiService.deleteSprintTask(taskIdNum);
  } catch (error) {
    console.error(`Failed to delete task ${issueId}:`, error);
    throw error;
  }
};

export const createSubtaskAPI = async (parentIssueId: string, subtask: Omit<Subtask, 'id' | 'key' | 'comments'>): Promise<number> => {
  try {
    const taskIdNum = parseInt(parentIssueId);
    if (isNaN(taskIdNum)) throw new Error('Invalid parent task ID');

    const subtaskDto: SprintSubtaskDto = {
      subtaskId: 0, // Backend should handle this
      taskid: taskIdNum,
      subtasktitle: subtask.summary,
      subtaskdescription: subtask.description || '',
      subtaskpriority: subtask.priority,
      subtaskstatus: subtask.status,
      subtaskAssineid: subtask.assignee?.id || '',
      subtaskAssigneeName: subtask.assignee?.name || '',
      subtaskAssigneeAvatar: subtask.assignee?.avatar || '',
      subtaskReporterId: subtask.reporter.id,
      subtaskReporterName: subtask.reporter.name,
      subtaskReporterAvatar: subtask.reporter.avatar,
      subtaskType: subtask.issueType,
      tenantId: 1, // Default tenantId
    };

    return await apiService.createSprintSubtask(taskIdNum, subtaskDto);
  } catch (error) {
    console.error('Failed to create subtask:', error);
    throw error;
  }
};

export const deleteSubtaskAPI = async (subtaskId: string): Promise<void> => {
  try {
    const subtaskIdNum = parseInt(subtaskId);
    if (isNaN(subtaskIdNum)) throw new Error('Invalid subtask ID');
    await apiService.deleteSprintSubtask(subtaskIdNum);
  } catch (error) {
    console.error(`Failed to delete subtask ${subtaskId}:`, error);
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
