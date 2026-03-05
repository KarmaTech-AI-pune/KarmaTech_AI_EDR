using Moq;
using Microsoft.Extensions.Logging;
using EDR.Application.CQRS.Permissions.Queries;
using EDR.Application.CQRS.Permissions.Handlers;
using EDR.Domain.Entities;
using EDR.Repositories.Interfaces;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace EDR.API.Tests.CQRS.Permissions
{
    public class GetPermissionByIdQueryHandlerTests
    {
        private readonly Mock<IPermissionRepository> _permissionRepoMock;
        private readonly Mock<ILogger<GetPermissionByIdQueryHandler>> _loggerMock;
        private readonly GetPermissionByIdQueryHandler _handler;

        public GetPermissionByIdQueryHandlerTests()
        {
            _permissionRepoMock = new Mock<IPermissionRepository>();
            _loggerMock = new Mock<ILogger<GetPermissionByIdQueryHandler>>();
            _handler = new GetPermissionByIdQueryHandler(_permissionRepoMock.Object, _loggerMock.Object);
        }

        [Fact]
        public async Task Handle_ExistingId_ReturnsDto()
        {
            // Arrange
            var permissionId = 1;
            var query = new GetPermissionByIdQuery { Id = permissionId };

            var existingPermission = new Permission 
            { 
                Id = permissionId, 
                Name = "Test Perm", 
                Description = "Test Desc", 
                Category = "Test Cat" 
            };

            _permissionRepoMock.Setup(repo => repo.GetByIdAsync(permissionId))
                .ReturnsAsync(existingPermission);

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(permissionId, result.Id);
            Assert.Equal("Test Perm", result.Name);
            Assert.Equal("Test Desc", result.Description);
            Assert.Equal("Test Cat", result.Category);
        }

        [Fact]
        public async Task Handle_InvalidId_ReturnsNull()
        {
            // Arrange
            var query = new GetPermissionByIdQuery { Id = 0 };

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.Null(result);
            _permissionRepoMock.Verify(repo => repo.GetByIdAsync(It.IsAny<int>()), Times.Never);
        }

        [Fact]
        public async Task Handle_NonExistingId_ReturnsNull()
        {
            // Arrange
            var permissionId = 999;
            var query = new GetPermissionByIdQuery { Id = permissionId };

            _permissionRepoMock.Setup(repo => repo.GetByIdAsync(permissionId))
                .ReturnsAsync((Permission)null!);

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.Null(result);
        }
    }
}
