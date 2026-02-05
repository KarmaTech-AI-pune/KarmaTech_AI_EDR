# Implementation Tasks - Program Management (Frontend)

## Overview

This task list covers the frontend-only implementation of the Program Management module. All tasks assume backend APIs are already available and functional.

**Total Estimated Time**: 8-10 hours  
**Priority**: High  
**Dependencies**: Backend APIs must be deployed and accessible

**Current Status**: Basic structure created with simplified Program interface

**Program Interface**:
```typescript
interface Program {
  id: number;
  name: string;
  description: string;
  startDate: string | null;
  endDate: string | null;
}

interface ProgramFormDto {
  name: string;
  description: string;
  startDate?: string | null;
  endDate?: string | null;
}
```

---

## Phase 1: Project Setup and Foundation (1-2 hours)

### Task 1.1: Create Folder Structure
**Estimated Time**: 30 minutes  
**Priority**: High  
**Dependencies**: None

Create the required folder structure for the Program Management feature:

```
frontend/src/
├── types/
│   └── program.ts
├── services/
│   └── api/
│       └── programApi.ts
├── hooks/
│   └── usePrograms.ts
├── pages/
│   └── ProgramManagement/
│       └── ProgramManagement.tsx
└── components/
    └── ProgramManagement/
        ├── CreateProgramDialog.tsx
        ├── EditProgramDialog.tsx
        └── ProgramCard.tsx
```

**Acceptance Criteria**:
- [x] All folders created (components/ProgramManagement and pages/ProgramManagement exist)
- [x] Folder structure matches simplified design
- [x] Files created with proper TypeScript structure

---

### Task 1.2: Define TypeScript Types
**Estimated Time**: 15 minutes  
**Priority**: High  
**Dependencies**: Task 1.1

Create TypeScript interfaces in `frontend/src/types/program.ts`:

**Types to Define**:
- `Program` interface (id, name, description, startDate, endDate)
- `ProgramFormDto` interface (name, description, startDate, endDate)

**Acceptance Criteria**:
- [x] All types defined with proper TypeScript syntax
- [x] Types match backend API response structure
- [x] Optional fields marked with `?` or `| null`
- [x] No TypeScript errors
- [x] File exports all types for reuse

---

### Task 1.3: Create API Service Layer
**Estimated Time**: 30 minutes  
**Priority**: High  
**Dependencies**: Task 1.2

Create API service in `frontend/src/services/api/programApi.ts`:

**Methods to Implement**:
- `getAll(): Promise<Program[]>`
- `getById(id: number): Promise<Program>`
- `create(program: ProgramFormDto): Promise<number>`
- `update(id: number, program: ProgramFormDto): Promise<void>`
- `delete(id: number): Promise<void>`

**Acceptance Criteria**:
- [x] All API methods implemented
- [x] Uses axiosInstance from existing config
- [x] Proper error handling with try-catch
- [x] TypeScript types applied to all methods
- [x] No compilation errors
- [x] Follows existing API service patterns in the codebase

---

### Task 1.4: Create Custom Hook
**Estimated Time**: 30 minutes  
**Priority**: High  
**Dependencies**: Task 1.3

Create custom hook in `frontend/src/hooks/usePrograms.ts`:

**Hook to Create**:
1. `usePrograms` - Fetch all programs and handle CRUD operations

**Acceptance Criteria**:
- [x] Hook implemented with proper TypeScript types
- [x] Returns `{ programs, isLoading, error, refetch }` pattern
- [x] Handles loading states correctly
- [x] Handles error states with user-friendly messages
- [x] No memory leaks (proper cleanup with useEffect)
- [x] Follows existing hook patterns in the codebase

---

## Phase 2: Core Components (3-4 hours)

### Task 2.1: Create ProgramCard Component
**Estimated Time**: 45 minutes  
**Priority**: High  
**Dependencies**: Task 1.2

