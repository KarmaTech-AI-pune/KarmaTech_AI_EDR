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
    public class GetOpportunityTrackingsByRegionalManagerQueryHandlerTests
    {
        private readonly Mock<IOpportunityTrackingRepository> _repositoryMock;
        private readonly GetOpportunityTrackingsByRegionalManagerQueryHandler _handler;

        public GetOpportunityTrackingsByRegionalManagerQueryHandlerTests()
        {
            _repositoryMock = new Mock<IOpportunityTrackingRepository>();
            _handler = new GetOpportunityTrackingsByRegionalManagerQueryHandler(_repositoryMock.Object);
        }

        [Fact]
        public async Task Handle_ReturnsOpportunitiesForRegionalManager()
        {
            // Arrange
            var rmId = "rm-1";
            var query = new GetOpportunityTrackingsByRegionalManagerQuery(rmId);
            var expectedOpportunities = new List<Domain.Entities.OpportunityTracking>
            {
                new Domain.Entities.OpportunityTracking { Id = 1, ReviewManagerId = rmId },
                new Domain.Entities.OpportunityTracking { Id = 2, ReviewManagerId = rmId }
            };

            _repositoryMock.Setup(repo => repo.GetByRegionalManagerIdAsync(rmId))
                .ReturnsAsync(expectedOpportunities);

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Count());
            Assert.All(result, dto => Assert.Equal(rmId, dto.ReviewManagerId));
            _repositoryMock.Verify(repo => repo.GetByRegionalManagerIdAsync(rmId), Times.Once);
        }
    }
}
