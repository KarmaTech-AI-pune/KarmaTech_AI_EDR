/**
 * Unit Tests for Models Index
 * 
 * Tests the main models index file exports, interfaces, and type definitions.
 * Ensures proper TypeScript compilation and interface constraints.
 */

import { describe, it, expect } from 'vitest';
import { 
  GoNoGoStatus,
  TypeOfBid,
  WorkflowStatus,
  GoNoGoVersionStatus,
  PermissionType,
  type User,
  type Role,
  type Project,
  type OpportunityHistory,
  type RoleDefinition
} from './index';
import { ProjectStatus } from '../types/index';

describe('Models Index', () => {
  describe('Enum Exports', () => {
    it('should export GoNoGoStatus enum correctly', () => {
      // Assert
      expect(GoNoGoStatus.Red).toBe(0);
      expect(GoNoGoStatus.Amber).toBe(1);
      expect(GoNoGoStatus.Green).toBe(2);
    });

    it('should export TypeOfBid enum correctly', () => {
      // Assert
      expect(TypeOfBid.Lumpsum).toBe(0);
      expect(TypeOfBid.TimeAndExpense).toBe(1);
      expect(TypeOfBid.Percentage).toBe(2);
    });

    it('should export WorkflowStatus enum correctly', () => {
      // Assert
      expect(WorkflowStatus.Initiated).toBe('Initiated');
      expect(WorkflowStatus.InProgress).toBe('InProgress');
      expect(WorkflowStatus.Completed).toBe('Completed');
    });

    it('should export GoNoGoVersionStatus enum correctly', () => {
      // Assert
      expect(GoNoGoVersionStatus.BDM_PENDING).toBe('BDM_PENDING');
      expect(GoNoGoVersionStatus.BDM_APPROVED).toBe('BDM_APPROVED');
      expect(GoNoGoVersionStatus.COMPLETED).toBe('COMPLETED');
    });

    it('should export PermissionType enum correctly', () => {
      // Assert
      expect(PermissionType.VIEW_PROJECT).toBe('VIEW_PROJECT');
      expect(PermissionType.CREATE_PROJECT).toBe('CREATE_PROJECT');
      expect(PermissionType.SYSTEM_ADMIN).toBe('SYSTEM_ADMIN');
    });
  });

  describe('User Interface', () => {
    it('should accept valid user object', () => {
      // Arrange
      const user: User = {
        id: 'user-123',
        userName: 'johndoe',
        name: 'John Doe',
        email: 'john.doe@example.com',
        roles: [],
        standardRate: 75.50,
        isConsultant: false,
        createdAt: '2024-01-15T10:30:00Z'
      };

      // Assert
      expect(user.id).toBe('user-123');
      expect(user.userName).toBe('johndoe');
      expect(user.name).toBe('John Doe');
      expect(user.email).toBe('john.doe@example.com');
      expect(user.standardRate).toBe(75.50);
      expect(user.isConsultant).toBe(false);
    });

    it('should handle optional user properties', () => {
      // Arrange
      const userWithOptionals: User = {
        id: 'user-456',
        userName: 'janedoe',
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        roles: [],
        standardRate: 80.00,
        isConsultant: true,
        createdAt: '2024-01-15T10:30:00Z',
        avatar: 'https://example.com/avatar.jpg',
        lastLogin: '2024-01-15T09:00:00Z',
        password: 'hashedPassword',
        tenantId: 1,
        tenantDomain: 'company.example.com',
        twoFactorEnabled: true,
        features: ['advanced-analytics', 'custom-reports']
      };

      // Assert
      expect(userWithOptionals.avatar).toBe('https://example.com/avatar.jpg');
      expect(userWithOptionals.lastLogin).toBe('2024-01-15T09:00:00Z');
      expect(userWithOptionals.tenantId).toBe(1);
      expect(userWithOptionals.twoFactorEnabled).toBe(true);
      expect(userWithOptionals.features).toEqual(['advanced-analytics', 'custom-reports']);
    });

    it('should handle consultant vs employee rates', () => {
      // Arrange
      const consultant: User = {
        id: 'consultant-1', userName: 'consultant', name: 'Consultant User',
        email: 'consultant@example.com', roles: [], standardRate: 150.00,
        isConsultant: true, createdAt: '2024-01-01T00:00:00Z'
      };

      const employee: User = {
        id: 'employee-1', userName: 'employee', name: 'Employee User',
        email: 'employee@example.com', roles: [], standardRate: 75.00,
        isConsultant: false, createdAt: '2024-01-01T00:00:00Z'
      };

      // Assert
      expect(consultant.isConsultant).toBe(true);
      expect(consultant.standardRate).toBeGreaterThan(employee.standardRate);
      expect(employee.isConsultant).toBe(false);
    });
  });

  describe('Role Interface', () => {
    it('should accept valid role object', () => {
      // Arrange
      const role: Role = {
        id: 'role-123',
        name: 'Project Manager',
        permissions: ['VIEW_PROJECT', 'EDIT_PROJECT', 'CREATE_PROJECT']
      };

      // Assert
      expect(role.id).toBe('role-123');
      expect(role.name).toBe('Project Manager');
      expect(role.permissions).toEqual(['VIEW_PROJECT', 'EDIT_PROJECT', 'CREATE_PROJECT']);
      expect(role.permissions).toHaveLength(3);
    });

    it('should handle empty permissions', () => {
      // Arrange
      const role: Role = {
        id: 'role-456',
        name: 'Guest',
        permissions: []
      };

      // Assert
      expect(role.permissions).toEqual([]);
      expect(role.permissions).toHaveLength(0);
    });
  });

  describe('Project Interface', () => {
    it('should accept valid project object', () => {
      // Arrange
      const project: Project = {
        id: 'project-123',
        name: 'Test Project',
        status: ProjectStatus.InProgress,
        projectNo: 'PROJ-001',
        typeOfJob: 'Development',
        sector: 'Technology',
        priority: 'High',
        clientName: 'Test Client',
        typeOfClient: 'Corporate',
        region: 'North America',
        office: 'New York',
        currency: 'USD',
        estimatedProjectFee: 50000,
        details: 'Test project details',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T11:00:00Z',
        seniorProjectManagerId: 'spm-123',
        regionalManagerId: 'rm-123',
        projectManagerId: 'pm-123',
        estimatedProjectCost: 45000,
        letterOfAcceptance: true,
        opportunityTrackingId: 1,
        feeType: 'Fixed',
        fundingStream: 'Internal',
        contractType: 'Standard',
        programId: 1
      };

      // Assert
      expect(project.id).toBe('project-123');
      expect(project.name).toBe('Test Project');
      expect(project.status).toBe(ProjectStatus.InProgress);
      expect(project.estimatedProjectFee).toBe(50000);
      expect(project.letterOfAcceptance).toBe(true);
    });

    it('should handle optional project properties', () => {
      // Arrange
      const projectWithOptionals: Project = {
        id: 'project-456',
        name: 'Project with Optionals',
        description: 'A project with optional fields',
        status: ProjectStatus.Completed,
        projectNo: 'PROJ-002',
        typeOfJob: 'Consulting',
        sector: 'Finance',
        priority: 'Medium',
        clientName: 'Finance Corp',
        typeOfClient: 'Enterprise',
        region: 'Europe',
        office: 'London',
        currency: 'GBP',
        estimatedProjectFee: 75000,
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-06-30T23:59:59Z',
        details: 'Detailed project description',
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-06-30T18:00:00Z',
        seniorProjectManagerId: 'spm-456',
        regionalManagerId: 'rm-456',
        projectManagerId: 'pm-456',
        estimatedProjectCost: 70000,
        letterOfAcceptance: false,
        opportunityTrackingId: 2,
        feeType: 'Percentage',
        fundingStream: 'External',
        contractType: 'Custom',
        programId: 2,
        percentage: 15.5
      };

      // Assert
      expect(projectWithOptionals.description).toBe('A project with optional fields');
      expect(projectWithOptionals.startDate).toBe('2024-01-01T00:00:00Z');
      expect(projectWithOptionals.endDate).toBe('2024-06-30T23:59:59Z');
      expect(projectWithOptionals.percentage).toBe(15.5);
    });

    it('should support project status filtering', () => {
      // Arrange
      const projects: Project[] = [
        { 
          id: '1', name: 'P1', status: ProjectStatus.InProgress, projectNo: 'P1',
          typeOfJob: 'Dev', sector: 'Tech', priority: 'High', clientName: 'Client1',
          typeOfClient: 'Corp', region: 'NA', office: 'NY', currency: 'USD',
          estimatedProjectFee: 10000, details: 'Details', createdAt: '2024-01-01',
          updatedAt: '2024-01-01', seniorProjectManagerId: 'spm1', regionalManagerId: 'rm1',
          projectManagerId: 'pm1', estimatedProjectCost: 9000, letterOfAcceptance: true,
          opportunityTrackingId: 1, feeType: 'Fixed', fundingStream: 'Internal',
          contractType: 'Standard', programId: 1
        },
        {
          id: '2', name: 'P2', status: ProjectStatus.Completed, projectNo: 'P2',
          typeOfJob: 'Dev', sector: 'Tech', priority: 'Medium', clientName: 'Client2',
          typeOfClient: 'Corp', region: 'EU', office: 'London', currency: 'GBP',
          estimatedProjectFee: 20000, details: 'Details', createdAt: '2024-01-01',
          updatedAt: '2024-01-01', seniorProjectManagerId: 'spm2', regionalManagerId: 'rm2',
          projectManagerId: 'pm2', estimatedProjectCost: 18000, letterOfAcceptance: false,
          opportunityTrackingId: 2, feeType: 'Hourly', fundingStream: 'External',
          contractType: 'Custom', programId: 2
        }
      ];

      // Act
      const activeProjects = projects.filter(p => p.status === ProjectStatus.InProgress);
      const completedProjects = projects.filter(p => p.status === ProjectStatus.Completed);

      // Assert
      expect(activeProjects).toHaveLength(1);
      expect(completedProjects).toHaveLength(1);
      expect(activeProjects[0].name).toBe('P1');
      expect(completedProjects[0].name).toBe('P2');
    });
  });

  describe('OpportunityHistory Interface', () => {
    it('should accept valid opportunity history object', () => {
      // Arrange
      const history: OpportunityHistory = {
        opportunityId: 123,
        date: '2024-01-15T10:30:00Z',
        description: 'Initial contact made',
        id: 1,
        statusId: 1,
        status: 'Active',
        action: 'Created',
        assignedToId: 'user-123'
      };

      // Assert
      expect(history.opportunityId).toBe(123);
      expect(history.date).toBe('2024-01-15T10:30:00Z');
      expect(history.description).toBe('Initial contact made');
      expect(history.id).toBe(1);
      expect(history.statusId).toBe(1);
      expect(history.status).toBe('Active');
      expect(history.action).toBe('Created');
      expect(history.assignedToId).toBe('user-123');
    });

    it('should support history timeline operations', () => {
      // Arrange
      const histories: OpportunityHistory[] = [
        {
          opportunityId: 1, date: '2024-01-15T10:00:00Z', description: 'Created',
          id: 1, statusId: 1, status: 'Draft', action: 'Create', assignedToId: 'user1'
        },
        {
          opportunityId: 1, date: '2024-01-16T14:00:00Z', description: 'Updated',
          id: 2, statusId: 2, status: 'Active', action: 'Update', assignedToId: 'user2'
        },
        {
          opportunityId: 1, date: '2024-01-17T16:00:00Z', description: 'Completed',
          id: 3, statusId: 3, status: 'Completed', action: 'Complete', assignedToId: 'user3'
        }
      ];

      // Act
      const sortedByDate = histories.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const latestHistory = histories.reduce((latest, current) => 
        new Date(current.date) > new Date(latest.date) ? current : latest
      );

      // Assert
      expect(sortedByDate[0].action).toBe('Create');
      expect(sortedByDate[2].action).toBe('Complete');
      expect(latestHistory.status).toBe('Completed');
    });
  });

  describe('RoleDefinition Interface', () => {
    it('should accept valid role definition object', () => {
      // Arrange
      const roleDefinition: RoleDefinition = {
        id: 'role-def-123',
        name: 'Senior Developer',
        permissions: [
          PermissionType.VIEW_PROJECT,
          PermissionType.CREATE_PROJECT,
          PermissionType.EDIT_PROJECT
        ]
      };

      // Assert
      expect(roleDefinition.id).toBe('role-def-123');
      expect(roleDefinition.name).toBe('Senior Developer');
      expect(roleDefinition.permissions).toHaveLength(3);
      expect(roleDefinition.permissions).toContain(PermissionType.VIEW_PROJECT);
    });

    it('should support permission checking', () => {
      // Arrange
      const adminRole: RoleDefinition = {
        id: 'admin',
        name: 'Administrator',
        permissions: [PermissionType.SYSTEM_ADMIN, PermissionType.Tenant_ADMIN]
      };

      const userRole: RoleDefinition = {
        id: 'user',
        name: 'Regular User',
        permissions: [PermissionType.VIEW_PROJECT]
      };

      // Act
      const hasSystemAdmin = (role: RoleDefinition) => 
        role.permissions.includes(PermissionType.SYSTEM_ADMIN);

      // Assert
      expect(hasSystemAdmin(adminRole)).toBe(true);
      expect(hasSystemAdmin(userRole)).toBe(false);
    });
  });

  describe('JSON Serialization', () => {
    it('should serialize user object correctly', () => {
      // Arrange
      const user: User = {
        id: 'serialize-test',
        userName: 'testuser',
        name: 'Test User',
        email: 'test@example.com',
        roles: [],
        standardRate: 80.00,
        isConsultant: false,
        createdAt: '2024-01-01T00:00:00Z'
      };

      // Act
      const serialized = JSON.stringify(user);
      const deserialized: User = JSON.parse(serialized);

      // Assert
      expect(deserialized).toEqual(user);
      expect(typeof deserialized.standardRate).toBe('number');
      expect(typeof deserialized.isConsultant).toBe('boolean');
    });

    it('should serialize project object correctly', () => {
      // Arrange
      const project: Project = {
        id: 'proj-serialize',
        name: 'Serialization Test',
        status: ProjectStatus.InProgress,
        projectNo: 'SER-001',
        typeOfJob: 'Testing',
        sector: 'QA',
        priority: 'High',
        clientName: 'Test Client',
        typeOfClient: 'Internal',
        region: 'Global',
        office: 'Remote',
        currency: 'USD',
        estimatedProjectFee: 25000,
        details: 'Serialization testing',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        seniorProjectManagerId: 'spm-test',
        regionalManagerId: 'rm-test',
        projectManagerId: 'pm-test',
        estimatedProjectCost: 23000,
        letterOfAcceptance: true,
        opportunityTrackingId: 999,
        feeType: 'Fixed',
        fundingStream: 'Internal',
        contractType: 'Standard',
        programId: 999
      };

      // Act
      const serialized = JSON.stringify(project);
      const deserialized: Project = JSON.parse(serialized);

      // Assert
      expect(deserialized).toEqual(project);
      expect(typeof deserialized.estimatedProjectFee).toBe('number');
      expect(typeof deserialized.letterOfAcceptance).toBe('boolean');
    });
  });
});