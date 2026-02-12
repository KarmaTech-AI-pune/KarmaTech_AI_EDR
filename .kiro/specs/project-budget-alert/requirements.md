# Requirements: Project Budget Alert (Simplified Demo)

## Feature Summary

Add a budget health indicator to projects that shows green/yellow/red status based on budget utilization.

## Requirements

### Requirement 1: Budget Health Status API

**User Story:** As a frontend developer, I want an API endpoint that returns budget health status for a project.

#### Acceptance Criteria

1. GET /api/projects/{id}/budget/health returns health status
2. Status is "Healthy" when utilization < 90%
3. Status is "Warning" when utilization is 90-100%
4. Status is "Critical" when utilization > 100%
5. Response includes: status, utilizationPercentage, estimatedBudget, actualCost

### Requirement 2: Budget Health UI Component

**User Story:** As a project manager, I want to see a color-coded budget health indicator on the project page.

#### Acceptance Criteria

1. Green indicator when status is "Healthy"
2. Yellow indicator when status is "Warning"
3. Red indicator when status is "Critical"
4. Shows utilization percentage
