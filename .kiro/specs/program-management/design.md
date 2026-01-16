# Design Document - Program Management

## Overview

The Program Management module introduces a hierarchical organizational structure where Programs serve as parent containers for Projects. This design builds upon the existing partial implementation of Program entities and extends it to meet all requirements specified in the requirements document.

**Current State**: The system already has:
- Program entity with basic fields (Id, Name, Description, StartDate, EndDate)
- Project entity with ProgramId foreign key
- Basic CQRS commands/queries for Program CRUD operations
- ProgramController with Create, Read, Update, Delete endpoints
- ProgramRepository with basic data access methods

**Gaps to Address**:
- Missing Program Code field (unique identifier)
- Missing Status field and status management
- Missing Budget field
- Missing Tags field
- Missing Program Manager assignment
- No archive functionality
- No program dashboard with aggregated metrics
- No validation for mandatory program-project association
- No audit logging for program changes
- Missing API endpoints for program-specific operations (archive, projects list)
- No frontend components for program management

## Architecture

### System Architecture Pattern

The implementation follows the existing EDR architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  React 18.3 + TypeScript + Material-UI                     │
│  - ProgramList.tsx                                          │
│  - ProgramDetails.tsx                                       │
│  - ProgramDashboard.tsx                                     │
│  - CreateProgramDialog.tsx                                  │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTPS/REST API
                       │ JWT Bearer Token
┌──────────────────────┴──────────────────────────────────────┐
│                  APPLICATION LAYER                           │
│  ASP.NET Core 8.0 API                                       │
│  - ProgramController (existing, enhanced)                   │
│  - CQRS Commands/Queries (existing, enhanced)              │
│  - MediatR Handlers                                         │
│  - AutoMapper DTOs                                          │
└──────────────────────┬──────────────────────────────────────┘
                       │ Entity Framework Core
┌──────────────────────┴──────────────────────────────────────┐
│                    DATA LAYER                                │
│  Microsoft SQL Server                                        │
│  - Programs table (existing, enhanced)                      │
│  - Projects table (existing, ProgramId FK)                  │
│  - AuditLogs table (existing)                               │
└─────────────────────────────────────────────────────────────┘
```

### Design Patterns

1. **CQRS (Command Query Responsibility Segregation)**: Separate read and write operations
2. **Repository Pattern**: Abstract data access layer
3. **Unit of Work**: Transaction management
4. **DTO Pattern**: Data transfer objects for API contracts
5. **Dependency Injection**: Loose coupling and testability

## Components and Interfaces

### Backend Components

#### 1. Enhanced Program Entity

**File**: `backend/src/NJS.Domain/Entities/Program.cs`

**Changes Required**:
- Add `Code` property (unique identifier)
- Add `Status` property (enum: Planned, Active, OnHold, Completed, Archived)
- Add `Budget` property (decimal)
- Add `Tags` property (string, JSON array)
- Add `ProgramManagerId` property (foreign key to User)
- Add `CreatedAt` property (timestamp)
- Add navigation property to ProgramManager


#### 2. Program Status Enum

**File**: `backend/src/NJS.Domain/Enums/ProgramStatus.cs` (new)

**Values**:
- Planned = 0
- Active = 1
- OnHold = 2
- Completed = 3
- Archived = 4

#### 3. Enhanced ProgramDto

**File**: `backend/src/NJS.Application/Dtos/ProgramDto.cs`

**Additional Properties**:
- Code (string, required)
- Status (ProgramStatus enum)
- Budget (decimal?, optional)
- Tags (List<string>?, optional)
- ProgramManagerId (string?, optional)
- ProgramManagerName (string?, read-only)
- ProjectCount (int, read-only)
- CreatedAt (DateTime)

#### 4. New DTOs

**ProgramDashboardDto** - Aggregated program metrics:
- ProgramId
- ProgramName
- TotalProjects
- ActiveProjects
- CompletedProjects
- DelayedProjects
- OverallProgressPercentage
- BudgetVsActual (if budget tracking enabled)
- KeyRisks (list)
- UpcomingMilestones (list)

**ProgramProjectDto** - Project summary within program context:
- ProjectId
- ProjectName
- Status
- Progress
- StartDate
- EndDate
- EstimatedCost
- EstimatedFee

#### 5. CQRS Commands (New/Enhanced)

**ArchiveProgramCommand**:
- ProgramId
- ArchivedBy
- Reason (optional)

**GetProgramDashboardQuery**:
- ProgramId

**GetProgramProjectsQuery**:
- ProgramId
- Status (optional filter)

#### 6. Command Handlers (New/Enhanced)

**ArchiveProgramCommandHandler**:
- Validates program exists
- Checks if all projects are completed/archived
- Sets status to Archived
- Logs audit entry

**GetProgramDashboardQueryHandler**:
- Retrieves program details
- Aggregates project metrics
- Calculates overall progress
- Returns dashboard DTO

#### 7. Enhanced ProgramController

**File**: `backend/src/NJSAPI/Controllers/ProgramController.cs`

**New Endpoints**:
- `PATCH /api/program/{id}/archive` - Archive program
- `GET /api/program/{id}/dashboard` - Get program dashboard
- `GET /api/program/{id}/projects` - Get projects under program

**Enhanced Endpoints**:
- `POST /api/program` - Add Code validation
- `PUT /api/program/{id}` - Prevent Code modification

#### 8. Validation Rules

**ProgramValidator** (FluentValidation):
- Name: Required, max 255 characters
- Code: Required, alphanumeric + hyphens only, unique per tenant
- StartDate: Optional
- EndDate: Optional, must be after StartDate if both provided
- Budget: Optional, must be >= 0
- Status: Required, valid enum value

**ArchiveProgramValidator**:
- Program must exist
- All associated projects must be Completed or Archived

### Frontend Components

#### Folder Structure

```
frontend/src/
├── pages/
│   └── ProgramManagement/
│       ├── ProgramList.tsx
│       ├── ProgramDetails.tsx
│       └── ProgramDashboard.tsx
├── components/
│   └── ProgramManagement/
│       ├── CreateProgramDialog.tsx
│       ├── EditProgramDialog.tsx
│       ├── InitializeProgramButton.tsx
│       ├── ProgramStatusBadge.tsx
│       └── ProgramProjectsList.tsx
├── services/
│   └── api/
│       └── programApi.ts
└── types/
    └── program.ts
