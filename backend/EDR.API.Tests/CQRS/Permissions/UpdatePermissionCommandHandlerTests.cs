using Moq;
using Microsoft.Extensions.Logging;
using EDR.Application.CQRS.Permissions.Commands;
using EDR.Application.CQRS.Permissions.Handlers;
using EDR.Application.Dtos;
using EDR.Domain.Entities;
using EDR.Repositories.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace EDR.API.Tests.CQRS.Permissions
{
    public class UpdatePermissionCommandHandlerTests
    {
        private readonly Mock<IPermissionRepository> _permissionRepoMock;
        private readonly Mock<ILogger<UpdatePermissionCommandHandler>> _loggerMock;
        private readonly UpdatePermissionCommandHandler _handler;

        public UpdatePermissionCommandHandlerTests()
        {
            _permissionRepoMock = new Mock<IPermissionRepository>();
            _loggerMock = new Mock<ILogger<UpdatePermissionCommandHandler>>();
            _handler = new UpdatePermissionCommandHandler(_permissionRepoMock.Object, _loggerMock.Object);
        }

        [Fact]
        public async Task Handle_ValidRequest_UpdatesAndReturnsTrue()
        {
            // Arrange
            var permissionId = 1;
            var command = new UpdatePermissionCommand(
                new PermissionDto
                {
                    Id = permissionId,
                    Name = "Updated Perm",
                    Description = "Updated Desc",
                    Category = "Updated Cat"
                }
            );

            var existingPermission = new Permission { Id = permissionId, Name = "Old Perm" };

            _permissionRepoMock.Setup(repo => repo.GetByNameAsync("Updated Perm"))
                .ReturnsAsync((Permission)null!); // no collision
            
            _permissionRepoMock.Setup(repo => repo.GetByIdAsync(permissionId))
                .ReturnsAsync(existingPermission);

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.True(result);
            _permissionRepoMock.Verify(repo => repo.UpdateAsync(existingPermission), Times.Once);
            Assert.Equal("Updated Perm", existingPermission.Name);
            Assert.Equal("Updated Desc", existingPermission.Description);
            Assert.Equal("Updated Cat", existingPermission.Category);
        }

        [Fact]
        public async Task Handle_NullDto_ThrowsArgumentNullException()
        {
            // Arrange
            var command = new UpdatePermissionCommand(null!);

            // Act & Assert
            await Assert.ThrowsAsync<ArgumentNullException>(() => _handler.Handle(command, CancellationToken.None));
        }

        [Fact]
        public async Task Handle_InvalidId_ThrowsArgumentException()
        {
            // Arrange
            var command = new UpdatePermissionCommand(
                new PermissionDto { Id = 0, Name = "Test" }
            );

            // Act & Assert
            await Assert.ThrowsAsync<ArgumentException>(() => _handler.Handle(command, CancellationToken.None));
        }

        [Fact]
        public async Task Handle_NameCollision_ThrowsArgumentException()
        {
            // Arrange
            var command = new UpdatePermissionCommand(
                new PermissionDto { Id = 1, Name = "Existing Name" }
            );

            _permissionRepoMock.Setup(repo => repo.GetByNameAsync("Existing Name"))
                .ReturnsAsync(new Permission { Id = 2, Name = "Existing Name" }); // different ID owns this name

            // Act & Assert
            await Assert.ThrowsAsync<ArgumentException>(() => _handler.Handle(command, CancellationToken.None));
        }

        [Fact]
        public async Task Handle_NonExistingPermission_ThrowsArgumentException()
        {
            // Arrange
            var command = new UpdatePermissionCommand(
                new PermissionDto { Id = 999, Name = "Non Existing" }
            );

            _permissionRepoMock.Setup(repo => repo.GetByNameAsync(It.IsAny<string>()))
                .ReturnsAsync((Permission)null!);
            
            _permissionRepoMock.Setup(repo => repo.GetByIdAsync(999))
                .ReturnsAsync((Permission)null!);

            // Act & Assert
            await Assert.ThrowsAsync<ArgumentException>(() => _handler.Handle(command, CancellationToken.None));
        }
    }
}
