# Requirements Document - Program Management

## Introduction

The Program Management module introduces a hierarchical structure where Programs serve as parent containers for Projects. This enables better governance, strategic alignment, and portfolio-level visibility across the organization. Every project must belong to exactly one program, ensuring structured project organization and improved tracking capabilities.

## Glossary

- **Program**: A logical container that groups multiple related projects under a common strategic objective
- **Project**: An execution unit that must belong to a single Program
- **Tenant**: An organization using the application with isolated data
- **System**: The EDR Program Management application
- **Tenant_Admin**: User with administrative privileges within a tenant
- **Program_Manager**: User responsible for managing programs and their projects
- **Project_Manager**: User responsible for managing individual projects
- **Viewer**: User with read-only access to programs and projects
- **Subscription_Plan**: Configuration that determines feature availability per tenant

## Requirements

### Requirement 1: Program Creation and Management

**User Story:** As a Tenant Admin or Program Manager, I want to create and manage programs, so that I can organize projects under strategic initiatives.

#### Acceptance Criteria

1. WHEN a Tenant Admin or Program Manager creates a program, THE System SHALL require Program Name, Program Code, Description, Start Date, and Status
2. WHEN a program is created, THE System SHALL validate that Program Code is unique within the tenant
3. WHEN a program is created, THE System SHALL allow optional fields: End Date, Program Manager, Budget, and Tags
4. WHEN a program is created, THE System SHALL set Status to one of: Planned, Active, On Hold, Completed, or Archived
5. WHEN a Tenant Admin or Program Manager edits a program, THE System SHALL allow modification of all fields except Program Code
6. WHEN a program is modified, THE System SHALL record the change in audit logs with user, timestamp, and changed fields
7. WHEN a program is archived, THE System SHALL set its status to Archived and make it read-only
8. WHEN a program has associated projects, THE System SHALL prevent deletion and require archival instead

### Requirement 2: Program Viewing and Navigation

**User Story:** As a user with program access, I want to view program details and navigate the program hierarchy, so that I can understand program structure and progress.

#### Acceptance Criteria

1. WHEN a user views a program detail page, THE System SHALL display Program Name, Code, Description, Start Date, End Date, Status, Budget, and Program Manager
2. WHEN a user views a program detail page, THE System SHALL display a list of all associated projects
3. WHEN a user views a program detail page, THE System SHALL display aggregated status indicators across all projects
4. WHEN a user views a program detail page, THE System SHALL display a timeline overview of program duration
5. WHEN a user navigates the application, THE System SHALL provide breadcrumb navigation showing: Program Management > Program Name > Project Name
6. WHEN a user accesses the sidebar, THE System SHALL display Program Management with sub-items: Program List, Program Details, Projects, Timeline, Documents, Reports

### Requirement 3: Mandatory Program-Project Association

**User Story:** As a user, I want to create projects within a program context, so that all projects are properly organized under their parent program from the start.

#### Acceptance Criteria

1. WHEN a user creates a program, THE System SHALL redirect the user to the program details page after successful creation
2. WHEN a user views a program details page, THE System SHALL display an "Initialize Program" button to create a new project
3. WHEN a user clicks the "Initialize Program" button, THE System SHALL open a project creation form with the Program ID pre-selected and immutable
4. WHEN a project is created from within a program, THE System SHALL automatically associate the project with the parent program
5. WHEN a project is created, THE System SHALL store the Program ID as a mandatory foreign key
6. WHEN a project is created, THE System SHALL make the Program association immutable after creation
7. WHEN a user attempts to delete a Program with associated projects, THE System SHALL prevent deletion and require archival
8. WHEN a Program is archived, THE System SHALL prevent editing of associated projects unless the Program is reactivated

### Requirement 4: Program Dashboard and Analytics

**User Story:** As a Program Manager, I want to see aggregated metrics and insights for my program, so that I can monitor overall program health and progress.

#### Acceptance Criteria

1. WHEN a user views a Program dashboard, THE System SHALL display the total number of associated projects
2. WHEN a user views a Program dashboard, THE System SHALL display project status breakdown showing counts for Active, Delayed, Completed, and other statuses
3. WHEN a user views a Program dashboard, THE System SHALL calculate and display overall progress percentage as a weighted average of project progress
4. WHERE budget tracking is enabled, WHEN a user views a Program dashboard, THE System SHALL display Budget vs Actual comparison
5. WHEN a user views a Program dashboard, THE System SHALL display key risks and upcoming milestones from associated projects
6. WHEN a Program dashboard loads, THE System SHALL respond within 300ms for programs with up to 100 projects

