---
inclusion: always
---

# EDR Coding Standards for AI-DLC Implementation

## General Principles

### SOLID Principles
- **S**ingle Responsibility Principle
- **O**pen/Closed Principle  
- **L**iskov Substitution Principle
- **I**nterface Segregation Principle
- **D**ependency Inversion Principle

### Code Quality Rules
- **DRY**: Don't Repeat Yourself
- **KISS**: Keep It Simple, Stupid
- **YAGNI**: You Aren't Gonna Need It
- **Readability Over Cleverness**

## C# Backend Standards

### Naming Conventions
```csharp
// ✅ GOOD - Classes and Interfaces
public class ProjectManagementService { }
public interface IProjectRepository { }

// ✅ GOOD - Methods and Properties (PascalCase)
public async Task<Project> GetProjectByIdAsync(int id) { }
public string ProjectName { get; set; }

// ✅ GOOD - Variables and Parameters (camelCase)
var projectRepository = new ProjectRepository();
public void ProcessProject(int projectId, string projectName) { }

// ✅ GOOD - Private Fields (underscore prefix)
private readonly IProjectRepository _projectRepository;

// ✅ GOOD - Constants (PascalCase)
public const int MaxRetryAttempts = 5;
```

### File Organization
- One class per file
- Namespace matches folder structure
- Use Repository + Unit of Work pattern
- CQRS with MediatR for complex operations

### Async/Await Pattern
```csharp
// ✅ GOOD - Async methods end with 'Async'
public async Task<Project> GetProjectByIdAsync(int id)
{
    return await _context.Projects
        .Include(p => p.Region)
        .FirstOrDefaultAsync(p => p.ProjectId == id);
}
```

### Exception Handling
```csharp
// ✅ GOOD - Specific exception handling with logging
try
{
    var project = await _projectRepository.GetByIdAsync(id);
    if (project == null)
        return NotFound($"Project with ID {id} not found");
    return Ok(project);
}
catch (DbUpdateException ex)
{
    _logger.LogError(ex, $"Database error retrieving project {id}");
    return StatusCode(500, "Database error occurred");
}
```

## TypeScript/React Frontend Standards

### Naming Conventions
```typescript
// ✅ GOOD - Components (PascalCase)
export const ProjectList: React.FC<ProjectListProps> = ({ status }) => { }

// ✅ GOOD - Interfaces (PascalCase, no 'I' prefix)
export interface ProjectDto {
    projectId: number;
    projectName: string;
}

// ✅ GOOD - Variables and Functions (camelCase)
const projectName = "Airport Terminal";
const calculateTotal = (items: Item[]): number => { }

// ✅ GOOD - Constants (SCREAMING_SNAKE_CASE)
export const MAX_RETRY_ATTEMPTS = 5;
```

### Component Structure
```typescript
// ✅ GOOD - Typed functional component
interface ProjectListProps {
    status?: string;
    onProjectSelect: (projectId: number) => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({ status, onProjectSelect }) => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        loadProjects();
    }, [status]);

    const loadProjects = async () => {
        setLoading(true);
        try {
            const data = await projectApi.getAll(status);
            setProjects(data);
        } catch (error) {
            console.error('Failed to load projects', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {loading ? <Spinner /> : <ProjectTable projects={projects} />}
        </div>
    );
};
```

## Database Standards

### Naming Conventions
```sql
-- ✅ GOOD - Tables (PascalCase, singular)
CREATE TABLE Project ( ... )
CREATE TABLE MonthlyProgress ( ... )

-- ✅ GOOD - Columns (PascalCase)
ProjectId INT PRIMARY KEY,
ProjectName NVARCHAR(255) NOT NULL,
EstimatedProjectCost DECIMAL(18,2)

-- ✅ GOOD - Primary Keys ({TableName}Id)
ProjectId, UserId, OpportunityId

-- ✅ GOOD - Foreign Keys ({ReferencedTable}Id)
ProjectId INT REFERENCES Project(ProjectId)
```

### Data Types
```sql
-- ✅ GOOD - Appropriate data types
ProjectName NVARCHAR(255) NOT NULL          -- Variable text with limit
Description NVARCHAR(MAX) NULL              -- Long text, optional
EstimatedCost DECIMAL(18,2) NOT NULL        -- Financial data
IsActive BIT NOT NULL DEFAULT 1             -- Boolean
CreatedAt DATETIME NOT NULL DEFAULT GETDATE() -- Timestamp
```

## API Design Standards

### RESTful Endpoints
```
✅ GOOD - RESTful resource naming
GET    /api/projects              - Get all projects
GET    /api/projects/{id}         - Get project by ID
POST   /api/projects              - Create project
PUT    /api/projects/{id}         - Update project
DELETE /api/projects/{id}         - Delete project
```

### HTTP Status Codes
```csharp
// ✅ GOOD - Appropriate status codes
[HttpGet("{id}")]
public async Task<IActionResult> GetProject(int id)
{
    var project = await _repository.GetByIdAsync(id);
    if (project == null)
        return NotFound();  // 404
    return Ok(project);     // 200
}

[HttpPost]
public async Task<IActionResult> CreateProject(ProjectDto dto)
{
    if (!ModelState.IsValid)
        return BadRequest(ModelState);  // 400
    
    var project = await _repository.CreateAsync(dto);
    return CreatedAtAction(nameof(GetProject), new { id = project.Id }, project);  // 201
}
```

### Request/Response Models
```csharp
// ✅ GOOD - Use DTOs for API contracts
public class CreateProjectDto
{
    [Required]
    [StringLength(255)]
    public string ProjectName { get; set; }

    [Range(0, double.MaxValue)]
    public decimal EstimatedProjectCost { get; set; }
}
```

## Testing Standards

### Unit Test Structure
```csharp
// ✅ GOOD - Arrange-Act-Assert pattern
[Fact]
public async Task GetProject_ValidId_ReturnsProject()
{
    // Arrange
    var projectId = 1;
    var expectedProject = new Project { ProjectId = projectId, ProjectName = "Test" };
    _mockRepository.Setup(r => r.GetByIdAsync(projectId)).ReturnsAsync(expectedProject);

    // Act
    var result = await _controller.GetProject(projectId);

    // Assert
    var okResult = Assert.IsType<OkObjectResult>(result);
    var project = Assert.IsType<Project>(okResult.Value);
    Assert.Equal(expectedProject.ProjectId, project.ProjectId);
}
```

### Test Coverage Requirements
- **Minimum Coverage**: 80%
- **Frameworks**: xUnit, Moq, FluentAssertions
- **Test Types**: Unit, Integration, E2E

## Git Commit Standards

### Commit Message Format
```
<type>(<scope>): <subject>

Examples:
feat(projects): add project filtering by status
fix(auth): resolve token expiration issue
docs(api): update API documentation for project endpoints
chore(deps): update Entity Framework Core to 8.0.10
```

### Commit Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes
- **refactor**: Code refactoring
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

## AI-DLC Specific Requirements

### Code Generation Standards
- All generated code must follow these standards
- Use AutoMapper for DTO mapping
- Implement proper error handling
- Include comprehensive logging
- Follow existing architectural patterns

### Quality Gates
- Code must compile without warnings
- All tests must pass
- Code coverage ≥ 80%
- No security vulnerabilities
- Performance requirements met

### Documentation Requirements
- XML documentation for public APIs
- README files for new modules
- API documentation updates
- Architecture decision records (ADRs)

This ensures all AI-generated code follows EDR project standards and maintains consistency across the codebase.