```

#### 1. ProgramList Component

**File**: `frontend/src/pages/ProgramManagement/ProgramList.tsx`

**Features**:
- Display programs in Material-UI DataGrid
- Filter by status
- Search by name/code
- Sort by various fields
- Actions: View, Edit, Archive, Delete
- Create new program button
- Navigate to program details on row click

#### 2. ProgramDetails Component

**File**: `frontend/src/pages/ProgramManagement/ProgramDetails.tsx`

**Features**:
- Display program metadata
- Show program dashboard metrics
- List associated projects
- **"Initialize Program" button to create new project**
- Edit program button
- Archive program button
- Breadcrumb navigation
- **Redirect here after program creation**

#### 3. ProgramDashboard Component

**File**: `frontend/src/pages/ProgramManagement/ProgramDashboard.tsx`

**Features**:
- Project status breakdown (pie chart)
- Overall progress indicator
- Budget vs Actual (if enabled)
- Key risks list
- Upcoming milestones timeline
- Quick actions

#### 4. CreateProgramDialog Component

**File**: `frontend/src/components/ProgramManagement/CreateProgramDialog.tsx`

**Features**:
- Form with all required fields
- Code auto-generation option
- Program manager selection
- Date pickers
- Validation feedback
- Submit/Cancel actions
- **On success: redirect to program details page**

#### 5. InitializeProgramButton Component (New)

**File**: `frontend/src/components/ProgramManagement/InitializeProgramButton.tsx`

**Features**:
- Button displayed on program details page
- Opens project creation dialog
- Pre-fills ProgramId (immutable)
- Disables program selection field
- Creates project under current program

#### 6. ProgramApi Service

**File**: `frontend/src/services/api/programApi.ts`

**Methods**:
- `getAll(status?: string): Promise<ProgramDto[]>`
- `getById(id: number): Promise<ProgramDto>`
- `create(program: CreateProgramDto): Promise<number>`
- `update(id: number, program: UpdateProgramDto): Promise<void>`
- `archive(id: number, reason?: string): Promise<void>`
- `delete(id: number): Promise<void>`
- `getDashboard(id: number): Promise<ProgramDashboardDto>`
- `getProjects(id: number, status?: string): Promise<ProgramProjectDto[]>`

## Data Models

### Database Schema Changes

#### Programs Table (Enhanced)

```sql
ALTER TABLE Programs
ADD Code NVARCHAR(50) NOT NULL DEFAULT '',
    Status INT NOT NULL DEFAULT 0,
    Budget DECIMAL(18,2) NULL,
    Tags NVARCHAR(MAX) NULL,
    ProgramManagerId NVARCHAR(450) NULL,
    CreatedAt DATETIME NOT NULL DEFAULT GETUTCDATE();

