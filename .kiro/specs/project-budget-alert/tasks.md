# Implementation Plan - Project Budget Alert Threshold

## Task List

- [ ] 1. Set up database schema and entity framework
  - Create ProjectBudgetAlert entity following BaseEntity pattern
  - Create EF Core configuration for ProjectBudgetAlert
  - Generate migration: AddProjectBudgetAlertTable
  - Add DbSet to ApplicationDbContext
  - _Requirements: 1.4, 2.1_

- [ ] 2. Implement repository layer
  - [ ] 2.1 Create IProjectBudgetAlertRepository interface
    - Define methods: GetByProjectIdAsync, GetLatestAlertAsync, HasRecentAlertAsync
    - _Requirements: 2.1, 2.3_
  
  - [ ] 2.2 Implement ProjectBudgetAlertRepository
    - Implement all interface methods with proper EF Core queries
    - Add indexes for performance optimization
    - _Requirements: 2.1, 2.3_
  
  - [ ]* 2.3 Write property-based tests for repository
    - **Property 5: Alert Retrieval Ordering**
    - **Validates: Requirements 2.1**

- [ ] 3. Implement budget calculation service
  - [ ] 3.1 Create BudgetCalculationService
    - Implement CalculateActualCost method (aggregate from MonthlyProgress)
    - Implement CalculateUtilizationPercentage method
    - Handle projects with no monthly progress data
    - _Requirements: 4.1, 4.3, 4.4_
  
  - [ ]* 3.2 Write property-based tests for budget calculation
    - **Property 4: Budget Calculation Accuracy**
    - **Validates: Requirements 4.1, 4.3**
  
  - [ ]* 3.3 Write unit tests for edge cases
    - Test with zero estimated budget
    - Test with no monthly progress data
    - Test with negative values (should reject)
    - _Requirements: 4.4_

- [ ] 4. Implement alert creation logic
  - [ ] 4.1 Create BudgetAlertService
    - Implement CheckBudgetThreshold method
    - Implement CreateAlert method with duplicate prevention
    - Implement alert level determination (Warning vs Critical)
    - _Requirements: 1.1, 1.2, 1.3, 1.5_
  
  - [ ]* 4.2 Write property-based tests for threshold detection
    - **Property 1: Budget Threshold Detection**
    - **Validates: Requirements 1.2**
  
  - [ ]* 4.3 Write property-based tests for critical alerts
    - **Property 2: Critical Alert Creation**
    - **Validates: Requirements 1.3**
  
  - [ ]* 4.4 Write property-based tests for duplicate prevention
    - **Property 3: Duplicate Alert Prevention**
    - **Validates: Requirements 1.5**

- [ ] 5. Implement CQRS commands and handlers
  - [ ] 5.1 Create CheckProjectBudgetCommand and handler
    - Implement command validation
    - Implement handler with budget calculation and alert creation
    - Return BudgetCheckResultDto
    - _Requirements: 1.1, 1.2, 1.3, 5.3_
  
  - [ ] 5.2 Create GetProjectBudgetAlertsQuery and handler
    - Implement query with optional filters (level, date range)
    - Return ordered list of ProjectBudgetAlertDto
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  
  - [ ]* 5.3 Write unit tests for command handlers
    - Test successful budget check
    - Test alert creation scenarios
    - Test error handling (project not found, no budget)
    - _Requirements: 1.1, 1.2, 1.3_

- [ ] 6. Implement API endpoints
  - [ ] 6.1 Create ProjectBudgetController
    - GET /api/projects/{projectId}/budget/alerts
    - GET /api/projects/{projectId}/budget/health
    - POST /api/projects/{projectId}/budget/check (admin only)
    - PATCH /api/projects/{projectId}/budget/alerts/{alertId}/acknowledge
    - Add proper authentication and authorization
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [ ]* 6.2 Write integration tests for API endpoints
    - Test GET alerts endpoint with filters
    - Test GET health endpoint
    - Test POST check endpoint (admin only)
    - Test authentication and authorization
    - _Requirements: 5.1, 5.2, 5.3, 5.5_

- [ ] 7. Checkpoint - Ensure all backend tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Implement frontend components
  - [ ] 8.1 Create TypeScript types
    - Define ProjectBudgetAlert interface
    - Define BudgetCheckResult interface
    - Define BudgetHealthStatus type
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  
  - [ ] 8.2 Create projectBudgetApi service
    - Implement getAlerts method
    - Implement getBudgetHealth method
    - Implement checkBudget method
    - Implement acknowledgeAlert method
    - _Requirements: 5.1, 5.2, 5.3_
  
  - [ ] 8.3 Create ProjectBudgetHealthIndicator component
    - Display color-coded status (green/yellow/red)
    - Show utilization percentage
    - Handle click to show alert history
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [ ]* 8.4 Write property-based tests for health indicator
    - **Property 6: Health Status Consistency**
    - **Validates: Requirements 3.2, 3.3, 3.4**
  
  - [ ] 8.5 Create BudgetAlertList component
    - Display alert history in timeline format
    - Show alert level, date, amounts
    - Support filtering by level and date
    - Add acknowledge button for unacknowledged alerts
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  
  - [ ]* 8.6 Write unit tests for frontend components
    - Test ProjectBudgetHealthIndicator rendering
    - Test BudgetAlertList rendering and filtering
    - Test API service methods
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 9. Integrate with existing project details page
  - [ ] 9.1 Update ProjectDetails.tsx
    - Add ProjectBudgetHealthIndicator to header
    - Add BudgetAlertList to details section
    - Wire up API calls
    - _Requirements: 3.1, 3.5_
  
  - [ ]* 9.2 Write E2E tests for integration
    - Test viewing budget health on project page
    - Test clicking indicator to view alerts
    - Test acknowledging alerts
    - _Requirements: 3.1, 3.5_

- [ ] 10. Add automatic budget checking on monthly progress update
  - [ ] 10.1 Update MonthlyProgressHandler
    - Add budget check after monthly progress is saved
    - Trigger alert creation if thresholds exceeded
    - _Requirements: 4.1, 4.2_
  
  - [ ]* 10.2 Write integration tests for automatic checking
    - Test budget check triggered on progress update
    - Test alert creation when threshold exceeded
    - _Requirements: 4.1, 4.2_

- [ ] 11. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Update documentation
  - Update API_DOCUMENTATION.md with new endpoints
  - Create BUDGET_ALERT_FEATURE.md documentation
  - Update DATABASE_SCHEMA.md with new table
  - _Requirements: All_
