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
    public class CreateFeatureCommandHandlerTests
    {
        private readonly Mock<IFeatureRepository> _featureRepositoryMock;
        private readonly Mock<ILogger<CreateFeatureCommandHandler>> _loggerMock;
        private readonly CreateFeatureCommandHandler _handler;

        public CreateFeatureCommandHandlerTests()
        {
            _featureRepositoryMock = new Mock<IFeatureRepository>();
            _loggerMock = new Mock<ILogger<CreateFeatureCommandHandler>>();
            _handler = new CreateFeatureCommandHandler(_featureRepositoryMock.Object, _loggerMock.Object);
        }

        [Fact]
        public async Task Handle_ValidRequest_CreatesFeatureAndReturnsDto()
        {
            // Arrange
            var command = new CreateFeatureCommand 
            { 
                Name = "New Feature",
                Description = "A new test feature",
                IsActive = true
            };

            _featureRepositoryMock.Setup(repo => repo.AddFeatureAsync(It.IsAny<Feature>()))
                .Callback<Feature>(f => f.Id = 5);

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            _featureRepositoryMock.Verify(repo => repo.AddFeatureAsync(It.IsAny<Feature>()), Times.Once);

            Assert.NotNull(result);
            Assert.Equal(5, result.Id);
            Assert.Equal(command.Name, result.Name);
            Assert.Equal(command.Description, result.Description);
            Assert.True(result.IsActive);
        }
    }
}
