import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
vi.unmock('axios');

import { commentService } from './commentService';
import { axiosInstance } from './axiosConfig';
import MockAdapter from 'axios-mock-adapter';

describe('commentService', () => {
  let mockAxios: MockAdapter;

  beforeEach(() => {
    mockAxios = new MockAdapter(axiosInstance);
  });

  afterEach(() => {
    mockAxios.restore();
    vi.restoreAllMocks();
  });

  describe('Task Comments', () => {
    it('getTaskComments', async () => {
      mockAxios.onGet('/api/sprint-tasks/1/comments').reply(200, [{ commentId: 1 }]);
      const result = await commentService.getTaskComments(1);
      expect(result).toHaveLength(1);
    });

    it('addTaskComment', async () => {
      mockAxios.onPost('/api/sprint-tasks/1/comments').reply(200);
      await commentService.addTaskComment(1, { commentText: 'Hello', createdBy: 'user' });
    });

    it('updateTaskComment', async () => {
      mockAxios.onPut('/api/sprint-tasks/1/comments/2').reply(200);
      await commentService.updateTaskComment(1, 2, { commentText: 'Updated', updatedBy: 'user' });
    });

    it('deleteTaskComment', async () => {
      mockAxios.onDelete('/api/sprint-tasks/comments/2').reply(200);
      await commentService.deleteTaskComment(2);
    });
  });

  describe('Subtask Comments', () => {
    it('getCommentsBySubtaskId', async () => {
      mockAxios.onGet('/api/sprint-tasks/1/subtasks/2/comments').reply(200, [{ subtaskCommentId: 1 }]);
      const result = await commentService.getCommentsBySubtaskId(1, 2);
      expect(result).toHaveLength(1);
    });

    it('addSubtaskComment', async () => {
      mockAxios.onPost('/api/sprint-tasks/1/subtasks/2/comments').reply(200);
      await commentService.addSubtaskComment(1, 2, { commentText: 'Hello', createdBy: 'user' });
    });

    it('updateSubtaskComment', async () => {
      mockAxios.onPut('/api/sprint-tasks/1/subtasks/2/comments/3').reply(200);
      await commentService.updateSubtaskComment(1, 2, 3, { commentText: 'Updated', updatedBy: 'user' });
    });

    it('deleteSubtaskComment', async () => {
      mockAxios.onDelete('/api/sprint-tasks/subtask-comments/3').reply(200);
      await commentService.deleteSubtaskComment(3);
    });
  });
});
