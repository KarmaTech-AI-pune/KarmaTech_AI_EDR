using EDR.Application.CQRS.Users.Handlers;
using EDR.Application.CQRS.Users.Commands;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.Domain.Services;
using EDR.Application.Dtos;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace EDR.API.Tests.CQRS.Users
{
    public class UpdateUserCommandHandlerTests : IDisposable
    {
        private readonly ProjectManagementContext _context;
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<Role> _roleManager;
        private readonly UpdateUserCommandHandler _handler;

        public UpdateUserCommandHandlerTests()
        {
            var options = new DbContextOptionsBuilder<ProjectManagementContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            var tenantMock = new Mock<ICurrentTenantService>();
            var configMock = new Mock<IConfiguration>();

            _context = new ProjectManagementContext(options, tenantMock.Object, configMock.Object);

            var userStore = new UserStore<User, Role, ProjectManagementContext, string>(_context);
            var roleStore = new RoleStore<Role, ProjectManagementContext, string>(_context);

            var optionsAccessor = Options.Create(new IdentityOptions());
            var passwordHasher = new PasswordHasher<User>();
            var lookupNormalizer = new UpperInvariantLookupNormalizer();
            var identityErrorDescriber = new IdentityErrorDescriber();
            var loggerUserManager = new Mock<ILogger<UserManager<User>>>().Object;

            _userManager = new UserManager<User>(
                userStore, optionsAccessor, passwordHasher, null, null,
                lookupNormalizer, identityErrorDescriber, null, loggerUserManager);

            var loggerRoleManager = new Mock<ILogger<RoleManager<Role>>>().Object;
            _roleManager = new RoleManager<Role>(
                roleStore, null, lookupNormalizer, identityErrorDescriber, loggerRoleManager);

            _handler = new UpdateUserCommandHandler(_userManager, _roleManager);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
            _userManager.Dispose();
            _roleManager.Dispose();
        }

        [Fact]
        public async Task Handle_ValidRequest_UpdatesUserAndRoles()
        {
            // Arrange
            var user = new User { Id = "user1", UserName = "olduser", Email = "old@example.com", Name = "Old Name" };
            await _userManager.CreateAsync(user);
            
            await _roleManager.CreateAsync(new Role { Name = "OldRole", Description = "OldRole" });
            await _roleManager.CreateAsync(new Role { Name = "NewRole", Description = "NewRole" });
            await _userManager.AddToRoleAsync(user, "OldRole");

            var command = new UpdateUserCommand
            {
                Id = "user1",
                UserName = "newuser",
                Name = "New Name",
                Roles = new List<RoleDto> { new RoleDto { Name = "NewRole" } }
            };

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("newuser", result.UserName);
            Assert.Equal("New Name", result.Name);
            
            var updatedUser = await _userManager.FindByIdAsync("user1");
            Assert.Equal("newuser", updatedUser.UserName);
            
            var roles = await _userManager.GetRolesAsync(updatedUser);
            Assert.Single(roles);
            Assert.Equal("NewRole", roles[0]);
        }

        [Fact]
        public async Task Handle_UserNotFound_ThrowsException()
        {
            // Arrange
            var command = new UpdateUserCommand { Id = "nonexistent" };

            // Act & Assert
            await Assert.ThrowsAsync<Exception>(() => _handler.Handle(command, CancellationToken.None));
        }
    }
}
