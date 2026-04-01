import { describe, it, expect } from 'vitest';
import { WBSTask } from './wbsTaskModel';

describe('WBSTaskModel', () => {
  describe('WBSTask Type', () => {
    it('should create a valid WBSTask object with all required fields', () => {
      const wbsTask: WBSTask = {
        id: 'task-123',
        project_id: 'project-456',
        parent_id: null,
        level: 1,
        title: 'Project Planning Phase',
        created_at: new Date('2024-01-15T10:30:00Z'),
        updated_at: new Date('2024-01-16T14:20:00Z')
      };

      expect(wbsTask.id).toBe('task-123');
      expect(wbsTask.project_id).toBe('project-456');
      expect(wbsTask.parent_id).toBeNull();
      expect(wbsTask.level).toBe(1);
      expect(wbsTask.title).toBe('Project Planning Phase');
      expect(wbsTask.created_at).toBeInstanceOf(Date);
      expect(wbsTask.updated_at).toBeInstanceOf(Date);
    });

    it('should create a valid WBSTask with parent task', () => {
      const parentTask: WBSTask = {
        id: 'parent-task-001',
        project_id: 'project-789',
        parent_id: null,
        level: 1,
        title: 'Main Phase',
        created_at: new Date('2024-01-10T09:00:00Z'),
        updated_at: new Date('2024-01-10T09:00:00Z')
      };

      const childTask: WBSTask = {
        id: 'child-task-001',
        project_id: 'project-789',
        parent_id: parentTask.id,
        level: 2,
        title: 'Sub-task of Main Phase',
        created_at: new Date('2024-01-11T10:00:00Z'),
        updated_at: new Date('2024-01-12T11:00:00Z')
      };

      expect(childTask.parent_id).toBe(parentTask.id);
      expect(childTask.level).toBe(2);
      expect(childTask.project_id).toBe(parentTask.project_id);
    });

    it('should handle WBSTask with optional resource allocation', () => {
      const wbsTask: WBSTask = {
        id: 'task-with-resources',
        project_id: 'project-resource-test',
        parent_id: null,
        level: 1,
        title: 'Development Phase',
        created_at: new Date('2024-01-20T08:00:00Z'),
        updated_at: new Date('2024-01-21T16:30:00Z'),
        resource_allocation: 40
      };

      expect(wbsTask.resource_allocation).toBe(40);
      expect(typeof wbsTask.resource_allocation).toBe('number');
    });

    it('should handle WBSTask with optional resource role', () => {
      const wbsTask: WBSTask = {
        id: 'task-with-role',
        project_id: 'project-role-test',
        parent_id: null,
        level: 1,
        title: 'Design Phase',
        created_at: new Date('2024-01-25T09:15:00Z'),
        updated_at: new Date('2024-01-26T17:45:00Z'),
        resource_role: 'Senior Developer'
      };

      expect(wbsTask.resource_role).toBe('Senior Developer');
      expect(typeof wbsTask.resource_role).toBe('string');
    });

    it('should handle WBSTask with both optional fields', () => {
      const wbsTask: WBSTask = {
        id: 'task-full-optional',
        project_id: 'project-full-test',
        parent_id: 'parent-task-123',
        level: 3,
        title: 'Implementation Sub-task',
        created_at: new Date('2024-02-01T10:00:00Z'),
        updated_at: new Date('2024-02-02T15:30:00Z'),
        resource_allocation: 60,
        resource_role: 'Full Stack Developer'
      };

      expect(wbsTask.resource_allocation).toBe(60);
      expect(wbsTask.resource_role).toBe('Full Stack Developer');
      expect(wbsTask.level).toBe(3);
      expect(wbsTask.parent_id).toBe('parent-task-123');
    });

    it('should handle different task levels in hierarchy', () => {
      const tasks: WBSTask[] = [
        {
          id: 'level-1-task',
          project_id: 'hierarchy-project',
          parent_id: null,
          level: 1,
          title: 'Phase 1',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 'level-2-task',
          project_id: 'hierarchy-project',
          parent_id: 'level-1-task',
          level: 2,
          title: 'Phase 1.1',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 'level-3-task',
          project_id: 'hierarchy-project',
          parent_id: 'level-2-task',
          level: 3,
          title: 'Phase 1.1.1',
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      expect(tasks[0].level).toBe(1);
      expect(tasks[1].level).toBe(2);
      expect(tasks[2].level).toBe(3);
      
      expect(tasks[0].parent_id).toBeNull();
      expect(tasks[1].parent_id).toBe('level-1-task');
      expect(tasks[2].parent_id).toBe('level-2-task');
    });

    it('should handle multiple tasks for same project', () => {
      const projectId = 'multi-task-project';
      const tasks: WBSTask[] = [
        {
          id: 'task-1',
          project_id: projectId,
          parent_id: null,
          level: 1,
          title: 'Analysis',
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-01')
        },
        {
          id: 'task-2',
          project_id: projectId,
          parent_id: null,
          level: 1,
          title: 'Design',
          created_at: new Date('2024-01-02'),
          updated_at: new Date('2024-01-02')
        },
        {
          id: 'task-3',
          project_id: projectId,
          parent_id: null,
          level: 1,
          title: 'Implementation',
          created_at: new Date('2024-01-03'),
          updated_at: new Date('2024-01-03')
        }
      ];

      tasks.forEach(task => {
        expect(task.project_id).toBe(projectId);
        expect(task.level).toBe(1);
        expect(task.parent_id).toBeNull();
      });

      expect(tasks).toHaveLength(3);
    });

    it('should handle task title variations', () => {
      const taskTitles = [
        'Project Initiation',
        'Requirements Gathering',
        'System Design & Architecture',
        'Frontend Development',
        'Backend API Development',
        'Database Design & Implementation',
        'Testing & Quality Assurance',
        'Deployment & Go-Live',
        'Post-Launch Support'
      ];

      const tasks: WBSTask[] = taskTitles.map((title, index) => ({
        id: `task-${index + 1}`,
        project_id: 'title-test-project',
        parent_id: null,
        level: 1,
        title: title,
        created_at: new Date(),
        updated_at: new Date()
      }));

      expect(tasks).toHaveLength(9);
      tasks.forEach((task, index) => {
        expect(task.title).toBe(taskTitles[index]);
      });
    });

    it('should handle resource allocation ranges', () => {
      const resourceAllocations = [0, 25, 50, 75, 100];
      
      const tasks: WBSTask[] = resourceAllocations.map((allocation, index) => ({
        id: `resource-task-${index}`,
        project_id: 'resource-allocation-project',
        parent_id: null,
        level: 1,
        title: `Task with ${allocation}% allocation`,
        created_at: new Date(),
        updated_at: new Date(),
        resource_allocation: allocation
      }));

      tasks.forEach((task, index) => {
        expect(task.resource_allocation).toBe(resourceAllocations[index]);
      });
    });

    it('should handle different resource roles', () => {
      const resourceRoles = [
        'Project Manager',
        'Senior Developer',
        'Junior Developer',
        'UI/UX Designer',
        'DevOps Engineer',
        'Quality Assurance Tester',
        'Business Analyst',
        'Technical Writer'
      ];

      const tasks: WBSTask[] = resourceRoles.map((role, index) => ({
        id: `role-task-${index}`,
        project_id: 'resource-role-project',
        parent_id: null,
        level: 1,
        title: `Task for ${role}`,
        created_at: new Date(),
        updated_at: new Date(),
        resource_role: role
      }));

      tasks.forEach((task, index) => {
        expect(task.resource_role).toBe(resourceRoles[index]);
      });
    });
  });

  describe('Type Safety and Validation', () => {
    it('should enforce string types for ID fields', () => {
      const wbsTask: WBSTask = {
        id: 'string-id-test',
        project_id: 'string-project-id',
        parent_id: 'string-parent-id',
        level: 1,
        title: 'Type Safety Test',
        created_at: new Date(),
        updated_at: new Date()
      };

      expect(typeof wbsTask.id).toBe('string');
      expect(typeof wbsTask.project_id).toBe('string');
      expect(typeof wbsTask.parent_id).toBe('string');
    });

    it('should enforce number type for level field', () => {
      const wbsTask: WBSTask = {
        id: 'level-type-test',
        project_id: 'project-level-test',
        parent_id: null,
        level: 5,
        title: 'Level Type Test',
        created_at: new Date(),
        updated_at: new Date()
      };

      expect(typeof wbsTask.level).toBe('number');
      expect(wbsTask.level).toBe(5);
    });

    it('should enforce Date type for timestamp fields', () => {
      const now = new Date();
      const wbsTask: WBSTask = {
        id: 'date-type-test',
        project_id: 'project-date-test',
        parent_id: null,
        level: 1,
        title: 'Date Type Test',
        created_at: now,
        updated_at: now
      };

      expect(wbsTask.created_at).toBeInstanceOf(Date);
      expect(wbsTask.updated_at).toBeInstanceOf(Date);
    });

    it('should handle null parent_id correctly', () => {
      const wbsTask: WBSTask = {
        id: 'null-parent-test',
        project_id: 'project-null-test',
        parent_id: null,
        level: 1,
        title: 'Root Task',
        created_at: new Date(),
        updated_at: new Date()
      };

      expect(wbsTask.parent_id).toBeNull();
    });

    it('should handle optional fields as undefined', () => {
      const wbsTask: WBSTask = {
        id: 'optional-undefined-test',
        project_id: 'project-optional-test',
        parent_id: null,
        level: 1,
        title: 'Optional Fields Test',
        created_at: new Date(),
        updated_at: new Date()
        // resource_allocation and resource_role are undefined
      };

      expect(wbsTask.resource_allocation).toBeUndefined();
      expect(wbsTask.resource_role).toBeUndefined();
    });
  });

  describe('WBS Task Relationships', () => {
    it('should model parent-child relationships correctly', () => {
      const parentTask: WBSTask = {
        id: 'parent-001',
        project_id: 'relationship-project',
        parent_id: null,
        level: 1,
        title: 'Parent Task',
        created_at: new Date(),
        updated_at: new Date()
      };

      const childTasks: WBSTask[] = [
        {
          id: 'child-001',
          project_id: 'relationship-project',
          parent_id: parentTask.id,
          level: 2,
          title: 'Child Task 1',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 'child-002',
          project_id: 'relationship-project',
          parent_id: parentTask.id,
          level: 2,
          title: 'Child Task 2',
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      // Verify parent-child relationships
      childTasks.forEach(child => {
        expect(child.parent_id).toBe(parentTask.id);
        expect(child.level).toBe(parentTask.level + 1);
        expect(child.project_id).toBe(parentTask.project_id);
      });
    });

    it('should handle deep task hierarchies', () => {
      const tasks: WBSTask[] = [];
      let currentParentId: string | null = null;

      // Create a 5-level deep hierarchy
      for (let level = 1; level <= 5; level++) {
        const task: WBSTask = {
          id: `deep-task-level-${level}`,
          project_id: 'deep-hierarchy-project',
          parent_id: currentParentId,
          level: level,
          title: `Level ${level} Task`,
          created_at: new Date(),
          updated_at: new Date()
        };
        
        tasks.push(task);
        currentParentId = task.id;
      }

      // Verify hierarchy structure
      expect(tasks).toHaveLength(5);
      expect(tasks[0].parent_id).toBeNull(); // Root task
      expect(tasks[1].parent_id).toBe(tasks[0].id);
      expect(tasks[2].parent_id).toBe(tasks[1].id);
      expect(tasks[3].parent_id).toBe(tasks[2].id);
      expect(tasks[4].parent_id).toBe(tasks[3].id);

      tasks.forEach((task, index) => {
        expect(task.level).toBe(index + 1);
      });
    });
  });
});