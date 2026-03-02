using Moq;
using EDR.Application.CQRS.Projects.Handlers;
using EDR.Application.CQRS.Projects.Queries;
using EDR.Application.Dtos;
using EDR.Domain.Entities;
using EDR.Repositories.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace EDR.API.Tests.CQRS.Projects.Handlers
{
    /// <summary>
    /// Unit tests for GetBudgetHealthQueryHandler
    /// Tests the status calculation logic based on budget utilization thresholds
    /// Requirements: 1.2, 1.3, 1.4
    /// </summary>
    public class GetBudgetHealthQueryHandlerTests
    {
        private readonly Mock<IProjectRepository> _mockRepository;
        private readonly GetBudgetHealthQueryHandler _handler;

        public GetBudgetHealthQueryHandlerTests()
        {
            _mockRepository = new Mock<IProjectRepository>();
            _handler = new GetBudgetHealthQueryHandler(_mockRepository.Object);
        }

        [Fact]
        public void Constructor_NullRepository_ThrowsArgumentNullException()
        {
            // Act & Assert
            Assert.Throws<ArgumentNullException>(() => new GetBudgetHealthQueryHandler(null));
        }

        [Fact]
        public async Task Handle_NullQuery_ThrowsArgumentNullException()
        {
            // Act & Assert
            await Assert.ThrowsAsync<ArgumentNullException>(() => 
                _handler.Handle(null, CancellationToken.None));
        }

        [Fact]
        public async Task Handle_ProjectNotFound_ThrowsArgumentException()
        {
            // Arrange
            var projectId = 999;
            _mockRepository.Setup(r => r.GetById(projectId))
                .Returns((Project)null);

            var query = new GetBudgetHealthQuery { ProjectId = projectId };

            // Act & Assert
            var exception = await Assert.ThrowsAsync<ArgumentException>(() => 
                _handler.Handle(query, CancellationToken.None));
            
            Assert.Contains($"Project with ID {projectId} not found", exception.Message);
            _mockRepository.Verify(r => r.GetById(projectId), Times.Once);
        }

        [Theory]
        [InlineData(100000, 50000, 50.0, "Healthy")] // 50% utilization - Healthy
        [InlineData(100000, 80000, 80.0, "Healthy")] // 80% utilization - Healthy
        [InlineData(100000, 89999, 89.999, "Healthy")] // Just under 90% - Healthy
        public async Task Handle_UtilizationLessThan90Percent_ReturnsHealthyStatus(
            decimal estimatedCost, decimal actualCost, decimal expectedUtilization, string expectedStatus)
        {
            // Arrange
            var projectId = 1;
            var project = new Project
            {
                Id = projectId,
                Name = "Test Project",
                EstimatedProjectCost = estimatedCost,
                EstimatedProjectFee = actualCost
            };

            _mockRepository.Setup(r => r.GetById(projectId))
                .Returns(project);

            var query = new GetBudgetHealthQuery { ProjectId = projectId };

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(projectId, result.ProjectId);
            Assert.Equal(expectedStatus, result.Status);
            Assert.Equal(Math.Round(expectedUtilization, 2), result.UtilizationPercentage);
            Assert.Equal(estimatedCost, result.EstimatedBudget);
            Assert.Equal(actualCost, result.ActualCost);
            
            _mockRepository.Verify(r => r.GetById(projectId), Times.Once);
        }

        [Theory]
        [InlineData(100000, 90000, 90.0, "Warning")] // Exactly 90% - Warning
        [InlineData(100000, 95000, 95.0, "Warning")] // 95% utilization - Warning
        [InlineData(100000, 100000, 100.0, "Warning")] // Exactly 100% - Warning
        public async Task Handle_UtilizationBetween90And100Percent_ReturnsWarningStatus(
            decimal estimatedCost, decimal actualCost, decimal expectedUtilization, string expectedStatus)
        {
            // Arrange
            var projectId = 2;
            var project = new Project
            {
                Id = projectId,
                Name = "Test Project",
                EstimatedProjectCost = estimatedCost,
                EstimatedProjectFee = actualCost
            };

            _mockRepository.Setup(r => r.GetById(projectId))
                .Returns(project);

            var query = new GetBudgetHealthQuery { ProjectId = projectId };

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(projectId, result.ProjectId);
            Assert.Equal(expectedStatus, result.Status);
            Assert.Equal(Math.Round(expectedUtilization, 2), result.UtilizationPercentage);
            Assert.Equal(estimatedCost, result.EstimatedBudget);
            Assert.Equal(actualCost, result.ActualCost);
            
            _mockRepository.Verify(r => r.GetById(projectId), Times.Once);
        }

        [Theory]
        [InlineData(100000, 100001, 100.001, "Critical")] // Just over 100% - Critical
        [InlineData(100000, 110000, 110.0, "Critical")] // 110% utilization - Critical
        [InlineData(100000, 150000, 150.0, "Critical")] // 150% utilization - Critical
        [InlineData(100000, 200000, 200.0, "Critical")] // 200% utilization - Critical
        public async Task Handle_UtilizationOver100Percent_ReturnsCriticalStatus(
            decimal estimatedCost, decimal actualCost, decimal expectedUtilization, string expectedStatus)
        {
            // Arrange
            var projectId = 3;
            var project = new Project
            {
                Id = projectId,
                Name = "Test Project",
                EstimatedProjectCost = estimatedCost,
                EstimatedProjectFee = actualCost
            };

            _mockRepository.Setup(r => r.GetById(projectId))
                .Returns(project);

            var query = new GetBudgetHealthQuery { ProjectId = projectId };

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(projectId, result.ProjectId);
            Assert.Equal(expectedStatus, result.Status);
            Assert.Equal(Math.Round(expectedUtilization, 2), result.UtilizationPercentage);
            Assert.Equal(estimatedCost, result.EstimatedBudget);
            Assert.Equal(actualCost, result.ActualCost);
            
            _mockRepository.Verify(r => r.GetById(projectId), Times.Once);
        }

        [Fact]
        public async Task Handle_ZeroEstimatedBudget_ReturnsZeroUtilizationHealthyStatus()
        {
            // Arrange
            var projectId = 4;
            var project = new Project
            {
                Id = projectId,
                Name = "Test Project",
                EstimatedProjectCost = 0,
                EstimatedProjectFee = 50000
            };

            _mockRepository.Setup(r => r.GetById(projectId))
                .Returns(project);

            var query = new GetBudgetHealthQuery { ProjectId = projectId };

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(projectId, result.ProjectId);
            Assert.Equal("Healthy", result.Status);
            Assert.Equal(0, result.UtilizationPercentage);
            Assert.Equal(0, result.EstimatedBudget);
            Assert.Equal(50000, result.ActualCost);
            
            _mockRepository.Verify(r => r.GetById(projectId), Times.Once);
        }

        [Fact]
        public async Task Handle_ZeroActualCost_ReturnsZeroUtilizationHealthyStatus()
        {
            // Arrange
            var projectId = 5;
            var project = new Project
            {
                Id = projectId,
                Name = "Test Project",
                EstimatedProjectCost = 100000,
                EstimatedProjectFee = 0
            };

            _mockRepository.Setup(r => r.GetById(projectId))
                .Returns(project);

            var query = new GetBudgetHealthQuery { ProjectId = projectId };

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(projectId, result.ProjectId);
            Assert.Equal("Healthy", result.Status);
            Assert.Equal(0, result.UtilizationPercentage);
            Assert.Equal(100000, result.EstimatedBudget);
            Assert.Equal(0, result.ActualCost);
            
            _mockRepository.Verify(r => r.GetById(projectId), Times.Once);
        }

        [Fact]
        public async Task Handle_BothZero_ReturnsZeroUtilizationHealthyStatus()
        {
            // Arrange
            var projectId = 6;
            var project = new Project
            {
                Id = projectId,
                Name = "Test Project",
                EstimatedProjectCost = 0,
                EstimatedProjectFee = 0
            };

            _mockRepository.Setup(r => r.GetById(projectId))
                .Returns(project);

            var query = new GetBudgetHealthQuery { ProjectId = projectId };

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(projectId, result.ProjectId);
            Assert.Equal("Healthy", result.Status);
            Assert.Equal(0, result.UtilizationPercentage);
            Assert.Equal(0, result.EstimatedBudget);
            Assert.Equal(0, result.ActualCost);
            
            _mockRepository.Verify(r => r.GetById(projectId), Times.Once);
        }

        [Fact]
        public async Task Handle_UtilizationRounding_RoundsToTwoDecimalPlaces()
        {
            // Arrange
            var projectId = 7;
            var project = new Project
            {
                Id = projectId,
                Name = "Test Project",
                EstimatedProjectCost = 100000,
                EstimatedProjectFee = 92567.89m // Results in 92.56789% utilization
            };

            _mockRepository.Setup(r => r.GetById(projectId))
                .Returns(project);

            var query = new GetBudgetHealthQuery { ProjectId = projectId };

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(projectId, result.ProjectId);
            Assert.Equal("Warning", result.Status);
            Assert.Equal(92.57m, result.UtilizationPercentage); // Rounded to 2 decimal places
            Assert.Equal(100000, result.EstimatedBudget);
            Assert.Equal(92567.89m, result.ActualCost);
            
            _mockRepository.Verify(r => r.GetById(projectId), Times.Once);
        }
    }
}

