/**
 * Unit Tests for Job Start Form Types
 * 
 * Tests type definitions, interfaces, and type safety for job start form types.
 * Ensures proper TypeScript compilation and type constraints.
 */

import { describe, it, expect } from 'vitest';
import type { 
  WBSResource,
  JobstartTimeProps,
  EstimatedExpensesProps
} from './jobStartFormTypes';

describe('Job Start Form Types', () => {
  describe('WBSResource Interface', () => {
    it('should accept valid WBS resource with numeric id', () => {
      // Arrange
      const resource: WBSResource = {
        id: 123,
        taskType: 0,
        description: 'Senior Developer',
        rate: 75.50,
        units: 40,
        budgetedCost: 3020.00,
        remarks: 'Full-time developer'
      };

      // Assert
      expect(resource.id).toBe(123);
      expect(resource.taskType).toBe(0);
      expect(resource.description).toBe('Senior Developer');
      expect(resource.rate).toBe(75.50);
      expect(resource.units).toBe(40);
      expect(resource.budgetedCost).toBe(3020.00);
      expect(resource.remarks).toBe('Full-time developer');
    });

    it('should accept valid WBS resource with string id', () => {
      // Arrange
      const resource: WBSResource = {
        id: 'resource-abc-123',
        taskType: 1,
        description: 'Cloud Infrastructure',
        rate: 100.00,
        units: 10,
        budgetedCost: 1000.00,
        remarks: null
      };

      // Assert
      expect(resource.id).toBe('resource-abc-123');
      expect(typeof resource.id).toBe('string');
      expect(resource.taskType).toBe(1);
      expect(resource.remarks).toBeNull();
    });

    it('should handle taskType values correctly', () => {
      // Arrange
      const manpowerResource: WBSResource = {
        id: 1,
        taskType: 0, // Manpower
        description: 'Project Manager',
        rate: 90.00,
        units: 20,
        budgetedCost: 1800.00,
        remarks: 'Part-time PM',
        employeeName: 'John Doe'
      };

      const odcResource: WBSResource = {
        id: 2,
        taskType: 1, // ODC
        description: 'External Consultant',
        rate: 120.00,
        units: 15,
        budgetedCost: 1800.00,
        remarks: 'Specialized consultant',
        name: 'Consulting Firm ABC'
      };

      // Assert
      expect(manpowerResource.taskType).toBe(0);
      expect(manpowerResource.employeeName).toBe('John Doe');
      expect(odcResource.taskType).toBe(1);
      expect(odcResource.name).toBe('Consulting Firm ABC');
    });

    it('should handle optional properties correctly', () => {
      // Arrange
      const minimalResource: WBSResource = {
        id: 'min-1',
        taskType: 0,
        description: 'Basic Resource',
        rate: 50.00,
        units: 8,
        budgetedCost: 400.00,
        remarks: null
      };

      const fullResource: WBSResource = {
        id: 'full-1',
        taskType: 1,
        description: 'Complete Resource',
        rate: 80.00,
        units: 12,
        budgetedCost: 960.00,
        remarks: 'Complete resource info',
        employeeName: 'Jane Smith',
        name: 'Resource Name'
      };

      // Assert
      expect(minimalResource.employeeName).toBeUndefined();
      expect(minimalResource.name).toBeUndefined();
      expect(fullResource.employeeName).toBe('Jane Smith');
      expect(fullResource.name).toBe('Resource Name');
    });

    it('should handle null values in optional string properties', () => {
      // Arrange
      const resourceWithNulls: WBSResource = {
        id: 'null-test',
        taskType: 0,
        description: 'Null Test Resource',
        rate: 60.00,
        units: 5,
        budgetedCost: 300.00,
        remarks: null,
        employeeName: null,
        name: null
      };

      // Assert
      expect(resourceWithNulls.remarks).toBeNull();
      expect(resourceWithNulls.employeeName).toBeNull();
      expect(resourceWithNulls.name).toBeNull();
    });

    it('should handle cost calculations correctly', () => {
      // Arrange
      const resource: WBSResource = {
        id: 'calc-test',
        taskType: 0,
        description: 'Calculation Test',
        rate: 75.00,
        units: 40,
        budgetedCost: 3000.00,
        remarks: 'Cost calculation test'
      };

      // Act
      const calculatedCost = resource.rate * resource.units;
      const costMatches = calculatedCost === resource.budgetedCost;

      // Assert
      expect(calculatedCost).toBe(3000.00);
      expect(costMatches).toBe(true);
    });

    it('should handle decimal precision in rates and costs', () => {
      // Arrange
      const precisionResource: WBSResource = {
        id: 'precision-test',
        taskType: 1,
        description: 'Precision Test',
        rate: 87.654321,
        units: 12.5,
        budgetedCost: 1095.679,
        remarks: 'Precision test'
      };

      // Assert
      expect(precisionResource.rate).toBeCloseTo(87.654321, 6);
      expect(precisionResource.units).toBeCloseTo(12.5, 1);
      expect(precisionResource.budgetedCost).toBeCloseTo(1095.679, 3);
    });
  });

  describe('JobstartTimeProps Interface', () => {
    it('should accept valid jobstart time props', () => {
      // Arrange
      const mockCallback = () => {};
      const props: JobstartTimeProps = {
        wbsResources: [
          {
            id: 1,
            taskType: 0,
            description: 'Developer',
            rate: 70.00,
            units: 40,
            budgetedCost: 2800.00,
            remarks: 'Full-time dev'
          }
        ],
        initialTimeContingencyUnits: 8,
        initialTimeContingencyRemarks: 'Buffer time',
        initialSubtotalRemarks: 'Subtotal notes',
        onTotalCostChange: mockCallback
      };

      // Assert
      expect(props.wbsResources).toHaveLength(1);
      expect(props.initialTimeContingencyUnits).toBe(8);
      expect(props.initialTimeContingencyRemarks).toBe('Buffer time');
      expect(props.initialSubtotalRemarks).toBe('Subtotal notes');
      expect(typeof props.onTotalCostChange).toBe('function');
    });

    it('should handle optional properties', () => {
      // Arrange
      const minimalProps: JobstartTimeProps = {
        wbsResources: []
      };

      // Assert
      expect(minimalProps.wbsResources).toHaveLength(0);
      expect(minimalProps.initialTimeContingencyUnits).toBeUndefined();
      expect(minimalProps.initialTimeContingencyRemarks).toBeUndefined();
      expect(minimalProps.initialSubtotalRemarks).toBeUndefined();
      expect(minimalProps.onTotalCostChange).toBeUndefined();
    });

    it('should handle empty resources array', () => {
      // Arrange
      const emptyProps: JobstartTimeProps = {
        wbsResources: [],
        initialTimeContingencyUnits: 0,
        initialTimeContingencyRemarks: '',
        initialSubtotalRemarks: ''
      };

      // Assert
      expect(emptyProps.wbsResources).toEqual([]);
      expect(emptyProps.initialTimeContingencyUnits).toBe(0);
      expect(emptyProps.initialTimeContingencyRemarks).toBe('');
      expect(emptyProps.initialSubtotalRemarks).toBe('');
    });

    it('should handle callback function correctly', () => {
      // Arrange
      let callbackCalled = false;
      const mockCallback = (data: { resources: WBSResource[], customRows: any[] }) => {
        callbackCalled = true;
        expect(data).toHaveProperty('resources');
        expect(data).toHaveProperty('customRows');
      };

      const props: JobstartTimeProps = {
        wbsResources: [],
        onTotalCostChange: mockCallback
      };

      // Act
      props.onTotalCostChange?.({ resources: [], customRows: [] });

      // Assert
      expect(callbackCalled).toBe(true);
    });
  });

  describe('EstimatedExpensesProps Interface', () => {
    it('should accept valid estimated expenses props', () => {
      // Arrange
      const mockCallback = () => {};
      const props: EstimatedExpensesProps = {
        wbsResources: [
          {
            id: 'exp-1',
            taskType: 1,
            description: 'Software License',
            rate: 500.00,
            units: 1,
            budgetedCost: 500.00,
            remarks: 'Annual license'
          }
        ],
        initialContingencyUnits: 2,
        initialContingencyRemarks: 'General contingency',
        initialExpenseContingencyUnits: 1,
        initialExpenseContingencyRemarks: 'Expense buffer',
        initialSubtotalRemarks: 'Expense subtotal',
        onTotalCostChange: mockCallback
      };

      // Assert
      expect(props.wbsResources).toHaveLength(1);
      expect(props.initialContingencyUnits).toBe(2);
      expect(props.initialContingencyRemarks).toBe('General contingency');
      expect(props.initialExpenseContingencyUnits).toBe(1);
      expect(props.initialExpenseContingencyRemarks).toBe('Expense buffer');
      expect(props.initialSubtotalRemarks).toBe('Expense subtotal');
      expect(typeof props.onTotalCostChange).toBe('function');
    });

    it('should handle all optional properties', () => {
      // Arrange
      const minimalProps: EstimatedExpensesProps = {
        wbsResources: []
      };

      // Assert
      expect(minimalProps.wbsResources).toEqual([]);
      expect(minimalProps.initialContingencyUnits).toBeUndefined();
      expect(minimalProps.initialContingencyRemarks).toBeUndefined();
      expect(minimalProps.initialExpenseContingencyUnits).toBeUndefined();
      expect(minimalProps.initialExpenseContingencyRemarks).toBeUndefined();
      expect(minimalProps.initialSubtotalRemarks).toBeUndefined();
      expect(minimalProps.onTotalCostChange).toBeUndefined();
    });

    it('should handle multiple contingency types', () => {
      // Arrange
      const props: EstimatedExpensesProps = {
        wbsResources: [],
        initialContingencyUnits: 5,
        initialContingencyRemarks: 'Time contingency',
        initialExpenseContingencyUnits: 3,
        initialExpenseContingencyRemarks: 'Cost contingency'
      };

      // Assert
      expect(props.initialContingencyUnits).toBe(5);
      expect(props.initialExpenseContingencyUnits).toBe(3);
      expect(props.initialContingencyRemarks).not.toBe(props.initialExpenseContingencyRemarks);
    });
  });

  describe('Type Relationships and Array Operations', () => {
    it('should support resource filtering by task type', () => {
      // Arrange
      const resources: WBSResource[] = [
        { id: 1, taskType: 0, description: 'Dev 1', rate: 70, units: 40, budgetedCost: 2800, remarks: null },
        { id: 2, taskType: 1, description: 'License 1', rate: 100, units: 1, budgetedCost: 100, remarks: null },
        { id: 3, taskType: 0, description: 'Dev 2', rate: 80, units: 30, budgetedCost: 2400, remarks: null }
      ];

      // Act
      const manpowerResources = resources.filter(r => r.taskType === 0);
      const odcResources = resources.filter(r => r.taskType === 1);

      // Assert
      expect(manpowerResources).toHaveLength(2);
      expect(odcResources).toHaveLength(1);
    });

    it('should support cost calculations across resources', () => {
      // Arrange
      const resources: WBSResource[] = [
        { id: 1, taskType: 0, description: 'Dev', rate: 75, units: 40, budgetedCost: 3000, remarks: null },
        { id: 2, taskType: 1, description: 'Tool', rate: 200, units: 2, budgetedCost: 400, remarks: null }
      ];

      // Act
      const totalBudget = resources.reduce((sum, r) => sum + r.budgetedCost, 0);
      const totalUnits = resources.reduce((sum, r) => sum + r.units, 0);
      const averageRate = resources.reduce((sum, r) => sum + r.rate, 0) / resources.length;

      // Assert
      expect(totalBudget).toBe(3400);
      expect(totalUnits).toBe(42);
      expect(averageRate).toBe(137.5);
    });

    it('should support resource mapping operations', () => {
      // Arrange
      const resources: WBSResource[] = [
        { id: 'r1', taskType: 0, description: 'Developer', rate: 70, units: 40, budgetedCost: 2800, remarks: 'Dev' },
        { id: 'r2', taskType: 1, description: 'License', rate: 100, units: 1, budgetedCost: 100, remarks: 'Lic' }
      ];

      // Act
      const descriptions = resources.map(r => r.description);
      const ids = resources.map(r => r.id);
      const taskTypes = resources.map(r => r.taskType);

      // Assert
      expect(descriptions).toEqual(['Developer', 'License']);
      expect(ids).toEqual(['r1', 'r2']);
      expect(taskTypes).toEqual([0, 1]);
    });
  });

  describe('JSON Serialization Compatibility', () => {
    it('should serialize and deserialize WBSResource correctly', () => {
      // Arrange
      const originalResource: WBSResource = {
        id: 'serialize-test',
        taskType: 0,
        description: 'Serializable Resource',
        rate: 85.75,
        units: 25,
        budgetedCost: 2143.75,
        remarks: 'Test serialization',
        employeeName: 'Test Employee'
      };

      // Act
      const serialized = JSON.stringify(originalResource);
      const deserialized: WBSResource = JSON.parse(serialized);

      // Assert
      expect(deserialized).toEqual(originalResource);
      expect(typeof deserialized.rate).toBe('number');
      expect(typeof deserialized.units).toBe('number');
      expect(typeof deserialized.budgetedCost).toBe('number');
    });

    it('should handle null values in serialization', () => {
      // Arrange
      const resourceWithNulls: WBSResource = {
        id: 123,
        taskType: 1,
        description: 'Null Test',
        rate: 50,
        units: 10,
        budgetedCost: 500,
        remarks: null,
        employeeName: null,
        name: null
      };

      // Act
      const serialized = JSON.stringify(resourceWithNulls);
      const deserialized: WBSResource = JSON.parse(serialized);

      // Assert
      expect(deserialized).toEqual(resourceWithNulls);
      expect(deserialized.remarks).toBeNull();
      expect(deserialized.employeeName).toBeNull();
      expect(deserialized.name).toBeNull();
    });

    it('should serialize arrays of resources correctly', () => {
      // Arrange
      const resources: WBSResource[] = [
        { id: 1, taskType: 0, description: 'Resource 1', rate: 70, units: 40, budgetedCost: 2800, remarks: 'R1' },
        { id: 2, taskType: 1, description: 'Resource 2', rate: 100, units: 5, budgetedCost: 500, remarks: null }
      ];

      // Act
      const serialized = JSON.stringify(resources);
      const deserialized: WBSResource[] = JSON.parse(serialized);

      // Assert
      expect(deserialized).toEqual(resources);
      expect(deserialized).toHaveLength(2);
      deserialized.forEach((resource, index) => {
        expect(resource).toEqual(resources[index]);
      });
    });
  });
});