Create program card component in `frontend/src/components/ProgramManagement/ProgramCard.tsx`:

**Features**:
- Material-UI Card component
- Display program name, description, dates
- Action buttons: Edit, Delete
- Hover effects for better UX

**Acceptance Criteria**:
- [x] Card displays program summary (name, description, dates)
- [x] Action buttons render and are clickable
- [x] Responsive design (stacks on mobile)
- [x] Follows existing card patterns in the codebase

---

### Task 2.2: Create ProgramManagement Page
**Estimated Time**: 2 hours  
**Priority**: High  
**Dependencies**: Task 1.4, Task 2.1

Create program management page in `frontend/src/pages/ProgramManagement/ProgramManagement.tsx`:

**Features**:
- White container with border and shadow (matching Project Management style)
- Header with title and "Create Program" button
- Search bar with icon
- List of programs (not grid - matching Project Management)
- Each program displayed as a ListItem with hover effects
- Action buttons: Edit, Delete (inline with each item)
- Loading spinner while fetching data
- Error message with retry button
- Empty state message
- Pagination at the bottom (5 items per page)

**UI Pattern**: Follows the same layout as Project Management page:
- Top margin for fixed navbar (mt: '64px')
- White container with rounded corners and subtle shadow
- Header section with title and action button
- Divider after header
- Search bar section
- List of items with hover effects and transform animation
- Pagination component at bottom

**Acceptance Criteria**:
- [x] Programs display in list format (not grid)
- [x] Search functionality works (filters by name/description)
- [x] Loading state displays CircularProgress spinner
- [x] Error state displays Alert with retry button
- [x] Empty state displays helpful message
- [x] Pagination works correctly (5 items per page)
- [x] List items have hover effects (background change + transform)
- [x] Action buttons (Edit/Delete) display inline
- [x] Follows Project Management UI patterns exactly
- [x] Responsive design (works on mobile and desktop)

---

### Task 2.3: Create CreateProgramDialog Component
**Estimated Time**: 1.5 hours  
**Priority**: High  
**Dependencies**: Task 1.3

Create program creation dialog in `frontend/src/components/ProgramManagement/CreateProgramDialog.tsx`:

**Features**:
- Material-UI Dialog component
- React Hook Form + Zod validation
- Fields: Name (required), Description (required), Start Date (optional), End Date (optional)
- Date range validation (End Date > Start Date if both provided)
- Submit button with loading state
- Cancel button with unsaved changes confirmation
- Success message on creation
- Refresh program list on success

**Acceptance Criteria**:
- [x] Dialog opens/closes correctly
- [x] All form fields render with proper labels
- [x] Validation works (required fields, date range)
- [x] Error messages display inline below fields
- [x] Submit calls API correctly using programApi
- [x] Loading state during submission (disabled button, spinner)
- [x] Success refreshes program list via callback
- [x] Cancel shows confirmation if unsaved changes exist
- [x] Responsive design (full-width on mobile)
- [x] Follows existing dialog patterns in the codebase

---

## Phase 3: Additional Components (1.5-2 hours)

### Task 3.1: Create EditProgramDialog Component
**Estimated Time**: 1 hour  
**Priority**: High  
**Dependencies**: Task 2.3

Create program edit dialog in `frontend/src/components/ProgramManagement/EditProgramDialog.tsx`:

**Features**:
- Similar to CreateProgramDialog but pre-filled with current values
- Same validation as create dialog
- All fields editable

**Acceptance Criteria**:
- [x] Dialog pre-fills with current program values
- [x] Validation works (same as create)
- [x] Update API call works correctly
- [x] Success refreshes program list via callback
- [x] Follows existing edit dialog patterns

---

### Task 3.2: Add Delete Confirmation
**Estimated Time**: 30 minutes  
**Priority**: Medium  
**Dependencies**: Task 2.2

Add delete confirmation to ProgramManagement page:

