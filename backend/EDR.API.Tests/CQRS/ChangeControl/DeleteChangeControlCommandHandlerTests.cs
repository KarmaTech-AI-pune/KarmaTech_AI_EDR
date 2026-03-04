using System;
using System.Threading;
using System.Threading.Tasks;
using Moq;
using Xunit;
using MediatR;
using EDR.Application.CQRS.ChangeControl.Commands;
using EDR.Application.CQRS.ChangeControl.Handlers;
using EDR.Repositories.Interfaces;

namespace EDR.API.Tests.CQRS.ChangeControl.Handlers
{
    public class DeleteChangeControlCommandHandlerTests
    {
        private readonly Mock<IChangeControlRepository> _mockChangeControlRepo;
        private readonly DeleteChangeControlCommandHandler _handler;

        public DeleteChangeControlCommandHandlerTests()
        {
            _mockChangeControlRepo = new Mock<IChangeControlRepository>();
            _handler = new DeleteChangeControlCommandHandler(_mockChangeControlRepo.Object);
        }

        [Fact]
        public async Task Handle_ValidRequest_CallsDeleteAsyncAndReturnsUnit()
        {
            // Arrange
            var request = new DeleteChangeControlCommand(10);
            _mockChangeControlRepo.Setup(r => r.DeleteAsync(10)).Returns(Task.CompletedTask);

            // Act
            var result = await _handler.Handle(request, CancellationToken.None);

            // Assert
            Assert.Equal(Unit.Value, result);
            _mockChangeControlRepo.Verify(r => r.DeleteAsync(10), Times.Once);
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
            Assert.Throws<ArgumentNullException>(() => new DeleteChangeControlCommandHandler(null));
        }
    }
}
