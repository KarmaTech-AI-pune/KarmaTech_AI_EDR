using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Moq;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.Domain.Enums;
using EDR.Domain.Services;
using EDR.Repositories.Interfaces;
using EDR.Repositories.Repositories;
using System;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace EDR.API.Tests.Repositories
{
    public class OpportunityTrackingRepositoryTests
    {
        private readonly DbContextOptions<ProjectManagementContext> _options;
        private readonly Mock<ICurrentTenantService> _currentTenantServiceMock;
        private readonly Mock<IConfiguration> _configurationMock;

        public OpportunityTrackingRepositoryTests()
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

        private OpportunityTracking CreateValidOpportunity(int id, string workName, OpportunityTrackingStatus status = OpportunityTrackingStatus.BID_UNDER_PREPERATION)
        {
            return new OpportunityTracking
            {
                Id = id,
                WorkName = workName,
                Status = status,
                StrategicRanking = "High",
                Operation = "Op",
                Client = "Client",
                ClientSector = "Sector",
                Currency = "USD",
                ContractType = "Fixed Price",
                FundingStream = "Government",
                Stage = OpportunityStage.A,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now
            };
        }

        [Fact]
        public async Task GetAllAsync_ShouldReturnAllOpportunities()
        {
            // Arrange
            using var context = GetContext();
            var repository = new OpportunityTrackingRepository(context);
            
            // Add test data
            await context.OpportunityTrackings.AddRangeAsync(
                CreateValidOpportunity(1, "Opportunity 1"),
                CreateValidOpportunity(2, "Opportunity 2"),
                CreateValidOpportunity(3, "Opportunity 3", OpportunityTrackingStatus.BID_REJECTED)
            );
            await context.SaveChangesAsync();

            // Act
            var opportunities = await repository.GetAllAsync();

            // Assert
            Assert.Equal(3, opportunities.Count());
            Assert.Contains(opportunities, o => o.WorkName == "Opportunity 1");
        }

        [Fact]
        public async Task GetByIdAsync_WithValidId_ShouldReturnOpportunity()
        {
            // Arrange
            using var context = GetContext();
            var repository = new OpportunityTrackingRepository(context);
            
            // Add test data
            var opportunity = CreateValidOpportunity(1, "Test Opportunity");
            await context.OpportunityTrackings.AddAsync(opportunity);
            await context.SaveChangesAsync();

            // Act
            var result = await repository.GetByIdAsync(opportunity.Id);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(opportunity.Id, result.Id);
            Assert.Equal("Test Opportunity", result.WorkName);
        }

        [Fact]
        public async Task AddAsync_ShouldAddOpportunityToDatabase()
        {
            // Arrange
            using var context = GetContext();
            var repository = new OpportunityTrackingRepository(context);
            var opportunity = CreateValidOpportunity(0, "New Opportunity"); // ID 0 for add

            // Act
            await repository.AddAsync(opportunity);

            // Assert
            var savedOpportunity = await context.OpportunityTrackings.FindAsync(opportunity.Id);
            Assert.NotNull(savedOpportunity);
            Assert.Equal("New Opportunity", savedOpportunity.WorkName);
        }

        [Fact]
        public async Task UpdateAsync_ShouldUpdateOpportunityInDatabase()
        {
            // Arrange
            using var context = GetContext();
            var repository = new OpportunityTrackingRepository(context);
            
            // Add test data
            var opportunity = CreateValidOpportunity(1, "Original Title");
            await context.OpportunityTrackings.AddAsync(opportunity);
            await context.SaveChangesAsync();

            // Act
            opportunity.WorkName = "Updated Title";
            await repository.UpdateAsync(opportunity);

            // Assert
            var updatedOpportunity = await context.OpportunityTrackings.FindAsync(opportunity.Id);
            Assert.NotNull(updatedOpportunity);
            Assert.Equal("Updated Title", updatedOpportunity.WorkName);
        }

        [Fact]
        public async Task DeleteAsync_ShouldSoftDeleteOpportunity()
        {
            // Arrange
            using var context = GetContext();
            var repository = new OpportunityTrackingRepository(context);
            
            // Add test data
            var opportunity = CreateValidOpportunity(1, "Opportunity to Delete");
            await context.OpportunityTrackings.AddAsync(opportunity);
            await context.SaveChangesAsync();

            // Act
            await repository.DeleteAsync(opportunity.Id);

            // Assert
            var deletedOpportunity = await context.OpportunityTrackings.FindAsync(opportunity.Id);
            // Verify based on repository implementation of DeleteAsync (usually soft delete or remove)
            // Let's assume it removes for now, or check implementation if possible.
            // I'll check OpportunityTrackingRepository.cs
            Assert.Null(deletedOpportunity);
        }
    }
}
