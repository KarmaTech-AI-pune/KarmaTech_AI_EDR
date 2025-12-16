---
inclusion: always
---

---
inclusion: fileMatch
fileMatchPattern: '**/src/**|**/backend/**|**/frontend/**|**/Components/**'
---

# EDR Architecture Patterns for AI-DLC Implementation

## System Architecture Overview

**KarmaTech AI EDR** follows a **three-tier architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  React 18.3 + TypeScript + Material-UI + Vite (SPA)        │
└──────────────────┬──────────────────────────────────────────┘
                   │ HTTPS/REST API + JWT Bearer Token
┌──────────────────┴──────────────────────────────────────────┐
│                  APPLICATION LAYER                           │
│  ┌──────────────────────┐    ┌──────────────────────┐      │
│  │  C# .NET Core 8.0    │    │  Node.js/Express     │      │
│  │  - ASP.NET Core API  │    │  - TypeScript        │      │
│  │  - Entity Framework  │    │  - MongoDB           │      │
│  │  - CQRS + MediatR    │    │  - JWT Auth          │      │
│  │  - Repository Pattern│    │                      │      │
│  └──────────┬───────────┘    └──────────┬───────────┘      │
└─────────────┼────────────────────────────┼──────────────────┘
┌─────────────┴────────────────────────────┴──────────────────┐
│                    DATA LAYER                                │
│  ┌──────────────────────┐    ┌──────────────────────┐      │
│  │ Microsoft SQL Server │    │  MongoDB Atlas       │      │
│  │ KarmaTechAI_SAAS     │    │  (Cloud SaaS)       │      │
│  │ 85+ Entities         │    │  User & Project Data │      │
│  └──────────────────────┘    └──────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Backend (.NET Core 8.0)
- **Framework**: ASP.NET Core 8.0
- **ORM**: Entity Framework Core 8.0.10
- **CQRS**: MediatR 12.4.1
- **Mapping**: AutoMapper 12.0.1
- **Authentication**: ASP.NET Core Identity + JWT
- **Email**: MailKit 4.11.0
- **Excel**: ClosedXML 0.102.1
- **Logging**: NLog.Web.AspNetCore 5.5.0

### Frontend (React 18.3)
- **Framework**: React 18.3.1 + TypeScript 5.5.3
- **Build Tool**: Vite 5.4.8
- **UI Library**: Material-UI (MUI) 6.4.11
- **State Management**: React Context API
- **HTTP Client**: Axios 1.7.7
- **Routing**: React Router 7.6.1
- **Forms**: Formik + Yup + Zod
- **Charts**: Recharts 2.15.1

### Database
- **Primary**: Microsoft SQL Server (KarmaTechAI_SAAS)
- **Secondary**: MongoDB Atlas (Cloud)
- **Migration**: EF Core Code-First Migrations

## Core Architectural Patterns

### 1. Clean Architecture (Backend)
```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  Controllers, DTOs, Middleware, Filters                     │
└──────────────────┬──────────────────────────────────────────┘
                   │
┌──────────────────┴──────────────────────────────────────────┐
│                  APPLICATION LAYER                           │
│  Services, Commands, Queries, Handlers, Validators          │
└──────────────────┬──────────────────────────────────────────┘
                   │
┌──────────────────┴──────────────────────────────────────────┐
│                   DOMAIN LAYER                               │
│  Entities, Value Objects, Domain Services, Interfaces       │
└──────────────────┬──────────────────────────────────────────┘
                   │
┌──────────────────┴──────────────────────────────────────────┐
│                INFRASTRUCTURE LAYER                          │
│  Repositories, DbContext, External Services, Email          │
└─────────────────────────────────────────────────────────────┘
```

