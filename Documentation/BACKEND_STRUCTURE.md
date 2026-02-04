# BACKEND STRUCTURE

## Complete Directory Tree

```
KarmaTech_AI_EDR/
├── backend/                                      # C# .NET Backend
│   ├── src/
│   │   ├── NJSAPI/                              # Web API Project (Presentation Layer)
│   │   │   ├── Controllers/                     # API Controllers (24 controllers)
│   │   │   │   ├── AuditController.cs           # Audit log retrieval
│   │   │   │   ├── BidPreparationController.cs  # Bid document management
│   │   │   │   ├── ChangeControlController.cs   # Change request management
│   │   │   │   ├── CheckReviewController.cs     # Quality check reviews
│   │   │   │   ├── CorrespondenceController.cs  # Inward/outward letters
│   │   │   │   ├── ExcelController.cs           # Excel export functionality
│   │   │   │   ├── GoNoGoDecisionController.cs  # Go/No-Go decisions
│   │   │   │   ├── GoNoGoDecisionOpportunityController.cs
│   │   │   │   ├── InputRegisterController.cs   # Input document tracking
│   │   │   │   ├── JobStartFormController.cs    # Project kickoff forms
│   │   │   │   ├── JobStartFormHeaderController.cs
│   │   │   │   ├── MonthlyHoursController.cs    # Time tracking
│   │   │   │   ├── MonthlyProgressController.cs # Monthly reporting
│   │   │   │   ├── OpportunityTrackingController.cs # Opportunity management
│   │   │   │   ├── PMWorkflowController.cs      # Workflow state management
│   │   │   │   ├── ProjectClosureController.cs  # Project closure
│   │   │   │   ├── ProjectController.cs         # Project CRUD operations
│   │   │   │   ├── ResourceController.cs        # Resource allocation
│   │   │   │   ├── RoleController.cs            # Role management
│   │   │   │   ├── ScoringDescriptionController.cs # Scoring criteria
│   │   │   │   ├── UserController.cs            # User management & authentication
│   │   │   │   ├── WBSController.cs             # Work breakdown structure
│   │   │   │   ├── WBSHeaderController.cs       # WBS headers
│   │   │   │   └── WBSOptionsController.cs      # WBS dropdown options
│   │   │   ├── Configurations/
│   │   │   │   └── SwaggerSettings.cs           # Swagger configuration
│   │   │   ├── Extensions/
│   │   │   │   ├── CompressionExtensions.cs     # Response compression setup
│   │   │   │   └── SwaggerExtensions.cs         # Swagger DI extensions
│   │   │   ├── Model/                           # API request/response models
│   │   │   │   └── ProjectCreateModel.cs
│   │   │   ├── Routes/
│   │   │   │   └── ApiRoutes.cs                 # Route constants
│   │   │   ├── appsettings.json                 # Development configuration
│   │   │   ├── appsettings.Production.json      # Production configuration
│   │   │   ├── nlog.config                      # Logging configuration
│   │   │   ├── Program.cs                       # Application startup
│   │   │   └── NJSAPI.csproj                    # Project file
│   │   │
│   │   ├── NJS.Application/                     # Business Logic Layer
│   │   │   ├── Services/                        # Application services
│   │   │   │   ├── IContract/                   # Service interfaces
│   │   │   │   │   ├── IAuthService.cs
│   │   │   │   │   ├── IEmailService.cs
│   │   │   │   │   ├── IGoNoGoDecisionService.cs
│   │   │   │   │   ├── INotificationService.cs
│   │   │   │   │   └── IProjectManagementService.cs
│   │   │   │   ├── AuthService.cs               # JWT token generation & validation
│   │   │   │   ├── EmailService.cs              # SMTP email service (MailKit)
│   │   │   │   ├── GoNoGoDecisionService.cs     # Go/No-Go business logic
│   │   │   │   ├── NotificationService.cs       # Notification management
│   │   │   │   └── ProjectManagementService.cs  # Project lifecycle management
│   │   │   ├── Dtos/                            # Data Transfer Objects
│   │   │   │   ├── BidPreparationDto.cs
│   │   │   │   ├── GoNoGoDecisionDto.cs
│   │   │   │   ├── JobStartFormDto.cs
│   │   │   │   ├── MonthlyProgressDto.cs
│   │   │   │   ├── OpportunityTrackingDto.cs
│   │   │   │   ├── ProjectClosureDto.cs
│   │   │   │   ├── ProjectDto.cs
│   │   │   │   ├── UserDto.cs
│   │   │   │   └── WorkBreakdownStructureDto.cs
│   │   │   ├── CQRS/                            # Command Query Responsibility Segregation
│   │   │   │   ├── Commands/                    # Commands (write operations)
│   │   │   │   │   ├── CreateProjectCommand.cs
│   │   │   │   │   ├── UpdateProjectCommand.cs
│   │   │   │   │   └── DeleteProjectCommand.cs
│   │   │   │   └── Queries/                     # Queries (read operations)
│   │   │   │       ├── GetAllProjectsQuery.cs
│   │   │   │       ├── GetProjectByIdQuery.cs
│   │   │   │       └── GetProjectsByStatusQuery.cs
│   │   │   ├── Extensions/
│   │   │   │   └── ServiceCollectionExtensions.cs # DI registration
│   │   │   ├── Strategies/                      # Workflow strategies
│   │   │   │   ├── ChangeControlWorkflowStrategy.cs
│   │   │   │   ├── JobStartFormWorkflowStrategy.cs
│   │   │   │   ├── ProjectClosureWorkflowStrategy.cs
│   │   │   │   └── WBSWorkflowStrategy.cs
│   │   │   └── NJS.Application.csproj
│   │   │
│   │   ├── NJS.Domain/                          # Domain Layer (Entities & Context)
│   │   │   ├── Entities/                        # Entity models (60+ entities)
│   │   │   │   ├── AuditLog.cs                  # Audit trail entity
│   │   │   │   ├── BidPreparation.cs            # Bid document entity
│   │   │   │   ├── BidVersionHistory.cs         # Bid version tracking
│   │   │   │   ├── BudgetTable.cs               # Budget entity
│   │   │   │   ├── ChangeControl.cs             # Change control entity
│   │   │   │   ├── ChangeControlWorkflowHistory.cs
│   │   │   │   ├── ChangeOrder.cs               # Change order entity
│   │   │   │   ├── CheckReview.cs               # Quality check entity
│   │   │   │   ├── ContractAndCost.cs           # Contract cost entity
│   │   │   │   ├── CorrespondenceInward.cs      # Inward correspondence
│   │   │   │   ├── CorrespondenceOutward.cs     # Outward correspondence
│   │   │   │   ├── CTCEAC.cs                    # Cost to complete & EAC
│   │   │   │   ├── CurrentBudgetInMIS.cs        # Current budget entity
│   │   │   │   ├── CurrentMonthAction.cs        # Current month actions
│   │   │   │   ├── EarlyWarning.cs              # Early warning entity
│   │   │   │   ├── FailedEmailLog.cs            # Failed email tracking
│   │   │   │   ├── FinancialDetails.cs          # Financial details entity
│   │   │   │   ├── GoNoGoDecision.cs            # Go/No-Go decision
│   │   │   │   ├── GoNoGoDecisionHeader.cs
│   │   │   │   ├── GoNoGoDecisionOpportunity.cs
│   │   │   │   ├── GoNoGoDecisionTransaction.cs
│   │   │   │   ├── GoNoGoVersion.cs             # Go/No-Go version control
│   │   │   │   ├── IAuditableEntity.cs          # Auditable interface
│   │   │   │   ├── InputRegister.cs             # Input register entity
│   │   │   │   ├── JobStartForm.cs              # Job start form entity
│   │   │   │   ├── JobStartFormHeader.cs
│   │   │   │   ├── JobStartFormHistory.cs
│   │   │   │   ├── JobStartFormResource.cs
│   │   │   │   ├── JobStartFormSelection.cs
│   │   │   │   ├── LastMonthAction.cs           # Last month actions
│   │   │   │   ├── ManpowerPlanning.cs          # Manpower planning
│   │   │   │   ├── MonthlyProgress.cs           # Monthly progress entity
│   │   │   │   ├── OpportunityHistory.cs        # Opportunity audit trail
│   │   │   │   ├── OpportunityStatus.cs         # Opportunity status
│   │   │   │   ├── OpportunityTracking.cs       # Opportunity entity
│   │   │   │   ├── OriginalBudget.cs            # Original budget entity
│   │   │   │   ├── PercentCompleteOnCosts.cs    # Cost completion %
│   │   │   │   ├── Permission.cs                # Permission entity
│   │   │   │   ├── PMWorkflowStatus.cs          # Workflow status
│   │   │   │   ├── ProgrammeSchedule.cs         # Programme schedule
│   │   │   │   ├── ProgressDeliverable.cs       # Progress deliverable
│   │   │   │   ├── Project.cs                   # Project entity
│   │   │   │   ├── ProjectClosure.cs            # Project closure entity
│   │   │   │   ├── ProjectClosureWorkflowHistory.cs
│   │   │   │   ├── ProjectResource.cs           # Project resources
│   │   │   │   ├── Region.cs                    # Region entity
│   │   │   │   ├── Role.cs                      # Role entity
│   │   │   │   ├── RolePermission.cs            # Role-Permission mapping
│   │   │   │   ├── Schedule.cs                  # Schedule entity
│   │   │   │   ├── ScoreRange.cs                # Scoring range
│   │   │   │   ├── ScoringCriteria.cs           # Scoring criteria
│   │   │   │   ├── ScoringDescriptions.cs       # Scoring descriptions
│   │   │   │   ├── ScoringDescriptionSummarry.cs
│   │   │   │   ├── Settings.cs                  # Application settings
│   │   │   │   ├── User.cs                      # User entity (extends IdentityUser)
│   │   │   │   ├── UserWBSTask.cs               # User-task assignment
│   │   │   │   ├── WBSHistory.cs                # WBS history
│   │   │   │   ├── WBSOption.cs                 # WBS options
│   │   │   │   ├── WBSTask.cs                   # WBS task entity
│   │   │   │   ├── WBSTaskLevel.cs              # WBS task levels
│   │   │   │   ├── WBSTaskMonthlyHour.cs        # Monthly hours tracking
│   │   │   │   ├── WBSTaskMonthlyHourHeader.cs
│   │   │   │   ├── WorkBreakdownStructure.cs    # WBS root entity
│   │   │   │   └── WorkflowEntry.cs             # Workflow entry
│   │   │   ├── Database/
│   │   │   │   └── ProjectManagementContext.cs  # EF Core DbContext
│   │   │   ├── Services/                        # Domain services
│   │   │   │   └── IEmailService.cs
│   │   │   ├── Migrations/                      # EF Core migrations (100+ files)
│   │   │   │   ├── 20241001000000_InitialCreate.cs
│   │   │   │   ├── 20241015000000_AddAuditLog.cs
│   │   │   │   └── ... (many more)
│   │   │   ├── Interceptors/
│   │   │   │   └── AuditSaveChangesInterceptor.cs # Audit logging interceptor
│   │   │   ├── Extensions/
│   │   │   │   └── ServiceCollectionExtensions.cs
│   │   │   └── NJS.Domain.csproj
│   │   │
│   │   └── NJS.Infrastructure/                  # Infrastructure Layer
│   │       ├── Services/                        # Infrastructure services
│   │       │   └── EmailService.cs
│   │       └── NJS.Infrastructure.csproj
│   │
│   ├── NJS.Repositories/                        # Data Access Layer
│   │   ├── Repositories/                        # Repository implementations
│   │   │   ├── BidPreparationRepository.cs
│   │   │   ├── GoNoGoRepository.cs
│   │   │   ├── JobStartFormRepository.cs
│   │   │   ├── MonthlyProgressRepository.cs
│   │   │   ├── OpportunityHistoryRepository.cs
│   │   │   ├── PermissionRepository.cs
│   │   │   ├── ProjectRepository.cs
│   │   │   ├── RoleRepository.cs
│   │   │   ├── UserRepository.cs
│   │   │   ├── WBSHistoryRepository.cs
│   │   │   ├── WorkBreakdownStructureRepository.cs
│   │   │   └── ... (15+ repositories)
│   │   ├── Interfaces/                          # Repository interfaces
│   │   │   ├── IBidPreparationRepository.cs
│   │   │   ├── IGoNoGoRepository.cs
│   │   │   ├── IOpportunityHistoryRepository.cs
│   │   │   ├── IPermissionRepository.cs
│   │   │   ├── IProjectRepository.cs
│   │   │   ├── IRoleRepository.cs
│   │   │   ├── IUserRepository.cs
│   │   │   ├── IWorkBreakdownStructureRepository.cs
│   │   │   └── ... (15+ interfaces)
│   │   └── NJS.Repositories.csproj
│   │
│   ├── NJS.API.Tests/                           # Integration tests
│   │   ├── Controllers/
│   │   └── NJS.API.Tests.csproj
│   │
│   ├── NJS.Domain.Tests/                        # Unit tests
│   │   ├── Services/
│   │   └── NJS.Domain.Tests.csproj
│   │
│   ├── Database/
│   │   └── Input/                               # SQL seed scripts
│   │       ├── AuditLog.sql
│   │       ├── OpportunityStatus.sql
│   │       ├── PMWorkflowStatus.sql
│   │       └── WBSOptions.sql
│   │
│   ├── config/                                  # Configuration files
│   │   └── database.config.json
│   │
│   ├── NJS_backend.sln                          # Visual Studio solution
│   ├── setup-database.ps1                       # Database setup script
│   ├── restore-and-build.ps1                    # Build script
│   └── README.md
│
└── node-backend/                                # Node.js/Express Backend
    ├── src/
    │   ├── app.ts                               # Express app entry point
    │   ├── controllers/                         # Request handlers
    │   │   ├── authController.ts                # Authentication logic
    │   │   ├── projectController.ts             # Project CRUD
    │   │   ├── userController.ts                # User management
    │   │   └── wbsController.ts                 # WBS operations
    │   ├── models/                              # Mongoose schemas
    │   │   ├── User.ts                          # User schema
    │   │   ├── Project.ts                       # Project schema
    │   │   ├── GoNoGoDecision.ts                # Decision schema
    │   │   └── WorkBreakdownStructure.ts        # WBS schema
    │   ├── routes/                              # Route definitions
    │   │   ├── authRoutes.ts
    │   │   ├── projectRoutes.ts
    │   │   ├── userRoutes.ts
    │   │   └── wbsRoutes.ts
    │   ├── middleware/                          # Custom middleware
    │   │   ├── authMiddleware.ts                # JWT verification
    │   │   └── errorHandler.ts                  # Error handling
    │   ├── config/
    │   │   └── database.ts                      # MongoDB connection
    │   └── utils/
    │       └── helpers.ts
    ├── dist/                                    # Compiled JavaScript
    ├── .env                                     # Environment variables
    ├── package.json
    ├── tsconfig.json                            # TypeScript config
    └── README.md
```

