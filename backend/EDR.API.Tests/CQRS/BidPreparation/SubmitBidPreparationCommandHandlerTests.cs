using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Moq;
using EDR.Domain.Services;
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
        private readonly DbContextOptions<ProjectManagementContext> _options;
        private readonly Mock<ICurrentTenantService> _currentTenantServiceMock;
        private readonly Mock<IConfiguration> _configurationMock;

        public SubmitBidPreparationCommandHandlerTests()
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

            var context = GetContext();
            context.BidPreparations.Add(bid);
            await context.SaveChangesAsync();

            var handler = new SubmitBidPreparationCommandHandler(context);

            var command = new SubmitBidPreparationCommand 
            { 
                OpportunityId = opportunityId, 
                UserId = userId,
                CreatedBy = userId
            };

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.True(result);
            Assert.Equal(BidPreparationStatus.PendingApproval, bid.Status);
        }

        [Fact]
        public async Task Handle_WithInvalidId_ReturnsFalse()
        {
            // Arrange
            var opportunityId = 999;
            var userId = "user1";

            var context = GetContext();
            var handler = new SubmitBidPreparationCommandHandler(context);

            var command = new SubmitBidPreparationCommand { OpportunityId = opportunityId, UserId = userId, CreatedBy = userId };

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.False(result);
        }
    }
}
