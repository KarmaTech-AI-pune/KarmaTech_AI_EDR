using EDR.Application.CQRS.Users.Handlers;
using EDR.Application.CQRS.Users.Commands;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.Domain.Services;
using EDR.Application.Dtos;
using EDR.Application.Services.IContract;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace EDR.API.Tests.CQRS.Users
{
    public class UpdateRolePermissionsCommandHandlerTests : IDisposable
    {
        private readonly ProjectManagementContext _context;
        private readonly Mock<IUserContext> _userContextMock;
        private readonly UpdateRolePermissionsCommandHandler _handler;

        public UpdateRolePermissionsCommandHandlerTests()
        {
            var options = new DbContextOptionsBuilder<ProjectManagementContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            var tenantMock = new Mock<ICurrentTenantService>();
            var configMock = new Mock<IConfiguration>();

            _context = new ProjectManagementContext(options, tenantMock.Object, configMock.Object);
            _userContextMock = new Mock<IUserContext>();

            _handler = new UpdateRolePermissionsCommandHandler(_context, _userContextMock.Object);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        [Fact]
        public async Task Handle_ValidRequest_UpdatesRoleAndPermissions()
        {
            // Arrange
            var roleId = "role1";
            var role = new Role { Id = roleId, Name = "OldName", NormalizedName = "OLDNAME", MinRate = 50, Description = "Old Desc" };
            _context.Roles.Add(role);
            
            _context.RolePermissions.Add(new RolePermission { RoleId = roleId, PermissionId = 1 });
            await _context.SaveChangesAsync();

            _userContextMock.Setup(u => u.GetCurrentUserId()).Returns("admin_user");

            var roleDefination = new RoleDefination
            {
                Name = "NewName",
                MinRate = 100,
                IsResourceRole = true,
                Permissions = new List<PermissionCategoryGroup>
                {
                    new PermissionCategoryGroup
                    {
                        Permissions = new List<PermissionDto>
                        {
                            new PermissionDto { Id = 2 }
                        }
                    }
                }
            };
            var command = new UpdateRolePermissionsCommand(roleId, roleDefination);

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.True(result);
            
            var updatedRole = await _context.Roles.FirstAsync(r => r.Id == roleId);
            Assert.Equal("NewName", updatedRole.Name);
            Assert.Equal("NEWNAME", updatedRole.NormalizedName);
            Assert.Equal(100, updatedRole.MinRate);

            var permissions = await _context.RolePermissions.Where(rp => rp.RoleId == roleId).ToListAsync();
            Assert.Single(permissions);
            Assert.Equal(2, permissions[0].PermissionId);
            Assert.Equal("admin_user", permissions[0].CreatedBy);
        }

        [Fact]
        public async Task Handle_RoleNotFound_ThrowsException()
        {
            // Arrange
            var command = new UpdateRolePermissionsCommand("nonexistent", new RoleDefination());

            // Act & Assert
            await Assert.ThrowsAsync<InvalidOperationException>(() => _handler.Handle(command, CancellationToken.None));
        }
    }
}