## Key Classes and Their Responsibilities

### API Layer (Controllers)

#### ProjectController.cs
**Location**: `backend/src/NJSAPI/Controllers/ProjectController.cs`

**Responsibilities**:
- Handle HTTP requests for project operations
- CRUD operations for projects
- Project status updates
- Project filtering and searching

**Key Methods**:
```csharp
[HttpGet] GetAllProjects() -> Returns list of all projects
[HttpGet("{id}")] GetProjectById(string id) -> Returns single project
[HttpPost] CreateProject(ProjectCreateModel model) -> Creates new project
[HttpPut("{id}")] UpdateProject(string id, ProjectUpdateModel model) -> Updates project
[HttpDelete("{id}")] DeleteProject(string id) -> Deletes project
[HttpGet("status/{status}")] GetProjectsByStatus(string status) -> Filters by status
```

#### UserController.cs
**Location**: `backend/src/NJSAPI/Controllers/UserController.cs`

**Responsibilities**:
- User authentication (login/logout)
- User registration
- User profile management
- Password management

**Key Methods**:
```csharp
[HttpPost("login")] Login(LoginModel model) -> Authenticates user, returns JWT token
[HttpPost("register")] Register(RegisterModel model) -> Creates new user
[HttpGet("{id}")] GetUser(string id) -> Returns user details
[HttpPut("{id}")] UpdateUser(string id, UserUpdateModel model) -> Updates user
[HttpPost("change-password")] ChangePassword(ChangePasswordModel model) -> Changes password
```

