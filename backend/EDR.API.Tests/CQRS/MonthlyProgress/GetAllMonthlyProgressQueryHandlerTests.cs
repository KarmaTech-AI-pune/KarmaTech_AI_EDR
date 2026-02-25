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
    public class GetAllMonthlyProgressQueryHandlerTests
    {
        private readonly Mock<IMonthlyProgressRepository> _mockRepo;
        private readonly GetAllMonthlyProgressQueryHandler _handler;

        public GetAllMonthlyProgressQueryHandlerTests()
        {
            _mockRepo = new Mock<IMonthlyProgressRepository>();
            _handler = new GetAllMonthlyProgressQueryHandler(_mockRepo.Object);
        }

        [Fact]
        public async Task Handle_ReturnsMappedList()
        {
            // Arrange
            var entities = new List<EDR.Domain.Entities.MonthlyProgress>
            {
                new EDR.Domain.Entities.MonthlyProgress { Id = 1, ProjectId = 10, Month = 1, Year = 2024 },
                new EDR.Domain.Entities.MonthlyProgress { Id = 2, ProjectId = 10, Month = 2, Year = 2024 }
            };

            _mockRepo.Setup(r => r.GetAllAsync()).ReturnsAsync(entities);

            var query = new GetAllMonthlyProgressQuery();

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Count());
            Assert.Equal(1, result.First().Id);
            Assert.Equal(2, result.Last().Id);
        }

        [Fact]
        public async Task Handle_EmptyReturnsEmptyList()
        {
            // Arrange
            _mockRepo.Setup(r => r.GetAllAsync()).ReturnsAsync(new List<EDR.Domain.Entities.MonthlyProgress>());

            var query = new GetAllMonthlyProgressQuery();

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Empty(result);
        }
    }
}
