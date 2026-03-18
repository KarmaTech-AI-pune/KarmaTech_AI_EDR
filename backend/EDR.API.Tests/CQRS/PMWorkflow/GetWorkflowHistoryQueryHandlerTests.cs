using EDR.Application.CQRS.PMWorkflow.Handlers;
using EDR.Application.CQRS.PMWorkflow.Queries;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.Domain.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Moq;
using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace EDR.API.Tests.CQRS.PMWorkflow
{
    public class GetWorkflowHistoryQueryHandlerTests : IDisposable
    {
        private readonly ProjectManagementContext _context;
        private readonly GetWorkflowHistoryQueryHandler _handler;

        public GetWorkflowHistoryQueryHandlerTests()
        {
            var options = new DbContextOptionsBuilder<ProjectManagementContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            var tenantServiceMock = new Mock<ICurrentTenantService>();
            tenantServiceMock.SetupProperty(t => t.TenantId, 1);
            var configMock = new Mock<IConfiguration>();

            _context = new ProjectManagementContext(options, tenantServiceMock.Object, configMock.Object);
            _handler = new GetWorkflowHistoryQueryHandler(_context);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        [Fact]
        public async Task Handle_ChangeControl_ReturnsHistory()
        {
            // Arrange
            var user = new User { Id = "u1", UserName = "Test User" };
            _context.Users.Add(user);

            var status = new EDR.Domain.Entities.PMWorkflowStatus { Id = 1, Status = "Pending", TenantId = 1 };
            _context.PMWorkflowStatuses.Add(status);

            var cc = new EDR.Domain.Entities.ChangeControl { Id = 1, WorkflowStatusId = 1, WorkflowStatus = status, TenantId = 1 };
            _context.ChangeControls.Add(cc);

            var history = new EDR.Domain.Entities.ChangeControlWorkflowHistory
            {
                Id = 1,
                ChangeControlId = 1,
                StatusId = 1,
                Status = status,
                Action = "Submitted",
                ActionDate = DateTime.UtcNow,
                ActionUser = user,
                TenantId = 1
            };
            _context.ChangeControlWorkflowHistories.Add(history);

            await _context.SaveChangesAsync();

            var query = new GetWorkflowHistoryQuery { EntityId = 1, EntityType = "ChangeControl" };

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(1, result.EntityId);
            Assert.Equal("ChangeControl", result.EntityType);
            Assert.Single(result.History);
            Assert.Equal("Submitted", result.History[0].Action);
        }

        [Fact]
        public async Task Handle_ProjectClosure_ReturnsHistory()
        {
            // Arrange
            var user = new User { Id = "u1", UserName = "Test User" };
            _context.Users.Add(user);

            var status = new EDR.Domain.Entities.PMWorkflowStatus { Id = 1, Status = "Approved", TenantId = 1 };
            _context.PMWorkflowStatuses.Add(status);

            var pc = new EDR.Domain.Entities.ProjectClosure { Id = 1, WorkflowStatusId = 1, WorkflowStatus = status, TenantId = 1 };
            _context.ProjectClosures.Add(pc);

            var history = new EDR.Domain.Entities.ProjectClosureWorkflowHistory
            {
                Id = 1,
                ProjectClosureId = 1,
                StatusId = 1,
                Status = status,
                Action = "Approved",
                ActionDate = DateTime.UtcNow,
                ActionUser = user,
                TenantId = 1
            };
            _context.ProjectClosureWorkflowHistories.Add(history);

            await _context.SaveChangesAsync();

            var query = new GetWorkflowHistoryQuery { EntityId = 1, EntityType = "ProjectClosure" };

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(1, result.EntityId);
            Assert.Equal("ProjectClosure", result.EntityType);
            Assert.Single(result.History);
            Assert.Equal("Approved", result.History[0].Action);
        }

        [Fact]
        public async Task Handle_InvalidEntityType_ThrowsArgumentException()
        {
            // Arrange
            var query = new GetWorkflowHistoryQuery { EntityId = 1, EntityType = "InvalidType" };

            // Act & Assert
            await Assert.ThrowsAsync<ArgumentException>(() => _handler.Handle(query, CancellationToken.None));
        }

        [Fact]
        public async Task Handle_ChangeControlNotFound_ThrowsException()
        {
            // Arrange
            var query = new GetWorkflowHistoryQuery { EntityId = 99, EntityType = "ChangeControl" };

            // Act & Assert
            var ex = await Assert.ThrowsAsync<Exception>(() => _handler.Handle(query, CancellationToken.None));
            Assert.Contains("Change Control with ID 99 not found", ex.Message);
        }
    }
}