#### OpportunityTrackingController.cs
**Location**: `backend/src/NJSAPI/Controllers/OpportunityTrackingController.cs`

**Responsibilities**:
- Opportunity CRUD operations
- Opportunity status workflow
- Opportunity history tracking
- Approval workflow management

**Key Methods**:
```csharp
[HttpGet] GetAllOpportunities() -> Returns all opportunities
[HttpPost] CreateOpportunity(OpportunityDto dto) -> Creates opportunity
[HttpPut("{id}")] UpdateOpportunity(string id, OpportunityDto dto) -> Updates opportunity
[HttpPost("{id}/submit")] SubmitForApproval(string id) -> Submits for approval
[HttpGet("{id}/history")] GetHistory(string id) -> Returns audit trail
```

#### GoNoGoDecisionController.cs
**Location**: `backend/src/NJSAPI/Controllers/GoNoGoDecisionController.cs`

**Responsibilities**:
- Go/No-Go decision creation
- Scoring criteria management
- Decision versioning
- Decision approval workflow

**Key Methods**:
```csharp
[HttpGet] GetAllDecisions() -> Returns all decisions
[HttpPost] CreateDecision(GoNoGoDto dto) -> Creates decision
[HttpPut("{id}")] UpdateDecision(string id, GoNoGoDto dto) -> Updates decision
[HttpPost("{id}/score")] ScoreDecision(string id, ScoringDto dto) -> Scores criteria
[HttpGet("{id}/versions")] GetVersions(string id) -> Returns version history
```

#### MonthlyProgressController.cs
**Location**: `backend/src/NJSAPI/Controllers/MonthlyProgressController.cs`

**Responsibilities**:
- Monthly progress report creation
- Financial tracking
- Schedule monitoring
- Deliverable tracking

**Key Methods**:
```csharp
[HttpGet("project/{projectId}")] GetProgressByProject(string projectId) -> Returns monthly reports
[HttpPost] CreateProgress(MonthlyProgressDto dto) -> Creates monthly report
[HttpPut("{id}")] UpdateProgress(string id, MonthlyProgressDto dto) -> Updates report
[HttpGet("{id}/financial")] GetFinancialDetails(string id) -> Returns financial data
```

#### ProjectClosureController.cs
**Location**: `backend/src/NJSAPI/Controllers/ProjectClosureController.cs`

**Responsibilities**:
- Project closure documentation
- Lessons learned capture
- Final approvals
- Closure workflow

**Key Methods**:
```csharp
[HttpGet("project/{projectId}")] GetClosureByProject(string projectId) -> Returns closure doc
[HttpPost] CreateClosure(ProjectClosureDto dto) -> Creates closure
[HttpPut("{id}")] UpdateClosure(string id, ProjectClosureDto dto) -> Updates closure
[HttpPost("{id}/submit")] SubmitForApproval(string id) -> Submits for approval
```

### Application Layer (Services)

#### AuthService.cs
**Location**: `backend/src/NJS.Application/Services/AuthService.cs`

**Responsibilities**:
- User authentication validation
- JWT token generation
- Token verification
- Role and permission retrieval

**Key Methods**:
```csharp
ValidateUserAsync(string email, string password) -> (bool success, User user, string token)
  - Finds user by email
  - Validates password with UserManager
  - Generates JWT token
  - Updates last login time
  - Returns success status, user object, and JWT token

GenerateJwtTokenAsync(User user) -> string
  - Creates JWT claims (sub, email, jti, name, role, permissions)
  - Retrieves user roles from UserManager
  - Retrieves permissions from PermissionRepository
  - Creates JWT token with 3-hour expiration
  - Returns token string

VerifyToken(string token) -> bool
  - Validates token signature
  - Checks issuer and audience
  - Verifies expiration
  - Returns validation result

CreateRoleAsync(string roleName) -> bool
  - Creates new role if it doesn't exist
  - Returns success status

AssignRoleToUserAsync(User user, string roleName) -> bool
  - Assigns role to user
  - Returns success status
```

