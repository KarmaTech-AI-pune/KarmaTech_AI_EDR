using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using EDR.API.Controllers;
using EDR.Application.CQRS.Programs.Commands;
using EDR.Application.CQRS.Programs.Queries;
using EDR.Application.DTOs;
using EDR.Application.Services.IContract;
using EDR.Domain.Database;
using EDR.Domain.Services;
using EDR.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EDR.API.Tests.Controllers
{
    public class ProgramControllerTests
    {
        private readonly Mock<IMediator> _mediatorMock;
        private readonly Mock<EDR.Repositories.Interfaces.ITenantService> _tenantServiceMock;
        private readonly Mock<ICurrentUserService> _currentUserServiceMock;
        private readonly Mock<ICurrentTenantService> _currentTenantServiceMock;
        private readonly Mock<ILogger<ProgramController>> _loggerMock;
        private readonly ProgramController _controller;

        public ProgramControllerTests()
        {
            _mediatorMock = new Mock<IMediator>();
            _tenantServiceMock = new Mock<EDR.Repositories.Interfaces.ITenantService>();
            _currentUserServiceMock = new Mock<ICurrentUserService>();
            _currentTenantServiceMock = new Mock<ICurrentTenantService>();
            _loggerMock = new Mock<ILogger<ProgramController>>();

            var options = new DbContextOptionsBuilder<ProjectManagementContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            var context = new ProjectManagementContext(options, _currentTenantServiceMock.Object, new Mock<Microsoft.Extensions.Configuration.IConfiguration>().Object);

            _tenantServiceMock.Setup(t => t.ValidateTenantAccessAsync(It.IsAny<string>(), It.IsAny<int>()))
                .ReturnsAsync(true);
            _currentTenantServiceMock.SetupGet(c => c.TenantId).Returns(1);

            _controller = new ProgramController(
                _mediatorMock.Object,
                _tenantServiceMock.Object,
                _currentUserServiceMock.Object,
                _loggerMock.Object,
                context
            );

            var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.NameIdentifier, "user1"),
                new Claim(ClaimTypes.Name, "TestUser"),
                new Claim("tenantId", "1")
            }, "mock"));

            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = user }
            };
        }

        [Fact]
        public async Task Create_ValidData_ReturnsCreatedAtAction()
        {
            // Arrange
            var dto = new ProgramDto { Name = "Test Program", TenantId = 1 };
            _mediatorMock.Setup(m => m.Send(It.IsAny<CreateProgramCommand>(), CancellationToken.None))
                .ReturnsAsync(1);

            // Act
            var result = await _controller.Create(dto);

            // Assert
            var createdResult = Assert.IsType<CreatedAtActionResult>(result);
            Assert.Equal("GetById", createdResult.ActionName);
            Assert.Equal(1, createdResult.Value);
        }

        [Fact]
        public async Task GetById_ValidId_ReturnsOkResult()
        {
            // Arrange
            var dto = new ProgramDto { Id = 1, Name = "Test Program" };
            _mediatorMock.Setup(m => m.Send(It.IsAny<GetProgramByIdQuery>(), CancellationToken.None))
                .ReturnsAsync(dto);

            // Act
            var result = await _controller.GetById(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsType<ProgramDto>(okResult.Value);
            Assert.Equal(1, returnValue.Id);
        }

        [Fact]
        public async Task GetById_InvalidId_ReturnsNotFound()
        {
            // Arrange
            _mediatorMock.Setup(m => m.Send(It.IsAny<GetProgramByIdQuery>(), CancellationToken.None))
                .ReturnsAsync((ProgramDto)null);

            // Act
            var result = await _controller.GetById(99);

            // Assert
            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public async Task GetAll_ReturnsOkResult()
        {
            // Arrange
            var list = new ProgramDto[] { new ProgramDto { Id = 1 } };
            _mediatorMock.Setup(m => m.Send(It.IsAny<GetAllProgramsQuery>(), CancellationToken.None))
                .ReturnsAsync(list);

            // Act
            var result = await _controller.GetAll();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsType<ProgramDto[]>(okResult.Value);
            Assert.Single(returnValue);
        }

        [Fact]
        public async Task Update_ValidData_ReturnsOkResult()
        {
            // Arrange
            var dto = new ProgramDto { Id = 1, Name = "Updated Program" };
            _mediatorMock.Setup(m => m.Send(It.IsAny<UpdateProgramCommand>(), CancellationToken.None))
                .ReturnsAsync(Unit.Value);
            _mediatorMock.Setup(m => m.Send(It.IsAny<GetProgramByIdQuery>(), CancellationToken.None))
                .ReturnsAsync(dto);

            // Act
            var result = await _controller.Update(1, dto);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsType<ProgramDto>(okResult.Value);
            Assert.Equal(1, returnValue.Id);
            Assert.Equal("Updated Program", returnValue.Name);
        }

        [Fact]
        public async Task Update_IdMismatch_ReturnsBadRequest()
        {
            // Arrange
            var dto = new ProgramDto { Id = 2 };

            // Act
            var result = await _controller.Update(1, dto);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("ID mismatch", badRequestResult.Value);
        }

        [Fact]
        public async Task Delete_ValidId_ReturnsOk()
        {
            // Arrange
            _mediatorMock.Setup(m => m.Send(It.IsAny<DeleteProgramCommand>(), CancellationToken.None))
                .ReturnsAsync(Unit.Value);

            // Act
            var result = await _controller.Delete(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
        }
    }
}
