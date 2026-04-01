/**
 * Unit Tests for Budget Health Types
 * 
 * Tests type definitions, interfaces, and type safety for budget health monitoring types.
 * Ensures proper TypeScript compilation and type constraints.
 */

import { describe, it, expect } from 'vitest';
import type { 
  BudgetHealthStatus,
  BudgetHealth,
  BudgetHealthResponse
} from './budgetHealth';

describe('Budget Health Types', () => {
  describe('BudgetHealthStatus Type', () => {
    it('should accept valid status values', () => {
      // Arrange
      const healthyStatus: BudgetHealthStatus = 'Healthy';
      const warningStatus: BudgetHealthStatus = 'Warning';
      const criticalStatus: BudgetHealthStatus = 'Critical';

      // Assert
      expect(healthyStatus).toBe('Healthy');
      expect(warningStatus).toBe('Warning');
      expect(criticalStatus).toBe('Critical');
    });

    it('should be used in arrays and operations', () => {
      // Arrange
      const allStatuses: BudgetHealthStatus[] = ['Healthy', 'Warning', 'Critical'];

      // Act
      const statusCount = allStatuses.length;
      const hasHealthy = allStatuses.includes('Healthy');
      const hasInvalid = allStatuses.includes('Invalid' as BudgetHealthStatus);

      // Assert
      expect(statusCount).toBe(3);
      expect(hasHealthy).toBe(true);
      expect(hasInvalid).toBe(false);
    });

    it('should support string operations', () => {
      // Arrange
      const status: BudgetHealthStatus = 'Warning';

      // Act
      const upperCase = status.toUpperCase();
      const lowerCase = status.toLowerCase();
      const length = status.length;

      // Assert
      expect(upperCase).toBe('WARNING');
      expect(lowerCase).toBe('warning');
      expect(length).toBe(7);
    });

    it('should work in conditional logic', () => {
      // Arrange
      const statuses: BudgetHealthStatus[] = ['Healthy', 'Warning', 'Critical'];

      // Act
      const healthyCount = statuses.filter(s => s === 'Healthy').length;
      const nonHealthyCount = statuses.filter(s => s !== 'Healthy').length;
      const criticalExists = statuses.some(s => s === 'Critical');

      // Assert
      expect(healthyCount).toBe(1);
      expect(nonHealthyCount).toBe(2);
      expect(criticalExists).toBe(true);
    });

    it('should support switch statements', () => {
      // Arrange
      const status: BudgetHealthStatus = 'Warning';
      let priority: number;

      // Act
      switch (status) {
        case 'Healthy':
          priority = 1;
          break;
        case 'Warning':
          priority = 2;
          break;
        case 'Critical':
          priority = 3;
          break;
        default:
          priority = 0;
      }

      // Assert
      expect(priority).toBe(2);
    });
  });

  describe('BudgetHealth Interface', () => {
    it('should accept valid budget health object', () => {
      // Arrange
      const budgetHealth: BudgetHealth = {
        projectId: 123,
        status: 'Healthy',
        utilizationPercentage: 75.5,
        estimatedBudget: 100000,
        actualCost: 75500
      };

      // Assert
      expect(budgetHealth.projectId).toBe(123);
      expect(budgetHealth.status).toBe('Healthy');
      expect(budgetHealth.utilizationPercentage).toBe(75.5);
      expect(budgetHealth.estimatedBudget).toBe(100000);
      expect(budgetHealth.actualCost).toBe(75500);
    });

    it('should enforce required properties', () => {
      // Arrange
      const budgetHealth: BudgetHealth = {
        projectId: 456,
        status: 'Warning',
        utilizationPercentage: 85.0,
        estimatedBudget: 50000,
        actualCost: 42500
      };

      // Assert
      expect(budgetHealth).toHaveProperty('projectId');
      expect(budgetHealth).toHaveProperty('status');
      expect(budgetHealth).toHaveProperty('utilizationPercentage');
      expect(budgetHealth).toHaveProperty('estimatedBudget');
      expect(budgetHealth).toHaveProperty('actualCost');
    });

    it('should handle different numeric values correctly', () => {
      // Arrange
      const budgetHealth: BudgetHealth = {
        projectId: 0,
        status: 'Critical',
        utilizationPercentage: 0.0,
        estimatedBudget: 0,
        actualCost: 0
      };

      // Assert
      expect(typeof budgetHealth.projectId).toBe('number');
      expect(typeof budgetHealth.utilizationPercentage).toBe('number');
      expect(typeof budgetHealth.estimatedBudget).toBe('number');
      expect(typeof budgetHealth.actualCost).toBe('number');
    });

    it('should handle large numeric values', () => {
      // Arrange
      const largeBudgetHealth: BudgetHealth = {
        projectId: Number.MAX_SAFE_INTEGER,
        status: 'Healthy',
        utilizationPercentage: 99.99,
        estimatedBudget: 1000000000,
        actualCost: 999999999
      };

      // Assert
      expect(Number.isSafeInteger(largeBudgetHealth.projectId)).toBe(true);
      expect(largeBudgetHealth.utilizationPercentage).toBeLessThan(100);
      expect(largeBudgetHealth.actualCost).toBeLessThan(largeBudgetHealth.estimatedBudget);
    });

    it('should handle decimal precision correctly', () => {
      // Arrange
      const precisionBudgetHealth: BudgetHealth = {
        projectId: 789,
        status: 'Warning',
        utilizationPercentage: 87.654321,
        estimatedBudget: 123456.78,
        actualCost: 108234.56
      };

      // Assert
      expect(precisionBudgetHealth.utilizationPercentage).toBeCloseTo(87.654321, 6);
      expect(precisionBudgetHealth.estimatedBudget).toBeCloseTo(123456.78, 2);
      expect(precisionBudgetHealth.actualCost).toBeCloseTo(108234.56, 2);
    });

    it('should support budget calculations', () => {
      // Arrange
      const budgetHealth: BudgetHealth = {
        projectId: 100,
        status: 'Warning',
        utilizationPercentage: 90.0,
        estimatedBudget: 100000,
        actualCost: 90000
      };

      // Act
      const remainingBudget = budgetHealth.estimatedBudget - budgetHealth.actualCost;
      const calculatedUtilization = (budgetHealth.actualCost / budgetHealth.estimatedBudget) * 100;
      const isOverBudget = budgetHealth.actualCost > budgetHealth.estimatedBudget;

      // Assert
      expect(remainingBudget).toBe(10000);
      expect(calculatedUtilization).toBe(90);
      expect(isOverBudget).toBe(false);
    });

    it('should handle over-budget scenarios', () => {
      // Arrange
      const overBudgetHealth: BudgetHealth = {
        projectId: 200,
        status: 'Critical',
        utilizationPercentage: 110.0,
        estimatedBudget: 50000,
        actualCost: 55000
      };

      // Act
      const overageAmount = overBudgetHealth.actualCost - overBudgetHealth.estimatedBudget;
      const overagePercentage = (overageAmount / overBudgetHealth.estimatedBudget) * 100;

      // Assert
      expect(overageAmount).toBe(5000);
      expect(overagePercentage).toBe(10);
      expect(overBudgetHealth.utilizationPercentage).toBeGreaterThan(100);
    });

    it('should support status-based filtering', () => {
      // Arrange
      const budgetHealthList: BudgetHealth[] = [
        {
          projectId: 1,
          status: 'Healthy',
          utilizationPercentage: 60,
          estimatedBudget: 100000,
          actualCost: 60000
        },
        {
          projectId: 2,
          status: 'Warning',
          utilizationPercentage: 85,
          estimatedBudget: 80000,
          actualCost: 68000
        },
        {
          projectId: 3,
          status: 'Critical',
          utilizationPercentage: 105,
          estimatedBudget: 60000,
          actualCost: 63000
        }
      ];

      // Act
      const healthyProjects = budgetHealthList.filter(b => b.status === 'Healthy');
      const criticalProjects = budgetHealthList.filter(b => b.status === 'Critical');
      const overUtilized = budgetHealthList.filter(b => b.utilizationPercentage > 100);

      // Assert
      expect(healthyProjects).toHaveLength(1);
      expect(criticalProjects).toHaveLength(1);
      expect(overUtilized).toHaveLength(1);
    });
  });

  describe('BudgetHealthResponse Interface', () => {
    it('should accept successful response', () => {
      // Arrange
      const successResponse: BudgetHealthResponse = {
        success: true,
        data: {
          projectId: 123,
          status: 'Healthy',
          utilizationPercentage: 75.0,
          estimatedBudget: 100000,
          actualCost: 75000
        },
        message: 'Budget health retrieved successfully'
      };

      // Assert
      expect(successResponse.success).toBe(true);
      expect(successResponse.data).toBeDefined();
      expect(successResponse.data.projectId).toBe(123);
      expect(successResponse.message).toBe('Budget health retrieved successfully');
    });

    it('should accept failed response', () => {
      // Arrange
      const failureResponse: BudgetHealthResponse = {
        success: false,
        data: {
          projectId: 0,
          status: 'Critical',
          utilizationPercentage: 0,
          estimatedBudget: 0,
          actualCost: 0
        },
        message: 'Failed to retrieve budget health'
      };

      // Assert
      expect(failureResponse.success).toBe(false);
      expect(failureResponse.data).toBeDefined();
      expect(failureResponse.message).toBe('Failed to retrieve budget health');
    });

    it('should handle optional message property', () => {
      // Arrange
      const responseWithoutMessage: BudgetHealthResponse = {
        success: true,
        data: {
          projectId: 456,
          status: 'Warning',
          utilizationPercentage: 88.5,
          estimatedBudget: 75000,
          actualCost: 66375
        }
      };

      // Assert
      expect(responseWithoutMessage.success).toBe(true);
      expect(responseWithoutMessage.data).toBeDefined();
      expect(responseWithoutMessage.message).toBeUndefined();
    });

    it('should enforce required properties', () => {
      // Arrange
      const response: BudgetHealthResponse = {
        success: false,
        data: {
          projectId: 789,
          status: 'Critical',
          utilizationPercentage: 120.0,
          estimatedBudget: 40000,
          actualCost: 48000
        }
      };

      // Assert
      expect(response).toHaveProperty('success');
      expect(response).toHaveProperty('data');
      expect(typeof response.success).toBe('boolean');
      expect(typeof response.data).toBe('object');
    });

    it('should support nested data validation', () => {
      // Arrange
      const response: BudgetHealthResponse = {
        success: true,
        data: {
          projectId: 999,
          status: 'Healthy',
          utilizationPercentage: 45.5,
          estimatedBudget: 200000,
          actualCost: 91000
        },
        message: 'Data retrieved'
      };

      // Act
      const isValidProjectId = response.data.projectId > 0;
      const isValidStatus = ['Healthy', 'Warning', 'Critical'].includes(response.data.status);
      const isValidUtilization = response.data.utilizationPercentage >= 0;

      // Assert
      expect(isValidProjectId).toBe(true);
      expect(isValidStatus).toBe(true);
      expect(isValidUtilization).toBe(true);
    });
  });

  describe('Type Relationships and Compatibility', () => {
    it('should demonstrate proper type hierarchy', () => {
      // Arrange
      const budgetData: BudgetHealth = {
        projectId: 123,
        status: 'Warning',
        utilizationPercentage: 82.5,
        estimatedBudget: 120000,
        actualCost: 99000
      };

      // Act - Wrap in response
      const response: BudgetHealthResponse = {
        success: true,
        data: budgetData,
        message: 'Success'
      };

      // Assert
      expect(response.data).toEqual(budgetData);
      expect(response.data.status).toBe(budgetData.status);
    });

    it('should support array operations', () => {
      // Arrange
      const budgetHealthArray: BudgetHealth[] = [
        {
          projectId: 1,
          status: 'Healthy',
          utilizationPercentage: 70,
          estimatedBudget: 100000,
          actualCost: 70000
        },
        {
          projectId: 2,
          status: 'Warning',
          utilizationPercentage: 85,
          estimatedBudget: 80000,
          actualCost: 68000
        }
      ];

      // Act
      const totalEstimated = budgetHealthArray.reduce((sum, b) => sum + b.estimatedBudget, 0);
      const totalActual = budgetHealthArray.reduce((sum, b) => sum + b.actualCost, 0);
      const averageUtilization = budgetHealthArray.reduce((sum, b) => sum + b.utilizationPercentage, 0) / budgetHealthArray.length;

      // Assert
      expect(totalEstimated).toBe(180000);
      expect(totalActual).toBe(138000);
      expect(averageUtilization).toBe(77.5);
    });

    it('should support mapping and transformation', () => {
      // Arrange
      const budgetHealthList: BudgetHealth[] = [
        {
          projectId: 1,
          status: 'Healthy',
          utilizationPercentage: 60,
          estimatedBudget: 100000,
          actualCost: 60000
        },
        {
          projectId: 2,
          status: 'Critical',
          utilizationPercentage: 110,
          estimatedBudget: 50000,
          actualCost: 55000
        }
      ];

      // Act
      const projectIds = budgetHealthList.map(b => b.projectId);
      const statuses = budgetHealthList.map(b => b.status);
      const remainingBudgets = budgetHealthList.map(b => b.estimatedBudget - b.actualCost);

      // Assert
      expect(projectIds).toEqual([1, 2]);
      expect(statuses).toEqual(['Healthy', 'Critical']);
      expect(remainingBudgets).toEqual([40000, -5000]);
    });

    it('should support conditional operations based on status', () => {
      // Arrange
      const budgetHealth: BudgetHealth = {
        projectId: 100,
        status: 'Critical',
        utilizationPercentage: 95,
        estimatedBudget: 80000,
        actualCost: 76000
      };

      // Act
      const needsAttention = budgetHealth.status === 'Critical' || budgetHealth.status === 'Warning';
      const isNearBudgetLimit = budgetHealth.utilizationPercentage > 90;
      const actionRequired = needsAttention && isNearBudgetLimit;

      // Assert
      expect(needsAttention).toBe(true);
      expect(isNearBudgetLimit).toBe(true);
      expect(actionRequired).toBe(true);
    });
  });

  describe('Edge Cases and Error Scenarios', () => {
    it('should handle zero values correctly', () => {
      // Arrange
      const zeroBudgetHealth: BudgetHealth = {
        projectId: 0,
        status: 'Healthy',
        utilizationPercentage: 0,
        estimatedBudget: 0,
        actualCost: 0
      };

      // Assert
      expect(zeroBudgetHealth.projectId).toBe(0);
      expect(zeroBudgetHealth.utilizationPercentage).toBe(0);
      expect(zeroBudgetHealth.estimatedBudget).toBe(0);
      expect(zeroBudgetHealth.actualCost).toBe(0);
    });

    it('should handle negative values', () => {
      // Arrange
      const negativeBudgetHealth: BudgetHealth = {
        projectId: -1,
        status: 'Critical',
        utilizationPercentage: -10,
        estimatedBudget: -1000,
        actualCost: -500
      };

      // Assert
      expect(negativeBudgetHealth.projectId).toBe(-1);
      expect(negativeBudgetHealth.utilizationPercentage).toBe(-10);
      expect(negativeBudgetHealth.estimatedBudget).toBe(-1000);
      expect(negativeBudgetHealth.actualCost).toBe(-500);
    });

    it('should handle extreme utilization percentages', () => {
      // Arrange
      const extremeUtilization: BudgetHealth[] = [
        {
          projectId: 1,
          status: 'Critical',
          utilizationPercentage: 1000,
          estimatedBudget: 10000,
          actualCost: 100000
        },
        {
          projectId: 2,
          status: 'Healthy',
          utilizationPercentage: 0.01,
          estimatedBudget: 100000,
          actualCost: 10
        }
      ];

      // Assert
      expect(extremeUtilization[0].utilizationPercentage).toBe(1000);
      expect(extremeUtilization[1].utilizationPercentage).toBe(0.01);
    });

    it('should handle floating point precision issues', () => {
      // Arrange
      const precisionBudgetHealth: BudgetHealth = {
        projectId: 123,
        status: 'Warning',
        utilizationPercentage: 33.333333333333336,
        estimatedBudget: 99.99,
        actualCost: 33.33
      };

      // Act
      const roundedUtilization = Math.round(precisionBudgetHealth.utilizationPercentage * 100) / 100;

      // Assert
      expect(roundedUtilization).toBeCloseTo(33.33, 2);
      expect(precisionBudgetHealth.estimatedBudget).toBeCloseTo(99.99, 2);
    });
  });

  describe('JSON Serialization Compatibility', () => {
    it('should serialize and deserialize BudgetHealth correctly', () => {
      // Arrange
      const originalBudgetHealth: BudgetHealth = {
        projectId: 456,
        status: 'Warning',
        utilizationPercentage: 87.5,
        estimatedBudget: 150000,
        actualCost: 131250
      };

      // Act
      const serialized = JSON.stringify(originalBudgetHealth);
      const deserialized: BudgetHealth = JSON.parse(serialized);

      // Assert
      expect(deserialized).toEqual(originalBudgetHealth);
      expect(typeof deserialized.projectId).toBe('number');
      expect(typeof deserialized.status).toBe('string');
      expect(typeof deserialized.utilizationPercentage).toBe('number');
    });

    it('should serialize and deserialize BudgetHealthResponse correctly', () => {
      // Arrange
      const originalResponse: BudgetHealthResponse = {
        success: true,
        data: {
          projectId: 789,
          status: 'Critical',
          utilizationPercentage: 105.5,
          estimatedBudget: 80000,
          actualCost: 84400
        },
        message: 'Budget health data retrieved'
      };

      // Act
      const serialized = JSON.stringify(originalResponse);
      const deserialized: BudgetHealthResponse = JSON.parse(serialized);

      // Assert
      expect(deserialized).toEqual(originalResponse);
      expect(deserialized.data.status).toBe('Critical');
      expect(typeof deserialized.success).toBe('boolean');
    });

    it('should handle arrays in JSON operations', () => {
      // Arrange
      const budgetHealthArray: BudgetHealth[] = [
        {
          projectId: 1,
          status: 'Healthy',
          utilizationPercentage: 65,
          estimatedBudget: 100000,
          actualCost: 65000
        },
        {
          projectId: 2,
          status: 'Warning',
          utilizationPercentage: 90,
          estimatedBudget: 75000,
          actualCost: 67500
        }
      ];

      // Act
      const serialized = JSON.stringify(budgetHealthArray);
      const deserialized: BudgetHealth[] = JSON.parse(serialized);

      // Assert
      expect(deserialized).toEqual(budgetHealthArray);
      expect(deserialized).toHaveLength(2);
      deserialized.forEach((item, index) => {
        expect(item).toEqual(budgetHealthArray[index]);
      });
    });

    it('should preserve numeric precision in serialization', () => {
      // Arrange
      const precisionBudgetHealth: BudgetHealth = {
        projectId: 999,
        status: 'Healthy',
        utilizationPercentage: 73.456789,
        estimatedBudget: 123456.789,
        actualCost: 90678.123
      };

      // Act
      const serialized = JSON.stringify(precisionBudgetHealth);
      const deserialized: BudgetHealth = JSON.parse(serialized);

      // Assert
      expect(deserialized.utilizationPercentage).toBeCloseTo(73.456789, 6);
      expect(deserialized.estimatedBudget).toBeCloseTo(123456.789, 3);
      expect(deserialized.actualCost).toBeCloseTo(90678.123, 3);
    });
  });
});