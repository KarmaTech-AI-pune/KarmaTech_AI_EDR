using Moq;
using Microsoft.AspNetCore.Identity;
using EDR.Application.CQRS.Roles.Commands;
using EDR.Application.CQRS.Roles.Handlers;
using EDR.Application.Dtos;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.Application.Services.IContract;
using EDR.Domain.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace EDR.API.Tests.CQRS.Roles
{
    public class CreateRoleHandlerTests
    {
        private readonly DbContextOptions<ProjectManagementContext> _options;
        private readonly Mock<ICurrentTenantService> _tenantServiceMock;
        private readonly Mock<IConfiguration> _configMock;
        private readonly Mock<RoleManager<Role>> _roleManagerMock;

        public CreateRoleHandlerTests()
        {
            _options = new DbContextOptionsBuilder<ProjectManagementContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _tenantServiceMock = new Mock<ICurrentTenantService>();
            _configMock = new Mock<IConfiguration>();

            var roleStoreMock = new Mock<IRoleStore<Role>>();
            _roleManagerMock = new Mock<RoleManager<Role>>(roleStoreMock.Object, null, null, null, null);
        }

        private ProjectManagementContext GetContext()
        {
            return new ProjectManagementContext(_options, _tenantServiceMock.Object, _configMock.Object);
        }

        [Fact]
        public async Task Handle_ValidRequest_CreatesRoleAndPermissions()
        {
            // Arrange
            using var context = GetContext();
            var handler = new CreateRoleHandler(context, _roleManagerMock.Object);

            var command = new CreateRoleCommands(new RoleDefination
            {
                Name = "NewRole",
                MinRate = 100,
                IsResourceRole = true,
                Permissions = new List<PermissionCategoryGroup>
                {
                    new PermissionCategoryGroup 
                    { 
                        Permissions = new List<PermissionDto>
                        {
                            new PermissionDto { Id = 1, Name = "Perm1" },
                            new PermissionDto { Id = 2, Name = "Perm2" }
                        }
                    }
                }
            });

            _roleManagerMock.Setup(rm => rm.CreateAsync(It.IsAny<Role>()))
                .Callback<Role>(r => r.Id = "99") // Simulate ID assignment
                .ReturnsAsync(IdentityResult.Success);

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.True(result);
            _roleManagerMock.Verify(rm => rm.CreateAsync(It.IsAny<Role>()), Times.Once);
            
            var savedPermissions = await context.RolePermissions.ToListAsync();
            Assert.Equal(2, savedPermissions.Count);
            Assert.Contains(savedPermissions, rp => rp.RoleId == "99" && rp.PermissionId == 1);
            Assert.Contains(savedPermissions, rp => rp.RoleId == "99" && rp.PermissionId == 2);
        }

        [Fact]
        public async Task Handle_CreationFails_ThrowsInvalidOperationException()
        {
            // Arrange
            using var context = GetContext();
            var handler = new CreateRoleHandler(context, _roleManagerMock.Object);

            var command = new CreateRoleCommands(new RoleDefination { Name = "FailRole", Permissions = new List<PermissionCategoryGroup>() });

            var failedResult = IdentityResult.Failed(new IdentityError { Description = "Validation failed" });
            _roleManagerMock.Setup(rm => rm.CreateAsync(It.IsAny<Role>()))
                .ReturnsAsync(failedResult);

            // Act & Assert
            var exception = await Assert.ThrowsAsync<InvalidOperationException>(() => handler.Handle(command, CancellationToken.None));
            Assert.Contains("An error occurred while creating the role", exception.Message);
        }
    }
}