### 2. CQRS with MediatR
```csharp
// Command Pattern
public class CreateProjectCommand : IRequest<ProjectDto>
{
    public string ProjectName { get; set; }
    public decimal EstimatedCost { get; set; }
}

public class CreateProjectHandler : IRequestHandler<CreateProjectCommand, ProjectDto>
{
    private readonly IProjectRepository _repository;
    
    public async Task<ProjectDto> Handle(CreateProjectCommand request, CancellationToken cancellationToken)
    {
        var project = new Project
        {
            ProjectName = request.ProjectName,
            EstimatedProjectCost = request.EstimatedCost
        };
        
        await _repository.CreateAsync(project);
        return _mapper.Map<ProjectDto>(project);
    }
}

// Query Pattern
public class GetProjectQuery : IRequest<ProjectDto>
{
    public int ProjectId { get; set; }
}

public class GetProjectHandler : IRequestHandler<GetProjectQuery, ProjectDto>
{
    private readonly IProjectRepository _repository;
    
    public async Task<ProjectDto> Handle(GetProjectQuery request, CancellationToken cancellationToken)
    {
        var project = await _repository.GetByIdAsync(request.ProjectId);
        return _mapper.Map<ProjectDto>(project);
    }
}
```

### 3. Repository + Unit of Work Pattern
```csharp
// Repository Interface
public interface IProjectRepository : IRepository<Project>
{
    Task<Project> GetByIdAsync(int id);
    Task<IEnumerable<Project>> GetByStatusAsync(string status);
    Task<Project> CreateAsync(Project project);
    Task UpdateAsync(Project project);
    Task DeleteAsync(int id);
}

// Repository Implementation
public class ProjectRepository : Repository<Project>, IProjectRepository
{
    public ProjectRepository(ApplicationDbContext context) : base(context) { }
    
    public async Task<Project> GetByIdAsync(int id)
    {
        return await _context.Projects
            .Include(p => p.Region)
            .FirstOrDefaultAsync(p => p.ProjectId == id);
    }
}

// Unit of Work
public interface IUnitOfWork
{
    IProjectRepository Projects { get; }
    Task<int> CommitAsync();
}
```

### 4. Dependency Injection Pattern
```csharp
// Program.cs Registration
builder.Services.AddScoped<IProjectRepository, ProjectRepository>();
builder.Services.AddScoped<IProjectService, ProjectService>();
builder.Services.AddMediatR(typeof(CreateProjectHandler));
builder.Services.AddAutoMapper(typeof(ProjectProfile));

// Controller Injection
[ApiController]
[Route("api/[controller]")]
public class ProjectsController : ControllerBase
{
    private readonly IMediator _mediator;
    
    public ProjectsController(IMediator mediator)
    {
        _mediator = mediator;
    }
    
    [HttpPost]
    public async Task<IActionResult> CreateProject(CreateProjectCommand command)
    {
        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetProject), new { id = result.ProjectId }, result);
    }
}
```

## Frontend Architecture Patterns

### 1. Component-Based Architecture
```typescript
// Feature-based folder structure
src/
├── components/           # Reusable UI components
│   ├── common/          # Shared components
│   └── forms/           # Form components
├── pages/               # Page-level components
│   ├── BusinessDevelopment/
│   ├── ProjectManagement/
│   └── MonthlyProgress/
├── services/            # API services
│   ├── authApi.ts
│   ├── projectApi.ts
│   └── opportunityApi.ts
├── hooks/               # Custom React hooks
├── contexts/            # React contexts
├── types/               # TypeScript type definitions
└── utils/               # Utility functions
```

### 2. API Service Pattern
```typescript
// API Service Layer
export const projectApi = {
    getAll: async (status?: string): Promise<Project[]> => {
        const response = await axios.get<Project[]>('/api/projects', {
            params: { status }
        });
        return response.data;
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
```

### 3. Custom Hooks Pattern
```typescript
// Custom Hook for Data Fetching
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
```

## Database Patterns

