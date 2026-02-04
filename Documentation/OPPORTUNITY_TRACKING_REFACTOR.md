# Opportunity Tracking Module Refactor Plan

## Overview
This document outlines the plan to refactor the Opportunity Tracking module to improve type safety and maintainability by ensuring frontend interfaces match backend contracts.

## Goals
- Create shared type definitions matching backend DTOs
- Implement single API service replacing dummy/real implementations
- Add proper error handling and loading states
- Improve type safety across the module

## File Structure
```
frontend/src/
├── types/
│   └── api/
│       └── opportunity/
│           ├── enums.ts         # Backend-matching enums
│           ├── interfaces.ts    # Shared interfaces
│           └── index.ts         # Type exports
├── services/
│   └── opportunityApi.ts        # Single API implementation
├── hooks/
│   └── useOpportunity.ts        # Reusable opportunity logic
├── components/
│   ├── error/
│   │   └── ErrorBoundary.tsx    # Error handling
│   └── opportunity/
│       ├── SendForReview.tsx    # Review dialog
│       └── OpportunityDetails.tsx # Opportunity view
```

## Implementation Steps

### Phase 1: Type Definitions
1. Create `types/api/opportunity/enums.ts`:
   - Define OpportunityStage enum matching backend
   - Define OpportunityStatus enum matching backend
   - Export type utilities

2. Create `types/api/opportunity/interfaces.ts`:
   - Define IOpportunityTracking interface matching backend DTO
   - Define IOpportunityHistory interface
   - Define API method interfaces

3. Create `types/api/opportunity/index.ts`:
   - Export all types, enums, and interfaces

### Phase 2: Core Implementation
1. Create `services/opportunityApi.ts`:
   - Implement API methods using axios
   - Add proper error handling
   - Add type safety for requests/responses

2. Create `hooks/useOpportunity.ts`:
   - Implement data fetching logic
   - Add loading states
   - Add error handling
   - Add optimistic updates

3. Create `components/error/ErrorBoundary.tsx`:
   - Implement React error boundary
   - Add fallback UI
   - Add error reporting

### Phase 3: Component Updates
1. Update SendForReview component:
   - Use new API implementation
   - Add loading states
   - Add error handling
   - Implement optimistic updates

2. Update OpportunityDetails component:
   - Use shared type definitions
   - Add error boundary
   - Add loading states

### Phase 4: Cleanup
1. Remove dummy API implementation:
   - Delete dummyapi/opportunityApi.tsx
   - Remove related imports
   - Update any components still using dummy API

2. Code cleanup:
   - Remove unused types
   - Update documentation
   - Add/update tests

## Testing Strategy
1. Unit Tests:
   - Test API methods
   - Test hooks
   - Test components

2. Integration Tests:
   - Test complete workflows
   - Test error scenarios
   - Test loading states

## Future Improvements
- Add retry logic for failed operations
- Implement concurrent update handling
- Add loading skeletons
- Implement offline support
- Add request caching

## Notes
- This refactor focuses on the Opportunity Tracking module as a proof of concept
- Similar patterns can be applied to other modules
- No breaking changes to existing functionality
- Gradual implementation to ensure stability

## Branch Strategy
1. Create feature branch: `feature/opportunity-tracking-refactor`
2. Create sub-branches for each phase:
   - `feature/opportunity-tracking-refactor/types`
   - `feature/opportunity-tracking-refactor/core`
   - `feature/opportunity-tracking-refactor/components`
   - `feature/opportunity-tracking-refactor/cleanup`

## Implementation Order
1. Start with type definitions
2. Implement core functionality
3. Update components one at a time
4. Clean up legacy code

## Success Criteria
- All TypeScript types match backend contracts
- No type assertions needed
- Proper error handling throughout
- Loading states for better UX
- Clean, maintainable code
- No regression in functionality