-- Add unique constraint on Code per tenant
ALTER TABLE Programs
ADD CONSTRAINT UQ_Programs_Code_TenantId UNIQUE (Code, TenantId);

-- Add foreign key to User
ALTER TABLE Programs
ADD CONSTRAINT FK_Programs_ProgramManager
FOREIGN KEY (ProgramManagerId) REFERENCES AspNetUsers(Id);

-- Add index on Status
CREATE INDEX IX_Programs_Status ON Programs(Status);

-- Add index on ProgramManagerId
CREATE INDEX IX_Programs_ProgramManagerId ON Programs(ProgramManagerId);
```

#### Projects Table (Validation)

```sql
-- Add check constraint to ensure ProgramId is not null
ALTER TABLE Projects
ADD CONSTRAINT CK_Projects_ProgramId_NotNull
CHECK (ProgramId IS NOT NULL);

-- Add index on ProgramId for faster queries
CREATE INDEX IX_Projects_ProgramId ON Projects(ProgramId);
```

### Entity Relationships

```
Program (1) ──────< (N) Project
   │
   │ (1)
   │
   └──────> (1) User (ProgramManager)
```

### Data Validation Rules

1. **Program Code**:
   - Format: Alphanumeric + hyphens
   - Unique per tenant
   - Immutable after creation
   - Max length: 50 characters

2. **Program Status**:
   - Valid values: Planned, Active, OnHold, Completed, Archived
   - Archived programs are read-only
   - Cannot archive if projects are not completed

3. **Program Budget**:
   - Optional field
   - Must be >= 0 if provided
   - Precision: 18,2

4. **Program-Project Association**:
   - Every project MUST have a ProgramId
   - ProgramId cannot be null
   - ProgramId is immutable after project creation (configurable)

5. **Date Validation**:
   - EndDate must be after StartDate if both provided
   - Dates are optional

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Required Fields Validation
*For any* program creation attempt, if any required field (Name, Code, Description, StartDate, Status) is missing, the system should reject the creation and return a validation error.
**Validates: Requirements 1.1**

### Property 2: Program Code Uniqueness Per Tenant
*For any* two programs within the same tenant, their Program Codes must be unique; attempting to create a program with a duplicate code should fail with a uniqueness violation error.
**Validates: Requirements 1.2, 8.1**

### Property 3: Optional Fields Acceptance
*For any* program creation with optional fields (EndDate, ProgramManager, Budget, Tags) omitted, the system should successfully create the program with those fields set to null.
**Validates: Requirements 1.3**

### Property 4: Status Enum Validation
*For any* program creation or update, the Status field must be one of the valid enum values (Planned, Active, OnHold, Completed, Archived); invalid status values should be rejected.
**Validates: Requirements 1.4**

### Property 5: Program Code Immutability
*For any* existing program, attempting to modify the Program Code field should either fail with an error or be silently ignored, ensuring the Code remains unchanged.
**Validates: Requirements 1.5**

### Property 6: Audit Logging for Program Changes
*For any* program modification (create, update, archive), an audit log entry should be created containing the user ID, timestamp, entity name, action type, and changed field values.
**Validates: Requirements 1.6, 9.1, 9.2, 9.3, 9.4**

### Property 7: Archived Program Read-Only
*For any* program with Status set to Archived, all modification attempts (update, delete) should be rejected, ensuring archived programs remain immutable.
**Validates: Requirements 1.7**

### Property 8: Deletion Prevention with Associated Projects
*For any* program that has one or more associated projects, deletion attempts should fail with an error indicating archival is required instead.
**Validates: Requirements 1.8, 3.5, 8.6**

### Property 9: Program Detail Display Completeness
*For any* program detail view, the rendered output should contain all required fields: Name, Code, Description, StartDate, EndDate, Status, Budget, and ProgramManager name.
**Validates: Requirements 2.1**

### Property 10: Associated Projects Display
*For any* program with N associated projects, the program detail view should display all N projects in the projects list.
**Validates: Requirements 2.2**

### Property 11: Project Status Aggregation
*For any* program with associated projects, the aggregated status indicators should correctly count projects by status (Active, Delayed, Completed, etc.) matching the actual project statuses.
**Validates: Requirements 2.3**

### Property 12: Mandatory Program Selection for Projects
*For any* project creation attempt without a ProgramId, the system should reject the creation and return a validation error indicating Program selection is required.
**Validates: Requirements 3.1, 3.2**

### Property 13: Program ID Foreign Key Constraint
*For any* project in the database, the ProgramId field must not be null and must reference a valid Program ID within the same tenant.
**Validates: Requirements 3.3, 8.2**

### Property 14: Project Program Association Immutability
*For any* existing project, attempting to modify the ProgramId field should either fail with an error or be silently ignored, ensuring the Program association remains unchanged.
**Validates: Requirements 3.4**

### Property 15: Archived Program Cascading Read-Only
*For any* project associated with an archived program, modification attempts should be rejected until the parent program is reactivated.
**Validates: Requirements 3.6**

### Property 16: Program Dashboard Project Count
*For any* program with N associated projects, the dashboard should display a total project count of exactly N.
**Validates: Requirements 4.1**

### Property 17: Program Dashboard Status Breakdown
*For any* program, the dashboard status breakdown should show counts for each status that sum to the total number of projects, with each count matching the actual number of projects in that status.
**Validates: Requirements 4.2**

### Property 18: Program Dashboard Progress Calculation
*For any* program with projects having progress percentages P1, P2, ..., Pn, the overall progress should be calculated as the weighted average: (P1 + P2 + ... + Pn) / n.
**Validates: Requirements 4.3**

### Property 19: Budget vs Actual Display
*For any* program with budget tracking enabled and budget data available, the dashboard should display both budgeted amount and actual amount with their difference.
**Validates: Requirements 4.4**

### Property 20: Risks and Milestones Aggregation
*For any* program, the dashboard should display all key risks and upcoming milestones from associated projects, aggregated and sorted by priority/date.
**Validates: Requirements 4.5**

### Property 21: Project Grouping by Program
*For any* project list view, projects should be grouped by their parent Program, with all projects under the same ProgramId appearing together.
**Validates: Requirements 5.1**

### Property 22: Program Name in Project List
*For any* project in a global project list, the response should include the Program name associated with that project.
**Validates: Requirements 5.2**

### Property 23: Project Filtering by Program
*For any* project list filtered by ProgramId X, only projects with ProgramId = X should be returned in the results.
**Validates: Requirements 5.3**

### Property 24: Program Name in Search Results
*For any* project search query that matches a program name, all projects under that program should be included in the search results.
**Validates: Requirements 5.4**

### Property 25: Default Project Sort Order
*For any* project list under a program, projects should be sorted first by Status (Active, Delayed, Completed) and then by StartDate in ascending order by default.
**Validates: Requirements 5.5**

### Property 26: Tenant Isolation for Programs
*For any* program API request, the system should only return or modify programs belonging to the authenticated user's tenant, preventing cross-tenant data access.
**Validates: Requirements 6.7, 7.1**

### Property 27: Role-Based Authorization for Program Operations
*For any* program create or edit operation, the system should verify the user has either Tenant Admin or Program Manager role; requests from users without these roles should be rejected.
**Validates: Requirements 7.2, 7.3**

### Property 28: Archive Authorization
*For any* program archive operation, the system should verify the user has Tenant Admin role; requests from users without this role should be rejected.
**Validates: Requirements 7.4**

### Property 29: Viewer Read-Only Access
*For any* write operation (create, update, delete, archive) attempted by a user with Viewer role, the system should reject the request with a forbidden error.
**Validates: Requirements 7.5**

### Property 30: Subscription Plan Limits
*For any* tenant with a maximum program limit of N, attempting to create program N+1 should fail with an error indicating the subscription limit has been reached.
**Validates: Requirements 7.7**

### Property 31: Program Code Format Validation
*For any* Program Code containing characters other than alphanumeric characters and hyphens, the system should reject the code with a validation error.
**Validates: Requirements 8.3**

### Property 32: Date Range Validation
*For any* program with both StartDate and EndDate provided, if EndDate is before or equal to StartDate, the system should reject the program with a validation error.
**Validates: Requirements 8.4**

### Property 33: Archive Prerequisite Validation
*For any* program archive attempt, if any associated project has a status other than Completed or Archived, the system should reject the archive operation with an error.
**Validates: Requirements 8.5**

## Error Handling

### Error Categories

1. **Validation Errors (400 Bad Request)**:
   - Missing required fields
   - Invalid field formats
   - Invalid enum values
   - Date range violations
   - Code format violations

2. **Authorization Errors (403 Forbidden)**:
   - Insufficient role permissions
   - Tenant isolation violations
   - Subscription limit exceeded

3. **Not Found Errors (404 Not Found)**:
   - Program ID does not exist
   - Referenced entities not found

4. **Conflict Errors (409 Conflict)**:
   - Duplicate Program Code within tenant
   - Duplicate Program Name within tenant
   - Cannot delete program with projects
   - Cannot archive program with active projects

5. **Server Errors (500 Internal Server Error)**:
   - Database connection failures
   - Unexpected exceptions
   - Transaction failures

### Error Response Format

All errors follow the standard EDR error response format:

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "code",
      "message": "Program code must contain only alphanumeric characters and hyphens"
    }
  ]
}
```

