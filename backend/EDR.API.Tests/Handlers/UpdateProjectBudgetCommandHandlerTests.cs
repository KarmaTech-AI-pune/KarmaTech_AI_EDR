using Moq;
using EDR.Application.CQRS.Projects.Commands;
using EDR.Application.CQRS.Projects.Handlers;
using EDR.Application.Dtos;
using EDR.Domain.Entities;
using EDR.Repositories.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace EDR.API.Tests.Handlers
{
    public class UpdateProjectBudgetCommandHandlerTests
    {
        private readonly Mock<IProjectRepository> _projectRepositoryMock;
        private readonly Mock<IProjectBudgetChangeHistoryRepository> _historyRepositoryMock;
        private readonly UpdateProjectBudgetCommandHandler _handler;

        public UpdateProjectBudgetCommandHandlerTests()
        {
            _projectRepositoryMock = new Mock<IProjectRepository>();
            _historyRepositoryMock = new Mock<IProjectBudgetChangeHistoryRepository>();
            
            _handler = new UpdateProjectBudgetCommandHandler(
                _projectRepositoryMock.Object,
                _historyRepositoryMock.Object);
        }

        #region Business Logic Tests

        [Fact]
        public async Task Handle_ValidCostUpdate_CreatesHistoryAndUpdatesProject()
        {
            // Arrange
            var projectId = 1;
            var oldCost = 100000m;
            var newCost = 150000m;
            var project = new Project 
            { 
                Id = projectId, 
                EstimatedProjectCost = oldCost,
                EstimatedProjectFee = 50000m,
                Currency = "USD"
            };

            _projectRepositoryMock.Setup(r => r.GetById(projectId))
                .Returns(project);

            var command = new UpdateProjectBudgetCommand
            {
                ProjectId = projectId,
                EstimatedProjectCost = newCost,
                ChangedBy = "test@example.com",
                Reason = "Budget increase approved"
            };

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.True(result.Success);
            Assert.Single(result.CreatedHistoryRecords);
            Assert.Equal(newCost, project.EstimatedProjectCost);
            
            _historyRepositoryMock.Verify(
                r => r.Add(It.Is<ProjectBudgetChangeHistory>(h => 
                    h.ProjectId == projectId &&
                    h.FieldName == "EstimatedProjectCost" &&
                    h.OldValue == oldCost &&
                    h.NewValue == newCost)),
                Times.Once);
            
            _projectRepositoryMock.Verify(r => r.Update(project), Times.Once);
        }

        [Fact]
        public async Task Handle_ValidFeeUpdate_CreatesHistoryAndUpdatesProject()
        {
            // Arrange
            var projectId = 1;
            var oldFee = 50000m;
            var newFee = 75000m;
            var project = new Project 
            { 
                Id = projectId, 
                EstimatedProjectCost = 100000m,
                EstimatedProjectFee = oldFee,
                Currency = "USD"
            };

            _projectRepositoryMock.Setup(r => r.GetById(projectId))
                .Returns(project);

            var command = new UpdateProjectBudgetCommand
            {
                ProjectId = projectId,
                EstimatedProjectFee = newFee,
                ChangedBy = "test@example.com"
            };

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.True(result.Success);
            Assert.Single(result.CreatedHistoryRecords);
            Assert.Equal(newFee, project.EstimatedProjectFee);
            
            _historyRepositoryMock.Verify(
                r => r.Add(It.Is<ProjectBudgetChangeHistory>(h => 
                    h.FieldName == "EstimatedProjectFee" &&
                    h.OldValue == oldFee &&
                    h.NewValue == newFee)),
                Times.Once);
        }

        [Fact]
        public async Task Handle_BothFieldsUpdate_CreatesTwoHistoryRecords()
        {
            // Arrange
            var projectId = 1;
            var project = new Project 
            { 
                Id = projectId, 
                EstimatedProjectCost = 100000m,
                EstimatedProjectFee = 50000m,
                Currency = "USD"
            };

            _projectRepositoryMock.Setup(r => r.GetById(projectId))
                .Returns(project);

            var command = new UpdateProjectBudgetCommand
            {
                ProjectId = projectId,
                EstimatedProjectCost = 150000m,
                EstimatedProjectFee = 75000m,
                ChangedBy = "test@example.com",
                Reason = "Complete budget revision"
            };

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.True(result.Success);
            Assert.Equal(2, result.CreatedHistoryRecords.Count);
            Assert.Equal(150000m, project.EstimatedProjectCost);
            Assert.Equal(75000m, project.EstimatedProjectFee);
            
            _historyRepositoryMock.Verify(r => r.Add(It.IsAny<ProjectBudgetChangeHistory>()), Times.Exactly(2));
        }

        [Fact]
        public async Task Handle_VarianceCalculation_CalculatesCorrectAbsoluteVariance()
        {
            // Arrange
            var projectId = 1;
            var oldValue = 100000m;
            var newValue = 150000m;
            var expectedVariance = 50000m; // NewValue - OldValue
            
            var project = new Project 
            { 
                Id = projectId, 
                EstimatedProjectCost = oldValue,
                EstimatedProjectFee = 50000m,
                Currency = "USD"
            };

            _projectRepositoryMock.Setup(r => r.GetById(projectId))
                .Returns(project);

            ProjectBudgetChangeHistory? capturedHistory = null;
            _historyRepositoryMock.Setup(r => r.Add(It.IsAny<ProjectBudgetChangeHistory>()))
                .Callback<ProjectBudgetChangeHistory>(h => capturedHistory = h);

            var command = new UpdateProjectBudgetCommand
            {
                ProjectId = projectId,
                EstimatedProjectCost = newValue,
                ChangedBy = "test@example.com"
            };

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.NotNull(capturedHistory);
            Assert.Equal(expectedVariance, capturedHistory.Variance);
        }

        [Fact]
        public async Task Handle_PercentageVarianceCalculation_CalculatesCorrectPercentage()
        {
            // Arrange
            var projectId = 1;
            var oldValue = 100000m;
            var newValue = 150000m;
            var expectedPercentage = 50m; // ((150000 - 100000) / 100000) * 100 = 50%
            
            var project = new Project 
            { 
                Id = projectId, 
                EstimatedProjectCost = oldValue,
                EstimatedProjectFee = 50000m,
                Currency = "USD"
            };

            _projectRepositoryMock.Setup(r => r.GetById(projectId))
                .Returns(project);

            ProjectBudgetChangeHistory? capturedHistory = null;
            _historyRepositoryMock.Setup(r => r.Add(It.IsAny<ProjectBudgetChangeHistory>()))
                .Callback<ProjectBudgetChangeHistory>(h => capturedHistory = h);

            var command = new UpdateProjectBudgetCommand
            {
                ProjectId = projectId,
                EstimatedProjectCost = newValue,
                ChangedBy = "test@example.com"
            };

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.NotNull(capturedHistory);
            Assert.Equal(expectedPercentage, capturedHistory.PercentageVariance);
        }

        [Fact]
        public async Task Handle_NegativeVariance_CalculatesCorrectly()
        {
            // Arrange
            var projectId = 1;
            var oldValue = 150000m;
            var newValue = 100000m;
            var expectedVariance = -50000m; // NewValue - OldValue
            var expectedPercentage = -33.33m; // Approximately
            
            var project = new Project 
            { 
                Id = projectId, 
                EstimatedProjectCost = oldValue,
                EstimatedProjectFee = 50000m,
                Currency = "USD"
            };

            _projectRepositoryMock.Setup(r => r.GetById(projectId))
                .Returns(project);

            ProjectBudgetChangeHistory? capturedHistory = null;
            _historyRepositoryMock.Setup(r => r.Add(It.IsAny<ProjectBudgetChangeHistory>()))
                .Callback<ProjectBudgetChangeHistory>(h => capturedHistory = h);

            var command = new UpdateProjectBudgetCommand
            {
                ProjectId = projectId,
                EstimatedProjectCost = newValue,
                ChangedBy = "test@example.com"
            };

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.NotNull(capturedHistory);
            Assert.Equal(expectedVariance, capturedHistory.Variance);
            Assert.True(Math.Abs(capturedHistory.PercentageVariance - expectedPercentage) < 0.01m);
        }

        [Fact]
        public async Task Handle_CurrencyHandling_PreservesCurrency()
        {
            // Arrange
            var projectId = 1;
            var currency = "EUR";
            var project = new Project 
            { 
                Id = projectId, 
                EstimatedProjectCost = 100000m,
                EstimatedProjectFee = 50000m,
                Currency = currency
            };

            _projectRepositoryMock.Setup(r => r.GetById(projectId))
                .Returns(project);

            ProjectBudgetChangeHistory? capturedHistory = null;
            _historyRepositoryMock.Setup(r => r.Add(It.IsAny<ProjectBudgetChangeHistory>()))
                .Callback<ProjectBudgetChangeHistory>(h => capturedHistory = h);

            var command = new UpdateProjectBudgetCommand
            {
                ProjectId = projectId,
                EstimatedProjectCost = 150000m,
                ChangedBy = "test@example.com"
            };

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.NotNull(capturedHistory);
            Assert.Equal(currency, capturedHistory.Currency);
        }

        [Fact]
        public async Task Handle_NoChangeDetection_ReturnsFalseWhenValuesAreSame()
        {
            // Arrange
            var projectId = 1;
            var currentValue = 100000m;
            var project = new Project 
            { 
                Id = projectId, 
                EstimatedProjectCost = currentValue,
                EstimatedProjectFee = 50000m,
                Currency = "USD"
            };

            _projectRepositoryMock.Setup(r => r.GetById(projectId))
                .Returns(project);

            var command = new UpdateProjectBudgetCommand
            {
                ProjectId = projectId,
                EstimatedProjectCost = currentValue, // Same value
                ChangedBy = "test@example.com"
            };

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.False(result.Success);
            Assert.Contains("No changes detected", result.Message);
            _historyRepositoryMock.Verify(r => r.Add(It.IsAny<ProjectBudgetChangeHistory>()), Times.Never);
        }

        #endregion

        #region Validation Tests

        [Fact]
        public async Task Handle_NullCommand_ThrowsArgumentNullException()
        {
            // Act & Assert
            await Assert.ThrowsAsync<ArgumentNullException>(
                () => _handler.Handle(null!, CancellationToken.None));
        }

        [Fact]
        public async Task Handle_NoFieldsProvided_ReturnsFalse()
        {
            // Arrange
            var command = new UpdateProjectBudgetCommand
            {
                ProjectId = 1,
                ChangedBy = "test@example.com"
                // No EstimatedProjectCost or EstimatedProjectFee
            };

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.False(result.Success);
            Assert.Contains("At least one budget field", result.Message);
        }

        [Fact]
        public async Task Handle_ProjectNotFound_ReturnsFalse()
        {
            // Arrange
            var projectId = 999;
            _projectRepositoryMock.Setup(r => r.GetById(projectId))
                .Returns((Project?)null);

            var command = new UpdateProjectBudgetCommand
            {
                ProjectId = projectId,
                EstimatedProjectCost = 100000m,
                ChangedBy = "test@example.com"
            };

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.False(result.Success);
            Assert.Contains("not found", result.Message);
        }

        [Fact]
        public async Task Handle_ReasonWithSpecialCharacters_HandlesCorrectly()
        {
            // Arrange
            var projectId = 1;
            var specialReason = "Budget update: <script>alert('test')</script> & \"quotes\" 'apostrophes'";
            var project = new Project 
            { 
                Id = projectId, 
                EstimatedProjectCost = 100000m,
                EstimatedProjectFee = 50000m,
                Currency = "USD"
            };

            _projectRepositoryMock.Setup(r => r.GetById(projectId))
                .Returns(project);

            ProjectBudgetChangeHistory? capturedHistory = null;
            _historyRepositoryMock.Setup(r => r.Add(It.IsAny<ProjectBudgetChangeHistory>()))
                .Callback<ProjectBudgetChangeHistory>(h => capturedHistory = h);

            var command = new UpdateProjectBudgetCommand
            {
                ProjectId = projectId,
                EstimatedProjectCost = 150000m,
                ChangedBy = "test@example.com",
                Reason = specialReason
            };

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.True(result.Success);
            Assert.NotNull(capturedHistory);
            Assert.Equal(specialReason, capturedHistory.Reason);
        }

        #endregion

        #region Edge Cases

        [Fact]
        public async Task Handle_VeryLargeDecimalValues_HandlesCorrectly()
        {
            // Arrange
            var projectId = 1;
            var largeValue = 999999999999999.99m; // Maximum for decimal(18,2)
            var project = new Project 
            { 
                Id = projectId, 
                EstimatedProjectCost = 100000m,
                EstimatedProjectFee = 50000m,
                Currency = "USD"
            };

            _projectRepositoryMock.Setup(r => r.GetById(projectId))
                .Returns(project);

            var command = new UpdateProjectBudgetCommand
            {
                ProjectId = projectId,
                EstimatedProjectCost = largeValue,
                ChangedBy = "test@example.com"
            };

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.True(result.Success);
            Assert.Equal(largeValue, project.EstimatedProjectCost);
        }

        [Fact]
        public async Task Handle_ZeroToNonZeroValue_CalculatesPercentageCorrectly()
        {
            // Arrange
            var projectId = 1;
            var oldValue = 0m;
            var newValue = 100000m;
            
            var project = new Project 
            { 
                Id = projectId, 
                EstimatedProjectCost = oldValue,
                EstimatedProjectFee = 50000m,
                Currency = "USD"
            };

            _projectRepositoryMock.Setup(r => r.GetById(projectId))
                .Returns(project);

            ProjectBudgetChangeHistory? capturedHistory = null;
            _historyRepositoryMock.Setup(r => r.Add(It.IsAny<ProjectBudgetChangeHistory>()))
                .Callback<ProjectBudgetChangeHistory>(h => capturedHistory = h);

            var command = new UpdateProjectBudgetCommand
            {
                ProjectId = projectId,
                EstimatedProjectCost = newValue,
                ChangedBy = "test@example.com"
            };

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.NotNull(capturedHistory);
            Assert.Equal(0m, capturedHistory.PercentageVariance); // Should handle division by zero
        }

        [Fact]
        public async Task Handle_NullReason_AllowsNullReason()
        {
            // Arrange
            var projectId = 1;
            var project = new Project 
            { 
                Id = projectId, 
                EstimatedProjectCost = 100000m,
                EstimatedProjectFee = 50000m,
                Currency = "USD"
            };

            _projectRepositoryMock.Setup(r => r.GetById(projectId))
                .Returns(project);

            ProjectBudgetChangeHistory? capturedHistory = null;
            _historyRepositoryMock.Setup(r => r.Add(It.IsAny<ProjectBudgetChangeHistory>()))
                .Callback<ProjectBudgetChangeHistory>(h => capturedHistory = h);

            var command = new UpdateProjectBudgetCommand
            {
                ProjectId = projectId,
                EstimatedProjectCost = 150000m,
                ChangedBy = "test@example.com",
                Reason = null // Explicitly null
            };

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.True(result.Success);
            Assert.NotNull(capturedHistory);
            Assert.Null(capturedHistory.Reason);
        }

        [Fact]
        public async Task Handle_EmptyReason_AllowsEmptyReason()
        {
            // Arrange
            var projectId = 1;
            var project = new Project 
            { 
                Id = projectId, 
                EstimatedProjectCost = 100000m,
                EstimatedProjectFee = 50000m,
                Currency = "USD"
            };

            _projectRepositoryMock.Setup(r => r.GetById(projectId))
                .Returns(project);

            ProjectBudgetChangeHistory? capturedHistory = null;
            _historyRepositoryMock.Setup(r => r.Add(It.IsAny<ProjectBudgetChangeHistory>()))
                .Callback<ProjectBudgetChangeHistory>(h => capturedHistory = h);

            var command = new UpdateProjectBudgetCommand
            {
                ProjectId = projectId,
                EstimatedProjectCost = 150000m,
                ChangedBy = "test@example.com",
                Reason = string.Empty
            };

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.True(result.Success);
            Assert.NotNull(capturedHistory);
            Assert.Equal(string.Empty, capturedHistory.Reason);
        }

        [Fact]
        public async Task Handle_AuditFields_SetsCorrectly()
        {
            // Arrange
            var projectId = 1;
            var changedBy = "test@example.com";
            var project = new Project 
            { 
                Id = projectId, 
                EstimatedProjectCost = 100000m,
                EstimatedProjectFee = 50000m,
                Currency = "USD"
            };

            _projectRepositoryMock.Setup(r => r.GetById(projectId))
                .Returns(project);

            ProjectBudgetChangeHistory? capturedHistory = null;
            _historyRepositoryMock.Setup(r => r.Add(It.IsAny<ProjectBudgetChangeHistory>()))
                .Callback<ProjectBudgetChangeHistory>(h => capturedHistory = h);

            var command = new UpdateProjectBudgetCommand
            {
                ProjectId = projectId,
                EstimatedProjectCost = 150000m,
                ChangedBy = changedBy
            };

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.NotNull(capturedHistory);
            Assert.Equal(changedBy, capturedHistory.ChangedBy);
            Assert.Equal(changedBy, capturedHistory.CreatedBy);
            Assert.True((DateTime.UtcNow - capturedHistory.ChangedDate).TotalSeconds < 5);
            Assert.True((DateTime.UtcNow - capturedHistory.CreatedAt).TotalSeconds < 5);
        }

        #endregion
    }
}

