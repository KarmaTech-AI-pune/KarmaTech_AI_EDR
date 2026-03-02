using Moq;
using EDR.Application.CQRS.OpportunityTracking.Commands;
using EDR.Application.CQRS.OpportunityTracking.Handlers;
using EDR.Repositories.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace EDR.API.Tests.CQRS.OpportunityTracking
{
    public class DeleteOpportunityTrackingCommandHandlerTests
    {
        private readonly Mock<IOpportunityTrackingRepository> _repositoryMock;
        private readonly DeleteOpportunityTrackingCommandHandler _handler;

        public DeleteOpportunityTrackingCommandHandlerTests()
        {
            _repositoryMock = new Mock<IOpportunityTrackingRepository>();
            _handler = new DeleteOpportunityTrackingCommandHandler(_repositoryMock.Object);
        }

        [Fact]
        public async Task Handle_WithValidId_ReturnsTrue()
        {
            // Arrange
            var entity = new EDR.Domain.Entities.OpportunityTracking { Id = 1 };
            _repositoryMock.Setup(x => x.GetByIdAsync(1)).ReturnsAsync(entity);
            _repositoryMock.Setup(x => x.DeleteAsync(1)).Returns(Task.CompletedTask);

            var command = new DeleteOpportunityTrackingCommand(1);

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.True(result);
            _repositoryMock.Verify(x => x.DeleteAsync(1), Times.Once);
        }

        [Fact]
        public async Task Handle_WithInvalidId_ThrowsException()
        {
            // Arrange
            _repositoryMock.Setup(x => x.GetByIdAsync(99)).ReturnsAsync((EDR.Domain.Entities.OpportunityTracking)null);

            var command = new DeleteOpportunityTrackingCommand(99);

            // Act & Assert
            var exception = await Assert.ThrowsAsync<Exception>(() => _handler.Handle(command, CancellationToken.None));
            Assert.Equal("Opportunity Tracking with ID 99 not found.", exception.Message);
        }
    }
}
