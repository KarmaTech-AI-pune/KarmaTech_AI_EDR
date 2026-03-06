using System;
using System.Threading;
using System.Threading.Tasks;
using Moq;
using Xunit;
using MediatR;
using EDR.Application.CQRS.ChangeControl.Queries;
using EDR.Application.CQRS.ChangeControl.Handlers;
using EDR.Application.Dtos;
using EDR.Repositories.Interfaces;
using EDR.Domain.Entities;

namespace EDR.API.Tests.CQRS.ChangeControl.Handlers
{
    public class GetChangeControlByIdQueryHandlerTests
    {
        private readonly Mock<IChangeControlRepository> _mockChangeControlRepo;
        private readonly GetChangeControlByIdQueryHandler _handler;

        public GetChangeControlByIdQueryHandlerTests()
        {
            _mockChangeControlRepo = new Mock<IChangeControlRepository>();
            _handler = new GetChangeControlByIdQueryHandler(_mockChangeControlRepo.Object);
        }

        [Fact]
        public async Task Handle_ValidId_ReturnsMappedDto()
        {
            // Arrange
            var request = new GetChangeControlByIdQuery(5);
            var entity = new EDR.Domain.Entities.ChangeControl
            {
                Id = 5,
                ProjectId = 10,
                SrNo = 1,
                DateLogged = new DateTime(2023, 1, 1),
                Originator = "TestOriginator",
                Description = "TestDescription",
                CreatedBy = "System"
            };

            _mockChangeControlRepo.Setup(r => r.GetByIdAsync(5)).ReturnsAsync(entity);

            // Act
            var result = await _handler.Handle(request, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(5, result.Id);
            Assert.Equal(10, result.ProjectId);
            Assert.Equal("TestOriginator", result.Originator);
            _mockChangeControlRepo.Verify(r => r.GetByIdAsync(5), Times.Once);
        }

        [Fact]
        public async Task Handle_InvalidId_ReturnsNull()
        {
            // Arrange
            var request = new GetChangeControlByIdQuery(99);
            _mockChangeControlRepo.Setup(r => r.GetByIdAsync(99)).ReturnsAsync((EDR.Domain.Entities.ChangeControl)null);

            // Act
            var result = await _handler.Handle(request, CancellationToken.None);

            // Assert
            Assert.Null(result);
            _mockChangeControlRepo.Verify(r => r.GetByIdAsync(99), Times.Once);
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
            Assert.Throws<ArgumentNullException>(() => new GetChangeControlByIdQueryHandler(null));
        }
    }
}