**Dependencies**:
- `IConfiguration`: For JWT settings
- `UserManager<User>`: ASP.NET Core Identity user management
- `RoleManager<Role>`: Role management
- `IPermissionRepository`: Permission retrieval

**Example Token Claims**:
```csharp
claims = [
  new Claim(JwtRegisteredClaimNames.Sub, user.Id),
  new Claim(JwtRegisteredClaimNames.Email, user.Email),
  new Claim(ClaimTypes.Name, user.UserName),
  new Claim(ClaimTypes.Role, "Admin"),
  new Claim("Permissions", "EDIT_BUSINESS_DEVELOPMENT,APPROVE_PROJECT")
]
```

#### EmailService.cs
**Location**: `backend/src/NJS.Application/Services/EmailService.cs`

**Responsibilities**:
- Send email notifications
- SMTP connection management
- Email templating
- Failed email logging

**Key Methods**:
```csharp
SendEmailAsync(string to, string subject, string body) -> Task<bool>
  - Connects to SMTP server (smtp.gmail.com:587)
  - Creates MimeMessage
  - Sends email
  - Logs failures to FailedEmailLog table
  - Returns success status

SendNotificationAsync(string userId, string template, Dictionary<string, string> data) -> Task
  - Retrieves user email
  - Applies template
  - Sends email notification
```

**Configuration** (appsettings.json):
```json
"EmailSettings": {
  "SmtpServer": "smtp.gmail.com",
  "Port": 587,
  "Username": "dishadais2025@gmail.com",
  "Password": "grstgibxcsxhjyrz",
  "FromEmail": "dishadais2025@gmail.com",
  "FromName": "NJS Project Management",
  "EnableSsl": true,
  "EnableEmailNotifications": true
}
```

#### ProjectManagementService.cs
**Location**: `backend/src/NJS.Application/Services/ProjectManagementService.cs`

**Responsibilities**:
- Project lifecycle management
- Project validation
- Business logic for project operations
- Project status transitions

**Key Methods**:
```csharp
CreateProjectAsync(ProjectDto dto) -> Task<Project>
UpdateProjectAsync(string id, ProjectDto dto) -> Task<Project>
DeleteProjectAsync(string id) -> Task<bool>
GetProjectByIdAsync(string id) -> Task<ProjectDto>
ValidateProjectAsync(ProjectDto dto) -> ValidationResult
```

#### GoNoGoDecisionService.cs
**Location**: `backend/src/NJS.Application/Services/GoNoGoDecisionService.cs`

**Responsibilities**:
- Decision scoring logic
- Score calculation
- Version management
- Decision approval workflow

**Key Methods**:
```csharp
CalculateScore(GoNoGoDecision decision) -> decimal
CreateVersion(string decisionId) -> GoNoGoVersion
ApproveDecision(string decisionId) -> bool
```

### Domain Layer (Entities)

#### ProjectManagementContext.cs
**Location**: `backend/src/NJS.Domain/Database/ProjectManagementContext.cs`

**Responsibilities**:
- Entity Framework Core DbContext
- Database schema definition
- Entity relationships configuration
- Decimal precision configuration

**DbSets** (85+ entities):
```csharp
public DbSet<Project> Projects { get; set; }
public DbSet<User> Users { get; set; }
public DbSet<Role> Roles { get; set; }
public DbSet<Permission> Permissions { get; set; }
public DbSet<OpportunityTracking> OpportunityTrackings { get; set; }
public DbSet<GoNoGoDecision> GoNoGoDecisions { get; set; }
public DbSet<WorkBreakdownStructure> WorkBreakdownStructures { get; set; }
public DbSet<MonthlyProgress> MonthlyProgresses { get; set; }
public DbSet<ProjectClosure> ProjectClosures { get; set; }
public DbSet<ChangeControl> ChangeControls { get; set; }
public DbSet<AuditLog> AuditLogs { get; set; }
// ... 75+ more entities
```

**Key Configurations**:
```csharp
// One-to-One relationships
modelBuilder.Entity<MonthlyProgress>()
    .HasOne(mp => mp.FinancialDetails)
    .WithOne(fd => fd.MonthlyProgress)
    .HasForeignKey<FinancialDetails>(fd => fd.MonthlyProgressId);

// One-to-Many relationships
modelBuilder.Entity<MonthlyProgress>()
    .HasMany(mp => mp.ManpowerEntries)
    .WithOne(mpe => mpe.MonthlyProgress)
    .HasForeignKey(mpe => mpe.MonthlyProgressId);

// Decimal precision for financial fields
modelBuilder.Entity<Project>()
    .Property(f => f.EstimatedProjectCost)
    .HasPrecision(18, 2);

// Self-referencing hierarchies
modelBuilder.Entity<WBSTask>()
    .HasOne(t => t.Parent)
    .WithMany(t => t.Children)
    .HasForeignKey(t => t.ParentId)
    .OnDelete(DeleteBehavior.Restrict);
```

#### User.cs
**Location**: `backend/src/NJS.Domain/Entities/User.cs`

**Inheritance**: Extends `IdentityUser` from ASP.NET Core Identity

**Properties**:
```csharp
public class User : IdentityUser
{
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Avatar { get; set; }
    public DateTime? LastLogin { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    public ICollection<UserWBSTask> UserWBSTasks { get; set; }
    public ICollection<OpportunityHistory> OpportunityHistories { get; set; }
}
```

#### Project.cs
**Location**: `backend/src/NJS.Domain/Entities/Project.cs`

**Properties**:
```csharp
public class Project
{
    public int ProjectId { get; set; }
    public string ProjectName { get; set; }
    public string ProjectNumber { get; set; }
    public string Description { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string Status { get; set; }
    public decimal EstimatedProjectCost { get; set; }
    public decimal EstimatedProjectFee { get; set; }
    public string ProjectManager { get; set; }
    public int? RegionId { get; set; }

    // Navigation properties
    public Region Region { get; set; }
}
```

#### AuditLog.cs
**Location**: `backend/src/NJS.Domain/Entities/AuditLog.cs`

**Properties**:
```csharp
public class AuditLog
{
    public int Id { get; set; }
    public string EntityName { get; set; }
    public string Action { get; set; }  // INSERT, UPDATE, DELETE
    public string EntityId { get; set; }
    public string OldValues { get; set; }  // JSON
    public string NewValues { get; set; }  // JSON
    public string ChangedBy { get; set; }
    public DateTime ChangedAt { get; set; }
    public string Reason { get; set; }
    public string IpAddress { get; set; }
    public string UserAgent { get; set; }
}
```

### Repository Layer

#### IProjectRepository.cs
**Location**: `backend/NJS.Repositories/Interfaces/IProjectRepository.cs`

