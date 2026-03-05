using Moq;
using EDR.Application.CQRS.OpportunityTracking.Commands;
using EDR.Application.CQRS.OpportunityTracking.Handlers;
using EDR.Application.Dtos;
using EDR.Application.Services.IContract;
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
    public class CreateOpportunityTrackingCommandHandlerTests
    {
        private readonly Mock<IOpportunityTrackingRepository> _repositoryMock;
        private readonly Mock<ISettingsRepository> _settingsRepositoryMock;
        private readonly Mock<IUserContext> _userContextMock;
        private readonly CreateOpportunityTrackingCommandHandler _handler;

        public CreateOpportunityTrackingCommandHandlerTests()
        {
            _repositoryMock = new Mock<IOpportunityTrackingRepository>();
            _settingsRepositoryMock = new Mock<ISettingsRepository>();
            _userContextMock = new Mock<IUserContext>();
            _handler = new CreateOpportunityTrackingCommandHandler(
                _repositoryMock.Object, 
                _settingsRepositoryMock.Object, 
                _userContextMock.Object);
        }

        [Fact]
        public async Task Handle_WithValidCommand_CreatesOpportunityAndReturnsDto()
        {
            // Arrange
            var command = new CreateOpportunityTrackingCommand
            {
                WorkName = "New Opportunity",
                Notes = "Description",
                Client = "Client",
                Status = OpportunityTrackingStatus.BID_UNDER_PREPERATION,
                Stage = OpportunityStage.A,
                BidManagerId = "user1",
                ClientSector = "Energy",
                StrategicRanking = "High",
                Operation = "Op",
                Currency = "USD",
                LikelyStartDate = DateTime.Now
            };

            _userContextMock.Setup(u => u.GetCurrentUserId()).Returns("user-id");
            _settingsRepositoryMock.Setup(s => s.GetNextBidNumberAsync()).ReturnsAsync(1);

            EDR.Domain.Entities.OpportunityTracking capturedEntity = null;
            _repositoryMock.Setup(r => r.AddAsync(It.IsAny<EDR.Domain.Entities.OpportunityTracking>()))
                .Callback<EDR.Domain.Entities.OpportunityTracking>(e => capturedEntity = e)
                .ReturnsAsync((EDR.Domain.Entities.OpportunityTracking e) => { e.Id = 1; return e; });

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(1, result.Id);
            Assert.Equal("0000001", result.BidNumber);
            
            _repositoryMock.Verify(r => r.AddAsync(It.IsAny<EDR.Domain.Entities.OpportunityTracking>()), Times.Once);
            
            Assert.NotNull(capturedEntity);
            Assert.Equal(command.WorkName, capturedEntity.WorkName);
            Assert.Equal(command.Notes, capturedEntity.Notes);
            Assert.Equal(command.Client, capturedEntity.Client);
            Assert.Equal(command.Status, capturedEntity.Status);
            Assert.Equal(command.Stage, capturedEntity.Stage);
            Assert.Equal(command.BidManagerId, capturedEntity.BidManagerId);
        }
    }
}
