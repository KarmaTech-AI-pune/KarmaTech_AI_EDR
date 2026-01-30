# API Creation Workflow and Sample Code

This document outlines the standard workflow for adding a new API endpoint to the KarmaTech EDR application. Follow these steps in order to ensure consistency and maintainability.

## Workflow

1.  **Create Entity**: Define the data model in `NJS.Domain/Entities`.
2.  **Create DTO**: Define the Data Transfer Object in `NJS.Application/Dtos`.
3.  **Create Repository**:
    *   Define the interface in `NJS.Repositories/Interfaces`.
    *   Implement the repository in `NJS.Repositories/Repositories`.
4.  **Create CQRS Pattern**:
    *   Create Command/Query class in `NJS.Application/CQRS/<Feature>/Commands` or `Queries`.
    *   Create Handler class in `NJS.Application/CQRS/<Feature>/Handlers`.
5.  **Create Controller**: Expose the endpoint in `NJSAPI/Controllers`.
6.  **Register Services**: Ensure any new services/repositories are registered in `Program.cs` (usually automatic if following conventions, but verify).
7.  **Test Build**: Run `dotnet build` in `NJSAPI` to ensure no errors.
8.  **Database Migration**: Run Code First migrations using `add-migration` and `update-database`.
9.  **Write Tests**: Create unit tests in `NJS.API.Tests` to verify functionality.

---

## 1. Entity Pattern
**Location**: `backend/src/NJS.Domain/Entities`
**Example**: `Project` entity (`NJS.Domain/Entities/Project.cs`).

```csharp
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using NJS.Domain.Enums;

namespace NJS.Domain.Entities
{
    public class Project : ITenantEntity
    {
        [Key]
        public int Id { get; set; }

        public int TenantId { get; set; }

        public string? Name { get; set; }

        public string? ClientName { get; set; }

        public int? ProjectNo { get; set; }

        public string? TypeOfClient { get; set; }

        public string? ProjectManagerId { get; set; }
        [ForeignKey("ProjectManagerId")]
        public User? ProjectManager { get; set; }

        public string? SeniorProjectManagerId { get; set; }
        [ForeignKey("SeniorProjectManagerId")]
        public User? SeniorProjectManager { get; set; }

        public string? RegionalManagerId { get; set; }
        [ForeignKey("RegionalManagerId")]
        public User? RegionalManager { get; set; }

        public string? Office { get; set; }

        public string? Region { get; set; }

        public string? TypeOfJob { get; set; }

        public string? Sector { get; set; }

        public string? FeeType { get; set; }

        public decimal? EstimatedProjectCost { get; set; }

        public decimal? EstimatedProjectFee { get; set; }

        public decimal? Percentage { get; set; }

        public string? Details { get; set; }

        public string? Priority { get; set; }

        public string? Currency { get; set; }

        public DateTime? StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        public decimal? CapitalValue { get; set; }

        public ProjectStatus Status { get; set; }

        public int Progress { get; set; }

        public int? DurationInMonths { get; set; }

        public string? FundingStream { get; set; }

        public string? ContractType { get; set; }

        public bool? LetterOfAcceptance { get; set; }

        public int? OpportunityTrackingId { get; set; }

        public int? ProgramId { get; set; }
        [ForeignKey("ProgramId")]
        public virtual Program? Program { get; set; }

        public DateTime CreatedAt { get; set; }

        public string? CreatedBy { get; set; }

        public DateTime? LastModifiedAt { get; set; }

        public string? LastModifiedBy { get; set; }
    }
}
```

---

## 2. DTO Pattern
**Location**: `backend/src/NJS.Application/Dtos`
**Example**: `ProjectDto` (`NJS.Application/Dtos/ProjectDto.cs`).

