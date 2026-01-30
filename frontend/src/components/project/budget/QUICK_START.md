# Quick Start Guide - Project Budget Components

## 5-Minute Integration

### Step 1: Import Components

```tsx
import {
  ProjectBudgetHistory,
  BudgetUpdateDialog,
} from './components/project/budget';
```

### Step 2: Add State Management

```tsx
const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
const [refreshKey, setRefreshKey] = useState(0);
```

### Step 3: Add Components to Your Page

```tsx
<Box>
  {/* Update Button */}
  <Button
    variant="contained"
    color="primary"
    onClick={() => setIsUpdateDialogOpen(true)}
  >
    Update Budget
  </Button>

  {/* Budget History Display */}
  <ProjectBudgetHistory
    key={refreshKey}
    projectId={project.projectId}
  />

  {/* Update Dialog */}
  <BudgetUpdateDialog
    open={isUpdateDialogOpen}
    project={{
      projectId: project.projectId,
      projectName: project.projectName,
      estimatedProjectCost: project.estimatedProjectCost,
      estimatedProjectFee: project.estimatedProjectFee,
      currency: project.currency || 'USD',
    }}
    onClose={() => setIsUpdateDialogOpen(false)}
    onUpdate={() => {
      setRefreshKey(prev => prev + 1);
      // Optionally reload project data
      loadProjectData();
    }}
  />
</Box>
```

### Step 4: Done! 🎉

That's it! You now have:
- ✅ Budget history timeline
- ✅ Budget update dialog
- ✅ Automatic refresh after updates
- ✅ Error handling
- ✅ Loading states
- ✅ Validation

## Common Use Cases

### 1. Display History Only (Read-Only)

```tsx
<ProjectBudgetHistory projectId={123} />
```

### 2. Update Budget Only (No History)

```tsx
const [open, setOpen] = useState(false);

<BudgetUpdateDialog
  open={open}
  project={projectData}
  onClose={() => setOpen(false)}
  onUpdate={() => {
    console.log('Budget updated!');
    setOpen(false);
  }}
/>
```

### 3. Show Variance Indicator Anywhere

```tsx
import { VarianceIndicator } from './components/project/budget';

<VarianceIndicator
  variance={50000}
  percentageVariance={10.5}
  currency="USD"
/>
```

### 4. Custom Timeline Display

```tsx
import { BudgetChangeTimeline } from './components/project/budget';

const [changes, setChanges] = useState([]);

useEffect(() => {
  projectBudgetApi.getBudgetHistory({ projectId: 123 })
    .then(setChanges);
}, []);

<BudgetChangeTimeline changes={changes} />
```

## Customization Examples

### Custom Page Size

```tsx
// Modify ProjectBudgetHistory.tsx
const pageSize = 20; // Change from default 10
```

### Custom Filter Options

```tsx
// Add more filter options in ProjectBudgetHistory.tsx
<MenuItem value="Recent">Recent Changes (Last 30 Days)</MenuItem>
<MenuItem value="Large">Large Changes Only (>10%)</MenuItem>
```

### Custom Validation Rules

```tsx
// Modify BudgetUpdateDialog.tsx validateForm()
if (costValue > 10000000) {
  errors.cost = 'Cost exceeds maximum allowed value';
}
```

### Custom Success Message

```tsx
// Modify BudgetUpdateDialog.tsx handleSubmit()
setSuccess(true);
toast.success('Budget updated successfully!'); // Using your toast library
```

## Troubleshooting

### Issue: Components not rendering

**Solution:** Check that @mui/lab is installed:
```bash
npm install @mui/lab --legacy-peer-deps
```

### Issue: API calls failing

**Solution:** Verify API endpoint configuration in `axiosConfig.tsx`:
```typescript
const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5245';
```

### Issue: Date formatting errors

**Solution:** Ensure date-fns is installed:
```bash
npm install date-fns
```

### Issue: TypeScript errors

**Solution:** Check that types are imported correctly:
```typescript
import { ProjectBudgetChangeHistory } from '../../types/projectBudget';
```

## Testing Your Integration

### Manual Testing Checklist

- [ ] Budget history displays correctly
- [ ] Filter dropdown works
- [ ] Pagination works
- [ ] Update dialog opens
- [ ] Form validation works
- [ ] Budget update succeeds
- [ ] History refreshes after update
- [ ] Error messages display correctly
- [ ] Loading states show properly
- [ ] Mobile responsive

### Quick Test Script

```typescript
// Test API connection
import { projectBudgetApi } from './services/projectBudgetApi';

// Get history
projectBudgetApi.getBudgetHistory({ projectId: 1 })
  .then(data => console.log('History:', data))
  .catch(err => console.error('Error:', err));

// Update budget
projectBudgetApi.updateBudget(1, {
  estimatedProjectCost: 5500000,
  reason: 'Test update'
})
  .then(result => console.log('Update result:', result))
  .catch(err => console.error('Error:', err));
```

## Performance Tips

### 1. Memoize Project Data

```tsx
const projectData = useMemo(() => ({
  projectId: project.projectId,
  projectName: project.projectName,
  estimatedProjectCost: project.estimatedProjectCost,
  estimatedProjectFee: project.estimatedProjectFee,
  currency: project.currency,
}), [project]);
```

### 2. Debounce Filter Changes

```tsx
import { debounce } from 'lodash';

const debouncedFilter = useMemo(
  () => debounce((value) => setFieldFilter(value), 300),
  []
);
```

### 3. Lazy Load History

```tsx
const [showHistory, setShowHistory] = useState(false);

<Button onClick={() => setShowHistory(true)}>
  Show Budget History
</Button>

{showHistory && <ProjectBudgetHistory projectId={projectId} />}
```

## Advanced Usage

### Custom Hook for Budget Management

```tsx
const useBudgetManagement = (projectId: number) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await projectBudgetApi.getBudgetHistory({ projectId });
      setHistory(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateBudget = async (request) => {
    await projectBudgetApi.updateBudget(projectId, request);
    await loadHistory();
  };

  useEffect(() => {
    loadHistory();
  }, [projectId]);

  return { history, loading, error, updateBudget, refresh: loadHistory };
};

// Usage
const { history, loading, updateBudget } = useBudgetManagement(123);
```

### Context Provider for Budget State

```tsx
const BudgetContext = createContext();

export const BudgetProvider = ({ children, projectId }) => {
  const budgetState = useBudgetManagement(projectId);
  return (
    <BudgetContext.Provider value={budgetState}>
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudget = () => useContext(BudgetContext);
```

## Next Steps

1. **Add to Navigation**: Add budget history link to project menu
2. **Add Permissions**: Check user permissions before showing update button
3. **Add Notifications**: Send email when budget changes
4. **Add Analytics**: Track budget change patterns
5. **Add Export**: Export history to Excel/PDF

## Support

For issues or questions:
1. Check the main README.md
2. Review COMPONENT_FLOW.md for data flow
3. Check IMPLEMENTATION_SUMMARY.md for details
4. Review the component source code comments

## Resources

- [Material-UI Documentation](https://mui.com/)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [date-fns Documentation](https://date-fns.org/)
