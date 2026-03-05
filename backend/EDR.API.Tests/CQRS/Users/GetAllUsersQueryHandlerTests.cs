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
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace EDR.API.Tests.CQRS.Users
{
    public class GetAllUsersQueryHandlerTests : IDisposable
    {
        private readonly ProjectManagementContext _context;
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<Role> _roleManager;
        private readonly GetAllUsersQueryHandler _handler;

        public GetAllUsersQueryHandlerTests()
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

            _handler = new GetAllUsersQueryHandler(_userManager, _roleManager);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
            _userManager.Dispose();
            _roleManager.Dispose();
        }

        [Fact]
        public async Task Handle_NoFilters_ReturnsAllUsers()
        {
            // Arrange
            await _userManager.CreateAsync(new User { UserName = "user1", Email = "u1@e.com", Name = "User 1" });
            await _userManager.CreateAsync(new User { UserName = "user2", Email = "u2@e.com", Name = "User 2" });

            var query = new GetAllUsersQuery();

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Count());
        }

        [Fact]
        public async Task Handle_WithSearchTerm_FiltersCorrectly()
        {
            // Arrange
            await _userManager.CreateAsync(new User { UserName = "alice", Email = "a@e.com", Name = "Alice" });
            await _userManager.CreateAsync(new User { UserName = "bob", Email = "b@e.com", Name = "Bob" });

            var query = new GetAllUsersQuery { SearchTerm = "ice" };

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.Single(result);
            Assert.Equal("alice", result.First().UserName);
        }

        [Fact]
        public async Task Handle_WithRoleFilter_FiltersCorrectly()
        {
            // Arrange
            var user1 = new User { UserName = "admin_user", Email = "admin@e.com", Name = "Admin" };
            var user2 = new User { UserName = "regular_user", Email = "reg@e.com", Name = "Regular" };
            await _userManager.CreateAsync(user1);
            await _userManager.CreateAsync(user2);

            await _roleManager.CreateAsync(new Role { Name = "Admin", Description = "Admin Description" });
            await _userManager.AddToRoleAsync(user1, "Admin");

            var query = new GetAllUsersQuery { RoleFilter = "Admin" };

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.Single(result);
            Assert.Equal("admin_user", result.First().UserName);
        }

        [Fact]
        public async Task Handle_WithPagination_ReturnsPagedResults()
        {
            // Arrange
            for (int i = 1; i <= 5; i++)
            {
                await _userManager.CreateAsync(new User { UserName = $"user{i}", Email = $"u{i}@e.com", Name = $"User {i}" });
            }

            var query = new GetAllUsersQuery { PageNumber = 2, PageSize = 2 };

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.Equal(2, result.Count());
            // Based on OrderBy(UserName), Page 2 with Size 2 should be user3, user4
            var list = result.ToList();
            Assert.Equal("user3", list[0].UserName);
            Assert.Equal("user4", list[1].UserName);
        }
    }
}
