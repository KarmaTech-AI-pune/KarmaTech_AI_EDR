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
        private DbContextOptions<ProjectManagementContext> _options;

        public UpdateBidPreparationCommandHandlerTests()
        {
            _options = new DbContextOptionsBuilder<ProjectManagementContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
        }

        private ProjectManagementContext GetContext()
        {
            return new ProjectManagementContext(_options, new Mock<EDR.Domain.Services.ICurrentTenantService>().Object, new Mock<Microsoft.Extensions.Configuration.IConfiguration>().Object);
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

            using var context = GetContext();
            var handler = new UpdateBidPreparationCommandHandler(context);

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.True(result);
            var savedBid = await context.BidPreparations.FirstOrDefaultAsync(b => b.OpportunityId == opportunityId && b.UserId == userId);
            Assert.NotNull(savedBid);
        }
    }
}
