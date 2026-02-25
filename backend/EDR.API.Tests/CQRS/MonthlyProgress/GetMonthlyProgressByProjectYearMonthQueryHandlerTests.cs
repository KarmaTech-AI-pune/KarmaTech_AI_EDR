using System;
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
    public class GetMonthlyProgressByProjectYearMonthQueryHandlerTests
    {
        private readonly Mock<IMonthlyProgressRepository> _mockRepo;
        private readonly GetMonthlyProgressByProjectYearMonthQueryHandler _handler;

        public GetMonthlyProgressByProjectYearMonthQueryHandlerTests()
        {
            _mockRepo = new Mock<IMonthlyProgressRepository>();
            _handler = new GetMonthlyProgressByProjectYearMonthQueryHandler(_mockRepo.Object);
        }

        [Fact]
        public async Task Handle_ValidRequest_ReturnsMappedDto()
        {
            // Arrange
            var entity = new EDR.Domain.Entities.MonthlyProgress { Id = 10, ProjectId = 5, Month = 6, Year = 2024 };

            _mockRepo.Setup(r => r.GetByProjectYearMonthAsync(5, 2024, 6)).ReturnsAsync(entity);

            var query = new GetMonthlyProgressByProjectYearMonthQuery { ProjectId = 5, Year = 2024, Month = 6 };

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(10, result.Id);
            Assert.Equal(5, result.ProjectId);
        }

        [Fact]
        public async Task Handle_NotFound_ReturnsNull()
        {
            // Arrange
            _mockRepo.Setup(r => r.GetByProjectYearMonthAsync(99, 2024, 6)).ReturnsAsync((EDR.Domain.Entities.MonthlyProgress)null);

            var query = new GetMonthlyProgressByProjectYearMonthQuery { ProjectId = 99, Year = 2024, Month = 6 };

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task Handle_NullArgument_ThrowsArgumentNullException()
        {
            await Assert.ThrowsAsync<ArgumentNullException>(() => _handler.Handle(null, CancellationToken.None));
        }
    }
}
