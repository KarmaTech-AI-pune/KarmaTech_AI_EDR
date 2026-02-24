using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;
using EDR.Application.CQRS.Queries.BidPreparation;
using EDR.Application.CQRS.Handlers.BidPreparation;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.Domain.Services;
using Microsoft.Extensions.Configuration;
using System.Linq;

namespace EDR.API.Tests.CQRS.BidPreparation
{
    public class GetBidVersionHistoryQueryHandlerTests
    {
        private readonly DbContextOptions<ProjectManagementContext> _options;
        private readonly Mock<ICurrentTenantService> _currentTenantServiceMock;
        private readonly Mock<IConfiguration> _configurationMock;

        public GetBidVersionHistoryQueryHandlerTests()
        {
            _options = new DbContextOptionsBuilder<ProjectManagementContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _currentTenantServiceMock = new Mock<ICurrentTenantService>();
            _currentTenantServiceMock.Setup(x => x.TenantId).Returns(1);
            _configurationMock = new Mock<IConfiguration>();
        }

        private ProjectManagementContext GetContext()
        {
            return new ProjectManagementContext(_options, _currentTenantServiceMock.Object, _configurationMock.Object);
        }

        [Fact]
        public async Task Handle_ValidBid_ReturnsVersionHistoryDtoList()
        {
            // Arrange
            using var context = GetContext();
            var handler = new GetBidVersionHistoryQueryHandler(context);

            var bid = new EDR.Domain.Entities.BidPreparation
            {
                Id = 1,
                OpportunityId = 10,
                UserId = "user1",
                DocumentCategoriesJson = "[]",
                Comments = "",
                CreatedBy = "user1",
                UpdatedBy = "user1",
                VersionHistory = new List<BidVersionHistory>
                {
                    new BidVersionHistory { Id = 1, Version = 1, Status = BidPreparationStatus.Draft, Comments = "V1", DocumentCategoriesJson = "[]", ModifiedBy = "user1" },
                    new BidVersionHistory { Id = 2, Version = 2, Status = BidPreparationStatus.PendingApproval, Comments = "V2", DocumentCategoriesJson = "[]", ModifiedBy = "user1"  }
                }
            };

            context.BidPreparations.Add(bid);
            await context.SaveChangesAsync();

            var query = new GetBidVersionHistoryQuery
            {
                OpportunityId = 10,
                UserId = "user1"
            };

            // Act
            var result = await handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Count);
            Assert.Equal(2, result.First().Version); // Assuming desc order
        }

        [Fact]
        public async Task Handle_BidNotFound_ReturnsEmptyList()
        {
            // Arrange
            using var context = GetContext();
            var handler = new GetBidVersionHistoryQueryHandler(context);

            var query = new GetBidVersionHistoryQuery
            {
                OpportunityId = 999,
                UserId = "user1"
            };

            // Act
            var result = await handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Empty(result);
        }
    }
}
