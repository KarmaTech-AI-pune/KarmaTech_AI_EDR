using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using EDR.Application.CQRS.SprintPlans.Queries;
using EDR.Application.CQRS.SprintPlans.Handlers;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.Domain.Services;
using Microsoft.Extensions.Configuration;

namespace EDR.API.Tests.CQRS.SprintPlans.Handlers
{
    public class GetSingleSprintPlanQueryHandlerTests : IDisposable
    {
        private readonly ProjectManagementContext _context;
        private readonly Mock<ILogger<GetSingleSprintPlanQueryHandler>> _mockLogger;
        private readonly GetSingleSprintPlanQueryHandler _handler;

        public GetSingleSprintPlanQueryHandlerTests()
        {
            var options = new DbContextOptionsBuilder<ProjectManagementContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            var mockCurrentTenantService = new Mock<ICurrentTenantService>();
            var mockConfig = new Mock<IConfiguration>();
            
            _context = new ProjectManagementContext(options, mockCurrentTenantService.Object, mockConfig.Object);
            _mockLogger = new Mock<ILogger<GetSingleSprintPlanQueryHandler>>();
            
            _handler = new GetSingleSprintPlanQueryHandler(_context, _mockLogger.Object);
        }

        [Fact]
        public async Task Handle_ValidSprintAndProject_ReturnsSprintPlanDto()
        {
            // Arrange
            _context.SprintPlans.Add(new SprintPlan { SprintId = 1, ProjectId = 5, SprintName = "Target Sprint" });
            await _context.SaveChangesAsync();

            var query = new GetSingleSprintPlanQuery { SprintId = 1, ProjectId = 5 };

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(1, result.SprintId);
            Assert.Equal(5, result.ProjectId);
            Assert.Equal("Target Sprint", result.SprintName);
            Assert.Empty(result.SprintEmployee); // Default when required is 0
        }

        [Fact]
        public async Task Handle_SprintNotFound_ReturnsNull()
        {
            // Arrange
            var query = new GetSingleSprintPlanQuery { SprintId = 99, ProjectId = 5 };

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task Handle_ProjectMismatch_ReturnsNull()
        {
            // Arrange
            _context.SprintPlans.Add(new SprintPlan { SprintId = 1, ProjectId = 5 });
            await _context.SaveChangesAsync();

            var query = new GetSingleSprintPlanQuery { SprintId = 1, ProjectId = 10 }; // Requested for wrong project

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.Null(result);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }
    }
}
