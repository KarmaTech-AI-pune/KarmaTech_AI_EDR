# Cash Flow Feature - Senior-Level Architecture

## 📋 Overview

A comprehensive, enterprise-grade Cash Flow Management feature built with **Material UI**, following senior-level architectural patterns including **separation of concerns**, **multi-context pattern**, and **dumb/smart component architecture**.

## 🏗️ Architecture

### Key Design Patterns

1. **Multi-Context Pattern** - Separate contexts for data, actions, and UI state
2. **Dumb/Smart Component Separation** - Pure presentational vs. container components
3. **Custom Hook Composition** - Reusable business logic
4. **Utility-First Design** - DRY principles with centralized utilities
5. **Type Safety** - Comprehensive TypeScript interfaces
6. **Material UI Integration** - Modern, accessible UI components

## 📁 Project Structure

```
cashflow/
├── components/                 # UI Components
│   ├── StatusBadge.tsx        # Dumb component for status display
│   ├── ViewToggle.tsx         # Dumb component for view tabs
│   ├── CashFlowTableCell.tsx  # Reusable table cell component
│   ├── CashFlowTableRow.tsx   # Dumb component for table rows
│   ├── CashFlowHeaderRefactored.tsx   # Smart component (header)
│   ├── CashFlowTableRefactored.tsx    # Smart component (table)
│   └── index.ts               # Barrel export
│
├── context/                    # Context API
│   ├── CashFlowContextRefactored.tsx  # Multi-context implementation
│   └── CashFlowContext.tsx    # Legacy context (kept for compatibility)
│
├── hooks/                      # Custom Hooks
│   ├── useCashFlowData.ts     # Data fetching hook
│   ├── useCashFlowFilters.ts  # Filtering logic hook
│   ├── useCashFlowCalculations.ts  # Calculation logic hook
│   └── useCashFlow.ts         # Re-export convenience hook
│
├── pages/                      # Page Components
│   ├── CashFlowPage.tsx       # Main page container
│   └── cashflow.tsx           # Legacy page (kept for compatibility)
│
├── services/                   # API Services
│   └── cashflowApi.ts         # API calls
│
├── types/                      # TypeScript Types
│   ├── cashflow.ts            # Comprehensive type definitions
│   └── index.ts               # Barrel export
│
├── utils/                      # Utility Functions
│   ├── constants.ts           # Configuration constants
│   ├── formatters.ts          # Formatting utilities
│   ├── calculations.ts        # Business logic calculations
│   └── index.ts               # Barrel export
│
└── README.md                   # This file
```

## 🎯 Features

### View Modes
- **Monthly View** - Standard monthly breakdown
- **Cumulative View** - Running totals across periods
- **Milestones View** - Milestone-based breakdown

### Data Filtering
- **Show/Hide Projections** - Toggle between completed and planned data
- **Status Filtering** - Filter by Completed/Planned status
- **Real-time Updates** - Optimistic updates with error rollback

### UI Features
- **Material UI Components** - Modern, accessible design
- **Responsive Table** - Works on all screen sizes
- **Color-Coded Values** - Red for negative, green for positive
- **Status Badges** - Visual status indicators
- **Loading States** - Skeleton screens and progress indicators
- **Error Handling** - User-friendly error messages
- **Snackbar Notifications** - Success/error feedback

## 🔧 Usage

### Basic Usage

```tsx
import { CashFlowPage } from '@/features/cashflow/pages/CashFlowPage';

// In your router
<Route path="/project/:projectId/cashflow" element={<CashFlowPage />} />
```

### Using Context Hooks

```tsx
import { useCashFlow } from '@/features/cashflow/context/CashFlowContextRefactored';

function MyComponent() {
  const { 
    data, 
    loading, 
    viewMode, 
    setViewMode,
    toggleProjections 
  } = useCashFlow();
  
  // Your component logic
}
```

### Using Individual Context Hooks

