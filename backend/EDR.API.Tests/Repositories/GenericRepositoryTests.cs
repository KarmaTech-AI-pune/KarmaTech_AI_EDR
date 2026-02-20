using Microsoft.EntityFrameworkCore;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using NJS.Domain.GenericRepository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace NJS.API.Tests.Repositories
{
    public class GenericRepositoryTests
    {
        private readonly DbContextOptions<ProjectManagementContext> _options;

        public GenericRepositoryTests()
        {
            // Create a fresh in-memory database for each test
            _options = new DbContextOptionsBuilder<ProjectManagementContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
        }

        [Fact]
        public async Task AddAsync_ShouldAddEntityToDatabase()
        {
            // Arrange
            using var context = new ProjectManagementContext(_options);
            var repository = new Repository<Project>(context);
            var project = new Project
            {
                Name = "Test Project",
                Description = "Test Description",
                StartDate = DateTime.Now,
                EndDate = DateTime.Now.AddMonths(3)
            };

            // Act
            await repository.AddAsync(project);
            await context.SaveChangesAsync();

            // Assert
            Assert.NotEqual(0, project.Id); // ID should be set
            var savedProject = await context.Projects.FindAsync(project.Id);
            Assert.NotNull(savedProject);
            Assert.Equal("Test Project", savedProject.Name);
        }

        [Fact]
        public async Task GetAllAsync_ShouldReturnAllEntities()
        {
            // Arrange
            using var context = new ProjectManagementContext(_options);
            var repository = new Repository<Project>(context);
            
            // Add test data
            await context.Projects.AddRangeAsync(
                new Project { Name = "Project 1" },
                new Project { Name = "Project 2" },
                new Project { Name = "Project 3" }
            );
            await context.SaveChangesAsync();

            // Act
            var projects = await repository.GetAllAsync();

            // Assert
            Assert.Equal(3, projects.Count());
            Assert.Contains(projects, p => p.Name == "Project 1");
            Assert.Contains(projects, p => p.Name == "Project 2");
            Assert.Contains(projects, p => p.Name == "Project 3");
        }

        [Fact]
        public async Task GetByIdAsync_WithValidId_ShouldReturnEntity()
        {
            // Arrange
            using var context = new ProjectManagementContext(_options);
            var repository = new Repository<Project>(context);
            
            // Add test data
            var project = new Project { Name = "Test Project" };
            await context.Projects.AddAsync(project);
            await context.SaveChangesAsync();

            // Act
            var result = await repository.GetByIdAsync(project.Id);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(project.Id, result.Id);
            Assert.Equal("Test Project", result.Name);
        }

        [Fact]
        public async Task GetByIdAsync_WithInvalidId_ShouldReturnNull()
        {
            // Arrange
            using var context = new ProjectManagementContext(_options);
            var repository = new Repository<Project>(context);

            // Act
            var result = await repository.GetByIdAsync(999);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task Query_ShouldReturnQueryableEntities()
        {
            // Arrange
            using var context = new ProjectManagementContext(_options);
            var repository = new Repository<Project>(context);
            
            // Add test data
            await context.Projects.AddRangeAsync(
                new Project { Name = "Project A" },
                new Project { Name = "Project B" },
                new Project { Name = "Other Project" }
            );
            await context.SaveChangesAsync();

            // Act
            var query = repository.Query();
            var filteredProjects = query.Where(p => p.Name.StartsWith("Project")).ToList();

            // Assert
            Assert.Equal(2, filteredProjects.Count);
            Assert.Contains(filteredProjects, p => p.Name == "Project A");
            Assert.Contains(filteredProjects, p => p.Name == "Project B");
        }

        [Fact]
        public async Task UpdateAsync_ShouldUpdateEntityInDatabase()
        {
            // Arrange
            using var context = new ProjectManagementContext(_options);
            var repository = new Repository<Project>(context);
            
            // Add test data
            var project = new Project { Name = "Original Name" };
            await context.Projects.AddAsync(project);
            await context.SaveChangesAsync();

            // Act
            project.Name = "Updated Name";
            await repository.UpdateAsync(project);
            await context.SaveChangesAsync();

            // Assert
            var updatedProject = await context.Projects.FindAsync(project.Id);
            Assert.NotNull(updatedProject);
            Assert.Equal("Updated Name", updatedProject.Name);
        }

        [Fact]
        public async Task RemoveAsync_ShouldRemoveEntityFromDatabase()
        {
            // Arrange
            using var context = new ProjectManagementContext(_options);
            var repository = new Repository<Project>(context);
            
            // Add test data
            var project = new Project { Name = "Project to Remove" };
            await context.Projects.AddAsync(project);
            await context.SaveChangesAsync();
            
            // Verify project exists
            Assert.NotNull(await context.Projects.FindAsync(project.Id));

            // Act
            await repository.RemoveAsync(project);

            // Assert
            Assert.Null(await context.Projects.FindAsync(project.Id));
        }
    }
}
