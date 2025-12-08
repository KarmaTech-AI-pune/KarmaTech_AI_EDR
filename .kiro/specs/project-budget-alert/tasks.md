# Implementation Tasks: Project Budget Alert (Simplified Demo)

## Task List (6 Tasks - ~20 minutes)

- [ ] 1. Create BudgetHealthDto and Query
  - Create BudgetHealthDto.cs with status, utilization, budget, cost
  - Create GetBudgetHealthQuery.cs and handler
  - Calculate utilization: (ActualCost / EstimatedBudget) * 100
  - Determine status based on thresholds
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 2. Add API endpoint to ProjectController
  - Add GET /api/projects/{id}/budget/health endpoint
  - Use MediatR to call GetBudgetHealthQuery
  - Return BudgetHealthDto
  - _Requirements: 1.1_

- [ ] 3. Write backend unit test
  - Test status calculation logic
  - Test: <90% = Healthy, 90-100% = Warning, >100% = Critical
  - _Requirements: 1.2, 1.3, 1.4_

- [ ] 4. Create frontend TypeScript types and API service
  - Create BudgetHealth interface
  - Create getBudgetHealth() API method
  - _Requirements: 1.1, 1.5_

- [ ] 5. Create BudgetHealthIndicator React component
  - Display color-coded chip (green/yellow/red)
  - Show utilization percentage
  - Use Material-UI Chip component
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 6. Run tests and verify
  - Run backend tests: dotnet test
  - Verify API endpoint works
  - Verify component renders correctly
  - _Requirements: All_

## Git Workflow (Automated)

After each task:
1. `git add .`
2. `git commit -m "feat: [task description]"`
3. `git push origin feature/project-budget-alert`

After Task 6:
1. Generate test report
2. Create PR with GitHub CLI
3. Wait for approval
4. Merge and deploy to IIS
