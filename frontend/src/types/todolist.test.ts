/**
 * Unit Tests for Todo List Types
 * 
 * Tests type definitions, interfaces, and type safety for todo list/issue tracking types.
 * Ensures proper TypeScript compilation and type constraints.
 */

import { describe, it, expect } from 'vitest';
import type { 
  TeamMember,
  Subtask,
  Comment,
  Issue,
  NewIssueFormState,
  NewSubtaskFormState
} from './todolist';

describe('Todo List Types', () => {
  describe('TeamMember Interface', () => {
    it('should accept valid team member object', () => {
      // Arrange
      const teamMember: TeamMember = {
        name: 'John Doe',
        avatar: 'https://example.com/avatar.jpg',
        id: 'user-123'
      };

      // Assert
      expect(teamMember.name).toBe('John Doe');
      expect(teamMember.avatar).toBe('https://example.com/avatar.jpg');
      expect(teamMember.id).toBe('user-123');
    });

    it('should enforce required properties', () => {
      // Arrange
      const teamMember: TeamMember = {
        name: 'Jane Smith',
        avatar: '/avatars/jane.png',
        id: 'jane-smith-001'
      };

      // Assert
      expect(teamMember).toHaveProperty('name');
      expect(teamMember).toHaveProperty('avatar');
      expect(teamMember).toHaveProperty('id');
      expect(typeof teamMember.name).toBe('string');
      expect(typeof teamMember.avatar).toBe('string');
      expect(typeof teamMember.id).toBe('string');
    });

    it('should handle empty values', () => {
      // Arrange
      const emptyMember: TeamMember = {
        name: '',
        avatar: '',
        id: ''
      };

      // Assert
      expect(emptyMember.name).toBe('');
      expect(emptyMember.avatar).toBe('');
      expect(emptyMember.id).toBe('');
    });
  });

  describe('Comment Interface', () => {
    it('should accept valid comment object', () => {
      // Arrange
      const author: TeamMember = { name: 'John Doe', avatar: 'avatar.jpg', id: 'john' };
      const comment: Comment = {
        id: 'comment-1',
        author: author,
        text: 'This is a comment',
        hoursLogged: 2.5,
        description: 'Work description',
        workedStoryPoints: 1,
        createdDate: '2024-01-15T10:30:00Z'
      };

      // Assert
      expect(comment.id).toBe('comment-1');
      expect(comment.author).toEqual(author);
      expect(comment.text).toBe('This is a comment');
      expect(comment.hoursLogged).toBe(2.5);
      expect(comment.description).toBe('Work description');
      expect(comment.workedStoryPoints).toBe(1);
      expect(comment.createdDate).toBe('2024-01-15T10:30:00Z');
    });

    it('should handle optional properties', () => {
      // Arrange
      const author: TeamMember = { name: 'Jane', avatar: 'jane.jpg', id: 'jane' };
      const minimalComment: Comment = {
        id: 'comment-2',
        author: author,
        text: 'Minimal comment',
        createdDate: '2024-01-15T11:00:00Z'
      };

      // Assert
      expect(minimalComment.hoursLogged).toBeUndefined();
      expect(minimalComment.description).toBeUndefined();
      expect(minimalComment.workedStoryPoints).toBeUndefined();
    });
  });

  describe('Subtask Interface', () => {
    it('should accept valid subtask object', () => {
      // Arrange
      const assignee: TeamMember = { name: 'Dev User', avatar: 'dev.jpg', id: 'dev' };
      const reporter: TeamMember = { name: 'PM User', avatar: 'pm.jpg', id: 'pm' };
      const subtask: Subtask = {
        id: 'subtask-1',
        parentIssueId: 'issue-123',
        key: 'PROJ-123-1',
        summary: 'Implement login feature',
        description: 'Add user authentication',
        priority: 'High',
        status: 'In Progress',
        assignee: assignee,
        reporter: reporter,
        issueType: 'Sub-task',
        storyPoints: 3,
        allWorkStoryPoints: 5,
        workedStoryPoints: 2,
        attachments: 1,
        comments: [],
        createdDate: '2024-01-15T09:00:00Z',
        updatedDate: '2024-01-15T15:30:00Z'
      };

      // Assert
      expect(subtask.id).toBe('subtask-1');
      expect(subtask.parentIssueId).toBe('issue-123');
      expect(subtask.key).toBe('PROJ-123-1');
      expect(subtask.priority).toBe('High');
      expect(subtask.status).toBe('In Progress');
      expect(subtask.issueType).toBe('Sub-task');
      expect(subtask.storyPoints).toBe(3);
    });

    it('should handle priority values correctly', () => {
      // Arrange
      const priorities: Subtask['priority'][] = ['Lowest', 'Low', 'Medium', 'High', 'Highest'];
      const reporter: TeamMember = { name: 'Reporter', avatar: 'rep.jpg', id: 'rep' };

      const subtasks = priorities.map((priority, index) => ({
        id: `subtask-${index}`,
        parentIssueId: 'parent-1',
        key: `PROJ-${index}`,
        summary: `Task ${priority}`,
        priority: priority,
        status: 'To Do' as const,
        assignee: null,
        reporter: reporter,
        issueType: 'Sub-task' as const,
        comments: [],
        createdDate: '2024-01-15T09:00:00Z',
        updatedDate: '2024-01-15T09:00:00Z'
      }));

      // Assert
      subtasks.forEach((subtask, index) => {
        expect(subtask.priority).toBe(priorities[index]);
      });
    });

    it('should handle status values correctly', () => {
      // Arrange
      const statuses: Subtask['status'][] = ['To Do', 'In Progress', 'Review', 'Done'];
      const reporter: TeamMember = { name: 'Reporter', avatar: 'rep.jpg', id: 'rep' };

      const subtasks = statuses.map((status, index) => ({
        id: `subtask-${index}`,
        parentIssueId: 'parent-1',
        key: `PROJ-${index}`,
        summary: `Task ${status}`,
        priority: 'Medium' as const,
        status: status,
        assignee: null,
        reporter: reporter,
        issueType: 'Sub-task' as const,
        comments: [],
        createdDate: '2024-01-15T09:00:00Z',
        updatedDate: '2024-01-15T09:00:00Z'
      }));

      // Assert
      subtasks.forEach((subtask, index) => {
        expect(subtask.status).toBe(statuses[index]);
      });
    });
  });

  describe('Issue Interface', () => {
    it('should accept valid issue object', () => {
      // Arrange
      const assignee: TeamMember = { name: 'Developer', avatar: 'dev.jpg', id: 'dev' };
      const reporter: TeamMember = { name: 'Product Manager', avatar: 'pm.jpg', id: 'pm' };
      const issue: Issue = {
        id: 'issue-1',
        key: 'PROJ-123',
        summary: 'User Authentication System',
        description: 'Implement complete user authentication',
        acceptanceCriteria: 'Users can login and logout',
        issueType: 'Story',
        priority: 'High',
        assignee: assignee,
        reporter: reporter,
        status: 'In Progress',
        storyPoints: 8,
        allWorkStoryPoints: 10,
        workedStoryPoints: 3,
        estimatedHours: 40,
        remainingHours: 25,
        actualHours: 15,
        totalLoggedHours: 15,
        fixVersion: 'v1.0.0',
        components: ['Authentication', 'Security'],
        flagged: false,
        attachments: 2,
        comments: [],
        subtasks: [],
        isExpanded: false,
        createdDate: '2024-01-10T09:00:00Z',
        updatedDate: '2024-01-15T16:00:00Z',
        sprintWbsPlanId: 123
      };

      // Assert
      expect(issue.id).toBe('issue-1');
      expect(issue.key).toBe('PROJ-123');
      expect(issue.issueType).toBe('Story');
      expect(issue.storyPoints).toBe(8);
      expect(issue.components).toEqual(['Authentication', 'Security']);
      expect(issue.flagged).toBe(false);
    });

    it('should handle issue types correctly', () => {
      // Arrange
      const issueTypes: Issue['issueType'][] = ['Story', 'Task', 'Bug', 'Epic'];
      const reporter: TeamMember = { name: 'Reporter', avatar: 'rep.jpg', id: 'rep' };

      const issues = issueTypes.map((type, index) => ({
        id: `issue-${index}`,
        key: `PROJ-${index}`,
        summary: `${type} Summary`,
        description: `${type} Description`,
        issueType: type,
        priority: 'Medium' as const,
        assignee: null,
        reporter: reporter,
        status: 'To Do' as const,
        storyPoints: 5,
        fixVersion: 'v1.0.0',
        components: [],
        flagged: false,
        attachments: 0,
        comments: [],
        subtasks: [],
        isExpanded: false,
        createdDate: '2024-01-15T09:00:00Z',
        updatedDate: '2024-01-15T09:00:00Z'
      }));

      // Assert
      issues.forEach((issue, index) => {
        expect(issue.issueType).toBe(issueTypes[index]);
      });
    });

    it('should handle optional properties correctly', () => {
      // Arrange
      const reporter: TeamMember = { name: 'Reporter', avatar: 'rep.jpg', id: 'rep' };
      const minimalIssue: Issue = {
        id: 'minimal-1',
        key: 'MIN-1',
        summary: 'Minimal Issue',
        description: 'Basic issue',
        issueType: 'Task',
        priority: 'Low',
        assignee: null,
        reporter: reporter,
        status: 'To Do',
        storyPoints: 1,
        fixVersion: 'v1.0.0',
        components: [],
        flagged: false,
        attachments: 0,
        comments: [],
        subtasks: [],
        isExpanded: false,
        createdDate: '2024-01-15T09:00:00Z',
        updatedDate: '2024-01-15T09:00:00Z'
      };

      // Assert
      expect(minimalIssue.acceptanceCriteria).toBeUndefined();
      expect(minimalIssue.allWorkStoryPoints).toBeUndefined();
      expect(minimalIssue.workedStoryPoints).toBeUndefined();
      expect(minimalIssue.estimatedHours).toBeUndefined();
      expect(minimalIssue.sprintWbsPlanId).toBeUndefined();
    });
  });

  describe('NewIssueFormState Interface', () => {
    it('should accept valid form state', () => {
      // Arrange
      const formState: NewIssueFormState = {
        summary: 'New Feature Request',
        description: 'Detailed description of the feature',
        issueType: 'Story',
        priority: 'High',
        assignee: 'user-123',
        labels: 'frontend,ui,enhancement',
        storyPoints: '5',
        components: 'Authentication',
        fixVersion: 'v2.0.0',
        estimatedHours: '20',
        remainingHours: '20'
      };

      // Assert
      expect(formState.summary).toBe('New Feature Request');
      expect(formState.issueType).toBe('Story');
      expect(formState.priority).toBe('High');
      expect(formState.storyPoints).toBe('5');
      expect(formState.labels).toBe('frontend,ui,enhancement');
    });

    it('should handle string-based form inputs', () => {
      // Arrange
      const formState: NewIssueFormState = {
        summary: '',
        description: '',
        issueType: 'Task',
        priority: 'Medium',
        assignee: '',
        labels: '',
        storyPoints: '0',
        components: '',
        fixVersion: '',
        estimatedHours: '0',
        remainingHours: '0'
      };

      // Assert - All numeric fields are strings in form state
      expect(typeof formState.storyPoints).toBe('string');
      expect(typeof formState.estimatedHours).toBe('string');
      expect(typeof formState.remainingHours).toBe('string');
    });
  });

  describe('NewSubtaskFormState Interface', () => {
    it('should accept valid subtask form state', () => {
      // Arrange
      const subtaskForm: NewSubtaskFormState = {
        summary: 'Implement login validation',
        description: 'Add client-side validation for login form',
        assignee: 'dev-456',
        priority: 'High',
        storyPoints: '2'
      };

      // Assert
      expect(subtaskForm.summary).toBe('Implement login validation');
      expect(subtaskForm.description).toBe('Add client-side validation for login form');
      expect(subtaskForm.priority).toBe('High');
      expect(subtaskForm.storyPoints).toBe('2');
    });

    it('should handle optional properties', () => {
      // Arrange
      const minimalSubtaskForm: NewSubtaskFormState = {
        summary: 'Basic subtask',
        assignee: 'user-1',
        priority: 'Low'
      };

      // Assert
      expect(minimalSubtaskForm.description).toBeUndefined();
      expect(minimalSubtaskForm.storyPoints).toBeUndefined();
    });
  });

  describe('Type Relationships and Operations', () => {
    it('should support issue-subtask relationships', () => {
      // Arrange
      const reporter: TeamMember = { name: 'PM', avatar: 'pm.jpg', id: 'pm' };
      const developer: TeamMember = { name: 'Dev', avatar: 'dev.jpg', id: 'dev' };

      const subtask: Subtask = {
        id: 'sub-1',
        parentIssueId: 'issue-1',
        key: 'PROJ-1-1',
        summary: 'Subtask 1',
        priority: 'Medium',
        status: 'To Do',
        assignee: developer,
        reporter: reporter,
        issueType: 'Sub-task',
        comments: [],
        createdDate: '2024-01-15T09:00:00Z',
        updatedDate: '2024-01-15T09:00:00Z'
      };

      const issue: Issue = {
        id: 'issue-1',
        key: 'PROJ-1',
        summary: 'Parent Issue',
        description: 'Main issue',
        issueType: 'Story',
        priority: 'High',
        assignee: developer,
        reporter: reporter,
        status: 'In Progress',
        storyPoints: 8,
        fixVersion: 'v1.0.0',
        components: [],
        flagged: false,
        attachments: 0,
        comments: [],
        subtasks: [subtask],
        isExpanded: true,
        createdDate: '2024-01-15T09:00:00Z',
        updatedDate: '2024-01-15T09:00:00Z'
      };

      // Assert
      expect(issue.subtasks).toHaveLength(1);
      expect(issue.subtasks[0].parentIssueId).toBe(issue.id);
      expect(issue.subtasks[0].key).toContain(issue.key);
    });

    it('should support filtering operations', () => {
      // Arrange
      const reporter: TeamMember = { name: 'Reporter', avatar: 'rep.jpg', id: 'rep' };
      const issues: Issue[] = [
        {
          id: '1', key: 'PROJ-1', summary: 'Story 1', description: 'Desc 1',
          issueType: 'Story', priority: 'High', assignee: null, reporter,
          status: 'To Do', storyPoints: 5, fixVersion: 'v1.0.0', components: [],
          flagged: true, attachments: 0, comments: [], subtasks: [], isExpanded: false,
          createdDate: '2024-01-15T09:00:00Z', updatedDate: '2024-01-15T09:00:00Z'
        },
        {
          id: '2', key: 'PROJ-2', summary: 'Bug 1', description: 'Desc 2',
          issueType: 'Bug', priority: 'Critical', assignee: null, reporter,
          status: 'In Progress', storyPoints: 3, fixVersion: 'v1.0.0', components: [],
          flagged: false, attachments: 1, comments: [], subtasks: [], isExpanded: false,
          createdDate: '2024-01-15T09:00:00Z', updatedDate: '2024-01-15T09:00:00Z'
        }
      ];

      // Act
      const stories = issues.filter(i => i.issueType === 'Story');
      const bugs = issues.filter(i => i.issueType === 'Bug');
      const flaggedIssues = issues.filter(i => i.flagged);
      const inProgressIssues = issues.filter(i => i.status === 'In Progress');

      // Assert
      expect(stories).toHaveLength(1);
      expect(bugs).toHaveLength(1);
      expect(flaggedIssues).toHaveLength(1);
      expect(inProgressIssues).toHaveLength(1);
    });

    it('should support story point calculations', () => {
      // Arrange
      const reporter: TeamMember = { name: 'Reporter', avatar: 'rep.jpg', id: 'rep' };
      const issues: Issue[] = [
        {
          id: '1', key: 'PROJ-1', summary: 'Issue 1', description: 'Desc',
          issueType: 'Story', priority: 'High', assignee: null, reporter,
          status: 'Done', storyPoints: 8, workedStoryPoints: 8, fixVersion: 'v1.0.0',
          components: [], flagged: false, attachments: 0, comments: [], subtasks: [],
          isExpanded: false, createdDate: '2024-01-15T09:00:00Z', updatedDate: '2024-01-15T09:00:00Z'
        },
        {
          id: '2', key: 'PROJ-2', summary: 'Issue 2', description: 'Desc',
          issueType: 'Story', priority: 'Medium', assignee: null, reporter,
          status: 'In Progress', storyPoints: 5, workedStoryPoints: 3, fixVersion: 'v1.0.0',
          components: [], flagged: false, attachments: 0, comments: [], subtasks: [],
          isExpanded: false, createdDate: '2024-01-15T09:00:00Z', updatedDate: '2024-01-15T09:00:00Z'
        }
      ];

      // Act
      const totalStoryPoints = issues.reduce((sum, issue) => sum + issue.storyPoints, 0);
      const totalWorkedPoints = issues.reduce((sum, issue) => sum + (issue.workedStoryPoints || 0), 0);
      const completionRate = totalWorkedPoints / totalStoryPoints;

      // Assert
      expect(totalStoryPoints).toBe(13);
      expect(totalWorkedPoints).toBe(11);
      expect(completionRate).toBeCloseTo(0.846, 3);
    });
  });

  describe('JSON Serialization Compatibility', () => {
    it('should serialize and deserialize Issue correctly', () => {
      // Arrange
      const reporter: TeamMember = { name: 'Reporter', avatar: 'rep.jpg', id: 'rep' };
      const originalIssue: Issue = {
        id: 'serialize-test',
        key: 'SER-1',
        summary: 'Serializable Issue',
        description: 'Test serialization',
        issueType: 'Story',
        priority: 'Medium',
        assignee: null,
        reporter: reporter,
        status: 'To Do',
        storyPoints: 3,
        fixVersion: 'v1.0.0',
        components: ['Component1'],
        flagged: false,
        attachments: 0,
        comments: [],
        subtasks: [],
        isExpanded: false,
        createdDate: '2024-01-15T09:00:00Z',
        updatedDate: '2024-01-15T09:00:00Z'
      };

      // Act
      const serialized = JSON.stringify(originalIssue);
      const deserialized: Issue = JSON.parse(serialized);

      // Assert
      expect(deserialized).toEqual(originalIssue);
      expect(typeof deserialized.storyPoints).toBe('number');
      expect(typeof deserialized.flagged).toBe('boolean');
      expect(Array.isArray(deserialized.components)).toBe(true);
    });

    it('should handle null assignee in serialization', () => {
      // Arrange
      const reporter: TeamMember = { name: 'Reporter', avatar: 'rep.jpg', id: 'rep' };
      const issueWithNullAssignee: Issue = {
        id: 'null-assignee',
        key: 'NULL-1',
        summary: 'Unassigned Issue',
        description: 'No assignee',
        issueType: 'Task',
        priority: 'Low',
        assignee: null,
        reporter: reporter,
        status: 'To Do',
        storyPoints: 1,
        fixVersion: 'v1.0.0',
        components: [],
        flagged: false,
        attachments: 0,
        comments: [],
        subtasks: [],
        isExpanded: false,
        createdDate: '2024-01-15T09:00:00Z',
        updatedDate: '2024-01-15T09:00:00Z'
      };

      // Act
      const serialized = JSON.stringify(issueWithNullAssignee);
      const deserialized: Issue = JSON.parse(serialized);

      // Assert
      expect(deserialized.assignee).toBeNull();
      expect(deserialized).toEqual(issueWithNullAssignee);
    });
  });
});