/**
 * Unit Tests for Gantt Types
 * 
 * Tests type definitions, interfaces, and type safety for Gantt chart types.
 * Ensures proper TypeScript compilation and type constraints.
 */

import { describe, it, expect } from 'vitest';
import type { 
  GanttTask,
  GanttLink
} from './gantt';

describe('Gantt Types', () => {
  describe('GanttTask Interface', () => {
    it('should accept valid gantt task object', () => {
      // Arrange
      const task: GanttTask = {
        id: 'task-1',
        text: 'Project Planning',
        duration: 5,
        progress: 0.3
      };

      // Assert
      expect(task.id).toBe('task-1');
      expect(task.text).toBe('Project Planning');
      expect(task.duration).toBe(5);
      expect(task.progress).toBe(0.3);
    });

    it('should handle numeric id', () => {
      // Arrange
      const taskWithNumericId: GanttTask = {
        id: 123,
        text: 'Development Phase',
        duration: 10,
        progress: 0.5
      };

      // Assert
      expect(taskWithNumericId.id).toBe(123);
      expect(typeof taskWithNumericId.id).toBe('number');
    });

    it('should handle optional properties', () => {
      // Arrange
      const taskWithOptionals: GanttTask = {
        id: 'task-2',
        text: 'Testing Phase',
        duration: 3,
        progress: 0.8,
        parent: 'project-1',
        type: 'task',
        open: true
      };

      // Assert
      expect(taskWithOptionals.parent).toBe('project-1');
      expect(taskWithOptionals.type).toBe('task');
      expect(taskWithOptionals.open).toBe(true);
    });

    it('should handle different task types', () => {
      // Arrange
      const projectTask: GanttTask = {
        id: 1,
        text: 'Main Project',
        duration: 30,
        progress: 0.4,
        type: 'project',
        open: true
      };

      const milestoneTask: GanttTask = {
        id: 2,
        text: 'Project Kickoff',
        duration: 0,
        progress: 1.0,
        type: 'milestone'
      };

      // Assert
      expect(projectTask.type).toBe('project');
      expect(milestoneTask.type).toBe('milestone');
      expect(milestoneTask.duration).toBe(0);
      expect(milestoneTask.progress).toBe(1.0);
    });

    it('should handle progress values correctly', () => {
      // Arrange
      const tasks: GanttTask[] = [
        { id: 1, text: 'Not Started', duration: 5, progress: 0 },
        { id: 2, text: 'In Progress', duration: 5, progress: 0.5 },
        { id: 3, text: 'Completed', duration: 5, progress: 1.0 }
      ];

      // Assert
      tasks.forEach(task => {
        expect(task.progress).toBeGreaterThanOrEqual(0);
        expect(task.progress).toBeLessThanOrEqual(1.0);
      });
    });

    it('should support hierarchical structure', () => {
      // Arrange
      const parentTask: GanttTask = {
        id: 'parent-1',
        text: 'Parent Task',
        duration: 15,
        progress: 0.6,
        type: 'project',
        open: true
      };

      const childTask: GanttTask = {
        id: 'child-1',
        text: 'Child Task',
        duration: 5,
        progress: 0.8,
        parent: 'parent-1',
        type: 'task'
      };

      // Assert
      expect(childTask.parent).toBe(parentTask.id);
      expect(parentTask.type).toBe('project');
      expect(childTask.type).toBe('task');
    });
  });

  describe('GanttLink Interface', () => {
    it('should accept valid gantt link object', () => {
      // Arrange
      const link: GanttLink = {
        id: 'link-1',
        source: 'task-1',
        target: 'task-2',
        type: 'finish_to_start'
      };

      // Assert
      expect(link.id).toBe('link-1');
      expect(link.source).toBe('task-1');
      expect(link.target).toBe('task-2');
      expect(link.type).toBe('finish_to_start');
    });

    it('should handle numeric ids for links', () => {
      // Arrange
      const linkWithNumericIds: GanttLink = {
        id: 123,
        source: 456,
        target: 789,
        type: 'start_to_start'
      };

      // Assert
      expect(linkWithNumericIds.id).toBe(123);
      expect(linkWithNumericIds.source).toBe(456);
      expect(linkWithNumericIds.target).toBe(789);
      expect(typeof linkWithNumericIds.id).toBe('number');
      expect(typeof linkWithNumericIds.source).toBe('number');
      expect(typeof linkWithNumericIds.target).toBe('number');
    });

    it('should handle different link types', () => {
      // Arrange
      const linkTypes = [
        'finish_to_start',
        'start_to_start',
        'finish_to_finish',
        'start_to_finish'
      ];

      const links: GanttLink[] = linkTypes.map((type, index) => ({
        id: `link-${index}`,
        source: `task-${index}`,
        target: `task-${index + 1}`,
        type
      }));

      // Assert
      links.forEach((link, index) => {
        expect(link.type).toBe(linkTypes[index]);
        expect(typeof link.type).toBe('string');
      });
    });

    it('should support mixed id types in relationships', () => {
      // Arrange
      const mixedLink: GanttLink = {
        id: 'mixed-link-1',
        source: 123,
        target: 'task-abc',
        type: 'finish_to_start'
      };

      // Assert
      expect(typeof mixedLink.source).toBe('number');
      expect(typeof mixedLink.target).toBe('string');
      expect(mixedLink.source).toBe(123);
      expect(mixedLink.target).toBe('task-abc');
    });
  });

  describe('Type Relationships and Compatibility', () => {
    it('should demonstrate task-link relationships', () => {
      // Arrange
      const tasks: GanttTask[] = [
        { id: 1, text: 'Task A', duration: 3, progress: 1.0 },
        { id: 2, text: 'Task B', duration: 5, progress: 0.6 },
        { id: 3, text: 'Task C', duration: 2, progress: 0.0 }
      ];

      const links: GanttLink[] = [
        { id: 1, source: 1, target: 2, type: 'finish_to_start' },
        { id: 2, source: 2, target: 3, type: 'finish_to_start' }
      ];

      // Act
      const taskIds = tasks.map(t => t.id);
      const linkedTaskIds = links.flatMap(l => [l.source, l.target]);
      const allTasksLinked = linkedTaskIds.every(id => taskIds.includes(id));

      // Assert
      expect(allTasksLinked).toBe(true);
      expect(links).toHaveLength(2);
    });

    it('should support filtering and mapping operations', () => {
      // Arrange
      const tasks: GanttTask[] = [
        { id: 1, text: 'Project Setup', duration: 2, progress: 1.0, type: 'project' },
        { id: 2, text: 'Development', duration: 10, progress: 0.7, type: 'task' },
        { id: 3, text: 'Testing', duration: 5, progress: 0.3, type: 'task' },
        { id: 4, text: 'Deployment', duration: 1, progress: 0.0, type: 'milestone' }
      ];

      // Act
      const completedTasks = tasks.filter(t => t.progress === 1.0);
      const inProgressTasks = tasks.filter(t => t.progress > 0 && t.progress < 1.0);
      const totalDuration = tasks.reduce((sum, t) => sum + t.duration, 0);
      const taskNames = tasks.map(t => t.text);

      // Assert
      expect(completedTasks).toHaveLength(1);
      expect(inProgressTasks).toHaveLength(2);
      expect(totalDuration).toBe(18);
      expect(taskNames).toContain('Development');
    });

    it('should handle parent-child relationships', () => {
      // Arrange
      const tasks: GanttTask[] = [
        { id: 'proj-1', text: 'Main Project', duration: 20, progress: 0.5, type: 'project' },
        { id: 'phase-1', text: 'Phase 1', duration: 10, progress: 0.8, parent: 'proj-1', type: 'project' },
        { id: 'task-1', text: 'Task 1.1', duration: 5, progress: 1.0, parent: 'phase-1', type: 'task' },
        { id: 'task-2', text: 'Task 1.2', duration: 5, progress: 0.6, parent: 'phase-1', type: 'task' }
      ];

      // Act
      const rootTasks = tasks.filter(t => !t.parent);
      const childTasks = tasks.filter(t => t.parent === 'phase-1');
      const projectTasks = tasks.filter(t => t.type === 'project');

      // Assert
      expect(rootTasks).toHaveLength(1);
      expect(childTasks).toHaveLength(2);
      expect(projectTasks).toHaveLength(2);
    });
  });

  describe('Edge Cases and Validation', () => {
    it('should handle zero duration tasks', () => {
      // Arrange
      const zeroTask: GanttTask = {
        id: 'zero-task',
        text: 'Instant Task',
        duration: 0,
        progress: 1.0,
        type: 'milestone'
      };

      // Assert
      expect(zeroTask.duration).toBe(0);
      expect(zeroTask.progress).toBe(1.0);
    });

    it('should handle negative progress values', () => {
      // Arrange
      const negativeProgressTask: GanttTask = {
        id: 'negative-task',
        text: 'Negative Progress Task',
        duration: 5,
        progress: -0.1
      };

      // Assert
      expect(negativeProgressTask.progress).toBe(-0.1);
      expect(negativeProgressTask.progress).toBeLessThan(0);
    });

    it('should handle progress values greater than 1', () => {
      // Arrange
      const overProgressTask: GanttTask = {
        id: 'over-task',
        text: 'Over Progress Task',
        duration: 5,
        progress: 1.5
      };

      // Assert
      expect(overProgressTask.progress).toBe(1.5);
      expect(overProgressTask.progress).toBeGreaterThan(1.0);
    });

    it('should handle empty text values', () => {
      // Arrange
      const emptyTextTask: GanttTask = {
        id: 'empty-text',
        text: '',
        duration: 3,
        progress: 0.5
      };

      // Assert
      expect(emptyTextTask.text).toBe('');
      expect(emptyTextTask.text.length).toBe(0);
    });

    it('should handle special characters in text', () => {
      // Arrange
      const specialCharTask: GanttTask = {
        id: 'special-char',
        text: 'Task with "quotes" & <tags> and émojis 🚀',
        duration: 4,
        progress: 0.25
      };

      // Assert
      expect(specialCharTask.text).toContain('"quotes"');
      expect(specialCharTask.text).toContain('<tags>');
      expect(specialCharTask.text).toContain('🚀');
    });
  });

  describe('JSON Serialization Compatibility', () => {
    it('should serialize and deserialize GanttTask correctly', () => {
      // Arrange
      const originalTask: GanttTask = {
        id: 'serialize-task',
        text: 'Serializable Task',
        duration: 7,
        progress: 0.65,
        parent: 'parent-task',
        type: 'task',
        open: false
      };

      // Act
      const serialized = JSON.stringify(originalTask);
      const deserialized: GanttTask = JSON.parse(serialized);

      // Assert
      expect(deserialized).toEqual(originalTask);
      expect(typeof deserialized.duration).toBe('number');
      expect(typeof deserialized.progress).toBe('number');
      expect(typeof deserialized.open).toBe('boolean');
    });

    it('should serialize and deserialize GanttLink correctly', () => {
      // Arrange
      const originalLink: GanttLink = {
        id: 'serialize-link',
        source: 'task-a',
        target: 'task-b',
        type: 'finish_to_start'
      };

      // Act
      const serialized = JSON.stringify(originalLink);
      const deserialized: GanttLink = JSON.parse(serialized);

      // Assert
      expect(deserialized).toEqual(originalLink);
      expect(typeof deserialized.id).toBe('string');
      expect(typeof deserialized.source).toBe('string');
      expect(typeof deserialized.target).toBe('string');
    });

    it('should handle arrays in JSON operations', () => {
      // Arrange
      const tasks: GanttTask[] = [
        { id: 1, text: 'Task 1', duration: 3, progress: 0.5 },
        { id: 2, text: 'Task 2', duration: 5, progress: 0.8 }
      ];

      const links: GanttLink[] = [
        { id: 1, source: 1, target: 2, type: 'finish_to_start' }
      ];

      // Act
      const serializedTasks = JSON.stringify(tasks);
      const serializedLinks = JSON.stringify(links);
      const deserializedTasks: GanttTask[] = JSON.parse(serializedTasks);
      const deserializedLinks: GanttLink[] = JSON.parse(serializedLinks);

      // Assert
      expect(deserializedTasks).toEqual(tasks);
      expect(deserializedLinks).toEqual(links);
      expect(deserializedTasks).toHaveLength(2);
      expect(deserializedLinks).toHaveLength(1);
    });
  });
});