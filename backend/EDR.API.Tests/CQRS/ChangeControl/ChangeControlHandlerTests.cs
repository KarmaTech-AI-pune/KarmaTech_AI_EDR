using Moq;
using EDR.Application.Dtos;
using EDR.Application.CQRS.ChangeControl.Commands;
using EDR.Application.CQRS.ChangeControl.Queries;
using EDR.Application.CQRS.ChangeControl.Handlers;
using EDR.Application.Services.IContract;
using EDR.Domain.Entities;
using EDR.Domain.GenericRepository;
using EDR.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using MediatR;

namespace EDR.API.Tests.CQRS.ChangeControl
{
    /// <summary>
    /// Unit tests for ChangeControl CQRS query handlers.
    /// Uses mocked IChangeControlRepository — no database required.
    /// Note: CreateChangeControlCommandHandler is tested via integration tests due to 
    /// its complex dependencies (IProjectRepository, ICurrentUserService, IRepository&lt;User&gt;).
    /// </summary>
    public class ChangeControlHandlerTests
    {
        private readonly Mock<IChangeControlRepository> _mockRepo;

        public ChangeControlHandlerTests()
        {
            _mockRepo = new Mock<IChangeControlRepository>();
        }

        private Domain.Entities.ChangeControl BuildEntity(int id = 1, int projectId = 1) => new()
        {
            Id = id,
            ProjectId = projectId,
            SrNo = 1,
            DateLogged = DateTime.UtcNow,
            Originator = "Test",
            Description = "Test change",
            CostImpact = "Low",
            TimeImpact = "Low",
            ResourcesImpact = "Low",
            QualityImpact = "Low",
            ChangeOrderStatus = "Pending",
            ClientApprovalStatus = "Pending",
            ClaimSituation = "None",
            CreatedBy = "TestUser",
            UpdatedBy = "TestUser",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            WorkflowHistories = new List<Domain.Entities.ChangeControlWorkflowHistory>()
        };

        // ==================== GetChangeControlsByProjectIdQueryHandler ====================

        [Fact]
        public async Task GetChangeControlsByProjectId_Handle_ReturnsMappedList()
        {
            // Arrange
            var handler = new GetChangeControlsByProjectIdQueryHandler(_mockRepo.Object);
            var entities = new List<Domain.Entities.ChangeControl>
            {
                BuildEntity(1, 5),
                BuildEntity(2, 5)
            };
            _mockRepo.Setup(r => r.GetByProjectIdAsync(5)).ReturnsAsync(entities);

            // Act
            var result = await handler.Handle(
                new GetChangeControlsByProjectIdQuery(5), CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Count());
        }

        [Fact]
        public async Task GetChangeControlsByProjectId_Handle_ReturnsEmpty_WhenNoneExist()
        {
            // Arrange
            var handler = new GetChangeControlsByProjectIdQueryHandler(_mockRepo.Object);
            _mockRepo.Setup(r => r.GetByProjectIdAsync(99)).ReturnsAsync(new List<Domain.Entities.ChangeControl>());

            // Act
            var result = await handler.Handle(
                new GetChangeControlsByProjectIdQuery(99), CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Empty(result);
        }

        [Fact]
        public async Task GetChangeControlsByProjectId_Handle_ThrowsWhenNullRequest()
        {
            // Arrange
            var handler = new GetChangeControlsByProjectIdQueryHandler(_mockRepo.Object);

            // Act & Assert
            await Assert.ThrowsAsync<ArgumentNullException>(() =>
                handler.Handle(null, CancellationToken.None));
        }

        // ==================== GetChangeControlByIdQueryHandler ====================

        [Fact]
        public async Task GetChangeControlById_Handle_ReturnsMappedDto_WhenFound()
        {
            // Arrange
            var handler = new GetChangeControlByIdQueryHandler(_mockRepo.Object);
            var entity = BuildEntity(10, 5);
            _mockRepo.Setup(r => r.GetByIdAsync(10)).ReturnsAsync(entity);

            // Act
            var result = await handler.Handle(
                new GetChangeControlByIdQuery(10), CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(10, result.Id);
            Assert.Equal(5, result.ProjectId);
        }

        [Fact]
        public async Task GetChangeControlById_Handle_ReturnsNull_WhenNotFound()
        {
            // Arrange
            var handler = new GetChangeControlByIdQueryHandler(_mockRepo.Object);
            _mockRepo.Setup(r => r.GetByIdAsync(999)).ReturnsAsync((Domain.Entities.ChangeControl)null);

            // Act
            var result = await handler.Handle(
                new GetChangeControlByIdQuery(999), CancellationToken.None);

            // Assert
            Assert.Null(result);
        }

        // ==================== DeleteChangeControlCommandHandler ====================

        [Fact]
        public async Task DeleteChangeControl_Handle_DeletesSuccessfully()
        {
            // Arrange
            var handler = new DeleteChangeControlCommandHandler(_mockRepo.Object);
            _mockRepo.Setup(r => r.ExistsAsync(3)).ReturnsAsync(true);
            _mockRepo.Setup(r => r.DeleteAsync(3)).Returns(Task.CompletedTask);

            // Act
            await handler.Handle(new DeleteChangeControlCommand(3), CancellationToken.None);

            // Assert
            _mockRepo.Verify(r => r.DeleteAsync(3), Times.Once);
        }

        [Fact]
        public async Task DeleteChangeControl_Handle_ThrowsKeyNotFoundException_WhenNotFound()
        {
            // Arrange
            var handler = new DeleteChangeControlCommandHandler(_mockRepo.Object);
            _mockRepo.Setup(r => r.ExistsAsync(999)).ReturnsAsync(false);

            // Act & Assert
            await Assert.ThrowsAsync<KeyNotFoundException>(() =>
                handler.Handle(new DeleteChangeControlCommand(999), CancellationToken.None));
        }
    }
}
