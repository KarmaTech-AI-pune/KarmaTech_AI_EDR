using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;
using EDR.Application.CQRS.PMWorkflow.Handlers;
using EDR.Application.CQRS.PMWorkflow.Commands;
using EDR.Application.Dtos;
using EDR.Application.Services.IContract;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.Domain.Services;
using Microsoft.Extensions.Configuration;

namespace EDR.API.Tests.CQRS.PMWorkflow
{
    public class PMWorkflowHandlersTests : IDisposable
    {
        private readonly ProjectManagementContext _context;
        private readonly Mock<ICurrentUserService> _currentUserServiceMock;
        private readonly Mock<IEntityWorkflowStrategySelector> _strategySelectorMock;
        private readonly Mock<IEntityWorkflowStrategy> _strategyMock;

        public PMWorkflowHandlersTests()
        {
            var options = new DbContextOptionsBuilder<ProjectManagementContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _currentUserServiceMock = new Mock<ICurrentUserService>();
            _strategySelectorMock = new Mock<IEntityWorkflowStrategySelector>();
            _strategyMock = new Mock<IEntityWorkflowStrategy>();

            var mockTenantService = new Mock<ICurrentTenantService>();
            mockTenantService.Setup(s => s.TenantId).Returns(1);

            _context = new ProjectManagementContext(options, mockTenantService.Object, Mock.Of<IConfiguration>());

            _strategySelectorMock.Setup(s => s.GetStrategy(It.IsAny<string>())).Returns(_strategyMock.Object);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        [Fact]
        public async Task ApproveCommandHandler_CallsStrategy()
        {
            // Arrange
            var userId = "user1";
            _currentUserServiceMock.Setup(u => u.UserId).Returns(userId);
            _context.Users.Add(new User { Id = userId, Name = "Current User" });
            await _context.SaveChangesAsync();

            var handler = new ApproveCommandHandler(_context, _currentUserServiceMock.Object, _strategySelectorMock.Object);
            var command = new ApproveCommand { EntityId = 1, EntityType = "Project", Action = "Approve", Comments = "Approved" };

            _strategyMock.Setup(s => s.ExecuteAsync(It.IsAny<WorkflowActionContext>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new PMWorkflowDto { EntityId = 1, Status = "Approved" });

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Approved", result.Status);
            _strategyMock.Verify(s => s.ExecuteAsync(It.IsAny<WorkflowActionContext>(), It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task SendToApprovalCommandHandler_CallsStrategy()
        {
            // Arrange
            var userId = "user1";
            var assignedToId = "user2";
            _currentUserServiceMock.Setup(u => u.UserId).Returns(userId);
            _context.Users.Add(new User { Id = userId, Name = "Current User" });
            _context.Users.Add(new User { Id = assignedToId, Name = "Assigned User" });
            await _context.SaveChangesAsync();

            var handler = new SendToApprovalCommandHandler(_context, _currentUserServiceMock.Object, _strategySelectorMock.Object);
            var command = new ProjectSendToApprovalCommand { EntityId = 1, EntityType = "Project", Action = "SendToApproval", AssignedToId = assignedToId };

            _strategyMock.Setup(s => s.ExecuteAsync(It.IsAny<WorkflowActionContext>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new PMWorkflowDto { EntityId = 1, Status = "SentForApproval" });

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("SentForApproval", result.Status);
        }

        [Fact]
        public async Task RequestChangesCommandHandler_CallsStrategy()
        {
            // Arrange
            var userId = "user1";
            _currentUserServiceMock.Setup(u => u.UserId).Returns(userId);
            _context.Users.Add(new User { Id = userId, Name = "Current User" });
            await _context.SaveChangesAsync();

            var handler = new RequestChangesCommandHandler(_context, _currentUserServiceMock.Object, _strategySelectorMock.Object);
            var command = new RequestChangesCommand { EntityId = 1, EntityType = "Project", Action = "RequestChanges", Comments = "More info needed" };

            _strategyMock.Setup(s => s.ExecuteAsync(It.IsAny<WorkflowActionContext>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new PMWorkflowDto { EntityId = 1, Status = "ChangesRequested" });

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("ChangesRequested", result.Status);
        }

        [Fact]
        public async Task SendToReviewCommandHandler_CallsStrategy()
        {
            // Arrange
            var userId = "user1";
            var reviewerId = "user3";
            _currentUserServiceMock.Setup(u => u.UserId).Returns(userId);
            _context.Users.Add(new User { Id = userId, Name = "Current User" });
            _context.Users.Add(new User { Id = reviewerId, Name = "Reviewer User" });
            await _context.SaveChangesAsync();

            var handler = new SendToReviewCommandHandler(_context, _currentUserServiceMock.Object, _strategySelectorMock.Object);
            var command = new ProjectSendToReviewCommand { EntityId = 1, EntityType = "Project", Action = "SendToReview", AssignedToId = reviewerId };

            _strategyMock.Setup(s => s.ExecuteAsync(It.IsAny<WorkflowActionContext>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new PMWorkflowDto { EntityId = 1, Status = "SentForReview" });

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("SentForReview", result.Status);
        }
    }
}
