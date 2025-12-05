using Moq;
using NJS.Application.CQRS.Projects.Handlers;
using NJS.Application.CQRS.Projects.Queries;
using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace NJS.Application.Tests.Handlers
{
    public class GetProjectBudgetHistoryQueryHandlerTests
    {
        private readonly Mock<IProjectBudgetChangeHistoryRepository> _historyRepositoryMock;
        private readonly GetProjectBudgetHistoryQueryHandler _handler;

        public GetProjectBudgetHistoryQueryHandlerTests()
        {
            _historyRepositoryMock = new Mock<IProjectBudgetChangeHistoryRepository>();
            _handler = new GetProjectBudgetHistoryQueryHandler(_historyRepositoryMock.Object);
        }

        #region Repository Tests

        [Fact]
        public async Task Handle_ValidQuery_ReturnsHistoryRecords()
        {
            // Arrange
            var projectId = 1;
            var historyRecords = new List<ProjectBudgetChangeHistory>
            {
                CreateHistoryRecord(1, projectId, "EstimatedProjectCost", 100000m, 150000m),
                CreateHistoryRecord(2, projectId, "EstimatedProjectFee", 50000m, 75000m)
            };

            _historyRepositoryMock.Setup(r => r.GetByProjectIdWithFilteringAsync(
                projectId, null, 1, 10))
                .ReturnsAsync(historyRecords);

            _historyRepositoryMock.Setup(r => r.GetCountByProjectIdAsync(projectId, null))
                .ReturnsAsync(2);

            var query = new GetProjectBudgetHistoryQuery
            {
                ProjectId = projectId,
                PageNumber = 1,
                PageSize = 10
            };

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.History.Count);
            Assert.Equal(2, result.TotalCount);
            Assert.Equal(1, result.PageNumber);
            Assert.Equal(10, result.PageSize);
        }

        [Fact]
        public async Task Handle_FilterByFieldName_ReturnsFilteredRecords()
        {
            // Arrange
            var projectId = 1;
            var fieldName = "EstimatedProjectCost";
            var historyRecords = new List<ProjectBudgetChangeHistory>
            {
                CreateHistoryRecord(1, projectId, fieldName, 100000m, 150000m)
            };

            _historyRepositoryMock.Setup(r => r.GetByProjectIdWithFilteringAsync(
                projectId, fieldName, 1, 10))
                .ReturnsAsync(historyRecords);

            _historyRepositoryMock.Setup(r => r.GetCountByProjectIdAsync(projectId, fieldName))
                .ReturnsAsync(1);

            var query = new GetProjectBudgetHistoryQuery
            {
                ProjectId = projectId,
                FieldName = fieldName,
                PageNumber = 1,
                PageSize = 10
            };

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Single(result.History);
            Assert.Equal(fieldName, result.History[0].FieldName);
        }

        [Fact]
        public async Task Handle_Pagination_FirstPage_ReturnsCorrectRecords()
        {
            // Arrange
            var projectId = 1;
            var pageSize = 5;
            var historyRecords = Enumerable.Range(1, pageSize)
                .Select(i => CreateHistoryRecord(i, projectId, "EstimatedProjectCost", 100000m, 150000m))
                .ToList();

            _historyRepositoryMock.Setup(r => r.GetByProjectIdWithFilteringAsync(
                projectId, null, 1, pageSize))
                .ReturnsAsync(historyRecords);

            _historyRepositoryMock.Setup(r => r.GetCountByProjectIdAsync(projectId, null))
                .ReturnsAsync(15); // Total 15 records

            var query = new GetProjectBudgetHistoryQuery
            {
                ProjectId = projectId,
                PageNumber = 1,
                PageSize = pageSize
            };

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.Equal(pageSize, result.History.Count);
            Assert.Equal(15, result.TotalCount);
            Assert.Equal(1, result.PageNumber);
        }

        [Fact]
        public async Task Handle_Pagination_LastPage_ReturnsRemainingRecords()
        {
            // Arrange
            var projectId = 1;
            var pageSize = 10;
            var remainingRecords = 3;
            var historyRecords = Enumerable.Range(1, remainingRecords)
                .Select(i => CreateHistoryRecord(i, projectId, "EstimatedProjectCost", 100000m, 150000m))
                .ToList();

            _historyRepositoryMock.Setup(r => r.GetByProjectIdWithFilteringAsync(
                projectId, null, 3, pageSize))
                .ReturnsAsync(historyRecords);

            _historyRepositoryMock.Setup(r => r.GetCountByProjectIdAsync(projectId, null))
                .ReturnsAsync(23); // Total 23 records, page 3 has 3 records

            var query = new GetProjectBudgetHistoryQuery
            {
                ProjectId = projectId,
                PageNumber = 3,
                PageSize = pageSize
            };

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.Equal(remainingRecords, result.History.Count);
            Assert.Equal(23, result.TotalCount);
            Assert.Equal(3, result.PageNumber);
        }

        [Fact]
        public async Task Handle_EmptyResults_ReturnsEmptyList()
        {
            // Arrange
            var projectId = 999;
            var emptyList = new List<ProjectBudgetChangeHistory>();

            _historyRepositoryMock.Setup(r => r.GetByProjectIdWithFilteringAsync(
                projectId, null, 1, 10))
                .ReturnsAsync(emptyList);

            _historyRepositoryMock.Setup(r => r.GetCountByProjectIdAsync(projectId, null))
                .ReturnsAsync(0);

            var query = new GetProjectBudgetHistoryQuery
            {
                ProjectId = projectId,
                PageNumber = 1,
                PageSize = 10
            };

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Empty(result.History);
            Assert.Equal(0, result.TotalCount);
        }

        [Fact]
        public async Task Handle_SinglePage_ReturnsAllRecords()
        {
            // Arrange
            var projectId = 1;
            var historyRecords = new List<ProjectBudgetChangeHistory>
            {
                CreateHistoryRecord(1, projectId, "EstimatedProjectCost", 100000m, 150000m),
                CreateHistoryRecord(2, projectId, "EstimatedProjectFee", 50000m, 75000m),
                CreateHistoryRecord(3, projectId, "EstimatedProjectCost", 150000m, 200000m)
            };

            _historyRepositoryMock.Setup(r => r.GetByProjectIdWithFilteringAsync(
                projectId, null, 1, 10))
                .ReturnsAsync(historyRecords);

            _historyRepositoryMock.Setup(r => r.GetCountByProjectIdAsync(projectId, null))
                .ReturnsAsync(3);

            var query = new GetProjectBudgetHistoryQuery
            {
                ProjectId = projectId,
                PageNumber = 1,
                PageSize = 10
            };

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.Equal(3, result.History.Count);
            Assert.Equal(3, result.TotalCount);
        }

        #endregion

        #region Data Mapping Tests

        [Fact]
        public async Task Handle_MapsAllFieldsCorrectly()
        {
            // Arrange
            var projectId = 1;
            var historyRecord = CreateHistoryRecord(1, projectId, "EstimatedProjectCost", 100000m, 150000m);
            historyRecord.Reason = "Budget increase";
            historyRecord.Currency = "EUR";

            _historyRepositoryMock.Setup(r => r.GetByProjectIdWithFilteringAsync(
                projectId, null, 1, 10))
                .ReturnsAsync(new List<ProjectBudgetChangeHistory> { historyRecord });

            _historyRepositoryMock.Setup(r => r.GetCountByProjectIdAsync(projectId, null))
                .ReturnsAsync(1);

            var query = new GetProjectBudgetHistoryQuery
            {
                ProjectId = projectId,
                PageNumber = 1,
                PageSize = 10
            };

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            var dto = result.History.First();
            Assert.Equal(historyRecord.Id, dto.Id);
            Assert.Equal(historyRecord.ProjectId, dto.ProjectId);
            Assert.Equal(historyRecord.FieldName, dto.FieldName);
            Assert.Equal(historyRecord.OldValue, dto.OldValue);
            Assert.Equal(historyRecord.NewValue, dto.NewValue);
            Assert.Equal(historyRecord.Variance, dto.Variance);
            Assert.Equal(historyRecord.PercentageVariance, dto.PercentageVariance);
            Assert.Equal(historyRecord.Currency, dto.Currency);
            Assert.Equal(historyRecord.ChangedBy, dto.ChangedBy);
            Assert.Equal(historyRecord.ChangedDate, dto.ChangedDate);
            Assert.Equal(historyRecord.Reason, dto.Reason);
        }

        [Fact]
        public async Task Handle_WithUserInformation_MapsUserDto()
        {
            // Arrange
            var projectId = 1;
            var historyRecord = CreateHistoryRecord(1, projectId, "EstimatedProjectCost", 100000m, 150000m);
            historyRecord.ChangedByUser = new User
            {
                Id = "user-123",
                Name = "John Doe",
                Email = "john.doe@example.com",
                UserName = "johndoe"
            };

            _historyRepositoryMock.Setup(r => r.GetByProjectIdWithFilteringAsync(
                projectId, null, 1, 10))
                .ReturnsAsync(new List<ProjectBudgetChangeHistory> { historyRecord });

            _historyRepositoryMock.Setup(r => r.GetCountByProjectIdAsync(projectId, null))
                .ReturnsAsync(1);

            var query = new GetProjectBudgetHistoryQuery
            {
                ProjectId = projectId,
                PageNumber = 1,
                PageSize = 10
            };

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            var dto = result.History.First();
            Assert.NotNull(dto.ChangedByUser);
            Assert.Equal("user-123", dto.ChangedByUser.Id);
            Assert.Equal("John Doe", dto.ChangedByUser.Name);
            Assert.Equal("john.doe@example.com", dto.ChangedByUser.Email);
            Assert.Equal("johndoe", dto.ChangedByUser.UserName);
        }

        [Fact]
        public async Task Handle_WithoutUserInformation_ReturnsNullUser()
        {
            // Arrange
            var projectId = 1;
            var historyRecord = CreateHistoryRecord(1, projectId, "EstimatedProjectCost", 100000m, 150000m);
            historyRecord.ChangedByUser = null;

            _historyRepositoryMock.Setup(r => r.GetByProjectIdWithFilteringAsync(
                projectId, null, 1, 10))
                .ReturnsAsync(new List<ProjectBudgetChangeHistory> { historyRecord });

            _historyRepositoryMock.Setup(r => r.GetCountByProjectIdAsync(projectId, null))
                .ReturnsAsync(1);

            var query = new GetProjectBudgetHistoryQuery
            {
                ProjectId = projectId,
                PageNumber = 1,
                PageSize = 10
            };

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            var dto = result.History.First();
            Assert.Null(dto.ChangedByUser);
        }

        #endregion

        #region Validation Tests

        [Fact]
        public async Task Handle_NullQuery_ThrowsArgumentNullException()
        {
            // Act & Assert
            await Assert.ThrowsAsync<ArgumentNullException>(
                () => _handler.Handle(null!, CancellationToken.None));
        }

        #endregion

        #region Helper Methods

        private ProjectBudgetChangeHistory CreateHistoryRecord(
            int id, 
            int projectId, 
            string fieldName, 
            decimal oldValue, 
            decimal newValue)
        {
            var variance = newValue - oldValue;
            var percentageVariance = oldValue != 0 ? (variance / oldValue) * 100 : 0;

            return new ProjectBudgetChangeHistory
            {
                Id = id,
                ProjectId = projectId,
                FieldName = fieldName,
                OldValue = oldValue,
                NewValue = newValue,
                Variance = variance,
                PercentageVariance = percentageVariance,
                Currency = "USD",
                ChangedBy = "test@example.com",
                ChangedDate = DateTime.UtcNow.AddDays(-id),
                Reason = null,
                CreatedAt = DateTime.UtcNow.AddDays(-id),
                CreatedBy = "test@example.com"
            };
        }

        #endregion
    }
}
