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
    public class UpdateMonthlyProgressCommandHandlerTests
    {
        private readonly Mock<IMonthlyProgressRepository> _mockRepo;
        private readonly UpdateMonthlyProgressCommandHandler _handler;

        public UpdateMonthlyProgressCommandHandlerTests()
        {
            _mockRepo = new Mock<IMonthlyProgressRepository>();
            _handler = new UpdateMonthlyProgressCommandHandler(_mockRepo.Object);
        }

        [Fact]
        public async Task Handle_ValidRequest_UpdatesAndReturnsTrue()
        {
            // Arrange
            var dto = new CreateMonthlyProgressDto { Month = 6, Year = 2025 };
            var command = new UpdateMonthlyProgressCommand { Id = 10, MonthlyProgress = dto };

            var existingEntity = new EDR.Domain.Entities.MonthlyProgress { Id = 10, ProjectId = 5, Month = 1, Year = 2020 };

            _mockRepo.Setup(r => r.GetByIdAsync(10)).ReturnsAsync(existingEntity);
            _mockRepo.Setup(r => r.UpdateAsync(existingEntity)).Returns(Task.CompletedTask);

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.True(result);
            Assert.Equal(6, existingEntity.Month);
            Assert.Equal(2025, existingEntity.Year);
            _mockRepo.Verify(r => r.UpdateAsync(existingEntity), Times.Once);
        }

        [Fact]
        public async Task Handle_EntityNotFound_ReturnsFalse()
        {
            // Arrange
            var dto = new CreateMonthlyProgressDto();
            var command = new UpdateMonthlyProgressCommand { Id = 99, MonthlyProgress = dto };

            _mockRepo.Setup(r => r.GetByIdAsync(99)).ReturnsAsync((EDR.Domain.Entities.MonthlyProgress)null);

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.False(result);
            _mockRepo.Verify(r => r.UpdateAsync(It.IsAny<EDR.Domain.Entities.MonthlyProgress>()), Times.Never);
        }

        [Fact]
        public async Task Handle_NullCommand_ThrowsArgumentNullException()
        {
            await Assert.ThrowsAsync<ArgumentNullException>(() => _handler.Handle(null, CancellationToken.None));
        }
    }
}
