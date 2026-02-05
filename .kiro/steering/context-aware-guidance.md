---
inclusion: manual
---

# Context-Aware Development Guidance

## Purpose

This steering file ensures Kiro provides **focused, relevant guidance** based on the current development context. Avoid overwhelming developers with irrelevant information.

## Context Detection Rules

### 🎨 Frontend Context Indicators

Kiro should focus on **frontend-only guidance** when:
- User mentions: React, components, UI, forms, styling, Material-UI, MUI, pages, routing, navigation
- Working in: `frontend/` directory
- File extensions: `.tsx`, `.jsx`, `.css`, `.scss`
- Discussing: user interface, user experience, responsive design, accessibility
- Keywords: component, hook, state, props, JSX, CSS, theme

**When in frontend context:**
- ✅ Reference: `react-component-patterns.md`, `react-forms-validation.md`, `react-routing-navigation.md`, `react-state-api-integration.md`, `material-ui-styling-guide.md`
- ❌ Avoid: Backend API implementation details, database schemas, C# patterns, Entity Framework
- ✅ Focus on: Component structure, Material-UI usage, form handling, state management, API consumption (not creation)

### 🔧 Backend Context Indicators

Kiro should focus on **backend-only guidance** when:
- User mentions: API, endpoints, database, Entity Framework, C#, .NET, SQL, controllers, services
- Working in: `backend/` directory
- File extensions: `.cs`, `.sql`
- Discussing: business logic, data models, repositories, CQRS, MediatR
- Keywords: controller, service, repository, entity, migration, query, command

