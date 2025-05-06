using MediatR;
using Moq;
using NJS.Application.CQRS.InputRegister.Commands;
using NJS.Application.CQRS.InputRegister.Handlers;
using NJS.Repositories.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace NJS.API.Tests.CQRS.InputRegister.Handlers
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
        public void Constructor_NullRepository_ThrowsArgumentNullException()
        {
            // Act & Assert
            Assert.Throws<ArgumentNullException>(() => new DeleteInputRegisterCommandHandler(null));
        }

        [Fact]
        public async Task Handle_ExistingInputRegister_DeletesAndReturnsTrue()
        {
            // Arrange
            var inputRegisterId = 1;
            var command = new DeleteInputRegisterCommand(inputRegisterId);

            _mockRepository.Setup(r => r.ExistsAsync(inputRegisterId))
                .ReturnsAsync(true);

            _mockRepository.Setup(r => r.DeleteAsync(inputRegisterId))
                .Returns(Task.CompletedTask);

            _mockRepository.Setup(r => r.ResetIdentitySeedAsync())
                .Returns(Task.CompletedTask);

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.True(result);
            
            // Verify repository methods were called
            _mockRepository.Verify(r => r.ExistsAsync(inputRegisterId), Times.Once);
            _mockRepository.Verify(r => r.DeleteAsync(inputRegisterId), Times.Once);
            _mockRepository.Verify(r => r.ResetIdentitySeedAsync(), Times.Once);
        }

        [Fact]
        public async Task Handle_NonExistingInputRegister_ReturnsFalse()
        {
            // Arrange
            var inputRegisterId = 999;
            var command = new DeleteInputRegisterCommand(inputRegisterId);

            _mockRepository.Setup(r => r.ExistsAsync(inputRegisterId))
                .ReturnsAsync(false);

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.False(result);
            
            // Verify repository methods were called correctly
            _mockRepository.Verify(r => r.ExistsAsync(inputRegisterId), Times.Once);
            _mockRepository.Verify(r => r.DeleteAsync(It.IsAny<int>()), Times.Never);
            _mockRepository.Verify(r => r.ResetIdentitySeedAsync(), Times.Never);
        }

        [Fact]
        public async Task Handle_RepositoryThrowsException_PropagatesException()
        {
            // Arrange
            var inputRegisterId = 1;
            var command = new DeleteInputRegisterCommand(inputRegisterId);
            var expectedException = new Exception("Database error");

            _mockRepository.Setup(r => r.ExistsAsync(inputRegisterId))
                .ReturnsAsync(true);

            _mockRepository.Setup(r => r.DeleteAsync(inputRegisterId))
                .ThrowsAsync(expectedException);

            // Act & Assert
            var exception = await Assert.ThrowsAsync<Exception>(() => 
                _handler.Handle(command, CancellationToken.None));
            
            Assert.Same(expectedException, exception);
            
            // Verify repository methods were called
            _mockRepository.Verify(r => r.ExistsAsync(inputRegisterId), Times.Once);
            _mockRepository.Verify(r => r.DeleteAsync(inputRegisterId), Times.Once);
            _mockRepository.Verify(r => r.ResetIdentitySeedAsync(), Times.Never);
        }

        [Fact]
        public async Task Handle_ResetIdentitySeedThrowsException_PropagatesException()
        {
            // Arrange
            var inputRegisterId = 1;
            var command = new DeleteInputRegisterCommand(inputRegisterId);
            var expectedException = new Exception("Database error");

            _mockRepository.Setup(r => r.ExistsAsync(inputRegisterId))
                .ReturnsAsync(true);

            _mockRepository.Setup(r => r.DeleteAsync(inputRegisterId))
                .Returns(Task.CompletedTask);

            _mockRepository.Setup(r => r.ResetIdentitySeedAsync())
                .ThrowsAsync(expectedException);

            // Act & Assert
            var exception = await Assert.ThrowsAsync<Exception>(() => 
                _handler.Handle(command, CancellationToken.None));
            
            Assert.Same(expectedException, exception);
            
            // Verify repository methods were called
            _mockRepository.Verify(r => r.ExistsAsync(inputRegisterId), Times.Once);
            _mockRepository.Verify(r => r.DeleteAsync(inputRegisterId), Times.Once);
            _mockRepository.Verify(r => r.ResetIdentitySeedAsync(), Times.Once);
        }
    }
}
