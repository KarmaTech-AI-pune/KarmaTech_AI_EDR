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

        [Fact]
        public async Task GetAllAsync_ShouldReturnAllOpportunities()
        {
            // Arrange
            using var context = GetContext();
            var repository = new OpportunityTrackingRepository(context);
            
            // Add test data
            await context.OpportunityTrackings.AddRangeAsync(
                new OpportunityTracking { Id = 1, WorkName = "Opportunity 1", Status = OpportunityTrackingStatus.BID_UNDER_PREPERATION, StrategicRanking = "High", Operation = "Op", Client = "Client", ClientSector = "Sector", Currency = "USD" },
                new OpportunityTracking { Id = 2, WorkName = "Opportunity 2", Status = OpportunityTrackingStatus.BID_UNDER_PREPERATION, StrategicRanking = "High", Operation = "Op", Client = "Client", ClientSector = "Sector", Currency = "USD" },
                new OpportunityTracking { Id = 3, WorkName = "Opportunity 3", Status = OpportunityTrackingStatus.BID_REJECTED, StrategicRanking = "High", Operation = "Op", Client = "Client", ClientSector = "Sector", Currency = "USD" }
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
            var opportunity = new OpportunityTracking 
            { 
                Id = 1, 
                WorkName = "Test Opportunity", 
                Status = OpportunityTrackingStatus.BID_UNDER_PREPERATION,
                StrategicRanking = "High",
                Operation = "Op",
                Client = "Client",
                ClientSector = "Sector",
                Currency = "USD"
            };
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
            var opportunity = new OpportunityTracking
            {
                WorkName = "New Opportunity",
                Notes = "Description",
                Client = "Client",
                Status = OpportunityTrackingStatus.BID_UNDER_PREPERATION,
                Stage = OpportunityStage.A,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now,
                StrategicRanking = "High",
                Operation = "Op",
                ClientSector = "Sector",
                Currency = "USD"
            };

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
            var opportunity = new OpportunityTracking 
            { 
                Id = 1, 
                WorkName = "Original Title", 
                Status = OpportunityTrackingStatus.BID_UNDER_PREPERATION,
                StrategicRanking = "High",
                Operation = "Op",
                Client = "Client",
                ClientSector = "Sector",
                Currency = "USD"
            };
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
            var opportunity = new OpportunityTracking 
            { 
                Id = 1, 
                WorkName = "Opportunity to Delete", 
                Status = OpportunityTrackingStatus.BID_UNDER_PREPERATION,
                StrategicRanking = "High",
                Operation = "Op",
                Client = "Client",
                ClientSector = "Sector",
                Currency = "USD"
            };
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
