# Technical Design: Project Budget Alert Threshold

## Overview

Budget monitoring system that tracks project costs against estimated budgets and generates alerts when thresholds are exceeded.

## Database Schema

```sql
CREATE TABLE ProjectBudgetAlert (
    Id INT PRIMARY KEY IDENTITY(1,1),
    ProjectId INT NOT NULL,
    AlertLevel NVARCHAR(20) NOT NULL, -- 'Warning' or 'Critical'
    ThresholdPercentage DECIMAL(5,2) NOT NULL,
    EstimatedBudget DECIMAL(18,2) NOT NULL,
    ActualCost DECIMAL(18,2) NOT NULL,
    AlertDate DATETIME NOT NULL DEFAULT GETUTCDATE(),
    IsAcknowledged BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME NOT NULL DEFAULT GETUTCDATE(),
    
    CONSTRAINT FK_ProjectBudgetAlert_Project 
        FOREIGN KEY (ProjectId) REFERENCES Project(ProjectId)
);

CREATE INDEX IX_ProjectBudgetAlert_ProjectId ON ProjectBudgetAlert(ProjectId);
```

## API Endpoints

```
GET  /api/projects/{projectId}/budget/alerts  - Get all alerts
GET  /api/projects/{projectId}/budget/health  - Get health status
POST /api/projects/{projectId}/budget/check   - Trigger check
```

## Components

### Backend
- ProjectBudgetAlert entity
- IProjectBudgetAlertRepository
- CheckProjectBudgetCommand (CQRS)
- GetProjectBudgetAlertsQuery (CQRS)
- ProjectBudgetController

### Frontend
- ProjectBudgetHealthIndicator.tsx
- BudgetAlertList.tsx
- projectBudgetApi.ts

## Correctness Properties

1. **Threshold Detection**: 90% budget → Warning alert
2. **Critical Alert**: 100% budget → Critical alert
3. **Duplicate Prevention**: No duplicate alerts within 24 hours
4. **Health Status Consistency**: Green (<90%), Yellow (90-100%), Red (>100%)
