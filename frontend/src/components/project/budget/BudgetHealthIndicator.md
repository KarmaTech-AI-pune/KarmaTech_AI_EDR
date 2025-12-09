# BudgetHealthIndicator Component

## Overview

The `BudgetHealthIndicator` component displays project budget health status with color-coded visual indicators. It provides an at-a-glance view of budget utilization with clear visual feedback.

## Features

- **Color Coding**: 
  - 🟢 Green (Healthy) - Utilization < 90%
  - 🟡 Yellow (Warning) - Utilization 90-100%
  - 🔴 Red (Critical) - Utilization > 100%
- **Utilization Display**: Shows percentage with 1 decimal precision
- **Material-UI Chip**: Uses standard MUI Chip component
- **Icons**: Optional status icons (CheckCircle, Warning, Error)
- **Tooltips**: Optional hover tooltips with detailed information
- **Responsive Sizing**: Small and medium size options

## Requirements

Implements requirements: 2.1, 2.2, 2.3, 2.4

## Usage

### Basic Usage

```tsx
import { BudgetHealthIndicator } from './components/project/budget';

function ProjectCard({ project }) {
  return (
    <div>
      <h3>{project.name}</h3>
      <BudgetHealthIndicator
        status="Healthy"
        utilizationPercentage={75.5}
      />
    </div>
  );
}
```

### With API Data

```tsx
import { useEffect, useState } from 'react';
import { getBudgetHealth } from './api/budgetHealthApi';
import { BudgetHealthIndicator } from './components/project/budget';

function ProjectBudgetStatus({ projectId }) {
  const [budgetHealth, setBudgetHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBudgetHealth = async () => {
      try {
        const data = await getBudgetHealth(projectId);
        setBudgetHealth(data);
      } catch (error) {
        console.error('Failed to fetch budget health:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBudgetHealth();
  }, [projectId]);

  if (loading) return <CircularProgress size={20} />;
  if (!budgetHealth) return null;

  return (
    <BudgetHealthIndicator
      status={budgetHealth.status}
      utilizationPercentage={budgetHealth.utilizationPercentage}
    />
  );
}
```

### Compact Version

```tsx
import { CompactBudgetHealthIndicator } from './components/project/budget';

function ProjectTableRow({ project, budgetHealth }) {
  return (
    <TableRow>
      <TableCell>{project.name}</TableCell>
      <TableCell>
        <CompactBudgetHealthIndicator
          status={budgetHealth.status}
          utilizationPercentage={budgetHealth.utilizationPercentage}
        />
      </TableCell>
    </TableRow>
  );
}
```

### Without Icon

```tsx
<BudgetHealthIndicator
  status="Warning"
  utilizationPercentage={95.0}
  showIcon={false}
/>
```

### Without Tooltip

```tsx
<BudgetHealthIndicator
  status="Critical"
  utilizationPercentage={105.2}
  showTooltip={false}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `status` | `'Healthy' \| 'Warning' \| 'Critical'` | Required | Budget health status |
| `utilizationPercentage` | `number` | Required | Budget utilization percentage (0-100+) |
| `size` | `'small' \| 'medium'` | `'medium'` | Size of the chip |
| `showIcon` | `boolean` | `true` | Whether to show status icon |
| `showTooltip` | `boolean` | `true` | Whether to show hover tooltip |

## Status Colors

| Status | Color | MUI Color | Condition |
|--------|-------|-----------|-----------|
| Healthy | Green | `success` | Utilization < 90% |
| Warning | Yellow | `warning` | Utilization 90-100% |
| Critical | Red | `error` | Utilization > 100% |

## Examples

### Healthy Budget (< 90%)
```tsx
<BudgetHealthIndicator
  status="Healthy"
  utilizationPercentage={75.5}
/>
```
Displays: 🟢 Healthy (75.5%)

### Warning Budget (90-100%)
```tsx
<BudgetHealthIndicator
  status="Warning"
  utilizationPercentage={95.0}
/>
```
Displays: 🟡 Warning (95.0%)

### Critical Budget (> 100%)
```tsx
<BudgetHealthIndicator
  status="Critical"
  utilizationPercentage={105.2}
/>
```
Displays: 🔴 Critical (105.2%)

## Testing

The component includes comprehensive unit tests covering:
- All three status types (Healthy, Warning, Critical)
- Percentage formatting
- Icon display/hide
- Compact version
- Color coding

Run tests:
```bash
npm test -- BudgetHealthIndicator.test.tsx --run
```

## Integration

The component integrates with:
- **API**: `budgetHealthApi.ts` - `getBudgetHealth(projectId)`
- **Types**: `types/budgetHealth.ts` - `BudgetHealth`, `BudgetHealthStatus`
- **Backend**: `GET /api/projects/{id}/budget/health`

## Accessibility

- Uses semantic HTML with ARIA labels
- Color is not the only indicator (text + icons)
- Keyboard navigable
- Screen reader friendly tooltips

## Browser Support

Works in all modern browsers that support:
- Material-UI v5+
- React 18+
- ES6+
