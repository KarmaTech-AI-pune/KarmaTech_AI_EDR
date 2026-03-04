using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Moq;
using Xunit;
using EDR.Application.CQRS.Projects.Queries;
using EDR.Application.CQRS.Projects.Handlers;
using EDR.Domain.Entities;
using EDR.Repositories.Interfaces;

namespace EDR.API.Tests.CQRS.Projects.Handlers
{
    public class GetProjectBudgetHistoryQueryHandlerTests
    {
        private readonly Mock<IProjectBudgetChangeHistoryRepository> _mockRepo;
        private readonly GetProjectBudgetHistoryQueryHandler _handler;

        public GetProjectBudgetHistoryQueryHandlerTests()
        {
            _mockRepo = new Mock<IProjectBudgetChangeHistoryRepository>();
            _handler = new GetProjectBudgetHistoryQueryHandler(_mockRepo.Object);
        }

        [Fact]
        public async Task Handle_ValidRequest_ReturnsPagedHistory()
        {
            // Arrange
            var request = new GetProjectBudgetHistoryQuery { ProjectId = 1, FieldName = "Cost", PageNumber = 1, PageSize = 10 };
            var historyRecord = new ProjectBudgetChangeHistory 
            { 
                Id = 100, 
                ProjectId = 1,
                FieldName = "Cost",
                ChangedByUser = new User { Id = "u1", Name = "User1" }
            };

            _mockRepo.Setup(r => r.GetByProjectIdWithFilteringAsync(1, "Cost", 1, 10))
                .ReturnsAsync(new List<ProjectBudgetChangeHistory> { historyRecord });
            
            _mockRepo.Setup(r => r.GetCountByProjectIdAsync(1, "Cost"))
                .ReturnsAsync(1);

            // Act
            var result = await _handler.Handle(request, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(1, result.TotalCount);
            Assert.Single(result.History);
            Assert.Equal(100, result.History[0].Id);
            Assert.NotNull(result.History[0].ChangedByUser);
            Assert.Equal("User1", result.History[0].ChangedByUser.Name);
        }

        [Fact]
        public async Task Handle_NullRequest_ThrowsArgumentNullException()
        {
            // Act & Assert
            await Assert.ThrowsAsync<ArgumentNullException>(() => _handler.Handle(null, CancellationToken.None));
        }

        [Fact]
        public void Constructor_NullRepository_ThrowsArgumentNullException()
        {
            // Act & Assert
            Assert.Throws<ArgumentNullException>(() => new GetProjectBudgetHistoryQueryHandler(null));
        }
    }
}
