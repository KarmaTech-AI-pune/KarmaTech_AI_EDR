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
        private DbContextOptions<ProjectManagementContext> GetInMemoryDbOptions()
        {
            // Use a unique database name for each test to avoid interference
            return new DbContextOptionsBuilder<ProjectManagementContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
        }

        [Fact]
        public async Task Add_Should_AddEntity()
        {
            // Arrange
            var currentTenantService = new Mock<ICurrentTenantService>();
            currentTenantService.Setup(x => x.TenantId).Returns(1); // Set tenant ID
            using var context = new ProjectManagementContext(GetInMemoryDbOptions(), currentTenantService.Object);
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
                Sector = "Tet",
                TenantId = 1 // Explicitly set TenantId for test
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
            currentTenantService.Setup(x => x.TenantId).Returns(1); // Set tenant ID
            using var context = new ProjectManagementContext(GetInMemoryDbOptions(), currentTenantService.Object);
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
                Sector = "Tet",
                TenantId = 1 // Explicitly set TenantId for test
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
                Sector = "Tet",
                TenantId = 1 // Explicitly set TenantId for test
            });
            context.SaveChanges();

            var repository = new Repository<Project>(context);

            // Act
            var authors = await repository.GetAllAsync().ConfigureAwait(true);
            
            // Debug: Check what's actually in the database
            var allProjectsIgnoringFilters = await context.Projects.IgnoreQueryFilters().ToListAsync();
            var projectsWithTenantFilter = await context.Projects.ToListAsync();

            // Assert
            Assert.True(authors.ToList().Count > 0, 
                $"Expected projects but got 0. " +
                $"Total projects ignoring filters: {allProjectsIgnoringFilters.Count}, " +
                $"Projects with tenant filter: {projectsWithTenantFilter.Count}, " +
                $"Context TenantId: {context.TenantId}");
        }

        [Fact]
        public async void GetById_ShouldReturn_Entity()
        {
            // Arrange
            var currentTenantService = new Mock<ICurrentTenantService>();
            currentTenantService.Setup(x => x.TenantId).Returns(1); // Set tenant ID
            using var context = new ProjectManagementContext(GetInMemoryDbOptions(),currentTenantService.Object);

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
                Sector = "Tet",
                TenantId = 1 // Explicitly set TenantId for test
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
            currentTenantService.Setup(x => x.TenantId).Returns(1); // Set tenant ID
            using var context = new ProjectManagementContext(GetInMemoryDbOptions(),currentTenantService.Object);
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
                Sector = "Tet",
                TenantId = 1 // Explicitly set TenantId for test
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
            currentTenantService.Setup(x => x.TenantId).Returns(1); // Set tenant ID
            using var context = new ProjectManagementContext(GetInMemoryDbOptions(),currentTenantService.Object);
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
                Sector="Tet",
                TenantId = 1 // Explicitly set TenantId for test
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
                Sector = "Tet",
                TenantId = 1 // Explicitly set TenantId for test
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
            currentTenantService.Setup(x => x.TenantId).Returns(1); // Set tenant ID
            using var context = new ProjectManagementContext(GetInMemoryDbOptions(),currentTenantService.Object);
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
                Sector = "Tet",
                TenantId = 1 // Explicitly set TenantId for test
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
                Sector = "Tet",
                TenantId = 1 // Explicitly set TenantId for test
            });
            context.SaveChanges();

            var repository = new Repository<Project>(context);

            // Act
            var result = repository.Query().Where(a => a.Name.StartsWith("City")).ToList();

            // Assert
            Assert.True(result.Count > 0, "Expected at least one project but got none");
            if (result.Count > 0)
            {
                Assert.Equal("City Water Supply Upgrade", result[0].Name);
            }
        }

    }
}
