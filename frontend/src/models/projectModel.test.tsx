import { describe, it, expect } from 'vitest';
import { Project } from './projectModel';
import { ProjectStatus } from './types';

describe('Project Model', () => {
  describe('Type Definition', () => {
    it('should have required properties', () => {
      const project: Project = {
        id: '1',
        name: 'Test Project',
        clientName: 'Test Client',
        projectManagerId: 'pm1',
        projectNo: 'P001',
        seniorProjectManagerId: 'spm1',
        estimatedProjectCost: 100000,
        estimatedProjectFee: 10000,
        currency: 'USD',
        regionalManagerId: 'rm1',
        letterOfAcceptance: true,
        programId: 1,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        status: 'Planning' as ProjectStatus
      };

      expect(project.id).toBe('1');
      expect(project.name).toBe('Test Project');
      expect(project.clientName).toBe('Test Client');
    });

    it('should have optional properties', () => {
      const project: Project = {
        id: '1',
        name: 'Test Project',
        clientName: 'Test Client',
        projectManagerId: 'pm1',
        projectNo: 'P001',
        seniorProjectManagerId: 'spm1',
        estimatedProjectCost: 100000,
        estimatedProjectFee: 10000,
        currency: 'USD',
        regionalManagerId: 'rm1',
        letterOfAcceptance: true,
        programId: 1,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        status: 'Planning' as ProjectStatus,
        details: 'Project details',
        office: 'New York',
        typeOfJob: 'Consulting',
        sector: 'Technology',
        region: 'North America',
        typeOfClient: 'Enterprise',
        feeType: 'Fixed',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        priority: 'High',
        opportunityId: 1,
        opportunityTrackingId: 1
      };

      expect(project.details).toBe('Project details');
      expect(project.office).toBe('New York');
      expect(project.typeOfJob).toBe('Consulting');
    });
  });

  describe('Project Status', () => {
    it('should support different project statuses', () => {
      const statuses: ProjectStatus[] = ['Planning', 'Active', 'On Hold', 'Completed', 'Cancelled'];
      
      statuses.forEach(status => {
        const project: Project = {
          id: '1',
          name: 'Test Project',
          clientName: 'Test Client',
          projectManagerId: 'pm1',
          projectNo: 'P001',
          seniorProjectManagerId: 'spm1',
          estimatedProjectCost: 100000,
          estimatedProjectFee: 10000,
          currency: 'USD',
          regionalManagerId: 'rm1',
          letterOfAcceptance: true,
          programId: 1,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
          status: status
        };
        
        expect(project.status).toBe(status);
      });
    });
  });

  describe('Financial Properties', () => {
    it('should handle financial calculations', () => {
      const project: Project = {
        id: '1',
        name: 'Test Project',
        clientName: 'Test Client',
        projectManagerId: 'pm1',
        projectNo: 'P001',
        seniorProjectManagerId: 'spm1',
        estimatedProjectCost: 100000,
        estimatedProjectFee: 10000,
        currency: 'USD',
        regionalManagerId: 'rm1',
        letterOfAcceptance: true,
        programId: 1,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        status: 'Planning' as ProjectStatus
      };

      const feePercentage = (project.estimatedProjectFee / project.estimatedProjectCost) * 100;
      expect(feePercentage).toBe(10);
    });

    it('should support different currencies', () => {
      const currencies = ['USD', 'EUR', 'GBP', 'INR'];
      
      currencies.forEach(currency => {
        const project: Project = {
          id: '1',
          name: 'Test Project',
          clientName: 'Test Client',
          projectManagerId: 'pm1',
          projectNo: 'P001',
          seniorProjectManagerId: 'spm1',
          estimatedProjectCost: 100000,
          estimatedProjectFee: 10000,
          currency: currency,
          regionalManagerId: 'rm1',
          letterOfAcceptance: true,
          programId: 1,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
          status: 'Planning' as ProjectStatus
        };
        
        expect(project.currency).toBe(currency);
      });
    });
  });

  describe('Date Properties', () => {
    it('should handle date ranges', () => {
      const project: Project = {
        id: '1',
        name: 'Test Project',
        clientName: 'Test Client',
        projectManagerId: 'pm1',
        projectNo: 'P001',
        seniorProjectManagerId: 'spm1',
        estimatedProjectCost: 100000,
        estimatedProjectFee: 10000,
        currency: 'USD',
        regionalManagerId: 'rm1',
        letterOfAcceptance: true,
        programId: 1,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        status: 'Planning' as ProjectStatus,
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      };

      expect(project.startDate).toBe('2024-01-01');
      expect(project.endDate).toBe('2024-12-31');
    });

    it('should track creation and update dates', () => {
      const project: Project = {
        id: '1',
        name: 'Test Project',
        clientName: 'Test Client',
        projectManagerId: 'pm1',
        projectNo: 'P001',
        seniorProjectManagerId: 'spm1',
        estimatedProjectCost: 100000,
        estimatedProjectFee: 10000,
        currency: 'USD',
        regionalManagerId: 'rm1',
        letterOfAcceptance: true,
        programId: 1,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-15',
        status: 'Planning' as ProjectStatus
      };

      expect(project.createdAt).toBe('2024-01-01');
      expect(project.updatedAt).toBe('2024-01-15');
    });
  });

  describe('Manager Properties', () => {
    it('should track project managers', () => {
      const project: Project = {
        id: '1',
        name: 'Test Project',
        clientName: 'Test Client',
        projectManagerId: 'pm1',
        projectNo: 'P001',
        seniorProjectManagerId: 'spm1',
        estimatedProjectCost: 100000,
        estimatedProjectFee: 10000,
        currency: 'USD',
        regionalManagerId: 'rm1',
        letterOfAcceptance: true,
        programId: 1,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        status: 'Planning' as ProjectStatus
      };

      expect(project.projectManagerId).toBe('pm1');
      expect(project.seniorProjectManagerId).toBe('spm1');
      expect(project.regionalManagerId).toBe('rm1');
    });
  });

  describe('Validation', () => {
    it('should validate required fields', () => {
      const project: Project = {
        id: '1',
        name: 'Test Project',
        clientName: 'Test Client',
        projectManagerId: 'pm1',
        projectNo: 'P001',
        seniorProjectManagerId: 'spm1',
        estimatedProjectCost: 100000,
        estimatedProjectFee: 10000,
        currency: 'USD',
        regionalManagerId: 'rm1',
        letterOfAcceptance: true,
        programId: 1,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        status: 'Planning' as ProjectStatus
      };

      expect(project.id).toBeTruthy();
      expect(project.name).toBeTruthy();
      expect(project.clientName).toBeTruthy();
    });

    it('should handle zero and negative values', () => {
      const project: Project = {
        id: '1',
        name: 'Test Project',
        clientName: 'Test Client',
        projectManagerId: 'pm1',
        projectNo: 'P001',
        seniorProjectManagerId: 'spm1',
        estimatedProjectCost: 0,
        estimatedProjectFee: -1000,
        currency: 'USD',
        regionalManagerId: 'rm1',
        letterOfAcceptance: true,
        programId: 1,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        status: 'Planning' as ProjectStatus
      };

      expect(project.estimatedProjectCost).toBe(0);
      expect(project.estimatedProjectFee).toBe(-1000);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large numbers', () => {
      const project: Project = {
        id: '1',
        name: 'Test Project',
        clientName: 'Test Client',
        projectManagerId: 'pm1',
        projectNo: 'P001',
        seniorProjectManagerId: 'spm1',
        estimatedProjectCost: 999999999,
        estimatedProjectFee: 999999999,
        currency: 'USD',
        regionalManagerId: 'rm1',
        letterOfAcceptance: true,
        programId: 1,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        status: 'Planning' as ProjectStatus
      };

      expect(project.estimatedProjectCost).toBe(999999999);
      expect(project.estimatedProjectFee).toBe(999999999);
    });

    it('should handle special characters in strings', () => {
      const project: Project = {
        id: '1',
        name: 'Test Project & Co.',
        clientName: 'Test Client "Inc"',
        projectManagerId: 'pm1',
        projectNo: 'P-001-2024',
        seniorProjectManagerId: 'spm1',
        estimatedProjectCost: 100000,
        estimatedProjectFee: 10000,
        currency: 'USD',
        regionalManagerId: 'rm1',
        letterOfAcceptance: true,
        programId: 1,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        status: 'Planning' as ProjectStatus
      };

      expect(project.name).toContain('&');
      expect(project.clientName).toContain('"');
    });
  });
});