```csharp
using System;
using System.Diagnostics.Metrics;
using NJS.Domain.Entities;

namespace NJS.Application.Dtos
{
    public class ProjectDto
    {
        public int Id { get; set; }
        public int? TenantId { get; set; } // Added for multi-tenant support
        public string? Name { get; set; }
        public string? ClientName { get; set; }
		public int? ProjectNo { get; set; }
		public string? TypeOfClient { get; set; }
		public string? ProjectManagerId { get; set; }
		public string? SeniorProjectManagerId { get; set; }
		public string? RegionalManagerId { get; set; }
		public string? Office { get; set; }
        public string? Region { get; set; }
        public string? TypeOfJob { get; set; }
		public string? Sector { get; set; }
        public string? FeeType { get; set; }
        public decimal? EstimatedProjectCost { get; set; }
        public decimal? EstimatedProjectFee {  get; set; }
        public decimal? Percentage { get; set; }
        public string? Details { get; set; }
		public string? Priority { get; set; }
		public string? Currency { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
		public decimal? CapitalValue { get; set; }
		public ProjectStatus Status { get; set; }
        public int Progress { get; set; }
        public int? DurationInMonths { get; set; }
        public string? FundingStream { get; set; }
        public string? ContractType { get; set; }
        public bool? LetterOfAcceptance { get; set; }
        public int? OpportunityTrackingId { get; set; }
        public int? ProgramId { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? CreatedBy { get; set; }
        public DateTime? LastModifiedAt { get; set; }
        public string? LastModifiedBy { get; set; }
        public string? BudgetReason { get; set; } // Optional reason for budget changes
    }
}
```

---

## 3. Repository Pattern

### Interface
**Location**: `backend/NJS.Repositories/Interfaces`
**Example**: `IProjectRepository` (`NJS.Repositories/Interfaces/IProjectRepository.cs`).

```csharp
using NJS.Domain.Entities;

namespace NJS.Repositories.Interfaces
{
    public interface IProjectRepository
    {
       Task<IEnumerable<Project>> GetAll();
        Project GetById(int id);
        Task Add(Project project);
        void Update(Project project);
        void Delete(int id);
        Task<IEnumerable<Project>> GetAllByUserId(string userId);
    }
}
```

### Implementation
**Location**: `backend/NJS.Repositories/Repositories`
**Example**: `ProjectRepository` (`NJS.Repositories/Repositories/ProjectRepository.cs`).

```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using NJS.Domain.Entities;
using NJS.Domain.GenericRepository;
using NJS.Repositories.Interfaces;

namespace NJS.Repositories.Repositories
{
    public class ProjectRepository : IProjectRepository
    {
        private readonly IRepository<Project> _repository;
        private readonly IGoNoGoDecisionRepository _goNoGoDecisionRepository;

        public readonly ILogger<ProjectRepository> _logger;

        public ProjectRepository(
            IRepository<Project> repository,
            IGoNoGoDecisionRepository goNoGoDecisionRepository,
            ILogger<ProjectRepository> logger)
        {
            _repository = repository;
            _goNoGoDecisionRepository = goNoGoDecisionRepository;
            _logger = logger;
        }

        public async Task<IEnumerable<Project>> GetAll()
        {
            return  await _repository.GetAllAsync().ConfigureAwait(false);
        }

        public Project GetById(int id)
        {
            return _repository.GetByIdAsync(id).GetAwaiter().GetResult();
        }

        public async Task Add(Project project)
        {
            await _repository.AddAsync(project).ConfigureAwait(false);
            await _repository.SaveChangesAsync().ConfigureAwait(false);
        }

        public void Update(Project project)
        {
            try
            {
                // Log the project state before update                

                _repository.UpdateAsync(project).GetAwaiter().GetResult();
                _repository.SaveChangesAsync().GetAwaiter().GetResult();

                // Log the project state after update
                var updatedProject = _repository.GetByIdAsync(project.Id).GetAwaiter().GetResult();
               
            }
            catch (Exception ex)
            {
                _logger.LogInformation($"Error in repository update: {ex.Message}");               
            }
        }

        public void Delete(int id)
        {
            try
            {
                var project = _repository.GetByIdAsync(id).GetAwaiter().GetResult();
                if (project != null)
                {
                    // Perform hard delete - completely remove the project from the database
                    _repository.RemoveAsync(project).GetAwaiter().GetResult();
                    _repository.SaveChangesAsync().GetAwaiter().GetResult();
                    _logger.LogInformation($"Successfully deleted project with ID {id}");
                }
                else
                {
                    // If project doesn't exist, just log it but don't throw an exception
                    // This allows the DELETE API to return success even if the project doesn't exist
                    _logger.LogInformation($"Project with ID {id} not found, but continuing as if deleted");
                }
            }
            catch (Exception ex)
            {
                _logger.LogInformation($"Error deleting project with ID {id}: {ex.Message}");           
                
            }
        }

        public async Task<IEnumerable<Project>> GetAllByUserId(string userId)
        {
            var query = _repository.Query();
            var userProjects = query.Where(project =>
                (project.SeniorProjectManagerId == userId)
                || (project.ProjectManagerId == userId)
                || (project.RegionalManagerId == userId));

            return await userProjects.ToListAsync();
        }
    }
}
```

