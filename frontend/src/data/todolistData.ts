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
  taskid: number | null;
  tenantId: number;
  taskkey: string | null;
  taskTitle: string;
  taskdescription: string | null;
  taskType: string | null;
  taskpriority: string | null;
  taskAssineid: string | null;
  taskAssigneeName: string | null;
  taskAssigneeAvatar: string | null;
  taskReporterId: string | null;
  taskReporterName: string | null;
  taskReporterAvatar: string | null;
  taskstatus: string | null;
  storyPoints: number | null;
  attachments: number | null;
  isExpanded: boolean | null;
  taskcreatedDate: string | null;
  taskupdatedDate: string | null;
  acceptanceCriteria: string | null;
  displayOrder: number | null;
  estimatedHours: number | null;
  actualHours: number | null;
  remainingHours: number | null;
  startedAt: string | null;
  completedAt: string | null;
  sprintPlanId: number | null;
  wbsPlanId: number | null;
  sprintWbsPlanId: number | null;
  userTaskId: number | null;
  subtasks: SprintSubtaskDto[] | null;
}

interface SprintSubtaskDto {
  subtaskId: number | null;
  subtaskkey: string | null;
  tenantId: number;
  subtasktitle: string;
  subtaskdescription: string | null;
  subtaskpriority: string | null;
  subtaskstatus: string | null;
  subtaskAssineid: string | null;
  subtaskAssigneeName: string | null;
  subtaskAssigneeAvatar: string | null;
  subtaskReporterId: string | null;
  subtaskReporterName: string | null;
  subtaskReporterAvatar: string | null;
  attachments: number | null;
  subtaskisExpanded: boolean | null;
  subtaskcreatedDate: string | null;
  subtaskupdatedDate: string | null;
  subtaskType: string | null;
  taskid: number;
  displayOrder: number | null;
  estimatedHours: number | null;
  actualHours: number | null;
  startedAt: string | null;
  completedAt: string | null;
  comments: SprintSubtaskCommentDto[] | null;
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

export interface SprintEmployee {
  employeeId: string;
  employeeName: string;
}

export interface SprintPlanDto {
  sprintId: number;
  sprintNumber?: number;
  sprintName: string;
  startDate: string;
  endDate: string;
  sprintStatus?: string; // Kept for possible legacy use
  status: number;        // Backend Status (int)
  sprintGoal: string;
  projectId: number;
  plannedStoryPoints: number;
  actualStoryPoints: number;
  velocity: number;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt?: string;
  sprintEmployee: SprintEmployee[];
  sprintTasks?: SprintTaskDto[];
}

export interface SprintPlanInputDto {
  SprintId?: number;
  TenantId?: number;
  StartDate?: string | null;
  EndDate?: string | null;
  SprintGoal?: string;
  ProjectId?: number;
  RequiredSprintEmployees: number;
  SprintName?: string;
  PlannedStoryPoints: number;
  ActualStoryPoints: number;
  Velocity: number;
  Status: number;
  StartedAt?: string | null;
  CompletedAt?: string | null;
  CreatedAt: string;
  UpdatedAt?: string | null;
}

export interface SprintData {
  sprintPlan: SprintPlanDto;
  sprintEmployees: SprintEmployee[];
  issues: Issue[];
}

// API service functions
const apiService = {
  async fetchSprintDetails(sprintId: number, projectId?: number): Promise<SprintPlanDto> {
    const url = `/api/sprint-tasks/single-sprint-plan/${sprintId}`;
    const params = projectId ? { projectId } : undefined;
    const response = await axiosInstance.get<SprintPlanDto>(url, { params });
    return response.data;
  },

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

  async updateSprintTaskTime(command: { taskId: number; sprintWbsPlanId: number; actualHours: number; remainingHours: number }): Promise<any> {
    const response = await axiosInstance.put('/api/sprint-tasks/update-time', command);
    return response.data;
  },

  async createSprintTask(task: SprintTaskDto): Promise<number> {
    const response = await axiosInstance.post('/api/sprint-tasks/single-sprint-task', task);
    // Explicitly handle common variations in response structure
    return response.data.taskId ?? response.data.taskid ?? response.data;
  },

  async deleteSprintTask(taskId: number): Promise<void> {
    await axiosInstance.delete(`/api/sprint-tasks/${taskId}`);
  },

  async createSprintSubtask(taskId: number, subtask: SprintSubtaskDto): Promise<number> {
    const response = await axiosInstance.post(`/api/sprint-tasks/${taskId}/subtasks`, subtask);
    return response.data.subtaskId ?? response.data.subtaskid ?? response.data;
  },

  async deleteSprintSubtask(subtaskId: number): Promise<void> {
    await axiosInstance.delete(`/api/sprint-tasks/subtasks/${subtaskId}`);
  },

  async fetchProjectSchedule(projectId: number): Promise<any> {
    const response = await axiosInstance.get(`/api/project-schedule/${projectId}`);
    return response.data;
  },

  async fetchNextSprint(projectId: number, currentSprintId: number): Promise<SprintPlanDto | null> {
    try {
      const response = await axiosInstance.get<SprintPlanDto>(`/api/sprint-tasks/next`, {
        params: { projectId, currentSprintId }
      });
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        return null;
      }
      throw error;
    }
  },

