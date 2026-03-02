using System;
using System.Threading;
using System.Threading.Tasks;
using Moq;
using Xunit;
using EDR.Application.CQRS.MonthlyProgress.Commands;
using EDR.Application.CQRS.MonthlyProgress.Handlers;
using EDR.Repositories.Interfaces;

namespace EDR.API.Tests.CQRS.MonthlyProgress.Handlers
{
    public class DeleteMonthlyProgressCommandHandlerTests
    {
        private readonly Mock<IMonthlyProgressRepository> _mockRepo;
        private readonly DeleteMonthlyProgressCommandHandler _handler;

        public DeleteMonthlyProgressCommandHandlerTests()
        {
            _mockRepo = new Mock<IMonthlyProgressRepository>();
            _handler = new DeleteMonthlyProgressCommandHandler(_mockRepo.Object);
        }

        [Fact]
        public async Task Handle_ValidRequest_DeletesAndReturnsTrue()
        {
            // Arrange
            var id = 1;
            var command = new DeleteMonthlyProgressCommand { Id = id };
            var entity = new EDR.Domain.Entities.MonthlyProgress { Id = id };

            _mockRepo.Setup(r => r.GetByIdAsync(id)).ReturnsAsync(entity);
            _mockRepo.Setup(r => r.DeleteAsync(entity)).Returns(Task.CompletedTask);

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.True(result);
            _mockRepo.Verify(r => r.DeleteAsync(entity), Times.Once);
        }

        [Fact]
        public async Task Handle_EntityNotFound_ReturnsFalse()
        {
            // Arrange
            var id = 99;
            var command = new DeleteMonthlyProgressCommand { Id = id };

            _mockRepo.Setup(r => r.GetByIdAsync(id)).ReturnsAsync((EDR.Domain.Entities.MonthlyProgress)null);

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.False(result);
            _mockRepo.Verify(r => r.DeleteAsync(It.IsAny<EDR.Domain.Entities.MonthlyProgress>()), Times.Never);
        }

        [Fact]
        public async Task Handle_NullCommand_ThrowsArgumentNullException()
        {
            await Assert.ThrowsAsync<ArgumentNullException>(() => _handler.Handle(null, CancellationToken.None));
        }
    }
}
