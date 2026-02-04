# Technical Design Document - Project Budget Change Tracking

## Overview

This feature implements automatic tracking of budget changes for the Project entity, specifically monitoring changes to `EstimatedProjectCost` and `EstimatedProjectFee` fields. The solution follows the existing audit pattern established in the EDR system and integrates seamlessly with the current CQRS architecture.

## Architecture

### System Integration Points
- **Project Entity**: Existing entity with budget fields
- **Audit System**: Leverages existing audit infrastructure
- **CQRS Pattern**: Uses MediatR for commands and queries
- **Repository Pattern**: Follows established data access patterns
- **Authentication**: Integrates with existing JWT authentication

### Data Flow
```
User Updates Project Budget → Command Handler → Repository → Database Transaction
                                    ↓
                            Audit Interceptor → Budget Change History
                                    ↓
                            Response with History Record
```

## Components and Interfaces

### 1. Database Layer

#### New Entity: ProjectBudgetChangeHistory
```csharp
public class ProjectBudgetChangeHistory : IAuditableEntity
{
    public int Id { get; set; }
    public int ProjectId { get; set; }
    public string FieldName { get; set; } // "EstimatedProjectCost" or "EstimatedProjectFee"
    public decimal OldValue { get; set; }
    public decimal NewValue { get; set; }
    public decimal Variance { get; set; } // NewValue - OldValue
    public decimal PercentageVariance { get; set; } // (Variance / OldValue) * 100
    public string Currency { get; set; }
    public string ChangedBy { get; set; }
    public DateTime ChangedDate { get; set; }
    public string Reason { get; set; } // Optional, max 500 chars
    
    // Navigation Properties
    public virtual Project Project { get; set; }
    public virtual User ChangedByUser { get; set; }
}
```

#### Database Schema
```sql
CREATE TABLE ProjectBudgetChangeHistory (
    Id INT PRIMARY KEY IDENTITY(1,1),
    ProjectId INT NOT NULL,
    FieldName NVARCHAR(50) NOT NULL,
    OldValue DECIMAL(18,2) NOT NULL,
    NewValue DECIMAL(18,2) NOT NULL,
    Variance DECIMAL(18,2) NOT NULL,
    PercentageVariance DECIMAL(10,4) NOT NULL,
    Currency NVARCHAR(10) NOT NULL,
    ChangedBy NVARCHAR(450) NOT NULL,
    ChangedDate DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    Reason NVARCHAR(500) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy NVARCHAR(450) NULL,
    LastModifiedAt DATETIME2 NULL,
    LastModifiedBy NVARCHAR(450) NULL,
    
    CONSTRAINT FK_ProjectBudgetChangeHistory_Project 
        FOREIGN KEY (ProjectId) REFERENCES Project(Id),
    CONSTRAINT FK_ProjectBudgetChangeHistory_ChangedBy 
        FOREIGN KEY (ChangedBy) REFERENCES AspNetUsers(Id),
    CONSTRAINT CK_ProjectBudgetChangeHistory_FieldName
        CHECK (FieldName IN ('EstimatedProjectCost', 'EstimatedProjectFee')),
    CONSTRAINT CK_ProjectBudgetChangeHistory_ValueChange
        CHECK (OldValue != NewValue)
);

-- Indexes for performance
CREATE INDEX IX_ProjectBudgetChangeHistory_ProjectId 
    ON ProjectBudgetChangeHistory(ProjectId);
CREATE INDEX IX_ProjectBudgetChangeHistory_ChangedDate 
    ON ProjectBudgetChangeHistory(ChangedDate DESC);
CREATE INDEX IX_ProjectBudgetChangeHistory_FieldName 
    ON ProjectBudgetChangeHistory(FieldName);
```

### 2. Backend API Layer

#### CQRS Commands
```csharp
// Command for updating project budget with tracking
public class UpdateProjectBudgetCommand : IRequest<ProjectBudgetUpdateResult>
{
    public int ProjectId { get; set; }
    public decimal? EstimatedProjectCost { get; set; }
    public decimal? EstimatedProjectFee { get; set; }
    public string Reason { get; set; }
    public string UpdatedBy { get; set; }
}

// Query for retrieving budget change history
public class GetProjectBudgetHistoryQuery : IRequest<List<ProjectBudgetChangeHistoryDto>>
{
    public int ProjectId { get; set; }
    public string FieldName { get; set; } // Optional filter
    public int? PageNumber { get; set; }
    public int? PageSize { get; set; }
}
```

