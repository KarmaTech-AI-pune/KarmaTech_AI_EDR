using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;
using EDR.API.Controllers;
using EDR.Domain.Entities;
using MockQueryable.Moq;

namespace EDR.API.Tests.Controllers
{
    public class ResourceControllerTests
    {
        private readonly Mock<UserManager<User>> _userManagerMock;
        private readonly Mock<RoleManager<Role>> _roleManagerMock;
        private readonly ResourceController _controller;

        public ResourceControllerTests()
        {
            var userStoreMock = new Mock<IUserStore<User>>();
            _userManagerMock = new Mock<UserManager<User>>(
                userStoreMock.Object, null, null, null, null, null, null, null, null);

            var roleStoreMock = new Mock<IRoleStore<Role>>();
            _roleManagerMock = new Mock<RoleManager<Role>>(
                roleStoreMock.Object, null, null, null, null);

            _controller = new ResourceController(_userManagerMock.Object, _roleManagerMock.Object);
        }

        [Fact]
        public async Task GetResourceRoles_ReturnsOk()
        {
            // Arrange
            var roles = new List<Role> 
            { 
                new Role { Id = "1", Name = "Role1", IsResourceRole = true } 
            }.AsQueryable();

            _roleManagerMock.Setup(r => r.Roles).Returns(roles.BuildMock());

            // Act
            var result = await _controller.GetResourceRoles();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(okResult.Value);
        }

        [Fact]
        public async Task GetEmployees_ReturnsOk()
        {
            // Arrange
            var users = new List<User> 
            { 
                new User { Id = "1", Name = "User1", IsActive = true } 
            }.AsQueryable();

            _userManagerMock.Setup(u => u.Users).Returns(users.BuildMock());
            _userManagerMock.Setup(u => u.GetRolesAsync(It.IsAny<User>()))
                .ReturnsAsync(new List<string>());

            // Act
            var result = await _controller.GetEmployees();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(okResult.Value);
        }

        [Fact]
        public async Task GetEmployeeById_ReturnsOk_WhenFound()
        {
            // Arrange
            var user = new User { Id = "1", Name = "User1", IsActive = true };
            _userManagerMock.Setup(u => u.FindByIdAsync("1"))
                .ReturnsAsync(user);
            _userManagerMock.Setup(u => u.GetRolesAsync(It.IsAny<User>()))
                .ReturnsAsync(new List<string>());

            // Act
            var result = await _controller.GetEmployeeById("1");

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(okResult.Value);
        }

        [Fact]
        public async Task GetEmployeeById_ReturnsNotFound_WhenInactiveOrMissing()
        {
            // Arrange
            var user = new User { Id = "1", IsActive = false };
            _userManagerMock.Setup(u => u.FindByIdAsync("1"))
                .ReturnsAsync(user);

            // Act
            var result = await _controller.GetEmployeeById("1");

            // Assert
            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public async Task GetProjectResources_ReturnsOk()
        {
            // Arrange
            var user = new User { Id = "1", Name = "User1", IsActive = true };
            user.ProjectResources.Add(new ProjectResource { ProjectId = 1, ProjectRate = 100 });
            var users = new List<User> { user }.AsQueryable();

            _userManagerMock.Setup(u => u.Users).Returns(users.BuildMock());
            _userManagerMock.Setup(u => u.GetRolesAsync(It.IsAny<User>()))
                .ReturnsAsync(new List<string>());

            // Act
            var result = await _controller.GetProjectResources(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(okResult.Value);
        }
    }
}
