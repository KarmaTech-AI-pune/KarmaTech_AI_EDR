using Moq;
using Microsoft.Extensions.Logging;
using EDR.Application.CQRS.Feature.Commands;
using EDR.Application.CQRS.Feature.Handlers;
using EDR.Application.DTOs;
using EDR.Domain.Entities;
using EDR.Repositories.Interfaces;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace EDR.API.Tests.Handlers
{
    public class UpdateFeatureCommandHandlerTests
    {
        private readonly Mock<IFeatureRepository> _featureRepositoryMock;
        private readonly Mock<ILogger<UpdateFeatureCommandHandler>> _loggerMock;
        private readonly UpdateFeatureCommandHandler _handler;

        public UpdateFeatureCommandHandlerTests()
        {
            _featureRepositoryMock = new Mock<IFeatureRepository>();
            _loggerMock = new Mock<ILogger<UpdateFeatureCommandHandler>>();
            _handler = new UpdateFeatureCommandHandler(_featureRepositoryMock.Object, _loggerMock.Object);
        }

        [Fact]
        public async Task Handle_ExistingFeature_UpdatesFeatureAndReturnsDto()
        {
            // Arrange
            var featureId = 1;
            var command = new UpdateFeatureCommand 
            { 
                Id = featureId,
                Name = "Updated Feature",
                Description = "Updated description",
                IsActive = false
            };

            var existingFeature = new Feature 
            { 
                Id = featureId, 
                Name = "Old Name", 
                Description = "Old Desc", 
                IsActive = true 
            };

            _featureRepositoryMock.Setup(repo => repo.GetFeatureByIdAsync(featureId))
                .ReturnsAsync(existingFeature);

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            _featureRepositoryMock.Verify(repo => repo.GetFeatureByIdAsync(featureId), Times.Once);
            _featureRepositoryMock.Verify(repo => repo.UpdateFeatureAsync(existingFeature), Times.Once);

            Assert.NotNull(result);
            Assert.Equal(featureId, result.Id);
            Assert.Equal(command.Name, result.Name);
            Assert.Equal(command.Description, result.Description);
            Assert.False(result.IsActive);
        }

        [Fact]
        public async Task Handle_NonExistingFeature_ReturnsNull()
        {
            // Arrange
            var featureId = 999;
            var command = new UpdateFeatureCommand { Id = featureId };

            _featureRepositoryMock.Setup(repo => repo.GetFeatureByIdAsync(featureId))
                .ReturnsAsync((Feature)null!);

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            _featureRepositoryMock.Verify(repo => repo.UpdateFeatureAsync(It.IsAny<Feature>()), Times.Never);
            Assert.Null(result);
        }
    }
}
