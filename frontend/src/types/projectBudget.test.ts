/**
 * Unit Tests for Project Budget Types
 * 
 * Tests type definitions, interfaces, and type safety for project budget types.
 * Ensures proper TypeScript compilation and type constraints.
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
} from './projectBudget';

describe('Project Budget Types', () => {
  describe('UserDto Interface', () => {
    it('should accept valid user DTO object', () => {
      // Arrange
      const userDto: UserDto = {
        id: 'user-123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com'
      };

      // Assert
      expect(userDto.id).toBe('user-123');
      expect(userDto.firstName).toBe('John');
      expect(userDto.lastName).toBe('Doe');
      expect(userDto.email).toBe('john.doe@example.com');
    });

    it('should enforce required properties', () => {
      // Arrange
      const userDto: UserDto = {
        id: 'user-456',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com'
      };

      // Assert
      expect(userDto).toHaveProperty('id');
      expect(userDto).toHaveProperty('firstName');
      expect(userDto).toHaveProperty('lastName');
      expect(userDto).toHaveProperty('email');
    });
  });

  describe('ProjectBudgetChangeHistory Interface', () => {
    it('should accept valid budget change history object', () => {
      // Arrange
      const userDto: UserDto = {
        id: 'user-1',
        firstName: 'John',
        lastName: 'Manager',
        email: 'john@example.com'
      };

      const changeHistory: ProjectBudgetChangeHistory = {
        id: 1,
        projectId: 123,
        fieldName: 'EstimatedProjectCost',
        oldValue: 100000,
        newValue: 120000,
        variance: 20000,
        percentageVariance: 20.0,
        currency: 'USD',
        changedBy: 'user-1',
        changedByUser: userDto,
        changedDate: '2024-01-15T10:30:00Z',
        reason: 'Scope expansion'
      };

      // Assert
      expect(changeHistory.id).toBe(1);
      expect(changeHistory.projectId).toBe(123);
      expect(changeHistory.fieldName).toBe('EstimatedProjectCost');
      expect(changeHistory.variance).toBe(20000);
      expect(changeHistory.percentageVariance).toBe(20.0);
      expect(changeHistory.reason).toBe('Scope expansion');
    });

    it('should handle field name values correctly', () => {
      // Arrange
      const userDto: UserDto = { id: '1', firstName: 'User', lastName: 'Test', email: 'test@example.com' };
      
      const costChange: ProjectBudgetChangeHistory = {
        id: 1, projectId: 100, fieldName: 'EstimatedProjectCost',
        oldValue: 50000, newValue: 60000, variance: 10000, percentageVariance: 20,
        currency: 'USD', changedBy: 'user-1', changedByUser: userDto,
        changedDate: '2024-01-15T10:30:00Z'
      };

      const feeChange: ProjectBudgetChangeHistory = {
        id: 2, projectId: 100, fieldName: 'EstimatedProjectFee',
        oldValue: 5000, newValue: 6000, variance: 1000, percentageVariance: 20,
        currency: 'USD', changedBy: 'user-1', changedByUser: userDto,
        changedDate: '2024-01-15T10:30:00Z'
      };

      // Assert
      expect(costChange.fieldName).toBe('EstimatedProjectCost');
      expect(feeChange.fieldName).toBe('EstimatedProjectFee');
    });
  });

  describe('UpdateProjectBudgetRequest Interface', () => {
    it('should accept valid update request', () => {
      // Arrange
      const updateRequest: UpdateProjectBudgetRequest = {
        estimatedProjectCost: 150000,
        estimatedProjectFee: 15000,
        reason: 'Budget adjustment based on new requirements'
      };

      // Assert
      expect(updateRequest.estimatedProjectCost).toBe(150000);
      expect(updateRequest.estimatedProjectFee).toBe(15000);
      expect(updateRequest.reason).toBe('Budget adjustment based on new requirements');
    });

    it('should handle optional properties', () => {
      // Arrange
      const partialUpdate: UpdateProjectBudgetRequest = {
        estimatedProjectCost: 200000
      };

      // Assert
      expect(partialUpdate.estimatedProjectCost).toBe(200000);
      expect(partialUpdate.estimatedProjectFee).toBeUndefined();
      expect(partialUpdate.reason).toBeUndefined();
    });
  });

  describe('PaginationInfo Interface', () => {
    it('should accept valid pagination info', () => {
      // Arrange
      const pagination: PaginationInfo = {
        currentPage: 2,
        pageSize: 10,
        totalCount: 45,
        totalPages: 5,
        hasNext: true,
        hasPrevious: true
      };

      // Assert
      expect(pagination.currentPage).toBe(2);
      expect(pagination.pageSize).toBe(10);
      expect(pagination.totalCount).toBe(45);
      expect(pagination.totalPages).toBe(5);
      expect(pagination.hasNext).toBe(true);
      expect(pagination.hasPrevious).toBe(true);
    });

    it('should handle first page scenario', () => {
      // Arrange
      const firstPage: PaginationInfo = {
        currentPage: 1,
        pageSize: 20,
        totalCount: 100,
        totalPages: 5,
        hasNext: true,
        hasPrevious: false
      };

      // Assert
      expect(firstPage.currentPage).toBe(1);
      expect(firstPage.hasPrevious).toBe(false);
      expect(firstPage.hasNext).toBe(true);
    });
  });

  describe('GetBudgetHistoryParams Interface', () => {
    it('should accept valid query parameters', () => {
      // Arrange
      const params: GetBudgetHistoryParams = {
        projectId: 123,
        fieldName: 'EstimatedProjectCost',
        pageNumber: 1,
        pageSize: 20
      };

      // Assert
      expect(params.projectId).toBe(123);
      expect(params.fieldName).toBe('EstimatedProjectCost');
      expect(params.pageNumber).toBe(1);
      expect(params.pageSize).toBe(20);
    });

    it('should handle minimal parameters', () => {
      // Arrange
      const minimalParams: GetBudgetHistoryParams = {
        projectId: 456
      };

      // Assert
      expect(minimalParams.projectId).toBe(456);
      expect(minimalParams.fieldName).toBeUndefined();
      expect(minimalParams.pageNumber).toBeUndefined();
      expect(minimalParams.pageSize).toBeUndefined();
    });
  });

  describe('BudgetVarianceSummary Interface', () => {
    it('should accept valid variance summary', () => {
      // Arrange
      const summary: BudgetVarianceSummary = {
        projectId: 789,
        totalCostChanges: 5,
        totalFeeChanges: 3,
        currentEstimatedCost: 180000,
        currentEstimatedFee: 18000,
        totalCostVariance: 30000,
        totalFeeVariance: 3000,
        lastChangeDate: '2024-01-20T15:45:00Z'
      };

      // Assert
      expect(summary.projectId).toBe(789);
      expect(summary.totalCostChanges).toBe(5);
      expect(summary.totalFeeChanges).toBe(3);
      expect(summary.currentEstimatedCost).toBe(180000);
      expect(summary.totalCostVariance).toBe(30000);
      expect(summary.lastChangeDate).toBe('2024-01-20T15:45:00Z');
    });

    it('should handle optional lastChangeDate', () => {
      // Arrange
      const summaryWithoutDate: BudgetVarianceSummary = {
        projectId: 999,
        totalCostChanges: 0,
        totalFeeChanges: 0,
        currentEstimatedCost: 100000,
        currentEstimatedFee: 10000,
        totalCostVariance: 0,
        totalFeeVariance: 0
      };

      // Assert
      expect(summaryWithoutDate.lastChangeDate).toBeUndefined();
      expect(summaryWithoutDate.totalCostChanges).toBe(0);
      expect(summaryWithoutDate.totalFeeChanges).toBe(0);
    });
  });

  describe('Response Wrapper Types', () => {
    it('should handle successful single response', () => {
      // Arrange
      const userDto: UserDto = { id: '1', firstName: 'Test', lastName: 'User', email: 'test@example.com' };
      const changeHistory: ProjectBudgetChangeHistory = {
        id: 1, projectId: 100, fieldName: 'EstimatedProjectCost',
        oldValue: 50000, newValue: 60000, variance: 10000, percentageVariance: 20,
        currency: 'USD', changedBy: 'user-1', changedByUser: userDto,
        changedDate: '2024-01-15T10:30:00Z'
      };

      const response: ProjectBudgetChangeHistoryResponse = {
        success: true,
        data: changeHistory,
        message: 'Budget change history retrieved successfully'
      };

      // Assert
      expect(response.success).toBe(true);
      expect(response.data).toEqual(changeHistory);
      expect(response.message).toBe('Budget change history retrieved successfully');
    });

    it('should handle successful list response with pagination', () => {
      // Arrange
      const userDto: UserDto = { id: '1', firstName: 'Test', lastName: 'User', email: 'test@example.com' };
      const changes: ProjectBudgetChangeHistory[] = [
        {
          id: 1, projectId: 100, fieldName: 'EstimatedProjectCost',
          oldValue: 50000, newValue: 60000, variance: 10000, percentageVariance: 20,
          currency: 'USD', changedBy: 'user-1', changedByUser: userDto,
          changedDate: '2024-01-15T10:30:00Z'
        }
      ];

      const pagination: PaginationInfo = {
        currentPage: 1, pageSize: 10, totalCount: 1, totalPages: 1,
        hasNext: false, hasPrevious: false
      };

      const listResponse: ProjectBudgetChangeHistoryListResponse = {
        success: true,
        data: changes,
        pagination: pagination
      };

      // Assert
      expect(listResponse.success).toBe(true);
      expect(listResponse.data).toHaveLength(1);
      expect(listResponse.pagination).toEqual(pagination);
    });
  });

  describe('JSON Serialization Compatibility', () => {
    it('should serialize and deserialize ProjectBudgetChangeHistory correctly', () => {
      // Arrange
      const userDto: UserDto = { id: 'user-1', firstName: 'John', lastName: 'Doe', email: 'john@example.com' };
      const original: ProjectBudgetChangeHistory = {
        id: 123,
        projectId: 456,
        fieldName: 'EstimatedProjectFee',
        oldValue: 10000.50,
        newValue: 12000.75,
        variance: 2000.25,
        percentageVariance: 20.025,
        currency: 'EUR',
        changedBy: 'user-1',
        changedByUser: userDto,
        changedDate: '2024-01-15T10:30:00Z',
        reason: 'Currency adjustment'
      };

      // Act
      const serialized = JSON.stringify(original);
      const deserialized: ProjectBudgetChangeHistory = JSON.parse(serialized);

      // Assert
      expect(deserialized).toEqual(original);
      expect(typeof deserialized.oldValue).toBe('number');
      expect(typeof deserialized.newValue).toBe('number');
      expect(typeof deserialized.percentageVariance).toBe('number');
    });
  });
});