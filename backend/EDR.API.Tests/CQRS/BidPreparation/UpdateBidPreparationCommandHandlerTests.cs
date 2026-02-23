using Microsoft.EntityFrameworkCore;
using Moq;
using EDR.Application.CQRS.Commands.BidPreparation;
using EDR.Application.CQRS.Handlers.BidPreparation;
using EDR.Application.Dtos;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace EDR.API.Tests.CQRS.BidPreparation
{
    public class UpdateBidPreparationCommandHandlerTests
    {
        private readonly Mock<ProjectManagementContext> _contextMock;
        private readonly UpdateBidPreparationCommandHandler _handler;

        public UpdateBidPreparationCommandHandlerTests()
        {
            _contextMock = new Mock<ProjectManagementContext>(new DbContextOptions<ProjectManagementContext>());
            _handler = new UpdateBidPreparationCommandHandler(_contextMock.Object);
        }

        [Fact]
        public async Task Handle_WithValidCommand_CreatesBidIfNotFoundAndReturnsTrue()
        {
            // Arrange
            var opportunityId = 1;
            var userId = "user1";
            var command = new UpdateBidPreparationCommand
            {
                OpportunityId = opportunityId,
                UserId = userId,
                DocumentCategoriesJson = "{}",
                Comments = "New Bid",
                CreatedBy = userId
            };

            var bids = new EDR.Domain.Entities.BidPreparation[] { };
            var mockDbSet = MockDbSet(bids);
            _contextMock.Setup(c => c.BidPreparations).Returns(mockDbSet.Object);
            _contextMock.Setup(c => c.OpportunityTrackings).Returns(new Mock<DbSet<EDR.Domain.Entities.OpportunityTracking>>().Object);

            _contextMock.Setup(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(1);

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.True(result);
            _contextMock.Verify(c => c.BidPreparations.Add(It.IsAny<EDR.Domain.Entities.BidPreparation>()), Times.Once);
            _contextMock.Verify(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
        }

        private static Mock<DbSet<T>> MockDbSet<T>(T[] entities) where T : class
        {
            var mockSet = new Mock<DbSet<T>>();
            mockSet.As<IQueryable<T>>().Setup(m => m.Provider).Returns(entities.AsQueryable().Provider);
            mockSet.As<IQueryable<T>>().Setup(m => m.Expression).Returns(entities.AsQueryable().Expression);
            mockSet.As<IQueryable<T>>().Setup(m => m.ElementType).Returns(entities.AsQueryable().ElementType);
            mockSet.As<IQueryable<T>>().Setup(m => m.GetEnumerator()).Returns(entities.AsQueryable().GetEnumerator());
            
            return mockSet;
        }
    }
}
