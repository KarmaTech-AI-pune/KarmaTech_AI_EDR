using Moq;
using Microsoft.Extensions.Logging;
using EDR.Application.CQRS.Permissions.Queries;
using EDR.Application.CQRS.Permissions.Handlers;
using EDR.Domain.Entities;
using EDR.Repositories.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace EDR.API.Tests.CQRS.Permissions
{
    public class GetAllPermissionsQueryHandlerTests
    {
        private readonly Mock<IPermissionRepository> _permissionRepoMock;
        private readonly Mock<ILogger<GetAllPermissionsQueryHandler>> _loggerMock;
        private readonly GetAllPermissionsQueryHandler _handler;

        public GetAllPermissionsQueryHandlerTests()
        {
            _permissionRepoMock = new Mock<IPermissionRepository>();
            _loggerMock = new Mock<ILogger<GetAllPermissionsQueryHandler>>();
            _handler = new GetAllPermissionsQueryHandler(_permissionRepoMock.Object, _loggerMock.Object);
        }

        [Fact]
        public async Task Handle_PermissionsExist_ReturnsDtos()
        {
            // Arrange
            var query = new GetAllPermissionsQuery();
            var permissions = new List<Permission>
            {
                new Permission { Id = 1, Name = "Perm 1", Description = "Desc 1", Category = "Cat 1" },
                new Permission { Id = 2, Name = "Perm 2", Description = "Desc 2", Category = "Cat 2" }
            };

            _permissionRepoMock.Setup(repo => repo.GetAllAsync())
                .ReturnsAsync(permissions);

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Count());
            Assert.Equal("Perm 1", result.ElementAt(0).Name);
            Assert.Equal("Perm 2", result.ElementAt(1).Name);
        }

        [Fact]
        public async Task Handle_NoPermissions_ReturnsEmptyList()
        {
            // Arrange
            var query = new GetAllPermissionsQuery();

            _permissionRepoMock.Setup(repo => repo.GetAllAsync())
                .ReturnsAsync((IEnumerable<Permission>)null!);

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Empty(result);
        }
    }
}
