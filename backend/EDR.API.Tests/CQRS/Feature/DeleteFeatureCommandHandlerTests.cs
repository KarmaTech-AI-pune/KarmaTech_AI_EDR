using Moq;
using Microsoft.Extensions.Logging;
using EDR.Application.CQRS.Feature.Commands;
using EDR.Application.CQRS.Feature.Handlers;
using EDR.Domain.Entities;
using EDR.Repositories.Interfaces;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace EDR.API.Tests.Handlers
{
    public class DeleteFeatureCommandHandlerTests
    {
        private readonly Mock<IFeatureRepository> _featureRepositoryMock;
        private readonly Mock<ILogger<DeleteFeatureCommandHandler>> _loggerMock;
        private readonly DeleteFeatureCommandHandler _handler;

        public DeleteFeatureCommandHandlerTests()
        {
            _featureRepositoryMock = new Mock<IFeatureRepository>();
            _loggerMock = new Mock<ILogger<DeleteFeatureCommandHandler>>();
            _handler = new DeleteFeatureCommandHandler(_featureRepositoryMock.Object, _loggerMock.Object);
        }

        [Fact]
        public async Task Handle_ExistingFeature_DeletesFeature()
        {
            // Arrange
            var featureId = 1;
            var command = new DeleteFeatureCommand(featureId);

            var existingFeature = new Feature { Id = featureId, Name = "Test Feature" };

            _featureRepositoryMock.Setup(repo => repo.GetFeatureByIdAsync(featureId))
                .ReturnsAsync(existingFeature);

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            _featureRepositoryMock.Verify(repo => repo.GetFeatureByIdAsync(featureId), Times.Once);
            _featureRepositoryMock.Verify(repo => repo.DeleteFeatureAsync(featureId), Times.Once);
            Assert.True(result);
        }

        [Fact]
        public async Task Handle_NonExistingFeature_ReturnsFalse()
        {
            // Arrange
            var featureId = 999;
            var command = new DeleteFeatureCommand(featureId);

            _featureRepositoryMock.Setup(repo => repo.GetFeatureByIdAsync(featureId))
                .ReturnsAsync((Feature)null!);

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            _featureRepositoryMock.Verify(repo => repo.GetFeatureByIdAsync(featureId), Times.Once);
            _featureRepositoryMock.Verify(repo => repo.DeleteFeatureAsync(It.IsAny<int>()), Times.Never);
            Assert.False(result);
        }
    }
}
