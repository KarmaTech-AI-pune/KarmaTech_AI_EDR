using Microsoft.EntityFrameworkCore;
using Moq;
using EDR.Application.CQRS.Commands.BidPreparation;
using EDR.Application.CQRS.Handlers.BidPreparation;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace EDR.API.Tests.CQRS.BidPreparation
{
    public class SubmitBidPreparationCommandHandlerTests
    {
        private readonly Mock<ProjectManagementContext> _contextMock;
        private readonly SubmitBidPreparationCommandHandler _handler;

        public SubmitBidPreparationCommandHandlerTests()
        {
            _contextMock = new Mock<ProjectManagementContext>(new DbContextOptions<ProjectManagementContext>());
            _handler = new SubmitBidPreparationCommandHandler(_contextMock.Object);
        }

        [Fact]
        public async Task Handle_WithValidCommand_UpdatesBidStatusAndReturnsTrue()
        {
            // Arrange
            var opportunityId = 1;
            var userId = "user1";
            var bid = new EDR.Domain.Entities.BidPreparation
            {
                Id = 1,
                OpportunityId = opportunityId,
                UserId = userId,
                DocumentCategoriesJson = "{}",
                Status = BidPreparationStatus.Draft,
                CreatedAt = DateTime.Now,
                CreatedBy = userId
            };

            var mockDbSet = MockDbSet(new[] { bid });
            _contextMock.Setup(c => c.BidPreparations).Returns(mockDbSet.Object);
            _contextMock.Setup(c => c.BidVersionHistories).Returns(new Mock<DbSet<BidVersionHistory>>().Object);

            _contextMock.Setup(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(1);

            var command = new SubmitBidPreparationCommand 
            { 
                OpportunityId = opportunityId, 
                UserId = userId,
                CreatedBy = userId
            };

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.True(result);
            Assert.Equal(BidPreparationStatus.PendingApproval, bid.Status);
            _contextMock.Verify(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task Handle_WithInvalidId_ReturnsFalse()
        {
            // Arrange
            var opportunityId = 999;
            var userId = "user1";
            var bids = new EDR.Domain.Entities.BidPreparation[] { };

            var mockDbSet = MockDbSet(bids);
            _contextMock.Setup(c => c.BidPreparations).Returns(mockDbSet.Object);

            var command = new SubmitBidPreparationCommand { OpportunityId = opportunityId, UserId = userId, CreatedBy = userId };

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.False(result);
            _contextMock.Verify(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
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