**Features**:
- Confirmation dialog before deleting
- Display program name being deleted
- Warning message about permanent deletion

**Acceptance Criteria**:
- [x] Confirmation dialog displays before delete
- [x] Program name shown in confirmation
- [x] Delete API call works correctly
- [x] Success refreshes program list
- [x] Error handling for delete failures

---

## Phase 4: Routing and Navigation (30 minutes)

### Task 4.1: Configure Routes
**Estimated Time**: 15 minutes  
**Priority**: High  
**Dependencies**: Task 2.2

Add route to routing configuration in `frontend/src/routes/`:

**Route to Add**:
- `/programs` → ProgramManagement page

**Acceptance Criteria**:
- [x] Route added to routing config
- [x] Navigation to `/programs` works
- [x] Route follows existing patterns in the codebase
- [ ] No console errors when navigating

---

### Task 4.2: Update Sidebar Navigation
**Estimated Time**: 15 minutes  
**Priority**: Medium  
**Dependencies**: Task 4.1

Update sidebar menu to include Program Management:

**Menu Items to Add**:
- Program Management (link to `/programs`)
- Icon: Folder or Dashboard icon from Material-UI

**Acceptance Criteria**:
- [ ] Menu item added to sidebar
- [ ] Icon displays correctly
- [ ] Navigation works (clicking navigates to `/programs`)
- [ ] Active state highlights correctly when on programs page
- [ ] Follows existing menu item patterns

---

## Phase 5: Testing (2-3 hours)

### Task 5.1: Write Component Tests
**Estimated Time**: 1.5 hours  
**Priority**: High  
**Dependencies**: All Phase 2 and 3 tasks

Write unit tests for all components using React Testing Library + Vitest:

**Components to Test**:
- `ProgramManagement.test.tsx` - Page component behavior
- `ProgramCard.test.tsx` - Card rendering and interactions
- `CreateProgramDialog.test.tsx` - Form validation and submission
- `EditProgramDialog.test.tsx` - Pre-fill and update logic

**Acceptance Criteria**:
- [x] All components have test files co-located
- [x] Tests cover rendering, interactions, validation
- [ ] Tests use MSW or vi.mock for API mocking
- [ ] All tests pass (`npm run test`)
- [ ] Coverage ≥ 80% for program management code
- [ ] Follows existing test patterns in the codebase

---

### Task 5.2: Write Service Tests
**Estimated Time**: 45 minutes  
**Priority**: High  
**Dependencies**: Task 1.3

Write tests for API service in `frontend/src/services/api/programApi.test.ts`:

**Tests to Write**:
- All API methods (getAll, getById, create, update, delete)
- Success cases (200 responses)
- Error cases (400, 404, 500 responses)

**Acceptance Criteria**:
- [ ] All API methods tested
- [ ] Success cases covered
- [ ] Error cases covered
- [ ] MSW or vi.mock used for mocking axios
- [ ] All tests pass
- [ ] Follows existing service test patterns

---

### Task 5.3: Write E2E Tests
**Estimated Time**: 45 minutes  
**Priority**: Medium  
**Dependencies**: All Phase 2, 3, 4 tasks

Write end-to-end tests using Playwright in `frontend/e2e/`:

**Flows to Test**:
- Create program flow (open dialog, fill form, submit, verify)
- Edit program flow (open edit, modify, save, verify)
- Delete program flow (confirm, verify)
- Search programs

**Acceptance Criteria**:
- [ ] All critical flows tested
- [ ] Tests run in CI/CD pipeline
- [ ] All tests pass (`npm run test:e2e`)
- [ ] Tests use proper selectors (data-testid or role)
- [ ] Follows existing E2E test patterns

---

## Phase 6: Polish and Optimization (1 hour)

### Task 6.1: Implement Responsive Design
**Estimated Time**: 30 minutes  
**Priority**: Medium  
**Dependencies**: All Phase 2 and 3 tasks