**Interface Definition**:
```csharp
public interface IProjectRepository
{
    Task<IEnumerable<Project>> GetAllAsync();
    Task<Project> GetByIdAsync(int id);
    Task<Project> CreateAsync(Project project);
    Task<Project> UpdateAsync(Project project);
    Task<bool> DeleteAsync(int id);
    Task<IEnumerable<Project>> GetByStatusAsync(string status);
    Task<IEnumerable<Project>> GetByRegionAsync(int regionId);
}
```

#### ProjectRepository.cs
**Location**: `backend/NJS.Repositories/Repositories/ProjectRepository.cs`

**Implementation**:
```csharp
public class ProjectRepository : IProjectRepository
{
    private readonly ProjectManagementContext _context;

    public ProjectRepository(ProjectManagementContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Project>> GetAllAsync()
    {
        return await _context.Projects
            .Include(p => p.Region)
            .ToListAsync();
    }

    public async Task<Project> GetByIdAsync(int id)
    {
        return await _context.Projects
            .Include(p => p.Region)
            .FirstOrDefaultAsync(p => p.ProjectId == id);
    }

    public async Task<Project> CreateAsync(Project project)
    {
        _context.Projects.Add(project);
        await _context.SaveChangesAsync();
        return project;
    }

    // ... other methods
}
```

## Entity Framework Setup and Conventions

### Connection String Configuration

**Location**: `backend/src/NJSAPI/appsettings.json`

```json
"ConnectionStrings": {
  "AppDbConnection": "Server=localhost;Database=KarmaTechAI_SAAS;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true;"
}
```

### DbContext Registration

**Location**: `backend/src/NJS.Domain/Extensions/ServiceCollectionExtensions.cs`

```csharp
public static IServiceCollection AddDatabaseServices(
    this IServiceCollection services,
    IConfiguration configuration)
{
    services.AddDbContext<ProjectManagementContext>(options =>
        options.UseSqlServer(
            configuration.GetConnectionString("AppDbConnection"),
            sqlOptions => {
                sqlOptions.EnableRetryOnFailure();
                sqlOptions.CommandTimeout(30);
            }
        )
    );

    // Add EF Core interceptors
    services.AddScoped<AuditSaveChangesInterceptor>();

    return services;
}
```

### Naming Conventions

#### Entity Naming
- **Singular**: Entity classes are singular (e.g., `Project`, not `Projects`)
- **PascalCase**: All entity names use PascalCase
- **Suffix**: No special suffix (e.g., no `Entity` or `Model` suffix)

#### Property Naming
- **PascalCase**: All properties use PascalCase
- **Descriptive**: Full words, no abbreviations (except well-known ones like ID)
- **ID Pattern**: Primary keys use `{EntityName}Id` (e.g., `ProjectId`, `UserId`)

#### DbSet Naming
- **Plural**: DbSets use plural form (e.g., `Projects`, `Users`)
- **PascalCase**: Use PascalCase

#### Table Naming
- **Default**: EF Core uses DbSet name as table name (plural)
- **Override**: Can override with `[Table("CustomName")]` attribute or Fluent API

#### Foreign Key Conventions
- **Pattern**: `{RelatedEntity}Id` (e.g., `ProjectId`, `RegionId`)
- **Nullable**: Use nullable int (`int?`) for optional relationships

### Migration Strategy

#### Creating Migrations
```bash
# Navigate to Domain project
cd backend/src/NJS.Domain

# Add new migration
dotnet ef migrations add MigrationName --startup-project ../NJSAPI

# Update database
dotnet ef database update --startup-project ../NJSAPI
```

#### Migration File Location
- **Path**: `backend/src/NJS.Domain/Migrations/`
- **Pattern**: `{Timestamp}_{MigrationName}.cs`
- **Example**: `20241015120000_AddAuditLog.cs`

## All API Endpoints (Organized by Feature)

### Authentication & User Management

```
Base URL: /api/user

[POST]   /api/user/login
  Description: Authenticate user and return JWT token
  Request Body: { "email": "user@example.com", "password": "Password123!" }
  Response: { "token": "eyJ...", "user": {...}, "success": true }
  Status Codes: 200 (Success), 401 (Unauthorized)

[POST]   /api/user/register
  Description: Register new user
  Request Body: { "email": "", "password": "", "firstName": "", "lastName": "" }
  Response: { "userId": "...", "success": true }
  Status Codes: 201 (Created), 400 (Bad Request)

[GET]    /api/user/{id}
  Description: Get user by ID
  Response: { "userId": "", "email": "", "firstName": "", "lastName": "", ... }
  Status Codes: 200 (Success), 404 (Not Found)

[PUT]    /api/user/{id}
  Description: Update user profile
  Request Body: { "firstName": "", "lastName": "", "avatar": "" }
  Response: { "success": true }
  Status Codes: 200 (Success), 404 (Not Found)

[DELETE] /api/user/{id}
  Description: Delete user (soft delete)
  Response: { "success": true }
  Status Codes: 200 (Success), 404 (Not Found)

[GET]    /api/user
  Description: Get all users
  Response: [{ "userId": "", "email": "", ... }]
  Status Codes: 200 (Success)

[POST]   /api/user/change-password
  Description: Change user password
  Request Body: { "oldPassword": "", "newPassword": "" }
  Response: { "success": true }
  Status Codes: 200 (Success), 400 (Bad Request)
```

### Role & Permission Management

```
Base URL: /api/role

[GET]    /api/role
  Description: Get all roles
  Response: [{ "roleId": "", "roleName": "", "permissions": [...] }]
  Status Codes: 200 (Success)

[GET]    /api/role/{id}
  Description: Get role by ID
  Response: { "roleId": "", "roleName": "", "permissions": [...] }
  Status Codes: 200 (Success), 404 (Not Found)

[POST]   /api/role
  Description: Create new role
  Request Body: { "roleName": "", "permissionIds": [...] }
  Response: { "roleId": "", "success": true }
  Status Codes: 201 (Created), 400 (Bad Request)

[PUT]    /api/role/{id}
  Description: Update role
  Request Body: { "roleName": "", "permissionIds": [...] }
  Response: { "success": true }
  Status Codes: 200 (Success), 404 (Not Found)

[DELETE] /api/role/{id}
  Description: Delete role
  Response: { "success": true }
  Status Codes: 200 (Success), 404 (Not Found)

[GET]    /api/role/{id}/permissions
  Description: Get permissions for role
  Response: [{ "permissionId": "", "name": "", "description": "" }]
  Status Codes: 200 (Success)
```

### Project Management

