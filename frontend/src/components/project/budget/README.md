# Project Budget Change Tracking Components

This directory contains React components for displaying and managing project budget change history.

## Components

### 1. ProjectBudgetHistory

Main component that displays the complete budget change history for a project.

**Features:**
- Displays budget change history in a timeline format
- Filtering options for field type (cost vs fee)
- Pagination for large datasets
- Loading states and error handling

**Usage:**
```tsx
import { ProjectBudgetHistory } from './components/project/ProjectBudgetHistory';

<ProjectBudgetHistory projectId={123} />
```

**Props:**
- `projectId` (number, required): The ID of the project to display history for

**Requirements:** 2.1, 2.2, 3.5

---

### 2. BudgetChangeTimeline

Visual timeline component that displays budget changes in chronological order.

**Features:**
- Material-UI Timeline component for visual history
- Different visual indicators for cost vs fee changes
- Variance display with color coding for increases/decreases
- Shows change reasons when provided

**Usage:**
```tsx
import { BudgetChangeTimeline } from './components/project/BudgetChangeTimeline';

<BudgetChangeTimeline changes={budgetChangeHistory} />
```

**Props:**
- `changes` (ProjectBudgetChangeHistory[], required): Array of budget change history records

**Requirements:** 3.1, 3.2, 3.3, 3.4

---

### 3. BudgetUpdateDialog

Modal dialog for updating project budget fields.

**Features:**
- Form fields for EstimatedProjectCost and EstimatedProjectFee
- Optional reason field with character limit validation (500 chars)
- Proper form validation and error display
- Real-time validation feedback

**Usage:**
```tsx
import { BudgetUpdateDialog } from './components/project/BudgetUpdateDialog';

<BudgetUpdateDialog
  open={isDialogOpen}
  project={projectData}
  onClose={() => setIsDialogOpen(false)}
  onUpdate={() => {
    // Refresh data after update
    loadProjectData();
  }}
/>
```

**Props:**
- `open` (boolean, required): Controls dialog visibility
- `project` (Project, required): Project object with current budget values
- `onClose` (function, required): Callback when dialog is closed
- `onUpdate` (function, required): Callback after successful budget update

**Project Interface:**
```typescript
interface Project {
  projectId: number;
  projectName: string;
  estimatedProjectCost: number;
  estimatedProjectFee: number;
  currency?: string;
}
```

**Requirements:** 4.1, 4.2, 4.3, 4.4, 4.5

---

### 4. VarianceIndicator

Component to display budget variance with visual indicators.

**Features:**
- Color coding for positive/negative changes
- Percentage and absolute variance display
- Currency formatting support
- Multiple size variants

**Usage:**
```tsx
import { VarianceIndicator } from './components/project/VarianceIndicator';

<VarianceIndicator
  variance={5000}
  percentageVariance={10.5}
  currency="USD"
  size="medium"
/>
```

**Props:**
- `variance` (number, required): Absolute variance amount
- `percentageVariance` (number, required): Percentage variance
- `currency` (string, optional): Currency code (default: 'USD')
- `size` ('small' | 'medium' | 'large', optional): Display size (default: 'medium')
- `showIcon` (boolean, optional): Show trend icon (default: true)

**Variants:**
- `VarianceIndicator`: Standard component with all features
- `CompactVarianceIndicator`: Small size without icon
- `LargeVarianceIndicator`: Large size with icon

**Requirements:** 2.5, 3.3

---

## Integration Example

Here's a complete example of integrating these components into a project details page:

```tsx
import React, { useState } from 'react';
import { Box, Button } from '@mui/material';
import { ProjectBudgetHistory } from './components/project/ProjectBudgetHistory';
import { BudgetUpdateDialog } from './components/project/BudgetUpdateDialog';

const ProjectDetailsPage: React.FC = () => {
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const project = {
    projectId: 123,
    projectName: 'Airport Terminal Construction',
    estimatedProjectCost: 5000000,
    estimatedProjectFee: 500000,
    currency: 'USD',
  };

  const handleBudgetUpdate = () => {
    // Refresh the history display
    setRefreshKey(prev => prev + 1);
  };

  return (
    <Box>
      <Button
        variant="contained"
        onClick={() => setIsUpdateDialogOpen(true)}
      >
        Update Budget
      </Button>

      <ProjectBudgetHistory key={refreshKey} projectId={project.projectId} />

      <BudgetUpdateDialog
        open={isUpdateDialogOpen}
        project={project}
        onClose={() => setIsUpdateDialogOpen(false)}
        onUpdate={handleBudgetUpdate}
      />
    </Box>
  );
};
```

## API Integration

These components use the `projectBudgetApi` service for all backend communication:

```typescript
import { projectBudgetApi } from '../../services/projectBudgetApi';

// Update budget
await projectBudgetApi.updateBudget(projectId, {
  estimatedProjectCost: 5500000,
  estimatedProjectFee: 550000,
  reason: 'Scope expansion approved by client',
});

// Get budget history
const history = await projectBudgetApi.getBudgetHistory({
  projectId: 123,
  fieldName: 'EstimatedProjectCost', // Optional filter
  pageNumber: 1,
  pageSize: 10,
});
```

## Type Definitions

All TypeScript types are defined in `frontend/src/types/projectBudget.ts`:

- `ProjectBudgetChangeHistory`: Budget change history record
- `UpdateProjectBudgetRequest`: Request payload for budget updates
- `ProjectBudgetUpdateResult`: Response from budget update operation
- `GetBudgetHistoryParams`: Query parameters for fetching history
- `BudgetVarianceSummary`: Aggregated variance statistics

## Styling

All components use Material-UI (MUI) components and follow the project's theme configuration. They are fully responsive and support dark mode if configured.

## Testing

To test these components:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Dependencies

- `@mui/material`: Material-UI components
- `@mui/lab`: Timeline component
- `@mui/icons-material`: Material icons
- `date-fns`: Date formatting
- `axios`: HTTP client (via projectBudgetApi)

## Browser Support

These components support all modern browsers:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Accessibility

All components follow WCAG 2.1 AA accessibility standards:
- Proper ARIA labels
- Keyboard navigation support
- Screen reader compatibility
- Color contrast compliance

## Performance

- Components use React.memo for optimization where appropriate
- Pagination prevents loading large datasets at once
- Debounced filtering for better UX
- Lazy loading of user details

## Future Enhancements

Potential improvements for future iterations:
- Export budget history to Excel/PDF
- Advanced filtering (date range, user, variance threshold)
- Budget change notifications
- Comparison view for multiple projects
- Budget forecasting based on historical trends
