using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using EDR.Application.CQRS.ProjectClosure.Commands;
using EDR.Application.CQRS.ProjectClosure.Handlers;
using EDR.Application.Dtos;
using EDR.Repositories.Interfaces;
using EDR.Domain.Entities;

namespace EDR.API.Tests.CQRS.ProjectClosure.Handlers
{
    public class UpdateProjectClosureCommandHandlerTests
    {
        private readonly Mock<IProjectClosureRepository> _mockRepo;
        private readonly Mock<ILogger<UpdateProjectClosureCommandHandler>> _mockLogger;
        private readonly UpdateProjectClosureCommandHandler _handler;

        public UpdateProjectClosureCommandHandlerTests()
        {
            _mockRepo = new Mock<IProjectClosureRepository>();
            _mockLogger = new Mock<ILogger<UpdateProjectClosureCommandHandler>>();

            _handler = new UpdateProjectClosureCommandHandler(_mockRepo.Object, _mockLogger.Object);
        }

        [Fact]
        public async Task Handle_ValidRequest_UpdatesAndReturnsTrue()
        {
            // Arrange
            var dto = new ProjectClosureDto { Id = 10, ProjectId = 5, ClientFeedback = "Updated feedback" };
            var command = new UpdateProjectClosureCommand(dto);
            
            var existingEntity = new EDR.Domain.Entities.ProjectClosure { Id = 10, ProjectId = 5, ClientFeedback = "Old feedback" };

            _mockRepo.Setup(r => r.GetById(10)).ReturnsAsync(existingEntity);
            _mockRepo.Setup(r => r.Update(It.IsAny<EDR.Domain.Entities.ProjectClosure>())).Verifiable();

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.True(result);
            _mockRepo.Verify(r => r.Update(It.Is<EDR.Domain.Entities.ProjectClosure>(pc => pc.ClientFeedback == "Updated feedback" && pc.Id == 10)), Times.Once);
        }

        [Fact]
        public async Task Handle_EntityNotFound_ThrowsInvalidOperationException()
        {
            // Arrange
            var dto = new ProjectClosureDto { Id = 99 };
            var command = new UpdateProjectClosureCommand(dto);

            _mockRepo.Setup(r => r.GetById(99)).ReturnsAsync((EDR.Domain.Entities.ProjectClosure)null);

            // Act & Assert
            await Assert.ThrowsAsync<InvalidOperationException>(() => _handler.Handle(command, CancellationToken.None));
        }

        // [Fact]
        // public async Task Handle_NullDto_ThrowsArgumentNullException()
        // {
        //     // Arrange
        //     var command = new UpdateProjectClosureCommand { ProjectClosureDto = null };
        // 
        //     // Act & Assert
        //     await Assert.ThrowsAsync<ArgumentNullException>(() => _handler.Handle(command, CancellationToken.None));
        // }

        [Fact]
        public async Task Handle_InvalidId_ThrowsArgumentException()
        {
            // Arrange
            var command = new UpdateProjectClosureCommand(new ProjectClosureDto { Id = 0 });

            // Act & Assert
            await Assert.ThrowsAsync<ArgumentException>(() => _handler.Handle(command, CancellationToken.None));
        }
    }
}
