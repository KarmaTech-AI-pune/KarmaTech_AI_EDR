---
inclusion: always
---

# Complete AI-DLC Implementation Guide for EDR

## Overview

This guide provides the complete framework for implementing AI-Driven Development Lifecycle (AI-DLC) in the EDR project using Kiro. All generated code must follow the established patterns and standards defined in the steering files.

## Required Steering Files Reference

Before implementing any feature, ensure you have reviewed:

1. **edr-aidlc-7steps.md** - The 7-step AI-DLC process
2. **coding-standards.md** - C#, TypeScript, and database coding standards
3. **architecture-patterns.md** - System architecture and design patterns
4. **database-schema-patterns.md** - Database design and EF Core patterns
5. **api-documentation-patterns.md** - RESTful API design and documentation

## AI-DLC Feature Implementation Checklist

### Pre-Implementation Requirements ✅

Before starting any feature implementation, verify:

- [ ] Feature request is clearly defined with acceptance criteria
- [ ] All steering files are current and accessible
- [ ] Development environment is set up correctly
- [ ] Database connection is working
- [ ] Authentication system is functional

### Step 1: Requirement Analysis ✅

**Input**: Feature request from stakeholder
**Output**: `REQUIREMENT_ANALYSIS_[FEATURE-ID].md`

**Tasks**:
- [ ] Parse and understand the business requirement
- [ ] Identify affected systems and modules
- [ ] Define functional and non-functional requirements
- [ ] Establish acceptance criteria
- [ ] Document assumptions and constraints
- [ ] Identify integration points with existing features

**Quality Gates**:
- [ ] Requirements are clear and unambiguous
- [ ] Acceptance criteria are testable
- [ ] All dependencies are identified
- [ ] Business value is clearly articulated

### Step 2: Impact Analysis ✅

**Input**: Requirement analysis document
**Output**: `IMPACT_ANALYSIS_[FEATURE-ID].md`

**Tasks**:
- [ ] Analyze existing codebase for similar patterns
- [ ] Identify all files that need modification
- [ ] Map database schema changes required
- [ ] Assess API endpoint changes needed
- [ ] Evaluate frontend component impacts
- [ ] Identify potential breaking changes
- [ ] Estimate development effort

**Quality Gates**:
- [ ] All affected components identified
- [ ] Risk assessment completed
- [ ] Breaking changes documented
- [ ] Migration strategy defined (if needed)

### Step 3: Technical Design ✅

**Input**: Impact analysis document
**Output**: `TECHNICAL_DESIGN_[FEATURE-ID].md`

**Tasks**:
- [ ] Design database schema following EDR patterns
- [ ] Design API endpoints following RESTful standards
- [ ] Design frontend components following React patterns
- [ ] Plan testing strategy (unit, integration, E2E)
- [ ] Define performance requirements
- [ ] Design security measures
- [ ] Plan deployment strategy

**Quality Gates**:
- [ ] Design follows established architecture patterns
- [ ] Database design follows naming conventions
- [ ] API design follows RESTful standards
- [ ] Security requirements addressed
- [ ] Performance targets defined

### Step 4: Implementation ✅

**Input**: Approved technical design
**Output**: Complete, tested code implementation

#### Backend Implementation Tasks:
- [ ] Create/update database entities following BaseEntity pattern
- [ ] Generate EF Core migrations with proper naming
- [ ] Implement repositories following Repository pattern
- [ ] Create CQRS commands and queries using MediatR
- [ ] Implement API controllers following RESTful standards
- [ ] Add proper error handling and logging
- [ ] Implement authentication and authorization
- [ ] Add input validation using FluentValidation

#### Frontend Implementation Tasks:
- [ ] Create TypeScript interfaces for API contracts
- [ ] Implement API service layer using Axios
- [ ] Create React components following established patterns
- [ ] Implement proper state management
- [ ] Add form validation using Formik/Yup
- [ ] Implement proper error handling
- [ ] Add loading states and user feedback
- [ ] Ensure responsive design using Material-UI

**Quality Gates**:
- [ ] Code follows all coding standards
- [ ] No compilation errors or warnings
- [ ] All dependencies properly injected
- [ ] Proper error handling implemented
- [ ] Security measures in place

### Step 5: Testing ✅

**Input**: Implemented code
**Output**: `TEST_REPORT_[FEATURE-ID].md` + `COVERAGE_REPORT.md`

#### Backend Testing Tasks:
- [ ] Write unit tests for all business logic (≥80% coverage)
- [ ] Write integration tests for API endpoints
- [ ] Test database operations and migrations
- [ ] Test authentication and authorization
- [ ] Test error scenarios and edge cases
- [ ] Performance testing for critical operations

#### Frontend Testing Tasks:
- [ ] Write unit tests for components and utilities
- [ ] Write integration tests for user workflows
- [ ] Test API integration and error handling
- [ ] Test responsive design across devices
- [ ] Test accessibility compliance
- [ ] Cross-browser compatibility testing

