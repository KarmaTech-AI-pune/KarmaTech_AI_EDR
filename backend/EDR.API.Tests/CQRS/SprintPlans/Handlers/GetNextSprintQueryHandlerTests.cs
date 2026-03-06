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
    public class GetNextSprintQueryHandlerTests : IDisposable
    {
        private readonly ProjectManagementContext _context;
        private readonly Mock<ILogger<GetNextSprintQueryHandler>> _mockLogger;
        private readonly GetNextSprintQueryHandler _handler;

        public GetNextSprintQueryHandlerTests()
        {
            var options = new DbContextOptionsBuilder<ProjectManagementContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            var mockCurrentTenantService = new Mock<ICurrentTenantService>();
            var mockConfig = new Mock<IConfiguration>();
            
            _context = new ProjectManagementContext(options, mockCurrentTenantService.Object, mockConfig.Object);
            _mockLogger = new Mock<ILogger<GetNextSprintQueryHandler>>();
            
            _handler = new GetNextSprintQueryHandler(_context, _mockLogger.Object);
        }

        [Fact]
        public async Task Handle_NextSprintExists_ReturnsSprintPlanDto()
        {
            // Arrange
            _context.SprintPlans.Add(new SprintPlan { SprintId = 1, ProjectId = 1, Status = 1 }); // Completed
            _context.SprintPlans.Add(new SprintPlan { SprintId = 2, ProjectId = 1, Status = 0, SprintName = "Next Sprint" }); // Not Completed
            await _context.SaveChangesAsync();

            var query = new GetNextSprintQuery { CurrentSprintId = 1, ProjectId = 1 }; // Get sprint after 1 for project 1

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.SprintId);
            Assert.Equal("Next Sprint", result.SprintName);
        }

        [Fact]
        public async Task Handle_NoNextSprint_ReturnsNull()
        {
            // Arrange
            _context.SprintPlans.Add(new SprintPlan { SprintId = 1, ProjectId = 1, Status = 1 });
            await _context.SaveChangesAsync();

            var query = new GetNextSprintQuery { CurrentSprintId = 1, ProjectId = 1 };

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
