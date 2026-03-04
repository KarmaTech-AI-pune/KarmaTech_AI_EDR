using System;
using System.Threading;
using System.Threading.Tasks;
using Moq;
using Xunit;
using MediatR;
using EDR.Application.CQRS.Projects.Commands;
using EDR.Application.CQRS.Projects.Handlers;
using EDR.Repositories.Interfaces;

namespace EDR.API.Tests.CQRS.Projects.Handlers
{
    public class DeleteProjectCommandHandlerTests
    {
        private readonly Mock<IProjectRepository> _mockRepo;
        private readonly DeleteProjectCommandHandler _handler;

        public DeleteProjectCommandHandlerTests()
        {
            _mockRepo = new Mock<IProjectRepository>();
            _handler = new DeleteProjectCommandHandler(_mockRepo.Object);
        }

        [Fact]
        public async Task Handle_ValidRequest_CallsDeleteAndReturnsUnit()
        {
            // Arrange
            var request = new DeleteProjectCommand { Id = 10 };

            // Act
            var result = await _handler.Handle(request, CancellationToken.None);

            // Assert
            Assert.Equal(Unit.Value, result);
            _mockRepo.Verify(r => r.Delete(10), Times.Once);
        }

        [Fact]
        public async Task Handle_NullRequest_ThrowsArgumentNullException()
        {
            // Act & Assert
            await Assert.ThrowsAsync<ArgumentNullException>(() => _handler.Handle(null, CancellationToken.None));
        }

        [Fact]
        public async Task Handle_ExceptionInRepository_ThrowsApplicationException()
        {
            // Arrange
            var request = new DeleteProjectCommand { Id = 10 };
            _mockRepo.Setup(r => r.Delete(10)).Throws(new Exception("Database context error"));

            // Act & Assert
            var ex = await Assert.ThrowsAsync<ApplicationException>(() => _handler.Handle(request, CancellationToken.None));
            Assert.Contains("Error deleting project with ID 10", ex.Message);
        }

        [Fact]
        public void Constructor_NullRepository_ThrowsArgumentNullException()
        {
            // Act & Assert
            Assert.Throws<ArgumentNullException>(() => new DeleteProjectCommandHandler(null));
        }
    }
}
