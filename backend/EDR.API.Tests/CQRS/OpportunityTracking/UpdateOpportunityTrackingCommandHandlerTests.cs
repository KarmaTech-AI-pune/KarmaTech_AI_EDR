using Moq;
using EDR.Application.CQRS.OpportunityTracking.Commands;
using EDR.Application.CQRS.OpportunityTracking.Handlers;
using EDR.Application.Dtos;
using EDR.Domain.Entities;
using EDR.Domain.Enums;
using EDR.Repositories.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace EDR.API.Tests.CQRS.OpportunityTracking
{
    public class UpdateOpportunityTrackingCommandHandlerTests
    {
        private readonly Mock<IOpportunityTrackingRepository> _repositoryMock;
        private readonly UpdateOpportunityTrackingCommandHandler _handler;

        public UpdateOpportunityTrackingCommandHandlerTests()
        {
            _repositoryMock = new Mock<IOpportunityTrackingRepository>();
            _handler = new UpdateOpportunityTrackingCommandHandler(_repositoryMock.Object);
        }

        [Fact]
        public async Task Handle_WithValidCommand_ReturnsOpportunityTrackingDto()
        {
            // Arrange
            var existingEntity = new EDR.Domain.Entities.OpportunityTracking
            {
                Id = 1,
                Stage = OpportunityStage.A,
                WorkName = "Old Work"
            };

            _repositoryMock.Setup(x => x.GetByIdAsync(1))
                .ReturnsAsync(existingEntity);

            _repositoryMock.Setup(x => x.UpdateAsync(It.IsAny<EDR.Domain.Entities.OpportunityTracking>()))
                .ReturnsAsync(existingEntity);

            var command = new UpdateOpportunityTrackingCommand
            {
                Id = 1,
                Stage = OpportunityStage.B,
                WorkName = "New Work",
                Client = "Test Client",
                ClientSector = "IT",
                Status = OpportunityTrackingStatus.BID_UNDER_PREPERATION
            };

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(1, result.Id);
            Assert.Equal(OpportunityStage.B, result.Stage);
            Assert.Equal("New Work", result.WorkName);
            Assert.Equal("Test Client", result.Client);
            _repositoryMock.Verify(x => x.UpdateAsync(It.IsAny<EDR.Domain.Entities.OpportunityTracking>()), Times.Once);
        }

        [Fact]
        public async Task Handle_WithInvalidId_ThrowsException()
        {
            // Arrange
            _repositoryMock.Setup(x => x.GetByIdAsync(99))
                .ReturnsAsync((EDR.Domain.Entities.OpportunityTracking)null);

            var command = new UpdateOpportunityTrackingCommand { Id = 99 };

            // Act & Assert
            var exception = await Assert.ThrowsAsync<Exception>(() => _handler.Handle(command, CancellationToken.None));
            Assert.Equal("Opportunity Tracking with ID 99 not found.", exception.Message);
        }
    }
}