```
Base URL: /api/projects

[GET]    /api/projects
  Description: Get all projects
  Response: [{ "projectId": 1, "projectName": "", "status": "", ... }]
  Status Codes: 200 (Success)

[GET]    /api/projects/{id}
  Description: Get project by ID
  Response: { "projectId": 1, "projectName": "", "description": "", ... }
  Status Codes: 200 (Success), 404 (Not Found)

[POST]   /api/projects
  Description: Create new project
  Request Body: { "projectName": "", "description": "", "startDate": "", ... }
  Response: { "projectId": 1, "success": true }
  Status Codes: 201 (Created), 400 (Bad Request)

[PUT]    /api/projects/{id}
  Description: Update project
  Request Body: { "projectName": "", "description": "", "status": "", ... }
  Response: { "success": true }
  Status Codes: 200 (Success), 404 (Not Found)

[DELETE] /api/projects/{id}
  Description: Delete project
  Response: { "success": true }
  Status Codes: 200 (Success), 404 (Not Found)

[GET]    /api/projects/status/{status}
  Description: Get projects by status
  Response: [{ "projectId": 1, "projectName": "", ... }]
  Status Codes: 200 (Success)

[GET]    /api/projects/region/{regionId}
  Description: Get projects by region
  Response: [{ "projectId": 1, "projectName": "", ... }]
  Status Codes: 200 (Success)
```

### Opportunity Tracking

```
Base URL: /api/opportunities

[GET]    /api/opportunities
  Description: Get all opportunities
  Response: [{ "opportunityId": 1, "title": "", "status": "", ... }]
  Status Codes: 200 (Success)

[GET]    /api/opportunities/{id}
  Description: Get opportunity by ID
  Response: { "opportunityId": 1, "title": "", "description": "", ... }
  Status Codes: 200 (Success), 404 (Not Found)

[POST]   /api/opportunities
  Description: Create new opportunity
  Request Body: { "title": "", "description": "", "bidFees": 0, ... }
  Response: { "opportunityId": 1, "success": true }
  Status Codes: 201 (Created), 400 (Bad Request)

[PUT]    /api/opportunities/{id}
  Description: Update opportunity
  Request Body: { "title": "", "description": "", "status": "", ... }
  Response: { "success": true }
  Status Codes: 200 (Success), 404 (Not Found)

[DELETE] /api/opportunities/{id}
  Description: Delete opportunity
  Response: { "success": true }
  Status Codes: 200 (Success), 404 (Not Found)

[POST]   /api/opportunities/{id}/submit
  Description: Submit opportunity for approval
  Response: { "success": true }
  Status Codes: 200 (Success), 404 (Not Found)

[GET]    /api/opportunities/{id}/history
  Description: Get opportunity history
  Response: [{ "historyId": 1, "action": "", "changedBy": "", "date": "" }]
  Status Codes: 200 (Success)
```

### Go/No-Go Decision Management

```
Base URL: /api/gonogo

[GET]    /api/gonogo
  Description: Get all Go/No-Go decisions
  Response: [{ "decisionId": 1, "opportunityId": 1, "score": 75, ... }]
  Status Codes: 200 (Success)

[GET]    /api/gonogo/{id}
  Description: Get decision by ID
  Response: { "decisionId": 1, "opportunityId": 1, "criteria": [...] }
  Status Codes: 200 (Success), 404 (Not Found)

[POST]   /api/gonogo
  Description: Create new decision
  Request Body: { "opportunityId": 1, "criteria": [...] }
  Response: { "decisionId": 1, "success": true }
  Status Codes: 201 (Created), 400 (Bad Request)

[PUT]    /api/gonogo/{id}
  Description: Update decision
  Request Body: { "criteria": [...] }
  Response: { "success": true }
  Status Codes: 200 (Success), 404 (Not Found)

[GET]    /api/gonogo/{id}/versions
  Description: Get decision versions
  Response: [{ "versionId": 1, "versionNumber": 1, "date": "" }]
  Status Codes: 200 (Success)

[POST]   /api/gonogo/{id}/score
  Description: Score decision criteria
  Request Body: { "criteriaId": 1, "score": 5, "comments": "" }
  Response: { "totalScore": 75, "success": true }
  Status Codes: 200 (Success)
```

### Bid Preparation

```
Base URL: /api/bidprep

[GET]    /api/bidprep
  Description: Get all bid preparations
  Response: [{ "bidId": 1, "opportunityId": 1, "status": "", ... }]
  Status Codes: 200 (Success)

[GET]    /api/bidprep/{id}
  Description: Get bid by ID
  Response: { "bidId": 1, "opportunityId": 1, "documentCategories": [...] }
  Status Codes: 200 (Success), 404 (Not Found)

[POST]   /api/bidprep
  Description: Create new bid
  Request Body: { "opportunityId": 1, "documentCategories": [...] }
  Response: { "bidId": 1, "success": true }
  Status Codes: 201 (Created), 400 (Bad Request)

[PUT]    /api/bidprep/{id}
  Description: Update bid
  Request Body: { "documentCategories": [...], "comments": "" }
  Response: { "success": true }
  Status Codes: 200 (Success), 404 (Not Found)

[GET]    /api/bidprep/{id}/versions
  Description: Get bid version history
  Response: [{ "versionId": 1, "versionNumber": 1, "date": "", ... }]
  Status Codes: 200 (Success)
```

### Work Breakdown Structure (WBS)

```
Base URL: /api/wbs

[GET]    /api/wbs/project/{projectId}
  Description: Get WBS for project
  Response: { "wbsId": 1, "projectId": 1, "tasks": [...] }
  Status Codes: 200 (Success), 404 (Not Found)

[POST]   /api/wbs
  Description: Create WBS
  Request Body: { "projectId": 1, "tasks": [...] }
  Response: { "wbsId": 1, "success": true }
  Status Codes: 201 (Created), 400 (Bad Request)

[PUT]    /api/wbs/{id}
  Description: Update WBS
  Request Body: { "tasks": [...] }
  Response: { "success": true }
  Status Codes: 200 (Success), 404 (Not Found)

[GET]    /api/wbs/{id}/tasks
  Description: Get WBS tasks
  Response: [{ "taskId": 1, "taskName": "", "parentId": null, ... }]
  Status Codes: 200 (Success)

[POST]   /api/wbs/{id}/tasks
  Description: Add task to WBS
  Request Body: { "taskName": "", "parentId": null, "estimatedBudget": 0 }
  Response: { "taskId": 1, "success": true }
  Status Codes: 201 (Created)

[PUT]    /api/wbs/tasks/{taskId}
  Description: Update WBS task
  Request Body: { "taskName": "", "estimatedBudget": 0, "status": "" }
  Response: { "success": true }
  Status Codes: 200 (Success), 404 (Not Found)

[DELETE] /api/wbs/tasks/{taskId}
  Description: Delete WBS task
  Response: { "success": true }
  Status Codes: 200 (Success), 404 (Not Found)
```

### Job Start Form

