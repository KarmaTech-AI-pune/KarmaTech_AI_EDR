/**
 * Unit Tests for Program Types
 * 
 * Tests type definitions, interfaces, and type safety for program management types.
 * Ensures proper TypeScript compilation and type constraints.
 */

import { describe, it, expect } from 'vitest';
import type { 
  Program,
  ProgramFormDto
} from './program';

describe('Program Types', () => {
  describe('Program Interface', () => {
    it('should accept valid program object', () => {
      // Arrange
      const program: Program = {
        id: 123,
        name: 'Digital Transformation Program',
        description: 'A comprehensive digital transformation initiative',
        startDate: '2024-01-15',
        endDate: '2024-12-31'
      };

      // Assert
      expect(program.id).toBe(123);
      expect(program.name).toBe('Digital Transformation Program');
      expect(program.description).toBe('A comprehensive digital transformation initiative');
      expect(program.startDate).toBe('2024-01-15');
      expect(program.endDate).toBe('2024-12-31');
    });

    it('should enforce required properties', () => {
      // Arrange
      const program: Program = {
        id: 456,
        name: 'Infrastructure Upgrade',
        description: 'Upgrading company infrastructure',
        startDate: null,
        endDate: null
      };

      // Assert
      expect(program).toHaveProperty('id');
      expect(program).toHaveProperty('name');
      expect(program).toHaveProperty('description');
      expect(program).toHaveProperty('startDate');
      expect(program).toHaveProperty('endDate');
      expect(typeof program.id).toBe('number');
      expect(typeof program.name).toBe('string');
      expect(typeof program.description).toBe('string');
    });

    it('should handle null date values', () => {
      // Arrange
      const programWithNullDates: Program = {
        id: 789,
        name: 'Open-ended Program',
        description: 'Program without defined dates',
        startDate: null,
        endDate: null
      };

      // Assert
      expect(programWithNullDates.startDate).toBeNull();
      expect(programWithNullDates.endDate).toBeNull();
    });

    it('should handle mixed date scenarios', () => {
      // Arrange
      const programWithStartOnly: Program = {
        id: 101,
        name: 'Started Program',
        description: 'Program with start date only',
        startDate: '2024-03-01',
        endDate: null
      };

      const programWithEndOnly: Program = {
        id: 102,
        name: 'Deadline Program',
        description: 'Program with end date only',
        startDate: null,
        endDate: '2024-06-30'
      };

      // Assert
      expect(programWithStartOnly.startDate).toBe('2024-03-01');
      expect(programWithStartOnly.endDate).toBeNull();
      expect(programWithEndOnly.startDate).toBeNull();
      expect(programWithEndOnly.endDate).toBe('2024-06-30');
    });

    it('should handle different ID ranges', () => {
      // Arrange
      const programs: Program[] = [
        { id: 0, name: 'Zero ID Program', description: 'Program with zero ID', startDate: null, endDate: null },
        { id: 1, name: 'Small ID Program', description: 'Program with small ID', startDate: null, endDate: null },
        { id: Number.MAX_SAFE_INTEGER, name: 'Large ID Program', description: 'Program with large ID', startDate: null, endDate: null }
      ];

      // Assert
      programs.forEach(program => {
        expect(typeof program.id).toBe('number');
        expect(Number.isSafeInteger(program.id)).toBe(true);
      });
    });

    it('should handle empty and special characters in text fields', () => {
      // Arrange
      const specialProgram: Program = {
        id: 999,
        name: 'Program with "quotes" & <tags>',
        description: 'Description with émojis 🚀 and unicode ñ characters',
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      };

      // Assert
      expect(specialProgram.name).toContain('"quotes"');
      expect(specialProgram.name).toContain('<tags>');
      expect(specialProgram.description).toContain('🚀');
      expect(specialProgram.description).toContain('ñ');
    });

    it('should handle very long text content', () => {
      // Arrange
      const longText = 'A'.repeat(1000);
      const longProgram: Program = {
        id: 888,
        name: longText,
        description: longText,
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      };

      // Assert
      expect(longProgram.name.length).toBe(1000);
      expect(longProgram.description.length).toBe(1000);
    });

    it('should support date string validation patterns', () => {
      // Arrange
      const dateFormats: Program[] = [
        { id: 1, name: 'ISO Date', description: 'ISO format', startDate: '2024-01-15', endDate: '2024-12-31' },
        { id: 2, name: 'ISO DateTime', description: 'ISO with time', startDate: '2024-01-15T10:30:00Z', endDate: '2024-12-31T23:59:59Z' },
        { id: 3, name: 'Custom Format', description: 'Custom format', startDate: '01/15/2024', endDate: '12/31/2024' }
      ];

      // Assert
      dateFormats.forEach(program => {
        expect(typeof program.startDate).toBe('string');
        expect(typeof program.endDate).toBe('string');
        expect(program.startDate!.length).toBeGreaterThan(0);
        expect(program.endDate!.length).toBeGreaterThan(0);
      });
    });
  });

  describe('ProgramFormDto Interface', () => {
    it('should accept valid program form DTO', () => {
      // Arrange
      const formDto: ProgramFormDto = {
        name: 'New Program',
        description: 'Creating a new program',
        startDate: '2024-02-01',
        endDate: '2024-11-30'
      };

      // Assert
      expect(formDto.name).toBe('New Program');
      expect(formDto.description).toBe('Creating a new program');
      expect(formDto.startDate).toBe('2024-02-01');
      expect(formDto.endDate).toBe('2024-11-30');
    });

    it('should not require id property', () => {
      // Arrange
      const formDto: ProgramFormDto = {
        name: 'Form Program',
        description: 'Program from form data'
      };

      // Assert
      expect(formDto).not.toHaveProperty('id');
      expect(Object.keys(formDto)).toEqual(['name', 'description']);
    });

    it('should handle optional date properties', () => {
      // Arrange
      const minimalDto: ProgramFormDto = {
        name: 'Minimal Program',
        description: 'Program with minimal data'
      };

      const dtoWithStartDate: ProgramFormDto = {
        name: 'Started Program',
        description: 'Program with start date',
        startDate: '2024-03-01'
      };

      const dtoWithEndDate: ProgramFormDto = {
        name: 'Deadline Program',
        description: 'Program with end date',
        endDate: '2024-06-30'
      };

      // Assert
      expect(minimalDto.startDate).toBeUndefined();
      expect(minimalDto.endDate).toBeUndefined();
      expect(dtoWithStartDate.startDate).toBe('2024-03-01');
      expect(dtoWithStartDate.endDate).toBeUndefined();
      expect(dtoWithEndDate.startDate).toBeUndefined();
      expect(dtoWithEndDate.endDate).toBe('2024-06-30');
    });

    it('should handle null date values explicitly', () => {
      // Arrange
      const dtoWithNullDates: ProgramFormDto = {
        name: 'Null Dates Program',
        description: 'Program with explicit null dates',
        startDate: null,
        endDate: null
      };

      // Assert
      expect(dtoWithNullDates.startDate).toBeNull();
      expect(dtoWithNullDates.endDate).toBeNull();
    });

    it('should enforce required string properties', () => {
      // Arrange
      const formDto: ProgramFormDto = {
        name: 'Required Test',
        description: 'Testing required properties'
      };

      // Assert
      expect(formDto).toHaveProperty('name');
      expect(formDto).toHaveProperty('description');
      expect(typeof formDto.name).toBe('string');
      expect(typeof formDto.description).toBe('string');
    });

    it('should handle empty string values', () => {
      // Arrange
      const emptyDto: ProgramFormDto = {
        name: '',
        description: ''
      };

      // Assert
      expect(emptyDto.name).toBe('');
      expect(emptyDto.description).toBe('');
      expect(emptyDto.name.length).toBe(0);
      expect(emptyDto.description.length).toBe(0);
    });

    it('should be compatible with Program interface (excluding id)', () => {
      // Arrange
      const formDto: ProgramFormDto = {
        name: 'Compatible Program',
        description: 'Testing compatibility',
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      };

      // Act - Convert to Program by adding id
      const program: Program = {
        id: 1,
        ...formDto
      };

      // Assert
      expect(program.name).toBe(formDto.name);
      expect(program.description).toBe(formDto.description);
      expect(program.startDate).toBe(formDto.startDate);
      expect(program.endDate).toBe(formDto.endDate);
      expect(program.id).toBe(1);
    });
  });

  describe('Type Relationships and Compatibility', () => {
    it('should demonstrate proper type hierarchy', () => {
      // Arrange
      const formData: ProgramFormDto = {
        name: 'Hierarchy Test Program',
        description: 'Testing type relationships',
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      };

      // Act - Convert through the type hierarchy
      const program: Program = { id: 1, ...formData };

      // Assert
      expect(program.name).toBe(formData.name);
      expect(program.description).toBe(formData.description);
      expect(program.startDate).toBe(formData.startDate);
      expect(program.endDate).toBe(formData.endDate);
      expect(program.id).toBe(1);
    });

    it('should support array operations', () => {
      // Arrange
      const programs: Program[] = [
        { id: 1, name: 'Program 1', description: 'First program', startDate: '2024-01-01', endDate: '2024-06-30' },
        { id: 2, name: 'Program 2', description: 'Second program', startDate: '2024-07-01', endDate: '2024-12-31' },
        { id: 3, name: 'Program 3', description: 'Third program', startDate: null, endDate: null }
      ];

      const formDtos: ProgramFormDto[] = [
        { name: 'New 1', description: 'First new program' },
        { name: 'New 2', description: 'Second new program' }
      ];

      // Assert
      expect(programs).toHaveLength(3);
      expect(formDtos).toHaveLength(2);
      
      programs.forEach(program => {
        expect(program).toHaveProperty('id');
      });
      
      formDtos.forEach(dto => {
        expect(dto).not.toHaveProperty('id');
      });
    });

    it('should support filtering and mapping operations', () => {
      // Arrange
      const programs: Program[] = [
        { id: 1, name: 'Active Program', description: 'Currently active', startDate: '2024-01-01', endDate: '2024-12-31' },
        { id: 2, name: 'Completed Program', description: 'Already completed', startDate: '2023-01-01', endDate: '2023-12-31' },
        { id: 3, name: 'Future Program', description: 'Starting later', startDate: '2025-01-01', endDate: '2025-12-31' }
      ];

      // Act
      const programsWithDates = programs.filter(p => p.startDate && p.endDate);
      const programNames = programs.map(p => p.name);
      const programsStartingIn2024 = programs.filter(p => p.startDate?.startsWith('2024'));

      // Assert
      expect(programsWithDates).toHaveLength(3);
      expect(programNames).toEqual(['Active Program', 'Completed Program', 'Future Program']);
      expect(programsStartingIn2024).toHaveLength(1);
    });

    it('should handle date-based operations', () => {
      // Arrange
      const programs: Program[] = [
        { id: 1, name: 'Q1 Program', description: 'Q1 program', startDate: '2024-01-01', endDate: '2024-03-31' },
        { id: 2, name: 'Q2 Program', description: 'Q2 program', startDate: '2024-04-01', endDate: '2024-06-30' },
        { id: 3, name: 'Ongoing Program', description: 'No end date', startDate: '2024-01-01', endDate: null }
      ];

      // Act
      const programsWithEndDates = programs.filter(p => p.endDate !== null);
      const ongoingPrograms = programs.filter(p => p.endDate === null);
      const q1Programs = programs.filter(p => p.startDate?.includes('2024-01') || p.startDate?.includes('2024-02') || p.startDate?.includes('2024-03'));

      // Assert
      expect(programsWithEndDates).toHaveLength(2);
      expect(ongoingPrograms).toHaveLength(1);
      expect(q1Programs).toHaveLength(2); // Q1 Program and Ongoing Program both start in Q1
    });
  });

  describe('Edge Cases and Error Scenarios', () => {
    it('should handle negative ID values', () => {
      // Arrange
      const negativeIdProgram: Program = {
        id: -1,
        name: 'Negative ID Program',
        description: 'Program with negative ID',
        startDate: null,
        endDate: null
      };

      // Assert
      expect(negativeIdProgram.id).toBe(-1);
      expect(negativeIdProgram.id).toBeLessThan(0);
    });

    it('should handle zero ID values', () => {
      // Arrange
      const zeroIdProgram: Program = {
        id: 0,
        name: 'Zero ID Program',
        description: 'Program with zero ID',
        startDate: null,
        endDate: null
      };

      // Assert
      expect(zeroIdProgram.id).toBe(0);
    });

    it('should handle whitespace-only strings', () => {
      // Arrange
      const whitespaceProgram: Program = {
        id: 1,
        name: '   ',
        description: '\t\n\r',
        startDate: ' ',
        endDate: ' '
      };

      // Assert
      expect(whitespaceProgram.name.trim()).toBe('');
      expect(whitespaceProgram.description.trim()).toBe('');
      expect(whitespaceProgram.startDate!.trim()).toBe('');
      expect(whitespaceProgram.endDate!.trim()).toBe('');
    });

    it('should handle invalid date strings', () => {
      // Arrange
      const invalidDateProgram: Program = {
        id: 1,
        name: 'Invalid Dates',
        description: 'Program with invalid date strings',
        startDate: 'invalid-date',
        endDate: '2024-13-45' // Invalid month and day
      };

      // Assert
      expect(invalidDateProgram.startDate).toBe('invalid-date');
      expect(invalidDateProgram.endDate).toBe('2024-13-45');
      // Note: Type system allows any string, validation would be done at runtime
    });

    it('should handle very large ID values', () => {
      // Arrange
      const largeIdProgram: Program = {
        id: Number.MAX_SAFE_INTEGER,
        name: 'Large ID Program',
        description: 'Program with maximum safe integer ID',
        startDate: null,
        endDate: null
      };

      // Assert
      expect(largeIdProgram.id).toBe(Number.MAX_SAFE_INTEGER);
      expect(Number.isSafeInteger(largeIdProgram.id)).toBe(true);
    });
  });

  describe('JSON Serialization Compatibility', () => {
    it('should serialize and deserialize Program correctly', () => {
      // Arrange
      const originalProgram: Program = {
        id: 42,
        name: 'Serializable Program',
        description: 'This program can be serialized',
        startDate: '2024-01-15',
        endDate: '2024-12-31'
      };

      // Act
      const serialized = JSON.stringify(originalProgram);
      const deserialized: Program = JSON.parse(serialized);

      // Assert
      expect(deserialized).toEqual(originalProgram);
      expect(typeof deserialized.id).toBe('number');
      expect(typeof deserialized.name).toBe('string');
      expect(typeof deserialized.description).toBe('string');
      expect(typeof deserialized.startDate).toBe('string');
      expect(typeof deserialized.endDate).toBe('string');
    });

    it('should serialize and deserialize ProgramFormDto correctly', () => {
      // Arrange
      const originalDto: ProgramFormDto = {
        name: 'Form Program',
        description: 'Program from form',
        startDate: '2024-03-01',
        endDate: '2024-09-30'
      };

      // Act
      const serialized = JSON.stringify(originalDto);
      const deserialized: ProgramFormDto = JSON.parse(serialized);

      // Assert
      expect(deserialized).toEqual(originalDto);
      expect(deserialized).not.toHaveProperty('id');
    });

    it('should handle null values in JSON operations', () => {
      // Arrange
      const programWithNulls: Program = {
        id: 123,
        name: 'Null Dates Program',
        description: 'Program with null dates',
        startDate: null,
        endDate: null
      };

      // Act
      const serialized = JSON.stringify(programWithNulls);
      const deserialized: Program = JSON.parse(serialized);

      // Assert
      expect(deserialized).toEqual(programWithNulls);
      expect(deserialized.startDate).toBeNull();
      expect(deserialized.endDate).toBeNull();
    });

    it('should handle arrays in JSON operations', () => {
      // Arrange
      const programs: Program[] = [
        { id: 1, name: 'Program 1', description: 'First', startDate: '2024-01-01', endDate: '2024-06-30' },
        { id: 2, name: 'Program 2', description: 'Second', startDate: null, endDate: null }
      ];

      // Act
      const serialized = JSON.stringify(programs);
      const deserialized: Program[] = JSON.parse(serialized);

      // Assert
      expect(deserialized).toEqual(programs);
      expect(deserialized).toHaveLength(2);
      deserialized.forEach((program, index) => {
        expect(program).toEqual(programs[index]);
      });
    });

    it('should preserve undefined vs null in optional properties', () => {
      // Arrange
      const dtoWithUndefined: ProgramFormDto = {
        name: 'Undefined Dates',
        description: 'DTO with undefined dates'
        // startDate and endDate are undefined (not set)
      };

      const dtoWithNull: ProgramFormDto = {
        name: 'Null Dates',
        description: 'DTO with null dates',
        startDate: null,
        endDate: null
      };

      // Act
      const serializedUndefined = JSON.stringify(dtoWithUndefined);
      const serializedNull = JSON.stringify(dtoWithNull);
      const deserializedUndefined: ProgramFormDto = JSON.parse(serializedUndefined);
      const deserializedNull: ProgramFormDto = JSON.parse(serializedNull);

      // Assert
      expect(deserializedUndefined.startDate).toBeUndefined();
      expect(deserializedUndefined.endDate).toBeUndefined();
      expect(deserializedNull.startDate).toBeNull();
      expect(deserializedNull.endDate).toBeNull();
    });
  });
});