#### API Endpoints
```csharp
[ApiController]
[Route("api/projects/{projectId}/budget")]
[Authorize]
public class ProjectBudgetController : ControllerBase
{
    // Update project budget with automatic history tracking
    [HttpPut]
    public async Task<IActionResult> UpdateBudget(int projectId, UpdateProjectBudgetRequest request)
    
    // Get budget change history for a project
    [HttpGet("history")]
    public async Task<IActionResult> GetBudgetHistory(int projectId, [FromQuery] string fieldName = null)
    
    // Get budget variance summary
    [HttpGet("variance-summary")]
    public async Task<IActionResult> GetBudgetVarianceSummary(int projectId)
}
```

### 3. Frontend Components

#### React Components Structure
```typescript
// Main budget history component
export const ProjectBudgetHistory: React.FC<{projectId: number}>

// Timeline visualization component
export const BudgetChangeTimeline: React.FC<{changes: BudgetChangeHistory[]}>

// Budget update dialog with reason field
export const BudgetUpdateDialog: React.FC<{project: Project, onUpdate: Function}>

// Variance indicator component
export const VarianceIndicator: React.FC<{variance: number, percentage: number}>
```

#### TypeScript Interfaces
```typescript
export interface ProjectBudgetChangeHistory {
    id: number;
    projectId: number;
    fieldName: 'EstimatedProjectCost' | 'EstimatedProjectFee';
    oldValue: number;
    newValue: number;
    variance: number;
    percentageVariance: number;
    currency: string;
    changedBy: string;
    changedByUser: {
        firstName: string;
        lastName: string;
        email: string;
    };
    changedDate: string;
    reason?: string;
}

export interface UpdateProjectBudgetRequest {
    estimatedProjectCost?: number;
    estimatedProjectFee?: number;
    reason?: string;
}
```

## Data Models

### DTOs for API Communication
```csharp
public class ProjectBudgetChangeHistoryDto
{
    public int Id { get; set; }
    public int ProjectId { get; set; }
    public string FieldName { get; set; }
    public decimal OldValue { get; set; }
    public decimal NewValue { get; set; }
    public decimal Variance { get; set; }
    public decimal PercentageVariance { get; set; }
    public string Currency { get; set; }
    public string ChangedBy { get; set; }
    public UserDto ChangedByUser { get; set; }
    public DateTime ChangedDate { get; set; }
    public string Reason { get; set; }
}

public class ProjectBudgetUpdateResult
{
    public bool Success { get; set; }
    public string Message { get; set; }
    public List<ProjectBudgetChangeHistoryDto> CreatedHistoryRecords { get; set; }
}
```

## Error Handling

### Validation Rules
- Project must exist and user must have update permissions
- At least one budget field must be provided for update
- New values must be different from current values
- Reason field limited to 500 characters
- Currency must match project currency

### Error Responses
```csharp
public class BudgetUpdateException : Exception
{
    public string ErrorCode { get; set; }
    public Dictionary<string, string> ValidationErrors { get; set; }
}

// Error codes:
// BUDGET_NO_CHANGES - No actual changes detected
// BUDGET_INVALID_VALUES - Invalid budget values provided
// BUDGET_PERMISSION_DENIED - User lacks update permissions
// BUDGET_PROJECT_NOT_FOUND - Project does not exist
```

## Testing Strategy

### Unit Tests
- Command handler logic for budget updates
- History record creation and calculation
- Validation rules and error handling
- Repository operations

### Integration Tests
- API endpoint functionality
- Database transaction integrity
- Authentication and authorization
- Performance under load

### Frontend Tests
- Component rendering with mock data
- User interaction flows
- API integration
- Responsive design validation

## Performance Considerations

### Database Optimization
- Indexed queries on ProjectId and ChangedDate
- Pagination for large history datasets
- Efficient variance calculations
- Connection pooling for concurrent updates

### API Performance
- Response caching for read-only history data
- Async operations for all database calls
- Bulk operations for multiple field updates
- Response compression for large datasets

### Frontend Performance
- Virtual scrolling for large history lists
- Debounced search and filtering
- Lazy loading of user details
- Optimized re-rendering with React.memo

## Security Measures

### Authentication & Authorization
- JWT token validation for all endpoints
- Role-based access control for budget updates
- Audit logging of all budget changes
- IP address tracking for security

### Data Protection
- Input sanitization and validation
- SQL injection prevention through parameterized queries
- XSS protection in frontend components
- Sensitive data encryption at rest

## Deployment Strategy

### Database Migration
- EF Core migration for new table creation
- Index creation for performance
- Data seeding for lookup values
- Rollback scripts for emergency recovery

### API Deployment
- Backward compatible API changes
- Feature flags for gradual rollout
- Health checks for new endpoints
- Monitoring and alerting setup

### Frontend Deployment
- Progressive enhancement approach
- Feature detection for new components
- Graceful degradation for older browsers
- CDN optimization for static assets