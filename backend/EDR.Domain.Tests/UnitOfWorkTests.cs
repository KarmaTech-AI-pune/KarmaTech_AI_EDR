//backend/EDR.Domain.Tests/UnitOfWorkTests.cs
using Microsoft.EntityFrameworkCore;
using Moq;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.Domain.GenericRepository;
using EDR.Domain.Services;
using EDR.Domain.UnitWork;
using Microsoft.Extensions.Configuration;

namespace EDR.Domain.Tests
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
            var currentTenantService = new Mock<ICurrentTenantService>();
            await using var context = new ProjectManagementContext(_options, currentTenantService.Object, Mock.Of<IConfiguration>());
            var unitOfWork = new UnitOfWork(context);

            var project = new Project
            {
                Name = "Test Project",
                ClientName = "Metropolis Municipality",
                EstimatedProjectCost = 5000000,
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
            var currentTenantService = new Mock<ICurrentTenantService>();
            using var context = new ProjectManagementContext(_options, currentTenantService.Object, Mock.Of<IConfiguration>());
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
            var currentTenantService = new Mock<ICurrentTenantService>();
            using var context = new ProjectManagementContext(_options, currentTenantService.Object, Mock.Of<IConfiguration>());
            var unitOfWork = new UnitOfWork(context);

            // Act
            unitOfWork.Dispose();

            // Assert
            Assert.Throws<ObjectDisposedException>(() => context.Projects.ToList());
        }
    }
}

