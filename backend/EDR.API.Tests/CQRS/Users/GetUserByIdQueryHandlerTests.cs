using EDR.Application.CQRS.Users.Handlers;
using EDR.Application.CQRS.Users.Queries;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.Domain.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace EDR.API.Tests.CQRS.Users
{
    public class GetUserByIdQueryHandlerTests : IDisposable
    {
        private readonly ProjectManagementContext _context;
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<Role> _roleManager;
        private readonly GetUserByIdQueryHandler _handler;

        public GetUserByIdQueryHandlerTests()
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
            var userValidators = new List<IUserValidator<User>> { new UserValidator<User>() };
            var passwordValidators = new List<IPasswordValidator<User>> { new PasswordValidator<User>() };
            var lookupNormalizer = new UpperInvariantLookupNormalizer();
            var identityErrorDescriber = new IdentityErrorDescriber();
            var loggerUserManager = new Mock<ILogger<UserManager<User>>>().Object;

            _userManager = new UserManager<User>(
                userStore, optionsAccessor, passwordHasher, userValidators, passwordValidators,
                lookupNormalizer, identityErrorDescriber, null, loggerUserManager);

            var roleValidators = new List<IRoleValidator<Role>> { new RoleValidator<Role>() };
            var loggerRoleManager = new Mock<ILogger<RoleManager<Role>>>().Object;

            _roleManager = new RoleManager<Role>(
                roleStore, roleValidators, lookupNormalizer, identityErrorDescriber, loggerRoleManager);

            _handler = new GetUserByIdQueryHandler(_userManager, _roleManager);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
            _userManager.Dispose();
            _roleManager.Dispose();
        }

        [Fact]
        public async Task Handle_WithValidId_ReturnsUserDto()
        {
            // Arrange
            var userId = "user123";
            var user = new User
            {
                Id = userId,
                UserName = "testuser",
                Email = "test@example.com",
                Name = "Test User",
                StandardRate = 100,
                IsConsultant = true
            };

            await _userManager.CreateAsync(user);

            var roles = new[] { "Admin", "ProjectManager" };
            foreach (var roleName in roles)
            {
                await _roleManager.CreateAsync(new Role { Name = roleName, Description = roleName });
                await _userManager.AddToRoleAsync(user, roleName);
            }

            var query = new GetUserByIdQuery(userId);

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(userId, result.Id);
            Assert.Equal(user.UserName, result.UserName);
            Assert.Equal(user.Email, result.Email);
            Assert.Equal(user.Name, result.Name);
            Assert.Equal(user.StandardRate, result.StandardRate);
            Assert.Equal(user.IsConsultant, result.IsConsultant);
            Assert.Equal(2, result.Roles.Count);
            Assert.Contains(result.Roles, r => r.Name == "Admin");
            Assert.Contains(result.Roles, r => r.Name == "ProjectManager");
        }

        [Fact]
        public async Task Handle_WithInvalidId_ReturnsNull()
        {
            // Arrange
            var userId = "nonexistent";
            var query = new GetUserByIdQuery(userId);

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.Null(result);
        }
    }
}