### Requirement 5: Project Listing Within Program Context

**User Story:** As a user, I want to view projects within their program context, so that I understand project relationships and hierarchy.

#### Acceptance Criteria

1. WHEN a user views a project list, THE System SHALL display projects grouped by their parent Program
2. WHEN a user views a global project list, THE System SHALL display the Program name for each project
3. WHEN a user filters projects, THE System SHALL allow filtering by Program
4. WHEN a user searches for projects, THE System SHALL include Program name in search results
5. WHEN a user views projects under a Program, THE System SHALL sort projects by status and start date by default

### Requirement 6: Program API Endpoints

**User Story:** As a developer, I want RESTful API endpoints for program management, so that I can integrate program functionality into the application.

#### Acceptance Criteria

1. THE System SHALL provide POST /api/programs endpoint to create a new program
2. THE System SHALL provide GET /api/programs endpoint to retrieve all programs for the tenant
3. THE System SHALL provide GET /api/programs/{id} endpoint to retrieve a specific program by ID
4. THE System SHALL provide PUT /api/programs/{id} endpoint to update a program
5. THE System SHALL provide PATCH /api/programs/{id}/archive endpoint to archive a program
6. THE System SHALL provide GET /api/programs/{id}/projects endpoint to retrieve all projects under a program
7. WHEN any program API is called, THE System SHALL enforce tenant isolation
8. WHEN any program API is called, THE System SHALL validate user permissions based on role

### Requirement 7: Security and Access Control

**User Story:** As a security administrator, I want role-based access control for programs, so that users can only access programs they are authorized to view or modify.

#### Acceptance Criteria

1. WHEN a user accesses program data, THE System SHALL enforce tenant isolation ensuring users only see programs from their tenant
2. WHEN a user attempts to create a program, THE System SHALL verify the user has Tenant Admin or Program Manager role
3. WHEN a user attempts to edit a program, THE System SHALL verify the user has Tenant Admin or Program Manager role
4. WHEN a user attempts to archive a program, THE System SHALL verify the user has Tenant Admin role
5. WHEN a user with Viewer role accesses programs, THE System SHALL provide read-only access
6. WHEN a user accesses program APIs, THE System SHALL validate permissions at both API and UI levels
7. WHERE subscription plan limits exist, WHEN a tenant attempts to create a program, THE System SHALL validate against the maximum programs allowed

### Requirement 8: Data Validation and Integrity

**User Story:** As a system administrator, I want data validation rules enforced, so that program data remains consistent and accurate.

#### Acceptance Criteria

1. WHEN a program is created or updated, THE System SHALL validate that Program Name is unique within the tenant
2. WHEN a project is created, THE System SHALL validate that the referenced Program ID exists and belongs to the same tenant
3. WHEN a Program Code is provided, THE System SHALL validate it contains only alphanumeric characters and hyphens
4. WHEN Start Date and End Date are provided, THE System SHALL validate that End Date is after Start Date
5. WHEN a Program is archived, THE System SHALL validate that all associated projects are in Completed or Archived status
6. WHEN a program is deleted, THE System SHALL prevent deletion if any projects reference the Program ID

### Requirement 9: Audit Logging

**User Story:** As a compliance officer, I want all program-level changes tracked, so that I can maintain an audit trail for governance purposes.

#### Acceptance Criteria

1. WHEN a program is created, THE System SHALL log the action with user ID, timestamp, and all field values
2. WHEN a program is updated, THE System SHALL log the action with user ID, timestamp, changed fields, old values, and new values
3. WHEN a program is archived, THE System SHALL log the action with user ID, timestamp, and reason if provided
4. WHEN a project is associated with a program, THE System SHALL log the association with user ID and timestamp
5. WHEN audit logs are queried, THE System SHALL return results within 500ms for the last 90 days of activity

### Requirement 10: Scalability and Performance

**User Story:** As a system architect, I want the program management system to scale efficiently, so that it can support large enterprise deployments.

#### Acceptance Criteria

1. THE System SHALL support up to 10,000 projects per tenant without performance degradation
2. WHEN a user requests the program listing API, THE System SHALL respond within 300ms for up to 1,000 programs
3. WHEN a user loads a program dashboard, THE System SHALL respond within 500ms for programs with up to 100 projects
4. WHEN the database stores program data, THE System SHALL use appropriate indexes on Program ID, Tenant ID, and Status fields
5. WHEN aggregating project metrics for a program, THE System SHALL use efficient queries to avoid N+1 query problems
