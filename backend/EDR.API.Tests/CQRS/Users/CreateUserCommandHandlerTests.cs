using EDR.Application.CQRS.Users.Handlers;
using EDR.Application.CQRS.Users.Commands;
using EDR.Application.CQRS.Email.Notifications;
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
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace EDR.API.Tests.CQRS.Users
{
    public class CreateUserCommandHandlerTests : IDisposable
    {
        private readonly ProjectManagementContext _context;
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<Role> _roleManager;
        private readonly Mock<IMediator> _mediatorMock;
        private readonly EDR.Application.CQRS.Users.Handlers.CreateUserCommandHandler _handler;

        public CreateUserCommandHandlerTests()
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

            _mediatorMock = new Mock<IMediator>();

            _handler = new EDR.Application.CQRS.Users.Handlers.CreateUserCommandHandler(_userManager, _roleManager, _mediatorMock.Object);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
            _userManager.Dispose();
            _roleManager.Dispose();
        }

        [Fact]
        public async Task Handle_ValidRequest_CreatesUserAndPublishesEmail()
        {
            // Arrange
            await _roleManager.CreateAsync(new Role { Name = "User", Description = "User Role" });

            var command = new CreateUserCommand
            {
                UserName = "newuser",
                Email = "new@example.com",
                Name = "New User",
                Password = "Password123!",
                Roles = new List<RoleDto> { new RoleDto { Name = "User" } },
                StandardRate = 50,
                IsConsultant = false
            };

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("newuser", result.UserName);
            Assert.Equal("new@example.com", result.Email);
            
            var createdUser = await _userManager.FindByNameAsync("newuser");
            Assert.NotNull(createdUser);
            Assert.True(await _userManager.IsInRoleAsync(createdUser, "User"));

            _mediatorMock.Verify(m => m.Publish(It.IsAny<UserRegistrationEmailNotification>(), It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task Handle_DuplicateUserName_ReturnsEmptyDto()
        {
            // Arrange
            var user = new User { UserName = "existing", Email = "other@example.com" };
            await _userManager.CreateAsync(user);

            var command = new CreateUserCommand
            {
                UserName = "existing",
                Email = "new@example.com"
            };

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.True(string.IsNullOrEmpty(result.UserName)); // CreateUserCommandHandler returns new UserDto() which has null or empty properties
        }
    }
}
