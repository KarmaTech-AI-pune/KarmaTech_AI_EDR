using Moq;
using EDR.Application.CQRS.OpportunityTracking.Handlers;
using EDR.Application.CQRS.OpportunityTracking.Queries;
using EDR.Application.Dtos;
using EDR.Domain.Entities;
using EDR.Domain.Enums;
using EDR.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace EDR.API.Tests.CQRS.OpportunityTracking
{
    public class GetAllOpportunityTrackingsQueryHandlerTests
    {
        private readonly Mock<IOpportunityTrackingRepository> _repositoryMock;
        private readonly GetAllOpportunityTrackingsQueryHandler _handler;

        public GetAllOpportunityTrackingsQueryHandlerTests()
        {
            _repositoryMock = new Mock<IOpportunityTrackingRepository>();
            _handler = new GetAllOpportunityTrackingsQueryHandler(_repositoryMock.Object);
        }

        [Fact]
        public async Task Handle_ReturnsAllEntitiesMappedToDtos()
        {
            // Arrange
            var entity1 = new EDR.Domain.Entities.OpportunityTracking { Id = 1, Stage = OpportunityStage.A, ClientSector = "IT", Status = OpportunityTrackingStatus.BID_UNDER_PREPERATION, OpportunityHistories = new List<OpportunityHistory>() };
            var entity2 = new EDR.Domain.Entities.OpportunityTracking { Id = 2, Stage = OpportunityStage.B, ClientSector = "Finance", Status = OpportunityTrackingStatus.BID_SUBMITTED, OpportunityHistories = new List<OpportunityHistory>() };

            _repositoryMock.Setup(x => x.GetAllAsync())
                .ReturnsAsync(new List<EDR.Domain.Entities.OpportunityTracking> { entity1, entity2 });

            var query = new GetAllOpportunityTrackingsQuery();

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            var resultList = result.ToList();
            Assert.Equal(2, resultList.Count);
            Assert.Contains(resultList, dto => dto.Id == 1 && dto.Stage == OpportunityStage.A && dto.ClientSector == "IT");
            Assert.Contains(resultList, dto => dto.Id == 2 && dto.Stage == OpportunityStage.B && dto.ClientSector == "Finance");
        }

        [Fact]
        public async Task Handle_WithFilters_ReturnsFilteredEntities()
        {
            // Arrange
            var entity1 = new EDR.Domain.Entities.OpportunityTracking { Id = 1, Stage = OpportunityStage.A, ClientSector = "IT", Status = OpportunityTrackingStatus.BID_UNDER_PREPERATION, OpportunityHistories = new List<OpportunityHistory>() };
            var entity2 = new EDR.Domain.Entities.OpportunityTracking { Id = 2, Stage = OpportunityStage.B, ClientSector = "Finance", Status = OpportunityTrackingStatus.BID_SUBMITTED, OpportunityHistories = new List<OpportunityHistory>() };

            _repositoryMock.Setup(x => x.GetAllAsync())
                .ReturnsAsync(new List<EDR.Domain.Entities.OpportunityTracking> { entity1, entity2 });

            var query = new GetAllOpportunityTrackingsQuery { Status = OpportunityTrackingStatus.BID_UNDER_PREPERATION, ClientSector = "IT" };

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            var resultList = result.ToList();
            Assert.Single(resultList);
            Assert.Equal(1, resultList.First().Id);
        }
    }
}