---

## 4. CQRS Pattern

### Command
**Location**: `backend/src/NJS.Application/CQRS/Projects/Commands`
**Example**: `CreateProjectCommand` (`NJS.Application/CQRS/Projects/Commands/CreateProjectCommand.cs`).

```csharp
using MediatR;
using NJS.Application.Dtos;
using NJS.Domain.Entities;

namespace NJS.Application.CQRS.Projects.Commands
{
    public record CreateProjectCommand : IRequest<Project>
    {
        public ProjectDto ProjectDto { get; init; }

        public CreateProjectCommand(ProjectDto projectDto)
        {
            ProjectDto = projectDto;
        }
    }
}
```

### Command Handler
**Location**: `backend/src/NJS.Application/CQRS/Projects/Handlers`
**Example**: `CreateProjectCommandHandler` (`NJS.Application/CQRS/Projects/Handlers/CreateProjectCommandHandler.cs`).

```csharp
using MediatR;
using Microsoft.EntityFrameworkCore; // Added for DbUpdateException
using Microsoft.Extensions.Logging; // Added for ILogger
using NJS.Application.CQRS.Projects.Commands;
using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.Projects.Handlers
{
    public class CreateProjectCommandHandler : IRequestHandler<CreateProjectCommand, Project>
    {
        private readonly IProjectRepository _repository;
        private readonly ILogger<CreateProjectCommandHandler> _logger; // Added logger field

        public CreateProjectCommandHandler(IProjectRepository repository, ILogger<CreateProjectCommandHandler> logger) // Added logger to constructor
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger)); // Initialize logger
        }

        public async Task<Project> Handle(CreateProjectCommand request, CancellationToken cancellationToken)
        {
            if (request?.ProjectDto == null)
                throw new ArgumentNullException(nameof(request));

            var dto = request.ProjectDto;

            // Set user IDs to null if they are "string" to allow project creation
            var projectManagerId = dto.ProjectManagerId == "string" ? null : dto.ProjectManagerId;
            var seniorProjectManagerId = dto.SeniorProjectManagerId == "string" ? null : dto.SeniorProjectManagerId;
            var regionalManagerId = dto.RegionalManagerId == "string" ? null : dto.RegionalManagerId;

            var project = new Project
            {
                TenantId = dto.TenantId ?? 0, // Set to 0 to let database context handle it
                Name = dto.Name,
                ClientName = dto.ClientName,
                ProjectNo = dto.ProjectNo,
                TypeOfClient = dto.TypeOfClient,
				ProjectManagerId = projectManagerId,
				SeniorProjectManagerId = seniorProjectManagerId,
				RegionalManagerId = regionalManagerId,
                Office = dto.Office,
				Region = dto.Region,
                TypeOfJob = dto.TypeOfJob,
				Sector = dto.Sector ?? string.Empty, // Assign empty string if Sector is null in DTO, as Entity's Sector is non-nullable
                FeeType = dto.FeeType,
                EstimatedProjectCost = dto.EstimatedProjectCost,
                EstimatedProjectFee = dto.EstimatedProjectFee,
                Percentage = dto.Percentage,
                Details = dto.Details,
                CapitalValue = dto.CapitalValue,
                Priority = dto.Priority,
				Currency = dto.Currency,
				StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                Status = ProjectStatus.Opportunity, // Default status for new projects
                Progress = 0, // Initial progress
                DurationInMonths = dto.DurationInMonths,
                FundingStream = dto.FundingStream,
                ContractType = dto.ContractType,
                CreatedAt = DateTime.UtcNow,
                LastModifiedAt = DateTime.UtcNow,
                CreatedBy = projectManagerId, // Using Project Manager as creator
                LastModifiedBy = projectManagerId,
                LetterOfAcceptance = dto.LetterOfAcceptance,
                OpportunityTrackingId = dto.OpportunityTrackingId == 0 ? null : dto.OpportunityTrackingId,
                ProgramId = dto.ProgramId == 0 ? null : dto.ProgramId
            };

            // Calculate duration in months if not provided and dates are available
            if (!dto.DurationInMonths.HasValue && dto.StartDate.HasValue && dto.EndDate.HasValue)
            {
                int months = ((dto.EndDate.Value.Year - dto.StartDate.Value.Year) * 12) +
                           dto.EndDate.Value.Month - dto.StartDate.Value.Month;
                project.DurationInMonths = months;
            }

            try
            {
                await _repository.Add(project);
                return project;
            }
            catch (DbUpdateException ex) // Catch specific DB update exception
            {
                // Log the inner exception for detailed debugging
                _logger.LogError(ex, "Database error creating project for tenant {TenantId}. Inner Exception: {InnerExceptionMessage}", dto.TenantId, ex.InnerException?.Message ?? ex.Message);
                // Throw a more informative exception to the caller
                throw new ApplicationException($"Error creating project. Database error: {ex.InnerException?.Message ?? ex.Message}", ex.InnerException ?? ex);
            }
            catch (Exception ex) // Catch any other unexpected exceptions
            {
                _logger.LogError(ex, "Unexpected error creating project for tenant {TenantId}", dto.TenantId);
                throw new ApplicationException("An unexpected error occurred while creating the project.", ex);
            }
        }

    }
}
```

