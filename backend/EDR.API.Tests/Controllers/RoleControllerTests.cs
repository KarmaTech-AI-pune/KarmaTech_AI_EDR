using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;
using EDR.API.Controllers;
using EDR.Application.CQRS.Roles.Commands;
using EDR.Application.CQRS.Users.Commands;
using EDR.Application.CQRS.Users.Queries;
using EDR.Application.Dtos;
using EDR.Domain.Entities;

namespace EDR.API.Tests.Controllers
{
    public class RoleControllerTests
    {
        private readonly Mock<IMediator> _mediatorMock;
        private readonly RoleController _controller;

        public RoleControllerTests()
        {
            _mediatorMock = new Mock<IMediator>();
            _controller = new RoleController(_mediatorMock.Object);
        }

        [Fact]
        public async Task GetRoles_ReturnsOk()
        {
            // GetAllRolesQuery returns IEnumerable<Role>
            _mediatorMock.Setup(m => m.Send(It.IsAny<GetAllRolesQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new List<Role>());

            var result = await _controller.GetRoles();

            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task GetRolesWithPermissions_ReturnsOk()
        {
            // GetAllRolesWithPermissionsQuery returns IList<RoleDefination>
            _mediatorMock.Setup(m => m.Send(It.IsAny<GetAllRolesWithPermissionsQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new List<RoleDefination>());

            var result = await _controller.GetRolesWithPermissions();

            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task GetPermissionsByGroupedByCategory_ReturnsOk()
        {
            // Returns List<PermissionCategoryGroup>
            _mediatorMock.Setup(m => m.Send(It.IsAny<GetPermissionsByGroupedByCategoryQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new List<PermissionCategoryGroup>());

            var result = await _controller.GetPermissionsByGroupedByCategory();

            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task GetRolePermissions_ReturnsOk()
        {
            _mediatorMock.Setup(m => m.Send(It.IsAny<GetAllPermissionsQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new List<PermissionDto>());

            var result = await _controller.GetRolePermissions("role1");

            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            Assert.NotNull(okResult.Value);
        }

        [Fact]
        public async Task CreateRole_ReturnsOk_WhenCreated()
        {
            var roles = new List<RoleDefination> { new RoleDefination() };
            _mediatorMock.Setup(m => m.Send(It.IsAny<CreateRoleCommands>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);

            var result = await _controller.CreateRole(roles);

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(okResult.Value);
        }

        [Fact]
        public async Task CreateRole_ReturnsBadRequest_WhenNoneCreated()
        {
            var roles = new List<RoleDefination> { new RoleDefination() };
            _mediatorMock.Setup(m => m.Send(It.IsAny<CreateRoleCommands>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(false);

            var result = await _controller.CreateRole(roles);

            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task UpdateRolePermissions_ReturnsOk()
        {
            // UpdateRolePermissionsCommand returns bool
            _mediatorMock.Setup(m => m.Send(It.IsAny<UpdateRolePermissionsCommand>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);

            var result = await _controller.UpdateRolePermissions("1", new RoleDefination());

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(okResult.Value);
        }

        [Fact]
        public async Task GetRoleByName_ReturnsOk()
        {
            _mediatorMock.Setup(m => m.Send(It.IsAny<GetRoleByNameQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new RoleDto());

            var result = await _controller.GetRoleByName("admin");

            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            Assert.NotNull(okResult.Value);
        }

        [Fact]
        public async Task Delete_ReturnsOk_WhenSuccessful()
        {
            _mediatorMock.Setup(m => m.Send(It.IsAny<DeleteRoleCommand>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);

            var result = await _controller.Delete("1");

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(okResult.Value);
        }

        [Fact]
        public async Task Delete_ReturnsBadRequest_WhenFailed()
        {
            _mediatorMock.Setup(m => m.Send(It.IsAny<DeleteRoleCommand>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(false);

            var result = await _controller.Delete("1");

            Assert.IsType<BadRequestObjectResult>(result);
        }
    }
}