**Quality Gates**:
- [ ] All tests pass (100% success rate)
- [ ] Code coverage ≥80%
- [ ] Performance requirements met
- [ ] Security vulnerabilities addressed
- [ ] Accessibility standards met

### Step 6: Code Quality & Optimization ✅

**Input**: Tested implementation
**Output**: `CODE_QUALITY_REPORT_[FEATURE-ID].md`

**Tasks**:
- [ ] Code review against established standards
- [ ] Performance optimization where needed
- [ ] Security vulnerability scanning
- [ ] Code duplication analysis and refactoring
- [ ] Documentation updates (API docs, README, etc.)
- [ ] Database query optimization
- [ ] Frontend bundle size optimization

**Quality Gates**:
- [ ] Code review approved
- [ ] No critical security vulnerabilities
- [ ] Performance benchmarks met
- [ ] Documentation updated
- [ ] No code duplication issues

### Step 7: Deployment Package ✅

**Input**: Quality-approved implementation
**Output**: `DEPLOYMENT_PACKAGE_[FEATURE-ID].md`

**Tasks**:
- [ ] Create database migration scripts
- [ ] Create rollback procedures
- [ ] Update environment configurations
- [ ] Create deployment checklist
- [ ] Prepare monitoring and alerting
- [ ] Document post-deployment verification steps
- [ ] Create user documentation (if needed)

**Quality Gates**:
- [ ] Deployment scripts tested
- [ ] Rollback procedures verified
- [ ] Monitoring configured
- [ ] Documentation complete
- [ ] Stakeholder approval obtained

## Code Generation Standards

### Backend Code Generation

When generating C# backend code, ensure:

```csharp
// ✅ Entity Example
public class ProjectStatusHistory : BaseEntity
{
    public int Id { get; set; }
    public int ProjectId { get; set; }
    public string OldStatus { get; set; }
    public string NewStatus { get; set; }
    public string ChangedBy { get; set; }
    public DateTime ChangedDate { get; set; } = DateTime.UtcNow;
    public string Reason { get; set; }
    
    // Navigation properties
    public virtual Project Project { get; set; }
}

// ✅ Repository Example
public interface IProjectStatusHistoryRepository : IRepository<ProjectStatusHistory>
{
    Task<IEnumerable<ProjectStatusHistory>> GetByProjectIdAsync(int projectId);
    Task<ProjectStatusHistory> CreateAsync(ProjectStatusHistory history);
}

// ✅ CQRS Command Example
public class ChangeProjectStatusCommand : IRequest<ProjectStatusHistoryDto>
{
    public int ProjectId { get; set; }
    public string NewStatus { get; set; }
    public string Reason { get; set; }
    public string ChangedBy { get; set; }
}

// ✅ API Controller Example
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProjectStatusController : ControllerBase
{
    private readonly IMediator _mediator;
    
    public ProjectStatusController(IMediator mediator)
    {
        _mediator = mediator;
    }
    
    [HttpPost("{projectId}/status")]
    public async Task<IActionResult> ChangeStatus(int projectId, ChangeProjectStatusRequest request)
    {
        var command = new ChangeProjectStatusCommand
        {
            ProjectId = projectId,
            NewStatus = request.NewStatus,
            Reason = request.Reason,
            ChangedBy = User.Identity.Name
        };
        
        var result = await _mediator.Send(command);
        return Ok(new { success = true, data = result });
    }
}
```

### Frontend Code Generation

When generating TypeScript/React code, ensure:

```typescript
// ✅ Type Definitions
export interface ProjectStatusHistory {
    id: number;
    projectId: number;
    oldStatus: string;
    newStatus: string;
    changedBy: string;
    changedDate: string;
    reason?: string;
}

export interface ChangeProjectStatusRequest {
    newStatus: string;
    reason?: string;
}

// ✅ API Service
export const projectStatusApi = {
    changeStatus: async (projectId: number, request: ChangeProjectStatusRequest): Promise<ProjectStatusHistory> => {
        const response = await axios.post<ApiResponse<ProjectStatusHistory>>(
            `/api/projectstatus/${projectId}/status`,
            request
        );
        return response.data.data;
    },
    
    getHistory: async (projectId: number): Promise<ProjectStatusHistory[]> => {
        const response = await axios.get<ApiResponse<ProjectStatusHistory[]>>(
            `/api/projectstatus/${projectId}/history`
        );
        return response.data.data;
    }
};

// ✅ React Component
interface ProjectStatusHistoryProps {
    projectId: number;
}

export const ProjectStatusHistory: React.FC<ProjectStatusHistoryProps> = ({ projectId }) => {
    const [history, setHistory] = useState<ProjectStatusHistory[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadHistory();
    }, [projectId]);

    const loadHistory = async () => {
        setLoading(true);
        try {
            const data = await projectStatusApi.getHistory(projectId);
            setHistory(data);
        } catch (err) {
            setError('Failed to load status history');
            console.error('Error loading history:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Timeline>
            {history.map((item) => (
                <TimelineItem key={item.id}>
                    <TimelineContent>
                        <Typography variant="h6">
                            {item.oldStatus} → {item.newStatus}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            by {item.changedBy} on {formatDate(item.changedDate)}
                        </Typography>
                        {item.reason && (
                            <Typography variant="body2">{item.reason}</Typography>
                        )}
                    </TimelineContent>
                </TimelineItem>
            ))}
        </Timeline>
    );
};
```

