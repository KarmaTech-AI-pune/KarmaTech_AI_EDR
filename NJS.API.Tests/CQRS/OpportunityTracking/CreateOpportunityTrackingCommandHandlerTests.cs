using Microsoft.EntityFrameworkCore;
using Moq;
using NJS.Application.CQRS.OpportunityTracking.Commands;
using NJS.Application.CQRS.OpportunityTracking.Handlers;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using NJS.Domain.Enums;
using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace NJS.API.Tests.CQRS.OpportunityTracking
{
    public class CreateOpportunityTrackingCommandHandlerTests
    {
        private readonly Mock<ProjectManagementContext> _contextMock;
        private readonly CreateOpportunityTrackingCommandHandler _handler;

        public CreateOpportunityTrackingCommandHandlerTests()
        {
            _contextMock = new Mock<ProjectManagementContext>(new DbContextOptions<ProjectManagementContext>());
            _handler = new CreateOpportunityTrackingCommandHandler(_contextMock.Object);
        }

        [Fact]
        public async Task Handle_WithValidCommand_CreatesOpportunityAndReturnsId()
        {
            // Arrange
            var command = new CreateOpportunityTrackingCommand
            {
                Title = "New Opportunity",
                Description = "Description",
                ClientName = "Client",
                Status = OpportunityTrackingStatus.Active,
                Stage = OpportunityStage.Identification,
                BidManagerId = "user1",
                ClientSector = "Energy"
            };

            // Capture the entity being added
            OpportunityTrackingEntity capturedEntity = null;
            _contextMock.Setup(c => c.OpportunityTrackings.Add(It.IsAny<OpportunityTrackingEntity>()))
                .Callback<OpportunityTrackingEntity>(e => capturedEntity = e);

            _contextMock.Setup(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(1)
                .Callback(() => capturedEntity.Id = 1); // Simulate auto-increment ID

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.Equal(1, result);
            
            // Verify entity was added with correct properties
            _contextMock.Verify(c => c.OpportunityTrackings.Add(It.IsAny<OpportunityTrackingEntity>()), Times.Once);
            _contextMock.Verify(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
            
            Assert.NotNull(capturedEntity);
            Assert.Equal(command.Title, capturedEntity.Title);
            Assert.Equal(command.Description, capturedEntity.Description);
            Assert.Equal(command.ClientName, capturedEntity.ClientName);
            Assert.Equal(command.Status, capturedEntity.Status);
            Assert.Equal(command.Stage, capturedEntity.Stage);
            Assert.Equal(command.BidManagerId, capturedEntity.BidManagerId);
            Assert.Equal(command.ClientSector, capturedEntity.ClientSector);
            Assert.NotEqual(default, capturedEntity.CreatedAt);
            Assert.NotEqual(default, capturedEntity.UpdatedAt);
        }
    }
}
