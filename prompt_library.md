# EDR Project Management App - Prompt Library

This document contains prompt templates for common development tasks in the EDR Project Management application. Use these templates to quickly generate code with proper architecture and patterns.

## Table of Contents
1. [Backend Form Component](#backend-form-component)
2. [Frontend Form Component](#frontend-form-component)
3. [Full-Stack Form Implementation](#full-stack-form-implementation)
4. [API Endpoint Implementation](#api-endpoint-implementation)
5. [Database Entity and Migration](#database-entity-and-migration)
6. [Unit Test Implementation](#unit-test-implementation)

---

## Backend Form Component

### Prompt Template

```
Create a complete backend implementation for a [FORM_NAME] form in the EDR Project Management app with the following requirements:

- Form fields: [LIST_OF_FIELDS_WITH_TYPES]
- Business rules: [BUSINESS_RULES]
- Related entities: [RELATED_ENTITIES]

Please implement this following our architecture patterns:
- CQRS with MediatR
- Clean Architecture
- Repository pattern with Unit of Work
- Code First approach
- Include all necessary DTOs, entities, and validation

The implementation should include:
1. Domain Entity
2. Repository Interface and Implementation
3. DTOs (Request/Response)
4. CQRS Commands/Queries with MediatR
5. API Controller
6. Validation
7. Unit Tests
```

### Example Usage

```
Create a complete backend implementation for a Project Risk Assessment form in the EDR Project Management app with the following requirements:

- Form fields:
  - RiskId (int, primary key)
  - ProjectId (int, foreign key)
  - RiskName (string, required, max 100 chars)
  - Description (string, required, max 500 chars)
  - Probability (int, required, range 1-5)
  - Impact (int, required, range 1-5)
  - MitigationPlan (string, optional, max 1000 chars)
  - Status (enum: Identified, Analyzing, Mitigating, Resolved, Closed)
  - CreatedBy (string)
  - CreatedDate (DateTime)
  - LastModifiedBy (string, nullable)
  - LastModifiedDate (DateTime, nullable)

- Business rules:
  - Risk Score is calculated as Probability Ã— Impact
  - High risks (Score > 15) require a mitigation plan
  - Only Project Managers and Admins can create/edit risks

- Related entities:
  - Project (one-to-many)
  - User (for audit fields)

Please implement this following our architecture patterns:
- CQRS with MediatR
- Clean Architecture
- Repository pattern with Unit of Work
- Code First approach
- Include all necessary DTOs, entities, and validation

The implementation should include:
1. Domain Entity
2. Repository Interface and Implementation
3. DTOs (Request/Response)
4. CQRS Commands/Queries with MediatR
5. API Controller
6. Validation
7. Unit Tests
```

---

## Frontend Form Component

### Prompt Template

```
Create a React form component for [FORM_NAME] in the EDR Project Management app with the following requirements:

- Form fields: [LIST_OF_FIELDS_WITH_TYPES]
- UI requirements: [UI_REQUIREMENTS]
- Validation rules: [VALIDATION_RULES]
- API integration: [API_ENDPOINTS]

The implementation should include:
1. React component using Material-UI
2. Form state management
3. Validation
4. API integration for saving/retrieving data
5. Error handling
6. Loading states
7. Unit tests
```

### Example Usage

```
Create a React form component for Project Risk Assessment in the EDR Project Management app with the following requirements:

- Form fields:
  - RiskName (text field, required)
  - Description (text area, required)
  - Probability (dropdown, 1-5)
  - Impact (dropdown, 1-5)
  - MitigationPlan (text area, required for high risks)
  - Status (dropdown: Identified, Analyzing, Mitigating, Resolved, Closed)

- UI requirements:
  - Responsive layout
  - Risk Score should be displayed dynamically as Probability Ã— Impact
  - Color-coded risk score (Low: green, Medium: yellow, High: red)
  - Confirmation dialog before submission

- Validation rules:
  - RiskName: Required, max 100 chars
  - Description: Required, max 500 chars
  - Probability: Required, range 1-5
  - Impact: Required, range 1-5
  - MitigationPlan: Required if Risk Score > 15, max 1000 chars
  - Status: Required

- API integration:
  - POST /api/risks for creating new risks
  - PUT /api/risks/{id} for updating existing risks
  - GET /api/risks/{id} for retrieving a risk

The implementation should include:
1. React component using Material-UI
2. Form state management
3. Validation
4. API integration for saving/retrieving data
5. Error handling
6. Loading states
7. Unit tests
```

---

## Full-Stack Form Implementation

### Prompt Template

```
Create a complete full-stack implementation for a [FORM_NAME] feature in the EDR Project Management app with the following requirements:

- Form fields: [LIST_OF_FIELDS_WITH_TYPES]
- Business rules: [BUSINESS_RULES]
- UI requirements: [UI_REQUIREMENTS]

Please implement both backend and frontend following our architecture patterns:

Backend:
- CQRS with MediatR
- Clean Architecture
- Repository pattern with Unit of Work
- Code First approach
- Include all necessary DTOs, entities, and validation

Frontend:
- React with Material-UI
- Form state management
- Validation
- API integration
- Error handling

The implementation should include all necessary components for a complete feature.
```

### Example Usage

```
Create a complete full-stack implementation for a Project Milestone feature in the EDR Project Management app with the following requirements:

- Form fields:
  - MilestoneId (int, primary key)
  - ProjectId (int, foreign key)
  - MilestoneName (string, required, max 100 chars)
  - Description (string, required, max 500 chars)
  - DueDate (DateTime, required)
  - CompletionDate (DateTime, nullable)
  - Status (enum: Planned, InProgress, Completed, Delayed)
  - Priority (enum: Low, Medium, High)
  - Notes (string, optional, max 1000 chars)
  - CreatedBy (string)
  - CreatedDate (DateTime)
  - LastModifiedBy (string, nullable)
  - LastModifiedDate (DateTime, nullable)

- Business rules:
  - Milestones must have a due date after the project start date
  - Completed milestones must have a completion date
  - Only Project Managers and Admins can create/edit milestones
  - Delayed status is automatically set when due date passes without completion

- UI requirements:
  - Responsive form layout
  - Calendar picker for dates
  - Status indicators with appropriate colors
  - Confirmation dialog before submission
  - List view of all milestones for a project with filtering and sorting

Please implement both backend and frontend following our architecture patterns:

Backend:
- CQRS with MediatR
- Clean Architecture
- Repository pattern with Unit of Work
- Code First approach
- Include all necessary DTOs, entities, and validation

Frontend:
- React with Material-UI
- Form state management
- Validation
- API integration
- Error handling

The implementation should include all necessary components for a complete feature.
```

---

## API Endpoint Implementation

### Prompt Template

```
Create an API endpoint for [ENDPOINT_PURPOSE] in the EDR Project Management app with the following requirements:

- HTTP Method: [GET/POST/PUT/DELETE]
- Route: [API_ROUTE]
- Request parameters: [REQUEST_PARAMETERS]
- Response structure: [RESPONSE_STRUCTURE]
- Authorization requirements: [AUTHORIZATION_REQUIREMENTS]

Please implement this following our architecture patterns:
- CQRS with MediatR
- Clean Architecture
- Include proper error handling and validation
```

### Example Usage

```
Create an API endpoint for retrieving project statistics in the EDR Project Management app with the following requirements:

- HTTP Method: GET
- Route: /api/projects/{projectId}/statistics
- Request parameters:
  - projectId (path parameter, int)
  - startDate (query parameter, DateTime, optional)
  - endDate (query parameter, DateTime, optional)
  - includeRisks (query parameter, bool, default: true)
  - includeIssues (query parameter, bool, default: true)
  - includeMilestones (query parameter, bool, default: true)

- Response structure:
  - projectId (int)
  - projectName (string)
  - statistics:
    - totalTasks (int)
    - completedTasks (int)
    - completionPercentage (decimal)
    - onTrackTasks (int)
    - delayedTasks (int)
    - risksCount (int, by severity)
    - issuesCount (int, by status)
    - upcomingMilestones (array of milestone objects)
    - tasksByAssignee (dictionary of user:taskCount)

- Authorization requirements:
  - Minimum role: Viewer
  - Project team members only

Please implement this following our architecture patterns:
- CQRS with MediatR
- Clean Architecture
- Include proper error handling and validation
```

---

## Database Entity and Migration

### Prompt Template

```
Create a database entity and migration for [ENTITY_NAME] in the EDR Project Management app with the following requirements:

- Entity properties: [LIST_OF_PROPERTIES_WITH_TYPES]
- Relationships: [ENTITY_RELATIONSHIPS]
- Constraints: [DATABASE_CONSTRAINTS]
- Indexes: [INDEXES_TO_CREATE]

Please implement this following our architecture patterns:
- Code First approach with Entity Framework Core
- Include configuration in DbContext
- Create the migration
- Include any necessary seed data
```

### Example Usage

```
Create a database entity and migration for ProjectDocument in the EDR Project Management app with the following requirements:

- Entity properties:
  - DocumentId (int, primary key)
  - ProjectId (int, foreign key)
  - Title (string, required, max 200 chars)
  - Description (string, optional, max 500 chars)
  - FilePath (string, required, max 500 chars)
  - FileType (string, required, max 50 chars)
  - FileSize (long, required)
  - Version (string, required, max 20 chars)
  - Status (enum: Draft, UnderReview, Approved, Rejected, Archived)
  - Tags (string, optional, max 200 chars)
  - CreatedBy (string)
  - CreatedDate (DateTime)
  - LastModifiedBy (string, nullable)
  - LastModifiedDate (DateTime, nullable)

- Relationships:
  - Project (many-to-one): Each document belongs to one project
  - DocumentCategory (many-to-one): Each document belongs to one category
  - DocumentComments (one-to-many): Each document can have multiple comments

- Constraints:
  - Unique constraint on ProjectId, Title, and Version
  - Check constraint to ensure FileSize > 0
  - Default value for Status = Draft

- Indexes:
  - Index on ProjectId
  - Index on Status
  - Index on CreatedDate
  - Combined index on Title and FileType

Please implement this following our architecture patterns:
- Code First approach with Entity Framework Core
- Include configuration in DbContext
- Create the migration
- Include any necessary seed data
```

---

## Unit Test Implementation

### Prompt Template

```
Create unit tests for [COMPONENT_TO_TEST] in the EDR Project Management app with the following requirements:

- Component type: [CONTROLLER/SERVICE/REPOSITORY/COMPONENT]
- Functionality to test: [FUNCTIONALITY_DESCRIPTION]
- Test scenarios: [LIST_OF_TEST_SCENARIOS]
- Mocking requirements: [DEPENDENCIES_TO_MOCK]

Please implement comprehensive tests with:
- Proper test naming
- Arrange-Act-Assert pattern
- Mocking of dependencies
- Edge case coverage
- High code coverage
```

### Example Usage

```
Create unit tests for the ProjectRiskController in the EDR Project Management app with the following requirements:

- Component type: API Controller
- Functionality to test:
  - Creating a new risk
  - Updating an existing risk
  - Retrieving risks by project
  - Retrieving a single risk
  - Deleting a risk

- Test scenarios:
  - Creating a valid risk returns 201 Created with the risk details
  - Creating an invalid risk returns 400 Bad Request
  - Creating a risk for a non-existent project returns 404 Not Found
  - Updating a risk with valid data returns 200 OK
  - Updating a non-existent risk returns 404 Not Found
  - Retrieving risks for a valid project returns 200 OK with a list of risks
  - Retrieving risks for a non-existent project returns 404 Not Found
  - Retrieving a single valid risk returns 200 OK with risk details
  - Retrieving a non-existent risk returns 404 Not Found
  - Deleting an existing risk returns 204 No Content
  - Deleting a non-existent risk returns 404 Not Found
  - Unauthorized access returns 401 Unauthorized
  - Forbidden access returns 403 Forbidden

- Mocking requirements:
  - IMediator
  - ILogger
  - User identity and claims

Please implement comprehensive tests with:
- Proper test naming
- Arrange-Act-Assert pattern
- Mocking of dependencies
- Edge case coverage
- High code coverage
```

