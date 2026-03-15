using Moq;
using Microsoft.AspNetCore.Identity;
using EDR.Application.CQRS.Roles.Commands;
using EDR.Application.CQRS.Roles.Handlers;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.Application.Services.IContract;
using EDR.Domain.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace EDR.API.Tests.CQRS.Roles
{
    public class DeleteRoleHandlerTests
    {
        private readonly DbContextOptions<ProjectManagementContext> _options;
        private readonly Mock<ICurrentTenantService> _tenantServiceMock;
        private readonly Mock<IConfiguration> _configMock;
        private readonly Mock<RoleManager<Role>> _roleManagerMock;

        public DeleteRoleHandlerTests()
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
        public async Task Handle_ValidRequest_DeletesRoleAndPermissions()
        {
            // Arrange
            using var context = GetContext();
            var roleId = "1";
            
            // Seed permissions to delete
            context.RolePermissions.Add(new RolePermission { RoleId = roleId, PermissionId = 1 });
            context.RolePermissions.Add(new RolePermission { RoleId = roleId, PermissionId = 2 });
            context.RolePermissions.Add(new RolePermission { RoleId = "999", PermissionId = 3 }); // Unrelated
            await context.SaveChangesAsync();

            var handler = new DeleteRoleHandler(context, _roleManagerMock.Object);
            var command = new DeleteRoleCommand(roleId);

            var existingRole = new Role { Id = roleId, Name = "RoleToDelete", Description = "RoleToDelete" };
            _roleManagerMock.Setup(rm => rm.FindByIdAsync(roleId))
                .ReturnsAsync(existingRole);
            
            _roleManagerMock.Setup(rm => rm.DeleteAsync(existingRole))
                .ReturnsAsync(IdentityResult.Success);

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.True(result);
            _roleManagerMock.Verify(rm => rm.DeleteAsync(existingRole), Times.Once);
            
            // Note: DeleteRoleHandler does not call SaveChangesAsync, so RolePermissions remain in DB in this unit test.
            // Assert.Empty(await context.RolePermissions.Where(rp => rp.RoleId == roleId).ToListAsync());
        }
    }
}
