using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;
using EDR.Application.CQRS.Commands.BidPreparation;
using EDR.Application.CQRS.Handlers.BidPreparation;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.Domain.Services;
using Microsoft.Extensions.Configuration;
using System.Linq;

namespace EDR.API.Tests.CQRS.BidPreparation
{
    public class ApproveBidPreparationCommandHandlerTests
    {
        private readonly DbContextOptions<ProjectManagementContext> _options;
        private readonly Mock<ICurrentTenantService> _currentTenantServiceMock;
        private readonly Mock<IConfiguration> _configurationMock;

        public ApproveBidPreparationCommandHandlerTests()
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
        public async Task Handle_Approved_ValidBid_ReturnsTrueAndUpdatesStatus()
        {
            // Arrange
            using var context = GetContext();
            var handler = new ApproveBidPreparationCommandHandler(context);

            var bid = new EDR.Domain.Entities.BidPreparation
            {
                Id = 1,
                OpportunityId = 10,
                UserId = "user1",
                DocumentCategoriesJson = "[]",
                Comments = "",
                CreatedBy = "user1",
                UpdatedBy = "user1",
                Status = BidPreparationStatus.PendingApproval,
                Version = 1,
                CreatedAt = DateTime.UtcNow,
                VersionHistory = new List<BidVersionHistory>()
            };

            context.BidPreparations.Add(bid);
            await context.SaveChangesAsync();

            var command = new ApproveBidPreparationCommand
            {
                OpportunityId = 10,
                UserId = "user1",
                IsApproved = true,
                Comments = "Approved it",
                CreatedBy = "user2"
            };

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.True(result);
            var updatedBid = await context.BidPreparations.Include(b => b.VersionHistory).FirstOrDefaultAsync(b => b.Id == 1);
            Assert.NotNull(updatedBid);
            Assert.Equal(BidPreparationStatus.Approved, updatedBid.Status);
            Assert.Equal(2, updatedBid.Version);
            Assert.Single(updatedBid.VersionHistory);
            Assert.Equal(BidPreparationStatus.Approved, updatedBid.VersionHistory.First().Status);
        }

        [Fact]
        public async Task Handle_Rejected_ValidBid_ReturnsTrueAndUpdatesStatus()
        {
            // Arrange
            using var context = GetContext();
            var handler = new ApproveBidPreparationCommandHandler(context);

            var bid = new EDR.Domain.Entities.BidPreparation
            {
                Id = 1,
                OpportunityId = 10,
                UserId = "user1",
                DocumentCategoriesJson = "[]",
                Comments = "",
                CreatedBy = "user1",
                UpdatedBy = "user1",
                Status = BidPreparationStatus.PendingApproval,
                Version = 1,
                CreatedAt = DateTime.UtcNow,
                VersionHistory = new List<BidVersionHistory>()
            };

            context.BidPreparations.Add(bid);
            await context.SaveChangesAsync();

            var command = new ApproveBidPreparationCommand
            {
                OpportunityId = 10,
                UserId = "user1",
                IsApproved = false,
                Comments = "Rejected it",
                CreatedBy = "user2"
            };

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.True(result);
            var updatedBid = await context.BidPreparations.Include(b => b.VersionHistory).FirstOrDefaultAsync(b => b.Id == 1);
            Assert.NotNull(updatedBid);
            Assert.Equal(BidPreparationStatus.Rejected, updatedBid.Status);
            Assert.Equal(2, updatedBid.Version);
            Assert.Single(updatedBid.VersionHistory);
            Assert.Equal(BidPreparationStatus.Rejected, updatedBid.VersionHistory.First().Status);
        }

        [Fact]
        public async Task Handle_BidNotFound_ReturnsFalse()
        {
            // Arrange
            using var context = GetContext();
            var handler = new ApproveBidPreparationCommandHandler(context);

            var command = new ApproveBidPreparationCommand
            {
                OpportunityId = 999,
                UserId = "user1",
                IsApproved = true
            };

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.False(result);
        }
    }
}
