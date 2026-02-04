# Project Budget Components - Flow Diagram

## Component Hierarchy

```
ProjectDetailsPage (Parent)
│
├── Button: "Update Budget"
│   └── onClick → Opens BudgetUpdateDialog
│
├── ProjectBudgetHistory (Main Component)
│   ├── Filter Controls (Select)
│   │   └── onChange → Filters history by field type
│   │
│   ├── BudgetChangeTimeline
│   │   └── Timeline Items (for each change)
│   │       ├── TimelineDot (with icon)
│   │       │   ├── AttachMoneyIcon (for cost)
│   │       │   └── AccountBalanceWalletIcon (for fee)
│   │       │
│   │       └── TimelineContent (Paper)
│   │           ├── Field Name Chip
│   │           ├── Value Change Display
│   │           ├── VarianceIndicator
│   │           │   ├── Trend Icon
│   │           │   └── Variance Chip
│   │           └── Reason (if provided)
│   │
│   └── Pagination
│       └── onChange → Loads next/previous page
│
└── BudgetUpdateDialog (Modal)
    ├── TextField: Estimated Project Cost
    ├── TextField: Estimated Project Fee
    ├── TextField: Reason (optional)
    └── Button: "Update Budget"
        └── onClick → Calls API → Refreshes History
```

## Data Flow

### 1. Viewing Budget History

```
User navigates to Project Details
    ↓
ProjectBudgetHistory component mounts
    ↓
useEffect triggers loadHistory()
    ↓
projectBudgetApi.getBudgetHistory() called
    ↓
API returns budget change history
    ↓
State updated with history data
    ↓
BudgetChangeTimeline renders timeline
    ↓
Each timeline item shows:
    - Date and user info
    - Field name (Cost or Fee)
    - Old value → New value
    - VarianceIndicator (with color coding)
    - Reason (if provided)
```

### 2. Filtering History

```
User selects filter (All / Cost Only / Fee Only)
    ↓
handleFieldFilterChange() triggered
    ↓
fieldFilter state updated
    ↓
currentPage reset to 1
    ↓
useEffect detects filter change
    ↓
loadHistory() called with new filter
    ↓
API returns filtered results
    ↓
Timeline re-renders with filtered data
```

### 3. Pagination

```
User clicks page number
    ↓
handlePageChange() triggered
    ↓
currentPage state updated
    ↓
useEffect detects page change
    ↓
loadHistory() called with new page number
    ↓
API returns data for that page
    ↓
Timeline re-renders with new page data
```

### 4. Updating Budget

```
User clicks "Update Budget" button
    ↓
BudgetUpdateDialog opens (open=true)
    ↓
Form initialized with current values
    ↓
User modifies cost and/or fee
    ↓
User optionally enters reason
    ↓
User clicks "Update Budget"
    ↓
validateForm() checks:
    - Required fields filled
    - Valid numbers
    - At least one value changed
    - Reason within 500 chars
    ↓
If valid:
    handleSubmit() called
    ↓
    projectBudgetApi.updateBudget() called
    ↓
    API creates history record(s)
    ↓
    Success message shown
    ↓
    onUpdate() callback triggered
    ↓
    Dialog closes
    ↓
    ProjectBudgetHistory refreshes
    ↓
    New change appears in timeline
```

## State Management

### ProjectBudgetHistory State
```typescript
{
  history: ProjectBudgetChangeHistory[],  // Array of change records
  loading: boolean,                        // Loading indicator
  error: string | null,                    // Error message
  fieldFilter: 'All' | 'EstimatedProjectCost' | 'EstimatedProjectFee',
  currentPage: number,                     // Current page number
  totalPages: number                       // Total pages available
}
```

### BudgetUpdateDialog State
```typescript
{
  estimatedProjectCost: string,    // Form input value
  estimatedProjectFee: string,     // Form input value
  reason: string,                  // Optional reason
  loading: boolean,                // Submission in progress
  error: string | null,            // Error message
  success: boolean,                // Success indicator
  validationErrors: {              // Field-specific errors
    cost?: string,
    fee?: string,
    reason?: string
  }
}
```

