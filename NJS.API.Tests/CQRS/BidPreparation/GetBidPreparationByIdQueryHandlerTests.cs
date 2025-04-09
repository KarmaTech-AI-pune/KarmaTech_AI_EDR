using Microsoft.EntityFrameworkCore;
using Moq;
using NJS.Application.CQRS.Handlers.BidPreparation;
using NJS.Application.CQRS.Queries.BidPreparation;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace NJS.API.Tests.CQRS.BidPreparation
{
    public class GetBidPreparationByIdQueryHandlerTests
    {
        private readonly Mock<ProjectManagementContext> _contextMock;
        private readonly GetBidPreparationByIdQueryHandler _handler;

        public GetBidPreparationByIdQueryHandlerTests()
        {
            _contextMock = new Mock<ProjectManagementContext>(new DbContextOptions<ProjectManagementContext>());
            _handler = new GetBidPreparationByIdQueryHandler(_contextMock.Object);
        }

        [Fact]
        public async Task Handle_WithValidId_ReturnsBidPreparationDto()
        {
            // Arrange
            var bidId = 1;
            var bid = new Domain.Entities.BidPreparation
            {
                Id = bidId,
                ProjectId = 1,
                Title = "Test Bid",
                Description = "Test Description",
                Status = "Draft",
                CreatedAt = DateTime.Now,
                CreatedBy = "user1"
            };

            var mockDbSet = MockDbSet(new[] { bid });
            _contextMock.Setup(c => c.BidPreparations).Returns(mockDbSet.Object);

            var query = new GetBidPreparationByIdQuery(bidId);

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(bidId, result.Id);
            Assert.Equal(bid.ProjectId, result.ProjectId);
            Assert.Equal(bid.Title, result.Title);
            Assert.Equal(bid.Description, result.Description);
            Assert.Equal(bid.Status, result.Status);
            Assert.Equal(bid.CreatedBy, result.CreatedBy);
        }

        [Fact]
        public async Task Handle_WithInvalidId_ReturnsNull()
        {
            // Arrange
            var bidId = 999;
            var bids = new Domain.Entities.BidPreparation[] { };

            var mockDbSet = MockDbSet(bids);
            _contextMock.Setup(c => c.BidPreparations).Returns(mockDbSet.Object);

            var query = new GetBidPreparationByIdQuery(bidId);

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.Null(result);
        }

        private static Mock<DbSet<T>> MockDbSet<T>(T[] entities) where T : class
        {
            var mockSet = new Mock<DbSet<T>>();
            mockSet.As<IQueryable<T>>().Setup(m => m.Provider).Returns(entities.AsQueryable().Provider);
            mockSet.As<IQueryable<T>>().Setup(m => m.Expression).Returns(entities.AsQueryable().Expression);
            mockSet.As<IQueryable<T>>().Setup(m => m.ElementType).Returns(entities.AsQueryable().ElementType);
            mockSet.As<IQueryable<T>>().Setup(m => m.GetEnumerator()).Returns(entities.AsQueryable().GetEnumerator());
            
            mockSet.Setup(m => m.FindAsync(It.IsAny<object[]>()))
                .Returns<object[]>(ids => 
                {
                    var id = (int)ids[0];
                    var entity = entities.FirstOrDefault(e => ((Domain.Entities.BidPreparation)(object)e).Id == id);
                    return ValueTask.FromResult(entity);
                });

            return mockSet;
        }
    }
}
