# Program Management Routing Structure

## Overview
Project Management is now nested under Program Management, reflecting the hierarchical relationship where programs contain multiple projects.

## Route Hierarchy

```
/programs (Program Management)
├── / (index) → ProgramManagement page (list of all programs)
└── /project-management (Project Management - nested under programs)
    ├── / (index) → ProjectManagement page (list of all projects)
    └── /project (Project Details)
        ├── /overview → ProjectOverview
        ├── /forms → ProjectForms
        ├── /forms/:formId → ProjectForms (specific form)
        ├── /forms/:formId/:subFormId → ProjectForms (sub-form)
        ├── /documents → ProjectDocuments
        ├── /timeline → ProjectTimeline
        └── /budget-history → ProjectBudgetHistory
```

## URL Examples

### Program Management
- **Program List**: `/programs`
- **Program Details**: `/programs/:id` (to be implemented)

### Project Management (nested under programs)
- **Project List**: `/programs/project-management`
- **Project Overview**: `/programs/project-management/project/overview`
- **Project Forms**: `/programs/project-management/project/forms`
- **Project Documents**: `/programs/project-management/project/documents`
- **Project Timeline**: `/programs/project-management/project/timeline`
- **Project Budget History**: `/programs/project-management/project/budget-history`

## Navigation Changes

### Navbar Update
- **Old**: "Project Management" button → `/project-management`
- **New**: "Program Management" button → `/programs`

### Breadcrumb Navigation (to be implemented)
- Program List: `Program Management`
- Program Details: `Program Management > [Program Name]`
- Project List: `Program Management > Project Management`
- Project Details: `Program Management > Project Management > [Project Name]`

## Implementation Files

### Route Configuration
- **Main Config**: `frontend/src/routes/RouteConfig.tsx`
- **Program Routes**: `frontend/src/routes/programManagementRoutes.tsx` (includes project routes)
- **Deprecated**: `frontend/src/routes/projectManagementRoutes.tsx` (merged into program routes)

### Navigation
- **Navbar**: `frontend/src/components/navigation/Navbar.tsx`
  - Updated label: "Program Management"
  - Updated path: `/programs`

## Migration Notes

### Breaking Changes
- All existing links to `/project-management` should be updated to `/programs/project-management`
- Bookmarks and saved links will need to be updated
- Any hardcoded navigation paths in components need updating

### Backward Compatibility
- Consider adding a redirect from `/project-management` to `/programs/project-management` if needed
- Update all internal navigation links to use the new structure

## Benefits of This Structure

1. **Hierarchical Clarity**: URL structure reflects the business logic (programs contain projects)
2. **Scalability**: Easy to add program-specific features at the `/programs` level
3. **Navigation**: Users can navigate up the hierarchy by removing URL segments
4. **Consistency**: Follows RESTful routing conventions
5. **Future-Proof**: Allows for program-level features without conflicting with project routes

## Next Steps

1. ✅ Update routing configuration
2. ✅ Update navbar navigation
3. ⏳ Implement ProgramManagement page component
4. ⏳ Update all internal navigation links
5. ⏳ Add breadcrumb navigation
6. ⏳ Update documentation and user guides
7. ⏳ Test all navigation flows
8. ⏳ Consider adding redirect for backward compatibility

---

**Last Updated**: January 20, 2026
**Status**: Routing structure implemented, components pending