**When in backend context:**
- ✅ Reference: `database-schema-patterns.md`, `api-documentation-patterns.md`, `architecture-patterns.md`, `coding-standards.md` (C# sections)
- ❌ Avoid: React components, Material-UI styling, form validation libraries, frontend routing
- ✅ Focus on: API design, database patterns, business logic, authentication/authorization (server-side)

### 🔄 Full-Stack Context Indicators

Kiro should provide **both frontend and backend guidance** when:
- User mentions: full feature, end-to-end, integration, authentication flow, complete implementation
- Working across: Both `frontend/` and `backend/` directories
- Discussing: API contracts, data flow, authentication, authorization
- Keywords: integration, full-stack, end-to-end, API contract, data flow

**When in full-stack context:**
- ✅ Reference: All relevant steering files
- ✅ Focus on: Integration points, API contracts, data flow, authentication/authorization (both sides)
- ✅ Provide: Clear separation between frontend and backend tasks

## Response Formatting Rules

### Frontend-Only Responses

When user asks about **frontend development**:

```
✅ GOOD Response:
"I'll help you create a React component with Material-UI. Here's the structure:

[Frontend-specific code and guidance]

This component uses:
- Material-UI Box and Typography components
- sx prop for styling
- React Hook Form for form handling
"

❌ BAD Response:
"I'll help you create a React component. First, let's set up the backend API endpoint in C# with Entity Framework, then create the database migration, and finally build the frontend component..."
```

### Backend-Only Responses

When user asks about **backend development**:

```
✅ GOOD Response:
"I'll help you create the API endpoint. Here's the controller implementation:

[Backend-specific code and guidance]

This follows:
- RESTful API conventions
- CQRS pattern with MediatR
- Repository pattern for data access
"

❌ BAD Response:
"I'll help you create the API endpoint. First, let's build the React form component with Material-UI, then set up the API service in TypeScript, and finally create the backend controller..."
```

## Context-Specific Steering File Usage

### Frontend Development

**Primary Files:**
1. `react-component-patterns.md` - Component structure and patterns
2. `react-forms-validation.md` - Form handling
3. `react-routing-navigation.md` - Navigation
4. `react-state-api-integration.md` - State and API calls
5. `material-ui-styling-guide.md` - Styling

**Secondary Files:**
- `coding-standards.md` (TypeScript sections only)
- `comprehensive-testing-framework.md` (Frontend testing only)

**Avoid:**
- `database-schema-patterns.md`
- `api-documentation-patterns.md` (unless discussing API consumption)
- Backend-specific sections of `architecture-patterns.md`

### Backend Development

**Primary Files:**
1. `database-schema-patterns.md` - Database design
2. `api-documentation-patterns.md` - API design
3. `architecture-patterns.md` - System architecture
4. `coding-standards.md` (C# sections only)

**Secondary Files:**
- `comprehensive-testing-framework.md` (Backend testing only)

**Avoid:**
- `react-component-patterns.md`
- `react-forms-validation.md`
- `react-routing-navigation.md`
- `react-state-api-integration.md`
- `material-ui-styling-guide.md`

## Intelligent Context Switching

### Scenario 1: User Starts with Frontend

```
User: "I need to create a project list component"

Kiro Response:
✅ Focus on: React component, Material-UI, data fetching
✅ Reference: react-component-patterns.md, material-ui-styling-guide.md
❌ Don't mention: Backend API implementation, database schemas

If user later asks: "How do I get the data from the API?"
✅ Explain: API service layer, axios, error handling (frontend perspective)
❌ Don't explain: How to build the API endpoint in C#
```

### Scenario 2: User Starts with Backend

```
User: "I need to create a project API endpoint"

Kiro Response:
✅ Focus on: Controller, service layer, repository pattern
✅ Reference: api-documentation-patterns.md, architecture-patterns.md
❌ Don't mention: React components, Material-UI, form validation

If user later asks: "How will the frontend consume this?"
✅ Explain: API contract, response format, status codes
❌ Don't explain: How to build the React component
```

### Scenario 3: User Asks for Full Feature

```
User: "I need to implement project status change feature"

Kiro Response:
✅ Ask: "Would you like me to focus on:
   1. Frontend implementation (React component + form)
   2. Backend implementation (API endpoint + database)
   3. Full-stack implementation (both frontend and backend)"

Then provide focused guidance based on their choice.
```

## Quick Reference: Context Detection

| User Says | Context | Focus On |
|-----------|---------|----------|
| "Create a component" | Frontend | React, Material-UI, TypeScript |
| "Build a form" | Frontend | React Hook Form, Zod, Material-UI |
| "Style this component" | Frontend | Material-UI sx prop, theming |
| "Create an API endpoint" | Backend | Controller, service, repository |
| "Design database table" | Backend | Entity Framework, migrations |
| "Implement business logic" | Backend | Service layer, CQRS, MediatR |
| "Full feature implementation" | Full-Stack | Ask for clarification |
| "API integration" | Frontend | API service layer, axios, error handling |
| "Authentication" | Full-Stack | Ask: frontend or backend focus? |

## Examples of Focused Responses

### Example 1: Frontend Request

**User:** "Create a project card component"

**✅ Good Response:**
```typescript
// ProjectCard.tsx
import React from 'react';
import { Card, CardContent, Typography, Chip } from '@mui/material';

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <Card sx={{ height: '100%', '&:hover': { boxShadow: 4 } }}>
      <CardContent>
        <Typography variant="h6">{project.name}</Typography>
        <Chip label={project.status} color="primary" size="small" />
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
```

**❌ Bad Response:**
"First, let's create the database entity in C#, then the API endpoint, then the React component..."

### Example 2: Backend Request

**User:** "Create project status change endpoint"

**✅ Good Response:**
```csharp
// ProjectController.cs
[HttpPost("{id}/status")]
public async Task<IActionResult> ChangeStatus(int id, [FromBody] ChangeStatusDto dto)
{
    var command = new ChangeProjectStatusCommand 
    { 
        ProjectId = id, 
        NewStatus = dto.Status 
    };
    
    var result = await _mediator.Send(command);
    return Ok(result);
}
```

**❌ Bad Response:**
"First, let's create the React form component with Material-UI, then the API endpoint..."

## Summary

**Key Principles:**
1. **Detect context** from user's language and file paths
2. **Focus guidance** on relevant technology stack
3. **Avoid mixing** frontend and backend unless explicitly requested
4. **Ask for clarification** when context is ambiguous
5. **Reference only relevant** steering files

**Remember:**
- Frontend developer wants React/Material-UI guidance, not C#/Entity Framework
- Backend developer wants C#/API guidance, not React/Material-UI
- Full-stack requests should be broken down into clear frontend/backend sections

This ensures developers get **focused, actionable guidance** without information overload.
