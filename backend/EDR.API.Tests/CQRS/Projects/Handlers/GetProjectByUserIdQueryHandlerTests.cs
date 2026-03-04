using System;
using System.Collections.Generic;
using System.Linq;
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
    public class GetProjectByUserIdQueryHandlerTests
    {
        private readonly Mock<IProjectRepository> _mockRepo;
        private readonly GetProjectByUserIdQueryHandler _handler;

        public GetProjectByUserIdQueryHandlerTests()
        {
            _mockRepo = new Mock<IProjectRepository>();
            _handler = new GetProjectByUserIdQueryHandler(_mockRepo.Object);
        }

        [Fact]
        public async Task Handle_ValidUserId_ReturnsProjects()
        {
            // Arrange
            var request = new GetProjectByUserIdQuery { UserId = "user123" };
            var entities = new List<Project> 
            { 
                new Project { Id = 1, Name = "P1" },
                new Project { Id = 2, Name = "P2" }
            };

            _mockRepo.Setup(r => r.GetAllByUserId("user123")).ReturnsAsync(entities);

            // Act
            var result = await _handler.Handle(request, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.ToList().Count);
            _mockRepo.Verify(r => r.GetAllByUserId("user123"), Times.Once);
        }

        [Fact]
        public async Task Handle_InvalidUserId_ThrowsArgumentException()
        {
            // Arrange
            var request = new GetProjectByUserIdQuery { UserId = "unknown" };
            _mockRepo.Setup(r => r.GetAllByUserId("unknown")).ReturnsAsync((IEnumerable<Project>)null);

            // Act & Assert
            var ex = await Assert.ThrowsAsync<ArgumentException>(() => _handler.Handle(request, CancellationToken.None));
            Assert.Contains("Project with ID unknown not found", ex.Message);
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
            Assert.Throws<ArgumentNullException>(() => new GetProjectByUserIdQueryHandler(null));
        }
    }
}