Ensure all components are responsive across devices:

**Breakpoints to Test** (Material-UI):
- Mobile (xs): 0-600px
- Tablet (sm): 600-900px
- Desktop (md+): 900px+

**Acceptance Criteria**:
- [ ] ProgramManagement page uses cards on mobile, grid on desktop
- [ ] Dialogs are full-width on mobile
- [ ] All components tested on all breakpoints
- [ ] No horizontal scrolling on any device
- [ ] Touch-friendly on mobile (proper button sizes)

---

### Task 6.2: Implement Accessibility
**Estimated Time**: 30 minutes  
**Priority**: High  
**Dependencies**: All Phase 2 and 3 tasks

Ensure WCAG 2.1 AA compliance:

**Accessibility Checks**:
- Keyboard navigation (Tab, Enter, Escape keys)
- ARIA labels on all form fields and buttons
- Focus indicators visible and clear
- Color contrast ≥ 4.5:1

**Acceptance Criteria**:
- [ ] All interactive elements keyboard navigable
- [ ] ARIA labels present on all form fields
- [ ] Focus indicators visible (not removed)
- [ ] Color contrast passes WCAG AA (4.5:1)
- [ ] Follows existing accessibility patterns

---

## Summary

**Total Tasks**: 14  
**Estimated Total Time**: 8-10 hours  
**High Priority Tasks**: 10  
**Medium Priority Tasks**: 4

**Completion Checklist**:
- [x] All Phase 1 tasks complete (Foundation)
- [ ] All Phase 2 tasks complete (Core Components)
- [ ] All Phase 3 tasks complete (Additional Components)
- [ ] All Phase 4 tasks complete (Routing)
- [ ] All Phase 5 tasks complete (Testing)
- [ ] All Phase 6 tasks complete (Polish)
- [ ] All tests passing
- [ ] Code coverage ≥ 80%
- [ ] No TypeScript errors
- [ ] Responsive design verified
- [ ] Accessibility verified

---

**Ready to continue implementation!** 🚀

Phase 1 is complete. Continue with Phase 2 (Core Components).

---

## Phase 2: Core Components (5-6 hours)

### Task 2.1: Create ProgramStatusBadge Component
**Estimated Time**: 45 minutes  
**Priority**: High  
**Dependencies**: Task 1.2

Create reusable status badge component in `frontend/src/components/ProgramManagement/ProgramStatusBadge.tsx`:

**Features**:
- Material-UI Chip component
- Color-coded by status (Planned: grey, Active: blue, OnHold: orange, Completed: green, Archived: red)
- Icon for each status (use Material-UI icons)
- Tooltip with status description
- Size prop (small, medium)

**Acceptance Criteria**:
- [ ] Component renders correctly with all status types
- [ ] All status colors implemented per design
- [ ] Icons display correctly for each status
- [ ] Tooltip shows on hover with descriptive text
- [ ] Props properly typed with TypeScript interface
- [ ] Responsive design (works on mobile and desktop)
- [ ] Follows Material-UI styling patterns (sx prop)

**Reference**: See requirements.md "Requirement 6"

---

### Task 2.2: Create ProgramCard Component
**Estimated Time**: 1 hour  
**Priority**: High  
**Dependencies**: Task 1.2, Task 2.1

Create program card component in `frontend/src/components/ProgramManagement/ProgramCard.tsx`:

**Features**:
- Material-UI Card component
- Display program name, code, status badge, dates
- Expandable to show full details and projects list
- Action buttons: Edit, Archive (with proper permissions)
- Click to expand/collapse functionality
- Hover effects for better UX

**Acceptance Criteria**:
- [ ] Card displays program summary (name, code, status, dates)
- [ ] Expand/collapse functionality works smoothly
- [ ] Status badge displays correctly using ProgramStatusBadge
- [ ] Action buttons render and are clickable
- [ ] Responsive design (stacks on mobile)
- [ ] Smooth animations for expand/collapse
- [ ] Follows existing card patterns in the codebase

