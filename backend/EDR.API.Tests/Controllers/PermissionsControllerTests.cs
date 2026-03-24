using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using EDR.API.Controllers;
using EDR.Application.CQRS.Permissions.Commands;
using EDR.Application.CQRS.Permissions.Queries;
using EDR.Application.Dtos;
using EDR.Application.Services.IContract;
using EDR.Repositories.Interfaces;

namespace EDR.API.Tests.Controllers
{
    public class PermissionsControllerTests
    {
        private readonly Mock<IMediator> _mediatorMock;
        private readonly Mock<ILogger<PermissionsController>> _loggerMock;
        private readonly Mock<ITenantService> _tenantServiceMock;
        private readonly Mock<ICurrentUserService> _currentUserServiceMock;
        private readonly PermissionsController _controller;

        public PermissionsControllerTests()
        {
            _mediatorMock = new Mock<IMediator>();
            _loggerMock = new Mock<ILogger<PermissionsController>>();
            _tenantServiceMock = new Mock<ITenantService>();
            _currentUserServiceMock = new Mock<ICurrentUserService>();
            
            _controller = new PermissionsController(
                _mediatorMock.Object, 
                _loggerMock.Object, 
                _tenantServiceMock.Object, 
                _currentUserServiceMock.Object);
        }

        [Fact]
        public async Task Create_ReturnsCreatedAtAction_WhenSuccessful()
        {
            // Arrange
            var dto = new PermissionDto { Id = 0, Name = "Read" };
            _mediatorMock.Setup(m => m.Send(It.IsAny<CreatePermissionCommand>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(1);

            // Act
            var result = await _controller.Create(dto);

            // Assert
            var createdResult = Assert.IsType<CreatedAtActionResult>(result);
            Assert.Equal("GetById", createdResult.ActionName);
            Assert.Equal(1, createdResult.Value);
        }

        [Fact]
        public async Task GetById_ReturnsOk_WhenFound()
        {
            // Arrange
            var dto = new PermissionDto { Id = 1, Name = "Read" };
            _mediatorMock.Setup(m => m.Send(It.IsAny<GetPermissionByIdQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(dto);

            // Act
            var result = await _controller.GetById(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Same(dto, okResult.Value);
        }

        [Fact]
        public async Task GetById_ReturnsNotFound_WhenNull()
        {
            // Arrange
            _mediatorMock.Setup(m => m.Send(It.IsAny<GetPermissionByIdQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((PermissionDto)null);

            // Act
            var result = await _controller.GetById(1);

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
            Assert.Contains("not found", notFoundResult.Value.ToString());
        }

        [Fact]
        public async Task GetAll_ReturnsOkResult()
        {
            // Arrange
            _mediatorMock.Setup(m => m.Send(It.IsAny<GetAllPermissionsQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new List<PermissionDto> { new PermissionDto() });

            // Act
            var result = await _controller.GetAll();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var list = Assert.IsAssignableFrom<IEnumerable<PermissionDto>>(okResult.Value);
            Assert.Single(list);
        }

        [Fact]
        public async Task Update_ReturnsOk_WhenSuccessful()
        {
            // Arrange
            var dto = new PermissionDto { Id = 1, Name = "Updated" };
            _mediatorMock.Setup(m => m.Send(It.IsAny<UpdatePermissionCommand>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);
            _mediatorMock.Setup(m => m.Send(It.IsAny<GetPermissionByIdQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(dto);

            // Act
            var result = await _controller.Update(1, dto);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Same(dto, okResult.Value);
        }

        [Fact]
        public async Task Update_ReturnsBadRequest_OnIdMismatch()
        {
            // Arrange
            var dto = new PermissionDto { Id = 2 };

            // Act
            var result = await _controller.Update(1, dto);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task Delete_ReturnsOk_WhenSuccessful()
        {
            // Arrange
            _mediatorMock.Setup(m => m.Send(It.IsAny<DeletePermissionCommand>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);

            // Act
            var result = await _controller.Delete(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(okResult.Value);
        }
    }
}
