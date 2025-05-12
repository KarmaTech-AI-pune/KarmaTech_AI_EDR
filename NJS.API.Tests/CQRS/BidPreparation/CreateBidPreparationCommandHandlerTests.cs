using Microsoft.EntityFrameworkCore;
using Moq;
using NJS.Application.CQRS.Commands.BidPreparation;
using NJS.Application.CQRS.Handlers.BidPreparation;
using NJS.Application.Dtos;
using NJS.Domain.Database;
using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace NJS.API.Tests.CQRS.BidPreparation
{
    public class CreateBidPreparationCommandHandlerTests
    {
        private readonly Mock<ProjectManagementContext> _contextMock;
        private readonly CreateBidPreparationCommandHandler _handler;

        public CreateBidPreparationCommandHandlerTests()
        {
            _contextMock = new Mock<ProjectManagementContext>(new DbContextOptions<ProjectManagementContext>());
            _handler = new CreateBidPreparationCommandHandler(_contextMock.Object);
        }

        [Fact]
        public async Task Handle_WithValidCommand_CreatesBidAndReturnsId()
        {
            // Arrange
            var bidDto = new BidPreparationDto
            {
                ProjectId = 1,
                Title = "New Bid",
                Description = "Description",
                Status = "Draft"
            };

            var command = new CreateBidPreparationCommand(bidDto);

            // Capture the entity being added
            Domain.Entities.BidPreparation capturedEntity = null;
            _contextMock.Setup(c => c.BidPreparations.Add(It.IsAny<Domain.Entities.BidPreparation>()))
                .Callback<Domain.Entities.BidPreparation>(e => capturedEntity = e);

            _contextMock.Setup(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(1)
                .Callback(() => capturedEntity.Id = 1); // Simulate auto-increment ID

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.Equal(1, result);
            
            // Verify entity was added with correct properties
            _contextMock.Verify(c => c.BidPreparations.Add(It.IsAny<Domain.Entities.BidPreparation>()), Times.Once);
            _contextMock.Verify(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
            
            Assert.NotNull(capturedEntity);
            Assert.Equal(bidDto.ProjectId, capturedEntity.ProjectId);
            Assert.Equal(bidDto.Title, capturedEntity.Title);
            Assert.Equal(bidDto.Description, capturedEntity.Description);
            Assert.Equal(bidDto.Status, capturedEntity.Status);
            Assert.NotEqual(default, capturedEntity.CreatedAt);
        }
    }
}
