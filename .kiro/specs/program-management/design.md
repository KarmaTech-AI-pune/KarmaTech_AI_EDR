# Design Document - Program Management (Frontend)

## Overview

The Program Management frontend provides user interfaces for managing programs and their associated projects. This design focuses exclusively on the React/TypeScript frontend components, assuming backend APIs are already available and functional.

**Scope**: Frontend-only implementation
- React 18.3 + TypeScript
- Material-UI v6 components
- API service layer for backend communication
- State management with React hooks
- Form validation with React Hook Form + Zod
- Responsive design for mobile, tablet, and desktop

**Assumptions**:
- Backend APIs exist and are documented
- Authentication/authorization handled by backend
- API endpoints follow RESTful conventions
- Error responses follow standard format

## Architecture

### Frontend Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  React 18.3 + TypeScript + Material-UI v6                  │
│                                                              │
│  Pages (Route Components):                                  │
│  - ProgramList.tsx                                          │
│  - ProgramDetails.tsx                                       │
│  - ProgramDashboard.tsx                                     │
│                                                              │
│  Components (Reusable UI):                                  │
│  - CreateProgramDialog.tsx                                  │
│  - EditProgramDialog.tsx                                    │
│  - ProgramStatusBadge.tsx                                   │
│  - ProgramProjectsList.tsx                                  │
│  - InitializeProgramButton.tsx                              │
│  - ArchiveProgramDialog.tsx                                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────────────┐
│                    SERVICE LAYER                             │
│  API Services (Axios):                                      │
│  - programApi.ts                                            │
│                                                              │
│  Custom Hooks:                                              │
│  - usePrograms.ts                                           │
│  - useProgramDetails.ts                                     │
│  - useProgramDashboard.ts                                   │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTPS/REST API
                       │ JWT Bearer Token
┌──────────────────────┴──────────────────────────────────────┐
│                    BACKEND API                               │
│  ASP.NET Core 8.0 (Assumed to exist)                       │
│  - GET /api/programs                                        │
│  - POST /api/programs                                       │
│  - GET /api/programs/{id}                                   │
│  - PUT /api/programs/{id}                                   │
│  - PATCH /api/programs/{id}/archive                         │
│  - GET /api/programs/{id}/dashboard                         │
│  - GET /api/programs/{id}/projects                          │
└─────────────────────────────────────────────────────────────┘
```

### Design Patterns

1. **Component Composition**: Small, reusable components composed into pages
2. **Container/Presentational**: Separate data fetching (pages) from UI (components)
3. **Custom Hooks**: Reusable data fetching and state management logic
4. **Service Layer**: Centralized API communication with Axios
5. **Form Management**: React Hook Form + Zod for validation
6. **State Management**: React hooks (useState, useEffect, useContext)

## Components and Interfaces

### TypeScript Types

#### File: `frontend/src/types/program.ts`

```typescript
// Program Status Enum
export enum ProgramStatus {
  Planned = 'Planned',
  Active = 'Active',
  OnHold = 'OnHold',
  Completed = 'Completed',
  Archived = 'Archived'
}

// Program DTO (from API)
export interface ProgramDto {
  id: number;
  name: string;
  code: string;
  description: string;
  startDate: string;
  endDate?: string;
  status: ProgramStatus;
  budget?: number;
  tags?: string[];
  programManagerId?: string;
  programManagerName?: string;
  projectCount: number;
  createdAt: string;
  tenantId: number;
}

// Create Program Request
export interface CreateProgramDto {
  name: string;
  code: string;
  description: string;
  startDate: string;
  endDate?: string;
  status: ProgramStatus;
  budget?: number;
  tags?: string[];
  programManagerId?: string;
}

// Update Program Request
export interface UpdateProgramDto {
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  status: ProgramStatus;
  budget?: number;
  tags?: string[];
  programManagerId?: string;
}

