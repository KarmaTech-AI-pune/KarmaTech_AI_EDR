using System;
using System.Threading;
using System.Threading.Tasks;
using Moq;
using Xunit;
using EDR.Application.CQRS.Projects.Commands;
using EDR.Application.CQRS.Projects.Handlers;
using EDR.Application.Dtos;
using EDR.Domain.Entities;
using EDR.Repositories.Interfaces;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;

namespace EDR.API.Tests.CQRS.Projects.Handlers
{
    public class CreateProjectCommandHandlerTests
    {
        private readonly Mock<IProjectRepository> _mockProjectRepo;
        private readonly Mock<IProgramRepository> _mockProgramRepo;
        private readonly Mock<ILogger<CreateProjectCommandHandler>> _mockLogger;
        private readonly CreateProjectCommandHandler _handler;

        public CreateProjectCommandHandlerTests()
        {
            _mockProjectRepo = new Mock<IProjectRepository>();
            _mockProgramRepo = new Mock<IProgramRepository>();
            _mockLogger = new Mock<ILogger<CreateProjectCommandHandler>>();
            _handler = new CreateProjectCommandHandler(_mockProjectRepo.Object, _mockProgramRepo.Object, _mockLogger.Object);
        }

        [Fact]
        public async Task Handle_ValidRequest_CreatesProject()
        {
            // Arrange
            var dto = new ProjectDto { Name = "New Proj", ProgramId = 5, TenantId = 1 };
            var request = new CreateProjectCommand(dto);

            _mockProgramRepo.Setup(r => r.GetByIdAsync(5, It.IsAny<CancellationToken>()))
                .ReturnsAsync(new EDR.Domain.Entities.Program { Id = 5, TenantId = 1 });

            // Act
            var result = await _handler.Handle(request, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("New Proj", result.Name);
            Assert.Equal(5, result.ProgramId);
            _mockProjectRepo.Verify(r => r.Add(It.Is<Project>(p => p.Name == "New Proj")), Times.Once);
        }

        [Fact]
        public async Task Handle_InvalidProgramId_ThrowsArgumentException()
        {
            // Arrange
            var dto = new ProjectDto { Name = "New Proj", ProgramId = 0 }; // Invalid
            var request = new CreateProjectCommand(dto);

            // Act & Assert
            var ex = await Assert.ThrowsAsync<ArgumentException>(() => _handler.Handle(request, CancellationToken.None));
            Assert.Contains("ProgramId is required", ex.Message);
        }

        [Fact]
        public async Task Handle_ProgramDoesNotExist_ThrowsArgumentException()
        {
            // Arrange
            var dto = new ProjectDto { Name = "New Proj", ProgramId = 99 };
            var request = new CreateProjectCommand(dto);

            _mockProgramRepo.Setup(r => r.GetByIdAsync(99, It.IsAny<CancellationToken>()))
                .ReturnsAsync((EDR.Domain.Entities.Program)null);

            // Act & Assert
            var ex = await Assert.ThrowsAsync<ArgumentException>(() => _handler.Handle(request, CancellationToken.None));
            Assert.Contains("Program with ID 99 does not exist", ex.Message);
        }

        [Fact]
        public async Task Handle_TenantMismatch_ThrowsArgumentException()
        {
            // Arrange
            var dto = new ProjectDto { Name = "New Proj", ProgramId = 5, TenantId = 2 };
            var request = new CreateProjectCommand(dto);

            _mockProgramRepo.Setup(r => r.GetByIdAsync(5, It.IsAny<CancellationToken>()))
                .ReturnsAsync(new EDR.Domain.Entities.Program { Id = 5, TenantId = 1 });

            // Act & Assert
            var ex = await Assert.ThrowsAsync<ArgumentException>(() => _handler.Handle(request, CancellationToken.None));
            Assert.Contains("does not belong to the specified tenant", ex.Message);
        }

        [Fact]
        public async Task Handle_NullRequest_ThrowsArgumentNullException()
        {
            // Act & Assert
            await Assert.ThrowsAsync<ArgumentNullException>(() => _handler.Handle(null, CancellationToken.None));
        }

        [Fact]
        public void Constructor_NullDependencies_ThrowsArgumentNullException()
        {
            // Act & Assert
            Assert.Throws<ArgumentNullException>(() => new CreateProjectCommandHandler(null, _mockProgramRepo.Object, _mockLogger.Object));
            Assert.Throws<ArgumentNullException>(() => new CreateProjectCommandHandler(_mockProjectRepo.Object, null, _mockLogger.Object));
            Assert.Throws<ArgumentNullException>(() => new CreateProjectCommandHandler(_mockProjectRepo.Object, _mockProgramRepo.Object, null));
        }
    }
}
