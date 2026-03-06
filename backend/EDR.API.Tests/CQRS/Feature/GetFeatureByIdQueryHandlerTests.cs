using Moq;
using Microsoft.Extensions.Logging;
using EDR.Application.CQRS.Feature.Handlers;
using EDR.Application.CQRS.Feature.Queries;
using EDR.Application.DTOs;
using EDR.Domain.Entities;
using EDR.Repositories.Interfaces;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace EDR.API.Tests.Handlers
{
    public class GetFeatureByIdQueryHandlerTests
    {
        private readonly Mock<IFeatureRepository> _featureRepositoryMock;
        private readonly Mock<ILogger<GetFeatureByIdQueryHandler>> _loggerMock;
        private readonly GetFeatureByIdQueryHandler _handler;

        public GetFeatureByIdQueryHandlerTests()
        {
            _featureRepositoryMock = new Mock<IFeatureRepository>();
            _loggerMock = new Mock<ILogger<GetFeatureByIdQueryHandler>>();
            _handler = new GetFeatureByIdQueryHandler(_featureRepositoryMock.Object, _loggerMock.Object);
        }

        [Fact]
        public async Task Handle_ExistingFeature_ReturnsFeatureDto()
        {
            // Arrange
            var featureId = 1;
            var query = new GetFeatureByIdQuery(featureId);

            var feature = new Feature 
            { 
                Id = featureId, 
                Name = "Feature 1", 
                Description = "Description 1", 
                IsActive = true 
            };

            _featureRepositoryMock.Setup(repo => repo.GetFeatureByIdAsync(featureId))
                .ReturnsAsync(feature);

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            _featureRepositoryMock.Verify(repo => repo.GetFeatureByIdAsync(featureId), Times.Once);

            Assert.NotNull(result);
            Assert.Equal(featureId, result.Id);
            Assert.Equal("Feature 1", result.Name);
            Assert.Equal("Description 1", result.Description);
            Assert.True(result.IsActive);
        }

        [Fact]
        public async Task Handle_NonExistingFeature_ReturnsNull()
        {
            // Arrange
            var featureId = 999;
            var query = new GetFeatureByIdQuery(featureId);

            _featureRepositoryMock.Setup(repo => repo.GetFeatureByIdAsync(featureId))
                .ReturnsAsync((Feature)null!);

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.Null(result);
        }
    }
}
