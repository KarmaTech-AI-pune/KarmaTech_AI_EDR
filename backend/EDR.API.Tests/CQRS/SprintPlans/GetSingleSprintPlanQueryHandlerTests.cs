using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using EDR.Application.CQRS.SprintPlans.Queries;
using EDR.Application.CQRS.SprintPlans.Handlers;
using EDR.Application.Dtos;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

using EDR.Domain.Services;
using Microsoft.Extensions.Configuration;

namespace EDR.API.Tests.CQRS.SprintPlans
{
    public class GetSingleSprintPlanQueryHandlerTests : IDisposable
    {
        private readonly ProjectManagementContext _context;
        private readonly Mock<ILogger<GetSingleSprintPlanQueryHandler>> _loggerMock;
        private readonly GetSingleSprintPlanQueryHandler _handler;

        public GetSingleSprintPlanQueryHandlerTests()
        {
            var options = new DbContextOptionsBuilder<ProjectManagementContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            var tenantServiceMock = new Mock<ICurrentTenantService>();
            tenantServiceMock.SetupProperty(t => t.TenantId, 1);
            var configMock = new Mock<IConfiguration>();
            
            _context = new ProjectManagementContext(options, tenantServiceMock.Object, configMock.Object);

            _loggerMock = new Mock<ILogger<GetSingleSprintPlanQueryHandler>>();
            _handler = new GetSingleSprintPlanQueryHandler(_context, _loggerMock.Object);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        [Fact]
        public async Task Handle_ValidSprintId_ReturnsSprintPlanWithEmployees()
        {
            // Arrange
            var sprintId = 1;
            var projectId = 1;
            
            var project = new Project { Id = projectId, Name = "Project", TenantId = 1 };
            _context.Projects.Add(project);

            var sprintPlan = new SprintPlan 
            { 
                SprintId = sprintId, 
                ProjectId = projectId, 
                SprintName = "Sprint 1", 
                RequiredSprintEmployees = 1,
                TenantId = 1 
            };
            _context.SprintPlans.Add(sprintPlan);

            var user = new User { Id = "user-1", Name = "User One" };
            _context.Users.Add(user);

            var userWbsTask = new UserWBSTask { Id = 1, UserId = "user-1" };
            _context.UserWBSTasks.Add(userWbsTask);

            await _context.SaveChangesAsync();

            var query = new GetSingleSprintPlanQuery { SprintId = sprintId, ProjectId = projectId };

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(sprintId, result.SprintId);
            Assert.Equal("Sprint 1", result.SprintName);
            Assert.NotNull(result.SprintEmployee);
            Assert.Single(result.SprintEmployee);
            Assert.Equal("user-1", result.SprintEmployee[0].EmployeeId);
        }

        [Fact]
        public async Task Handle_SprintIdNotFound_ReturnsNull()
        {
            // Arrange
            var query = new GetSingleSprintPlanQuery { SprintId = 999, ProjectId = 1 };

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task Handle_MismatchProjectId_ReturnsNull()
        {
            // Arrange
            var sprintId = 1;
            var sprintPlan = new SprintPlan 
            { 
                SprintId = sprintId, 
                ProjectId = 1, // Actual Project = 1
                SprintName = "Sprint 1", 
                TenantId = 1 
            };
            _context.SprintPlans.Add(sprintPlan);
            await _context.SaveChangesAsync();

            // Requested Project = 2
            var query = new GetSingleSprintPlanQuery { SprintId = sprintId, ProjectId = 2 };

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.Null(result);
        }
    }
}