## API Calls

### Get Budget History
```typescript
// Request
GET /api/projects/{projectId}/budget/history?fieldName=EstimatedProjectCost&pageNumber=1&pageSize=10

// Response
{
  success: true,
  data: [
    {
      id: 1,
      projectId: 123,
      fieldName: "EstimatedProjectCost",
      oldValue: 5000000,
      newValue: 5500000,
      variance: 500000,
      percentageVariance: 10.0,
      currency: "USD",
      changedBy: "user-id",
      changedByUser: {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com"
      },
      changedDate: "2024-11-13T10:30:00Z",
      reason: "Scope expansion approved"
    }
  ]
}
```

### Update Budget
```typescript
// Request
PUT /api/projects/{projectId}/budget
{
  estimatedProjectCost: 5500000,
  estimatedProjectFee: 550000,
  reason: "Scope expansion approved by client"
}

// Response
{
  success: true,
  message: "Budget updated successfully",
  createdHistoryRecords: [
    {
      id: 2,
      projectId: 123,
      fieldName: "EstimatedProjectCost",
      oldValue: 5000000,
      newValue: 5500000,
      variance: 500000,
      percentageVariance: 10.0,
      // ... other fields
    },
    {
      id: 3,
      projectId: 123,
      fieldName: "EstimatedProjectFee",
      oldValue: 500000,
      newValue: 550000,
      variance: 50000,
      percentageVariance: 10.0,
      // ... other fields
    }
  ]
}
```

## Error Handling

### Network Errors
```
API call fails
    ↓
catch block in component
    ↓
Error state updated
    ↓
Alert component displays error message
    ↓
User can retry operation
```

### Validation Errors
```
User submits invalid data
    ↓
validateForm() returns false
    ↓
validationErrors state updated
    ↓
TextField shows error state
    ↓
Helper text displays error message
    ↓
User corrects input
    ↓
Error clears on change
```

### Empty State
```
No history records found
    ↓
history.length === 0
    ↓
Info Alert displayed
    ↓
"No budget changes found for this project"
```

## User Experience Flow

### Happy Path
1. User views project details
2. Sees budget history timeline
3. Clicks "Update Budget"
4. Enters new values and reason
5. Clicks "Update Budget" button
6. Sees success message
7. Dialog closes automatically
8. Timeline refreshes with new change
9. New change appears at top of timeline

### Error Path
1. User clicks "Update Budget"
2. Enters invalid data (e.g., negative value)
3. Clicks "Update Budget" button
4. Validation error shown
5. User corrects input
6. Clicks "Update Budget" button again
7. API call fails (network error)
8. Error message shown
9. User clicks "Update Budget" button again
10. Success!

## Performance Considerations

### Optimizations
- Pagination limits data loaded at once
- Filtering happens server-side
- Components only re-render when necessary
- useEffect dependencies properly configured

### Loading States
- CircularProgress shown during API calls
- Buttons disabled during submission
- Form fields disabled during submission
- Prevents duplicate submissions

## Accessibility Features

### Keyboard Navigation
- Tab through form fields
- Enter to submit form
- Escape to close dialog
- Arrow keys in select dropdown

### Screen Readers
- Proper ARIA labels
- Semantic HTML elements
- Error messages announced
- Success messages announced

### Visual Indicators
- Color coding with icons (not color alone)
- High contrast text
- Clear focus indicators
- Sufficient touch targets

## Mobile Responsiveness

### Breakpoints
- Timeline alternates on desktop
- Timeline stacks on mobile
- Dialog full-width on mobile
- Pagination adapts to screen size

### Touch Targets
- Buttons minimum 44x44px
- Form fields easy to tap
- Pagination controls large enough
- Select dropdowns touch-friendly
