using Moq;
using Microsoft.Extensions.Logging;
using EDR.Application.CQRS.Feature.Handlers;
using EDR.Application.CQRS.Feature.Queries;
using EDR.Domain.Entities;
using EDR.Repositories.Interfaces;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace EDR.API.Tests.Handlers
{
    public class GetAllFeaturesQueryHandlerTests
    {
        private readonly Mock<IFeatureRepository> _featureRepositoryMock;
        private readonly Mock<ILogger<GetAllFeaturesQueryHandler>> _loggerMock;
        private readonly GetAllFeaturesQueryHandler _handler;

        public GetAllFeaturesQueryHandlerTests()
        {
            _featureRepositoryMock = new Mock<IFeatureRepository>();
            _loggerMock = new Mock<ILogger<GetAllFeaturesQueryHandler>>();
            _handler = new GetAllFeaturesQueryHandler(_featureRepositoryMock.Object, _loggerMock.Object);
        }

        [Fact]
        public async Task Handle_FeaturesExist_ReturnsFeatureDtos()
        {
            // Arrange
            var query = new GetAllFeaturesQuery();

            var features = new List<Feature>
            {
                new Feature { Id = 1, Name = "Feature 1", Description = "Desc 1", IsActive = true },
                new Feature { Id = 2, Name = "Feature 2", Description = "Desc 2", IsActive = false }
            };

            _featureRepositoryMock.Setup(repo => repo.GetAllFeaturesAsync())
                .ReturnsAsync(features);

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            _featureRepositoryMock.Verify(repo => repo.GetAllFeaturesAsync(), Times.Once);

            Assert.NotNull(result);
            Assert.Equal(2, result.Count);

            Assert.Equal(1, result[0].Id);
            Assert.Equal("Feature 1", result[0].Name);
            Assert.True(result[0].IsActive);

            Assert.Equal(2, result[1].Id);
            Assert.False(result[1].IsActive);
        }

        [Fact]
        public async Task Handle_NoFeatures_ReturnsEmptyList()
        {
            // Arrange
            var query = new GetAllFeaturesQuery();

            _featureRepositoryMock.Setup(repo => repo.GetAllFeaturesAsync())
                .ReturnsAsync((List<Feature>)null!);

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Empty(result);
        }
    }
}
