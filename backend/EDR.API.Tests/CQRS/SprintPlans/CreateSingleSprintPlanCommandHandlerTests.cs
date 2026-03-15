using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using EDR.Application.CQRS.SprintPlans.Commands;
using EDR.Application.CQRS.SprintPlans.Handlers;
using EDR.Application.Dtos;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

using EDR.Domain.Services;
using Microsoft.Extensions.Configuration;

namespace EDR.API.Tests.CQRS.SprintPlans
{
    public class CreateSingleSprintPlanCommandHandlerTests : IDisposable
    {
        private readonly ProjectManagementContext _context;
        private readonly Mock<ILogger<CreateSingleSprintPlanCommandHandler>> _loggerMock;
        private readonly CreateSingleSprintPlanCommandHandler _handler;

        public CreateSingleSprintPlanCommandHandlerTests()
        {
            var options = new DbContextOptionsBuilder<ProjectManagementContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            var tenantServiceMock = new Mock<ICurrentTenantService>();
            tenantServiceMock.SetupProperty(t => t.TenantId, 1);
            var configMock = new Mock<IConfiguration>();
            
            _context = new ProjectManagementContext(options, tenantServiceMock.Object, configMock.Object);

            _loggerMock = new Mock<ILogger<CreateSingleSprintPlanCommandHandler>>();
            _handler = new CreateSingleSprintPlanCommandHandler(_context, _loggerMock.Object);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        [Fact]
        public async Task Handle_ValidSprintPlan_CreatesSprintPlanAndReturnsId()
        {
            // Arrange
            var project = new Project { Id = 1, Name = "Test Project", TenantId = 1 };
            _context.Projects.Add(project);
            await _context.SaveChangesAsync();

            var sprintPlanDto = new SprintPlanInputDto
            {
                ProjectId = 1,
                SprintName = "Sprint 1",
                StartDate = DateTime.UtcNow,
                EndDate = DateTime.UtcNow.AddDays(14),
                SprintGoal = "Complete tests",
                RequiredSprintEmployees = 2,
                Status = 0
            };

            var command = new CreateSingleSprintPlanCommand { SprintPlan = sprintPlanDto };

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.True(result > 0);
            var createdSprint = await _context.SprintPlans.FindAsync(result);
            Assert.NotNull(createdSprint);
            Assert.Equal("Sprint 1", createdSprint.SprintName);
            Assert.Equal(1, createdSprint.SprintNumber); // First sprint should get number 1
        }

        [Fact]
        public async Task Handle_ProjectDoesNotExist_ThrowsArgumentException()
        {
            // Arrange
            var sprintPlanDto = new SprintPlanInputDto
            {
                ProjectId = 999, // Non-existent project
                SprintName = "Sprint 1"
            };

            var command = new CreateSingleSprintPlanCommand { SprintPlan = sprintPlanDto };

            // Act & Assert
            var ex = await Assert.ThrowsAsync<ArgumentException>(() => _handler.Handle(command, CancellationToken.None));
            Assert.Contains("Project with ID 999 not found", ex.Message);
        }

        [Fact]
        public async Task Handle_NullSprintPlanDto_ThrowsArgumentException()
        {
            // Arrange
            var command = new CreateSingleSprintPlanCommand { SprintPlan = null };

            // Act & Assert
            await Assert.ThrowsAsync<ArgumentException>(() => _handler.Handle(command, CancellationToken.None));
        }
    }
}