### Specific Error Messages

**Program Code Validation**:
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Invalid program code format",
  "errors": [
    {
      "field": "code",
      "message": "Program code must contain only alphanumeric characters and hyphens"
    }
  ]
}
```

**Duplicate Code**:
```json
{
  "success": false,
  "statusCode": 409,
  "message": "Program code already exists",
  "errors": [
    {
      "field": "code",
      "message": "A program with code 'PRG-2024-001' already exists in this tenant"
    }
  ]
}
```

**Cannot Delete with Projects**:
```json
{
  "success": false,
  "statusCode": 409,
  "message": "Cannot delete program with associated projects",
  "errors": [
    {
      "field": "id",
      "message": "Program has 5 associated projects. Please archive the program instead."
    }
  ]
}
```

**Cannot Archive with Active Projects**:
```json
{
  "success": false,
  "statusCode": 409,
  "message": "Cannot archive program with active projects",
  "errors": [
    {
      "field": "status",
      "message": "Program has 3 active projects. All projects must be completed or archived before archiving the program."
    }
  ]
}
```

**Insufficient Permissions**:
```json
{
  "success": false,
  "statusCode": 403,
  "message": "Insufficient permissions",
  "errors": [
    {
      "field": "authorization",
      "message": "User must have Tenant Admin or Program Manager role to create programs"
    }
  ]
}
```

## Testing Strategy

### Dual Testing Approach

The testing strategy employs both unit testing and property-based testing to ensure comprehensive coverage:

- **Unit Tests**: Verify specific examples, edge cases, and error conditions
- **Property Tests**: Verify universal properties across all inputs

Both types of tests are complementary and necessary for comprehensive coverage. Unit tests catch concrete bugs in specific scenarios, while property tests verify general correctness across a wide range of inputs.

### Property-Based Testing Configuration

**Library**: Use **FsCheck** for C# backend property-based testing

**Configuration**:
- Minimum 100 iterations per property test
- Each property test must reference its design document property
- Tag format: `[Property(Arbitrary = new[] { typeof(ProgramGenerators) })]`
- Comment format: `// Feature: program-management, Property {number}: {property_text}`

