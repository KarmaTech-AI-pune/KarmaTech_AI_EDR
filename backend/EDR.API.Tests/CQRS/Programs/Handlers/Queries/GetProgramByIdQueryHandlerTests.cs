using System;
using System.Threading;
using System.Threading.Tasks;
using Moq;
using Xunit;
using EDR.Application.CQRS.Programs.Queries;
using EDR.Application.CQRS.Programs.Handlers.Queries;
using EDR.Domain.Entities;
using EDR.Repositories.Interfaces;

namespace EDR.API.Tests.CQRS.Programs.Handlers.Queries
{
    public class GetProgramByIdQueryHandlerTests
    {
        private readonly Mock<IProgramRepository> _mockRepo;
        private readonly GetProgramByIdQueryHandler _handler;

        public GetProgramByIdQueryHandlerTests()
        {
            _mockRepo = new Mock<IProgramRepository>();
            _handler = new GetProgramByIdQueryHandler(_mockRepo.Object);
        }

        [Fact]
        public async Task Handle_ValidId_ReturnsProgramDto()
        {
            // Arrange
            var request = new GetProgramByIdQuery { Id = 5 }; // Based on struct mapping
            var entity = new EDR.Domain.Entities.Program { Id = 5, TenantId = 1, Name = "Test Program" };

            _mockRepo.Setup(r => r.GetByIdAsync(5, It.IsAny<CancellationToken>())).ReturnsAsync(entity);

            // Act
            var result = await _handler.Handle(request, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(5, result.Id);
            Assert.Equal("Test Program", result.Name);
            _mockRepo.Verify(r => r.GetByIdAsync(5, It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task Handle_InvalidId_ReturnsNull()
        {
            // Arrange
            var request = new GetProgramByIdQuery { Id = 99 };
            _mockRepo.Setup(r => r.GetByIdAsync(99, It.IsAny<CancellationToken>())).ReturnsAsync((EDR.Domain.Entities.Program)null);

            // Act
            var result = await _handler.Handle(request, CancellationToken.None);

            // Assert
            Assert.Null(result);
        }
    }
}
