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
    public class UpdateSingleSprintPlanCommandHandlerTests : IDisposable
    {
        private readonly ProjectManagementContext _context;
        private readonly Mock<ILogger<UpdateSingleSprintPlanCommandHandler>> _loggerMock;
        private readonly UpdateSingleSprintPlanCommandHandler _handler;

        public UpdateSingleSprintPlanCommandHandlerTests()
        {
            var options = new DbContextOptionsBuilder<ProjectManagementContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            var tenantServiceMock = new Mock<ICurrentTenantService>();
            tenantServiceMock.SetupProperty(t => t.TenantId, 1);
            var configMock = new Mock<IConfiguration>();
            
            _context = new ProjectManagementContext(options, tenantServiceMock.Object, configMock.Object);

            _loggerMock = new Mock<ILogger<UpdateSingleSprintPlanCommandHandler>>();
            _handler = new UpdateSingleSprintPlanCommandHandler(_context, _loggerMock.Object);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        [Fact]
        public async Task Handle_ValidSprintPlan_UpdatesSprintPlanAndReturnsTrue()
        {
            // Arrange
            var existingSprint = new SprintPlan
            {
                SprintId = 1,
                ProjectId = 1,
                SprintName = "Old Sprint Name",
                TenantId = 1
            };
            _context.SprintPlans.Add(existingSprint);
            await _context.SaveChangesAsync();

            var sprintPlanDto = new SprintPlanInputDto
            {
                SprintId = 1,
                ProjectId = 1,
                SprintName = "New Sprint Name",
                SprintGoal = "New Goal",
            };

            var command = new UpdateSingleSprintPlanCommand { SprintPlan = sprintPlanDto };

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.True(result);
            var updatedSprint = await _context.SprintPlans.FindAsync(1);
            Assert.NotNull(updatedSprint);
            Assert.Equal("New Sprint Name", updatedSprint.SprintName);
            Assert.Equal("New Goal", updatedSprint.SprintGoal);
        }

        [Fact]
        public async Task Handle_SprintPlanDoesNotExist_ReturnsFalse()
        {
            // Arrange
            var sprintPlanDto = new SprintPlanInputDto
            {
                SprintId = 999, // Non-existent
                ProjectId = 1
            };

            var command = new UpdateSingleSprintPlanCommand { SprintPlan = sprintPlanDto };

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.False(result);
        }

        [Fact]
        public async Task Handle_NullSprintId_ThrowsArgumentException()
        {
            // Arrange
            var sprintPlanDto = new SprintPlanInputDto
            {
                ProjectId = 1
                // SprintId is null
            };

            var command = new UpdateSingleSprintPlanCommand { SprintPlan = sprintPlanDto };

            // Act & Assert
            await Assert.ThrowsAsync<ArgumentException>(() => _handler.Handle(command, CancellationToken.None));
        }
    }
}