**Example Property Test**:

```csharp
[Property]
[Trait("Feature", "program-management")]
public Property Property2_ProgramCodeUniquenessPerTenant()
{
    // Feature: program-management, Property 2: Program Code Uniqueness Per Tenant
    // For any two programs within the same tenant, their Program Codes must be unique
    
    return Prop.ForAll<int, string, string>(
        (tenantId, code1, code2) =>
        {
            // Arrange: Create two programs with same code in same tenant
            var program1 = new Program { TenantId = tenantId, Code = code1, Name = "Program 1" };
            var program2 = new Program { TenantId = tenantId, Code = code1, Name = "Program 2" };
            
            // Act & Assert: Second creation should fail
            _repository.AddAsync(program1).Wait();
            Assert.ThrowsAsync<DbUpdateException>(() => _repository.AddAsync(program2));
        });
}
```

### Unit Testing Strategy

**Test Categories**:

1. **Controller Tests**:
   - Test each endpoint with valid inputs
   - Test authorization checks
   - Test error responses
   - Test tenant isolation

2. **Command/Query Handler Tests**:
   - Test business logic
   - Test validation rules
   - Test data transformations
   - Mock repository dependencies

3. **Repository Tests**:
   - Test CRUD operations
   - Test query filters
   - Test relationships
   - Use in-memory database

