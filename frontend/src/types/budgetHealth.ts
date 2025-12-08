/**
 * Budget Health Types
 * 
 * Type definitions for project budget health monitoring feature.
 * These types align with the backend DTOs and API contracts.
 */

/**
 * Budget health status values
 */
export type BudgetHealthStatus = 'Healthy' | 'Warning' | 'Critical';

/**
 * Budget health information for a project
 * Represents the current budget utilization and status
 */
export interface BudgetHealth {
  projectId: number;
  status: BudgetHealthStatus;
  utilizationPercentage: number;
  estimatedBudget: number;
  actualCost: number;
}

/**
 * API response wrapper for budget health
 */
export interface BudgetHealthResponse {
  success: boolean;
  data: BudgetHealth;
  message?: string;
}