### Query
**Location**: `backend/src/NJS.Application/CQRS/Projects/Queries`
**Example**: `GetProjectByIdQuery` (`NJS.Application/CQRS/Projects/Queries/GetProjectByIdQuery.cs`).

```csharp
using MediatR;
using NJS.Domain.Entities;

namespace NJS.Application.CQRS.Projects.Queries
{
    public record GetProjectByIdQuery : IRequest<Project>
    {
        public int Id { get; init; }
    }
}
```

### Query Handler
**Location**: `backend/src/NJS.Application/CQRS/Projects/Handlers`
**Example**: `GetProjectByIdQueryHandler` (`NJS.Application/CQRS/Projects/Handlers/GetProjectByIdQueryHandler.cs`).

```csharp
using MediatR;
using NJS.Application.CQRS.Projects.Queries;
using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.Projects.Handlers
{
    public class GetProjectByIdQueryHandler : IRequestHandler<GetProjectByIdQuery, Project>
    {
        private readonly IProjectRepository _repository;

        public GetProjectByIdQueryHandler(IProjectRepository repository)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
        }

        public Task<Project> Handle(GetProjectByIdQuery request, CancellationToken cancellationToken)
        {
            if (request == null)
                throw new ArgumentNullException(nameof(request));

            var project = _repository.GetById(request.Id);
            if (project == null)
                throw new ArgumentException($"Project with ID {request.Id} not found");

            return Task.FromResult(project);
        }
    }
}
```

---

## 5. Controller Pattern
**Location**: `backend/src/NJSAPI/Controllers`
**Example**: Partial `ProjectController.cs` (Constructor and Create Action).

```csharp
using MediatR;
using Microsoft.AspNetCore.Mvc;
using NJS.Application.CQRS.Projects.Commands;
using NJS.Application.Dtos;
using NJS.Application.Services;
using System.Net;

namespace NJSAPI.Controllers
{
    public class ProjectController : BaseController
    {
        private readonly IMediator _mediator;
        private readonly IProjectManagementService _projectManagementService;
        private readonly ILogger<ProjectController> _logger;

        public ProjectController(
            IMediator mediator,
            IProjectManagementService projectManagementService,
            ITenantService tenantService,
            ICurrentUserService currentUserService,
            ILogger<ProjectController> logger)
            : base(tenantService, currentUserService)
        {
            _mediator = mediator ?? throw new ArgumentNullException(nameof(mediator));
            _projectManagementService = projectManagementService ?? throw new ArgumentNullException(nameof(projectManagementService));
            this.tenantService = tenantService;
            this.currentUserService = currentUserService;
            _logger = logger;
        }

        [HttpPost]
        public async Task<IActionResult> CreateProject([FromBody] ProjectDto projectDto)
        {
            try
            {
                var command = new CreateProjectCommand(projectDto);
                var result = await _mediator.Send(command);
                return Ok(result);
            }
            catch(ArgumentNullException ex)
            {
                return BadRequest(ex.Message);
            }
             catch(ArgumentException ex) {
                return BadRequest(ex.Message);

            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while creating project");
                return StatusCode((int)HttpStatusCode.InternalServerError, "An error occurred while creating project");
            }
        }
    }
}
```

