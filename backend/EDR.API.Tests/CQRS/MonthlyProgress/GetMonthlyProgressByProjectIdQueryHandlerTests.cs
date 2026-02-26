using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Moq;
using Xunit;
using EDR.Application.CQRS.MonthlyProgress.Queries;
using EDR.Application.CQRS.MonthlyProgress.Handlers;
using EDR.Application.Dtos;
using EDR.Repositories.Interfaces;

namespace EDR.API.Tests.CQRS.MonthlyProgress.Handlers
{
    public class GetMonthlyProgressByProjectIdQueryHandlerTests
    {
        private readonly Mock<IMonthlyProgressRepository> _mockRepo;
        private readonly GetMonthlyProgressByProjectIdQueryHandler _handler;

        public GetMonthlyProgressByProjectIdQueryHandlerTests()
        {
            _mockRepo = new Mock<IMonthlyProgressRepository>();
            _handler = new GetMonthlyProgressByProjectIdQueryHandler(_mockRepo.Object);
        }

        [Fact]
        public async Task Handle_ValidRequest_ReturnsMappedListSortedByYearAndMonth()
        {
            // Arrange
            var entities = new List<EDR.Domain.Entities.MonthlyProgress>
            {
                new EDR.Domain.Entities.MonthlyProgress { Id = 1, ProjectId = 10, Month = 2, Year = 2024 },
                new EDR.Domain.Entities.MonthlyProgress { Id = 2, ProjectId = 10, Month = 1, Year = 2024 },
                new EDR.Domain.Entities.MonthlyProgress { Id = 3, ProjectId = 10, Month = 12, Year = 2023 }
            };

            _mockRepo.Setup(r => r.GetByProjectIdAsync(10)).ReturnsAsync(entities);

            var query = new GetMonthlyProgressByProjectIdQuery { ProjectId = 10 };

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(3, result.Count());
            
            // Should be sorted by Year then Month (ascending default)
            // 2023/12, 2024/01, 2024/02
            Assert.Equal(3, result[0].Id);
            Assert.Equal(2, result[1].Id);
            Assert.Equal(1, result[2].Id);
        }

        [Fact]
        public async Task Handle_NoRecords_ReturnsEmptyList()
        {
            // Arrange
            _mockRepo.Setup(r => r.GetByProjectIdAsync(99)).ReturnsAsync(new List<EDR.Domain.Entities.MonthlyProgress>());

            var query = new GetMonthlyProgressByProjectIdQuery { ProjectId = 99 };

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Empty(result);
        }
    }
}
