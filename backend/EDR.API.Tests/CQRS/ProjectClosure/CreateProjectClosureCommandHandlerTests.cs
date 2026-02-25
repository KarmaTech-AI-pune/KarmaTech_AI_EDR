using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using EDR.Application.CQRS.ProjectClosure.Commands;
using EDR.Application.CQRS.ProjectClosure.Handlers;
using EDR.Application.Dtos;
using EDR.Application.Services.IContract;
using EDR.Domain.UnitWork;
using EDR.Repositories.Interfaces;
using EDR.Domain.Entities;

namespace EDR.API.Tests.CQRS.ProjectClosure.Handlers
{
    public class CreateProjectClosureCommandHandlerTests
    {
        private readonly Mock<IUnitOfWork> _mockUow;
        private readonly Mock<IProjectClosureRepository> _mockProjectClosureRepo;
        private readonly Mock<IProjectRepository> _mockProjectRepo;
        private readonly Mock<ICurrentUserService> _mockUserService;
        private readonly Mock<ILogger<CreateProjectClosureCommandHandler>> _mockLogger;
        private readonly CreateProjectClosureCommandHandler _handler;

        public CreateProjectClosureCommandHandlerTests()
        {
            _mockUow = new Mock<IUnitOfWork>();
            _mockProjectClosureRepo = new Mock<IProjectClosureRepository>();
            _mockProjectRepo = new Mock<IProjectRepository>();
            _mockUserService = new Mock<ICurrentUserService>();
            _mockLogger = new Mock<ILogger<CreateProjectClosureCommandHandler>>();

            _handler = new CreateProjectClosureCommandHandler(
                _mockUow.Object,
                _mockProjectClosureRepo.Object,
                _mockProjectRepo.Object,
                _mockUserService.Object,
                _mockLogger.Object
            );
        }

        [Fact]
        public async Task Handle_ValidNewClosure_CreatesAndReturnsId()
        {
            // Arrange
            var dto = new ProjectClosureDto { ProjectId = 10, ClientFeedback = "Good" };
            var command = new CreateProjectClosureCommand(dto);
            var project = new Project { Id = 10, ProjectManagerId = "1" };

            _mockProjectClosureRepo.Setup(r => r.ProjectExists(10)).ReturnsAsync(true);
            _mockProjectClosureRepo.Setup(r => r.GetByProjectId(10)).ReturnsAsync((EDR.Domain.Entities.ProjectClosure)null);
            _mockProjectRepo.Setup(r => r.GetById(10)).Returns(project);
            _mockUserService.Setup(s => s.UserId).Returns("user1");
            
            _mockProjectClosureRepo.Setup(r => r.Add(It.IsAny<EDR.Domain.Entities.ProjectClosure>()))
                .Callback<EDR.Domain.Entities.ProjectClosure>(pc => pc.Id = 99)
                .Returns(Task.CompletedTask);

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.Equal(99, result);
            _mockProjectClosureRepo.Verify(r => r.Add(It.Is<EDR.Domain.Entities.ProjectClosure>(pc => pc.ProjectId == 10)), Times.Once);
            _mockUow.Verify(u => u.SaveChangesAsync(), Times.Once);
        }

        [Fact]
        public async Task Handle_ProjectDoesNotExist_ThrowsInvalidOperationException()
        {
            // Arrange
            var dto = new ProjectClosureDto { ProjectId = 99 };
            var command = new CreateProjectClosureCommand(dto);

            _mockProjectClosureRepo.Setup(r => r.ProjectExists(99)).ReturnsAsync(false);

            // Act & Assert
            await Assert.ThrowsAsync<InvalidOperationException>(() => _handler.Handle(command, CancellationToken.None));
        }

        // [Fact]
        // public async Task Handle_NullDto_ThrowsArgumentNullException()
        // {
        //     // Arrange
        //     var command = new CreateProjectClosureCommand { ProjectClosureDto = null };
        // 
        //     // Act & Assert
        //     await Assert.ThrowsAsync<ArgumentNullException>(() => _handler.Handle(command, CancellationToken.None));
        // }

        [Fact]
        public async Task Handle_InvalidProjectId_ThrowsArgumentException()
        {
            // Arrange
            var command = new CreateProjectClosureCommand(new ProjectClosureDto { ProjectId = 0 });

            // Act & Assert
            await Assert.ThrowsAsync<ArgumentException>(() => _handler.Handle(command, CancellationToken.None));
        }
    }
}
