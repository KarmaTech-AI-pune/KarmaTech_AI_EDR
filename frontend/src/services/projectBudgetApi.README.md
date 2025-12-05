# Project Budget API Service

## Overview

This module provides TypeScript interfaces and API service methods for the Project Budget Change Tracking feature. It enables frontend components to interact with the backend API for budget updates and history retrieval.

## Files Created

### 1. `types/projectBudget.ts`
Comprehensive TypeScript type definitions for:
- Budget change history records
- API request/response payloads
- Pagination information
- User DTOs
- Variance summaries

### 2. `services/projectBudgetApi.ts`
API service layer with methods for:
- Updating project budgets
- Retrieving budget change history
- Getting variance summaries
- Filtering by field type
- Fetching latest changes

### 3. `types/projectBudget.index.ts`
Barrel export file for convenient imports

## Usage Examples

### Importing Types

```typescript
import {
  ProjectBudgetChangeHistory,
  UpdateProjectBudgetRequest,
  GetBudgetHistoryParams,
} from '../types/projectBudget';
```

### Importing API Service

```typescript
import { projectBudgetApi } from '../services/projectBudgetApi';
// or
import { updateBudget, getBudgetHistory } from '../services/projectBudgetApi';
```

### Update Project Budget

```typescript
import { projectBudgetApi } from '../services/projectBudgetApi';

const handleBudgetUpdate = async () => {
  try {
    const result = await projectBudgetApi.updateBudget(123, {
      estimatedProjectCost: 5000000,
      estimatedProjectFee: 500000,
      reason: 'Updated based on revised scope'
    });
    
    console.log('Budget updated successfully:', result);
    console.log('History records created:', result.createdHistoryRecords);
  } catch (error) {
    console.error('Failed to update budget:', error.message);
  }
};
```

### Get Budget History

```typescript
import { projectBudgetApi } from '../services/projectBudgetApi';

const loadBudgetHistory = async (projectId: number) => {
  try {
    const history = await projectBudgetApi.getBudgetHistory({
      projectId,
      pageNumber: 1,
      pageSize: 10
    });
    
    console.log('Budget history:', history);
    
    history.forEach(change => {
      console.log(`${change.fieldName}: ${change.oldValue} → ${change.newValue}`);
      console.log(`Changed by: ${change.changedByUser.firstName} ${change.changedByUser.lastName}`);
      console.log(`Variance: ${change.variance} (${change.percentageVariance}%)`);
    });
  } catch (error) {
    console.error('Failed to load history:', error.message);
  }
};
```

### Filter by Field Type

```typescript
import { projectBudgetApi } from '../services/projectBudgetApi';

// Get only cost changes
const costChanges = await projectBudgetApi.getBudgetChangesByField(
  123,
  'EstimatedProjectCost'
);

// Get only fee changes
const feeChanges = await projectBudgetApi.getBudgetChangesByField(
  123,
  'EstimatedProjectFee'
);
```

### Get Latest Change

```typescript
import { projectBudgetApi } from '../services/projectBudgetApi';

const latestChange = await projectBudgetApi.getLatestBudgetChange(123);

if (latestChange) {
  console.log('Most recent change:', latestChange);
} else {
  console.log('No budget changes yet');
}
```

### Get Variance Summary

```typescript
import { projectBudgetApi } from '../services/projectBudgetApi';

const summary = await projectBudgetApi.getBudgetVarianceSummary(123);

console.log('Total cost changes:', summary.totalCostChanges);
console.log('Total fee changes:', summary.totalFeeChanges);
console.log('Current estimated cost:', summary.currentEstimatedCost);
console.log('Total cost variance:', summary.totalCostVariance);
```

## Error Handling

All API methods include comprehensive error handling:

- **400/422**: Validation errors - throws error with validation message
- **401**: Unauthorized - throws error prompting re-authentication
- **403**: Forbidden - throws error about insufficient permissions
- **404**: Not found - throws error indicating project doesn't exist
- **500**: Server error - throws generic error message

Example error handling in components:

