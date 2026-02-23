// File: backend/NJS.Domain.Tests/RepositoryTests.cs

using Microsoft.EntityFrameworkCore;
using Moq;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using NJS.Domain.GenericRepository;
using NJS.Domain.Services;

namespace NJS.Domain.Tests
{
    public class RepositoryTests
    {
        private DbContextOptions<ProjectManagementContext> _options;
        public RepositoryTests()
        {
            // Set up in-memory database options
            _options = new DbContextOptionsBuilder<ProjectManagementContext>()
                .UseInMemoryDatabase(databaseName: "TestDatabase")
                .Options;
        }

        [Fact]
        public async Task Add_Should_AddEntity()
        {
            // Arrange
            var currentTenantService = new Mock<ICurrentTenantService>();
            using var context = new ProjectManagementContext(_options,currentTenantService.Object);
            var repository = new Repository<Project>(context);

            var project = new Project
            {
                Name = "City Water Supply Upgrade",
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

            // Act
            await repository.AddAsync(project).ConfigureAwait(true);
            await repository.SaveChangesAsync().ConfigureAwait(true);

            // Assert
            var projects = await context.Projects.ToListAsync().ConfigureAwait(true);
            Assert.Equal("Metropolis Municipality", projects[0].ClientName);

        }

        [Fact]
        public async void GetAll_ShouldReturn_AllEntities()
        {
            // Arrange
            var currentTenantService = new Mock<ICurrentTenantService>();
            using var context = new ProjectManagementContext(_options,currentTenantService.Object);
            context.Projects.Add(new Project
            {
                Name = "City Water Supply Upgrade",
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
            });
            context.Projects.Add(new Project
            {
                Name = "City Water Supply Upgrade1",
                ClientName = "Metropolis Municipality1",
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
            });
            context.SaveChanges();

            var repository = new Repository<Project>(context);

            // Act
            var authors = await repository.GetAllAsync().ConfigureAwait(true);

            // Assert

            Assert.True(authors.ToList().Count > 0);
        }

        [Fact]
        public async void GetById_ShouldReturn_Entity()
        {
            // Arrange
            var currentTenantService = new Mock<ICurrentTenantService>();
            using var context = new ProjectManagementContext(_options,currentTenantService.Object);

            var project = new Project
            {
                Id = 10,
                Name = "City Water Supply Upgrade",
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
            await context.Projects.AddAsync(project).ConfigureAwait(true);
            await context.SaveChangesAsync().ConfigureAwait(true);

            var repository = new Repository<Project>(context);

            // Act
            var result = await repository.GetByIdAsync(project.Id).ConfigureAwait(true);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Metropolis Municipality", result.ClientName);
        }

        [Fact]
        public async void Remove_Should_DeleteEntity()
        {
            // Arrange
            var currentTenantService = new Mock<ICurrentTenantService>();
            using var context = new ProjectManagementContext(_options,currentTenantService.Object);
            var project = new Project
            {
                Id = 11,
                Name = "City Water Supply Upgrade",
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
            await context.SaveChangesAsync().ConfigureAwait(true);

            var repository = new Repository<Project>(context);

            // Act
            await repository.RemoveAsync(project).ConfigureAwait(true);
            // await repository.SaveChangesAsync();

            // Assert
            Project? projects =  await repository.GetByIdAsync(project.Id).ConfigureAwait(true);
            Assert.Null(projects);
        }

        [Fact]
        public void Query_Should_AllEntities()
        {
            // Arrange
            var currentTenantService = new Mock<ICurrentTenantService>();
            using var context = new ProjectManagementContext(_options,currentTenantService.Object);
            context.Projects.Add(new Project
            {
                Name = "City Water Supply Upgrade",
                ClientName = "Metropolis Municipality",
                EstimatedProjectCost = 5000000,
                StartDate = new DateTime(2023, 1, 1),
                EndDate = new DateTime(2024, 12, 31),
                Status = ProjectStatus.InProgress,
                Progress = 65,
                TypeOfClient = "ClientSector",
                ContractType= "ContractType",
                CreatedBy="Test",
                Currency="INR",
                Sector="Tet"
            });
            context.Projects.Add(new Project
            {
                Name = "City Water Supply Upgrade1",
                ClientName = "Metropolis Municipality1",
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
            });
            context.SaveChanges();

            var repository = new Repository<Project>(context);

            // Act
            var result = repository.Query().ToList();

            // Assert
            Assert.Equal(2, result.Count);
            Assert.Contains(result, a => a.ClientName == "Metropolis Municipality" && a.Name == "City Water Supply Upgrade");
            Assert.Contains(result, a => a.ClientName == "Metropolis Municipality1" && a.Name == "City Water Supply Upgrade1");
        }

        [Fact]
        public void Query_Should_FilteredEntities()
        {
            // Arrange
            var currentTenantService = new Mock<ICurrentTenantService>();
            using var context = new ProjectManagementContext(_options,currentTenantService.Object);
            context.Projects.Add(new Project
            {
                Name = "City Water Supply Upgrade",
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
            });
            context.Projects.Add(new Project
            {
                Name = "City Water Supply Upgrade1",
                ClientName = "Metropolis Municipality1",
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
            });
            context.SaveChanges();

            var repository = new Repository<Project>(context);

            // Act
            var result = repository.Query().Where(a => a.Name.StartsWith("City")).ToList();

            // Assert
            Assert.Equal("City Water Supply Upgrade", result[0].Name);
        }

    }
}