**Reference**: See requirements.md "Requirement 1, 3"

---

### Task 2.3: Create ProgramManagement Page
**Estimated Time**: 2-3 hours  
**Priority**: High  
**Dependencies**: Task 1.4, Task 2.1, Task 2.2

Create single program management page in `frontend/src/pages/ProgramManagement/ProgramManagement.tsx`:

**Features**:
- Display all programs as expandable cards
- Filter by status dropdown (All, Planned, Active, OnHold, Completed, Archived)
- Search by name/code input field
- Sort options (name, date, status)
- "Create Program" button (opens CreateProgramDialog)
- Loading skeleton while fetching data
- Error message with retry button
- Expanded card shows:
  - Full program details
  - ProgramProjectsList component
  - "Initialize Program" button
  - Edit and Archive buttons

**Acceptance Criteria**:
- [ ] Cards display programs correctly using ProgramCard
- [ ] Filter by status works (updates displayed programs)
- [ ] Search functionality works (filters by name/code)
- [ ] Sorting works (by name, date, status)
- [ ] Loading state displays skeleton (use LoadingSpinner or Material-UI Skeleton)
- [ ] Error state displays message with retry button
- [ ] Card expansion shows details and projects
- [ ] Responsive design (mobile: stacked cards, desktop: grid)
- [ ] Follows existing page patterns in the codebase

**Reference**: See requirements.md "Requirement 1, 3"

---

### Task 2.4: Create CreateProgramDialog Component
**Estimated Time**: 2-3 hours  
**Priority**: High  
**Dependencies**: Task 1.3

Create program creation dialog in `frontend/src/components/ProgramManagement/CreateProgramDialog.tsx`:

**Features**:
- Material-UI Dialog component
- React Hook Form + Zod validation
- Fields: Name (required), Code (required), Description (required), Start Date (required), Status (required), End Date (optional), Program Manager (optional), Budget (optional), Tags (optional)
- Real-time validation with error messages
- Code format validation (alphanumeric + hyphens)
- Date range validation (End Date > Start Date)
- Submit button with loading state
- Cancel button with unsaved changes confirmation
- Success message on creation
- Refresh program list on success

**Acceptance Criteria**:
- [ ] Dialog opens/closes correctly
- [ ] All form fields render with proper labels
- [ ] Validation works (required fields, format, date range)
- [ ] Error messages display inline below fields
- [ ] Submit calls API correctly using programApi
- [ ] Loading state during submission (disabled button, spinner)
- [ ] Success refreshes program list via callback
- [ ] Cancel shows confirmation if unsaved changes exist
- [ ] Responsive design (full-width on mobile)
- [ ] Follows existing dialog patterns in the codebase

**Reference**: See requirements.md "Requirement 2"

---

## Phase 3: Additional Components (3-4 hours)

### Task 3.1: Create EditProgramDialog Component
**Estimated Time**: 1.5 hours  
**Priority**: High  
**Dependencies**: Task 2.4

Create program edit dialog in `frontend/src/components/ProgramManagement/EditProgramDialog.tsx`:

**Features**:
- Similar to CreateProgramDialog but pre-filled with current values
- Program Code field disabled (read-only)
- Warning when changing to "Archived" status
- All fields disabled if already archived
- Submit button hidden if archived
- Same validation as create dialog

**Acceptance Criteria**:
- [ ] Dialog pre-fills with current program values
- [ ] Code field is disabled (read-only)
- [ ] Validation works (same as create)
- [ ] Warning shows for archive status change
- [ ] Archived programs are read-only (all fields disabled)
- [ ] Update API call works correctly
- [ ] Success refreshes program list via callback
- [ ] Follows existing edit dialog patterns

**Reference**: See requirements.md "Requirement 5"

---