```
Base URL: /api/jobstart

[GET]    /api/jobstart/project/{projectId}
  Description: Get job start form for project
  Response: { "formId": 1, "projectId": 1, "selections": [...], ... }
  Status Codes: 200 (Success), 404 (Not Found)

[POST]   /api/jobstart
  Description: Create job start form
  Request Body: { "projectId": 1, "wbsId": 1, "selections": [...], "resources": [...] }
  Response: { "formId": 1, "success": true }
  Status Codes: 201 (Created), 400 (Bad Request)

[PUT]    /api/jobstart/{id}
  Description: Update job start form
  Request Body: { "selections": [...], "resources": [...] }
  Response: { "success": true }
  Status Codes: 200 (Success), 404 (Not Found)

[POST]   /api/jobstart/{id}/submit
  Description: Submit form for approval
  Response: { "success": true }
  Status Codes: 200 (Success)
```

### Monthly Progress

```
Base URL: /api/monthly

[GET]    /api/monthly/project/{projectId}
  Description: Get monthly progress reports for project
  Response: [{ "progressId": 1, "month": "2024-10", "financials": {...}, ... }]
  Status Codes: 200 (Success)

[GET]    /api/monthly/{id}
  Description: Get monthly progress by ID
  Response: { "progressId": 1, "projectId": 1, "month": "", "financials": {...}, ... }
  Status Codes: 200 (Success), 404 (Not Found)

[POST]   /api/monthly
  Description: Create monthly progress report
  Request Body: { "projectId": 1, "month": "2024-10", "financials": {...}, ... }
  Response: { "progressId": 1, "success": true }
  Status Codes: 201 (Created), 400 (Bad Request)

[PUT]    /api/monthly/{id}
  Description: Update monthly progress
  Request Body: { "financials": {...}, "schedule": {...}, "deliverables": [...] }
  Response: { "success": true }
  Status Codes: 200 (Success), 404 (Not Found)

[GET]    /api/monthly/{id}/financial
  Description: Get financial details
  Response: { "budgetOdcs": 0, "budgetStaff": 0, "feeTotal": 0, ... }
  Status Codes: 200 (Success)
```

### Project Closure

```
Base URL: /api/closure

[GET]    /api/closure/project/{projectId}
  Description: Get project closure document
  Response: { "closureId": 1, "projectId": 1, "lessonsLearned": "", ... }
  Status Codes: 200 (Success), 404 (Not Found)

[POST]   /api/closure
  Description: Create closure document
  Request Body: { "projectId": 1, "clientFeedback": "", "lessonsLearned": "", ... }
  Response: { "closureId": 1, "success": true }
  Status Codes: 201 (Created), 400 (Bad Request)

[PUT]    /api/closure/{id}
  Description: Update closure document
  Request Body: { "lessonsLearned": "", "positives": "", ... }
  Response: { "success": true }
  Status Codes: 200 (Success), 404 (Not Found)

[POST]   /api/closure/{id}/submit
  Description: Submit for approval
  Response: { "success": true }
  Status Codes: 200 (Success)
```

### Change Control

```
Base URL: /api/changecontrol

[GET]    /api/changecontrol/project/{projectId}
  Description: Get change controls for project
  Response: [{ "changeId": 1, "description": "", "status": "", ... }]
  Status Codes: 200 (Success)

[POST]   /api/changecontrol
  Description: Create change control request
  Request Body: { "projectId": 1, "description": "", "costImpact": "", ... }
  Response: { "changeId": 1, "success": true }
  Status Codes: 201 (Created), 400 (Bad Request)

[PUT]    /api/changecontrol/{id}
  Description: Update change control
  Request Body: { "description": "", "status": "", ... }
  Response: { "success": true }
  Status Codes: 200 (Success), 404 (Not Found)

[POST]   /api/changecontrol/{id}/approve
  Description: Approve change request
  Response: { "success": true }
  Status Codes: 200 (Success)
```

### Audit Logs

```
Base URL: /api/audit

[GET]    /api/audit
  Description: Get all audit logs (paginated)
  Query Params: ?page=1&pageSize=50&entityName=Project
  Response: { "logs": [...], "totalCount": 100, "page": 1 }
  Status Codes: 200 (Success)

[GET]    /api/audit/entity/{entityName}/{entityId}
  Description: Get audit logs for specific entity
  Response: [{ "logId": 1, "action": "UPDATE", "oldValues": "{...}", ... }]
  Status Codes: 200 (Success)

[GET]    /api/audit/user/{userId}
  Description: Get audit logs for user actions
  Response: [{ "logId": 1, "action": "", "entityName": "", ... }]
  Status Codes: 200 (Success)
```

### Excel Export

```
Base URL: /api/excel

[POST]   /api/excel/monthly-progress/{progressId}
  Description: Export monthly progress to Excel
  Response: Binary file (application/vnd.openxmlformats-officedocument.spreadsheetml.sheet)
  Status Codes: 200 (Success), 404 (Not Found)

[POST]   /api/excel/project-status
  Description: Export project status report
  Request Body: { "projectIds": [1, 2, 3] }
  Response: Binary file (Excel)
  Status Codes: 200 (Success)
```

## Authentication Implementation Details

### JWT Configuration (appsettings.json)

```json
"Jwt": {
  "Key": "7bf578ef918fcccd26725d646385b72c95d29c01b38abc79caec1dbc4a36d2f5",
  "Issuer": "your-app-name",
  "Audience": "your-app-name"
}
```

### Middleware Configuration (Program.cs)

```csharp
// JWT Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
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
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
    };
});

// Authorization Policies
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("RequireAdminRole", policy =>
        policy.RequireRole("Admin"));

    options.AddPolicy("RequireManagerRole", policy =>
        policy.RequireRole("Manager"));

    options.AddPolicy("RequireUserRole", policy =>
        policy.RequireRole("User"));

    options.AddPolicy("RequireAdminOrManager", policy =>
        policy.RequireRole("Admin", "Manager"));

    options.DefaultPolicy = new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build();
});
```

### Controller Authorization Examples

```csharp
// Require authentication for all endpoints
[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ProjectController : ControllerBase
{
    // Public endpoint (override authorization)
    [AllowAnonymous]
    [HttpGet("public")]
    public IActionResult GetPublicProjects() { ... }

    // Require Admin role
    [Authorize(Policy = "RequireAdminRole")]
    [HttpDelete("{id}")]
    public IActionResult DeleteProject(int id) { ... }

    // Require Admin or Manager
    [Authorize(Policy = "RequireAdminOrManager")]
    [HttpPost("{id}/approve")]
    public IActionResult ApproveProject(int id) { ... }
}
```

## Error Handling Patterns

### Global Exception Handler

**Location**: `backend/src/NJSAPI/Middleware/ExceptionHandlingMiddleware.cs`

```csharp
public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

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

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

        var response = new
        {
            statusCode = context.Response.StatusCode,
            message = "Internal Server Error",
            detailed = exception.Message  // Remove in production
        };

        return context.Response.WriteAsync(JsonSerializer.Serialize(response));
    }
}
```

### Controller-Level Error Handling

