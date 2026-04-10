/**
 * Unit Tests for Resource Role Model
 * 
 * Tests type definition, structure, and resource role operations.
 * Ensures proper TypeScript compilation and type constraints.
 */

import { describe, it, expect } from 'vitest';
import type { resourceRole } from './resourceRoleModel';

describe('resourceRole Model', () => {
  describe('Type Structure', () => {
    it('should accept valid resource role object', () => {
      // Arrange
      const role: resourceRole = {
        id: 'role-123',
        name: 'Senior Developer',
        min_rate: 75.50,
        description: 'Experienced developer with 5+ years of experience'
      };

      // Assert
      expect(role.id).toBe('role-123');
      expect(role.name).toBe('Senior Developer');
      expect(role.min_rate).toBe(75.50);
      expect(role.description).toBe('Experienced developer with 5+ years of experience');
    });

    it('should enforce required properties', () => {
      // Arrange
      const role: resourceRole = {
        id: 'role-456',
        name: 'Project Manager',
        min_rate: 90.00,
        description: 'Manages project delivery and team coordination'
      };

      // Assert
      expect(role).toHaveProperty('id');
      expect(role).toHaveProperty('name');
      expect(role).toHaveProperty('min_rate');
      expect(role).toHaveProperty('description');
      expect(typeof role.id).toBe('string');
      expect(typeof role.name).toBe('string');
      expect(typeof role.min_rate).toBe('number');
      expect(typeof role.description).toBe('string');
    });
  });

  describe('Role Categories', () => {
    it('should handle different role types', () => {
      // Arrange
      const roles: resourceRole[] = [
        {
          id: 'dev-junior',
          name: 'Junior Developer',
          min_rate: 45.00,
          description: 'Entry-level developer with 0-2 years experience'
        },
        {
          id: 'dev-senior',
          name: 'Senior Developer',
          min_rate: 75.00,
          description: 'Experienced developer with 5+ years experience'
        },
        {
          id: 'arch-lead',
          name: 'Technical Architect',
          min_rate: 120.00,
          description: 'System architecture and technical leadership'
        },
        {
          id: 'pm-lead',
          name: 'Project Manager',
          min_rate: 95.00,
          description: 'Project planning and team management'
        }
      ];

      // Assert
      roles.forEach(role => {
        expect(role.id).toBeTruthy();
        expect(role.name).toBeTruthy();
        expect(role.min_rate).toBeGreaterThan(0);
        expect(role.description).toBeTruthy();
      });
    });

    it('should support role hierarchy by rate', () => {
      // Arrange
      const roles: resourceRole[] = [
        { id: '1', name: 'Junior', min_rate: 40, description: 'Junior level' },
        { id: '2', name: 'Mid', min_rate: 65, description: 'Mid level' },
        { id: '3', name: 'Senior', min_rate: 85, description: 'Senior level' },
        { id: '4', name: 'Lead', min_rate: 110, description: 'Lead level' }
      ];

      // Act
      const sortedByRate = roles.sort((a, b) => a.min_rate - b.min_rate);

      // Assert
      expect(sortedByRate[0].name).toBe('Junior');
      expect(sortedByRate[1].name).toBe('Mid');
      expect(sortedByRate[2].name).toBe('Senior');
      expect(sortedByRate[3].name).toBe('Lead');
    });
  });

  describe('Rate Operations', () => {
    it('should support rate comparisons', () => {
      // Arrange
      const juniorRole: resourceRole = {
        id: 'junior',
        name: 'Junior Developer',
        min_rate: 50.00,
        description: 'Entry level'
      };

      const seniorRole: resourceRole = {
        id: 'senior',
        name: 'Senior Developer',
        min_rate: 85.00,
        description: 'Experienced level'
      };

      // Act
      const rateDifference = seniorRole.min_rate - juniorRole.min_rate;
      const rateRatio = seniorRole.min_rate / juniorRole.min_rate;

      // Assert
      expect(rateDifference).toBe(35.00);
      expect(rateRatio).toBe(1.7);
      expect(seniorRole.min_rate).toBeGreaterThan(juniorRole.min_rate);
    });

    it('should handle decimal rates', () => {
      // Arrange
      const role: resourceRole = {
        id: 'consultant',
        name: 'Technical Consultant',
        min_rate: 127.75,
        description: 'Specialized consulting role'
      };

      // Assert
      expect(role.min_rate).toBe(127.75);
      expect(role.min_rate % 1).toBe(0.75); // Check decimal part
    });

    it('should support rate filtering', () => {
      // Arrange
      const roles: resourceRole[] = [
        { id: '1', name: 'Intern', min_rate: 25, description: 'Internship' },
        { id: '2', name: 'Junior', min_rate: 45, description: 'Junior level' },
        { id: '3', name: 'Senior', min_rate: 80, description: 'Senior level' },
        { id: '4', name: 'Architect', min_rate: 125, description: 'Architecture level' }
      ];

      // Act
      const affordableRoles = roles.filter(role => role.min_rate <= 60);
      const premiumRoles = roles.filter(role => role.min_rate > 100);

      // Assert
      expect(affordableRoles).toHaveLength(2);
      expect(premiumRoles).toHaveLength(1);
      expect(affordableRoles[0].name).toBe('Intern');
      expect(premiumRoles[0].name).toBe('Architect');
    });
  });

  describe('Role Search and Filtering', () => {
    it('should support role lookup by id', () => {
      // Arrange
      const roles: resourceRole[] = [
        { id: 'dev-001', name: 'Developer', min_rate: 70, description: 'Software developer' },
        { id: 'qa-001', name: 'QA Engineer', min_rate: 60, description: 'Quality assurance' },
        { id: 'pm-001', name: 'Project Manager', min_rate: 90, description: 'Project management' }
      ];

      // Act
      const findRoleById = (id: string) => roles.find(role => role.id === id);

      // Assert
      expect(findRoleById('dev-001')?.name).toBe('Developer');
      expect(findRoleById('qa-001')?.min_rate).toBe(60);
      expect(findRoleById('nonexistent')).toBeUndefined();
    });

    it('should support role search by name', () => {
      // Arrange
      const roles: resourceRole[] = [
        { id: '1', name: 'Frontend Developer', min_rate: 70, description: 'UI/UX development' },
        { id: '2', name: 'Backend Developer', min_rate: 75, description: 'Server-side development' },
        { id: '3', name: 'Full Stack Developer', min_rate: 80, description: 'End-to-end development' }
      ];

      // Act
      const developerRoles = roles.filter(role => role.name.includes('Developer'));
      const frontendRoles = roles.filter(role => role.name.includes('Frontend'));

      // Assert
      expect(developerRoles).toHaveLength(3);
      expect(frontendRoles).toHaveLength(1);
      expect(frontendRoles[0].description).toBe('UI/UX development');
    });

    it('should support description-based filtering', () => {
      // Arrange
      const roles: resourceRole[] = [
        { id: '1', name: 'React Developer', min_rate: 70, description: 'React and JavaScript expertise' },
        { id: '2', name: 'Node.js Developer', min_rate: 75, description: 'Node.js and JavaScript backend' },
        { id: '3', name: 'Python Developer', min_rate: 72, description: 'Python and Django development' }
      ];

      // Act
      const javascriptRoles = roles.filter(role => 
        role.description.toLowerCase().includes('javascript')
      );

      // Assert
      expect(javascriptRoles).toHaveLength(2);
      expect(javascriptRoles.map(r => r.name)).toEqual(['React Developer', 'Node.js Developer']);
    });
  });

  describe('Role Validation', () => {
    it('should handle empty strings', () => {
      // Arrange
      const role: resourceRole = {
        id: '',
        name: '',
        min_rate: 0,
        description: ''
      };

      // Assert
      expect(role.id).toBe('');
      expect(role.name).toBe('');
      expect(role.min_rate).toBe(0);
      expect(role.description).toBe('');
    });

    it('should handle negative rates', () => {
      // Arrange
      const role: resourceRole = {
        id: 'negative-test',
        name: 'Test Role',
        min_rate: -10,
        description: 'Role with negative rate'
      };

      // Assert
      expect(role.min_rate).toBe(-10);
      expect(role.min_rate).toBeLessThan(0);
    });

    it('should handle very long descriptions', () => {
      // Arrange
      const longDescription = 'This is a very long description that might be used for roles with extensive requirements and detailed explanations of responsibilities, skills, and experience needed for the position.';
      
      const role: resourceRole = {
        id: 'long-desc',
        name: 'Complex Role',
        min_rate: 95,
        description: longDescription
      };

      // Assert
      expect(role.description).toBe(longDescription);
      expect(role.description.length).toBeGreaterThan(100);
    });
  });

  describe('Role Statistics', () => {
    it('should calculate average rate across roles', () => {
      // Arrange
      const roles: resourceRole[] = [
        { id: '1', name: 'Role A', min_rate: 60, description: 'Role A' },
        { id: '2', name: 'Role B', min_rate: 80, description: 'Role B' },
        { id: '3', name: 'Role C', min_rate: 100, description: 'Role C' }
      ];

      // Act
      const averageRate = roles.reduce((sum, role) => sum + role.min_rate, 0) / roles.length;

      // Assert
      expect(averageRate).toBe(80);
    });

    it('should find min and max rates', () => {
      // Arrange
      const roles: resourceRole[] = [
        { id: '1', name: 'Intern', min_rate: 30, description: 'Internship' },
        { id: '2', name: 'Junior', min_rate: 55, description: 'Junior' },
        { id: '3', name: 'Senior', min_rate: 90, description: 'Senior' },
        { id: '4', name: 'Principal', min_rate: 140, description: 'Principal' }
      ];

      // Act
      const minRate = Math.min(...roles.map(r => r.min_rate));
      const maxRate = Math.max(...roles.map(r => r.min_rate));
      const rateRange = maxRate - minRate;

      // Assert
      expect(minRate).toBe(30);
      expect(maxRate).toBe(140);
      expect(rateRange).toBe(110);
    });
  });

  describe('JSON Serialization', () => {
    it('should serialize resource role correctly', () => {
      // Arrange
      const original: resourceRole = {
        id: 'serialize-test',
        name: 'Serialization Test Role',
        min_rate: 87.25,
        description: 'Role for testing JSON serialization and deserialization'
      };

      // Act
      const serialized = JSON.stringify(original);
      const deserialized: resourceRole = JSON.parse(serialized);

      // Assert
      expect(deserialized).toEqual(original);
      expect(typeof deserialized.id).toBe('string');
      expect(typeof deserialized.name).toBe('string');
      expect(typeof deserialized.min_rate).toBe('number');
      expect(typeof deserialized.description).toBe('string');
    });

    it('should handle array serialization', () => {
      // Arrange
      const roles: resourceRole[] = [
        { id: '1', name: 'Role 1', min_rate: 50, description: 'First role' },
        { id: '2', name: 'Role 2', min_rate: 75, description: 'Second role' }
      ];

      // Act
      const serialized = JSON.stringify(roles);
      const deserialized: resourceRole[] = JSON.parse(serialized);

      // Assert
      expect(deserialized).toEqual(roles);
      expect(deserialized).toHaveLength(2);
      expect(deserialized[0].min_rate).toBe(50);
      expect(deserialized[1].min_rate).toBe(75);
    });
  });
});