  async updateSprintPlan(sprintPlan: Partial<SprintPlanDto>): Promise<void> {
    await axiosInstance.put('/api/sprint-tasks/single-sprint-plan', sprintPlan);
  },

  async createSprintPlan(sprintPlan: SprintPlanInputDto): Promise<number> {
    const response = await axiosInstance.post('/api/sprint-tasks/single-sprint-plan', sprintPlan);
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
    id: apiSubtask.subtaskId?.toString() || `subtask-${Date.now()}`,
    parentIssueId: apiSubtask.taskid.toString(),
    key: apiSubtask.subtaskkey || `SUB-${apiSubtask.subtaskId}`,
    summary: apiSubtask.subtasktitle || 'Untitled Subtask',
    description: apiSubtask.subtaskdescription || '',
    priority: transformPriority(apiSubtask.subtaskpriority || 'Medium'),
    status: transformStatus(apiSubtask.subtaskstatus || 'To Do'),
    assignee: apiSubtask.subtaskAssigneeName ? createTeamMember(
      apiSubtask.subtaskAssigneeName,
      apiSubtask.subtaskAssineid || apiSubtask.subtaskAssigneeName,
      apiSubtask.subtaskAssigneeAvatar || undefined
    ) : null,
    reporter: createTeamMember(
      apiSubtask.subtaskReporterName || 'Unknown',
      apiSubtask.subtaskReporterId || 'unknown',
      apiSubtask.subtaskReporterAvatar || undefined
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
    if (apiTask.taskid !== null) {
      const apiComments = await apiService.fetchSprintTaskComments(apiTask.taskid);
      comments = apiComments.map(transformComment);
    }
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
    acceptanceCriteria: apiTask.acceptanceCriteria || '',
    issueType,
    priority,
    assignee: apiTask.taskAssigneeName ? createTeamMember(
      apiTask.taskAssigneeName,
      apiTask.taskAssineid || apiTask.taskAssigneeName,
      apiTask.taskAssigneeAvatar || undefined
    ) : null,
    reporter: createTeamMember(
      apiTask.taskReporterName || 'Unknown',
      apiTask.taskReporterId || 'unknown',
      apiTask.taskReporterAvatar || undefined
    ),
    status,
    storyPoints: apiTask.storyPoints || 0,
    estimatedHours: apiTask.estimatedHours || 0,
    remainingHours: apiTask.remainingHours || 0,
    actualHours: apiTask.actualHours || 0,
    sprintWbsPlanId: apiTask.sprintWbsPlanId || undefined,
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
      acceptanceCriteria: issue.acceptanceCriteria || null,
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
      estimatedHours: issue.estimatedHours ?? detailedTask.estimatedHours,
      remainingHours: issue.remainingHours ?? detailedTask.remainingHours,
      actualHours: issue.actualHours ?? detailedTask.actualHours,
    };

    await apiService.updateSprintTask(updatedDto);
  } catch (error) {
    console.error(`Failed to update task ${issue.id}:`, error);
    throw error;
  }
};

