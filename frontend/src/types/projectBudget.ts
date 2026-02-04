/**
 * Project Budget Change Tracking Types
 * 
 * Type definitions for project budget change history tracking feature.
 * These types align with the backend DTOs and API contracts.
 */

/**
 * User information included in budget change history
 */
export interface UserDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

/**
 * Project budget change history record
 * Represents a single change to project budget fields
 */
export interface ProjectBudgetChangeHistory {
  id: number;
  projectId: number;
  fieldName: 'EstimatedProjectCost' | 'EstimatedProjectFee';
  oldValue: number;
  newValue: number;
  variance: number;
  percentageVariance: number;
  currency: string;
  changedBy: string;
  changedByUser: UserDto;
  changedDate: string;
  reason?: string;
}

/**
 * Request payload for updating project budget
 */
export interface UpdateProjectBudgetRequest {
  estimatedProjectCost?: number;
  estimatedProjectFee?: number;
  reason?: string;
}

/**
 * Response from budget update operation
 */
export interface ProjectBudgetUpdateResult {
  success: boolean;
  message: string;
  createdHistoryRecords: ProjectBudgetChangeHistory[];
}

/**
 * API response wrapper for single budget change history record
 */
export interface ProjectBudgetChangeHistoryResponse {
  success: boolean;
  data: ProjectBudgetChangeHistory;
  message?: string;
}

/**
 * API response wrapper for list of budget change history records
 */
export interface ProjectBudgetChangeHistoryListResponse {
  success: boolean;
  data: ProjectBudgetChangeHistory[];
  message?: string;
  pagination?: PaginationInfo;
}

/**
 * Pagination information for paginated responses
 */
export interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * Query parameters for fetching budget change history
 */
export interface GetBudgetHistoryParams {
  projectId: number;
  fieldName?: 'EstimatedProjectCost' | 'EstimatedProjectFee';
  pageNumber?: number;
  pageSize?: number;
}

/**
 * Budget variance summary for analytics
 */
export interface BudgetVarianceSummary {
  projectId: number;
  totalCostChanges: number;
  totalFeeChanges: number;
  currentEstimatedCost: number;
  currentEstimatedFee: number;
  totalCostVariance: number;
  totalFeeVariance: number;
  lastChangeDate?: string;
}
