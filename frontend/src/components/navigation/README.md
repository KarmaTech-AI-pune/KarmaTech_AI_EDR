# Project Breadcrumb Navigation

## Overview

The Project Breadcrumb Navigation component provides contextual navigation within the Project Details screen. It displays the hierarchical path from Program to Project, helping users understand their current location and navigate back to higher levels.

## Features

### ✅ Core Functionality
- **Three-Level Hierarchy**: Shows "Programs › Program Name › Project Name" format
- **Contextual Visibility**: Only appears when viewing a project within a program context
- **Responsive Behavior**: Automatically hides when side panel is collapsed
- **Multi-Level Navigation**: 
  - "Programs" link navigates to main program management page
  - Program name link navigates to that program's projects page
  - Project name displayed as current location (not clickable)
- **Loading States**: Shows skeleton loader while fetching data
- **Error Handling**: Gracefully handles API errors without breaking the UI

### ✅ User Experience
- **Text Truncation**: Long names are truncated with ellipsis
- **Tooltips**: Full names shown on hover for truncated text
- **Accessibility**: Proper ARIA labels and keyboard navigation support
- **Visual Integration**: Seamlessly integrates with existing side panel design

## Implementation

### Component Structure
```
ProjectBreadcrumb.tsx          # Main breadcrumb component
ProjectBreadcrumb.test.tsx     # Comprehensive test suite
BreadcrumbDemo.tsx            # Demo component for development
README.md                     # This documentation
```

### Integration Points
- **SideMenu.tsx**: Breadcrumb is integrated into the side panel
- **ProjectContext**: Uses project and program IDs from context
- **API Services**: Fetches program and project data via programApi and projectApi

## Usage

### Basic Usage
```tsx
import { ProjectBreadcrumb } from '../navigation/ProjectBreadcrumb';

// In SideMenu component
<ProjectBreadcrumb isExpanded={isDrawerExpanded} />
```

### Props
```tsx
interface ProjectBreadcrumbProps {
  isExpanded: boolean; // Controls visibility based on side panel state
}
```

## Behavior

### Display Conditions
The breadcrumb displays when:
- ✅ Side panel is expanded (`isExpanded = true`)
- ✅ Either program or project data is available
- ✅ Data has been successfully loaded

The breadcrumb hides when:
- ❌ Side panel is collapsed (`isExpanded = false`)
- ❌ No program or project context is available
- ❌ User is not in a project details view

### Navigation Behavior
- **Program Click**: Navigates to `/program-management/program/{programId}/projects`
- **Project Name**: Displayed as current location (not clickable)

### Loading States
1. **Initial Load**: Shows skeleton loader while fetching data
2. **Data Available**: Displays breadcrumb with program/project names
3. **Error State**: Logs error but doesn't show error UI (graceful degradation)

## Styling

### Visual Design
- **Background**: `background.default` color
- **Border**: Bottom border to separate from menu items
- **Typography**: `body2` variant for consistent sizing
- **Colors**: Primary color for clickable program name, text.primary for project name
- **Spacing**: 16px horizontal padding, 8px vertical padding

### Responsive Behavior
- **Max Width**: Program names limited to 120px, project names to 150px
- **Overflow**: Text overflow handled with ellipsis
- **Hover States**: Underline on program name hover
- **Focus States**: Proper focus outline for accessibility

## Testing

### Test Coverage
- ✅ Renders nothing when collapsed
- ✅ Renders nothing when no data available
- ✅ Shows loading skeleton during data fetch
- ✅ Displays breadcrumb with program and project
- ✅ Displays breadcrumb with only project (no program)
- ✅ Handles program click navigation
- ✅ Handles API errors gracefully
- ✅ Truncates long names properly

### Running Tests
```bash
npm test -- ProjectBreadcrumb.test.tsx
```

## API Dependencies

### Required APIs
- **programApi.getById(id)**: Fetches program data by ID
- **projectApi.getById(id)**: Fetches project data by ID

### Context Dependencies
- **useProject()**: Provides projectId and programId from ProjectContext
- **useNavigate()**: React Router navigation hook

## Accessibility

### ARIA Support
- `aria-label="navigation breadcrumb"` on Breadcrumbs component
- Proper focus management for keyboard navigation
- Screen reader friendly text truncation with title attributes

### Keyboard Navigation
- Tab navigation through clickable elements
- Enter/Space key support for program link activation
- Proper focus indicators

## Browser Support

Compatible with all modern browsers that support:
- ES6+ JavaScript features
- CSS Grid and Flexbox
- React 18+
- Material-UI v5+

## Performance

### Optimization Features
- **Conditional Rendering**: Only renders when needed
- **Memoized Navigation**: Navigation handlers are stable
- **Efficient API Calls**: Only fetches data when IDs change
- **Minimal Re-renders**: Optimized state management

### Bundle Impact
- **Size**: ~2KB gzipped (including dependencies)
- **Dependencies**: Uses existing Material-UI components
- **Tree Shaking**: Fully compatible with build optimization

## Troubleshooting

### Common Issues

**Breadcrumb not showing:**
- Check if `isExpanded` prop is true
- Verify projectId or programId exists in ProjectContext
- Check browser console for API errors

**Navigation not working:**
- Verify route paths match your routing configuration
- Check if programId is properly set in context
- Ensure navigation permissions are correct

**Styling issues:**
- Check Material-UI theme configuration
- Verify CSS-in-JS styles are properly applied
- Check for conflicting styles in parent components

### Debug Mode
Enable debug logging by adding to component:
```tsx
console.log('Breadcrumb Debug:', { projectId, programId, program, project, isExpanded });
```

## Future Enhancements

### Potential Improvements
- **Multi-level Hierarchy**: Support for deeper navigation levels
- **Custom Separators**: Configurable breadcrumb separators
- **Animation**: Smooth transitions when showing/hiding
- **Caching**: Cache program/project data to reduce API calls
- **Offline Support**: Show cached data when offline

### Integration Opportunities
- **Search Integration**: Quick search within breadcrumb
- **Favorites**: Mark frequently accessed programs/projects
- **Recent Items**: Show recently visited items in breadcrumb
- **Bulk Operations**: Multi-select capabilities

## Contributing

### Development Setup
1. Install dependencies: `npm install`
2. Run tests: `npm test`
3. Start development: `npm run dev`
4. Build: `npm run build`

### Code Standards
- Follow existing TypeScript patterns
- Maintain 100% test coverage
- Use Material-UI components consistently
- Follow accessibility guidelines
- Document all props and methods

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Maintainer**: Development Team