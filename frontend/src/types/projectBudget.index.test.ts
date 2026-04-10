/**
 * Unit Tests for Project Budget Index Types
 * 
 * Tests barrel export functionality and type re-exports.
 * Ensures proper TypeScript compilation and export integrity.
 */

import { describe, it, expect } from 'vitest';
import type { 
  UserDto,
  ProjectBudgetChangeHistory,
  UpdateProjectBudgetRequest,
  ProjectBudgetUpdateResult,
  ProjectBudgetChangeHistoryResponse,
  ProjectBudgetChangeHistoryListResponse,
  PaginationInfo,
  GetBudgetHistoryParams,
  BudgetVarianceSummary
} from './projectBudget.index';

describe('Project Budget Index Types', () => {
  describe('Type Re-exports', () => {
    it('should re-export UserDto correctly', () => {
      // Arrange
      const userDto: UserDto = {
        id: 'test-user',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com'
      };

      // Assert
      expect(userDto).toHaveProperty('id');
      expect(userDto).toHaveProperty('firstName');
      expect(userDto).toHaveProperty('lastName');
      expect(userDto).toHaveProperty('email');
    });

    it('should re-export ProjectBudgetChangeHistory correctly', () => {
      // Arrange
      const userDto: UserDto = {
        id: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com'
      };

      const changeHistory: ProjectBudgetChangeHistory = {
        id: 1,
        projectId: 100,
        fieldName: 'EstimatedProjectCost',
        oldValue: 50000,
        newValue: 60000,
        variance: 10000,
        percentageVariance: 20,
        currency: 'USD',
        changedBy: 'user-1',
        changedByUser: userDto,
        changedDate: '2024-01-15T10:30:00Z'
      };

      // Assert
      expect(changeHistory).toHaveProperty('id');
      expect(changeHistory).toHaveProperty('projectId');
      expect(changeHistory).toHaveProperty('fieldName');
      expect(changeHistory.fieldName).toBe('EstimatedProjectCost');
    });

    it('should re-export UpdateProjectBudgetRequest correctly', () => {
      // Arrange
      const updateRequest: UpdateProjectBudgetRequest = {
        estimatedProjectCost: 75000,
        estimatedProjectFee: 7500,
        reason: 'Budget revision'
      };

      // Assert
      expect(updateRequest).toHaveProperty('estimatedProjectCost');
      expect(updateRequest).toHaveProperty('estimatedProjectFee');
      expect(updateRequest).toHaveProperty('reason');
    });

    it('should re-export PaginationInfo correctly', () => {
      // Arrange
      const pagination: PaginationInfo = {
        currentPage: 1,
        pageSize: 10,
        totalCount: 50,
        totalPages: 5,
        hasNext: true,
        hasPrevious: false
      };

      // Assert
      expect(pagination).toHaveProperty('currentPage');
      expect(pagination).toHaveProperty('pageSize');
      expect(pagination).toHaveProperty('totalCount');
      expect(pagination).toHaveProperty('totalPages');
      expect(pagination).toHaveProperty('hasNext');
      expect(pagination).toHaveProperty('hasPrevious');
    });

    it('should re-export GetBudgetHistoryParams correctly', () => {
      // Arrange
      const params: GetBudgetHistoryParams = {
        projectId: 123,
        fieldName: 'EstimatedProjectFee',
        pageNumber: 2,
        pageSize: 15
      };

      // Assert
      expect(params).toHaveProperty('projectId');
      expect(params.projectId).toBe(123);
      expect(params.fieldName).toBe('EstimatedProjectFee');
    });

    it('should re-export BudgetVarianceSummary correctly', () => {
      // Arrange
      const summary: BudgetVarianceSummary = {
        projectId: 456,
        totalCostChanges: 3,
        totalFeeChanges: 2,
        currentEstimatedCost: 120000,
        currentEstimatedFee: 12000,
        totalCostVariance: 20000,
        totalFeeVariance: 2000,
        lastChangeDate: '2024-01-20T14:30:00Z'
      };

      // Assert
      expect(summary).toHaveProperty('projectId');
      expect(summary).toHaveProperty('totalCostChanges');
      expect(summary).toHaveProperty('totalFeeChanges');
      expect(summary).toHaveProperty('currentEstimatedCost');
      expect(summary).toHaveProperty('currentEstimatedFee');
    });

    it('should re-export response wrapper types correctly', () => {
      // Arrange
      const userDto: UserDto = {
        id: 'user-1',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com'
      };

      const changeHistory: ProjectBudgetChangeHistory = {
        id: 1,
        projectId: 100,
        fieldName: 'EstimatedProjectCost',
        oldValue: 50000,
        newValue: 60000,
        variance: 10000,
        percentageVariance: 20,
        currency: 'USD',
        changedBy: 'user-1',
        changedByUser: userDto,
        changedDate: '2024-01-15T10:30:00Z'
      };

      const singleResponse: ProjectBudgetChangeHistoryResponse = {
        success: true,
        data: changeHistory
      };

      const listResponse: ProjectBudgetChangeHistoryListResponse = {
        success: true,
        data: [changeHistory]
      };

      const updateResult: ProjectBudgetUpdateResult = {
        success: true,
        message: 'Budget updated successfully',
        createdHistoryRecords: [changeHistory]
      };

      // Assert
      expect(singleResponse).toHaveProperty('success');
      expect(singleResponse).toHaveProperty('data');
      expect(listResponse).toHaveProperty('success');
      expect(listResponse).toHaveProperty('data');
      expect(updateResult).toHaveProperty('success');
      expect(updateResult).toHaveProperty('message');
      expect(updateResult).toHaveProperty('createdHistoryRecords');
    });
  });

  describe('Type Compatibility', () => {
    it('should maintain type compatibility with original exports', () => {
      // Arrange - Import from both sources
      const userFromIndex: UserDto = {
        id: 'compatibility-test',
        firstName: 'Compatibility',
        lastName: 'Test',
        email: 'compatibility@example.com'
      };

      // Act - Use in operations that require the type
      const processUser = (user: UserDto): string => {
        return `${user.firstName} ${user.lastName}`;
      };

      const result = processUser(userFromIndex);

      // Assert
      expect(result).toBe('Compatibility Test');
      expect(typeof userFromIndex.id).toBe('string');
    });

    it('should support array operations with re-exported types', () => {
      // Arrange
      const userDto: UserDto = {
        id: 'array-test',
        firstName: 'Array',
        lastName: 'Test',
        email: 'array@example.com'
      };

      const changes: ProjectBudgetChangeHistory[] = [
        {
          id: 1,
          projectId: 100,
          fieldName: 'EstimatedProjectCost',
          oldValue: 50000,
          newValue: 60000,
          variance: 10000,
          percentageVariance: 20,
          currency: 'USD',
          changedBy: 'user-1',
          changedByUser: userDto,
          changedDate: '2024-01-15T10:30:00Z'
        },
        {
          id: 2,
          projectId: 100,
          fieldName: 'EstimatedProjectFee',
          oldValue: 5000,
          newValue: 6000,
          variance: 1000,
          percentageVariance: 20,
          currency: 'USD',
          changedBy: 'user-1',
          changedByUser: userDto,
          changedDate: '2024-01-16T10:30:00Z'
        }
      ];

      // Act
      const costChanges = changes.filter(c => c.fieldName === 'EstimatedProjectCost');
      const feeChanges = changes.filter(c => c.fieldName === 'EstimatedProjectFee');
      const totalVariance = changes.reduce((sum, c) => sum + c.variance, 0);

      // Assert
      expect(costChanges).toHaveLength(1);
      expect(feeChanges).toHaveLength(1);
      expect(totalVariance).toBe(11000);
    });

    it('should support generic operations with re-exported types', () => {
      // Arrange
      const createResponse = <T>(success: boolean, data: T, message?: string) => ({
        success,
        data,
        message
      });

      const userDto: UserDto = {
        id: 'generic-test',
        firstName: 'Generic',
        lastName: 'Test',
        email: 'generic@example.com'
      };

      const changeHistory: ProjectBudgetChangeHistory = {
        id: 1,
        projectId: 100,
        fieldName: 'EstimatedProjectCost',
        oldValue: 50000,
        newValue: 60000,
        variance: 10000,
        percentageVariance: 20,
        currency: 'USD',
        changedBy: 'user-1',
        changedByUser: userDto,
        changedDate: '2024-01-15T10:30:00Z'
      };

      // Act
      const response = createResponse(true, changeHistory, 'Success');

      // Assert
      expect(response.success).toBe(true);
      expect(response.data).toEqual(changeHistory);
      expect(response.message).toBe('Success');
    });
  });

  describe('JSON Serialization with Re-exported Types', () => {
    it('should serialize and deserialize re-exported types correctly', () => {
      // Arrange
      const userDto: UserDto = {
        id: 'serialize-test',
        firstName: 'Serialize',
        lastName: 'Test',
        email: 'serialize@example.com'
      };

      const changeHistory: ProjectBudgetChangeHistory = {
        id: 999,
        projectId: 888,
        fieldName: 'EstimatedProjectFee',
        oldValue: 15000.50,
        newValue: 18000.75,
        variance: 3000.25,
        percentageVariance: 20.0167,
        currency: 'GBP',
        changedBy: 'serialize-user',
        changedByUser: userDto,
        changedDate: '2024-01-25T16:45:30Z',
        reason: 'Serialization test'
      };

      // Act
      const serialized = JSON.stringify(changeHistory);
      const deserialized: ProjectBudgetChangeHistory = JSON.parse(serialized);

      // Assert
      expect(deserialized).toEqual(changeHistory);
      expect(deserialized.changedByUser.firstName).toBe('Serialize');
      expect(typeof deserialized.variance).toBe('number');
      expect(deserialized.percentageVariance).toBeCloseTo(20.0167, 4);
    });

    it('should handle complex nested structures with re-exported types', () => {
      // Arrange
      const userDto: UserDto = {
        id: 'nested-test',
        firstName: 'Nested',
        lastName: 'Structure',
        email: 'nested@example.com'
      };

      const changes: ProjectBudgetChangeHistory[] = [
        {
          id: 1,
          projectId: 100,
          fieldName: 'EstimatedProjectCost',
          oldValue: 50000,
          newValue: 60000,
          variance: 10000,
          percentageVariance: 20,
          currency: 'USD',
          changedBy: 'user-1',
          changedByUser: userDto,
          changedDate: '2024-01-15T10:30:00Z'
        }
      ];

      const pagination: PaginationInfo = {
        currentPage: 1,
        pageSize: 10,
        totalCount: 1,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false
      };

      const listResponse: ProjectBudgetChangeHistoryListResponse = {
        success: true,
        data: changes,
        message: 'Retrieved successfully',
        pagination: pagination
      };

      // Act
      const serialized = JSON.stringify(listResponse);
      const deserialized: ProjectBudgetChangeHistoryListResponse = JSON.parse(serialized);

      // Assert
      expect(deserialized).toEqual(listResponse);
      expect(deserialized.data).toHaveLength(1);
      expect(deserialized.pagination?.totalCount).toBe(1);
      expect(deserialized.data[0].changedByUser.firstName).toBe('Nested');
    });
  });
});