using Microsoft.EntityFrameworkCore;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using NJS.Domain.Repositories;
using NJS.Repositories.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace NJS.API.Tests.Repositories
{
    public class GoNoGoDecisionRepositoryTests
    {
        private readonly DbContextOptions<ProjectManagementContext> _options;

        public GoNoGoDecisionRepositoryTests()
        {
            // Create a fresh in-memory database for each test
            _options = new DbContextOptionsBuilder<ProjectManagementContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
        }

        [Fact]
        public void GetAll_ShouldReturnAllDecisions()
        {
            // Arrange
            using var context = new ProjectManagementContext(_options);
            var repository = new GoNoGoDecisionRepository(context);
            
            // Add test data
            context.GoNoGoDecisions.AddRange(
                new GoNoGoDecision { Id = 1, ProjectName = "Project 1" },
                new GoNoGoDecision { Id = 2, ProjectName = "Project 2" },
                new GoNoGoDecision { Id = 3, ProjectName = "Project 3" }
            );
            context.SaveChanges();

            // Act
            var decisions = repository.GetAll();

            // Assert
            Assert.Equal(3, decisions.Count());
            Assert.Contains(decisions, d => d.ProjectName == "Project 1");
            Assert.Contains(decisions, d => d.ProjectName == "Project 2");
            Assert.Contains(decisions, d => d.ProjectName == "Project 3");
        }

        [Fact]
        public async Task GetById_WithValidId_ShouldReturnDecision()
        {
            // Arrange
            using var context = new ProjectManagementContext(_options);
            var repository = new GoNoGoDecisionRepository(context);
            
            // Add test data
            var decision = new GoNoGoDecision { Id = 1, ProjectName = "Test Project" };
            await context.GoNoGoDecisions.AddAsync(decision);
            await context.SaveChangesAsync();

            // Act
            var result = await repository.GetById(decision.Id);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(decision.Id, result.Id);
            Assert.Equal("Test Project", result.ProjectName);
        }

        [Fact]
        public async Task GetById_WithInvalidId_ShouldReturnNull()
        {
            // Arrange
            using var context = new ProjectManagementContext(_options);
            var repository = new GoNoGoDecisionRepository(context);

            // Act
            var result = await repository.GetById(999);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task Create_ShouldAddDecisionAndReturnId()
        {
            // Arrange
            using var context = new ProjectManagementContext(_options);
            var repository = new GoNoGoDecisionRepository(context);
            var decision = new GoNoGoDecision { ProjectName = "New Project" };

            // Act
            var id = await repository.Create(decision);

            // Assert
            Assert.NotEqual(0, id);
            var savedDecision = await context.GoNoGoDecisions.FindAsync(id);
            Assert.NotNull(savedDecision);
            Assert.Equal("New Project", savedDecision.ProjectName);
        }

        [Fact]
        public async Task Update_WithValidDecision_ShouldUpdateAndReturnTrue()
        {
            // Arrange
            using var context = new ProjectManagementContext(_options);
            var repository = new GoNoGoDecisionRepository(context);
            
            // Add test data
            var decision = new GoNoGoDecision { Id = 1, ProjectName = "Original Name" };
            await context.GoNoGoDecisions.AddAsync(decision);
            await context.SaveChangesAsync();

            // Act
            decision.ProjectName = "Updated Name";
            var result = await repository.Update(decision);

            // Assert
            Assert.True(result);
            var updatedDecision = await context.GoNoGoDecisions.FindAsync(decision.Id);
            Assert.NotNull(updatedDecision);
            Assert.Equal("Updated Name", updatedDecision.ProjectName);
        }

        [Fact]
        public async Task Update_WithInvalidId_ShouldReturnFalse()
        {
            // Arrange
            using var context = new ProjectManagementContext(_options);
            var repository = new GoNoGoDecisionRepository(context);
            var decision = new GoNoGoDecision { Id = 999, ProjectName = "Nonexistent" };

            // Act
            var result = await repository.Update(decision);

            // Assert
            Assert.False(result);
        }

        [Fact]
        public async Task Delete_WithValidId_ShouldRemoveDecisionAndReturnTrue()
        {
            // Arrange
            using var context = new ProjectManagementContext(_options);
            var repository = new GoNoGoDecisionRepository(context);
            
            // Add test data
            var decision = new GoNoGoDecision { Id = 1, ProjectName = "Project to Delete" };
            await context.GoNoGoDecisions.AddAsync(decision);
            await context.SaveChangesAsync();

            // Act
            var result = await repository.Delete(decision.Id);

            // Assert
            Assert.True(result);
            Assert.Null(await context.GoNoGoDecisions.FindAsync(decision.Id));
        }

        [Fact]
        public async Task Delete_WithInvalidId_ShouldReturnFalse()
        {
            // Arrange
            using var context = new ProjectManagementContext(_options);
            var repository = new GoNoGoDecisionRepository(context);

            // Act
            var result = await repository.Delete(999);

            // Assert
            Assert.False(result);
        }

        [Fact]
        public async Task GetVersions_ShouldReturnVersionsForHeader()
        {
            // Arrange
            using var context = new ProjectManagementContext(_options);
            var repository = new GoNoGoDecisionRepository(context);
            
            // Add test data
            var headerId = 1;
            var versions = new List<GoNoGoVersion>
            {
                new GoNoGoVersion { Id = 1, GoNoGoDecisionHeaderId = headerId, VersionNumber = 1 },
                new GoNoGoVersion { Id = 2, GoNoGoDecisionHeaderId = headerId, VersionNumber = 2 },
                new GoNoGoVersion { Id = 3, GoNoGoDecisionHeaderId = 2, VersionNumber = 1 } // Different header
            };
            
            await context.GoNoGoVersions.AddRangeAsync(versions);
            await context.SaveChangesAsync();

            // Act
            var result = await repository.GetVersions(headerId);

            // Assert
            Assert.Equal(2, result.Count());
            Assert.All(result, v => Assert.Equal(headerId, v.GoNoGoDecisionHeaderId));
            Assert.Contains(result, v => v.VersionNumber == 1);
            Assert.Contains(result, v => v.VersionNumber == 2);
        }
    }
}