export const updateIssueTimeAPI = async (issue: Issue): Promise<void> => {
  if (!issue.sprintWbsPlanId) {
    console.warn("Cannot update time tracking: SprintWbsPlanId is missing.");
    // Fallback to standard update if WBS ID is missing, or just return to avoid error?
    // User explicitly said "use SprintWbsPlanId", so better to warn and maybe try standard update 
    // OR better yet, let's try to find it if missing? data might be incomplete.
    // For now, proceed only if ID is present to ensure data integrity as requested.
    return updateIssueAPI(issue);
  }

  try {
    await apiService.updateSprintTaskTime({
      taskId: parseInt(issue.id),
      sprintWbsPlanId: issue.sprintWbsPlanId,
      actualHours: issue.actualHours || 0,
      remainingHours: issue.remainingHours || 0
    });
  } catch (error) {
    console.error(`Failed to update time for task ${issue.id}:`, error);
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

export const createIssueAPI = async (issue: Omit<Issue, 'id' | 'subtasks' | 'comments'>, sprintId: number): Promise<number> => {
  try {
    const taskDto: SprintTaskDto = {
      taskid: null,
      tenantId: 0,
      taskkey: issue.key,
      taskTitle: issue.summary,
      taskdescription: issue.description || null,
      taskType: issue.issueType || null,
      taskpriority: issue.priority || null,
      taskAssineid: issue.assignee?.id || null,
      taskAssigneeName: issue.assignee?.name || null,
      taskAssigneeAvatar: issue.assignee?.avatar || null,
      taskReporterId: issue.reporter.id || null,
      taskReporterName: issue.reporter.name || null,
      taskReporterAvatar: issue.reporter.avatar || null,
      taskstatus: null, // User requested status to be null
      storyPoints: issue.storyPoints || 0,
      attachments: 0,
      isExpanded: false,
      taskcreatedDate: null,
      taskupdatedDate: null,
      acceptanceCriteria: null,
      displayOrder: 0,
      estimatedHours: issue.estimatedHours || 0,
      actualHours: 0,
      remainingHours: issue.remainingHours || 0,
      startedAt: null,
      completedAt: null,
      sprintPlanId: sprintId,
      wbsPlanId: null,
      sprintWbsPlanId: null,
      userTaskId: null,
      subtasks: [],
    };

    return await apiService.createSprintTask(taskDto);
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

export const createSubtaskAPI = async (parentIssueId: string, subtask: Omit<Subtask, 'id' | 'comments'>): Promise<number> => {
  try {
    const taskIdNum = parseInt(parentIssueId);
    if (isNaN(taskIdNum)) throw new Error('Invalid parent task ID');

    const subtaskDto: SprintSubtaskDto = {
      subtaskId: null,
      subtaskkey: subtask.key,
      taskid: taskIdNum,
      subtasktitle: subtask.summary,
      subtaskdescription: subtask.description || null,
      subtaskpriority: subtask.priority || null,
      subtaskstatus: null, // User requested status to be null
      subtaskAssineid: subtask.assignee?.id || null,
      subtaskAssigneeName: subtask.assignee?.name || null,
      subtaskAssigneeAvatar: subtask.assignee?.avatar || null,
      subtaskReporterId: subtask.reporter.id || null,
      subtaskReporterName: subtask.reporter.name || null,
      subtaskReporterAvatar: subtask.reporter.avatar || null,
      subtaskType: subtask.issueType || null,
      tenantId: 0,
      attachments: 0,
      subtaskisExpanded: false,
      subtaskcreatedDate: null,
      subtaskupdatedDate: null,
      displayOrder: 0,
      estimatedHours: 0,
      actualHours: 0,
      startedAt: null,
      completedAt: null,
      comments: [],
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

export const updateSprintPlanAPI = async (sprintPlan: Partial<SprintPlanDto>): Promise<void> => {
  try {
    await apiService.updateSprintPlan(sprintPlan);
  } catch (error) {
    console.error('Failed to update sprint plan:', error);
    throw error;
  }
};

export const createSprintPlanAPI = async (sprintPlan: SprintPlanInputDto): Promise<number> => {
  try {
    return await apiService.createSprintPlan(sprintPlan);
  } catch (error) {
    console.error('Failed to create sprint plan:', error);
    throw error;
  }
};

// Keep static team members for now (you might want to fetch these from API too)
// Keep static team members for now (you might want to fetch these from API too)
export const teamMembers: TeamMember[] = [];

export const fetchIssuesForSprintAPI = async (sprintId: number, projectId?: number): Promise<SprintData> => {
  try {
    const sprintPlan = await apiService.fetchSprintDetails(sprintId, projectId);
    const sprintEmployees = sprintPlan.sprintEmployee || [];
    const issues: Issue[] = [];

    if (sprintPlan.sprintTasks && sprintPlan.sprintTasks.length > 0) {
      for (const taskDto of sprintPlan.sprintTasks) {
        try {
          const issue = await transformSprintTaskToIssue(taskDto);
          issues.push(issue);
        } catch (error) {
          console.error(`Failed to transform task ${taskDto.taskid}:`, error);
        }
      }
    }

    return { sprintPlan, sprintEmployees, issues };
  } catch (error) {
    console.error('Failed to fetch sprint details:', error);
    throw error;
  }
};

export const fetchActiveSprintIdAPI = async (projectId: number): Promise<number | null> => {
  try {
    const projectSchedule = await apiService.fetchProjectSchedule(projectId);
    // ProjectScheduleDto has sprintId
    return projectSchedule.sprintId || null;
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    console.error('Failed to fetch project schedule:', error);
    throw error;
  }
};

export const fetchNextSprintAPI = async (projectId: number, currentSprintId: number): Promise<SprintPlanDto | null> => {
  return await apiService.fetchNextSprint(projectId, currentSprintId);
};
