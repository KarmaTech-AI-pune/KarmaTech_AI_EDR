using System;
using System.Threading;
using System.Threading.Tasks;
using Moq;
using Xunit;
using EDR.Application.CQRS.Projects.Commands;
using EDR.Application.CQRS.Projects.Handlers;
using EDR.Domain.Entities;
using EDR.Repositories.Interfaces;

namespace EDR.API.Tests.CQRS.Projects.Handlers
{
    public class UpdateProjectBudgetCommandHandlerTests
    {
        private readonly Mock<IProjectRepository> _mockProjectRepo;
        private readonly Mock<IProjectBudgetChangeHistoryRepository> _mockHistoryRepo;
        private readonly UpdateProjectBudgetCommandHandler _handler;

        public UpdateProjectBudgetCommandHandlerTests()
        {
            _mockProjectRepo = new Mock<IProjectRepository>();
            _mockHistoryRepo = new Mock<IProjectBudgetChangeHistoryRepository>();
            _handler = new UpdateProjectBudgetCommandHandler(_mockProjectRepo.Object, _mockHistoryRepo.Object);
        }

        [Fact]
        public async Task Handle_ValidRequestWithCostChange_UpdatesAndCreatesHistory()
        {
            // Arrange
            var existingProject = new Project { Id = 1, EstimatedProjectCost = 100 };
            var request = new UpdateProjectBudgetCommand { ProjectId = 1, EstimatedProjectCost = 200, ChangedBy = "admin" };

            _mockProjectRepo.Setup(r => r.GetById(1)).Returns(existingProject);

            // Act
            var result = await _handler.Handle(request, CancellationToken.None);

            // Assert
            Assert.True(result.Success);
            Assert.Equal(200, existingProject.EstimatedProjectCost);
            _mockHistoryRepo.Verify(r => r.Add(It.Is<ProjectBudgetChangeHistory>(h => h.FieldName == "EstimatedProjectCost" && h.NewValue == 200)), Times.Once);
            _mockProjectRepo.Verify(r => r.Update(existingProject), Times.Once);
        }

        [Fact]
        public async Task Handle_SameValues_ReturnsNoChangesMessage()
        {
            // Arrange
            var existingProject = new Project { Id = 1, EstimatedProjectCost = 100 };
            var request = new UpdateProjectBudgetCommand { ProjectId = 1, EstimatedProjectCost = 100 };

            _mockProjectRepo.Setup(r => r.GetById(1)).Returns(existingProject);

            // Act
            var result = await _handler.Handle(request, CancellationToken.None);

            // Assert
            Assert.False(result.Success);
            Assert.Contains("No changes detected", result.Message);
            _mockHistoryRepo.Verify(r => r.Add(It.IsAny<ProjectBudgetChangeHistory>()), Times.Never);
            _mockProjectRepo.Verify(r => r.Update(It.IsAny<Project>()), Times.Never);
        }

        [Fact]
        public async Task Handle_ProjectNotFound_ReturnsError()
        {
            // Arrange
            var request = new UpdateProjectBudgetCommand { ProjectId = 99, EstimatedProjectCost = 200 };
            _mockProjectRepo.Setup(r => r.GetById(99)).Returns((Project)null);

            // Act
            var result = await _handler.Handle(request, CancellationToken.None);

            // Assert
            Assert.False(result.Success);
            Assert.Contains("not found", result.Message);
        }

        [Fact]
        public async Task Handle_NoFieldsProvided_ReturnsError()
        {
            // Arrange
            var request = new UpdateProjectBudgetCommand { ProjectId = 1 };

            // Act
            var result = await _handler.Handle(request, CancellationToken.None);

            // Assert
            Assert.False(result.Success);
            Assert.Contains("At least one budget field", result.Message);
        }

        [Fact]
        public async Task Handle_NullRequest_ThrowsArgumentNullException()
        {
            // Act & Assert
            await Assert.ThrowsAsync<ArgumentNullException>(() => _handler.Handle(null, CancellationToken.None));
        }
    }
}
