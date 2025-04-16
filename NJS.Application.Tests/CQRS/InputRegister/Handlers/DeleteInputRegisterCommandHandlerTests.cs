using Moq;
using NJS.Application.Tests.CQRS.InputRegister.Commands;
using NJS.Repositories.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace NJS.Application.Tests.CQRS.InputRegister.Handlers
{
    public class DeleteInputRegisterCommandHandlerTests
    {
        private readonly Mock<IInputRegisterRepository> _mockRepository;
        private readonly DeleteInputRegisterCommandHandler _handler;

        public DeleteInputRegisterCommandHandlerTests()
        {
            _mockRepository = new Mock<IInputRegisterRepository>();
            _handler = new DeleteInputRegisterCommandHandler(_mockRepository.Object);
        }

        [Fact]
        public async Task Handle_ExistingEntity_ReturnsTrue()
        {
            // Arrange
            var command = new DeleteInputRegisterCommand(1);

            _mockRepository.Setup(r => r.ExistsAsync(command.Id))
                .ReturnsAsync(true);

            _mockRepository.Setup(r => r.DeleteAsync(command.Id))
                .Returns(Task.CompletedTask);

            _mockRepository.Setup(r => r.ResetIdentitySeedAsync())
                .Returns(Task.CompletedTask);

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.True(result);
            _mockRepository.Verify(r => r.ExistsAsync(command.Id), Times.Once);
            _mockRepository.Verify(r => r.DeleteAsync(command.Id), Times.Once);
            _mockRepository.Verify(r => r.ResetIdentitySeedAsync(), Times.Once);
        }

        [Fact]
        public async Task Handle_NonExistingEntity_ReturnsFalse()
        {
            // Arrange
            var command = new DeleteInputRegisterCommand(999);

            _mockRepository.Setup(r => r.ExistsAsync(command.Id))
                .ReturnsAsync(false);

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.False(result);
            _mockRepository.Verify(r => r.ExistsAsync(command.Id), Times.Once);
            _mockRepository.Verify(r => r.DeleteAsync(command.Id), Times.Never);
            _mockRepository.Verify(r => r.ResetIdentitySeedAsync(), Times.Never);
        }

        [Fact]
        public async Task Handle_NullCommand_ThrowsArgumentNullException()
        {
            // Arrange
            DeleteInputRegisterCommand command = null;

            // Act & Assert
            await Assert.ThrowsAsync<ArgumentNullException>(() => 
                _handler.Handle(command, CancellationToken.None));
        }

        [Fact]
        public async Task Handle_RepositoryThrowsException_PropagatesException()
        {
            // Arrange
            var command = new DeleteInputRegisterCommand(1);

            _mockRepository.Setup(r => r.ExistsAsync(command.Id))
                .ReturnsAsync(true);

            var expectedException = new Exception("Database error");
            _mockRepository.Setup(r => r.DeleteAsync(command.Id))
                .ThrowsAsync(expectedException);

            // Act & Assert
            var exception = await Assert.ThrowsAsync<Exception>(() => 
                _handler.Handle(command, CancellationToken.None));
            
            Assert.Same(expectedException, exception);
        }
    }
}