### Database Schema Generation

When generating database schemas, ensure:

```sql
-- ✅ Table Creation
CREATE TABLE ProjectStatusHistory (
    Id INT PRIMARY KEY IDENTITY(1,1),
    ProjectId INT NOT NULL,
    OldStatus NVARCHAR(50) NOT NULL,
    NewStatus NVARCHAR(50) NOT NULL,
    ChangedBy NVARCHAR(450) NOT NULL,
    ChangedDate DATETIME NOT NULL DEFAULT GETUTCDATE(),
    Reason NVARCHAR(500) NULL,
    CreatedAt DATETIME NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME NULL,
    CreatedBy NVARCHAR(450) NULL,
    UpdatedBy NVARCHAR(450) NULL,
    
    CONSTRAINT FK_ProjectStatusHistory_Project 
        FOREIGN KEY (ProjectId) REFERENCES Project(ProjectId),
    CONSTRAINT FK_ProjectStatusHistory_ChangedBy 
        FOREIGN KEY (ChangedBy) REFERENCES AspNetUsers(Id),
    CONSTRAINT CK_ProjectStatusHistory_StatusChange
        CHECK (OldStatus != NewStatus)
);

-- ✅ Indexes
CREATE INDEX IX_ProjectStatusHistory_ProjectId 
    ON ProjectStatusHistory(ProjectId);
CREATE INDEX IX_ProjectStatusHistory_ChangedDate 
    ON ProjectStatusHistory(ChangedDate DESC);
```

## Quality Assurance Checklist

### Code Quality ✅
- [ ] Follows SOLID principles
- [ ] No code duplication (DRY)
- [ ] Clear and meaningful naming
- [ ] Proper error handling
- [ ] Comprehensive logging
- [ ] Input validation
- [ ] Output sanitization

### Performance ✅
- [ ] Database queries optimized
- [ ] Proper indexing implemented
- [ ] API response times < 500ms
- [ ] Frontend load times < 3s
- [ ] Memory usage within limits
- [ ] No N+1 query problems

### Security ✅
- [ ] Authentication implemented
- [ ] Authorization enforced
- [ ] Input validation in place
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF protection
- [ ] Sensitive data encrypted

### Testing ✅
- [ ] Unit test coverage ≥80%
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Performance tests pass
- [ ] Security tests pass
- [ ] Accessibility tests pass

## Documentation Requirements

### Generated Documentation ✅
- [ ] API documentation (OpenAPI/Swagger)
- [ ] Database schema documentation
- [ ] Component documentation (Storybook)
- [ ] User guide updates
- [ ] Architecture decision records (ADRs)

### Code Documentation ✅
- [ ] XML documentation for public APIs
- [ ] Inline comments for complex logic
- [ ] README files for new modules
- [ ] Configuration documentation
- [ ] Deployment instructions

## Deployment Checklist

### Pre-Deployment ✅
- [ ] All tests passing
- [ ] Code review completed
- [ ] Security scan passed
- [ ] Performance benchmarks met
- [ ] Database migrations tested
- [ ] Rollback plan prepared

### Deployment ✅
- [ ] Database migrations executed
- [ ] Application deployed
- [ ] Configuration updated
- [ ] Monitoring enabled
- [ ] Health checks passing

### Post-Deployment ✅
- [ ] Functionality verified
- [ ] Performance monitored
- [ ] Error logs checked
- [ ] User acceptance testing
- [ ] Stakeholder notification

## Success Metrics

### Development Metrics ✅
- **Code Quality**: 0 critical issues, <5 minor issues
- **Test Coverage**: ≥80% for all new code
- **Performance**: API response <500ms, UI load <3s
- **Security**: 0 high/critical vulnerabilities
- **Documentation**: 100% API endpoints documented

### Business Metrics ✅
- **Feature Completeness**: 100% acceptance criteria met
- **User Satisfaction**: Positive feedback from stakeholders
- **System Reliability**: 99.9% uptime
- **Performance**: Meets or exceeds baseline metrics

This comprehensive guide ensures that all AI-DLC generated features maintain consistency, quality, and alignment with EDR project standards.