### Task 3.2: Create ArchiveProgramDialog Component
**Estimated Time**: 1 hour  
**Priority**: High  
**Dependencies**: Task 1.3

Create archive confirmation dialog in `frontend/src/components/ProgramManagement/ArchiveProgramDialog.tsx`:

**Features**:
- Material-UI Dialog with warning icon
- Display program name being archived
- Warning message about read-only status
- Optional "Reason" text field (multiline)
- Confirm button with loading state
- Cancel button
- Error handling (e.g., active projects exist)

**Acceptance Criteria**:
- [ ] Dialog displays correctly with warning styling
- [ ] Program name shown prominently
- [ ] Warning message clear and visible
- [ ] Reason field optional (multiline TextField)
- [ ] Confirm calls archive API with reason
- [ ] Error messages display (e.g., "Cannot archive: active projects exist")
- [ ] Success refreshes program list via callback
- [ ] Follows existing confirmation dialog patterns

**Reference**: See requirements.md "Requirement 9"

---

### Task 3.3: Create ProgramProjectsList Component
**Estimated Time**: 1.5 hours  
**Priority**: Medium  
**Dependencies**: Task 1.3

Create projects list component in `frontend/src/components/ProgramManagement/ProgramProjectsList.tsx`:

**Features**:
- Material-UI DataGrid or Card layout (responsive)
- Columns: Project Name, Status, Progress, Start Date, End Date, Actions
- Empty state message: "No projects yet. Click 'Initialize Program' to create the first project."
- Loading skeleton while fetching
- Filter by status dropdown
- Sort by columns
- Navigate to project details on click

**Acceptance Criteria**:
- [ ] Projects display correctly (DataGrid on desktop, Cards on mobile)
- [ ] Empty state shows helpful message
- [ ] Loading state shows skeleton
- [ ] Filter works (by project status)
- [ ] Sorting works (by columns)
- [ ] Navigation works (to project details page)
- [ ] Responsive design (mobile: cards, desktop: grid)
- [ ] Follows existing list patterns in the codebase

**Reference**: See requirements.md "Requirement 8"

---

### Task 3.4: Create InitializeProgramButton Component
**Estimated Time**: 30 minutes  
**Priority**: Medium  
**Dependencies**: None

Create initialize program button in `frontend/src/components/ProgramManagement/InitializeProgramButton.tsx`:

**Features**:
- Material-UI Button with icon (Add or Create icon)
- Opens project creation with pre-filled ProgramId
- Navigate to project creation page OR open dialog

**Acceptance Criteria**:
- [ ] Button renders correctly with icon
- [ ] Click navigates to project creation page
- [ ] ProgramId passed as query param or prop
- [ ] Icon displays (Material-UI Add or Create icon)
- [ ] Follows existing button patterns

**Reference**: See requirements.md "Requirement 3"

---

## Phase 4: Routing and Navigation (30 minutes)

### Task 4.1: Configure Routes
**Estimated Time**: 15 minutes  
**Priority**: High  
**Dependencies**: Task 2.3

Add route to routing configuration in `frontend/src/routes/`:

**Route to Add**:
- `/programs` → ProgramManagement page

**Implementation Steps**:
1. Identify the appropriate route file (likely `coreRoutes.tsx` or create `programRoutes.tsx`)
2. Import ProgramManagement page component
3. Add route configuration
4. Consider lazy loading for performance

**Acceptance Criteria**:
- [ ] Route added to routing config
- [ ] Navigation to `/programs` works
- [ ] Lazy loading implemented (optional but recommended)
- [ ] Route follows existing patterns in the codebase
- [ ] No console errors when navigating

**Reference**: See design.md "Routing Configuration"

---

### Task 4.2: Update Sidebar Navigation
**Estimated Time**: 15 minutes  
**Priority**: Medium  
**Dependencies**: Task 4.1

Update sidebar menu to include Program Management in `frontend/src/components/layout/` or `frontend/src/components/navigation/`:

**Menu Items to Add**:
- Program Management (link to `/programs`)
- Icon: Folder or Dashboard icon from Material-UI

**Implementation Steps**:
1. Locate the sidebar/navigation component
2. Add "Program Management" menu item
3. Add appropriate Material-UI icon
4. Ensure active state highlights correctly

**Acceptance Criteria**:
- [ ] Menu item added to sidebar
- [ ] Icon displays correctly (Material-UI Folder or Dashboard icon)
- [ ] Navigation works (clicking navigates to `/programs`)
- [ ] Active state highlights correctly when on programs page
- [ ] Follows existing menu item patterns

**Reference**: See requirements.md "Requirement 7"

---

## Phase 5: Testing (3-4 hours)

### Task 5.1: Write Component Tests
**Estimated Time**: 2 hours  
**Priority**: High  
**Dependencies**: All Phase 2 and 3 tasks

Write unit tests for all components using React Testing Library + Vitest:

**Components to Test**:
- `ProgramManagement.test.tsx` - Page component behavior
- `ProgramCard.test.tsx` - Card rendering and interactions
- `CreateProgramDialog.test.tsx` - Form validation and submission
- `EditProgramDialog.test.tsx` - Pre-fill and update logic
- `ArchiveProgramDialog.test.tsx` - Confirmation flow
- `ProgramStatusBadge.test.tsx` - Status rendering
- `ProgramProjectsList.test.tsx` - List rendering and filtering

**Test Coverage Requirements**:
- Rendering tests (component displays correctly)
- Interaction tests (clicks, form submissions)
- Validation tests (form errors, required fields)
- API mocking with MSW or vi.mock
- Edge cases (empty states, errors)

**Acceptance Criteria**:
- [ ] All components have test files co-located
- [ ] Tests cover rendering, interactions, validation
- [ ] Tests use MSW or vi.mock for API mocking
- [ ] All tests pass (`npm run test`)
- [ ] Coverage ≥ 80% for program management code
- [ ] Follows existing test patterns in the codebase

**Reference**: See design.md "Testing Strategy"

---

### Task 5.2: Write Service Tests
**Estimated Time**: 1 hour  
**Priority**: High  
**Dependencies**: Task 1.3

Write tests for API service in `frontend/src/services/api/programApi.test.ts`:

**Tests to Write**:
- All API methods (getAll, getById, create, update, archive, getProjects)
- Success cases (200 responses)
- Error cases (400, 404, 500 responses)
- Request payload validation
- Response data transformation

**Acceptance Criteria**:
- [ ] All API methods tested
- [ ] Success cases covered
- [ ] Error cases covered
- [ ] MSW or vi.mock used for mocking axios
- [ ] All tests pass
- [ ] Follows existing service test patterns

---

### Task 5.3: Write E2E Tests
**Estimated Time**: 1 hour  
**Priority**: Medium  
**Dependencies**: All Phase 2, 3, 4 tasks

Write end-to-end tests using Playwright in `frontend/e2e/`:

**Flows to Test**:
- Create program flow (open dialog, fill form, submit, verify)
- Edit program flow (open edit, modify, save, verify)
- Archive program flow (open archive, confirm, verify)
- Expand/collapse program card
- Filter and search programs

**Acceptance Criteria**:
- [ ] All critical flows tested
- [ ] Tests run in CI/CD pipeline
- [ ] All tests pass (`npm run test:e2e`)
- [ ] Tests use proper selectors (data-testid or role)
- [ ] Follows existing E2E test patterns

---

## Phase 6: Polish and Optimization (1-2 hours)

### Task 6.1: Implement Responsive Design
**Estimated Time**: 1 hour  
**Priority**: Medium  
**Dependencies**: All Phase 2 and 3 tasks

Ensure all components are responsive across devices:

**Breakpoints to Test** (Material-UI):
- Mobile (xs): 0-600px
- Tablet (sm): 600-900px
- Desktop (md+): 900px+

