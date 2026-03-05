using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using EDR.Application.Dtos;
using EDR.Application.CQRS.ChangeControl.Commands;
using EDR.Application.CQRS.ChangeControl.Queries;
using EDR.API.Controllers;
using System.Security.Claims;

namespace EDR.API.Tests.Controllers
{
    /// <summary>
    /// Unit tests for ChangeControlController: CRUD operations, project-id validation, error handling.
    /// </summary>
    public class ChangeControlControllerTests
    {
        private readonly Mock<IMediator> _mediator;
        private readonly Mock<ILogger<ChangeControlController>> _logger;
        private readonly ChangeControlController _controller;

        public ChangeControlControllerTests()
        {
            _mediator = new Mock<IMediator>();
            _logger = new Mock<ILogger<ChangeControlController>>();
            _controller = new ChangeControlController(_mediator.Object, _logger.Object);

            // Set up a fake identity so User.Identity.Name resolves
            var user = new ClaimsPrincipal(new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.Name, "testuser@test.com")
            }, "Test"));
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = user }
            };
        }

        private ChangeControlDto BuildDto(int id = 0, int projectId = 1) => new()
        {
            Id = id,
            ProjectId = projectId,
            SrNo = 1,
            DateLogged = DateTime.UtcNow,
            Originator = "Test",
            Description = "Test change",
            CostImpact = "Low",
            TimeImpact = "Low",
            ResourcesImpact = "Low",
            QualityImpact = "Low",
            ChangeOrderStatus = "Pending",
            ClientApprovalStatus = "Pending",
            ClaimSituation = "None"
        };

        // ==================== GetChangeControlsByProjectId ====================

        [Fact]
        public async Task GetChangeControlsByProjectId_ShouldReturnOk_WhenFound()
        {
            // Arrange
            var list = new List<ChangeControlDto> { BuildDto(1), BuildDto(2) };
            _mediator.Setup(m => m.Send(It.IsAny<GetChangeControlsByProjectIdQuery>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync(list);

            // Act
            var result = await _controller.GetChangeControlsByProjectId(1);

            // Assert
            var ok = Assert.IsType<OkObjectResult>(result.Result);
            Assert.IsAssignableFrom<IEnumerable<ChangeControlDto>>(ok.Value);
        }

        [Fact]
        public async Task GetChangeControlsByProjectId_ShouldReturn500_WhenExceptionThrown()
        {
            // Arrange
            _mediator.Setup(m => m.Send(It.IsAny<GetChangeControlsByProjectIdQuery>(), It.IsAny<CancellationToken>()))
                     .ThrowsAsync(new Exception("DB error"));

            // Act
            var result = await _controller.GetChangeControlsByProjectId(1);

            // Assert
            var statusResult = Assert.IsType<ObjectResult>(result.Result);
            Assert.Equal(500, statusResult.StatusCode);
        }

        // ==================== GetChangeControlById ====================

        [Fact]
        public async Task GetChangeControlById_ShouldReturnOk_WhenFound()
        {
            // Arrange
            var dto = BuildDto(10, 1);
            _mediator.Setup(m => m.Send(It.IsAny<GetChangeControlByIdQuery>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync(dto);

            // Act
            var result = await _controller.GetChangeControlById(1, 10);

            // Assert
            var ok = Assert.IsType<OkObjectResult>(result.Result);
            Assert.IsType<ChangeControlDto>(ok.Value);
        }

        [Fact]
        public async Task GetChangeControlById_ShouldReturnNotFound_WhenNull()
        {
            // Arrange
            _mediator.Setup(m => m.Send(It.IsAny<GetChangeControlByIdQuery>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync((ChangeControlDto)null);

            // Act
            var result = await _controller.GetChangeControlById(1, 999);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result.Result);
        }

        [Fact]
        public async Task GetChangeControlById_ShouldReturnNotFound_WhenProjectIdMismatch()
        {
            // Arrange – the DTO belongs to project 2 but we're requesting via project 1
            var dto = BuildDto(10, 2);
            _mediator.Setup(m => m.Send(It.IsAny<GetChangeControlByIdQuery>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync(dto);

            // Act
            var result = await _controller.GetChangeControlById(1, 10);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result.Result);
        }

        [Fact]
        public async Task GetChangeControlById_ShouldReturn500_WhenExceptionThrown()
        {
            // Arrange
            _mediator.Setup(m => m.Send(It.IsAny<GetChangeControlByIdQuery>(), It.IsAny<CancellationToken>()))
                     .ThrowsAsync(new Exception("DB error"));

            // Act
            var result = await _controller.GetChangeControlById(1, 10);

            // Assert
            var statusResult = Assert.IsType<ObjectResult>(result.Result);
            Assert.Equal(500, statusResult.StatusCode);
        }

        // ==================== CreateChangeControl ====================

        [Fact]
        public async Task CreateChangeControl_ShouldReturnCreated_WhenSuccessful()
        {
            // Arrange
            var dto = BuildDto(0, 1);
            var created = BuildDto(20, 1);
            _mediator.SetupSequence(m => m.Send(It.IsAny<IRequest<int>>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync(20); // CreateChangeControlCommand returns id
            _mediator.Setup(m => m.Send(It.IsAny<GetChangeControlByIdQuery>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync(created);

            // Act
            var result = await _controller.CreateChangeControl(1, dto);

            // Assert
            Assert.IsType<CreatedAtActionResult>(result.Result);
        }

        [Fact]
        public async Task CreateChangeControl_ShouldReturnBadRequest_WhenDtoIsNull()
        {
            // Act
            var result = await _controller.CreateChangeControl(1, null);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result.Result);
        }

        [Fact]
        public async Task CreateChangeControl_ShouldReturn500_WhenExceptionThrown()
        {
            // Arrange
            var dto = BuildDto(0, 1);
            _mediator.Setup(m => m.Send(It.IsAny<CreateChangeControlCommand>(), It.IsAny<CancellationToken>()))
                     .ThrowsAsync(new Exception("DB error"));

            // Act
            var result = await _controller.CreateChangeControl(1, dto);

            // Assert
            var statusResult = Assert.IsType<ObjectResult>(result.Result);
            Assert.Equal(500, statusResult.StatusCode);
        }

        // ==================== UpdateChangeControl ====================

        [Fact]
        public async Task UpdateChangeControl_ShouldReturnOk_WhenSuccessful()
        {
            // Arrange
            var dto = BuildDto(10, 1);
            _mediator.Setup(m => m.Send(It.IsAny<UpdateChangeControlCommand>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync(dto);

            // Act
            var result = await _controller.UpdateChangeControl(1, 10, dto);

            // Assert
            Assert.IsType<OkObjectResult>(result.Result);
        }

        [Fact]
        public async Task UpdateChangeControl_ShouldReturnBadRequest_WhenDtoIsNull()
        {
            // Act
            var result = await _controller.UpdateChangeControl(1, 10, null);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result.Result);
        }

        [Fact]
        public async Task UpdateChangeControl_ShouldReturnBadRequest_WhenIdMismatch()
        {
            // Arrange
            var dto = BuildDto(99, 1);

            // Act
            var result = await _controller.UpdateChangeControl(1, 10, dto);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result.Result);
        }

        [Fact]
        public async Task UpdateChangeControl_ShouldReturnBadRequest_WhenProjectIdMismatch()
        {
            // Arrange
            var dto = BuildDto(10, 2); // dto projectId=2, route projectId=1

            // Act
            var result = await _controller.UpdateChangeControl(1, 10, dto);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result.Result);
        }

        [Fact]
        public async Task UpdateChangeControl_ShouldReturnNotFound_WhenKeyNotFound()
        {
            // Arrange
            var dto = BuildDto(10, 1);
            _mediator.Setup(m => m.Send(It.IsAny<UpdateChangeControlCommand>(), It.IsAny<CancellationToken>()))
                     .ThrowsAsync(new KeyNotFoundException("Not found"));

            // Act
            var result = await _controller.UpdateChangeControl(1, 10, dto);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result.Result);
        }

        // ==================== DeleteChangeControl ====================

        [Fact]
        public async Task DeleteChangeControl_ShouldReturnNoContent_WhenSuccessful()
        {
            // Arrange
            var dto = BuildDto(10, 1);
            _mediator.SetupSequence(m => m.Send(It.IsAny<GetChangeControlByIdQuery>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync(dto);
            _mediator.Setup(m => m.Send(It.IsAny<DeleteChangeControlCommand>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync(Unit.Value);

            // Act
            var result = await _controller.DeleteChangeControl(1, 10);

            // Assert
            Assert.IsType<NoContentResult>(result);
        }

        [Fact]
        public async Task DeleteChangeControl_ShouldReturnNotFound_WhenDoesNotExist()
        {
            // Arrange
            _mediator.Setup(m => m.Send(It.IsAny<GetChangeControlByIdQuery>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync((ChangeControlDto)null);

            // Act
            var result = await _controller.DeleteChangeControl(1, 999);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        [Fact]
        public async Task DeleteChangeControl_ShouldReturnNotFound_WhenProjectMismatch()
        {
            // Arrange
            var dto = BuildDto(10, 2); // belongs to project 2
            _mediator.Setup(m => m.Send(It.IsAny<GetChangeControlByIdQuery>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync(dto);

            // Act
            var result = await _controller.DeleteChangeControl(1, 10);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        [Fact]
        public async Task DeleteChangeControl_ShouldReturn500_WhenExceptionThrown()
        {
            // Arrange
            _mediator.Setup(m => m.Send(It.IsAny<GetChangeControlByIdQuery>(), It.IsAny<CancellationToken>()))
                     .ThrowsAsync(new Exception("DB error"));

            // Act
            var result = await _controller.DeleteChangeControl(1, 10);

            // Assert
            var statusResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, statusResult.StatusCode);
        }
    }
}
