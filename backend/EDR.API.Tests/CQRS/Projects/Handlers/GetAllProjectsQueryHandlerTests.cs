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
using Microsoft.Extensions.Logging;

namespace EDR.API.Tests.CQRS.Projects.Handlers
{
    public class GetAllProjectsQueryHandlerTests
    {
        private readonly Mock<IProjectRepository> _mockRepo;
        private readonly Mock<ILogger<GetAllProjectsQueryHandler>> _mockLogger;
        private readonly GetAllProjectsQueryHandler _handler;

        public GetAllProjectsQueryHandlerTests()
        {
            _mockRepo = new Mock<IProjectRepository>();
            _mockLogger = new Mock<ILogger<GetAllProjectsQueryHandler>>();
            _handler = new GetAllProjectsQueryHandler(_mockRepo.Object, _mockLogger.Object);
        }

        [Fact]
        public async Task Handle_WithoutProgramId_ReturnsAllProjects()
        {
            // Arrange
            var request = new GetAllProjectsQuery { ProgramId = null };
            var entities = new List<Project> 
            { 
                new Project { Id = 1, Name = "P1" }
            };

            _mockRepo.Setup(r => r.GetAll()).ReturnsAsync(entities);

            // Act
            var result = await _handler.Handle(request, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Single(result);
            _mockRepo.Verify(r => r.GetAll(), Times.Once);
            _mockRepo.Verify(r => r.GetAllByProgramId(It.IsAny<int>()), Times.Never);
        }

        [Fact]
        public async Task Handle_WithProgramId_ReturnsFilteredProjects()
        {
            // Arrange
            var request = new GetAllProjectsQuery { ProgramId = 10 };
            var entities = new List<Project> 
            { 
                new Project { Id = 1, ProgramId = 10, Name = "P1" },
                new Project { Id = 2, ProgramId = 10, Name = "P2" }
            };

            _mockRepo.Setup(r => r.GetAllByProgramId(10)).ReturnsAsync(entities);

            // Act
            var result = await _handler.Handle(request, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.ToList().Count);
            _mockRepo.Verify(r => r.GetAllByProgramId(10), Times.Once);
            _mockRepo.Verify(r => r.GetAll(), Times.Never);
        }

        [Fact]
        public async Task Handle_RepositoryThrows_WrapsInApplicationException()
        {
            // Arrange
            var request = new GetAllProjectsQuery { ProgramId = null };
            _mockRepo.Setup(r => r.GetAll()).ThrowsAsync(new Exception("Database connectivity lost"));

            // Act & Assert
            var ex = await Assert.ThrowsAsync<ApplicationException>(() => _handler.Handle(request, CancellationToken.None));
            Assert.Contains("Error retrieving projects", ex.Message);
            Assert.NotNull(ex.InnerException);
            Assert.Equal("Database connectivity lost", ex.InnerException.Message);
        }

        [Fact]
        public void Constructor_NullRepository_ThrowsArgumentNullException()
        {
            // Act & Assert
            Assert.Throws<ArgumentNullException>(() => new GetAllProjectsQueryHandler(null, _mockLogger.Object));
        }

        [Fact]
        public void Constructor_NullLogger_ThrowsArgumentNullException()
        {
            // Act & Assert
            Assert.Throws<ArgumentNullException>(() => new GetAllProjectsQueryHandler(_mockRepo.Object, null));
        }
    }
}
