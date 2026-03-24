using EDR.Application.CQRS.Users.Handlers;
using EDR.Application.CQRS.Users.Queries;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.Domain.Services;
using EDR.Application.Dtos;
using EDR.Repositories.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
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
    public class UserQueryHandlersTests : IDisposable
    {
        private readonly ProjectManagementContext _context;
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<Role> _roleManager;
        private readonly Mock<IPermissionRepository> _permissionRepoMock;

        public UserQueryHandlersTests()
        {
            var options = new DbContextOptionsBuilder<ProjectManagementContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            var tenantMock = new Mock<ICurrentTenantService>();
            var configMock = new Mock<IConfiguration>();

            _context = new ProjectManagementContext(options, tenantMock.Object, configMock.Object);
            _permissionRepoMock = new Mock<IPermissionRepository>();

            var userStore = new UserStore<User, Role, ProjectManagementContext, string>(_context);
            var roleStore = new RoleStore<Role, ProjectManagementContext, string>(_context);
            
            // Minimal Identity setup
            _userManager = new UserManager<User>(userStore, null, null, null, null, null, null, null, null);
            _roleManager = new RoleManager<Role>(roleStore, null, null, null, null);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        [Fact]
        public async Task GetAllPermissionsQueryHandler_ReturnsMappedDtos()
        {
            // Arrange
            var permission = new Permission { Id = 1, Name = "P1", Description = "D1", Category = "Cat1" };
            _context.Permissions.Add(permission);
            await _context.SaveChangesAsync();

            var handler = new GetAllPermissionsQueryHandler(_context);
            var query = new GetAllPermissionsQuery();

            // Act
            var result = await handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Single(result);
            Assert.Equal("P1", result.First().Name);
        }

        [Fact]
        public async Task GetAllRolesQueryHandler_ReturnsAllRoles()
        {
            // Arrange
            await _roleManager.CreateAsync(new Role { Name = "Role1", Description = "Role1 Description" });
            var handler = new GetAllRolesQueryHandler(_roleManager);
            var query = new GetAllRolesQuery();

            // Act
            var result = await handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.Single(result);
            Assert.Equal("Role1", result.First().Name);
        }

        [Fact]
        public async Task GetRoleByNameQueryHandler_ReturnsRoleDto()
        {
            // Arrange
            await _roleManager.CreateAsync(new Role { Name = "targetrole", Description = "TargetRole Description" });
            var handler = new GetRoleByNameQueryHandler(_roleManager);
            var query = new GetRoleByNameQuery("targetrole");

            // Act
            var result = await handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("targetrole", result.Name);
        }

        [Fact]
        public async Task GetRolesByUserIdQueryHandler_ReturnsUserRoles()
        {
            // Arrange
            var user = new User { Id = "u1", UserName = "u1" };
            await _userManager.CreateAsync(user);
            await _roleManager.CreateAsync(new Role { Name = "R1", Description = "R1 Description" });
            await _userManager.AddToRoleAsync(user, "R1");

            var handler = new GetRolesByUserIdQueryHandler(_userManager, _roleManager);
            var query = new GetRolesByUserIdQuery(user);

            // Act
            var result = await handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.Single(result);
            Assert.Equal("R1", result.First().Name);
        }

        [Fact]
        public async Task GetAllRolesWithPermissionsQueryHandler_ReturnsRoleDefinations()
        {
            // Arrange
            await _roleManager.CreateAsync(new Role { Id = "role1", Name = "Admin", Description = "Admin Description" });
            _permissionRepoMock.Setup(repo => repo.GetPermissionsByRoleIdAsync("role1"))
                .ReturnsAsync(new List<Permission> { new Permission { Id = 1, Name = "P1", Category = "C1", Description = "D1" } });

            var handler = new GetAllRolesWithPermissionsQueryHandler(_roleManager, _permissionRepoMock.Object);
            var query = new GetAllRolesWithPermissionsQuery();

            // Act
            var result = await handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.Single(result);
            Assert.Equal("Admin", result[0].Name);
            Assert.Equal("P1", result[0].Permissions.First().Permissions.First().Name);
        }

        [Fact]
        public async Task GetUsersByRoleNameQueryHandler_ReturnsUsersInRole()
        {
            // Arrange
            var user = new User { Id = "u1", UserName = "admin_user" };
            await _userManager.CreateAsync(user);
            await _roleManager.CreateAsync(new Role { Name = "Admin", Description = "Admin Description" });
            await _userManager.AddToRoleAsync(user, "Admin");

            var handler = new GetUsersByRoleNameQueryHandler(_userManager, _roleManager);
            var query = new GetUsersByRoleNameQuery("Admin");

            // Act
            var result = await handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.Single(result);
            Assert.Equal("admin_user", result.First().UserName);
        }

        [Fact]
        public async Task GetRolePermissionsQueryHandler_ReturnsRolePermissions()
        {
            // Arrange
            var roleId = "role1";
            _context.Roles.Add(new Role { Id = roleId, Name = "Admin", Description = "Admin Description" });
            var p = new Permission { Id = 1, Name = "P1", Description = "D1", Category = "Cat1" };
            _context.Permissions.Add(p);
            _context.RolePermissions.Add(new RolePermission { RoleId = roleId, PermissionId = 1 });
            await _context.SaveChangesAsync();

            var handler = new GetRolePermissionsQueryHandler(_context);
            var query = new GetRolePermissionsQuery(roleId);

            // Act
            var result = await handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotEmpty(result);
            Assert.Contains(result, r => r.Id == 1 && r.Roles.Any(role => role.Id == roleId));
        }
        
        [Fact]
        public async Task GetPermissionsByGroupedByCategoryHandler_ReturnsGroupedPermissions()
        {
            // Arrange
            var permissions = new List<Permission>
            {
                new Permission { Id = 1, Name = "P1", Category = "Cat1" },
                new Permission { Id = 2, Name = "P2", Category = "Cat1" },
                new Permission { Id = 3, Name = "P3", Category = "Cat2" }
            };
            
            _permissionRepoMock.Setup(repo => repo.GetAllAsync()).ReturnsAsync(permissions);
            
            // Use reflection to access the internal handler
            var handlerType = typeof(GetPermissionsByGroupedByCategoryQuery).Assembly
                .GetType("EDR.Application.CQRS.Users.Handlers.GetPermissionsByGroupedByCategoryHandler");
            
            var handler = Activator.CreateInstance(handlerType, _permissionRepoMock.Object);
            var query = new GetPermissionsByGroupedByCategoryQuery();
            
            // Act
            var method = handlerType.GetMethod("Handle");
            var task = (Task<List<PermissionCategoryGroup>>)method.Invoke(handler, new object[] { query, CancellationToken.None });
            var result = await task;
            
            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Count);
            Assert.Contains(result, g => g.Category == "Cat1" && g.Permissions.Count == 2);
            Assert.Contains(result, g => g.Category == "Cat2" && g.Permissions.Count == 1);
        }
    }
}
