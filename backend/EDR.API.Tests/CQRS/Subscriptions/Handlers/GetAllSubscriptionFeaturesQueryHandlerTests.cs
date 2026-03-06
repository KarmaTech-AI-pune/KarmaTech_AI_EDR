using System;
using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;
using Moq;
using Xunit;
using Microsoft.Extensions.Logging;
using EDR.Application.CQRS.Subscriptions.Queries;
using EDR.Application.CQRS.Subscriptions.Handlers;
using EDR.Application.DTOs;
using EDR.Application.Services.IContract;

namespace EDR.API.Tests.CQRS.Subscriptions.Handlers
{
    public class GetAllSubscriptionFeaturesQueryHandlerTests
    {
        private readonly Mock<ISubscriptionService> _mockSubscriptionService;
        private readonly Mock<ILogger<GetAllSubscriptionFeaturesQueryHandler>> _mockLogger;
        private readonly GetAllSubscriptionFeaturesQueryHandler _handler;

        public GetAllSubscriptionFeaturesQueryHandlerTests()
        {
            _mockSubscriptionService = new Mock<ISubscriptionService>();
            _mockLogger = new Mock<ILogger<GetAllSubscriptionFeaturesQueryHandler>>();
            _handler = new GetAllSubscriptionFeaturesQueryHandler(_mockSubscriptionService.Object, _mockLogger.Object);
        }

        [Fact]
        public async Task Handle_ReturnsSubscriptionFeaturesResponseDto()
        {
            // Arrange
            var request = new GetAllSubscriptionFeaturesQuery();
            var responseDto = new SubscriptionFeaturesResponseDto
            {
                Plans = new List<SubscriptionPlanWithDetailsDto>
                {
                    new SubscriptionPlanWithDetailsDto { Id = "1", Name = "Basic" },
                    new SubscriptionPlanWithDetailsDto { Id = "2", Name = "Premium" }
                }
            };

            _mockSubscriptionService.Setup(s => s.GetAllSubscriptionFeaturesAsync()).ReturnsAsync(responseDto);

            // Act
            var result = await _handler.Handle(request, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Plans.Count);
            _mockSubscriptionService.Verify(s => s.GetAllSubscriptionFeaturesAsync(), Times.Once);
        }

        [Fact]
        public async Task Handle_ServiceThrowsException_ThrowsException()
        {
            // Arrange
            var request = new GetAllSubscriptionFeaturesQuery();
            _mockSubscriptionService.Setup(s => s.GetAllSubscriptionFeaturesAsync()).ThrowsAsync(new Exception("Service Error"));

            // Act & Assert
            var ex = await Assert.ThrowsAsync<Exception>(() => _handler.Handle(request, CancellationToken.None));
            Assert.Equal("Service Error", ex.Message);
        }
    }
}