```csharp
[HttpGet("{id}")]
public async Task<IActionResult> GetProject(int id)
{
    try
    {
        var project = await _projectRepository.GetByIdAsync(id);

        if (project == null)
        {
            return NotFound(new { message = $"Project with ID {id} not found" });
        }

        return Ok(project);
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, $"Error retrieving project {id}");
        return StatusCode(500, new { message = "Error retrieving project" });
    }
}
```

### Validation Error Responses

```csharp
[HttpPost]
public async Task<IActionResult> CreateProject([FromBody] ProjectDto dto)
{
    if (!ModelState.IsValid)
    {
        return BadRequest(new
        {
            message = "Validation failed",
            errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
        });
    }

    // Create project logic
}
```

## Validation Approach

### Data Annotations (Model Validation)

```csharp
public class ProjectDto
{
    [Required(ErrorMessage = "Project name is required")]
    [StringLength(100, ErrorMessage = "Project name cannot exceed 100 characters")]
    public string ProjectName { get; set; }

    [Required]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    public string ProjectManager { get; set; }

    [Range(0, double.MaxValue, ErrorMessage = "Cost must be a positive value")]
    public decimal EstimatedProjectCost { get; set; }

    [DataType(DataType.Date)]
    public DateTime? StartDate { get; set; }
}
```

### FluentValidation (Alternative)

**Installation**: Add `FluentValidation.AspNetCore` NuGet package

```csharp
public class ProjectDtoValidator : AbstractValidator<ProjectDto>
{
    public ProjectDtoValidator()
    {
        RuleFor(x => x.ProjectName)
            .NotEmpty().WithMessage("Project name is required")
            .MaximumLength(100).WithMessage("Project name cannot exceed 100 characters");

        RuleFor(x => x.EstimatedProjectCost)
            .GreaterThanOrEqualTo(0).WithMessage("Cost must be positive");

        RuleFor(x => x.StartDate)
            .LessThan(x => x.EndDate)
            .When(x => x.EndDate.HasValue)
            .WithMessage("Start date must be before end date");
    }
}
```

### Frontend Validation (Formik + Yup)

**Location**: `frontend/src/schemas/projectSchema.ts`

```typescript
import * as Yup from 'yup';

export const projectValidationSchema = Yup.object({
  projectName: Yup.string()
    .required('Project name is required')
    .max(100, 'Project name cannot exceed 100 characters'),
  projectManager: Yup.string()
    .email('Invalid email format')
    .required('Project manager is required'),
  estimatedProjectCost: Yup.number()
    .min(0, 'Cost must be positive')
    .required('Estimated cost is required'),
  startDate: Yup.date()
    .nullable()
    .max(Yup.ref('endDate'), 'Start date must be before end date')
});
```

## Logging Strategy

### NLog Configuration

**Location**: `backend/src/NJSAPI/nlog.config`

```xml
<?xml version="1.0" encoding="utf-8" ?>
<nlog xmlns="http://www.nlog-project.org/schemas/NLog.xsd"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">

  <targets>
    <!-- File logging -->
    <target name="logfile" xsi:type="File"
            fileName="${basedir}/logs/${shortdate}.log"
            layout="${longdate} ${level} ${message} ${exception:format=tostring}" />

    <!-- Console logging -->
    <target name="logconsole" xsi:type="Console"
            layout="${longdate} ${level} ${message}" />

    <!-- Database logging (optional) -->
    <target name="database" xsi:type="Database"
            connectionString="Server=localhost;Database=KarmaTechAI_SAAS;Trusted_Connection=True;">
      <commandText>
        INSERT INTO Logs (Date, Level, Message, Exception)
        VALUES (@date, @level, @message, @exception)
      </commandText>
      <parameter name="@date" layout="${date}" />
      <parameter name="@level" layout="${level}" />
      <parameter name="@message" layout="${message}" />
      <parameter name="@exception" layout="${exception:tostring}" />
    </target>
  </targets>

  <rules>
    <logger name="*" minlevel="Info" writeTo="logfile,logconsole" />
    <logger name="*" minlevel="Error" writeTo="database" />
  </rules>
</nlog>
```

### Application Logging

**Startup Configuration** (`Program.cs`):

```csharp
builder.Host.UseNLog();
```

**Controller Logging**:

```csharp
public class ProjectController : ControllerBase
{
    private readonly ILogger<ProjectController> _logger;

    public ProjectController(ILogger<ProjectController> logger)
    {
        _logger = logger;
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetProject(int id)
    {
        _logger.LogInformation("Fetching project with ID: {ProjectId}", id);

        try
        {
            var project = await _projectRepository.GetByIdAsync(id);

            if (project == null)
            {
                _logger.LogWarning("Project with ID {ProjectId} not found", id);
                return NotFound();
            }

            _logger.LogInformation("Successfully retrieved project {ProjectId}", id);
            return Ok(project);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving project {ProjectId}", id);
            return StatusCode(500);
        }
    }
}
```

### Log Levels

- **Trace**: Very detailed logs (disabled in production)
- **Debug**: Debugging information
- **Information**: General informational messages
- **Warning**: Warning messages (e.g., deprecated API calls)
- **Error**: Error messages (exceptions, failures)
- **Critical**: Critical errors requiring immediate attention

## Database Connection Configuration

### Connection String

**Development** (`appsettings.json`):
```json
"ConnectionStrings": {
  "AppDbConnection": "Server=localhost;Database=KarmaTechAI_SAAS;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true;"
}
```

**Production** (`appsettings.Production.json`):
```json
"ConnectionStrings": {
  "AppDbConnection": "Server=production-server;Database=KarmaTechAI_SAAS;User Id=dbuser;Password=SecurePassword123;TrustServerCertificate=True;MultipleActiveResultSets=true;Encrypt=true;"
}
```

### DbContext Configuration

```csharp
services.AddDbContext<ProjectManagementContext>(options =>
{
    options.UseSqlServer(
        configuration.GetConnectionString("AppDbConnection"),
        sqlServerOptions =>
        {
            sqlServerOptions.EnableRetryOnFailure(
                maxRetryCount: 5,
                maxRetryDelay: TimeSpan.FromSeconds(30),
                errorNumbersToAdd: null
            );
            sqlServerOptions.CommandTimeout(30);
            sqlServerOptions.MigrationsAssembly("NJS.Domain");
        }
    );

    // Add interceptors
    options.AddInterceptors(
        serviceProvider.GetRequiredService<AuditSaveChangesInterceptor>()
    );
});
```

### Connection Resilience

- **Retry on Failure**: Up to 5 retries with exponential backoff
- **Command Timeout**: 30 seconds
- **Multiple Active Result Sets**: Enabled for complex queries
- **Encrypt**: Enabled in production
- **Trust Server Certificate**: Enabled for development

---

**Document Version**: 1.0
**Last Updated**: 2025-10-30
**Maintained By**: Business Analyst Team