---

## 6. Test Build Pattern
**Location**: `NJSAPI` directory

After implementing all changes, run the build command to ensure there are no compilation errors.

```powershell
cd backend/src/NJSAPI
dotnet build
```

**Note**: If there are any errors, fix them before proceeding to the migration step. Common errors include:
*   Missing namespaces.
*   Incorrect parameter types.
*   Missing interface implementations.

---

## 7. Database Migration Pattern (Code First)
**Location**: `backend/src/NJSAPI` (or where your DbContext is capable of running migrations)

Once the code builds successfully, create a migration to apply changes to the database.

1.  **Add Migration**:
    ```powershell
    dotnet ef migrations add <DescriptiveName> --project ../NJS.Domain --startup-project .
    ```
    *Replace `<DescriptiveName>` with a name like `AddProjectEntity`.*

2.  **Update Database**:
    ```powershell
    dotnet ef database update --project ../NJS.Domain --startup-project .
    ```

---

## 8. Test Case Pattern
**Location**: `backend/NJS.API.Tests`

Effective testing ensures reliability across all layers of the application. Below are "Real Code" examples for testing the `Project` feature.

### 1. Entity Test
**Location**: `backend/NJS.API.Tests/Entities`
**Example**: `ProjectEntityTests.cs` (Validates property assignment).

```csharp
using NJS.Domain.Entities;
using NJS.Domain.Enums;
using System;
using Xunit;

namespace NJS.API.Tests.Entities
{
    public class ProjectEntityTests
    {
        [Fact]
        public void Project_Should_Set_Properties_Correctly()
        {
            // Arrange
            var now = DateTime.UtcNow;
            var project = new Project
            {
                Id = 1,
                Name = "Test Project",
                TenantId = 10,
                Status = ProjectStatus.Opportunity,
                EstimatedProjectCost = 1000m,
                CreatedAt = now
            };

            // Assert
            Assert.Equal(1, project.Id);
            Assert.Equal("Test Project", project.Name);
            Assert.Equal(10, project.TenantId);
            Assert.Equal(ProjectStatus.Opportunity, project.Status);
            Assert.Equal(1000m, project.EstimatedProjectCost);
            Assert.Equal(now, project.CreatedAt);
        }
    }
}
```

### 2. DTO Test
**Location**: `backend/NJS.API.Tests/DTOs`
**Example**: `ProjectDtoTests.cs` (Validates mapping/structure).

```csharp
using NJS.Application.Dtos;
using Xunit;

namespace NJS.API.Tests.DTOs
{
    public class ProjectDtoTests
    {
        [Fact]
        public void ProjectDto_Should_Set_Properties_Correctly()
        {
            // Arrange
            var dto = new ProjectDto
            {
                Name = "Test DTO",
                ClientName = "Test Client",
                ProjectNo = 123
            };

            // Assert
            Assert.Equal("Test DTO", dto.Name);
            Assert.Equal("Test Client", dto.ClientName);
            Assert.Equal(123, dto.ProjectNo);
        }
    }
}
```

### 3. Repository Test (Mocked)
**Location**: `backend/NJS.API.Tests/Interfaces`
**Example**: `IProjectRepositoryTests.cs` (Verifies interaction with the repository interface).

