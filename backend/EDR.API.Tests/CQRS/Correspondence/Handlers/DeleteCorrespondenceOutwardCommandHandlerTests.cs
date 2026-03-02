using Moq;
using EDR.Application.CQRS.Correspondence.Commands;
using EDR.Application.CQRS.Correspondence.Handlers;
using EDR.Repositories.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace EDR.API.Tests.CQRS.Correspondence.Handlers
{
    public class DeleteCorrespondenceOutwardCommandHandlerTests
    {
        private readonly Mock<ICorrespondenceOutwardRepository> _mockRepository;
        private readonly DeleteCorrespondenceOutwardCommandHandler _handler;

        public DeleteCorrespondenceOutwardCommandHandlerTests()
        {
            _mockRepository = new Mock<ICorrespondenceOutwardRepository>();
            _handler = new DeleteCorrespondenceOutwardCommandHandler(_mockRepository.Object);
        }

        [Fact]
        public async Task Handle_ExistingCorrespondenceOutward_ReturnsTrue()
        {
            // Arrange
            var command = new DeleteCorrespondenceOutwardCommand { Id = 1 };
            
            _mockRepository.Setup(r => r.ExistsAsync(command.Id))
                .ReturnsAsync(true);
            
            _mockRepository.Setup(r => r.DeleteAsync(command.Id))
                .Returns(Task.CompletedTask);

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.True(result);
            _mockRepository.Verify(r => r.ExistsAsync(command.Id), Times.Once);
            _mockRepository.Verify(r => r.DeleteAsync(command.Id), Times.Once);
        }

        [Fact]
        public async Task Handle_NonExistingCorrespondenceOutward_ReturnsFalse()
        {
            // Arrange
            var command = new DeleteCorrespondenceOutwardCommand { Id = 999 }; // Non-existent ID
            
            _mockRepository.Setup(r => r.ExistsAsync(command.Id))
                .ReturnsAsync(false);

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.False(result);
            _mockRepository.Verify(r => r.ExistsAsync(command.Id), Times.Once);
            _mockRepository.Verify(r => r.DeleteAsync(It.IsAny<int>()), Times.Never);
        }

        [Fact]
        public async Task Handle_RepositoryThrowsException_ThrowsException()
        {
            // Arrange
            var command = new DeleteCorrespondenceOutwardCommand { Id = 1 };
            
            var expectedException = new Exception("Database error");
            _mockRepository.Setup(r => r.ExistsAsync(command.Id))
                .ThrowsAsync(expectedException);

            // Act & Assert
            var exception = await Assert.ThrowsAsync<Exception>(() => 
                _handler.Handle(command, CancellationToken.None));
            Assert.Same(expectedException, exception);
        }
    }
}