4. **Validation Tests**:
   - Test FluentValidation rules
   - Test all validation scenarios
   - Test error messages

5. **Integration Tests**:
   - Test end-to-end API flows
   - Test database transactions
   - Test audit logging
   - Use test database

### Frontend Testing Strategy

**Test Categories**:

1. **Component Tests** (React Testing Library):
   - Test component rendering
   - Test user interactions
   - Test form validation
   - Test API integration

2. **Service Tests** (Vitest):
   - Test API service methods
   - Test error handling
   - Test data transformations
   - Mock Axios responses

3. **E2E Tests** (Playwright):
   - Test complete user workflows
   - Test program creation flow
   - Test program dashboard
   - Test project-program association

### Test Coverage Requirements

- **Backend**: Minimum 80% code coverage
- **Frontend**: Minimum 80% code coverage
- **Property Tests**: All 33 properties must have corresponding tests
- **Unit Tests**: All edge cases and error conditions covered

### Performance Testing

While not part of property-based testing, performance tests should verify:
- Program listing API responds within 300ms for 1,000 programs
- Program dashboard loads within 500ms for 100 projects
- Audit log queries return within 500ms for 90 days of data

These should be separate performance test suites using tools like BenchmarkDotNet or k6.

## Deployment Considerations

### Database Migration

**Migration Script**: `AddProgramManagementEnhancements.cs`

```csharp
public partial class AddProgramManagementEnhancements : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // Add new columns to Programs table
        migrationBuilder.AddColumn<string>(
            name: "Code",
            table: "Programs",
            type: "nvarchar(50)",
            maxLength: 50,
            nullable: false,
            defaultValue: "");

        migrationBuilder.AddColumn<int>(
            name: "Status",
            table: "Programs",
            type: "int",
            nullable: false,
            defaultValue: 0);

        migrationBuilder.AddColumn<decimal>(
            name: "Budget",
            table: "Programs",
            type: "decimal(18,2)",
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "Tags",
            table: "Programs",
            type: "nvarchar(max)",
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "ProgramManagerId",
            table: "Programs",
            type: "nvarchar(450)",
            nullable: true);

        migrationBuilder.AddColumn<DateTime>(
            name: "CreatedAt",
            table: "Programs",
            type: "datetime2",
            nullable: false,
            defaultValueSql: "GETUTCDATE()");

        // Add unique constraint
        migrationBuilder.CreateIndex(
            name: "UQ_Programs_Code_TenantId",
            table: "Programs",
            columns: new[] { "Code", "TenantId" },
            unique: true);

        // Add foreign key
        migrationBuilder.CreateIndex(
            name: "IX_Programs_ProgramManagerId",
            table: "Programs",
            column: "ProgramManagerId");

        migrationBuilder.AddForeignKey(
            name: "FK_Programs_AspNetUsers_ProgramManagerId",
            table: "Programs",
            column: "ProgramManagerId",
            principalTable: "AspNetUsers",
            principalColumn: "Id",
            onDelete: ReferentialAction.Restrict);

        // Add status index
        migrationBuilder.CreateIndex(
            name: "IX_Programs_Status",
            table: "Programs",
            column: "Status");

        // Add check constraint for Projects.ProgramId
        migrationBuilder.Sql(
            "ALTER TABLE Projects ADD CONSTRAINT CK_Projects_ProgramId_NotNull CHECK (ProgramId IS NOT NULL)");

        // Add index on Projects.ProgramId
        migrationBuilder.CreateIndex(
            name: "IX_Projects_ProgramId",
            table: "Projects",
            column: "ProgramId");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        // Reverse all changes
        migrationBuilder.DropForeignKey(
            name: "FK_Programs_AspNetUsers_ProgramManagerId",
            table: "Programs");

        migrationBuilder.DropIndex(
            name: "UQ_Programs_Code_TenantId",
            table: "Programs");

        migrationBuilder.DropIndex(
            name: "IX_Programs_ProgramManagerId",
            table: "Programs");

        migrationBuilder.DropIndex(
            name: "IX_Programs_Status",
            table: "Programs");

        migrationBuilder.DropIndex(
            name: "IX_Projects_ProgramId",
            table: "Projects");

        migrationBuilder.Sql(
            "ALTER TABLE Projects DROP CONSTRAINT CK_Projects_ProgramId_NotNull");

        migrationBuilder.DropColumn(name: "Code", table: "Programs");
        migrationBuilder.DropColumn(name: "Status", table: "Programs");
        migrationBuilder.DropColumn(name: "Budget", table: "Programs");
        migrationBuilder.DropColumn(name: "Tags", table: "Programs");
        migrationBuilder.DropColumn(name: "ProgramManagerId", table: "Programs");
        migrationBuilder.DropColumn(name: "CreatedAt", table: "Programs");
    }
}
```

