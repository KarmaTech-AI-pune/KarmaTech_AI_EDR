using EDR.Application.CQRS.Users.Handlers;
using EDR.Application.CQRS.Users.Commands;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.Domain.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace EDR.API.Tests.CQRS.Users
{
    public class DeleteUserCommandHandlerTests : IDisposable
    {
        private readonly ProjectManagementContext _context;
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<Role> _roleManager;
        private readonly Mock<IHttpContextAccessor> _httpContextAccessorMock;
        private readonly DeleteUserCommandHandler _handler;

        public DeleteUserCommandHandlerTests()
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

            _httpContextAccessorMock = new Mock<IHttpContextAccessor>();

            _handler = new DeleteUserCommandHandler(_userManager, _httpContextAccessorMock.Object);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
            _userManager.Dispose();
            _roleManager.Dispose();
        }

        private void SetupCurrentUser(string userId)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, userId)
            };
            var identity = new ClaimsIdentity(claims, "Test");
            var principal = new ClaimsPrincipal(identity);
            
            var httpContext = new DefaultHttpContext { User = principal };
            _httpContextAccessorMock.Setup(x => x.HttpContext).Returns(httpContext);
        }

        [Fact]
        public async Task Handle_AdminDeletesUser_ReturnsTrue()
        {
            // Arrange
            var admin = new User { Id = "admin", UserName = "admin" };
            await _userManager.CreateAsync(admin);
            await _roleManager.CreateAsync(new Role { Name = "Admin", Description = "Admin" });
            await _userManager.AddToRoleAsync(admin, "Admin");

            var userToDelete = new User { Id = "user", UserName = "user" };
            await _userManager.CreateAsync(userToDelete);

            SetupCurrentUser(admin.Id);
            var command = new DeleteUserCommand(userToDelete.Id);

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.True(result);
            Assert.Null(await _userManager.FindByIdAsync("user"));
        }

        [Fact]
        public async Task Handle_TenantAdminDeletesRegularUser_ReturnsTrue()
        {
            // Arrange
            var tenantAdmin = new User { Id = "tadmin", UserName = "tadmin" };
            await _userManager.CreateAsync(tenantAdmin);
            await _roleManager.CreateAsync(new Role { Name = "TenantAdmin", Description = "TenantAdmin" });
            await _userManager.AddToRoleAsync(tenantAdmin, "TenantAdmin");

            var userToDelete = new User { Id = "user", UserName = "user" };
            await _userManager.CreateAsync(userToDelete);

            SetupCurrentUser(tenantAdmin.Id);
            var command = new DeleteUserCommand(userToDelete.Id);

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.True(result);
            Assert.Null(await _userManager.FindByIdAsync("user"));
        }

        [Fact]
        public async Task Handle_TenantAdminDeletesThemselves_ThrowsApplicationException()
        {
            // Arrange
            var tenantAdmin = new User { Id = "tadmin", UserName = "tadmin" };
            await _userManager.CreateAsync(tenantAdmin);
            await _roleManager.CreateAsync(new Role { Name = "TenantAdmin", Description = "TenantAdmin" });
            await _userManager.AddToRoleAsync(tenantAdmin, "TenantAdmin");

            SetupCurrentUser(tenantAdmin.Id);
            var command = new DeleteUserCommand(tenantAdmin.Id);

            // Act & Assert
            await Assert.ThrowsAsync<ApplicationException>(() => _handler.Handle(command, CancellationToken.None));
        }
    }
}
