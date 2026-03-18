using Moq;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Identity;
using EDR.Application.CQRS.Permissions.Commands;
using EDR.Application.CQRS.Permissions.Handlers;
using EDR.Application.Dtos;
using EDR.Domain.Entities;
using EDR.Repositories.Interfaces;
using EDR.Application.Services.IContract;
using EDR.Domain.UnitWork;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace EDR.API.Tests.CQRS.Permissions
{
    public class CreatePermissionCommandHandlerTests
    {
        private readonly Mock<IPermissionRepository> _permissionRepoMock;
        private readonly Mock<IUnitOfWork> _unitOfWorkMock;
        private readonly Mock<ICurrentUserService> _currentUserServiceMock;
        private readonly Mock<ITenantService> _tenantServiceMock;
        private readonly Mock<ILogger<CreatePermissionCommandHandler>> _loggerMock;
        private readonly Mock<RoleManager<Role>> _roleManagerMock;
        private readonly CreatePermissionCommandHandler _handler;

        public CreatePermissionCommandHandlerTests()
        {
            _permissionRepoMock = new Mock<IPermissionRepository>();
            _unitOfWorkMock = new Mock<IUnitOfWork>();
            _currentUserServiceMock = new Mock<ICurrentUserService>();
            _tenantServiceMock = new Mock<ITenantService>();
            _loggerMock = new Mock<ILogger<CreatePermissionCommandHandler>>();

            var roleStoreMock = new Mock<IRoleStore<Role>>();
            _roleManagerMock = new Mock<RoleManager<Role>>(roleStoreMock.Object, null, null, null, null);

            _handler = new CreatePermissionCommandHandler(
                _permissionRepoMock.Object,
                _unitOfWorkMock.Object,
                _currentUserServiceMock.Object,
                _tenantServiceMock.Object,
                _loggerMock.Object,
                _roleManagerMock.Object);
        }

        [Fact]
        public async Task Handle_ValidRequest_CreatesPermissionAndReturnsId()
        {
            // Arrange
            var command = new CreatePermissionCommand(
                new PermissionDto
                {
                    Name = "TestPermission",
                    Description = "Test Desc",
                    Category = "TestCat"
                }
            );

            _permissionRepoMock.Setup(repo => repo.GetByNameAsync(It.IsAny<string>()))
                .ReturnsAsync((Permission)null!);

            _permissionRepoMock.Setup(repo => repo.AddAsync(It.IsAny<Permission>()))
                .ReturnsAsync(5); // Return new ID

            _unitOfWorkMock.Setup(u => u.SaveChangesAsync())
                .ReturnsAsync(1);

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.Equal(5, result);
            _permissionRepoMock.Verify(repo => repo.AddAsync(It.IsAny<Permission>()), Times.Once);
            _unitOfWorkMock.Verify(u => u.SaveChangesAsync(), Times.Once);
        }

        [Fact]
        public async Task Handle_ExistingName_ThrowsArgumentException()
        {
            // Arrange
            var command = new CreatePermissionCommand(
                new PermissionDto { Name = "ExistingPermission" }
            );

            _permissionRepoMock.Setup(repo => repo.GetByNameAsync("ExistingPermission"))
                .ReturnsAsync(new Permission { Id = 1, Name = "ExistingPermission" });

            // Act & Assert
            await Assert.ThrowsAsync<ArgumentException>(() => _handler.Handle(command, CancellationToken.None));
        }
    }
}
