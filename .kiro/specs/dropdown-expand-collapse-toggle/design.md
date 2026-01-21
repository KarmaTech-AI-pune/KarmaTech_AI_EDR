# Design Document

## Overview

This design implements an "Expand All/Collapse All" toggle button for the General Settings page in the Admin Panel. The solution leverages the existing expansion state management system and enhances it with a centralized toggle control that works independently for Manpower and ODC tabs.

## Architecture

The design follows the existing React component architecture with hooks for state management:

```
GeneralSettings (Page)
├── WbsOptions (Container) - Enhanced with toggle button
│   ├── ExpandCollapseToggle (New Component)
│   ├── WBSHierarchyTable (Existing)
│   └── useExpansionState (Enhanced Hook)
└── Tabs (Manpower/ODC)
```

## Components and Interfaces

### 1. ExpandCollapseToggle Component

**Location:** `frontend/src/features/generalSettings/components/ExpandCollapseToggle.tsx`

```typescript
interface ExpandCollapseToggleProps {
  hasExpandedItems: boolean;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

const ExpandCollapseToggle: React.FC<ExpandCollapseToggleProps> = ({
  hasExpandedItems,
  onExpandAll,
  onCollapseAll,
  isLoading = false,
  disabled = false
}) => {
  // Component implementation
};
```

**Features:**
- Material-UI Button with dynamic text and icon
- Accessible with ARIA labels and keyboard support
- Loading state with CircularProgress
- Consistent styling with existing UI theme

### 2. Enhanced useExpansionState Hook

**Location:** `frontend/src/features/wbs/hooks/useExpansionState.ts`

```typescript
interface UseExpansionStateReturn {
  expandedLevel1: Set<string>;
  expandedLevel2: Set<string>;
  toggleLevel1: (id: string) => void;
  toggleLevel2: (id: string) => void;
  expandAll: (level1Items: IWBSLevel1[]) => void; // Enhanced
  collapseAll: () => void;
  hasExpandedItems: boolean; // New
}
```

**Enhancements:**
- `expandAll` now accepts level1Items to expand all available items
- `hasExpandedItems` computed property for toggle button state
- Improved performance with useCallback optimizations

### 3. Enhanced WbsOptions Component

**Location:** `frontend/src/features/wbs/components/WbsOptions.tsx`

```typescript
// Add toggle button above WBSHierarchyTable
const WbsOptions: React.FC<WbsOptionsProps> = ({ formType = 0 }) => {
  const {
    expandedLevel1,
    expandedLevel2,
    toggleLevel1,
    toggleLevel2,
    expandAll,
    collapseAll,
    hasExpandedItems
  } = useExpansionState();

  const handleExpandAll = useCallback(() => {
    expandAll(wbsData.level1);
  }, [expandAll, wbsData.level1]);

  // Component renders ExpandCollapseToggle above table
};
```

## Data Models

### Expansion State Model

```typescript
interface ExpansionState {
  expandedLevel1: Set<string>;
  expandedLevel2: Set<string>;
}

interface WBSLevel1 {
  id: string;
  label: string;
  children?: WBSLevel2[];
}

interface WBSLevel2 {
  id: string;
  label: string;
  parentId: string;
  children?: WBSLevel3[];
}
```

### Toggle Button State

```typescript
interface ToggleButtonState {
  isExpanded: boolean;
  isLoading: boolean;
  disabled: boolean;
  text: 'Expand All' | 'Collapse All';
  icon: 'expand_more' | 'expand_less';
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

<function_calls>
<invoke name="prework">
<parameter name="featureName">dropdown-expand-collapse-toggle

### Property Reflection

After reviewing all testable properties from the prework analysis, I identified several areas where properties can be consolidated:

**Consolidation Opportunities:**
- Properties 1.2 and 1.3 can be combined into a single comprehensive button state property
- Properties 2.1 and 2.2 are covered by the consolidated button state property
- Properties 3.2 and 3.3 can be combined into a single tab switching property
- Properties 4.1 and 4.2 can be combined into a single performance property
- Properties 6.1 and 6.2 can be combined into a single error resilience property

**Final Properties (After Consolidation):**

Property 1: Toggle Button State Consistency
*For any* expansion state (no items expanded, some items expanded, all items expanded), the toggle button should display the correct text and icon ("Expand All" with expand icon when no items expanded, "Collapse All" with collapse icon when any items expanded)
**Validates: Requirements 1.2, 1.3, 2.1, 2.2**

Property 2: Expand All Functionality
*For any* WBS hierarchy with available items, clicking "Expand All" should result in all Level 1 and Level 2 items being expanded
**Validates: Requirements 1.4**

Property 3: Collapse All Functionality
*For any* WBS hierarchy with expanded items, clicking "Collapse All" should result in all Level 1 and Level 2 items being collapsed
**Validates: Requirements 1.5**

Property 4: Tab State Isolation
*For any* combination of expansion states between Manpower and ODC tabs, switching tabs should preserve each tab's independent expansion state and the toggle button should reflect the active tab's state
**Validates: Requirements 2.3, 3.1, 3.2, 3.3, 3.4**

Property 5: Immediate State Updates
*For any* manual expansion or collapse action on individual items, the toggle button state should update immediately to reflect the new overall expansion state
**Validates: Requirements 2.4**

Property 6: Performance Requirements
*For any* bulk expand or collapse operation, the action should complete within 500ms
**Validates: Requirements 4.1, 4.2**

Property 7: Operation State Management
*For any* bulk operation in progress, the toggle button should be disabled and show loading feedback until the operation completes
**Validates: Requirements 4.3, 4.4**

Property 8: Error Resilience
*For any* bulk operation where individual items fail to expand or collapse, the operation should continue with remaining items and handle errors gracefully
**Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5**

## Error Handling

### Expansion Failures
- Individual item expansion failures don't stop bulk operations
- Failed expansions are logged with item ID and error details
- Toggle button state reflects actual expansion state, not intended state

### State Recovery
- If bulk operation fails, button returns to previous state
- Expansion state remains consistent with actual DOM state
- Error boundaries prevent component crashes

### Performance Degradation
- Operations exceeding 500ms are logged as performance issues
- Large datasets trigger progressive expansion with user feedback
- Memory usage is monitored during bulk operations

## Testing Strategy

### Unit Tests
- Component rendering with different props
- Button click handlers and state changes
- Hook state management and callbacks
- Error boundary behavior

### Property-Based Tests
- Toggle button state consistency across all expansion combinations
- Tab isolation with random expansion states
- Performance testing with varying dataset sizes
- Error resilience with simulated failures

### Integration Tests
- Full user workflow from General Settings page
- Tab switching with preserved states
- Accessibility compliance testing
- Cross-browser compatibility

### Performance Tests
- Bulk operations with large WBS hierarchies
- Memory usage during expansion/collapse cycles
- Rendering performance with many items

**Testing Framework:** Jest with React Testing Library for unit tests, fast-check for property-based testing, Playwright for integration tests.

**Coverage Target:** 100% code coverage with comprehensive property validation.