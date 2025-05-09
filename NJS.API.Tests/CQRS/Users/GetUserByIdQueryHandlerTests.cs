using Microsoft.AspNetCore.Identity;
using Moq;
using NJS.Application.CQRS.Users.Handlers;
using NJS.Application.CQRS.Users.Queries;
using NJS.Domain.Entities;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace NJS.API.Tests.CQRS.Users
{
    public class GetUserByIdQueryHandlerTests
    {
        private readonly Mock<UserManager<User>> _userManagerMock;
        private readonly Mock<RoleManager<Role>> _roleManagerMock;
        private readonly GetUserByIdQueryHandler _handler;

        public GetUserByIdQueryHandlerTests()
        {
            // Mock UserManager
            var userStoreMock = new Mock<IUserStore<User>>();
            _userManagerMock = new Mock<UserManager<User>>(
                userStoreMock.Object, null, null, null, null, null, null, null, null);

            // Mock RoleManager
            var roleStoreMock = new Mock<IRoleStore<Role>>();
            _roleManagerMock = new Mock<RoleManager<Role>>(
                roleStoreMock.Object, null, null, null, null);

            _handler = new GetUserByIdQueryHandler(_userManagerMock.Object, _roleManagerMock.Object);
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

            var roles = new List<string> { "Admin", "ProjectManager" };

            _userManagerMock.Setup(m => m.FindByIdAsync(userId))
                .ReturnsAsync(user);

            _userManagerMock.Setup(m => m.GetRolesAsync(user))
                .ReturnsAsync(roles);

            var query = new GetUserByIdQuery { Id = userId };

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

            _userManagerMock.Setup(m => m.FindByIdAsync(userId))
                .ReturnsAsync((User)null);

            var query = new GetUserByIdQuery { Id = userId };

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.Null(result);
        }
    }
}
