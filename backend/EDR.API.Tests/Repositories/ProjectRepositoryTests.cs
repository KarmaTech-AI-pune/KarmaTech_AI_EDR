using Microsoft.EntityFrameworkCore;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using NJS.Domain.Repositories;
using NJS.Repositories.Repositories;
using System;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace NJS.API.Tests.Repositories
{
    public class ProjectRepositoryTests
    {
        private readonly DbContextOptions<ProjectManagementContext> _options;

        public ProjectRepositoryTests()
        {
            // Create a fresh in-memory database for each test
            _options = new DbContextOptionsBuilder<ProjectManagementContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
        }

        [Fact]
        public async Task GetAllAsync_ShouldReturnAllProjects()
        {
            // Arrange
            using var context = new ProjectManagementContext(_options);
            var repository = new ProjectRepository(context);
            
            // Add test data
            await context.Projects.AddRangeAsync(
                new Project { Id = 1, Name = "Project 1" },
                new Project { Id = 2, Name = "Project 2" },
                new Project { Id = 3, Name = "Project 3" }
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
        public async Task GetByIdAsync_WithValidId_ShouldReturnProject()
        {
            // Arrange
            using var context = new ProjectManagementContext(_options);
            var repository = new ProjectRepository(context);
            
            // Add test data
            var project = new Project { Id = 1, Name = "Test Project" };
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
            var repository = new ProjectRepository(context);

            // Act
            var result = await repository.GetByIdAsync(999);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task AddAsync_ShouldAddProjectToDatabase()
        {
            // Arrange
            using var context = new ProjectManagementContext(_options);
            var repository = new ProjectRepository(context);
            var project = new Project
            {
                Name = "New Project",
                Description = "Description",
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
            Assert.Equal("New Project", savedProject.Name);
        }

        [Fact]
        public async Task UpdateAsync_ShouldUpdateProjectInDatabase()
        {
            // Arrange
            using var context = new ProjectManagementContext(_options);
            var repository = new ProjectRepository(context);
            
            // Add test data
            var project = new Project { Id = 1, Name = "Original Name" };
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
        public async Task DeleteAsync_ShouldRemoveProjectFromDatabase()
        {
            // Arrange
            using var context = new ProjectManagementContext(_options);
            var repository = new ProjectRepository(context);
            
            // Add test data
            var project = new Project { Id = 1, Name = "Project to Delete" };
            await context.Projects.AddAsync(project);
            await context.SaveChangesAsync();
            
            // Verify project exists
            Assert.NotNull(await context.Projects.FindAsync(project.Id));

            // Act
            await repository.DeleteAsync(project.Id);
            await context.SaveChangesAsync();

            // Assert
            Assert.Null(await context.Projects.FindAsync(project.Id));
        }

        [Fact]
        public async Task GetByNameAsync_WithValidName_ShouldReturnProject()
        {
            // Arrange
            using var context = new ProjectManagementContext(_options);
            var repository = new ProjectRepository(context);
            
            // Add test data
            var projectName = "Unique Project Name";
            await context.Projects.AddRangeAsync(
                new Project { Id = 1, Name = projectName },
                new Project { Id = 2, Name = "Other Project" }
            );
            await context.SaveChangesAsync();

            // Act
            var result = await repository.GetByNameAsync(projectName);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(projectName, result.Name);
        }

        [Fact]
        public async Task GetByNameAsync_WithInvalidName_ShouldReturnNull()
        {
            // Arrange
            using var context = new ProjectManagementContext(_options);
            var repository = new ProjectRepository(context);
            
            // Add test data
            await context.Projects.AddAsync(new Project { Id = 1, Name = "Existing Project" });
            await context.SaveChangesAsync();

            // Act
            var result = await repository.GetByNameAsync("Nonexistent Project");

            // Assert
            Assert.Null(result);
        }
    }
}
