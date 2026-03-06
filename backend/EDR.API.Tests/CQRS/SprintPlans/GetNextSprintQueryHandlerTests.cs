using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using EDR.Application.CQRS.SprintPlans.Queries;
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
    public class GetNextSprintQueryHandlerTests : IDisposable
    {
        private readonly ProjectManagementContext _context;
        private readonly Mock<ILogger<GetNextSprintQueryHandler>> _loggerMock;
        private readonly GetNextSprintQueryHandler _handler;

        public GetNextSprintQueryHandlerTests()
        {
            var options = new DbContextOptionsBuilder<ProjectManagementContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            var tenantServiceMock = new Mock<ICurrentTenantService>();
            tenantServiceMock.SetupProperty(t => t.TenantId, 1);
            var configMock = new Mock<IConfiguration>();
            
            _context = new ProjectManagementContext(options, tenantServiceMock.Object, configMock.Object);

            _loggerMock = new Mock<ILogger<GetNextSprintQueryHandler>>();
            _handler = new GetNextSprintQueryHandler(_context, _loggerMock.Object);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        [Fact]
        public async Task Handle_NextSprintExists_ReturnsNextSprint()
        {
            // Arrange
            var project = new Project { Id = 1, Name = "Test Project", TenantId = 1 };
            _context.Projects.Add(project);

            // Sprint 1 (Completed)
            var sprint1 = new SprintPlan { SprintId = 1, ProjectId = 1, Status = 1, SprintName = "Sprint 1", TenantId = 1 };
            // Sprint 2 (Not Completed - Should be Next)
            var sprint2 = new SprintPlan { SprintId = 2, ProjectId = 1, Status = 0, SprintName = "Sprint 2", TenantId = 1 };
            // Sprint 3 (Not Completed)
            var sprint3 = new SprintPlan { SprintId = 3, ProjectId = 1, Status = 0, SprintName = "Sprint 3", TenantId = 1 };

            _context.SprintPlans.AddRange(sprint1, sprint2, sprint3);
            await _context.SaveChangesAsync();

            var query = new GetNextSprintQuery { ProjectId = 1, CurrentSprintId = 1 }; // Current sprint is 1

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.SprintId);
            Assert.Equal("Sprint 2", result.SprintName);
        }

        [Fact]
        public async Task Handle_NoNextSprint_ReturnsNull()
        {
            // Arrange
            var project = new Project { Id = 1, Name = "Test Project", TenantId = 1 };
            _context.Projects.Add(project);

            // Only completed sprint
            var sprint1 = new SprintPlan { SprintId = 1, ProjectId = 1, Status = 1, SprintName = "Sprint 1", TenantId = 1 };
            _context.SprintPlans.Add(sprint1);
            await _context.SaveChangesAsync();

            var query = new GetNextSprintQuery { ProjectId = 1, CurrentSprintId = 1 };

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.Null(result);
        }
    }
}
