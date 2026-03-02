using System;
using System.Threading;
using System.Threading.Tasks;
using Moq;
using Xunit;
using EDR.Application.CQRS.MonthlyProgress.Commands;
using EDR.Application.CQRS.MonthlyProgress.Handlers;
using EDR.Application.DTOs;
using EDR.Repositories.Interfaces;

namespace EDR.API.Tests.CQRS.MonthlyProgress.Handlers
{
    public class CreateMonthlyProgressCommandHandlerTests
    {
        private readonly Mock<IMonthlyProgressRepository> _mockRepo;
        private readonly CreateMonthlyProgressCommandHandler _handler;

        public CreateMonthlyProgressCommandHandlerTests()
        {
            _mockRepo = new Mock<IMonthlyProgressRepository>();
            _handler = new CreateMonthlyProgressCommandHandler(_mockRepo.Object);
        }

        [Fact]
        public async Task Handle_ValidRequest_CreatesAndReturnsId()
        {
            // Arrange
            var dto = new CreateMonthlyProgressDto { Month = 5, Year = 2024 };
            var command = new CreateMonthlyProgressCommand { ProjectId = 10, MonthlyProgress = dto };

            _mockRepo.Setup(r => r.AddAsync(It.IsAny<EDR.Domain.Entities.MonthlyProgress>()))
                     .Callback<EDR.Domain.Entities.MonthlyProgress>(mp => mp.Id = 99)
                     .Returns(Task.CompletedTask);

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.Equal(99, result);
            _mockRepo.Verify(r => r.AddAsync(It.Is<EDR.Domain.Entities.MonthlyProgress>(mp => mp.ProjectId == 10 && mp.Month == 5 && mp.Year == 2024)), Times.Once);
        }

        [Fact]
        public async Task Handle_NullRequest_ThrowsArgumentNullException()
        {
            await Assert.ThrowsAsync<ArgumentNullException>(() => _handler.Handle(null, CancellationToken.None));
        }
    }
}