```tsx
import { 
  useCashFlowDataContext,
  useCashFlowActionsContext 
} from '@/features/cashflow/context/CashFlowContextRefactored';

function MyComponent() {
  // Only subscribe to data changes
  const { filteredRows, metrics } = useCashFlowDataContext();
  
  // Only subscribe to actions
  const { refreshData } = useCashFlowActionsContext();
}
```

### Using Utility Functions

```tsx
import { formatCurrency, calculateTotals } from '@/features/cashflow/utils';

const formatted = formatCurrency(1234567); // ₹12,34,567
const totals = calculateTotals(cashFlowRows);
```

## 🎨 Component API

### StatusBadge

```tsx
<StatusBadge status="Completed" className="my-custom-class" />
```

**Props:**
- `status: CashFlowStatus` - 'Completed' or 'Planned'
- `className?: string` - Additional CSS classes

### ViewToggle

```tsx
<ViewToggle 
  activeView={viewMode} 
  onViewChange={(mode) => setViewMode(mode)} 
/>
```

**Props:**
- `activeView: ViewMode` - Current active view
- `onViewChange: (mode: ViewMode) => void` - Callback on view change

### CashFlowTableRow

```tsx
<CashFlowTableRow 
  row={cashFlowRow} 
  index={0} 
  onRowClick={(row) => console.log(row)} 
/>
```

**Props:**
- `row: CashFlowRow` - Row data
- `index: number` - Row index
- `onRowClick?: (row: CashFlowRow) => void` - Optional click handler

## 🔌 API Integration

### Endpoints

```typescript
// Get cash flow data
GET /api/projects/{projectId}/cashflow

// Update cash flow data
PUT /api/projects/{projectId}/cashflow
```

### API Service

```tsx
import { CashFlowAPI } from '@/features/cashflow/services/cashflowApi';

// Fetch data
const data = await CashFlowAPI.getProjectCashFlow(projectId);

// Update data
await CashFlowAPI.updateProjectCashFlow(projectId, updatedData);
```

## 📊 Data Structure

### CashFlowRow

```typescript
interface CashFlowRow {
  period: string;           // e.g., "Jan-25"
  hours: number;           // Total hours
  personnel: number;       // Personnel costs
  odc: number;            // ODC costs
  totalCosts: number;     // Total costs
  revenue: number;        // Revenue
  netCashFlow: number;    // Net cash flow (revenue - costs)
  status: CashFlowStatus; // 'Completed' or 'Planned'
}
```

## 🎨 Styling & Theming

The feature uses Material UI's theming system and is fully customizable:

```tsx
// Override theme
<ThemeProvider theme={customTheme}>
  <CashFlowPage />
</ThemeProvider>
```

### Color Scheme
- **Negative Values**: `#dc2626` (red-600)
- **Positive Values**: `#16a34a` (green-600)
- **Neutral**: `#6b7280` (gray-500)
- **Total Costs**: `#ef4444` (red-500)
- **Revenue**: `#16a34a` (green-600)

## 🧪 Testing

```bash
# Run tests
npm test features/cashflow

# Run with coverage
npm test -- --coverage features/cashflow
```

## 🚀 Performance Optimizations

1. **Memoization** - useMemo for expensive calculations
2. **Callback Optimization** - useCallback for stable references
3. **Context Splitting** - Prevents unnecessary re-renders
4. **Lazy Loading** - Components loaded on demand
5. **Optimistic Updates** - Immediate UI feedback

## 📈 Future Enhancements

- [ ] Export to Excel/PDF
- [ ] Custom date range filtering
- [ ] Charts and visualizations
- [ ] Comparison mode (vs. budget)
- [ ] Real-time collaboration
- [ ] Audit trail
- [ ] Mobile app support

## 🤝 Contributing

Follow the coding standards:
1. Use TypeScript strict mode
2. Follow the dumb/smart component pattern
3. Add comprehensive types
4. Write unit tests
5. Document complex logic

## 📝 License

Internal use only - KarmaTech AI

---

**Built with ❤️ using React, TypeScript, and Material UI**
