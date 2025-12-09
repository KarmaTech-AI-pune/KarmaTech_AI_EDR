# Coding Standards

**KarmaTech AI EDR Development Team**

This document defines the coding standards, best practices, and conventions for the KarmaTech AI EDR project. All team members must follow these standards to ensure code quality, maintainability, and consistency.

---

## Table of Contents

- [General Principles](#general-principles)
- [C# Backend Standards](#c-backend-standards)
- [TypeScript/React Frontend Standards](#typescriptreact-frontend-standards)
- [Database Standards](#database-standards)
- [API Design Standards](#api-design-standards)
- [Git Commit Standards](#git-commit-standards)
- [Code Review Guidelines](#code-review-guidelines)
- [Testing Standards](#testing-standards)
- [Documentation Standards](#documentation-standards)
- [Security Standards](#security-standards)

---

## General Principles

### 1. Code Quality Principles

**SOLID Principles:**
- **S**ingle Responsibility Principle
- **O**pen/Closed Principle
- **L**iskov Substitution Principle
- **I**nterface Segregation Principle
- **D**ependency Inversion Principle

**DRY (Don't Repeat Yourself):**
- Avoid code duplication
- Extract reusable components and functions
- Use inheritance and composition appropriately

**KISS (Keep It Simple, Stupid):**
- Write simple, readable code
- Avoid over-engineering
- Prefer clarity over cleverness

**YAGNI (You Aren't Gonna Need It):**
- Don't add functionality until needed
- Avoid premature optimization
- Build what's required now, not what might be needed later

### 2. Readability Over Cleverness

```csharp
// ❌ BAD - Clever but unreadable
var result = users.Where(u => u.IsActive).Select(u => new { u.Id, u.Name }).ToList();

// ✅ GOOD - Clear and readable
var activeUsers = users.Where(u => u.IsActive);
var userSummaries = activeUsers.Select(u => new UserSummary
{
    Id = u.Id,
    Name = u.Name
}).ToList();
```

### 3. Consistent Formatting

- Use consistent indentation (4 spaces for C#, 2 spaces for TypeScript/React)
- Maximum line length: 120 characters
- Use blank lines to separate logical blocks
- Group related code together

---

## C# Backend Standards

### 1. Naming Conventions

#### Classes and Interfaces

```csharp
// ✅ GOOD - PascalCase for classes
public class ProjectManagementService { }
public class UserRepository { }

// ✅ GOOD - Interface with 'I' prefix
public interface IProjectRepository { }
public interface IEmailService { }

// ❌ BAD
public class projectService { }
public class user_repository { }
public interface ProjectRepository { } // Missing 'I' prefix
```

#### Methods and Properties

```csharp
// ✅ GOOD - PascalCase for public methods and properties
public class Project
{
    public int ProjectId { get; set; }
    public string ProjectName { get; set; }

    public async Task<Project> GetProjectByIdAsync(int id) { }
    public void UpdateProject(Project project) { }
}

// ❌ BAD
public string projectName { get; set; } // Should be PascalCase
public void update_project() { } // Should be PascalCase
```

#### Variables and Parameters

```csharp
// ✅ GOOD - camelCase for local variables and parameters
public void ProcessProject(int projectId, string projectName)
{
    var projectRepository = new ProjectRepository();
    var activeProjects = projectRepository.GetActiveProjects();
    var totalCount = activeProjects.Count();
}

// ❌ BAD
public void ProcessProject(int ProjectId, string ProjectName) // Should be camelCase
{
    var ProjectRepository = new ProjectRepository(); // Should be camelCase
}
```

#### Constants and Static Fields

```csharp
// ✅ GOOD - PascalCase for constants
public const int MaxRetryAttempts = 5;
public const string DefaultCurrency = "USD";

// ✅ GOOD - Static readonly fields
public static readonly string ApiVersion = "v1.10.4";

// ❌ BAD
public const int MAX_RETRY_ATTEMPTS = 5; // Don't use SCREAMING_SNAKE_CASE in C#
```

#### Private Fields

```csharp
// ✅ GOOD - Prefix with underscore
public class ProjectService
{
    private readonly IProjectRepository _projectRepository;
    private readonly ILogger<ProjectService> _logger;

    public ProjectService(IProjectRepository projectRepository, ILogger<ProjectService> logger)
    {
        _projectRepository = projectRepository;
        _logger = logger;
    }
}

// ❌ BAD
private readonly IProjectRepository projectRepository; // Missing underscore
```

### 2. File Organization

#### One Class Per File

```
✅ GOOD:
- ProjectService.cs (contains only ProjectService class)
- IProjectService.cs (contains only IProjectService interface)

❌ BAD:
- Services.cs (contains multiple service classes)
```

#### Namespace Structure

```csharp
// ✅ GOOD - Matches folder structure
namespace NJS.Application.Services
{
    public class ProjectManagementService { }
}

namespace NJS.Domain.Entities
{
    public class Project { }
}

// ❌ BAD - Doesn't match folder structure
namespace Services // Too generic
{
    public class ProjectManagementService { }
}
```

### 3. Method Structure

#### Async/Await Pattern

```csharp
// ✅ GOOD - Async methods end with 'Async'
public async Task<Project> GetProjectByIdAsync(int id)
{
    return await _context.Projects
        .Include(p => p.Region)
        .FirstOrDefaultAsync(p => p.ProjectId == id);
}

// ❌ BAD - Missing 'Async' suffix
public async Task<Project> GetProjectById(int id)
{
    return await _context.Projects.FirstOrDefaultAsync(p => p.ProjectId == id);
}

// ❌ BAD - Using .Result (blocks thread)
public Project GetProjectById(int id)
{
    return _context.Projects.FirstOrDefaultAsync(p => p.ProjectId == id).Result;
}
```

#### Single Responsibility

```csharp
// ✅ GOOD - Method does one thing
public async Task<Project> GetProjectByIdAsync(int id)
{
    return await _projectRepository.GetByIdAsync(id);
}

public async Task<bool> ValidateProjectAsync(Project project)
{
    return project != null
        && !string.IsNullOrEmpty(project.ProjectName)
        && project.EstimatedProjectCost >= 0;
}

// ❌ BAD - Method does too many things
public async Task<bool> GetAndValidateProjectAsync(int id)
{
    var project = await _projectRepository.GetByIdAsync(id);
    if (project == null) return false;
    if (string.IsNullOrEmpty(project.ProjectName)) return false;
    if (project.EstimatedProjectCost < 0) return false;
    await _logger.LogInformationAsync("Project validated");
    await _emailService.SendEmailAsync("admin@example.com", "Project validated");
    return true;
}
```

#### Method Length

```csharp
// ✅ GOOD - Short, focused method (< 20 lines)
public async Task<IActionResult> CreateProject(ProjectDto dto)
{
    if (!ModelState.IsValid)
    {
        return BadRequest(ModelState);
    }

    var project = _mapper.Map<Project>(dto);
    await _projectRepository.CreateAsync(project);

    return CreatedAtAction(nameof(GetProject), new { id = project.ProjectId }, project);
}

// ❌ BAD - Method too long (> 50 lines) - Extract into smaller methods
```

### 4. Exception Handling

```csharp
// ✅ GOOD - Specific exception handling
public async Task<IActionResult> GetProject(int id)
{
    try
    {
        var project = await _projectRepository.GetByIdAsync(id);

        if (project == null)
        {
            return NotFound($"Project with ID {id} not found");
        }

        return Ok(project);
    }
    catch (DbUpdateException ex)
    {
        _logger.LogError(ex, $"Database error retrieving project {id}");
        return StatusCode(500, "Database error occurred");
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, $"Unexpected error retrieving project {id}");
        return StatusCode(500, "An unexpected error occurred");
    }
}

// ❌ BAD - Catching general exception without logging
public async Task<IActionResult> GetProject(int id)
{
    try
    {
        var project = await _projectRepository.GetByIdAsync(id);
        return Ok(project);
    }
    catch
    {
        return StatusCode(500, "Error");
    }
}

// ❌ BAD - Empty catch block
try
{
    var project = await _projectRepository.GetByIdAsync(id);
}
catch { } // Swallows exception
```

### 5. LINQ Queries

```csharp
// ✅ GOOD - Clear, readable query
var activeProjects = await _context.Projects
    .Where(p => p.Status == "Active")
    .Include(p => p.Region)
    .OrderByDescending(p => p.CreatedAt)
    .ToListAsync();

// ✅ GOOD - Use AsNoTracking for read-only queries
var projects = await _context.Projects
    .AsNoTracking()
    .Where(p => p.Status == "Active")
    .ToListAsync();

// ❌ BAD - Query brings all data then filters
var activeProjects = (await _context.Projects.ToListAsync())
    .Where(p => p.Status == "Active")
    .ToList();

// ❌ BAD - Using .Result (blocking)
var projects = _context.Projects.Where(p => p.Status == "Active").ToListAsync().Result;
```

### 6. Dependency Injection

```csharp
// ✅ GOOD - Constructor injection
public class ProjectController : ControllerBase
{
    private readonly IProjectRepository _projectRepository;
    private readonly ILogger<ProjectController> _logger;
    private readonly IMapper _mapper;

    public ProjectController(
        IProjectRepository projectRepository,
        ILogger<ProjectController> logger,
        IMapper mapper)
    {
        _projectRepository = projectRepository;
        _logger = logger;
        _mapper = mapper;
    }
}

// ❌ BAD - Service locator pattern
public class ProjectController : ControllerBase
{
    private readonly IServiceProvider _serviceProvider;

    public ProjectController(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    public IActionResult GetProjects()
    {
        var repository = _serviceProvider.GetService<IProjectRepository>(); // Anti-pattern
    }
}
```

### 7. Comments and Documentation

```csharp
// ✅ GOOD - XML documentation for public APIs
/// <summary>
/// Retrieves a project by its unique identifier.
/// </summary>
/// <param name="id">The project ID</param>
/// <returns>The project if found, otherwise null</returns>
/// <exception cref="ArgumentException">Thrown when id is less than 1</exception>
public async Task<Project> GetProjectByIdAsync(int id)
{
    if (id < 1)
    {
        throw new ArgumentException("Project ID must be greater than 0", nameof(id));
    }

    return await _projectRepository.GetByIdAsync(id);
}

// ✅ GOOD - Comments explain "why", not "what"
// Calculate EAC using the formula: Budget at Completion / Cost Performance Index
var estimateAtCompletion = budgetAtCompletion / costPerformanceIndex;

// ❌ BAD - Obvious comments
// Get project by ID
var project = await GetProjectByIdAsync(5);

// ❌ BAD - Commented-out code (remove it, use Git history)
// var oldImplementation = DoSomethingOld();
var newImplementation = DoSomethingNew();
```

### 8. Entity Framework Conventions

```csharp
// ✅ GOOD - Explicit configuration
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    // Configure decimal precision
    modelBuilder.Entity<Project>()
        .Property(p => p.EstimatedProjectCost)
        .HasPrecision(18, 2);

    // Configure relationships
    modelBuilder.Entity<MonthlyProgress>()
        .HasOne(mp => mp.FinancialDetails)
        .WithOne(fd => fd.MonthlyProgress)
        .HasForeignKey<FinancialDetails>(fd => fd.MonthlyProgressId);

    // Configure indexes
    modelBuilder.Entity<Project>()
        .HasIndex(p => p.ProjectNumber)
        .IsUnique();
}

// ❌ BAD - Relying on conventions without explicit configuration
```

---

## TypeScript/React Frontend Standards

### 1. Naming Conventions

#### Components

```typescript
// ✅ GOOD - PascalCase for components
export const ProjectList: React.FC = () => { }
export const UserProfile: React.FC<UserProfileProps> = ({ userId }) => { }

// ❌ BAD
export const projectList = () => { } // Should be PascalCase
export const user_profile = () => { } // Should be PascalCase
```

#### Interfaces and Types

```typescript
// ✅ GOOD - PascalCase, no 'I' prefix
export interface ProjectDto {
    projectId: number;
    projectName: string;
    status: string;
}

export type ProjectStatus = 'Active' | 'Completed' | 'On Hold';

// ❌ BAD
export interface IProjectDto { } // Don't use 'I' prefix in TypeScript
export interface project_dto { } // Should be PascalCase
```

#### Variables and Functions

```typescript
// ✅ GOOD - camelCase
const projectName = "Airport Terminal";
const activeProjects = getActiveProjects();

function calculateTotal(items: Item[]): number {
    return items.reduce((sum, item) => sum + item.price, 0);
}

// ❌ BAD
const ProjectName = "Airport Terminal"; // Should be camelCase
const active_projects = getActiveProjects(); // Should be camelCase
```

#### Constants

```typescript
// ✅ GOOD - SCREAMING_SNAKE_CASE for true constants
export const MAX_RETRY_ATTEMPTS = 5;
export const API_BASE_URL = 'http://localhost:5245/api';

// ✅ GOOD - camelCase for configuration objects
export const apiConfig = {
    baseUrl: 'http://localhost:5245/api',
    timeout: 30000,
    retries: 3
};

// ❌ BAD
export const maxRetryAttempts = 5; // Should be SCREAMING_SNAKE_CASE for primitive constants
```

### 2. Component Structure

#### Functional Components with TypeScript

```typescript
// ✅ GOOD - Typed functional component with props interface
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

// ❌ BAD - No types, unclear structure
export const ProjectList = (props) => {
    const [projects, setProjects] = useState([]);
    // ... rest of component
};
```

#### Component File Organization

```
✅ GOOD:
components/
├── ProjectList/
│   ├── ProjectList.tsx          (main component)
│   ├── ProjectList.test.tsx     (tests)
│   ├── ProjectList.styles.ts    (styled components)
│   └── index.ts                 (export)

❌ BAD:
components/
├── project-list.tsx              (inconsistent naming)
├── ProjectListComponent.tsx      (redundant suffix)
```

### 3. Hooks Best Practices

```typescript
// ✅ GOOD - Custom hooks start with 'use'
export const useProjects = (status?: string) => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchProjects = async () => {
            setLoading(true);
            try {
                const data = await projectApi.getAll(status);
                setProjects(data);
            } catch (err) {
                setError(err as Error);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, [status]);

    return { projects, loading, error };
};

// Usage
const ProjectList: React.FC = () => {
    const { projects, loading, error } = useProjects('Active');

    if (loading) return <Spinner />;
    if (error) return <ErrorMessage error={error} />;

    return <ProjectTable projects={projects} />;
};

// ❌ BAD - Don't call hooks conditionally
const ProjectList: React.FC<ProjectListProps> = ({ showActive }) => {
    if (showActive) {
        const projects = useProjects('Active'); // ❌ Hooks must be called unconditionally
    }
};
```

### 4. State Management

```typescript
// ✅ GOOD - useState with proper typing
const [project, setProject] = useState<Project | null>(null);
const [projects, setProjects] = useState<Project[]>([]);
const [loading, setLoading] = useState<boolean>(false);

// ✅ GOOD - useReducer for complex state
interface ProjectState {
    projects: Project[];
    loading: boolean;
    error: Error | null;
}

type ProjectAction =
    | { type: 'FETCH_START' }
    | { type: 'FETCH_SUCCESS'; payload: Project[] }
    | { type: 'FETCH_ERROR'; payload: Error };

const projectReducer = (state: ProjectState, action: ProjectAction): ProjectState => {
    switch (action.type) {
        case 'FETCH_START':
            return { ...state, loading: true, error: null };
        case 'FETCH_SUCCESS':
            return { ...state, loading: false, projects: action.payload };
        case 'FETCH_ERROR':
            return { ...state, loading: false, error: action.payload };
        default:
            return state;
    }
};

// ❌ BAD - No types
const [project, setProject] = useState(null);
const [projects, setProjects] = useState([]);
```

### 5. Props and Types

```typescript
// ✅ GOOD - Explicit prop types
interface ButtonProps {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
    disabled?: boolean;
    children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    label,
    onClick,
    variant = 'primary',
    disabled = false
}) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`btn btn-${variant}`}
        >
            {label}
        </button>
    );
};

// ❌ BAD - Using 'any'
interface ButtonProps {
    label: any;
    onClick: any;
    variant: any;
}
```

### 6. API Calls

```typescript
// ✅ GOOD - Typed API service
export const projectApi = {
    getAll: async (status?: string): Promise<Project[]> => {
        try {
            const response = await axios.get<Project[]>('/api/projects', {
                params: { status }
            });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch projects', error);
            throw error;
        }
    },

    getById: async (id: number): Promise<Project> => {
        const response = await axios.get<Project>(`/api/projects/${id}`);
        return response.data;
    },

    create: async (project: CreateProjectDto): Promise<Project> => {
        const response = await axios.post<Project>('/api/projects', project);
        return response.data;
    }
};

// ❌ BAD - No error handling, no types
export const getProjects = async () => {
    const response = await axios.get('/api/projects');
    return response.data;
};
```

### 7. Event Handlers

```typescript
// ✅ GOOD - Typed event handlers
const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Handle form submission
};

const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
};

const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    console.log('Button clicked');
};

// ❌ BAD - Untyped events
const handleSubmit = (event) => {
    event.preventDefault();
};
```

### 8. Conditional Rendering

```typescript
// ✅ GOOD - Clear conditional rendering
const ProjectList: React.FC = () => {
    const { projects, loading, error } = useProjects();

    if (loading) {
        return <Spinner />;
    }

    if (error) {
        return <ErrorMessage message={error.message} />;
    }

    if (projects.length === 0) {
        return <EmptyState message="No projects found" />;
    }

    return <ProjectTable projects={projects} />;
};

// ✅ GOOD - Ternary for simple conditions
return (
    <div>
        {isLoggedIn ? <Dashboard /> : <LoginScreen />}
    </div>
);

// ❌ BAD - Nested ternaries
return (
    <div>
        {loading ? <Spinner /> : error ? <Error /> : projects.length === 0 ? <Empty /> : <List />}
    </div>
);
```

---

## Database Standards

### 1. Naming Conventions

#### Tables

```sql
-- ✅ GOOD - PascalCase, singular names
CREATE TABLE Project ( ... )
CREATE TABLE MonthlyProgress ( ... )
CREATE TABLE OpportunityTracking ( ... )

-- ❌ BAD
CREATE TABLE projects ( ... )           -- Should be singular and PascalCase
CREATE TABLE monthly_progress ( ... )  -- Should be PascalCase
CREATE TABLE OPPORTUNITY ( ... )        -- Should be PascalCase, not UPPERCASE
```

#### Columns

```sql
-- ✅ GOOD - PascalCase
CREATE TABLE Project (
    ProjectId INT PRIMARY KEY,
    ProjectName NVARCHAR(255) NOT NULL,
    EstimatedProjectCost DECIMAL(18,2),
    CreatedAt DATETIME NOT NULL,
    UpdatedAt DATETIME NULL
)

-- ❌ BAD
CREATE TABLE Project (
    project_id INT PRIMARY KEY,         -- Should be PascalCase
    PROJECTNAME NVARCHAR(255),          -- Should be PascalCase
    estimated_cost DECIMAL(18,2)        -- Should be PascalCase
)
```

#### Primary Keys

```sql
-- ✅ GOOD - {TableName}Id pattern
ProjectId       -- for Project table
UserId          -- for User table
OpportunityId   -- for OpportunityTracking table

-- ❌ BAD
Id              -- Too generic
project_id      -- Wrong casing
PK_Project      -- Unnecessary prefix
```

#### Foreign Keys

```sql
-- ✅ GOOD - {ReferencedTable}Id pattern
CREATE TABLE MonthlyProgress (
    ProgressId INT PRIMARY KEY,
    ProjectId INT NOT NULL,          -- References Project.ProjectId
    FOREIGN KEY (ProjectId) REFERENCES Project(ProjectId)
)

-- ❌ BAD
CREATE TABLE MonthlyProgress (
    ProgressId INT PRIMARY KEY,
    Project INT NOT NULL,            -- Missing 'Id' suffix
    FK_Project INT NOT NULL          -- Unnecessary 'FK_' prefix
)
```

### 2. Data Types

```sql
-- ✅ GOOD - Appropriate data types
ProjectName NVARCHAR(255) NOT NULL          -- Variable text with limit
Description NVARCHAR(MAX) NULL              -- Long text, optional
EstimatedCost DECIMAL(18,2) NOT NULL        -- Financial data
IsActive BIT NOT NULL DEFAULT 1             -- Boolean
CreatedAt DATETIME NOT NULL DEFAULT GETDATE() -- Timestamp

-- ❌ BAD
ProjectName NVARCHAR(MAX) NOT NULL          -- Unnecessarily large
EstimatedCost FLOAT                         -- Precision issues for money
IsActive INT                                -- Use BIT for boolean
CreatedAt NVARCHAR(50)                      -- Should be DATETIME
```

### 3. Indexes

```sql
-- ✅ GOOD - Index naming: IX_{TableName}_{ColumnNames}
CREATE INDEX IX_Project_Status ON Project(Status);
CREATE INDEX IX_Project_ProjectNumber ON Project(ProjectNumber);
CREATE UNIQUE INDEX IX_Project_ProjectNumber_Unique ON Project(ProjectNumber);

-- Composite index
CREATE INDEX IX_MonthlyProgress_Project_Month_Year
    ON MonthlyProgress(ProjectId, Month, Year);

-- ❌ BAD
CREATE INDEX idx_project_1 ON Project(Status);  -- Non-descriptive name
CREATE INDEX ProjectStatus ON Project(Status);  -- Missing IX_ prefix
```

### 4. Constraints

```sql
-- ✅ GOOD - Constraint naming
ALTER TABLE Project
    ADD CONSTRAINT PK_Project PRIMARY KEY (ProjectId);

ALTER TABLE Project
    ADD CONSTRAINT FK_Project_Region FOREIGN KEY (RegionId)
    REFERENCES Region(RegionId);

ALTER TABLE Project
    ADD CONSTRAINT CK_Project_EstimatedCost CHECK (EstimatedProjectCost >= 0);

ALTER TABLE Project
    ADD CONSTRAINT DF_Project_CreatedAt DEFAULT (GETDATE()) FOR CreatedAt;

-- ❌ BAD
ALTER TABLE Project ADD PRIMARY KEY (ProjectId);  -- No constraint name
ALTER TABLE Project ADD CHECK (EstimatedProjectCost >= 0);  -- No constraint name
```

### 5. Stored Procedures (If Used)

```sql
-- ✅ GOOD - Naming: sp_{TableName}_{Action}
CREATE PROCEDURE sp_Project_GetByStatus
    @Status NVARCHAR(50)
AS
BEGIN
    SELECT * FROM Project WHERE Status = @Status;
END

-- ❌ BAD
CREATE PROCEDURE GetProjects  -- Missing sp_ prefix and specificity
CREATE PROCEDURE spGetProjects  -- Inconsistent naming
```

---

## API Design Standards

### 1. RESTful Endpoints

```
✅ GOOD - RESTful resource naming

GET    /api/projects              - Get all projects
GET    /api/projects/{id}         - Get project by ID
POST   /api/projects              - Create project
PUT    /api/projects/{id}         - Update project
DELETE /api/projects/{id}         - Delete project
GET    /api/projects/{id}/wbs     - Get WBS for project

❌ BAD

GET    /api/getProjects            - Verb in URL
POST   /api/createProject          - Verb in URL
GET    /api/project/{id}           - Inconsistent plural/singular
POST   /api/projects/create        - Unnecessary 'create' action
DELETE /api/deleteProject/{id}     - Verb in URL
```

### 2. HTTP Status Codes

```csharp
// ✅ GOOD - Appropriate status codes
[HttpGet("{id}")]
public async Task<IActionResult> GetProject(int id)
{
    var project = await _repository.GetByIdAsync(id);

    if (project == null)
        return NotFound();  // 404

    return Ok(project);  // 200
}

[HttpPost]
public async Task<IActionResult> CreateProject(ProjectDto dto)
{
    if (!ModelState.IsValid)
        return BadRequest(ModelState);  // 400

    var project = await _repository.CreateAsync(dto);
    return CreatedAtAction(nameof(GetProject), new { id = project.Id }, project);  // 201
}

[HttpDelete("{id}")]
public async Task<IActionResult> DeleteProject(int id)
{
    var deleted = await _repository.DeleteAsync(id);

    if (!deleted)
        return NotFound();  // 404

    return NoContent();  // 204
}

// ❌ BAD - Wrong status codes
[HttpGet("{id}")]
public async Task<IActionResult> GetProject(int id)
{
    var project = await _repository.GetByIdAsync(id);

    if (project == null)
        return Ok(null);  // ❌ Should be 404, not 200

    return Ok(project);
}
```

### 3. Request/Response Models

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

public class ProjectResponseDto
{
    public int ProjectId { get; set; }
    public string ProjectName { get; set; }
    public decimal EstimatedProjectCost { get; set; }
    public DateTime CreatedAt { get; set; }
}

// ❌ BAD - Exposing entity directly
[HttpPost]
public async Task<IActionResult> CreateProject(Project project)  // ❌ Using entity
{
    await _repository.CreateAsync(project);
    return Ok(project);
}
```

### 4. Error Responses

```csharp
// ✅ GOOD - Consistent error response format
public class ErrorResponse
{
    public bool Success { get; set; } = false;
    public int StatusCode { get; set; }
    public string Message { get; set; }
    public List<string> Errors { get; set; }
}

[HttpPost]
public async Task<IActionResult> CreateProject(CreateProjectDto dto)
{
    if (!ModelState.IsValid)
    {
        return BadRequest(new ErrorResponse
        {
            StatusCode = 400,
            Message = "Validation failed",
            Errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList()
        });
    }

    // ... rest of method
}

// ❌ BAD - Inconsistent error responses
return BadRequest("Error");  // Just a string
return BadRequest(new { error = "Something went wrong" });  // Different format
```

### 5. Versioning

```csharp
// ✅ GOOD - URL versioning
[Route("api/v1/[controller]")]
[ApiController]
public class ProjectsController : ControllerBase { }

// ✅ GOOD - Header versioning
[Route("api/[controller]")]
[ApiVersion("1.0")]
public class ProjectsController : ControllerBase { }

// ❌ BAD - No versioning
[Route("api/[controller]")]
public class ProjectsController : ControllerBase { }
```

---

## Git Commit Standards

### 1. Commit Message Format

```
✅ GOOD - Conventional Commits format

<type>(<scope>): <subject>

<body>

<footer>

Examples:

feat(projects): add project filtering by status

Added a new query parameter 'status' to the GET /api/projects endpoint
to allow filtering projects by their current status.

Closes #123

fix(auth): resolve token expiration issue

Users were being logged out prematurely due to incorrect token
expiration calculation. Fixed the calculation in AuthService.cs
to use UTC time consistently.

Fixes #456

docs(api): update API documentation for project endpoints

Added examples for all project-related endpoints including
request/response samples and error codes.

chore(deps): update Entity Framework Core to 8.0.10

Updated EF Core and related packages to the latest stable version
to address security vulnerabilities.

❌ BAD

Updated stuff
Fixed bug
WIP
asdfasdf
Made changes to project controller
```

### 2. Commit Types

```
feat:     New feature
fix:      Bug fix
docs:     Documentation changes
style:    Code style changes (formatting, missing semi-colons, etc.)
refactor: Code refactoring
perf:     Performance improvements
test:     Adding or updating tests
chore:    Maintenance tasks (dependency updates, build scripts)
ci:       CI/CD pipeline changes
revert:   Reverting previous commits
```

### 3. Commit Best Practices

```
✅ GOOD

- Atomic commits (one logical change per commit)
- Descriptive commit messages
- Reference issue numbers
- Present tense ("add feature" not "added feature")
- Imperative mood ("move cursor to..." not "moves cursor to...")

❌ BAD

- Multiple unrelated changes in one commit
- Vague messages ("fixed stuff", "updates")
- Massive commits with 50+ file changes
- Commit messages with just "WIP"
```

---

## Code Review Guidelines

### 1. What to Review

**Functionality:**
- ✅ Does the code work as intended?
- ✅ Are edge cases handled?
- ✅ Is error handling appropriate?

**Code Quality:**
- ✅ Follows coding standards?
- ✅ DRY principle followed?
- ✅ SOLID principles followed?
- ✅ Proper naming conventions?

**Security:**
- ✅ No SQL injection vulnerabilities?
- ✅ Input validation present?
- ✅ No hardcoded secrets?
- ✅ Authentication/authorization correct?

**Performance:**
- ✅ No N+1 queries?
- ✅ Appropriate use of async/await?
- ✅ Proper indexing?

**Testing:**
- ✅ Unit tests included?
- ✅ Integration tests where appropriate?
- ✅ Test coverage adequate?

### 2. Review Checklist

```markdown
## Code Review Checklist

### Functionality
- [ ] Code works as described in the PR
- [ ] Edge cases handled
- [ ] Error handling appropriate

### Code Quality
- [ ] Follows coding standards
- [ ] No code duplication
- [ ] Proper separation of concerns
- [ ] Meaningful variable/method names

### Security
- [ ] Input validation present
- [ ] No SQL injection vulnerabilities
- [ ] No hardcoded secrets
- [ ] Proper authentication/authorization

### Performance
- [ ] No obvious performance issues
- [ ] Async/await used appropriately
- [ ] Database queries optimized

### Testing
- [ ] Unit tests included
- [ ] Tests pass
- [ ] Test coverage adequate

### Documentation
- [ ] Code comments where necessary
- [ ] XML documentation for public APIs
- [ ] README updated if needed
```

### 3. Providing Feedback

```
✅ GOOD - Constructive feedback

"Consider extracting this logic into a separate method for better readability:

```csharp
// Instead of this 20-line method
public void ProcessProject() { ... }

// Consider:
public void ProcessProject()
{
    ValidateProject();
    CalculateCosts();
    UpdateDatabase();
}
```

This would make the code more maintainable and testable."

❌ BAD - Non-constructive feedback

"This code is terrible."
"Why did you do it this way?"
"This is wrong."
```

---

## Testing Standards

### 1. Unit Test Naming

```csharp
// ✅ GOOD - Method_Scenario_ExpectedBehavior pattern
[Fact]
public async Task GetProjectById_ValidId_ReturnsProject()
{
    // Arrange
    var expectedProject = new Project { ProjectId = 1, ProjectName = "Test" };
    _mockRepository.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(expectedProject);

    // Act
    var result = await _service.GetProjectByIdAsync(1);

    // Assert
    Assert.NotNull(result);
    Assert.Equal(expectedProject.ProjectId, result.ProjectId);
}

[Fact]
public async Task GetProjectById_InvalidId_ReturnsNull()
{
    // Arrange
    _mockRepository.Setup(r => r.GetByIdAsync(999)).ReturnsAsync((Project)null);

    // Act
    var result = await _service.GetProjectByIdAsync(999);

    // Assert
    Assert.Null(result);
}

// ❌ BAD
[Fact]
public void Test1() { }

[Fact]
public void TestGetProject() { }
```

### 2. Test Structure (AAA Pattern)

```csharp
// ✅ GOOD - Arrange, Act, Assert
[Fact]
public async Task CreateProject_ValidProject_ReturnsCreatedProject()
{
    // Arrange
    var dto = new CreateProjectDto
    {
        ProjectName = "New Project",
        EstimatedProjectCost = 100000
    };

    var expectedProject = new Project
    {
        ProjectId = 1,
        ProjectName = dto.ProjectName,
        EstimatedProjectCost = dto.EstimatedProjectCost
    };

    _mockRepository.Setup(r => r.CreateAsync(It.IsAny<Project>()))
        .ReturnsAsync(expectedProject);

    // Act
    var result = await _service.CreateProjectAsync(dto);

    // Assert
    Assert.NotNull(result);
    Assert.Equal(expectedProject.ProjectName, result.ProjectName);
    Assert.Equal(expectedProject.EstimatedProjectCost, result.EstimatedProjectCost);
}

// ❌ BAD - Mixed arrange/act/assert
[Fact]
public async Task CreateProject_ValidProject_ReturnsCreatedProject()
{
    var dto = new CreateProjectDto { ProjectName = "New Project" };
    var result = await _service.CreateProjectAsync(dto);
    Assert.NotNull(result);
    _mockRepository.Setup(r => r.CreateAsync(It.IsAny<Project>()));  // Setup after Act
}
```

### 3. Test Coverage

```
Minimum Coverage Requirements:
- Business Logic: 80% minimum
- Controllers: 70% minimum
- Repositories: 60% minimum
- Overall Project: 75% minimum

Focus on:
✅ Critical business logic
✅ Complex algorithms
✅ Error handling paths
✅ Edge cases

Don't over-test:
❌ Simple getters/setters
❌ Framework code
❌ Auto-generated code
```

### 4. Frontend Testing (React)

```typescript
// ✅ GOOD - React component test
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProjectList } from './ProjectList';
import { projectApi } from '../../services/projectApi';

jest.mock('../../services/projectApi');

describe('ProjectList', () => {
    it('should display projects when loaded successfully', async () => {
        // Arrange
        const mockProjects = [
            { projectId: 1, projectName: 'Project 1' },
            { projectId: 2, projectName: 'Project 2' }
        ];

        (projectApi.getAll as jest.Mock).mockResolvedValue(mockProjects);

        // Act
        render(<ProjectList />);

        // Assert
        await waitFor(() => {
            expect(screen.getByText('Project 1')).toBeInTheDocument();
            expect(screen.getByText('Project 2')).toBeInTheDocument();
        });
    });

    it('should display error message when loading fails', async () => {
        // Arrange
        (projectApi.getAll as jest.Mock).mockRejectedValue(new Error('Failed to load'));

        // Act
        render(<ProjectList />);

        // Assert
        await waitFor(() => {
            expect(screen.getByText(/error/i)).toBeInTheDocument();
        });
    });
});
```

---

## Documentation Standards

### 1. Code Comments

```csharp
// ✅ GOOD - XML documentation for public APIs
/// <summary>
/// Calculates the Estimate at Completion (EAC) based on current performance.
/// </summary>
/// <param name="budgetAtCompletion">The total planned budget</param>
/// <param name="actualCost">The actual cost incurred to date</param>
/// <param name="earnedValue">The value of work completed</param>
/// <returns>The estimated total cost at project completion</returns>
/// <remarks>
/// Formula: EAC = BAC / CPI where CPI = EV / AC
/// </remarks>
public decimal CalculateEAC(decimal budgetAtCompletion, decimal actualCost, decimal earnedValue)
{
    if (actualCost == 0) throw new ArgumentException("Actual cost cannot be zero");

    var costPerformanceIndex = earnedValue / actualCost;
    return budgetAtCompletion / costPerformanceIndex;
}

// ✅ GOOD - Inline comments for complex logic
// Apply the weighted scoring algorithm where each criterion is multiplied by its weight
// and summed to get the total score. Weights must sum to 1.0.
var totalScore = criteria
    .Select(c => c.Score * c.Weight)
    .Sum();

// ❌ BAD - Obvious comments
// Get project by ID
var project = await GetProjectByIdAsync(id);

// Increment counter
counter++;
```

### 2. README Files

```markdown
✅ GOOD - Comprehensive README structure

# Project Name

Brief description of the project

## Features
- Feature 1
- Feature 2

## Prerequisites
- .NET 8.0 SDK
- SQL Server 2019+
- Node.js 18+

## Getting Started

### Installation
```bash
# Clone repository
git clone https://github.com/org/repo.git

# Install dependencies
dotnet restore
npm install
```

### Configuration
1. Copy `appsettings.example.json` to `appsettings.json`
2. Update database connection string
3. Run migrations

### Running
```bash
# Backend
dotnet run

# Frontend
npm run dev
```

## Architecture
Brief overview of system architecture

## Contributing
See CONTRIBUTING.md

## License
MIT License

❌ BAD - Minimal README

# Project

This is a project.

## Running
Run it.
```

### 3. API Documentation

```csharp
// ✅ GOOD - Swagger documentation
/// <summary>
/// Creates a new project
/// </summary>
/// <param name="dto">Project creation data</param>
/// <returns>The created project</returns>
/// <response code="201">Project created successfully</response>
/// <response code="400">Invalid input data</response>
/// <response code="401">Unauthorized</response>
[HttpPost]
[ProducesResponseType(typeof(ProjectDto), StatusCodes.Status201Created)]
[ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
[ProducesResponseType(StatusCodes.Status401Unauthorized)]
public async Task<IActionResult> CreateProject([FromBody] CreateProjectDto dto)
{
    // Implementation
}
```

---

## Security Standards

### 1. Input Validation

```csharp
// ✅ GOOD - Server-side validation
[HttpPost]
public async Task<IActionResult> CreateProject([FromBody] CreateProjectDto dto)
{
    // Always validate on server, never trust client
    if (!ModelState.IsValid)
    {
        return BadRequest(ModelState);
    }

    // Additional business validation
    if (await _repository.ProjectNumberExists(dto.ProjectNumber))
    {
        return Conflict("Project number already exists");
    }

    // Sanitize inputs
    dto.ProjectName = dto.ProjectName?.Trim();

    var project = await _service.CreateProjectAsync(dto);
    return CreatedAtAction(nameof(GetProject), new { id = project.ProjectId }, project);
}

// ❌ BAD - No validation
[HttpPost]
public async Task<IActionResult> CreateProject([FromBody] CreateProjectDto dto)
{
    // Directly using unvalidated input
    var project = await _service.CreateProjectAsync(dto);
    return Ok(project);
}
```

### 2. SQL Injection Prevention

```csharp
// ✅ GOOD - Parameterized queries (EF Core does this automatically)
var projects = await _context.Projects
    .Where(p => p.Status == status)
    .ToListAsync();

// ✅ GOOD - If using raw SQL, use parameters
var projects = await _context.Projects
    .FromSqlRaw("SELECT * FROM Projects WHERE Status = {0}", status)
    .ToListAsync();

// ❌ BAD - String concatenation
var query = $"SELECT * FROM Projects WHERE Status = '{status}'";  // ❌ SQL Injection risk!
var projects = await _context.Projects.FromSqlRaw(query).ToListAsync();
```

### 3. Authentication & Authorization

```csharp
// ✅ GOOD - Proper authorization
[Authorize(Policy = "RequireAdminRole")]
[HttpDelete("{id}")]
public async Task<IActionResult> DeleteProject(int id)
{
    // Only admins can delete
    var result = await _service.DeleteProjectAsync(id);
    return result ? NoContent() : NotFound();
}

[Authorize]
[HttpGet("{id}")]
public async Task<IActionResult> GetProject(int id)
{
    // Authenticated users can view
    var project = await _service.GetProjectByIdAsync(id);
    return project != null ? Ok(project) : NotFound();
}

// ❌ BAD - No authorization on sensitive operations
[HttpDelete("{id}")]  // ❌ Anyone can delete!
public async Task<IActionResult> DeleteProject(int id)
{
    var result = await _service.DeleteProjectAsync(id);
    return result ? NoContent() : NotFound();
}
```

### 4. Sensitive Data

```csharp
// ✅ GOOD - Use secure configuration
public class EmailSettings
{
    public string SmtpServer { get; set; }
    public int Port { get; set; }
    public string Username { get; set; }
    public string Password { get; set; }  // From Azure Key Vault or User Secrets
}

// In Startup/Program.cs
builder.Configuration.AddUserSecrets<Program>();  // Development
builder.Configuration.AddAzureKeyVault();          // Production

// ❌ BAD - Hardcoded secrets
public class EmailService
{
    private const string Password = "MyP@ssw0rd123";  // ❌ Never do this!
    private const string ApiKey = "sk-1234567890";    // ❌ Never do this!
}
```

### 5. CORS Configuration

```csharp
// ✅ GOOD - Specific origins in production
builder.Services.AddCors(options =>
{
    options.AddPolicy("ProductionPolicy", builder =>
    {
        builder.WithOrigins(
            "https://njs-project-management.com",
            "https://www.njs-project-management.com"
        )
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials();
    });
});

// ❌ BAD - Allow all origins in production
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", builder =>
    {
        builder.AllowAnyOrigin()  // ❌ Security risk!
               .AllowAnyHeader()
               .AllowAnyMethod();
    });
});
```

---

## Enforcement

### Automated Tools

1. **Code Formatting:**
   - C#: Use `.editorconfig` and Visual Studio formatter
   - TypeScript: Use ESLint and Prettier

2. **Static Analysis:**
   - C#: Enable Roslyn analyzers
   - TypeScript: Enable strict TypeScript checking

3. **Pre-commit Hooks:**
   - Run linters
   - Run tests
   - Check formatting

4. **CI/CD Pipeline:**
   - Build verification
   - Test execution
   - Code coverage checks
   - Security scanning

### Code Review Process

1. All code must be reviewed before merging
2. At least one approval required
3. All tests must pass
4. No merge conflicts
5. Follow coding standards

---

## Summary

Following these coding standards ensures:

✅ **Consistency** - Code looks like it was written by one person
✅ **Maintainability** - Easy to understand and modify
✅ **Quality** - Fewer bugs, better performance
✅ **Collaboration** - Team members can work together effectively
✅ **Security** - Reduced security vulnerabilities
✅ **Professionalism** - High-quality deliverables

Remember: **Clean code is not written by following a set of rules. Clean code is written by paying attention to what you're doing while you write it.**

---

**Document Version**: 1.0
**Last Updated**: 2025-10-30
**Maintained By**: Development Team Lead
