using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using EDR.Application.CQRS.SprintPlans.Commands;
using EDR.Application.CQRS.SprintPlans.Handlers;
using EDR.Application.Dtos;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.Domain.Services;
using Microsoft.Extensions.Configuration;

namespace EDR.API.Tests.CQRS.SprintPlans.Handlers
{
    public class CreateSingleSprintPlanCommandHandlerTests : IDisposable
    {
        private readonly ProjectManagementContext _context;
        private readonly Mock<ILogger<CreateSingleSprintPlanCommandHandler>> _mockLogger;
        private readonly CreateSingleSprintPlanCommandHandler _handler;

        public CreateSingleSprintPlanCommandHandlerTests()
        {
            var options = new DbContextOptionsBuilder<ProjectManagementContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            var mockCurrentTenantService = new Mock<ICurrentTenantService>();
            var mockConfig = new Mock<IConfiguration>();
            
            _context = new ProjectManagementContext(options, mockCurrentTenantService.Object, mockConfig.Object);
            _mockLogger = new Mock<ILogger<CreateSingleSprintPlanCommandHandler>>();
            
            _handler = new CreateSingleSprintPlanCommandHandler(_context, _mockLogger.Object);
        }

        [Fact]
        public async Task Handle_ValidRequest_CreatesSprintPlan()
        {
            // Arrange
            _context.Projects.Add(new Project { Id = 1, Name = "Test Project" });
            await _context.SaveChangesAsync();

            var command = new CreateSingleSprintPlanCommand
            {
                SprintPlan = new SprintPlanInputDto
                {
                    ProjectId = 1,
                    SprintName = "Sprint 1",
                    SprintGoal = "Goal"
                }
            };

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.True(result > 0);
            var savedSprint = await _context.SprintPlans.FindAsync(result);
            Assert.NotNull(savedSprint);
            Assert.Equal(1, savedSprint.SprintNumber); // Since it was max + 1
            Assert.Equal("Sprint 1", savedSprint.SprintName);
        }

        [Fact]
        public async Task Handle_ProjectDoesNotExist_ThrowsArgumentException()
        {
            // Arrange
            var command = new CreateSingleSprintPlanCommand
            {
                SprintPlan = new SprintPlanInputDto { ProjectId = 99, SprintName = "Sprint 1" }
            };

            // Act & Assert
            var ex = await Assert.ThrowsAsync<ArgumentException>(() => _handler.Handle(command, CancellationToken.None));
            Assert.Contains("not found", ex.Message);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }
    }
}
