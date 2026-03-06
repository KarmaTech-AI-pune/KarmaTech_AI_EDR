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
    public class UpdateSingleSprintPlanCommandHandlerTests : IDisposable
    {
        private readonly ProjectManagementContext _context;
        private readonly Mock<ILogger<UpdateSingleSprintPlanCommandHandler>> _mockLogger;
        private readonly UpdateSingleSprintPlanCommandHandler _handler;

        public UpdateSingleSprintPlanCommandHandlerTests()
        {
            var options = new DbContextOptionsBuilder<ProjectManagementContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            var mockCurrentTenantService = new Mock<ICurrentTenantService>();
            var mockConfig = new Mock<IConfiguration>();
            
            _context = new ProjectManagementContext(options, mockCurrentTenantService.Object, mockConfig.Object);
            _mockLogger = new Mock<ILogger<UpdateSingleSprintPlanCommandHandler>>();
            
            _handler = new UpdateSingleSprintPlanCommandHandler(_context, _mockLogger.Object);
        }

        [Fact]
        public async Task Handle_ValidRequest_UpdatesSprintPlan()
        {
            // Arrange
            var sprint = new SprintPlan { SprintId = 1, ProjectId = 1, SprintName = "Old Name" };
            _context.SprintPlans.Add(sprint);
            await _context.SaveChangesAsync();

            var command = new UpdateSingleSprintPlanCommand
            {
                SprintPlan = new SprintPlanInputDto
                {
                    SprintId = 1,
                    ProjectId = 1,
                    SprintName = "New Name"
                }
            };

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.True(result);
            var updatedSprint = await _context.SprintPlans.FindAsync(1);
            Assert.Equal("New Name", updatedSprint.SprintName);
        }

        [Fact]
        public async Task Handle_SprintDoesNotExist_ReturnsFalse()
        {
            // Arrange
            var command = new UpdateSingleSprintPlanCommand
            {
                SprintPlan = new SprintPlanInputDto { SprintId = 99, ProjectId = 1 }
            };

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.False(result);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }
    }
}
