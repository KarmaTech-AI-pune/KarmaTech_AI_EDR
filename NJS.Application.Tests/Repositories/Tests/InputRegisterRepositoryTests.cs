using Microsoft.EntityFrameworkCore;
using NJS.Application.Tests.Repositories;
using NJS.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace NJS.Application.Tests.Repositories.Tests
{
    public class InputRegisterRepositoryTests
    {
        private ApplicationDbContext CreateContext()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            var context = new ApplicationDbContext(options);
            context.Database.EnsureCreated();
            return context;
        }

        private async Task<ApplicationDbContext> SeedDataAsync()
        {
            var context = CreateContext();
            var inputRegisters = new List<InputRegister>
            {
                new InputRegister
                {
                    ProjectId = 1,
                    DataReceived = "Test Data 1",
                    ReceiptDate = DateTime.Now.AddDays(-5),
                    ReceivedFrom = "Test User 1",
                    FilesFormat = "PDF",
                    NoOfFiles = 1,
                    FitForPurpose = true,
                    Check = true,
                    CreatedAt = DateTime.UtcNow.AddDays(-5),
                    CreatedBy = "Test Creator"
                },
                new InputRegister
                {
                    ProjectId = 1,
                    DataReceived = "Test Data 2",
                    ReceiptDate = DateTime.Now.AddDays(-4),
                    ReceivedFrom = "Test User 2",
                    FilesFormat = "DOCX",
                    NoOfFiles = 2,
                    FitForPurpose = false,
                    Check = false,
                    CreatedAt = DateTime.UtcNow.AddDays(-4),
                    CreatedBy = "Test Creator"
                },
                new InputRegister
                {
                    ProjectId = 2,
                    DataReceived = "Test Data 3",
                    ReceiptDate = DateTime.Now.AddDays(-3),
                    ReceivedFrom = "Test User 3",
                    FilesFormat = "XLS",
                    NoOfFiles = 3,
                    FitForPurpose = true,
                    Check = true,
                    CreatedAt = DateTime.UtcNow.AddDays(-3),
                    CreatedBy = "Test Creator"
                }
            };

            await context.InputRegisters.AddRangeAsync(inputRegisters);
            await context.SaveChangesAsync();
            return context;
        }

        [Fact]
        public async Task GetAllAsync_ReturnsAllInputRegisters()
        {
            // Arrange
            var context = await SeedDataAsync();
            var repository = new InputRegisterRepository(context);

            // Act
            var result = await repository.GetAllAsync();

            // Assert
            var inputRegisters = result.ToList();
            Assert.Equal(3, inputRegisters.Count);
            Assert.Contains(inputRegisters, ir => ir.DataReceived == "Test Data 1");
            Assert.Contains(inputRegisters, ir => ir.DataReceived == "Test Data 2");
            Assert.Contains(inputRegisters, ir => ir.DataReceived == "Test Data 3");
        }

        [Fact]
        public async Task GetByIdAsync_ExistingId_ReturnsInputRegister()
        {
            // Arrange
            var context = await SeedDataAsync();
            var repository = new InputRegisterRepository(context);
            var expectedId = 1;

            // Act
            var result = await repository.GetByIdAsync(expectedId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(expectedId, result.Id);
            Assert.Equal("Test Data 1", result.DataReceived);
        }

        [Fact]
        public async Task GetByIdAsync_NonExistingId_ReturnsNull()
        {
            // Arrange
            var context = await SeedDataAsync();
            var repository = new InputRegisterRepository(context);
            var nonExistingId = 999;

            // Act
            var result = await repository.GetByIdAsync(nonExistingId);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task GetByProjectIdAsync_ExistingProjectId_ReturnsInputRegisters()
        {
            // Arrange
            var context = await SeedDataAsync();
            var repository = new InputRegisterRepository(context);
            var projectId = 1;

            // Act
            var result = await repository.GetByProjectIdAsync(projectId);

            // Assert
            var inputRegisters = result.ToList();
            Assert.Equal(2, inputRegisters.Count);
            Assert.All(inputRegisters, ir => Assert.Equal(projectId, ir.ProjectId));
            Assert.Contains(inputRegisters, ir => ir.DataReceived == "Test Data 1");
            Assert.Contains(inputRegisters, ir => ir.DataReceived == "Test Data 2");
        }

        [Fact]
        public async Task GetByProjectIdAsync_NonExistingProjectId_ReturnsEmptyList()
        {
            // Arrange
            var context = await SeedDataAsync();
            var repository = new InputRegisterRepository(context);
            var nonExistingProjectId = 999;

            // Act
            var result = await repository.GetByProjectIdAsync(nonExistingProjectId);

            // Assert
            Assert.Empty(result);
        }

        [Fact]
        public async Task AddAsync_ValidInputRegister_AddsToDatabase()
        {
            // Arrange
            var context = CreateContext();
            var repository = new InputRegisterRepository(context);
            var inputRegister = new InputRegister
            {
                ProjectId = 3,
                DataReceived = "New Test Data",
                ReceiptDate = DateTime.Now,
                ReceivedFrom = "New Test User",
                FilesFormat = "PDF",
                NoOfFiles = 1,
                FitForPurpose = true,
                Check = true,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "Test Creator"
            };

            // Act
            var id = await repository.AddAsync(inputRegister);

            // Assert
            Assert.True(id > 0);
            var addedInputRegister = await context.InputRegisters.FindAsync(id);
            Assert.NotNull(addedInputRegister);
            Assert.Equal("New Test Data", addedInputRegister.DataReceived);
            Assert.Equal(3, addedInputRegister.ProjectId);
        }

        [Fact]
        public async Task AddAsync_NullInputRegister_ThrowsArgumentNullException()
        {
            // Arrange
            var context = CreateContext();
            var repository = new InputRegisterRepository(context);

            // Act & Assert
            await Assert.ThrowsAsync<ArgumentNullException>(() => repository.AddAsync(null));
        }

        [Fact]
        public async Task UpdateAsync_ExistingInputRegister_UpdatesInDatabase()
        {
            // Arrange
            var context = await SeedDataAsync();
            var repository = new InputRegisterRepository(context);
            var inputRegister = await context.InputRegisters.FindAsync(1);
            inputRegister.DataReceived = "Updated Test Data";
            inputRegister.ReceivedFrom = "Updated Test User";
            inputRegister.UpdatedAt = DateTime.UtcNow;
            inputRegister.UpdatedBy = "Test Updater";

            // Act
            await repository.UpdateAsync(inputRegister);

            // Assert
            var updatedInputRegister = await context.InputRegisters.FindAsync(1);
            Assert.NotNull(updatedInputRegister);
            Assert.Equal("Updated Test Data", updatedInputRegister.DataReceived);
            Assert.Equal("Updated Test User", updatedInputRegister.ReceivedFrom);
            Assert.Equal("Test Updater", updatedInputRegister.UpdatedBy);
            Assert.NotNull(updatedInputRegister.UpdatedAt);
        }

        [Fact]
        public async Task UpdateAsync_NullInputRegister_ThrowsArgumentNullException()
        {
            // Arrange
            var context = CreateContext();
            var repository = new InputRegisterRepository(context);

            // Act & Assert
            await Assert.ThrowsAsync<ArgumentNullException>(() => repository.UpdateAsync(null));
        }

        [Fact]
        public async Task DeleteAsync_ExistingId_RemovesFromDatabase()
        {
            // Arrange
            var context = await SeedDataAsync();
            var repository = new InputRegisterRepository(context);
            var id = 1;

            // Act
            await repository.DeleteAsync(id);

            // Assert
            var deletedInputRegister = await context.InputRegisters.FindAsync(id);
            Assert.Null(deletedInputRegister);
            Assert.Equal(2, await context.InputRegisters.CountAsync());
        }

        [Fact]
        public async Task DeleteAsync_NonExistingId_DoesNothing()
        {
            // Arrange
            var context = await SeedDataAsync();
            var repository = new InputRegisterRepository(context);
            var nonExistingId = 999;
            var initialCount = await context.InputRegisters.CountAsync();

            // Act
            await repository.DeleteAsync(nonExistingId);

            // Assert
            Assert.Equal(initialCount, await context.InputRegisters.CountAsync());
        }

        [Fact]
        public async Task ExistsAsync_ExistingId_ReturnsTrue()
        {
            // Arrange
            var context = await SeedDataAsync();
            var repository = new InputRegisterRepository(context);
            var id = 1;

            // Act
            var result = await repository.ExistsAsync(id);

            // Assert
            Assert.True(result);
        }

        [Fact]
        public async Task ExistsAsync_NonExistingId_ReturnsFalse()
        {
            // Arrange
            var context = await SeedDataAsync();
            var repository = new InputRegisterRepository(context);
            var nonExistingId = 999;

            // Act
            var result = await repository.ExistsAsync(nonExistingId);

            // Assert
            Assert.False(result);
        }

        [Fact]
        public async Task ResetIdentitySeedAsync_EmptyDatabase_DoesNotThrowException()
        {
            // Arrange
            var context = CreateContext();
            var repository = new InputRegisterRepository(context);

            // Act & Assert
            await repository.ResetIdentitySeedAsync();
            // No exception means the test passes
        }

        [Fact]
        public async Task ResetIdentitySeedAsync_WithData_DoesNotThrowException()
        {
            // Arrange
            var context = await SeedDataAsync();
            var repository = new InputRegisterRepository(context);

            // Act & Assert
            await repository.ResetIdentitySeedAsync();
            // No exception means the test passes
        }
    }
}
