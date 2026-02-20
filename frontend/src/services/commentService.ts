import { axiosInstance } from './axiosConfig';

export interface AddSubtaskCommentRequest {
    commentText: string;
    createdBy: string;
}

export interface TaskCommentResponse {
    commentId: number;
    taskid: number;
    commentText: string;
    createdBy: string;
    createdDate: string;
    updatedBy?: string;
    updatedDate?: string;
}

export interface SubtaskCommentResponse {
    subtaskCommentId: number;
    taskid: number;
    subtaskId: number;
    commentText: string;
    createdBy: string;
    createdDate: string;
    updatedBy?: string;
    updatedDate?: string;
}

export interface UpdateCommentRequest {
    commentText: string;
    updatedBy: string;
}

export const commentService = {
    // --- Task Comments ---

    // Get all comments for a task
    async getTaskComments(taskId: number): Promise<TaskCommentResponse[]> {
        const response = await axiosInstance.get<TaskCommentResponse[]>(
            `/api/sprint-tasks/${taskId}/comments`
        );
        return response.data;
    },

    // Add a new comment to a task
    async addTaskComment(
        taskId: number,
        commentData: AddSubtaskCommentRequest
    ): Promise<void> {
        await axiosInstance.post(
            `/api/sprint-tasks/${taskId}/comments`,
            commentData
        );
    },

    // Update an existing task comment
    async updateTaskComment(
        taskId: number,
        commentId: number,
        commentData: UpdateCommentRequest
    ): Promise<void> {
        await axiosInstance.put(
            `/api/sprint-tasks/${taskId}/comments/${commentId}`,
            commentData
        );
    },

    // Delete a task comment
    async deleteTaskComment(commentId: number): Promise<void> {
        await axiosInstance.delete(`/api/sprint-tasks/comments/${commentId}`);
    },

    // --- Subtask Comments ---

    // Get all comments for a subtask
    async getCommentsBySubtaskId(taskId: number, subtaskId: number): Promise<SubtaskCommentResponse[]> {
        const response = await axiosInstance.get<SubtaskCommentResponse[]>(
            `/api/sprint-tasks/${taskId}/subtasks/${subtaskId}/comments`
        );
        return response.data;
    },

    // Add a new comment to a subtask
    async addSubtaskComment(
        taskId: number,
        subtaskId: number,
        commentData: AddSubtaskCommentRequest
    ): Promise<void> {
        await axiosInstance.post(
            `/api/sprint-tasks/${taskId}/subtasks/${subtaskId}/comments`,
            commentData
        );
    },

    // Update an existing subtask comment
    async updateSubtaskComment(
        taskId: number,
        subtaskId: number,
        commentId: number,
        commentData: UpdateCommentRequest
    ): Promise<void> {
        await axiosInstance.put(
            `/api/sprint-tasks/${taskId}/subtasks/${subtaskId}/comments/${commentId}`,
            commentData
        );
    },

    // Delete a subtask comment
    async deleteSubtaskComment(commentId: number): Promise<void> {
        await axiosInstance.delete(`/api/sprint-tasks/subtask-comments/${commentId}`);
    },
};