```typescript
import { projectBudgetApi } from '../services/projectBudgetApi';

const MyComponent = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await projectBudgetApi.updateBudget(projectId, {
        estimatedProjectCost: newCost,
        reason: reason
      });
      
      // Success handling
      showSuccessMessage('Budget updated successfully');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && <Alert severity="error">{error}</Alert>}
      {loading && <CircularProgress />}
      {/* Component UI */}
    </div>
  );
};
```

## Type Safety

All methods are fully typed with TypeScript:

```typescript
// Request types ensure correct payload structure
const request: UpdateProjectBudgetRequest = {
  estimatedProjectCost: 5000000,  // number
  estimatedProjectFee: 500000,    // number
  reason: 'Optional reason'        // string | undefined
};

// Response types provide IntelliSense
const history: ProjectBudgetChangeHistory[] = await getBudgetHistory({
  projectId: 123
});

// TypeScript will catch errors at compile time
history.forEach(change => {
  console.log(change.fieldName);      // ✓ Valid
  console.log(change.invalidField);   // ✗ TypeScript error
});
```

## API Endpoints

The service interacts with these backend endpoints:

- `PUT /api/projects/{projectId}/budget` - Update budget
- `GET /api/projects/{projectId}/budget/history` - Get history
- `GET /api/projects/{projectId}/budget/variance-summary` - Get summary

Query parameters for history endpoint:
- `fieldName`: Filter by field (EstimatedProjectCost or EstimatedProjectFee)
- `pageNumber`: Page number for pagination
- `pageSize`: Number of records per page

## Integration with React Components

### Using with React Hooks

```typescript
import { useState, useEffect } from 'react';
import { projectBudgetApi } from '../services/projectBudgetApi';
import { ProjectBudgetChangeHistory } from '../types/projectBudget';

const useBudgetHistory = (projectId: number) => {
  const [history, setHistory] = useState<ProjectBudgetChangeHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);
      try {
        const data = await projectBudgetApi.getBudgetHistory({ projectId });
        setHistory(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [projectId]);

  return { history, loading, error };
};
```

### Using with Material-UI

```typescript
import { Button, CircularProgress, Alert } from '@mui/material';
import { projectBudgetApi } from '../services/projectBudgetApi';

const BudgetUpdateButton = ({ projectId, newBudget }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await projectBudgetApi.updateBudget(projectId, newBudget);
      // Success handling
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button 
        onClick={handleUpdate} 
        disabled={loading}
        variant="contained"
      >
        {loading ? <CircularProgress size={24} /> : 'Update Budget'}
      </Button>
      {error && <Alert severity="error">{error}</Alert>}
    </>
  );
};
```

## Testing

The API service can be tested using mock data:

```typescript
import { projectBudgetApi } from '../services/projectBudgetApi';

// Mock axios for testing
jest.mock('../services/axiosConfig', () => ({
  axiosInstance: {
    put: jest.fn(),
    get: jest.fn(),
  }
}));

describe('projectBudgetApi', () => {
  it('should update budget successfully', async () => {
    const mockResponse = {
      data: {
        success: true,
        message: 'Budget updated',
        createdHistoryRecords: []
      }
    };
    
    axiosInstance.put.mockResolvedValue(mockResponse);
    
    const result = await projectBudgetApi.updateBudget(123, {
      estimatedProjectCost: 5000000
    });
    
    expect(result.success).toBe(true);
  });
});
```

## Requirements Satisfied

This implementation satisfies the following requirements:

- **Requirement 2.1**: API endpoint to retrieve budget changes
- **Requirement 2.2**: History records ordered by date with user information
- **Requirement 4.1**: Optional reason field for budget changes

## Next Steps

To complete the frontend implementation:

1. Create React components for displaying budget history (Task 7)
2. Create budget update dialog component (Task 7.3)
3. Integrate with existing project management interface (Task 8)
4. Add comprehensive tests (Task 9.3)

## Notes

- All API calls use the configured `axiosInstance` which handles authentication tokens automatically
- Error messages are user-friendly and suitable for display in UI
- The service follows the existing patterns used in `projectApi.tsx`
- All types align with backend DTOs for consistency
- Comprehensive JSDoc comments for IDE IntelliSense support
