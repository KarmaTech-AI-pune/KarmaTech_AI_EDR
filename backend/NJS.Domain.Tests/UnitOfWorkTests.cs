//backend/NJS.Domain.Tests/UnitOfWorkTests.cs
using Microsoft.EntityFrameworkCore;
using Moq;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using NJS.Domain.GenericRepository;
using NJS.Domain.UnitWork;

namespace NJS.Domain.Tests
{
    public class UnitOfWorkTests
    {
        private DbContextOptions<ProjectManagementContext> _options;

        public UnitOfWorkTests()
        {
            _options = new DbContextOptionsBuilder<ProjectManagementContext>()
                .UseInMemoryDatabase(databaseName: "TestDatabase")
                .EnableSensitiveDataLogging()
                .Options;
        }

        [Fact]
        public async Task SaveChangesAsync_ShouldSaveChanges()
        {
            // Arrange
            using var context = new ProjectManagementContext(_options);
            var unitOfWork = new UnitOfWork(context);

            var project = new Project
            {
                Name = "Test Project",
                ClientName = "Metropolis Municipality",
                StartDate = new DateTime(2023, 1, 1),
                EndDate = new DateTime(2024, 12, 31),
                Status = ProjectStatus.InProgress,
                Progress = 65,
                TypeOfClient = "ClientSector",
                ContractType = "ContractType",
                CreatedBy = "Test",
                Currency = "INR",
                Sector = "Tet"
            };
            context.Projects.Add(project);

            // Act
            int result = await unitOfWork.SaveChangesAsync();

            // Assert
            Assert.Equal(1, result);
            Assert.Single(context.Projects);
        }

        [Fact]
        public void GetRepository_ShouldReturnRepository()
        {
            // Arrange
            using var context = new ProjectManagementContext(_options);
            var unitOfWork = new UnitOfWork(context);

            // Act
            var repository = unitOfWork.GetRepository<Project>();

            // Assert
            Assert.NotNull(repository);
            Assert.IsType<Repository<Project>>(repository);
        }

        [Fact]
        public void Dispose_ShouldDisposeContext()
        {
            // Arrange
            using var context = new ProjectManagementContext(_options);
            var unitOfWork = new UnitOfWork(context);

            // Act
            unitOfWork.Dispose();

            // Assert
            Assert.Throws<ObjectDisposedException>(() => context.Projects.ToList());
        }
    }
}
