using Moq;
using Microsoft.Extensions.Logging;
using EDR.Application.CQRS.Permissions.Commands;
using EDR.Application.CQRS.Permissions.Handlers;
using EDR.Domain.Entities;
using EDR.Repositories.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace EDR.API.Tests.CQRS.Permissions
{
    public class DeletePermissionCommandHandlerTests
    {
        private readonly Mock<IPermissionRepository> _permissionRepoMock;
        private readonly Mock<ILogger<DeletePermissionCommandHandler>> _loggerMock;
        private readonly DeletePermissionCommandHandler _handler;

        public DeletePermissionCommandHandlerTests()
        {
            _permissionRepoMock = new Mock<IPermissionRepository>();
            _loggerMock = new Mock<ILogger<DeletePermissionCommandHandler>>();
            _handler = new DeletePermissionCommandHandler(_permissionRepoMock.Object, _loggerMock.Object);
        }

        [Fact]
        public async Task Handle_ExistingId_DeletesAndReturnsTrue()
        {
            // Arrange
            var permissionId = 1;
            var command = new DeletePermissionCommand(permissionId);

            _permissionRepoMock.Setup(repo => repo.GetByIdAsync(permissionId))
                .ReturnsAsync(new Permission { Id = permissionId, Name = "To Delete" });

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.True(result);
            _permissionRepoMock.Verify(repo => repo.DeleteAsync(permissionId), Times.Once);
        }

        [Fact]
        public async Task Handle_InvalidId_ThrowsArgumentException()
        {
            // Arrange
            var command = new DeletePermissionCommand(0);

            // Act & Assert
            await Assert.ThrowsAsync<ArgumentException>(() => _handler.Handle(command, CancellationToken.None));
        }

        [Fact]
        public async Task Handle_NonExistingId_ReturnsTrueWithoutDeleting()
        {
            // Arrange
            var permissionId = 999;
            var command = new DeletePermissionCommand(permissionId);

            _permissionRepoMock.Setup(repo => repo.GetByIdAsync(permissionId))
                .ReturnsAsync((Permission)null!);

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.True(result);
            _permissionRepoMock.Verify(repo => repo.DeleteAsync(It.IsAny<int>()), Times.Never);
        }
    }
}
