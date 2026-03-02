using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Moq;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.Domain.Services;
using EDR.Repositories.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace EDR.API.Tests.Repositories
{
    public class JobStartFormRepositoryTests
    {
        private readonly DbContextOptions<ProjectManagementContext> _options;
        private readonly Mock<ICurrentTenantService> _currentTenantServiceMock;
        private readonly Mock<IConfiguration> _configurationMock;

        public JobStartFormRepositoryTests()
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
        public async Task GetAllAsync_ShouldReturnAllJobStartForms()
        {
            // Arrange
            using var context = GetContext();
            var repository = new JobStartFormRepository(context);
            
            await context.JobStartForms.AddRangeAsync(
                new JobStartForm { FormId = 1, FormTitle = "Form 1", ProjectId = 1 },
                new JobStartForm { FormId = 2, FormTitle = "Form 2", ProjectId = 1 }
            );
            await context.SaveChangesAsync();

            // Act
            var results = await repository.GetAllAsync();

            // Assert
            Assert.Equal(2, results.Count());
        }

        [Fact]
        public async Task GetByIdAsync_ShouldReturnCorrectForm()
        {
            // Arrange
            using var context = GetContext();
            var repository = new JobStartFormRepository(context);
            
            var form = new JobStartForm { FormId = 1, FormTitle = "Test Form", ProjectId = 1 };
            await context.JobStartForms.AddAsync(form);
            await context.SaveChangesAsync();

            // Act
            var result = await repository.GetByIdAsync(1);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Test Form", result.FormTitle);
        }

        [Fact]
        public async Task GetAllByProjectIdAsync_ShouldReturnFormsForProject()
        {
            // Arrange
            using var context = GetContext();
            var repository = new JobStartFormRepository(context);
            
            await context.JobStartForms.AddRangeAsync(
                new JobStartForm { FormId = 1, FormTitle = "Project 1 Form", ProjectId = 1 },
                new JobStartForm { FormId = 2, FormTitle = "Project 2 Form", ProjectId = 2 }
            );
            await context.SaveChangesAsync();

            // Act
            var results = await repository.GetAllByProjectIdAsync(1);

            // Assert
            Assert.Single(results);
            Assert.Equal("Project 1 Form", results.First().FormTitle);
        }

        [Fact]
        public async Task AddAsync_ShouldAddForm()
        {
            // Arrange
            using var context = GetContext();
            var repository = new JobStartFormRepository(context);
            var form = new JobStartForm { FormTitle = "New Form", ProjectId = 1 };

            // Act
            await repository.AddAsync(form);
            await context.SaveChangesAsync();

            // Assert
            Assert.Equal(1, await context.JobStartForms.CountAsync());
        }

        [Fact]
        public async Task UpdateAsync_ShouldUpdateForm()
        {
            // Arrange
            using var context = GetContext();
            var repository = new JobStartFormRepository(context);
            
            var form = new JobStartForm { FormId = 1, FormTitle = "Original Title", ProjectId = 1 };
            await context.JobStartForms.AddAsync(form);
            await context.SaveChangesAsync();

            // Act
            form.FormTitle = "Updated Title";
            await repository.UpdateAsync(form);
            await context.SaveChangesAsync();

            // Assert
            var result = await context.JobStartForms.FindAsync(1);
            Assert.Equal("Updated Title", result.FormTitle);
        }

        [Fact]
        public async Task DeleteAsync_ShouldSoftDeleteForm()
        {
            // Arrange
            using var context = GetContext();
            var repository = new JobStartFormRepository(context);
            
            var form = new JobStartForm { FormId = 1, FormTitle = "To Delete", ProjectId = 1 };
            await context.JobStartForms.AddAsync(form);
            await context.SaveChangesAsync();

            // Act
            await repository.DeleteAsync(form);
            await context.SaveChangesAsync();

            // Assert
            var result = await context.JobStartForms.FindAsync(1);
            Assert.True(result.IsDeleted);
        }
    }
}
