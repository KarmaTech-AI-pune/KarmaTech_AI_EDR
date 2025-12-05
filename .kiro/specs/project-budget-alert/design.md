# Technical Design - Project Budget Alert Threshold

## Overview

This feature implements an automated budget monitoring system that tracks project costs against estimated budgets and generates alerts when predefined thresholds are exceeded. The system integrates with existing Project and MonthlyProgress entities to provide real-time budget health monitoring.

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  - ProjectBudgetHealthIndicator.tsx (React Component)       │
│  - BudgetAlertList.tsx (Alert History Display)             │
│  - projectBudgetApi.ts (API Service)                        │
└──────────────────┬──────────────────────────────────────────┘
                   │ HTTPS/REST API
┌──────────────────┴──────────────────────────────────────────┐
│                  APPLICATION LAYER                           │
│  - CheckProjectBudgetCommand (CQRS)                         │
│  - GetProjectBudgetAlertsQuery (CQRS)                       │
│  - BudgetAlertService (Business Logic)                      │
│  - ProjectBudgetController (API)                            │
└──────────────────┬──────────────────────────────────────────┘
                   │ Repository Pattern
┌──────────────────┴──────────────────────────────────────────┐
│                    DATA LAYER                                │
│  - ProjectBudgetAlert (Entity)                              │
│  - IProjectBudgetAlertRepository (Interface)                │
│  - ProjectBudgetAlertRepository (Implementation)            │
│  - SQL Server Database                                      │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Database Entity

**ProjectBudgetAlert Entity:**
```csharp
public class ProjectBudgetAlert : BaseEntity
{
    public int Id { get; set; }
    public int ProjectId { get; set; }
    public string AlertLevel { get; set; } // "Warning" or "Critical"
    public decimal ThresholdPercentage { get; set; }
    public decimal EstimatedBudget { get; set; }
    public decimal ActualCost { get; set; }
    public DateTime AlertDate { get; set; }
    public bool IsAcknowledged { get; set; }
    public string AcknowledgedBy { get; set; }
    public DateTime? AcknowledgedDate { get; set; }
    
    // Navigation
    public virtual Project Project { get; set; }
}
```

### 2. Repository Interface

```csharp
public interface IProjectBudgetAlertRepository : IRepository<ProjectBudgetAlert>
{
    Task<IEnumerable<ProjectBudgetAlert>> GetByProjectIdAsync(int projectId);
    Task<ProjectBudgetAlert> GetLatestAlertAsync(int projectId, string alertLevel);
    Task<IEnumerable<ProjectBudgetAlert>> GetUnacknowledgedAlertsAsync();
    Task<bool> HasRecentAlertAsync(int projectId, string alertLevel, DateTime since);
}
```

### 3. CQRS Commands and Queries

**CheckProjectBudgetCommand:**
```csharp
public class CheckProjectBudgetCommand : IRequest<BudgetCheckResultDto>
{
    public int ProjectId { get; set; }
}
```

**GetProjectBudgetAlertsQuery:**
```csharp
public class GetProjectBudgetAlertsQuery : IRequest<IEnumerable<ProjectBudgetAlertDto>>
{
    public int ProjectId { get; set; }
    public string AlertLevel { get; set; } // Optional filter
    public DateTime? FromDate { get; set; } // Optional filter
    public DateTime? ToDate { get; set; } // Optional filter
}
```

### 4. API Endpoints

```
GET    /api/projects/{projectId}/budget/alerts
GET    /api/projects/{projectId}/budget/health
POST   /api/projects/{projectId}/budget/check
PATCH  /api/projects/{projectId}/budget/alerts/{alertId}/acknowledge
```

## Data Models

### Database Schema

```sql
CREATE TABLE ProjectBudgetAlert (
    Id INT PRIMARY KEY IDENTITY(1,1),
    ProjectId INT NOT NULL,
    AlertLevel NVARCHAR(20) NOT NULL,
    ThresholdPercentage DECIMAL(5,2) NOT NULL,
    EstimatedBudget DECIMAL(18,2) NOT NULL,
    ActualCost DECIMAL(18,2) NOT NULL,
    AlertDate DATETIME NOT NULL DEFAULT GETUTCDATE(),
    IsAcknowledged BIT NOT NULL DEFAULT 0,
    AcknowledgedBy NVARCHAR(450) NULL,
    AcknowledgedDate DATETIME NULL,
    CreatedAt DATETIME NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME NULL,
    CreatedBy NVARCHAR(450) NULL,
    UpdatedBy NVARCHAR(450) NULL,
    
    CONSTRAINT FK_ProjectBudgetAlert_Project 
        FOREIGN KEY (ProjectId) REFERENCES Project(ProjectId)
        ON DELETE CASCADE,
    CONSTRAINT FK_ProjectBudgetAlert_AcknowledgedBy
        FOREIGN KEY (AcknowledgedBy) REFERENCES AspNetUsers(Id),
    CONSTRAINT CK_ProjectBudgetAlert_Level
        CHECK (AlertLevel IN ('Warning', 'Critical')),
    CONSTRAINT CK_ProjectBudgetAlert_Threshold
        CHECK (ThresholdPercentage > 0 AND ThresholdPercentage <= 200)
);

CREATE INDEX IX_ProjectBudgetAlert_ProjectId 
    ON ProjectBudgetAlert(ProjectId);
CREATE INDEX IX_ProjectBudgetAlert_AlertDate 
    ON ProjectBudgetAlert(AlertDate DESC);
CREATE INDEX IX_ProjectBudgetAlert_IsAcknowledged
    ON ProjectBudgetAlert(IsAcknowledged)
    WHERE IsAcknowledged = 0;
```

