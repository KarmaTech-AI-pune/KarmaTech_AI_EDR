using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using Moq;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using Xunit;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace EDR.API.Tests.Database
{
    public class DomainSeedersTests
    {
        private readonly Mock<RoleManager<Role>> _roleManagerMock;
        private readonly Mock<UserManager<User>> _userManagerMock;
        private readonly Mock<ILogger<RoleSeeder>> _roleLoggerMock;

        public DomainSeedersTests()
        {
            var roleStoreMock = new Mock<IRoleStore<Role>>();
            _roleManagerMock = new Mock<RoleManager<Role>>(
                roleStoreMock.Object, null, null, null, null);

            var userStoreMock = new Mock<IUserStore<User>>();
            _userManagerMock = new Mock<UserManager<User>>(
                userStoreMock.Object, null, null, null, null, null, null, null, null);

            _roleLoggerMock = new Mock<ILogger<RoleSeeder>>();
        }

        [Fact]
        public async Task RoleSeeder_SeedsRoles_WhenTheyDoNotExist()
        {
            // Arrange
            _roleManagerMock.Setup(x => x.FindByNameAsync(It.IsAny<string>()))
                .ReturnsAsync((Role)null);
            _roleManagerMock.Setup(x => x.CreateAsync(It.IsAny<Role>()))
                .ReturnsAsync(IdentityResult.Success);

            var seeder = new RoleSeeder(_roleManagerMock.Object, _roleLoggerMock.Object);

            // Act
            await seeder.SeedRolesAsync();

            // Assert
            _roleManagerMock.Verify(x => x.CreateAsync(It.IsAny<Role>()), Times.Exactly(4));
        }

        [Fact]
        public async Task RoleSeeder_UpdatesRoles_WhenDescriptionDiffers()
        {
            // Arrange
            var existingRole = new Role { Name = "Admin", Description = "Old" };
            _roleManagerMock.Setup(x => x.FindByNameAsync("Admin")).ReturnsAsync(existingRole);
            _roleManagerMock.Setup(x => x.FindByNameAsync(It.Is<string>(s => s != "Admin"))).ReturnsAsync(new Role { Name = "Other", Description = "Full system access with administrative privileges" }); // Match seeded description to skip update
            
            // To make sure other roles don't trigger update:
            _roleManagerMock.Setup(x => x.FindByNameAsync("ProjectManager")).ReturnsAsync(new Role { Name = "ProjectManager", Description = "Can manage projects, create and modify project details" });
            _roleManagerMock.Setup(x => x.FindByNameAsync("Analyst")).ReturnsAsync(new Role { Name = "Analyst", Description = "Can view and analyze project data" });
            _roleManagerMock.Setup(x => x.FindByNameAsync("Viewer")).ReturnsAsync(new Role { Name = "Viewer", Description = "Read-only access to project information" });

            _roleManagerMock.Setup(x => x.UpdateAsync(It.IsAny<Role>())).ReturnsAsync(IdentityResult.Success);

            var seeder = new RoleSeeder(_roleManagerMock.Object, _roleLoggerMock.Object);

            // Act
            await seeder.SeedRolesAsync();

            // Assert
            _roleManagerMock.Verify(x => x.UpdateAsync(It.Is<Role>(r => r.Name == "Admin")), Times.Once);
        }

        [Fact]
        public async Task UserSeeder_SeedsAdminUser_WhenNotExists()
        {
            // Arrange
            _userManagerMock.Setup(x => x.FindByEmailAsync(It.IsAny<string>()))
                .ReturnsAsync((User)null);
            _userManagerMock.Setup(x => x.CreateAsync(It.IsAny<User>(), It.IsAny<string>()))
                .ReturnsAsync(IdentityResult.Success);
            _roleManagerMock.Setup(x => x.FindByNameAsync("Admin"))
                .ReturnsAsync(new Role { Name = "Admin" });
            _userManagerMock.Setup(x => x.AddToRoleAsync(It.IsAny<User>(), "Admin"))
                .ReturnsAsync(IdentityResult.Success);

            // Act
            await UserSeeder.SeedAdminUserAsync(_userManagerMock.Object, _roleManagerMock.Object);

            // Assert
            _userManagerMock.Verify(x => x.CreateAsync(It.IsAny<User>(), It.IsAny<string>()), Times.Once);
            _userManagerMock.Verify(x => x.AddToRoleAsync(It.IsAny<User>(), "Admin"), Times.Once);
        }

        [Fact]
        public async Task UserSeeder_ThrowsException_OnCreateFailure()
        {
            // Arrange
            _userManagerMock.Setup(x => x.FindByEmailAsync(It.IsAny<string>()))
                .ReturnsAsync((User)null);
            _userManagerMock.Setup(x => x.CreateAsync(It.IsAny<User>(), It.IsAny<string>()))
                .ReturnsAsync(IdentityResult.Failed(new IdentityError { Description = "Error" }));

            // Act & Assert
            await Assert.ThrowsAsync<InvalidOperationException>(() => 
                UserSeeder.SeedAdminUserAsync(_userManagerMock.Object, _roleManagerMock.Object));
        }

        [Fact]
        public async Task RoleSeeder_LogsError_OnCreateFailure()
        {
             // Arrange
            _roleManagerMock.Setup(x => x.FindByNameAsync(It.IsAny<string>()))
                .ReturnsAsync((Role)null);
            _roleManagerMock.Setup(x => x.CreateAsync(It.IsAny<Role>()))
                .ReturnsAsync(IdentityResult.Failed(new IdentityError { Description = "Error" }));

            var seeder = new RoleSeeder(_roleManagerMock.Object, _roleLoggerMock.Object);

            // Act
            await seeder.SeedRolesAsync();

            // Assert
            _roleLoggerMock.Verify(
                x => x.Log(
                    LogLevel.Error,
                    It.IsAny<EventId>(),
                    It.Is<It.IsAnyType>((v, t) => v.ToString().Contains("Failed to create role")),
                    It.IsAny<Exception>(),
                    It.IsAny<Func<It.IsAnyType, Exception, string>>()),
                Times.AtLeastOnce);
        }
    }
}
