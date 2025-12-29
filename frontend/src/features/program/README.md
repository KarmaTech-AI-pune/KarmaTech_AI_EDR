# Program Feature - Senior-Level Architecture

## 📋 Overview

This feature has been refactored to follow **senior-level best practices** with a clean separation between **smart containers** (business logic) and **dumb components** (pure UI). This architecture promotes:

- ✅ **Zero logic in UI components** - All components are pure presentation
- ✅ **Single Responsibility** - Each file has one clear purpose
- ✅ **No code duplication** - Shared logic extracted to utilities
- ✅ **Easy testing** - Dumb components are trivial to test
- ✅ **Better maintainability** - Changes happen in one place
- ✅ **Reusability** - Components can be composed differently

## 🏗️ Architecture Pattern

### Smart/Dumb Component Separation

```
┌─────────────────────────────────────────────┐
│         ProgramContainer (SMART)            │
│  - All state management                     │
│  - All business logic                       │
│  - All API calls                            │
│  - All event handlers                       │
│  - Orchestrates dumb components             │
└─────────────────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
   ┌────────┐  ┌────────┐  ┌────────┐
   │ Card   │  │ Form   │  │ Search │  (DUMB)
   │ (UI)   │  │ (UI)   │  │ (UI)   │
   └────────┘  └────────┘  └────────┘
```

## 📁 File Structure

```
program/
├── components/
│   ├── ProgramContainer.tsx      ⭐ SMART - All logic here
│   ├── ProgramCard.tsx            🎨 DUMB - UI only
│   ├── ProgramListView.tsx        🎨 DUMB - UI only
│   ├── ProgramFormDialog.tsx      🎨 DUMB - Controlled form
│   ├── ProgramDeleteDialog.tsx    🎨 DUMB - UI only
│   ├── ProgramSearchBar.tsx       🎨 DUMB - UI only
│   ├── ProgramEmptyState.tsx      🎨 DUMB - UI only
│   └── index.ts                   📦 Exports
├── hooks/
│   └── usePrograms.ts             🎣 Custom hook for API calls
├── services/
│   └── programService.ts          🔌 API service layer
├── types/
│   └── types.ts                   📝 TypeScript interfaces
├── utils/
│   └── programUtils.ts            🛠️ Shared utility functions
├── validation/
│   └── programValidation.ts       ✅ Form validation logic
└── pages/
    └── ProgramPage.tsx            📄 Page wrapper
```

## 🎯 Key Components

### 1. ProgramContainer (Smart Component)

**Location:** `components/ProgramContainer.tsx`

**Responsibilities:**
- Manages all state (forms, dialogs, loading, errors)
- Handles all business logic (CRUD operations)
- Orchestrates dumb components
- Computes derived values (filtered programs, status)
- Handles all event callbacks

**Usage:**
```tsx
import { ProgramContainer } from '@/features/program/components';

// In your page/route
<ProgramContainer />
```

### 2. Dumb Components

All dumb components are **pure presentation** - they:
- Accept props only (no state, no logic)
- Render UI based on props
- Call callbacks provided via props
- Are easily testable and reusable

#### ProgramCard
Displays a single program card with formatted data.

```tsx
<ProgramCard
  program={program}
  statusLabel="Active"
  statusColor="primary"
  formattedStartDate="Jan 1, 2024"
  formattedEndDate="Dec 31, 2024"
  onEdit={() => {}}
  onDelete={() => {}}
/>
```

#### ProgramFormDialog
Controlled form dialog - all state managed by parent.

```tsx
<ProgramFormDialog
  open={true}
  title="Create Program"
  formData={formData}
  validationErrors={errors}
  onFieldChange={(field, value) => {}}
  onSubmit={() => {}}
  onClose={() => {}}
/>
```

#### ProgramSearchBar
Simple controlled input.

```tsx
<ProgramSearchBar
  value={searchTerm}
  onChange={setSearchTerm}
/>
```

### 3. Utilities (`utils/programUtils.ts`)

Shared utility functions used across components:

```typescript
// Date formatting
formatDate('2024-01-01T00:00:00Z') // "Jan 1, 2024"

// Status calculation
getProgramStatus(startDate, endDate) // 'active' | 'completed' | 'not-started'

// Search/Filter
filterPrograms(programs, 'search term')

// Date conversion
toDateInputFormat('2024-01-01T00:00:00Z') // "2024-01-01"
```

### 4. Validation (`validation/programValidation.ts`)

Form validation logic extracted to its own module:

```typescript
const errors = validateProgramForm({
  name: 'Program Name',
  description: 'Description',
  startDate: '2024-01-01',
  endDate: '2024-12-31'
});
// Returns null if valid, or object with error messages
```

### 5. Hook (`hooks/usePrograms.ts`)

Custom hook for data fetching and mutations:

```typescript
const {
  programs,
  loading,
  error,
  createProgram,
  updateProgram,
  deleteProgram
} = usePrograms();
```

## 🔄 Data Flow

```
User Action
    ↓
Container (Event Handler)
    ↓
Validation (if needed)
    ↓
Hook/Service (API Call)
    ↓
State Update
    ↓
Dumb Components Re-render
```

## ✨ Benefits of This Architecture

### 1. **Testability**
```tsx
// Easy to test - just pass props!
test('ProgramCard renders correctly', () => {
  render(<ProgramCard program={mockProgram} statusLabel="Active" ... />);
  expect(screen.getByText('Active')).toBeInTheDocument();
});
```

### 2. **Reusability**
Dumb components can be used in different contexts:
```tsx
// In a dashboard
<ProgramCard program={program} canEdit={false} />

// In management page
<ProgramCard program={program} canEdit={true} canDelete={true} />
```

### 3. **Maintainability**
All logic lives in one place - the container:
- Need to change validation? → `validation/programValidation.ts`
- Need to change date format? → `utils/programUtils.ts`
- Need to change business logic? → `ProgramContainer.tsx`

### 4. **Performance**
Dumb components can be memoized easily:
```tsx
export const ProgramCard = React.memo<ProgramCardProps>(({ ... }) => {
  // Component code
});
```

## 📚 Usage Examples

### Basic Usage
```tsx
import { ProgramContainer } from '@/features/program/components';

function ProgramPage() {
  return <ProgramContainer />;
}
```

### Custom Container (if needed)
```tsx
import {
  ProgramListView,
  ProgramCard,
  ProgramSearchBar
} from '@/features/program/components';
import { usePrograms } from '@/features/program/hooks/usePrograms';
import { formatDate, getProgramStatus } from '@/features/program/utils/programUtils';

function CustomProgramView() {
  const { programs } = usePrograms();
  const [search, setSearch] = useState('');

  return (
    <div>
      <ProgramSearchBar value={search} onChange={setSearch} />
      <ProgramListView
        programs={programs}
        renderProgram={(program) => (
          <ProgramCard
            program={program}
            statusLabel={getProgramStatus(program.startDate, program.endDate)}
            formattedStartDate={formatDate(program.startDate)}
            formattedEndDate={formatDate(program.endDate)}
          />
        )}
      />
    </div>
  );
}
```

## 🚀 Migration from Old Code

### Old Way (Mixed Concerns)
```tsx
// ProgramManagement.tsx - 200+ lines with mixed logic and UI
const ProgramManagement = () => {
  const [programs, setPrograms] = useState([]);
  const fetchPrograms = async () => { /* ... */ };
  const handleCreate = async () => { /* ... */ };
  // ... lots of logic ...
  return <div>{/* complex JSX */}</div>;
};
```

### New Way (Clean Separation)
```tsx
// ProgramContainer.tsx - Smart container with all logic
const ProgramContainer = () => {
  const { programs } = usePrograms();
  const [search, setSearch] = useState('');
  
  return (
    <ProgramListView
      programs={filterPrograms(programs, search)}
      renderProgram={(p) => <ProgramCard program={p} ... />}
    />
  );
};
```

## 🎓 Best Practices

1. **Keep components dumb** - No `useState`, no logic, no calculations
2. **Extract utilities** - Any shared logic goes to `utils/`
3. **Validation separate** - Keep validation rules in `validation/`
4. **Use TypeScript** - Strong typing prevents bugs
5. **Memoize callbacks** - Use `useCallback` in container
6. **Single responsibility** - Each file does one thing well

## 🔧 Extending the Feature

### Adding a New Field
1. Update `types/types.ts` - Add to `Program` interface
2. Update `validation/programValidation.ts` - Add validation rules
3. Update `ProgramFormDialog.tsx` - Add form field (UI only)
4. Update `ProgramCard.tsx` - Display new field (if needed)

### Adding New Functionality
1. Add logic to `ProgramContainer.tsx`
2. Create new dumb component if needed
3. Add utilities to `utils/` if reusable
4. Pass props to dumb components

## 📝 Legacy Code

The following files are kept for backward compatibility but should not be used:
- `ProgramManagement.tsx` ❌ (Use `ProgramContainer` instead)
- `ProgramForm.tsx` ❌ (Use `ProgramFormDialog` instead)
- `ProgramList.tsx` ❌ (Use `ProgramListView` + `ProgramCard` instead)
- `ProgramItem.tsx` ❌ (Use `ProgramCard` instead)

**TODO:** Remove legacy components after full migration.

## 🤝 Contributing

When adding new features:
1. Keep the smart/dumb separation
2. Add utilities to `utils/` for shared logic
3. Add validation to `validation/` module
4. Update this README with examples
5. Write tests for dumb components

---

**Last Updated:** December 26, 2025
**Architecture:** Container/Presentational Pattern
**Status:** ✅ Production Ready