### DTOs

**BudgetCheckResultDto:**
```csharp
public class BudgetCheckResultDto
{
    public int ProjectId { get; set; }
    public decimal EstimatedBudget { get; set; }
    public decimal ActualCost { get; set; }
    public decimal UtilizationPercentage { get; set; }
    public string HealthStatus { get; set; } // "Healthy", "Warning", "Critical"
    public bool AlertCreated { get; set; }
    public ProjectBudgetAlertDto Alert { get; set; }
}
```

**ProjectBudgetAlertDto:**
```csharp
public class ProjectBudgetAlertDto
{
    public int Id { get; set; }
    public int ProjectId { get; set; }
    public string AlertLevel { get; set; }
    public decimal ThresholdPercentage { get; set; }
    public decimal EstimatedBudget { get; set; }
    public decimal ActualCost { get; set; }
    public decimal UtilizationPercentage { get; set; }
    public DateTime AlertDate { get; set; }
    public bool IsAcknowledged { get; set; }
    public string AcknowledgedBy { get; set; }
    public DateTime? AcknowledgedDate { get; set; }
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Budget Threshold Detection
*For any* project with actual costs and estimated budget, when actual costs reach or exceed 90% of estimated budget, the system should create a warning alert.
**Validates: Requirements 1.2**

### Property 2: Critical Alert Creation
*For any* project with actual costs exceeding 100% of estimated budget, the system should create a critical alert.
**Validates: Requirements 1.3**

### Property 3: Duplicate Alert Prevention
*For any* project and alert level, creating an alert within 24 hours of a previous alert of the same level should be prevented.
**Validates: Requirements 1.5**

### Property 4: Budget Calculation Accuracy
*For any* project, the calculated actual cost should equal the sum of all monthly progress actual costs for that project.
**Validates: Requirements 4.1, 4.3**

### Property 5: Alert Retrieval Ordering
*For any* project with multiple alerts, retrieving alerts should return them ordered by alert date descending (newest first).
**Validates: Requirements 2.1**

### Property 6: Health Status Consistency
*For any* project, the health status indicator should match the budget utilization: green (<90%), yellow (90-100%), red (>100%).
**Validates: Requirements 3.2, 3.3, 3.4**

## Error Handling

### Expected Errors

1. **Project Not Found (404)**
   - When checking budget for non-existent project
   - Return: `{ "success": false, "message": "Project not found" }`

2. **Invalid Threshold (400)**
   - When threshold percentage is invalid (<0 or >200)
   - Return: `{ "success": false, "message": "Invalid threshold percentage" }`

3. **No Budget Data (422)**
   - When project has no estimated budget set
   - Return: `{ "success": false, "message": "Project has no estimated budget" }`

4. **Unauthorized (403)**
   - When user lacks permission to view project budget
   - Return: `{ "success": false, "message": "Insufficient permissions" }`

### Error Logging

All errors should be logged with:
- Error level (Warning, Error, Critical)
- Project ID
- User ID
- Timestamp
- Stack trace (for exceptions)

## Testing Strategy

### Unit Tests

**Backend:**
- `CheckProjectBudgetHandler` - Test budget calculation logic
- `BudgetAlertService` - Test alert creation rules
- `ProjectBudgetAlertRepository` - Test data access
- Coverage target: ≥85%

**Frontend:**
- `ProjectBudgetHealthIndicator` - Test status display
- `BudgetAlertList` - Test alert rendering
- `projectBudgetApi` - Test API calls
- Coverage target: ≥80%

### Integration Tests

- Test budget check API endpoint with real database
- Test alert creation when monthly progress is updated
- Test alert retrieval with filters
- Test acknowledgment workflow

### Property-Based Tests

Using **FsCheck** for C# property-based testing:

**Property Test 1: Threshold Detection**
```csharp
[Property]
public Property BudgetThresholdDetection_CreatesWarningAt90Percent()
{
    return Prop.ForAll<decimal, decimal>(
        (estimatedBudget, actualCost) =>
        {
            // Arrange: Generate valid budget values
            var validEstimated = Math.Abs(estimatedBudget) + 1000;
            var validActual = validEstimated * 0.9m;
            
            // Act: Check budget
            var result = _service.CheckBudget(projectId, validEstimated, validActual);
            
            // Assert: Should create warning alert
            return result.AlertCreated && result.Alert.AlertLevel == "Warning";
        }
    ).When(estimatedBudget > 0);
}
```

**Property Test 2: Duplicate Prevention**
```csharp
[Property]
public Property DuplicateAlertPrevention_WithinSameDay()
{
    return Prop.ForAll<int>(projectId =>
    {
        // Arrange: Create first alert
        var firstAlert = _service.CreateAlert(projectId, "Warning", 90, 1000, 900);
        
        // Act: Try to create duplicate within 24 hours
        var secondAlert = _service.CreateAlert(projectId, "Warning", 90, 1000, 900);
        
        // Assert: Second alert should not be created
        return secondAlert == null;
    });
}
```

### Performance Tests

- Budget check should complete in <200ms
- Alert retrieval should complete in <100ms
- Bulk budget checks (100 projects) should complete in <5s

### Test Execution

- Run tests automatically before PR creation
- Generate coverage report
- Include test results in PR description
- Minimum 80% coverage required to merge
