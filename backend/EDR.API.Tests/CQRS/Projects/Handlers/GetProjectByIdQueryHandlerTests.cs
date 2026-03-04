using System;
using System.Threading;
using System.Threading.Tasks;
using Moq;
using Xunit;
using EDR.Application.CQRS.Projects.Queries;
using EDR.Application.CQRS.Projects.Handlers;
using EDR.Domain.Entities;
using EDR.Repositories.Interfaces;

namespace EDR.API.Tests.CQRS.Projects.Handlers
{
    public class GetProjectByIdQueryHandlerTests
    {
        private readonly Mock<IProjectRepository> _mockRepo;
        private readonly GetProjectByIdQueryHandler _handler;

        public GetProjectByIdQueryHandlerTests()
        {
            _mockRepo = new Mock<IProjectRepository>();
            _handler = new GetProjectByIdQueryHandler(_mockRepo.Object);
        }

        [Fact]
        public async Task Handle_ValidId_ReturnsProject()
        {
            // Arrange
            var request = new GetProjectByIdQuery { Id = 5 };
            var entity = new Project { Id = 5, Name = "Test Project" };

            _mockRepo.Setup(r => r.GetById(5)).Returns(entity);

            // Act
            var result = await _handler.Handle(request, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(5, result.Id);
            Assert.Equal("Test Project", result.Name);
            _mockRepo.Verify(r => r.GetById(5), Times.Once);
        }

        [Fact]
        public async Task Handle_InvalidId_ThrowsArgumentException()
        {
            // Arrange
            var request = new GetProjectByIdQuery { Id = 99 };
            _mockRepo.Setup(r => r.GetById(99)).Returns((Project)null);

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

        [Fact]
        public void Constructor_NullRepository_ThrowsArgumentNullException()
        {
            // Act & Assert
            Assert.Throws<ArgumentNullException>(() => new GetProjectByIdQueryHandler(null));
        }
    }
}
