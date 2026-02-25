using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using EDR.Application.CQRS.ProjectClosure.Commands;
using EDR.Application.CQRS.ProjectClosure.Handlers;
using EDR.Repositories.Interfaces;

namespace EDR.API.Tests.CQRS.ProjectClosure.Handlers
{
    public class DeleteProjectClosureCommandHandlerTests
    {
        private readonly Mock<IProjectClosureRepository> _mockRepo;
        private readonly Mock<ILogger<DeleteProjectClosureCommandHandler>> _mockLogger;
        private readonly DeleteProjectClosureCommandHandler _handler;

        public DeleteProjectClosureCommandHandlerTests()
        {
            _mockRepo = new Mock<IProjectClosureRepository>();
            _mockLogger = new Mock<ILogger<DeleteProjectClosureCommandHandler>>();

            _handler = new DeleteProjectClosureCommandHandler(_mockRepo.Object, _mockLogger.Object);
        }

        [Fact]
        public async Task Handle_ValidRequest_CallsDeleteAndReturnsTrue()
        {
            // Arrange
            var command = new DeleteProjectClosureCommand(10);
            _mockRepo.Setup(r => r.Delete(10)).Verifiable();

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.True(result);
            _mockRepo.Verify();
        }

        [Fact]
        public async Task Handle_InvalidId_ThrowsArgumentException()
        {
            // Arrange
            var command = new DeleteProjectClosureCommand(-1);

            // Act & Assert
            await Assert.ThrowsAsync<ArgumentException>(() => _handler.Handle(command, CancellationToken.None));
        }
    }
}
