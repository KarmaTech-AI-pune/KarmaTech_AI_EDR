using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Moq;
using Xunit;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using EDR.Application.CQRS.Roles.Commands;
using EDR.Application.CQRS.Roles.Handlers;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.Application.Dtos;
using EDR.Domain.Services;
using Microsoft.Extensions.Configuration;

namespace EDR.API.Tests.CQRS.Roles.Handlers
{
    public class CreateRoleHandlerTests : IDisposable
    {
        private readonly ProjectManagementContext _context;
        private readonly Mock<RoleManager<Role>> _mockRoleManager;
        private readonly CreateRoleHandler _handler;

        public CreateRoleHandlerTests()
        {
            var options = new DbContextOptionsBuilder<ProjectManagementContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            var mockCurrentTenantService = new Mock<ICurrentTenantService>();
            var mockConfig = new Mock<IConfiguration>();
            
            _context = new ProjectManagementContext(options, mockCurrentTenantService.Object, mockConfig.Object);

            var store = new Mock<IRoleStore<Role>>();
            _mockRoleManager = new Mock<RoleManager<Role>>(store.Object, null, null, null, null);

            _handler = new CreateRoleHandler(_context, _mockRoleManager.Object);
        }

        [Fact]
        public async Task Handle_ValidRequest_CreatesRoleAndPermissions()
        {
            // Arrange
            var command = new CreateRoleCommands(new RoleDefination
            {
                Name = "TestRole",
                MinRate = 10,
                IsResourceRole = true
            });

            _mockRoleManager.Setup(x => x.CreateAsync(It.IsAny<Role>()))
                .Callback<Role>(r => r.Id = "role_id_1")
                .ReturnsAsync(IdentityResult.Success);

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.True(result);
            _mockRoleManager.Verify(x => x.CreateAsync(It.Is<Role>(r => r.Name == "TestRole")), Times.Once);

            var rolesPermissionsInDb = await _context.Set<RolePermission>().ToListAsync();
            Assert.Empty(rolesPermissionsInDb);
        }

        [Fact]
        public async Task Handle_CreateRoleFails_ThrowsInvalidOperationException()
        {
            // Arrange
            var command = new CreateRoleCommands(new RoleDefination { Name = "FailRole" });
            _mockRoleManager.Setup(x => x.CreateAsync(It.IsAny<Role>()))
                .ReturnsAsync(IdentityResult.Failed(new IdentityError { Description = "Role creation failed" }));

            // Act & Assert
            var ex = await Assert.ThrowsAsync<InvalidOperationException>(() => _handler.Handle(command, CancellationToken.None));
            Assert.Contains("Role creation failed", ex.InnerException?.Message ?? ex.Message);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }
    }
}
