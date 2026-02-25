using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Moq;
using Xunit;
using EDR.Application.CQRS.ChangeControl.Commands;
using EDR.Application.CQRS.ChangeControl.Handlers;
using EDR.Application.Dtos;
using EDR.Repositories.Interfaces;
using EDR.Domain.Entities;

namespace EDR.API.Tests.CQRS.ChangeControl.Handlers
{
    public class UpdateChangeControlCommandHandlerTests
    {
        private readonly Mock<IChangeControlRepository> _mockRepo;
        private readonly UpdateChangeControlCommandHandler _handler;

        public UpdateChangeControlCommandHandlerTests()
        {
            _mockRepo = new Mock<IChangeControlRepository>();
            _handler = new UpdateChangeControlCommandHandler(_mockRepo.Object);
        }

        [Fact]
        public async Task Handle_ValidRequest_UpdatesAndReturnsDto()
        {
            // Arrange
            var existingEntity = new EDR.Domain.Entities.ChangeControl
            {
                Id = 1,
                ProjectId = 5,
                SrNo = 1,
                Description = "Old Desc"
            };

            var dto = new ChangeControlDto
            {
                Id = 1,
                ProjectId = 10,
                SrNo = 2,
                Description = "New Desc",
                DateLogged = DateTime.UtcNow,
                Originator = "NewOrg",
                UpdatedBy = "TestUpdater"
            };

            var command = new UpdateChangeControlCommand(dto);

            _mockRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(existingEntity);

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("New Desc", existingEntity.Description);
            Assert.Equal(10, existingEntity.ProjectId);
            Assert.Equal("TestUpdater", existingEntity.UpdatedBy);

            _mockRepo.Verify(r => r.UpdateAsync(existingEntity), Times.Once);

            Assert.Equal(1, result.Id);
            Assert.Equal(10, result.ProjectId);
            Assert.Equal("New Desc", result.Description);
        }

        [Fact]
        public async Task Handle_EntityNotFound_ThrowsKeyNotFoundException()
        {
            // Arrange
            var dto = new ChangeControlDto { Id = 99 };
            var command = new UpdateChangeControlCommand(dto);

            _mockRepo.Setup(r => r.GetByIdAsync(99)).ReturnsAsync((EDR.Domain.Entities.ChangeControl)null);

            // Act & Assert
            await Assert.ThrowsAsync<System.Collections.Generic.KeyNotFoundException>(() => _handler.Handle(command, CancellationToken.None));
        }

        [Fact]
        public async Task Handle_NullRequest_ThrowsArgumentNullException()
        {
            // Act & Assert
            await Assert.ThrowsAsync<ArgumentNullException>(() => _handler.Handle(null, CancellationToken.None));
            await Assert.ThrowsAsync<ArgumentNullException>(() => _handler.Handle(new UpdateChangeControlCommand(null), CancellationToken.None));
        }
    }
}
