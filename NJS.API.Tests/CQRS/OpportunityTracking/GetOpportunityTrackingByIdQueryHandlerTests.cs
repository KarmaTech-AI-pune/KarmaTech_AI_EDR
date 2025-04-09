using Microsoft.EntityFrameworkCore;
using Moq;
using NJS.Application.CQRS.OpportunityTracking.Handlers;
using NJS.Application.CQRS.OpportunityTracking.Queries;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using NJS.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace NJS.API.Tests.CQRS.OpportunityTracking
{
    public class GetOpportunityTrackingByIdQueryHandlerTests
    {
        private readonly Mock<ProjectManagementContext> _contextMock;
        private readonly GetOpportunityTrackingByIdQueryHandler _handler;

        public GetOpportunityTrackingByIdQueryHandlerTests()
        {
            _contextMock = new Mock<ProjectManagementContext>(new DbContextOptions<ProjectManagementContext>());
            _handler = new GetOpportunityTrackingByIdQueryHandler(_contextMock.Object);
        }

        [Fact]
        public async Task Handle_WithValidId_ReturnsOpportunityTrackingDto()
        {
            // Arrange
            var opportunityId = 1;
            var opportunity = new OpportunityTrackingEntity
            {
                Id = opportunityId,
                Title = "Test Opportunity",
                Description = "Test Description",
                ClientName = "Test Client",
                Status = OpportunityTrackingStatus.Active,
                Stage = OpportunityStage.Identification,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now,
                BidManagerId = "user1",
                ClientSector = "Energy"
            };

            var mockDbSet = MockDbSet(new[] { opportunity });
            _contextMock.Setup(c => c.OpportunityTrackings).Returns(mockDbSet.Object);

            var query = new GetOpportunityTrackingByIdQuery(opportunityId);

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(opportunityId, result.Id);
            Assert.Equal(opportunity.Title, result.Title);
            Assert.Equal(opportunity.Description, result.Description);
            Assert.Equal(opportunity.ClientName, result.ClientName);
            Assert.Equal(opportunity.Status, result.Status);
            Assert.Equal(opportunity.Stage, result.Stage);
            Assert.Equal(opportunity.BidManagerId, result.BidManagerId);
            Assert.Equal(opportunity.ClientSector, result.ClientSector);
        }

        [Fact]
        public async Task Handle_WithInvalidId_ReturnsNull()
        {
            // Arrange
            var opportunityId = 999;
            var opportunities = new OpportunityTrackingEntity[] { };

            var mockDbSet = MockDbSet(opportunities);
            _contextMock.Setup(c => c.OpportunityTrackings).Returns(mockDbSet.Object);

            var query = new GetOpportunityTrackingByIdQuery(opportunityId);

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
                    var entity = entities.FirstOrDefault(e => ((OpportunityTrackingEntity)(object)e).Id == id);
                    return ValueTask.FromResult(entity);
                });

            return mockSet;
        }
    }
}
