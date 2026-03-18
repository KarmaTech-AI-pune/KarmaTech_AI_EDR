using Moq;
using EDR.Application.CQRS.OpportunityTracking.Queries;
using EDR.Application.CQRS.OpportunityTracking.Handlers;
using EDR.Domain.Entities;
using EDR.Repositories.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace EDR.API.Tests.CQRS.OpportunityTracking
{
    public class GetOpportunityTrackingsByBidManagerQueryHandlerTests
    {
        private readonly Mock<IOpportunityTrackingRepository> _repositoryMock;
        private readonly GetOpportunityTrackingsByBidManagerQueryHandler _handler;

        public GetOpportunityTrackingsByBidManagerQueryHandlerTests()
        {
            _repositoryMock = new Mock<IOpportunityTrackingRepository>();
            _handler = new GetOpportunityTrackingsByBidManagerQueryHandler(_repositoryMock.Object);
        }

        [Fact]
        public async Task Handle_ReturnsOpportunitiesForBidManager()
        {
            // Arrange
            var bidManagerId = "bid-mgr-1";
            var query = new GetOpportunityTrackingsByBidManagerQuery(bidManagerId);
            var expectedOpportunities = new List<Domain.Entities.OpportunityTracking>
            {
                new Domain.Entities.OpportunityTracking { Id = 1, BidManagerId = bidManagerId },
                new Domain.Entities.OpportunityTracking { Id = 2, BidManagerId = bidManagerId }
            };

            _repositoryMock.Setup(repo => repo.GetByBidManagerIdAsync(bidManagerId))
                .ReturnsAsync(expectedOpportunities);

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Count());
            Assert.All(result, dto => Assert.Equal(bidManagerId, dto.BidManagerId));
            _repositoryMock.Verify(repo => repo.GetByBidManagerIdAsync(bidManagerId), Times.Once);
        }
    }
}