```csharp
using Moq;
using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace NJS.API.Tests.Interfaces
{
    public class IProjectRepositoryTests
    {
        private readonly Mock<IProjectRepository> _mockRepo;

        public IProjectRepositoryTests()
        {
            _mockRepo = new Mock<IProjectRepository>();
        }

        [Fact]
        public async Task GetAll_Should_Return_List_Of_Projects()
        {
            // Arrange
            var projects = new List<Project>
            {
                new Project { Id = 1, Name = "P1" },
                new Project { Id = 2, Name = "P2" }
            };
            _mockRepo.Setup(repo => repo.GetAll()).ReturnsAsync(projects);

            // Act
            var result = await _mockRepo.Object.GetAll();

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Count());
        }
    }
}
```

### 4. CQRS Handler Test
**Location**: `backend/NJS.API.Tests/CQRS/Projects/Handlers`
**Example**: `CreateProjectCommandHandlerTests.cs` (Tests business logic in handler).

```csharp
using Microsoft.Extensions.Logging;
using Moq;
using NJS.Application.CQRS.Projects.Commands;
using NJS.Application.CQRS.Projects.Handlers;
using NJS.Application.Dtos;
using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace NJS.API.Tests.CQRS.Projects.Handlers
{
    public class CreateProjectCommandHandlerTests
    {
        private readonly Mock<IProjectRepository> _mockRepo;
        private readonly Mock<ILogger<CreateProjectCommandHandler>> _mockLogger;
        private readonly CreateProjectCommandHandler _handler;

        public CreateProjectCommandHandlerTests()
        {
            _mockRepo = new Mock<IProjectRepository>();
            _mockLogger = new Mock<ILogger<CreateProjectCommandHandler>>();
            _handler = new CreateProjectCommandHandler(_mockRepo.Object, _mockLogger.Object);
        }

        [Fact]
        public async Task Handle_Should_Add_Project_And_Return_Entity()
        {
            // Arrange
            var dto = new ProjectDto { Name = "New CQRS Project", TenantId = 1 };
            var command = new CreateProjectCommand(dto);

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            _mockRepo.Verify(r => r.Add(It.Is<Project>(p => p.Name == dto.Name)), Times.Once);
            Assert.NotNull(result);
            Assert.Equal(dto.Name, result.Name);
        }
    }
}
```

### 5. Controller Test
**Location**: `backend/NJS.API.Tests/Controllers`
**Example**: `ProjectsControllerTests.cs` (Tests API endpoint).

```csharp
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using NJS.Application.CQRS.Projects.Commands;
using NJS.Application.Dtos;
using NJS.Application.Services.IContract;
using NJS.Domain.Entities;
using NJSAPI.Controllers;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace NJS.API.Tests.Controllers
{
    public class ProjectsControllerTests
    {
        private readonly Mock<IProjectManagementService> _mockProjectManagementService;
        private readonly Mock<IMediator> _mediator;
        private readonly Mock<ITenantService> _tenantService;
        private readonly Mock<ICurrentUserService> _currentUserService;
        private readonly Mock<ILogger<ProjectController>> _mockLogger;
        private readonly ProjectController _controller;

        public ProjectsControllerTests()
        {
            _mockProjectManagementService = new Mock<IProjectManagementService>();
            _mediator = new Mock<IMediator>();
            _currentUserService = new Mock<ICurrentUserService>();
            _tenantService = new Mock<ITenantService>();
            _mockLogger = new Mock<ILogger<ProjectController>>();
            
            _controller = new ProjectController(
                _mediator.Object, 
                _mockProjectManagementService.Object,
                _tenantService.Object,
                _currentUserService.Object, 
                _mockLogger.Object);
        }

        [Fact]
        public async Task Create_ShouldReturnCreatedAtAction_WhenValidProject()
        {
            // Arrange
            var projectDto = new ProjectDto { Name = "New Controller Project" };
            var createdId = 1;
            var mockProject = new Project { Id = createdId, Name = "New Controller Project" };

            _mediator.Setup(m => m.Send(It.Is<CreateProjectCommand>(c => c.ProjectDto == projectDto), It.IsAny<CancellationToken>()))
                    .ReturnsAsync(mockProject);

            // Act
            // Note: Ensure the controller method name matches (Create vs CreateProject)
            // Assuming the controller has: public async Task<IActionResult> CreateProject(...)
            var result = await _controller.CreateProject(projectDto); 

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result); 
            var returnValue = Assert.IsType<Project>(okResult.Value);
            Assert.Equal(createdId, returnValue.Id);
        }
    }
}
```

