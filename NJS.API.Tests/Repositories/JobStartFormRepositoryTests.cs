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
    public class JobStartFormRepositoryTests
    {
        private readonly DbContextOptions<ProjectManagementContext> _options;

        public JobStartFormRepositoryTests()
        {
            // Create a fresh in-memory database for each test
            _options = new DbContextOptionsBuilder<ProjectManagementContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
        }

        [Fact]
        public async Task GetAllAsync_ShouldReturnAllForms()
        {
            // Arrange
            using var context = new ProjectManagementContext(_options);
            var repository = new JobStartFormRepository(context);
            
            // Add test data
            await context.JobStartForms.AddRangeAsync(
                new JobStartForm { FormId = 1, ProjectId = 1, FormTitle = "Form 1" },
                new JobStartForm { FormId = 2, ProjectId = 1, FormTitle = "Form 2" },
                new JobStartForm { FormId = 3, ProjectId = 2, FormTitle = "Form 3" }
            );
            await context.SaveChangesAsync();

            // Act
            var forms = await repository.GetAllAsync();

            // Assert
            Assert.Equal(3, forms.Count());
            Assert.Contains(forms, f => f.FormTitle == "Form 1");
            Assert.Contains(forms, f => f.FormTitle == "Form 2");
            Assert.Contains(forms, f => f.FormTitle == "Form 3");
        }

        [Fact]
        public async Task GetByIdAsync_WithValidId_ShouldReturnForm()
        {
            // Arrange
            using var context = new ProjectManagementContext(_options);
            var repository = new JobStartFormRepository(context);
            
            // Add test data
            var form = new JobStartForm { FormId = 1, ProjectId = 1, FormTitle = "Test Form" };
            await context.JobStartForms.AddAsync(form);
            await context.SaveChangesAsync();

            // Act
            var result = await repository.GetByIdAsync(form.FormId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(form.FormId, result.FormId);
            Assert.Equal("Test Form", result.FormTitle);
        }

        [Fact]
        public async Task GetByIdAsync_WithInvalidId_ShouldReturnNull()
        {
            // Arrange
            using var context = new ProjectManagementContext(_options);
            var repository = new JobStartFormRepository(context);

            // Act
            var result = await repository.GetByIdAsync(999);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task GetByProjectIdAsync_ShouldReturnFormsForProject()
        {
            // Arrange
            using var context = new ProjectManagementContext(_options);
            var repository = new JobStartFormRepository(context);
            
            // Add test data
            var projectId = 1;
            await context.JobStartForms.AddRangeAsync(
                new JobStartForm { FormId = 1, ProjectId = projectId, FormTitle = "Form 1" },
                new JobStartForm { FormId = 2, ProjectId = projectId, FormTitle = "Form 2" },
                new JobStartForm { FormId = 3, ProjectId = 2, FormTitle = "Form 3" } // Different project
            );
            await context.SaveChangesAsync();

            // Act
            var forms = await repository.GetByProjectIdAsync(projectId);

            // Assert
            Assert.Equal(2, forms.Count());
            Assert.All(forms, f => Assert.Equal(projectId, f.ProjectId));
            Assert.Contains(forms, f => f.FormTitle == "Form 1");
            Assert.Contains(forms, f => f.FormTitle == "Form 2");
        }

        [Fact]
        public async Task AddAsync_ShouldAddFormToDatabase()
        {
            // Arrange
            using var context = new ProjectManagementContext(_options);
            var repository = new JobStartFormRepository(context);
            var form = new JobStartForm
            {
                ProjectId = 1,
                FormTitle = "New Form",
                Description = "Description",
                StartDate = DateTime.Now,
                PreparedBy = "User1"
            };

            // Act
            await repository.AddAsync(form);
            await context.SaveChangesAsync();

            // Assert
            Assert.NotEqual(0, form.FormId); // ID should be set
            var savedForm = await context.JobStartForms.FindAsync(form.FormId);
            Assert.NotNull(savedForm);
            Assert.Equal("New Form", savedForm.FormTitle);
        }

        [Fact]
        public async Task Update_ShouldUpdateFormInDatabase()
        {
            // Arrange
            using var context = new ProjectManagementContext(_options);
            var repository = new JobStartFormRepository(context);
            
            // Add test data
            var form = new JobStartForm { FormId = 1, ProjectId = 1, FormTitle = "Original Title" };
            await context.JobStartForms.AddAsync(form);
            await context.SaveChangesAsync();

            // Act
            form.FormTitle = "Updated Title";
            repository.Update(form);
            await context.SaveChangesAsync();

            // Assert
            var updatedForm = await context.JobStartForms.FindAsync(form.FormId);
            Assert.NotNull(updatedForm);
            Assert.Equal("Updated Title", updatedForm.FormTitle);
        }

        [Fact]
        public async Task DeleteAsync_ShouldRemoveFormFromDatabase()
        {
            // Arrange
            using var context = new ProjectManagementContext(_options);
            var repository = new JobStartFormRepository(context);
            
            // Add test data
            var form = new JobStartForm { FormId = 1, ProjectId = 1, FormTitle = "Form to Delete" };
            await context.JobStartForms.AddAsync(form);
            await context.SaveChangesAsync();
            
            // Verify form exists
            Assert.NotNull(await context.JobStartForms.FindAsync(form.FormId));

            // Act
            await repository.DeleteAsync(form.FormId);
            await context.SaveChangesAsync();

            // Assert
            Assert.Null(await context.JobStartForms.FindAsync(form.FormId));
        }
    }
}
