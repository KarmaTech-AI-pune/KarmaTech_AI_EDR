using System;
using System.Threading;
using System.Threading.Tasks;
using Moq;
using Xunit;
using MediatR;
using EDR.Application.CQRS.Projects.Commands;
using EDR.Application.CQRS.Projects.Handlers;
using EDR.Application.Dtos;
using EDR.Domain.Entities;
using EDR.Repositories.Interfaces;
using Microsoft.Extensions.Logging;

namespace EDR.API.Tests.CQRS.Projects.Handlers
{
    public class UpdateProjectCommandHandlerTests
    {
        private readonly Mock<IProjectRepository> _mockProjectRepo;
        private readonly Mock<IProgramRepository> _mockProgramRepo;
        private readonly Mock<IMediator> _mockMediator;
        private readonly Mock<ILogger<UpdateProjectCommandHandler>> _mockLogger;
        private readonly UpdateProjectCommandHandler _handler;

        public UpdateProjectCommandHandlerTests()
        {
            _mockProjectRepo = new Mock<IProjectRepository>();
            _mockProgramRepo = new Mock<IProgramRepository>();
            _mockMediator = new Mock<IMediator>();
            _mockLogger = new Mock<ILogger<UpdateProjectCommandHandler>>();
            
            _handler = new UpdateProjectCommandHandler(
                _mockProjectRepo.Object, 
                _mockProgramRepo.Object, 
                _mockMediator.Object, 
                _mockLogger.Object);
        }

        [Fact]
        public async Task Handle_ValidRequest_UpdatesProject()
        {
            // Arrange
            var existingProject = new Project { Id = 1, ProgramId = 5, Name = "Old Name" };
            var dto = new ProjectDto { Id = 1, ProgramId = 5, Name = "New Name" };
            var request = new UpdateProjectCommand { Id = 1, ProjectDto = dto };

            _mockProjectRepo.Setup(r => r.GetById(1)).Returns(existingProject);

            // Act
            var result = await _handler.Handle(request, CancellationToken.None);

            // Assert
            Assert.Equal(Unit.Value, result);
            Assert.Equal("New Name", existingProject.Name);
            _mockProjectRepo.Verify(r => r.Update(existingProject), Times.Once);
            _mockMediator.Verify(m => m.Send(It.IsAny<UpdateProjectBudgetCommand>(), It.IsAny<CancellationToken>()), Times.Never);
        }

        [Fact]
        public async Task Handle_BudgetChanged_TriggersMediatorCommand()
        {
            // Arrange
            var existingProject = new Project { Id = 1, ProgramId = 5, EstimatedProjectCost = 100 };
            var dto = new ProjectDto { Id = 1, ProgramId = 5, EstimatedProjectCost = 500, ProjectManagerId = "user" };
            var request = new UpdateProjectCommand { Id = 1, ProjectDto = dto };

            _mockProjectRepo.Setup(r => r.GetById(1)).Returns(existingProject);
            _mockMediator.Setup(m => m.Send(It.IsAny<UpdateProjectBudgetCommand>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new ProjectBudgetUpdateResultDto { Success = true });

            // Act
            var result = await _handler.Handle(request, CancellationToken.None);

            // Assert
            Assert.Equal(Unit.Value, result);
            _mockMediator.Verify(m => m.Send(It.IsAny<UpdateProjectBudgetCommand>(), It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task Handle_ProgramChangedToInvalid_ThrowsArgumentException()
        {
            // Arrange
            var existingProject = new Project { Id = 1, ProgramId = 5, TenantId = 1 };
            var dto = new ProjectDto { Id = 1, ProgramId = 10, TenantId = 1 }; // Changed to 10
            var request = new UpdateProjectCommand { Id = 1, ProjectDto = dto };

            _mockProjectRepo.Setup(r => r.GetById(1)).Returns(existingProject);
            _mockProgramRepo.Setup(r => r.GetByIdAsync(10, It.IsAny<CancellationToken>())).ReturnsAsync((EDR.Domain.Entities.Program)null);

            // Act & Assert
            var ex = await Assert.ThrowsAsync<ArgumentException>(() => _handler.Handle(request, CancellationToken.None));
            Assert.Contains("Program with ID 10 does not exist", ex.Message);
        }

        [Fact]
        public async Task Handle_ProjectNotFound_ThrowsArgumentException()
        {
            // Arrange
            var dto = new ProjectDto { Id = 99 };
            var request = new UpdateProjectCommand { Id = 99, ProjectDto = dto };

            _mockProjectRepo.Setup(r => r.GetById(99)).Returns((Project)null);

            // Act & Assert
            var ex = await Assert.ThrowsAsync<ArgumentException>(() => _handler.Handle(request, CancellationToken.None));
            Assert.Contains("Project with ID 99 not found", ex.Message);
        }

        [Fact]
        public async Task Handle_NullRequest_ThrowsArgumentNullException()
        {
            // Act & Assert
            await Assert.ThrowsAsync<ArgumentNullException>(() => _handler.Handle(null, CancellationToken.None));
        }
    }
}
