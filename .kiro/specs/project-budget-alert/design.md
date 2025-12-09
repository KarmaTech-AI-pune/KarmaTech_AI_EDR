# Technical Design: Project Budget Alert (Simplified Demo)

## Overview

Simple budget health indicator that calculates utilization percentage and returns color-coded status.

## API Endpoint

```
GET /api/projects/{projectId}/budget/health

Response:
{
  "projectId": 123,
  "status": "Warning",           // "Healthy" | "Warning" | "Critical"
  "utilizationPercentage": 92.5,
  "estimatedBudget": 100000.00,
  "actualCost": 92500.00
}
```

## Status Logic

```
if (utilization < 90%)  → "Healthy" (Green)
if (utilization 90-100%) → "Warning" (Yellow)
if (utilization > 100%) → "Critical" (Red)
```

## Components

### Backend
- BudgetHealthDto (response model)
- GetBudgetHealthQuery + Handler (CQRS)
- Add endpoint to existing ProjectController

### Frontend
- BudgetHealthIndicator.tsx (React component)
- budgetApi.ts (API service)