// Program Dashboard DTO
export interface ProgramDashboardDto {
  programId: number;
  programName: string;
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  delayedProjects: number;
  overallProgressPercentage: number;
  budgetVsActual?: {
    budgeted: number;
    actual: number;
    variance: number;
  };
  keyRisks: Array<{
    id: number;
    description: string;
    severity: string;
  }>;
  upcomingMilestones: Array<{
    id: number;
    name: string;
    dueDate: string;
    projectName: string;
  }>;
}

// Program Project DTO
export interface ProgramProjectDto {
  projectId: number;
  projectName: string;
  status: string;
  progress: number;
  startDate: string;
  endDate?: string;
  estimatedCost?: number;
  estimatedFee?: number;
}
```

### API Service Layer

#### File: `frontend/src/services/api/programApi.ts`

```typescript
import axiosInstance from '../axiosConfig';
import {
  ProgramDto,
  CreateProgramDto,
  UpdateProgramDto,
  ProgramDashboardDto,
  ProgramProjectDto
} from '../../types/program';

export const programApi = {
  // Get all programs
  getAll: async (status?: string): Promise<ProgramDto[]> => {
    const response = await axiosInstance.get<ProgramDto[]>('/programs', {
      params: { status }
    });
    return response.data;
  },

  // Get program by ID
  getById: async (id: number): Promise<ProgramDto> => {
    const response = await axiosInstance.get<ProgramDto>(`/programs/${id}`);
    return response.data;
  },

  // Create new program
  create: async (program: CreateProgramDto): Promise<number> => {
    const response = await axiosInstance.post<{ id: number }>('/programs', program);
    return response.data.id;
  },

  // Update program
  update: async (id: number, program: UpdateProgramDto): Promise<void> => {
    await axiosInstance.put(`/programs/${id}`, program);
  },

  // Archive program
  archive: async (id: number, reason?: string): Promise<void> => {
    await axiosInstance.patch(`/programs/${id}/archive`, { reason });
  },

  // Delete program
  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/programs/${id}`);
  },

  // Get program dashboard
  getDashboard: async (id: number): Promise<ProgramDashboardDto> => {
    const response = await axiosInstance.get<ProgramDashboardDto>(
      `/programs/${id}/dashboard`
    );
    return response.data;
  },

  // Get projects under program
  getProjects: async (id: number, status?: string): Promise<ProgramProjectDto[]> => {
    const response = await axiosInstance.get<ProgramProjectDto[]>(
      `/programs/${id}/projects`,
      { params: { status } }
    );
    return response.data;
  }
};
```

### Custom Hooks

#### File: `frontend/src/hooks/usePrograms.ts`

```typescript
import { useState, useEffect } from 'react';
import { programApi } from '../services/api/programApi';
import { ProgramDto } from '../types/program';

export const usePrograms = (status?: string) => {
  const [programs, setPrograms] = useState<ProgramDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrograms = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await programApi.getAll(status);
      setPrograms(data);
    } catch (err) {
      setError('Failed to load programs');
      console.error('Error fetching programs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, [status]);

  const refetch = () => {
    fetchPrograms();
  };

  return { programs, isLoading, error, refetch };
};
```

#### File: `frontend/src/hooks/useProgramDetails.ts`

```typescript
import { useState, useEffect } from 'react';
import { programApi } from '../services/api/programApi';
import { ProgramDto } from '../types/program';

export const useProgramDetails = (id: number) => {
  const [program, setProgram] = useState<ProgramDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProgram = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await programApi.getById(id);
        setProgram(data);
      } catch (err) {
        setError('Failed to load program details');
        console.error('Error fetching program:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchProgram();
    }
  }, [id]);

  return { program, isLoading, error };
};
```

### Frontend Components

#### Folder Structure

```
frontend/src/
├── types/
│   └── program.ts                    # TypeScript interfaces
├── services/
│   └── api/
│       └── programApi.ts             # API service layer
├── hooks/
│   ├── usePrograms.ts                # Fetch all programs
│   ├── useProgramDetails.ts          # Fetch single program
│   └── useProgramDashboard.ts        # Fetch dashboard data
├── pages/
│   └── ProgramManagement/
│       ├── ProgramList.tsx           # Program list page
│       ├── ProgramDetails.tsx        # Program details page
│       └── ProgramDashboard.tsx      # Dashboard page (optional)
└── components/
    └── ProgramManagement/
        ├── CreateProgramDialog.tsx   # Create program modal
        ├── EditProgramDialog.tsx     # Edit program modal
        ├── ArchiveProgramDialog.tsx  # Archive confirmation
        ├── ProgramStatusBadge.tsx    # Status indicator
        ├── ProgramProjectsList.tsx   # Projects table/list
        └── InitializeProgramButton.tsx # Create project button
```

#### 1. ProgramList Page Component

**File**: `frontend/src/pages/ProgramManagement/ProgramList.tsx`

**Purpose**: Display all programs in a searchable, filterable table

**Features**:
- Material-UI DataGrid for program display
- Filter by status dropdown
- Search by name/code input field
- Sort by columns (name, code, status, start date)
- Row actions: View, Edit, Archive, Delete
- "Create Program" button (opens CreateProgramDialog)
- Loading skeleton while fetching data
- Error message display with retry button
- Navigate to ProgramDetails on row click

**State Management**:
- `programs`: Array of ProgramDto
- `isLoading`: Boolean for loading state
- `error`: String for error messages
- `statusFilter`: String for status filter
- `searchQuery`: String for search input
- `isCreateDialogOpen`: Boolean for dialog visibility

**Key Interactions**:
- Fetch programs on mount using `usePrograms` hook
- Filter programs client-side based on search/status
- Open CreateProgramDialog when "Create" clicked
- Navigate to `/programs/:id` when row clicked
- Refresh list after create/update/delete operations

#### 2. ProgramDetails Page Component

**File**: `frontend/src/pages/ProgramManagement/ProgramDetails.tsx`

**Purpose**: Display detailed information about a single program

**Features**:
- Display program metadata (name, code, description, dates, status, budget, manager)
- Show ProgramStatusBadge for current status
- Display ProgramProjectsList component
- "Initialize Program" button (opens project creation with pre-filled ProgramId)
- "Edit Program" button (opens EditProgramDialog)
- "Archive Program" button (opens ArchiveProgramDialog)
- Breadcrumb navigation: Program Management > [Program Name]
- Loading skeleton while fetching data
- Error message with "Go Back" button
- Redirect here after successful program creation

**State Management**:
- `program`: ProgramDto | null
- `isLoading`: Boolean
- `error`: String | null
- `isEditDialogOpen`: Boolean
- `isArchiveDialogOpen`: Boolean

**Key Interactions**:
- Fetch program details on mount using `useProgramDetails` hook
- Extract programId from URL params (useParams)
- Open EditProgramDialog when "Edit" clicked
- Open ArchiveProgramDialog when "Archive" clicked
- Navigate to project creation with programId pre-filled
- Refresh details after edit/archive operations

#### 3. CreateProgramDialog Component

**File**: `frontend/src/components/ProgramManagement/CreateProgramDialog.tsx`

**Purpose**: Modal dialog for creating a new program

**Features**:
- Material-UI Dialog component
- Form with React Hook Form + Zod validation
- Fields: Name (required), Code (required), Description (required), Start Date (required), Status (required), End Date (optional), Program Manager (optional), Budget (optional), Tags (optional)
- Real-time validation feedback
- Code format validation (alphanumeric + hyphens)
- Date range validation (End Date > Start Date)
- Submit button with loading state
- Cancel button with unsaved changes confirmation
- Success message on creation
- Redirect to ProgramDetails page after success

**Props**:
```typescript
interface CreateProgramDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (programId: number) => void;
}
```

**Validation Schema** (Zod):
```typescript
const createProgramSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  code: z.string().min(1, 'Code is required').max(50).regex(/^[a-zA-Z0-9-]+$/, 'Only alphanumeric and hyphens'),
  description: z.string().min(1, 'Description is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  status: z.nativeEnum(ProgramStatus),
  budget: z.number().min(0).optional(),
  tags: z.array(z.string()).optional(),
  programManagerId: z.string().optional()
}).refine(data => {
  if (data.endDate && data.startDate) {
    return new Date(data.endDate) > new Date(data.startDate);
  }
  return true;
}, {
  message: 'End date must be after start date',
  path: ['endDate']
});
```

#### 4. EditProgramDialog Component

**File**: `frontend/src/components/ProgramManagement/EditProgramDialog.tsx`

**Purpose**: Modal dialog for editing an existing program

**Features**:
- Similar to CreateProgramDialog but pre-filled with current values
- Program Code field is disabled (read-only)
- Warning message when changing status to "Archived"
- All fields disabled if program is already archived
- Submit button hidden if program is archived
- Validation same as create dialog
- Success message on update
- Refresh ProgramDetails page after success

**Props**:
```typescript
interface EditProgramDialogProps {
  open: boolean;
  program: ProgramDto;
  onClose: () => void;
  onSuccess: () => void;
}
```

#### 5. ArchiveProgramDialog Component

**File**: `frontend/src/components/ProgramManagement/ArchiveProgramDialog.tsx`

**Purpose**: Confirmation dialog before archiving a program

**Features**:
- Material-UI Dialog with warning icon
- Display program name being archived
- Warning message: "Archiving will make this program read-only"
- Optional "Reason" text field (multiline)
- Confirm button with loading state
- Cancel button
- Error message if archiving fails (e.g., active projects exist)
- Success message on archive
- Refresh ProgramDetails page after success

**Props**:
```typescript
interface ArchiveProgramDialogProps {
  open: boolean;
  program: ProgramDto;
  onClose: () => void;
  onSuccess: () => void;
}
```

#### 6. ProgramStatusBadge Component

**File**: `frontend/src/components/ProgramManagement/ProgramStatusBadge.tsx`

**Purpose**: Visual indicator for program status

**Features**:
- Material-UI Chip component
- Color-coded by status:
  - Planned: Grey
  - Active: Blue
  - OnHold: Orange
  - Completed: Green
  - Archived: Red
- Icon for each status
- Tooltip with status description on hover
- Small size for compact display

**Props**:
```typescript
interface ProgramStatusBadgeProps {
  status: ProgramStatus;
  size?: 'small' | 'medium';
}
```

#### 7. ProgramProjectsList Component

**File**: `frontend/src/components/ProgramManagement/ProgramProjectsList.tsx`

**Purpose**: Display projects associated with a program

**Features**:
- Material-UI DataGrid or Card layout (responsive)
- Columns: Project Name, Status, Progress, Start Date, End Date, Actions
- Empty state message: "No projects yet. Click 'Initialize Program' to create the first project."
- Loading skeleton while fetching
- Filter by status dropdown
- Sort by columns
- Navigate to project details on row click
- Display program name in header/title

**Props**:
```typescript
interface ProgramProjectsListProps {
  programId: number;
  programName: string;
}
```

**State Management**:
- Fetch projects using custom hook or API call
- Handle loading and error states
- Filter projects client-side

#### 8. InitializeProgramButton Component

**File**: `frontend/src/components/ProgramManagement/InitializeProgramButton.tsx`

**Purpose**: Button to create a new project under the current program

**Features**:
- Material-UI Button with icon
- Opens project creation dialog/page
- Pre-fills ProgramId field (disabled/read-only)
- Passes programId to project creation form
- Displayed on ProgramDetails page

**Props**:
```typescript
interface InitializeProgramButtonProps {
  programId: number;
  programName: string;
}
```

**Behavior**:
- Navigate to `/projects/create?programId={id}` OR
- Open project creation dialog with programId prop

## Routing Configuration

### Routes to Add

**File**: `frontend/src/routes/index.tsx` (or App.tsx)

```typescript
import { Routes, Route } from 'react-router-dom';
import ProgramList from '../pages/ProgramManagement/ProgramList';
import ProgramDetails from '../pages/ProgramManagement/ProgramDetails';

// Add these routes to your routing configuration
<Route path="/programs" element={<ProgramList />} />
<Route path="/programs/:id" element={<ProgramDetails />} />
```

### Navigation Menu

**Update Sidebar Menu** to include:
- Program Management (parent menu item)
  - Program List (link to `/programs`)
  - Icon: Folder or Dashboard icon

## Form Validation

### Validation Rules (Zod Schemas)

All forms use Zod for schema validation with React Hook Form:

**Create/Edit Program Validation**:
- **Name**: Required, 1-255 characters
- **Code**: Required, 1-50 characters, alphanumeric + hyphens only, unique (validated by backend)
- **Description**: Required, minimum 1 character
- **Start Date**: Required, valid date format
- **End Date**: Optional, must be after Start Date if provided
- **Status**: Required, must be valid enum value
- **Budget**: Optional, must be >= 0 if provided
- **Tags**: Optional, array of strings
- **Program Manager**: Optional, valid user ID

**Archive Program Validation**:
- **Reason**: Optional, string

### Client-Side Validation

- Real-time validation on field blur
- Display error messages inline below fields
- Disable submit button if form is invalid
- Show validation summary at top of form if multiple errors

### Server-Side Validation

- Handle API validation errors (400 Bad Request)
- Map error responses to form fields
- Display server errors inline next to relevant fields
- Show general error message for non-field-specific errors

## Error Handling

### Error Response Format (from Backend API)

The frontend expects errors in this format:

```typescript
interface ApiError {
  success: false;
  statusCode: number;
  message: string;
  errors: Array<{
    field: string;
    message: string;
  }>;
}
```

### Frontend Error Handling Strategy

**1. API Service Layer Error Handling**:
```typescript
// In programApi.ts
try {
  const response = await axiosInstance.post('/programs', program);
  return response.data;
} catch (error) {
  if (axios.isAxiosError(error) && error.response) {
    // Handle API error response
    throw error.response.data;
  }
  // Handle network error
  throw new Error('Network error. Please check your connection.');
}
```

**2. Component Error Handling**:
```typescript
// In CreateProgramDialog.tsx
const [apiError, setApiError] = useState<string | null>(null);

const onSubmit = async (data: CreateProgramDto) => {
  try {
    setApiError(null);
    const programId = await programApi.create(data);
    onSuccess(programId);
  } catch (error: any) {
    if (error.errors) {
      // Map field errors to form
      error.errors.forEach((err: any) => {
        setError(err.field, { message: err.message });
      });
    } else {
      // Show general error
      setApiError(error.message || 'Failed to create program');
    }
  }
};
```

**3. Error Display Components**:
- **Inline Field Errors**: Display below form fields using `helperText` prop
- **Alert Messages**: Use Material-UI Alert component for general errors
- **Snackbar Notifications**: Use for success/error toasts
- **Error Boundaries**: Catch React component errors

### Common Error Scenarios

**Validation Errors (400)**:
- Display inline next to form fields
- Highlight invalid fields in red
- Show error icon next to field label

**Authorization Errors (403)**:
- Display alert message: "You don't have permission to perform this action"
- Disable action buttons for unauthorized users
- Redirect to login if token expired

**Not Found Errors (404)**:
- Display message: "Program not found"
- Show "Go Back" button
- Suggest navigating to program list

**Conflict Errors (409)**:
- Display specific conflict message (e.g., "Program code already exists")
- Highlight conflicting field
- Suggest alternative action

**Network Errors**:
- Display message: "Network error. Please check your connection."
- Show retry button
- Cache form data to prevent loss

## Testing Strategy

### Frontend Testing Approach

**Testing Libraries**:
- **Vitest**: Unit and component testing
- **React Testing Library**: Component testing
- **Playwright**: End-to-end testing
- **MSW (Mock Service Worker)**: API mocking

### Test Categories

#### 1. Component Tests (React Testing Library + Vitest)

**Test Files Location**: Co-located with components (`.test.tsx`)

**ProgramList.test.tsx**:
- Renders program list correctly
- Displays loading skeleton while fetching
- Shows error message on fetch failure
- Filters programs by status
- Searches programs by name/code
- Opens create dialog when button clicked
- Navigates to details on row click

**CreateProgramDialog.test.tsx**:
- Renders form fields correctly
- Validates required fields
- Validates code format (alphanumeric + hyphens)
- Validates date range (end > start)
- Displays validation errors inline
- Submits form with valid data
- Handles API errors
- Closes dialog on cancel
- Shows confirmation on unsaved changes

**ProgramDetails.test.tsx**:
- Renders program details correctly
- Displays loading skeleton while fetching
- Shows error message on fetch failure
- Opens edit dialog when button clicked
- Opens archive dialog when button clicked
- Displays projects list
- Shows "Initialize Program" button

**ProgramStatusBadge.test.tsx**:
- Renders correct color for each status
- Displays correct icon for each status
- Shows tooltip on hover

#### 2. Service Tests (Vitest)

**programApi.test.ts**:
- `getAll()` fetches programs successfully
- `getAll()` handles errors
- `getById()` fetches single program
- `create()` creates program and returns ID
- `update()` updates program
- `archive()` archives program with reason
- `delete()` deletes program
- `getDashboard()` fetches dashboard data
- `getProjects()` fetches program projects

**Mock API Responses** using MSW:
```typescript
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.get('/api/programs', (req, res, ctx) => {
    return res(ctx.json([
      { id: 1, name: 'Program 1', code: 'PRG-001', status: 'Active' }
    ]));
  }),
  rest.post('/api/programs', (req, res, ctx) => {
    return res(ctx.json({ id: 2 }));
  })
);
```

#### 3. Custom Hook Tests (Vitest)

**usePrograms.test.ts**:
- Fetches programs on mount
- Returns loading state
- Returns error state on failure
- Refetches when status filter changes
- Provides refetch function

**useProgramDetails.test.ts**:
- Fetches program details on mount
- Returns loading state
- Returns error state on failure
- Updates when ID changes

#### 4. End-to-End Tests (Playwright)

**program-management.spec.ts**:
```typescript
test('Create program flow', async ({ page }) => {
  // Navigate to program list
  await page.goto('/programs');
  
  // Click create button
  await page.click('button:has-text("Create Program")');
  
  // Fill form
  await page.fill('input[name="name"]', 'Test Program');
  await page.fill('input[name="code"]', 'TEST-001');
  await page.fill('textarea[name="description"]', 'Test description');
  await page.fill('input[name="startDate"]', '2025-01-01');
  await page.selectOption('select[name="status"]', 'Active');
  
  // Submit form
  await page.click('button:has-text("Create")');
  
  // Verify redirect to details page
  await expect(page).toHaveURL(/\/programs\/\d+/);
  await expect(page.locator('h4')).toContainText('Test Program');
});

test('Edit program flow', async ({ page }) => {
  // Navigate to program details
  await page.goto('/programs/1');
  
  // Click edit button
  await page.click('button:has-text("Edit")');
  
  // Update name
  await page.fill('input[name="name"]', 'Updated Program');
  
  // Submit
  await page.click('button:has-text("Save")');
  
  // Verify update
  await expect(page.locator('h4')).toContainText('Updated Program');
});

test('Archive program flow', async ({ page }) => {
  // Navigate to program details
  await page.goto('/programs/1');
  
  // Click archive button
  await page.click('button:has-text("Archive")');
  
  // Enter reason
  await page.fill('textarea[name="reason"]', 'No longer needed');
  
  // Confirm
  await page.click('button:has-text("Confirm")');
  
  // Verify archived status
  await expect(page.locator('[data-testid="status-badge"]')).toContainText('Archived');
});
```

### Test Coverage Requirements

- **Component Tests**: ≥80% coverage
- **Service Tests**: ≥90% coverage
- **Hook Tests**: ≥80% coverage
- **E2E Tests**: Cover critical user flows

### Running Tests

```bash
# Unit and component tests
npm run test

# With coverage
npm run test:coverage

# E2E tests
npm run test:e2e

# E2E tests in UI mode
npm run test:e2e:ui
```

## Responsive Design

### Breakpoints (Material-UI)

- **xs** (0px+): Mobile phones
- **sm** (600px+): Tablets
- **md** (900px+): Small laptops
- **lg** (1200px+): Desktops
- **xl** (1536px+): Large desktops

### Responsive Layouts

**ProgramList Page**:
- **Desktop (md+)**: DataGrid with all columns visible
- **Tablet (sm-md)**: DataGrid with fewer columns, horizontal scroll
- **Mobile (xs)**: Card layout instead of table

**ProgramDetails Page**:
- **Desktop (md+)**: Two-column layout (details + projects)
- **Tablet (sm-md)**: Single column, stacked sections
- **Mobile (xs)**: Single column, compact spacing

**Dialogs**:
- **Desktop**: Fixed width (600px)
- **Tablet/Mobile**: Full width with padding

### Accessibility

**WCAG 2.1 AA Compliance**:
- All interactive elements keyboard navigable
- Proper ARIA labels on all form fields
- Focus indicators visible
- Color contrast ratio ≥ 4.5:1
- Screen reader compatible
- Error messages announced to screen readers
- Form validation errors clearly associated with fields

**Keyboard Navigation**:
- Tab through form fields in logical order
- Enter to submit forms
- Escape to close dialogs
- Arrow keys for dropdown navigation

## Performance Optimization

### Code Splitting

```typescript
// Lazy load program pages
const ProgramList = lazy(() => import('./pages/ProgramManagement/ProgramList'));
const ProgramDetails = lazy(() => import('./pages/ProgramManagement/ProgramDetails'));

// Wrap in Suspense
<Suspense fallback={<LoadingSpinner loading={true} />}>
  <Routes>
    <Route path="/programs" element={<ProgramList />} />
    <Route path="/programs/:id" element={<ProgramDetails />} />
  </Routes>
</Suspense>
```

### Memoization

```typescript
// Memoize expensive calculations
const filteredPrograms = useMemo(() => {
  return programs.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (statusFilter === 'all' || p.status === statusFilter)
  );
}, [programs, searchQuery, statusFilter]);

// Memoize callbacks
const handleRowClick = useCallback((programId: number) => {
  navigate(`/programs/${programId}`);
}, [navigate]);
```

### Virtual Scrolling (Future Enhancement)

For large program lists (>1000 items), implement virtual scrolling using `react-window` or Material-UI's built-in virtualization.

## State Management

### Local State (useState)

Use for component-specific state:
- Form field values
- Dialog open/close state
- Loading states
- Error messages
- Filter/search values

### Custom Hooks

Use for reusable data fetching logic:
- `usePrograms()` - Fetch all programs
- `useProgramDetails()` - Fetch single program
- `useProgramDashboard()` - Fetch dashboard data

### Context (Future Enhancement)

If global state needed:
- User authentication state
- Theme preferences
- Notification system

## Security Considerations

### Authentication

- All API requests include JWT Bearer token (handled by Axios interceptor)
- Token stored in localStorage (or httpOnly cookie)
- Redirect to login on 401 Unauthorized
- Refresh token before expiration

### Authorization

- Hide/disable UI elements based on user role
- Show read-only views for Viewer role
- Disable edit/delete buttons for unauthorized users
- Display permission error messages

### Input Sanitization

- Validate all user input client-side
- Escape HTML in user-generated content
- Prevent XSS attacks
- Use Zod for schema validation

### HTTPS

- All API communication over HTTPS
- Secure cookie flags (httpOnly, secure, sameSite)

## Future Enhancements

1. **Program Dashboard Page**: Dedicated dashboard with charts and metrics
2. **Bulk Operations**: Select multiple programs for bulk actions
3. **Export/Import**: Export programs to CSV/Excel
4. **Advanced Filters**: Multi-select filters, date range filters
5. **Program Templates**: Create programs from templates
6. **Drag-and-Drop**: Reorder programs or projects
7. **Real-time Updates**: WebSocket for live updates
8. **Offline Support**: PWA with offline capabilities
9. **Mobile App**: React Native mobile app
10. **Advanced Analytics**: Custom dashboards and reports

---

**Document Version**: 1.0 (Frontend-Only)  
**Last Updated**: January 20, 2026  
**Status**: Ready for Implementation