### 1. Entity Framework Configuration
```csharp
// Entity Configuration
public class ProjectConfiguration : IEntityTypeConfiguration<Project>
{
    public void Configure(EntityTypeBuilder<Project> builder)
    {
        builder.ToTable("Project");
        
        builder.HasKey(p => p.ProjectId);
        
        builder.Property(p => p.ProjectName)
            .IsRequired()
            .HasMaxLength(255);
            
        builder.Property(p => p.EstimatedProjectCost)
            .HasPrecision(18, 2);
            
        builder.HasOne(p => p.Region)
            .WithMany()
            .HasForeignKey(p => p.RegionId);
            
        builder.HasIndex(p => p.ProjectNumber)
            .IsUnique();
    }
}
```

### 2. Audit Pattern
```csharp
// Audit Interceptor
public class AuditInterceptor : SaveChangesInterceptor
{
    public override InterceptionResult<int> SavingChanges(DbContextEventData eventData, InterceptionResult<int> result)
    {
        UpdateAuditFields(eventData.Context);
        return base.SavingChanges(eventData, result);
    }
    
    private void UpdateAuditFields(DbContext context)
    {
        var entries = context.ChangeTracker.Entries()
            .Where(e => e.State == EntityState.Added || e.State == EntityState.Modified);
            
        foreach (var entry in entries)
        {
            if (entry.State == EntityState.Added)
            {
                entry.Property("CreatedAt").CurrentValue = DateTime.UtcNow;
                entry.Property("CreatedBy").CurrentValue = GetCurrentUser();
            }
            
            entry.Property("UpdatedAt").CurrentValue = DateTime.UtcNow;
            entry.Property("UpdatedBy").CurrentValue = GetCurrentUser();
        }
    }
}
```

## Authentication & Authorization Patterns

### 1. JWT Authentication
```csharp
// JWT Configuration
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
        };
    });
```

### 2. Permission-Based Authorization
```csharp
// Permission-based Authorization
[Authorize(Policy = "RequireAdminRole")]
[HttpDelete("{id}")]
public async Task<IActionResult> DeleteProject(int id)
{
    await _mediator.Send(new DeleteProjectCommand { ProjectId = id });
    return NoContent();
}

// Frontend Permission Check
{hasPermission("EDIT_BUSINESS_DEVELOPMENT") && (
    <Button onClick={handleEdit}>Edit Opportunity</Button>
)}
```

## Error Handling Patterns

### 1. Global Exception Middleware
```csharp
public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred");
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";
        
        var response = exception switch
        {
            NotFoundException => new { StatusCode = 404, Message = exception.Message },
            ValidationException => new { StatusCode = 400, Message = exception.Message },
            _ => new { StatusCode = 500, Message = "An error occurred" }
        };
        
        context.Response.StatusCode = response.StatusCode;
        await context.Response.WriteAsync(JsonSerializer.Serialize(response));
    }
}
```

## Performance Patterns

### 1. Caching Strategy
```csharp
// Memory Caching
[HttpGet]
public async Task<IActionResult> GetRegions()
{
    var cacheKey = "regions";
    if (!_cache.TryGetValue(cacheKey, out List<Region> regions))
    {
        regions = await _regionRepository.GetAllAsync();
        _cache.Set(cacheKey, regions, TimeSpan.FromHours(1));
    }
    return Ok(regions);
}
```

### 2. Pagination Pattern
```csharp
// Pagination
public class PagedResult<T>
{
    public List<T> Items { get; set; }
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
}

[HttpGet]
public async Task<IActionResult> GetProjects([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
{
    var result = await _projectRepository.GetPagedAsync(page, pageSize);
    return Ok(result);
}
```

## AI-DLC Integration Patterns

### 1. Specification-Driven Development
- All features start with AI-DLC YAML specification
- Code generation follows established patterns
- Validation ensures pattern compliance

### 2. Quality Gates
- Automated code quality checks
- Pattern compliance validation
- Performance benchmarking
- Security scanning

### 3. Documentation Generation
- Auto-generated API documentation
- Architecture decision records
- Pattern usage examples

This architecture ensures scalable, maintainable, and consistent code generation through AI-DLC implementation.