**Components to Verify**:
- ProgramManagement page (cards stack on mobile, grid on desktop)
- ProgramCard (full-width on mobile)
- Dialogs (full-width on mobile, fixed width on desktop)
- ProgramProjectsList (cards on mobile, grid on desktop)

**Acceptance Criteria**:
- [ ] ProgramManagement page uses cards on mobile, grid on desktop
- [ ] Cards expand/collapse smoothly on all devices
- [ ] Dialogs are full-width on mobile
- [ ] All components tested on all breakpoints
- [ ] No horizontal scrolling on any device
- [ ] Touch-friendly on mobile (proper button sizes)
- [ ] Uses Material-UI responsive utilities (sx prop with breakpoints)

**Reference**: See design.md "Responsive Design"

---

### Task 6.2: Implement Accessibility
**Estimated Time**: 1 hour  
**Priority**: High  
**Dependencies**: All Phase 2 and 3 tasks

Ensure WCAG 2.1 AA compliance:

**Accessibility Checks**:
- Keyboard navigation (Tab, Enter, Escape keys)
- ARIA labels on all form fields and buttons
- Focus indicators visible and clear
- Color contrast ≥ 4.5:1 (use contrast checker)
- Screen reader compatible (test with screen reader)
- Error messages announced to screen readers

**Components to Verify**:
- All dialogs (keyboard navigation, focus trap)
- All forms (ARIA labels, error announcements)
- All buttons (accessible names)
- Status badges (accessible text)

**Acceptance Criteria**:
- [ ] All interactive elements keyboard navigable
- [ ] ARIA labels present on all form fields
- [ ] Focus indicators visible (not removed)
- [ ] Color contrast passes WCAG AA (4.5:1)
- [ ] Screen reader tested (basic navigation works)
- [ ] Error messages have proper ARIA attributes
- [ ] Follows existing accessibility patterns

**Reference**: See design.md "Accessibility"

---

## Phase 7: Documentation and Handoff (1 hour)

### Task 7.1: Update Documentation
**Estimated Time**: 30 minutes  
**Priority**: Medium  
**Dependencies**: All tasks complete

Update project documentation:

**Documents to Update**:
- README.md (add Program Management section)
- Component documentation (JSDoc comments)
- API service documentation

**Acceptance Criteria**:
- [ ] README updated
- [ ] Components have JSDoc comments
- [ ] API methods documented

---

### Task 7.2: Create User Guide
**Estimated Time**: 30 minutes  
**Priority**: Low  
**Dependencies**: All tasks complete

Create user guide for Program Management:

**Content**:
- How to create a program
- How to edit a program
- How to archive a program
- How to view program details
- How to initialize a program (create project)

**Acceptance Criteria**:
- [ ] User guide created
- [ ] Screenshots included
- [ ] Step-by-step instructions

---

## Summary

**Total Tasks**: 19  
**Estimated Total Time**: 13-16 hours  
**High Priority Tasks**: 14  
**Medium Priority Tasks**: 4  
**Low Priority Tasks**: 1

**Completion Checklist**:
- [ ] All Phase 1 tasks complete (Foundation)
- [ ] All Phase 2 tasks complete (Core Components)
- [ ] All Phase 3 tasks complete (Additional Components)
- [ ] All Phase 4 tasks complete (Routing)
- [ ] All Phase 5 tasks complete (Testing)
- [ ] All Phase 6 tasks complete (Polish)
- [ ] All Phase 7 tasks complete (Documentation)
- [ ] All tests passing
- [ ] Code coverage ≥ 80%
- [ ] No TypeScript errors
- [ ] Responsive design verified
- [ ] Accessibility verified
- [ ] Code reviewed and approved

---

**Ready to start implementation!** 🚀

Begin with Phase 1 (Project Setup and Foundation) and work through each phase sequentially.
