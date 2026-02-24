using Moq;
using EDR.Application.CQRS.OpportunityTracking.Handlers;
using EDR.Application.CQRS.OpportunityTracking.Queries;
using EDR.Application.Dtos;
using EDR.Domain.Entities;
using EDR.Domain.Enums;
using EDR.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace EDR.API.Tests.CQRS.OpportunityTracking
{
    public class GetOpportunityTrackingByIdQueryHandlerTests
    {
        private readonly Mock<IOpportunityTrackingRepository> _repositoryMock;
        private readonly GetOpportunityTrackingByIdQueryHandler _handler;

        public GetOpportunityTrackingByIdQueryHandlerTests()
        {
            _repositoryMock = new Mock<IOpportunityTrackingRepository>();
            _handler = new GetOpportunityTrackingByIdQueryHandler(_repositoryMock.Object);
        }

        [Fact]
        public async Task Handle_WithValidId_ReturnsOpportunityTrackingDto()
        {
            // Arrange
            var opportunityId = 1;
            var opportunity = new EDR.Domain.Entities.OpportunityTracking
            {
                Id = opportunityId,
                WorkName = "Test Opportunity",
                Notes = "Test Description",
                Client = "Test Client",
                Status = OpportunityTrackingStatus.BID_UNDER_PREPERATION,
                Stage = OpportunityStage.A,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now,
                BidManagerId = "user1",
                ClientSector = "Energy",
                StrategicRanking = "High",
                Operation = "Op",
                Currency = "USD",
                LikelyStartDate = DateTime.Now,
                OpportunityHistories = new List<OpportunityHistory>()
            };

            _repositoryMock.Setup(r => r.GetByIdAsync(opportunityId))
                .ReturnsAsync(opportunity);

            var query = new GetOpportunityTrackingByIdQuery(opportunityId);

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(opportunityId, result.Id);
            Assert.Equal(opportunity.WorkName, result.WorkName);
            Assert.Equal(opportunity.Notes, result.Notes);
            Assert.Equal(opportunity.Client, result.Client);
        }

        [Fact]
        public async Task Handle_WithInvalidId_ThrowsException()
        {
            // Arrange
            var opportunityId = 999;

            _repositoryMock.Setup(r => r.GetByIdAsync(opportunityId))
                .ReturnsAsync((EDR.Domain.Entities.OpportunityTracking)null);

            var query = new GetOpportunityTrackingByIdQuery(opportunityId);

            // Act & Assert
            await Assert.ThrowsAsync<Exception>(() => _handler.Handle(query, CancellationToken.None));
        }
    }
}
