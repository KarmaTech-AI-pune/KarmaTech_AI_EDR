using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Moq;
using EDR.Domain.Services;
using EDR.Application.CQRS.Handlers.BidPreparation;
using EDR.Application.CQRS.Queries.BidPreparation;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace EDR.API.Tests.CQRS.BidPreparation
{
    public class GetBidPreparationQueryHandlerTests
    {
        private readonly DbContextOptions<ProjectManagementContext> _options;
        private readonly Mock<ICurrentTenantService> _currentTenantServiceMock;
        private readonly Mock<IConfiguration> _configurationMock;

        public GetBidPreparationQueryHandlerTests()
        {
            _options = new DbContextOptionsBuilder<ProjectManagementContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _currentTenantServiceMock = new Mock<ICurrentTenantService>();
            _configurationMock = new Mock<IConfiguration>();
        }

        private ProjectManagementContext GetContext()
        {
            return new ProjectManagementContext(_options, _currentTenantServiceMock.Object, _configurationMock.Object);
        }

        [Fact]
        public async Task Handle_WithValidOpportunityId_ReturnsBidPreparationDto()
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

            using var context = GetContext();
            context.BidPreparations.Add(bid);
            context.SaveChanges();

            var handler = new GetBidPreparationQueryHandler(context);

            var query = new GetBidPreparationQuery { OpportunityId = opportunityId, UserId = userId };

            // Act
            var result = await handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(bid.Id, result.Id);
            Assert.Equal(opportunityId, result.OpportunityId);
            Assert.Equal(bid.DocumentCategoriesJson, result.DocumentCategoriesJson);
            Assert.Equal(bid.Status, result.Status);
            Assert.Equal(bid.CreatedBy, result.CreatedBy);
        }

        [Fact]
        public async Task Handle_WithInvalidId_ReturnsNull()
        {
            // Arrange
            var opportunityId = 999;
            var userId = "user1";

            using var context = GetContext();
            var handler = new GetBidPreparationQueryHandler(context);

            var query = new GetBidPreparationQuery { OpportunityId = opportunityId, UserId = userId };

            // Act
            var result = await handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.Null(result);
        }
    }
}
