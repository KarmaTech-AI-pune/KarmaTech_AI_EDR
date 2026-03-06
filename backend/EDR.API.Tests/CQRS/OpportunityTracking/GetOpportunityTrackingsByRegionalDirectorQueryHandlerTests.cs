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
    public class GetOpportunityTrackingsByRegionalDirectorQueryHandlerTests
    {
        private readonly Mock<IOpportunityTrackingRepository> _repositoryMock;
        private readonly GetOpportunityTrackingsByRegionalDirectorQueryHandler _handler;

        public GetOpportunityTrackingsByRegionalDirectorQueryHandlerTests()
        {
            _repositoryMock = new Mock<IOpportunityTrackingRepository>();
            _handler = new GetOpportunityTrackingsByRegionalDirectorQueryHandler(_repositoryMock.Object);
        }

        [Fact]
        public async Task Handle_ReturnsOpportunitiesForRegionalDirector()
        {
            // Arrange
            var dirId = "rd-1";
            var query = new GetOpportunityTrackingsByRegionalDirectorQuery(dirId);
            var expectedOpportunities = new List<Domain.Entities.OpportunityTracking>
            {
                new Domain.Entities.OpportunityTracking { Id = 1, ApprovalManagerId = dirId },
                new Domain.Entities.OpportunityTracking { Id = 2, ApprovalManagerId = dirId }
            };

            _repositoryMock.Setup(repo => repo.GetByRegionalDirectorIdAsync(dirId))
                .ReturnsAsync(expectedOpportunities);

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Count());
            _repositoryMock.Verify(repo => repo.GetByRegionalDirectorIdAsync(dirId), Times.Once);
        }
    }
}
