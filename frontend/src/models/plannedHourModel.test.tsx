/**
 * Unit Tests for Planned Hour Model
 * 
 * Tests interface structure, type safety, and planned hour operations.
 * Ensures proper TypeScript compilation and interface constraints.
 */

import { describe, it, expect } from 'vitest';
import type { PlannedHour } from './plannedHourModel';

describe('PlannedHour Model', () => {
  describe('Interface Structure', () => {
    it('should accept valid planned hour object', () => {
      // Arrange
      const plannedHour: PlannedHour = {
        id: 'ph-123',
        task_id: 'task-456',
        year: '2024',
        month: '01',
        planned_hours: 40,
        actual_hours: 38,
        created_at: new Date('2024-01-01T10:00:00Z'),
        updated_at: new Date('2024-01-15T14:30:00Z')
      };

      // Assert
      expect(plannedHour.id).toBe('ph-123');
      expect(plannedHour.task_id).toBe('task-456');
      expect(plannedHour.year).toBe('2024');
      expect(plannedHour.month).toBe('01');
      expect(plannedHour.planned_hours).toBe(40);
      expect(plannedHour.actual_hours).toBe(38);
      expect(plannedHour.created_at).toBeInstanceOf(Date);
      expect(plannedHour.updated_at).toBeInstanceOf(Date);
    });

    it('should enforce required properties', () => {
      // Arrange
      const plannedHour: PlannedHour = {
        id: 'ph-789',
        task_id: 'task-101',
        year: '2024',
        month: '02',
        planned_hours: 35,
        created_at: new Date('2024-02-01T09:00:00Z'),
        updated_at: new Date('2024-02-01T09:00:00Z')
      };

      // Assert
      expect(plannedHour).toHaveProperty('id');
      expect(plannedHour).toHaveProperty('task_id');
      expect(plannedHour).toHaveProperty('year');
      expect(plannedHour).toHaveProperty('month');
      expect(plannedHour).toHaveProperty('planned_hours');
      expect(plannedHour).toHaveProperty('created_at');
      expect(plannedHour).toHaveProperty('updated_at');
    });

    it('should handle optional actual_hours', () => {
      // Arrange
      const plannedHourWithoutActual: PlannedHour = {
        id: 'ph-999',
        task_id: 'task-999',
        year: '2024',
        month: '03',
        planned_hours: 50,
        created_at: new Date('2024-03-01T08:00:00Z'),
        updated_at: new Date('2024-03-01T08:00:00Z')
      };

      // Assert
      expect(plannedHourWithoutActual.actual_hours).toBeUndefined();
    });
  });

  describe('Time Period Handling', () => {
    it('should handle different year formats', () => {
      // Arrange
      const plannedHours: PlannedHour[] = [
        {
          id: '1', task_id: 't1', year: '2024', month: '01', planned_hours: 40,
          created_at: new Date(), updated_at: new Date()
        },
        {
          id: '2', task_id: 't2', year: '2025', month: '01', planned_hours: 35,
          created_at: new Date(), updated_at: new Date()
        }
      ];

      // Assert
      plannedHours.forEach(ph => {
        expect(ph.year).toMatch(/^\d{4}$/); // 4-digit year format
        expect(parseInt(ph.year)).toBeGreaterThan(2020);
      });
    });

    it('should handle different month formats', () => {
      // Arrange
      const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
      
      const plannedHours = months.map((month, index) => ({
        id: `ph-${index}`,
        task_id: `task-${index}`,
        year: '2024',
        month: month,
        planned_hours: 40,
        created_at: new Date(),
        updated_at: new Date()
      }));

      // Assert
      plannedHours.forEach(ph => {
        expect(ph.month).toMatch(/^(0[1-9]|1[0-2])$/); // MM format
        expect(parseInt(ph.month)).toBeGreaterThanOrEqual(1);
        expect(parseInt(ph.month)).toBeLessThanOrEqual(12);
      });
    });

    it('should support time period sorting', () => {
      // Arrange
      const plannedHours: PlannedHour[] = [
        {
          id: '3', task_id: 't1', year: '2024', month: '03', planned_hours: 30,
          created_at: new Date(), updated_at: new Date()
        },
        {
          id: '1', task_id: 't1', year: '2024', month: '01', planned_hours: 40,
          created_at: new Date(), updated_at: new Date()
        },
        {
          id: '2', task_id: 't1', year: '2024', month: '02', planned_hours: 35,
          created_at: new Date(), updated_at: new Date()
        }
      ];

      // Act
      const sortedByPeriod = plannedHours.sort((a, b) => {
        const periodA = `${a.year}-${a.month}`;
        const periodB = `${b.year}-${b.month}`;
        return periodA.localeCompare(periodB);
      });

      // Assert
      expect(sortedByPeriod[0].month).toBe('01');
      expect(sortedByPeriod[1].month).toBe('02');
      expect(sortedByPeriod[2].month).toBe('03');
    });
  });

  describe('Hour Calculations', () => {
    it('should support planned vs actual hour comparison', () => {
      // Arrange
      const plannedHour: PlannedHour = {
        id: 'ph-calc',
        task_id: 'task-calc',
        year: '2024',
        month: '01',
        planned_hours: 40,
        actual_hours: 45,
        created_at: new Date(),
        updated_at: new Date()
      };

      // Act
      const variance = (plannedHour.actual_hours || 0) - plannedHour.planned_hours;
      const variancePercentage = (variance / plannedHour.planned_hours) * 100;

      // Assert
      expect(variance).toBe(5);
      expect(variancePercentage).toBe(12.5);
    });

    it('should handle zero planned hours', () => {
      // Arrange
      const plannedHour: PlannedHour = {
        id: 'ph-zero',
        task_id: 'task-zero',
        year: '2024',
        month: '01',
        planned_hours: 0,
        actual_hours: 5,
        created_at: new Date(),
        updated_at: new Date()
      };

      // Assert
      expect(plannedHour.planned_hours).toBe(0);
      expect(plannedHour.actual_hours).toBe(5);
    });

    it('should support hour aggregation by task', () => {
      // Arrange
      const plannedHours: PlannedHour[] = [
        {
          id: '1', task_id: 'task-A', year: '2024', month: '01', planned_hours: 40,
          actual_hours: 38, created_at: new Date(), updated_at: new Date()
        },
        {
          id: '2', task_id: 'task-A', year: '2024', month: '02', planned_hours: 35,
          actual_hours: 40, created_at: new Date(), updated_at: new Date()
        },
        {
          id: '3', task_id: 'task-B', year: '2024', month: '01', planned_hours: 20,
          actual_hours: 18, created_at: new Date(), updated_at: new Date()
        }
      ];

      // Act
      const taskAHours = plannedHours
        .filter(ph => ph.task_id === 'task-A')
        .reduce((sum, ph) => ({
          planned: sum.planned + ph.planned_hours,
          actual: sum.actual + (ph.actual_hours || 0)
        }), { planned: 0, actual: 0 });

      // Assert
      expect(taskAHours.planned).toBe(75);
      expect(taskAHours.actual).toBe(78);
    });
  });

  describe('Date Operations', () => {
    it('should handle date comparisons', () => {
      // Arrange
      const earlierDate = new Date('2024-01-01T10:00:00Z');
      const laterDate = new Date('2024-01-15T14:30:00Z');

      const plannedHour: PlannedHour = {
        id: 'ph-date',
        task_id: 'task-date',
        year: '2024',
        month: '01',
        planned_hours: 40,
        created_at: earlierDate,
        updated_at: laterDate
      };

      // Assert
      expect(plannedHour.updated_at.getTime()).toBeGreaterThan(plannedHour.created_at.getTime());
      expect(plannedHour.updated_at).toEqual(laterDate);
      expect(plannedHour.created_at).toEqual(earlierDate);
    });

    it('should support date-based filtering', () => {
      // Arrange
      const plannedHours: PlannedHour[] = [
        {
          id: '1', task_id: 't1', year: '2024', month: '01', planned_hours: 40,
          created_at: new Date('2024-01-01'), updated_at: new Date('2024-01-01')
        },
        {
          id: '2', task_id: 't2', year: '2024', month: '01', planned_hours: 35,
          created_at: new Date('2024-01-15'), updated_at: new Date('2024-01-15')
        },
        {
          id: '3', task_id: 't3', year: '2024', month: '01', planned_hours: 30,
          created_at: new Date('2024-02-01'), updated_at: new Date('2024-02-01')
        }
      ];

      // Act
      const januaryEntries = plannedHours.filter(ph => 
        ph.created_at.getMonth() === 0 // January is month 0
      );

      // Assert
      expect(januaryEntries).toHaveLength(2);
    });
  });

  describe('Task Relationships', () => {
    it('should support task grouping', () => {
      // Arrange
      const plannedHours: PlannedHour[] = [
        {
          id: '1', task_id: 'task-frontend', year: '2024', month: '01', planned_hours: 40,
          created_at: new Date(), updated_at: new Date()
        },
        {
          id: '2', task_id: 'task-backend', year: '2024', month: '01', planned_hours: 35,
          created_at: new Date(), updated_at: new Date()
        },
        {
          id: '3', task_id: 'task-frontend', year: '2024', month: '02', planned_hours: 30,
          created_at: new Date(), updated_at: new Date()
        }
      ];

      // Act
      const taskGroups = plannedHours.reduce((groups, ph) => {
        const taskId = ph.task_id;
        if (!groups[taskId]) {
          groups[taskId] = [];
        }
        groups[taskId].push(ph);
        return groups;
      }, {} as Record<string, PlannedHour[]>);

      // Assert
      expect(Object.keys(taskGroups)).toHaveLength(2);
      expect(taskGroups['task-frontend']).toHaveLength(2);
      expect(taskGroups['task-backend']).toHaveLength(1);
    });

    it('should support task lookup by id', () => {
      // Arrange
      const plannedHours: PlannedHour[] = [
        {
          id: 'ph-1', task_id: 'task-alpha', year: '2024', month: '01', planned_hours: 40,
          created_at: new Date(), updated_at: new Date()
        },
        {
          id: 'ph-2', task_id: 'task-beta', year: '2024', month: '01', planned_hours: 35,
          created_at: new Date(), updated_at: new Date()
        }
      ];

      // Act
      const findByTaskId = (taskId: string) => 
        plannedHours.filter(ph => ph.task_id === taskId);

      // Assert
      expect(findByTaskId('task-alpha')).toHaveLength(1);
      expect(findByTaskId('task-beta')).toHaveLength(1);
      expect(findByTaskId('task-gamma')).toHaveLength(0);
    });
  });

  describe('JSON Serialization', () => {
    it('should serialize planned hour correctly', () => {
      // Arrange
      const original: PlannedHour = {
        id: 'serialize-test',
        task_id: 'task-serialize',
        year: '2024',
        month: '06',
        planned_hours: 42,
        actual_hours: 40,
        created_at: new Date('2024-06-01T09:00:00Z'),
        updated_at: new Date('2024-06-15T17:30:00Z')
      };

      // Act
      const serialized = JSON.stringify(original);
      const deserialized: PlannedHour = JSON.parse(serialized);

      // Assert
      expect(deserialized.id).toBe(original.id);
      expect(deserialized.task_id).toBe(original.task_id);
      expect(deserialized.year).toBe(original.year);
      expect(deserialized.month).toBe(original.month);
      expect(deserialized.planned_hours).toBe(original.planned_hours);
      expect(deserialized.actual_hours).toBe(original.actual_hours);
      expect(typeof deserialized.created_at).toBe('string'); // Dates become strings in JSON
      expect(typeof deserialized.updated_at).toBe('string');
    });

    it('should handle array serialization', () => {
      // Arrange
      const plannedHours: PlannedHour[] = [
        {
          id: '1', task_id: 'task-1', year: '2024', month: '01', planned_hours: 40,
          created_at: new Date(), updated_at: new Date()
        },
        {
          id: '2', task_id: 'task-2', year: '2024', month: '02', planned_hours: 35,
          actual_hours: 38, created_at: new Date(), updated_at: new Date()
        }
      ];

      // Act
      const serialized = JSON.stringify(plannedHours);
      const deserialized: PlannedHour[] = JSON.parse(serialized);

      // Assert
      expect(deserialized).toHaveLength(2);
      expect(deserialized[0].id).toBe('1');
      expect(deserialized[1].actual_hours).toBe(38);
    });
  });
});