### Deployment Checklist

1. **Pre-Deployment**:
   - [ ] All tests passing (unit + property + integration)
   - [ ] Code coverage ≥ 80%
   - [ ] Code review approved
   - [ ] Database backup created

2. **Deployment Steps**:
   - [ ] Run database migration
   - [ ] Deploy backend API
   - [ ] Deploy frontend application
   - [ ] Verify API endpoints
   - [ ] Verify frontend loads

3. **Post-Deployment Verification**:
   - [ ] Test program creation
   - [ ] Test program listing
   - [ ] Test program dashboard
   - [ ] Test project-program association
   - [ ] Verify audit logging
   - [ ] Check performance metrics

4. **Rollback Procedure**:
   - [ ] Revert database migration
   - [ ] Redeploy previous backend version
   - [ ] Redeploy previous frontend version
   - [ ] Verify system functionality

### Monitoring and Alerts

**Metrics to Monitor**:
- API response times (program endpoints)
- Database query performance
- Error rates
- Audit log volume
- User activity (program creation/updates)

**Alerts**:
- API response time > 500ms
- Error rate > 1%
- Database connection failures
- Audit log write failures

## Security Considerations

### Authentication
- All program endpoints require JWT Bearer token
- Token expiration: 3 hours
- Token validation on every request

### Authorization
- Role-based access control (RBAC)
- Tenant isolation enforced at data layer
- Permission checks before operations

### Data Protection
- Sensitive data encrypted at rest
- HTTPS for all API communication
- SQL injection prevention via parameterized queries
- XSS prevention via input sanitization

### Audit Trail
- All program operations logged
- User ID, timestamp, IP address captured
- Old/new values recorded for updates
- Immutable audit log

## Performance Optimization

### Database Optimization
- Indexes on frequently queried columns
- Efficient query patterns (avoid N+1)
- Connection pooling
- Query result caching (future)

### API Optimization
- Response compression enabled
- Pagination for large result sets (future)
- Async/await throughout
- Minimal data transfer (DTOs)

### Frontend Optimization
- Code splitting
- Lazy loading of components
- Memoization of expensive calculations
- Virtual scrolling for large lists (future)

## Future Enhancements

1. **Cross-Program Analytics**: Portfolio-level reporting across multiple programs
2. **Program Templates**: Reusable program templates with predefined structure
3. **Program Dependencies**: Track dependencies between programs
4. **Advanced Dashboards**: Customizable dashboard widgets
5. **Export/Import**: Bulk program data export/import
6. **Program Notifications**: Email/SMS notifications for program events
7. **Program Workflows**: Approval workflows for program changes
8. **Resource Planning**: Cross-program resource allocation
9. **Financial Forecasting**: AI-driven budget forecasting
10. **Risk Management**: Program-level risk tracking and mitigation

---

**Document Version**: 1.0  
**Last Updated**: January 16, 2026  
**Status**: Ready for Review
