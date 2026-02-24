using Microsoft.EntityFrameworkCore;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using NJS.Domain.Enums;
using NJS.Domain.Repositories;
using NJS.Repositories.Repositories;
using System;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace NJS.API.Tests.Repositories
{
    public class OpportunityTrackingRepositoryTests
    {
        private readonly DbContextOptions<ProjectManagementContext> _options;

        public OpportunityTrackingRepositoryTests()
        {
            // Create a fresh in-memory database for each test
            _options = new DbContextOptionsBuilder<ProjectManagementContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
        }

        [Fact]
        public async Task GetAllAsync_ShouldReturnAllOpportunities()
        {
            // Arrange
            using var context = new ProjectManagementContext(_options);
            var repository = new OpportunityTrackingRepository(context);
            
            // Add test data
            await context.OpportunityTrackings.AddRangeAsync(
                new OpportunityTrackingEntity { Id = 1, Title = "Opportunity 1", Status = OpportunityTrackingStatus.Active },
                new OpportunityTrackingEntity { Id = 2, Title = "Opportunity 2", Status = OpportunityTrackingStatus.Active },
                new OpportunityTrackingEntity { Id = 3, Title = "Opportunity 3", Status = OpportunityTrackingStatus.Closed }
            );
            await context.SaveChangesAsync();

            // Act
            var opportunities = await repository.GetAllAsync();

            // Assert
            Assert.Equal(3, opportunities.Count());
            Assert.Contains(opportunities, o => o.Title == "Opportunity 1");
            Assert.Contains(opportunities, o => o.Title == "Opportunity 2");
            Assert.Contains(opportunities, o => o.Title == "Opportunity 3");
        }

        [Fact]
        public async Task GetByIdAsync_WithValidId_ShouldReturnOpportunity()
        {
            // Arrange
            using var context = new ProjectManagementContext(_options);
            var repository = new OpportunityTrackingRepository(context);
            
            // Add test data
            var opportunity = new OpportunityTrackingEntity 
            { 
                Id = 1, 
                Title = "Test Opportunity", 
                Status = OpportunityTrackingStatus.Active 
            };
            await context.OpportunityTrackings.AddAsync(opportunity);
            await context.SaveChangesAsync();

            // Act
            var result = await repository.GetByIdAsync(opportunity.Id);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(opportunity.Id, result.Id);
            Assert.Equal("Test Opportunity", result.Title);
        }

        [Fact]
        public async Task GetByIdAsync_WithInvalidId_ShouldReturnNull()
        {
            // Arrange
            using var context = new ProjectManagementContext(_options);
            var repository = new OpportunityTrackingRepository(context);

            // Act
            var result = await repository.GetByIdAsync(999);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task GetByStatusAsync_ShouldReturnOpportunitiesWithStatus()
        {
            // Arrange
            using var context = new ProjectManagementContext(_options);
            var repository = new OpportunityTrackingRepository(context);
            
            // Add test data
            await context.OpportunityTrackings.AddRangeAsync(
                new OpportunityTrackingEntity { Id = 1, Title = "Opportunity 1", Status = OpportunityTrackingStatus.Active },
                new OpportunityTrackingEntity { Id = 2, Title = "Opportunity 2", Status = OpportunityTrackingStatus.Active },
                new OpportunityTrackingEntity { Id = 3, Title = "Opportunity 3", Status = OpportunityTrackingStatus.Closed }
            );
            await context.SaveChangesAsync();

            // Act
            var activeOpportunities = await repository.GetByStatusAsync(OpportunityTrackingStatus.Active);

            // Assert
            Assert.Equal(2, activeOpportunities.Count());
            Assert.All(activeOpportunities, o => Assert.Equal(OpportunityTrackingStatus.Active, o.Status));
            Assert.Contains(activeOpportunities, o => o.Title == "Opportunity 1");
            Assert.Contains(activeOpportunities, o => o.Title == "Opportunity 2");
        }

        [Fact]
        public async Task AddAsync_ShouldAddOpportunityToDatabase()
        {
            // Arrange
            using var context = new ProjectManagementContext(_options);
            var repository = new OpportunityTrackingRepository(context);
            var opportunity = new OpportunityTrackingEntity
            {
                Title = "New Opportunity",
                Description = "Description",
                ClientName = "Client",
                Status = OpportunityTrackingStatus.Active,
                Stage = OpportunityStage.Identification,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now
            };

            // Act
            await repository.AddAsync(opportunity);
            await context.SaveChangesAsync();

            // Assert
            Assert.NotEqual(0, opportunity.Id); // ID should be set
            var savedOpportunity = await context.OpportunityTrackings.FindAsync(opportunity.Id);
            Assert.NotNull(savedOpportunity);
            Assert.Equal("New Opportunity", savedOpportunity.Title);
        }

        [Fact]
        public async Task UpdateAsync_ShouldUpdateOpportunityInDatabase()
        {
            // Arrange
            using var context = new ProjectManagementContext(_options);
            var repository = new OpportunityTrackingRepository(context);
            
            // Add test data
            var opportunity = new OpportunityTrackingEntity 
            { 
                Id = 1, 
                Title = "Original Title", 
                Status = OpportunityTrackingStatus.Active 
            };
            await context.OpportunityTrackings.AddAsync(opportunity);
            await context.SaveChangesAsync();

            // Act
            opportunity.Title = "Updated Title";
            await repository.UpdateAsync(opportunity);
            await context.SaveChangesAsync();

            // Assert
            var updatedOpportunity = await context.OpportunityTrackings.FindAsync(opportunity.Id);
            Assert.NotNull(updatedOpportunity);
            Assert.Equal("Updated Title", updatedOpportunity.Title);
        }

        [Fact]
        public async Task DeleteAsync_ShouldRemoveOpportunityFromDatabase()
        {
            // Arrange
            using var context = new ProjectManagementContext(_options);
            var repository = new OpportunityTrackingRepository(context);
            
            // Add test data
            var opportunity = new OpportunityTrackingEntity 
            { 
                Id = 1, 
                Title = "Opportunity to Delete", 
                Status = OpportunityTrackingStatus.Active 
            };
            await context.OpportunityTrackings.AddAsync(opportunity);
            await context.SaveChangesAsync();
            
            // Verify opportunity exists
            Assert.NotNull(await context.OpportunityTrackings.FindAsync(opportunity.Id));

            // Act
            await repository.DeleteAsync(opportunity.Id);
            await context.SaveChangesAsync();

            // Assert
            Assert.Null(await context.OpportunityTrackings.FindAsync(opportunity.Id));
        }
    }
}
