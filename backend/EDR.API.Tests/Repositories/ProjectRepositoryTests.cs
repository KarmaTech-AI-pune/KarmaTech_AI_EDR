using Moq;
using EDR.Domain.Entities;
using EDR.Repositories.Interfaces;
using EDR.Repositories.Repositories;
using EDR.Domain.GenericRepository;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;
using System;
using Microsoft.EntityFrameworkCore;
using EDR.Domain.Database;
using EDR.Domain.Services;
using Microsoft.Extensions.Configuration;

namespace EDR.API.Tests.Repositories
{
    public class ProjectRepositoryTests
    {
        private readonly ProjectManagementContext _dbContext;
        private readonly ProjectRepository _projectRepository;
        private readonly Mock<ILogger<ProjectRepository>> _loggerMock;

        public ProjectRepositoryTests()
        {
            var options = new DbContextOptionsBuilder<ProjectManagementContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            var tenantServiceMock = new Mock<ICurrentTenantService>();
            var configMock = new Mock<IConfiguration>();
            _dbContext = new ProjectManagementContext(options, tenantServiceMock.Object, configMock.Object);

            var repository = new Repository<Project>(_dbContext);
            var goNoGoDecisionRepositoryMock = new Mock<IGoNoGoDecisionRepository>();
            _loggerMock = new Mock<ILogger<ProjectRepository>>();

            _projectRepository = new ProjectRepository(
                repository,
                goNoGoDecisionRepositoryMock.Object,
                _loggerMock.Object);
        }

        [Fact]
        public async Task GetAll_ShouldReturnAllProjects()
        {
            // Arrange
            _dbContext.Projects.AddRange(new List<Project>
            {
                new Project { Id = 1, Name = "Project 1", TenantId = 1, ClientName = "Client", Sector = "IT", Currency = "USD" },
                new Project { Id = 2, Name = "Project 2", TenantId = 1, ClientName = "Client", Sector = "IT", Currency = "USD" }
            });
            await _dbContext.SaveChangesAsync();

            // Act
            var result = await _projectRepository.GetAll();

            // Assert
            Assert.Equal(2, result.Count());
        }

        [Fact]
        public async Task GetById_WithValidId_ShouldReturnProject()
        {
            // Arrange
            var project = new Project { Id = 1, Name = "Test Project", TenantId = 1, ClientName = "Client", Sector = "IT", Currency = "USD" };
            _dbContext.Projects.Add(project);
            await _dbContext.SaveChangesAsync();

            // Act
            var result = _projectRepository.GetById(1);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(1, result.Id);
        }

        [Fact]
        public async Task Add_ShouldAddProjectAndSave()
        {
            // Arrange
            var project = new Project { Id = 3, Name = "New Project", TenantId = 1, ClientName = "Client", Sector = "IT", Currency = "USD" };

            // Act
            await _projectRepository.Add(project);

            // Assert
            var added = await _dbContext.Projects.FindAsync(3);
            Assert.NotNull(added);
            Assert.Equal("New Project", added.Name);
        }

        [Fact]
        public async Task Update_ShouldCallUpdateAndSave()
        {
            // Arrange
            var project = new Project { Id = 4, Name = "Initial Project", TenantId = 1, ClientName = "Client", Sector = "IT", Currency = "USD" };
            _dbContext.Projects.Add(project);
            await _dbContext.SaveChangesAsync();

            project.Name = "Updated Project";

            // Act
            _projectRepository.Update(project);

            // Assert
            var updated = await _dbContext.Projects.FindAsync(4);
            Assert.Equal("Updated Project", updated.Name);
        }

        [Fact]
        public async Task Delete_ShouldCallRemoveAndSave_WhenProjectExists()
        {
            // Arrange
            var project = new Project { Id = 5, TenantId = 1, Name = "P5", ClientName = "Client", Sector = "IT", Currency = "USD" };
            _dbContext.Projects.Add(project);
            await _dbContext.SaveChangesAsync();

            // Act
            _projectRepository.Delete(5);

            // Assert
            var deleted = await _dbContext.Projects.FindAsync(5);
            Assert.Null(deleted);
        }

        [Fact]
        public async Task GetAllByProgramId_ShouldReturnFilteredProjects()
        {
            // Arrange
            var programId = 10;
            _dbContext.Projects.AddRange(new List<Project>
            {
                new Project { Id = 11, ProgramId = programId, TenantId = 1, Name = "P11", ClientName = "Client", Sector = "IT", Currency = "USD" },
                new Project { Id = 12, ProgramId = programId, TenantId = 1, Name = "P12", ClientName = "Client", Sector = "IT", Currency = "USD" },
                new Project { Id = 13, ProgramId = 20, TenantId = 1, Name = "P13", ClientName = "Client", Sector = "IT", Currency = "USD" }
            });
            await _dbContext.SaveChangesAsync();

            // Act
            var result = await _projectRepository.GetAllByProgramId(programId);

            // Assert
            Assert.Equal(2, result.Count());
            Assert.All(result, p => Assert.Equal(programId, p.ProgramId));
        }

        [Fact]
        public async Task GetAllByUserId_ShouldReturnUserProjects()
        {
            // Arrange
            var userId = "user1";
            _dbContext.Projects.AddRange(new List<Project>
            {
                new Project { Id = 21, ProjectManagerId = userId, TenantId = 1, Name = "P21", ClientName = "Client", Sector = "IT", Currency = "USD" },
                new Project { Id = 22, SeniorProjectManagerId = userId, TenantId = 1, Name = "P22", ClientName = "Client", Sector = "IT", Currency = "USD" },
                new Project { Id = 23, RegionalManagerId = userId, TenantId = 1, Name = "P23", ClientName = "Client", Sector = "IT", Currency = "USD" },
                new Project { Id = 24, ProjectManagerId = "other", TenantId = 1, Name = "P24", ClientName = "Client", Sector = "IT", Currency = "USD" }
            });
            await _dbContext.SaveChangesAsync();

            // Act
            var result = await _projectRepository.GetAllByUserId(userId);

            // Assert
            Assert.Equal(3, result.Count());
        }
    }
}
