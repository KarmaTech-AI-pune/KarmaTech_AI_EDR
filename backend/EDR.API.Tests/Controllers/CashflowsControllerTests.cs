using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using EDR.Application.DTOs;
using EDR.Application.CQRS.Cashflow.Commands;
using EDR.Application.CQRS.Cashflow.Queries;
using EDR.API.Controllers;

namespace EDR.API.Tests.Controllers
{
    /// <summary>
    /// Unit tests for CashflowsController: GetAllCashflows, GetCashflow, CreateCashflow, UpdateCashflow, DeleteCashflow.
    /// </summary>
    public class CashflowsControllerTests
    {
        private readonly Mock<IMediator> _mediator;
        private readonly Mock<ILogger<CashflowsController>> _logger;
        private readonly CashflowsController _controller;

        public CashflowsControllerTests()
        {
            _mediator = new Mock<IMediator>();
            _logger = new Mock<ILogger<CashflowsController>>();
            _controller = new CashflowsController(_mediator.Object, _logger.Object);
        }

        // ==================== GetAllCashflows ====================

        [Fact]
        public async Task GetAllCashflows_ShouldReturnOk_WhenCashflowsExist()
        {
            // Arrange
            var cashflows = new List<CashflowDto>
            {
                new CashflowDto { Id = 1, ProjectId = 1, Month = "January", TotalProjectCost = 5000m },
                new CashflowDto { Id = 2, ProjectId = 1, Month = "February", TotalProjectCost = 6000m }
            };
            _mediator.Setup(m => m.Send(It.IsAny<GetAllCashflowsQuery>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync(cashflows);

            // Act
            var result = await _controller.GetAllCashflows(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnValue = Assert.IsAssignableFrom<List<CashflowDto>>(okResult.Value);
            Assert.Equal(2, returnValue.Count);
        }

        [Fact]
        public async Task GetAllCashflows_ShouldReturn500_WhenExceptionThrown()
        {
            // Arrange
            _mediator.Setup(m => m.Send(It.IsAny<GetAllCashflowsQuery>(), It.IsAny<CancellationToken>()))
                     .ThrowsAsync(new Exception("DB error"));

            // Act
            var result = await _controller.GetAllCashflows(1);

            // Assert
            var statusResult = Assert.IsType<ObjectResult>(result.Result);
            Assert.Equal(500, statusResult.StatusCode);
        }

        // ==================== GetCashflow ====================

        [Fact]
        public async Task GetCashflow_ShouldReturnOk_WhenFound()
        {
            // Arrange
            var cashflow = new CashflowDto { Id = 1, ProjectId = 1, Month = "January" };
            _mediator.Setup(m => m.Send(It.IsAny<GetCashflowQuery>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync(cashflow);

            // Act
            var result = await _controller.GetCashflow(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnValue = Assert.IsType<CashflowDto>(okResult.Value);
            Assert.Equal(1, returnValue.Id);
        }

        [Fact]
        public async Task GetCashflow_ShouldReturnNotFound_WhenNull()
        {
            // Arrange
            _mediator.Setup(m => m.Send(It.IsAny<GetCashflowQuery>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync((CashflowDto)null);

            // Act
            var result = await _controller.GetCashflow(999);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result.Result);
        }

        [Fact]
        public async Task GetCashflow_ShouldReturn500_WhenExceptionThrown()
        {
            // Arrange
            _mediator.Setup(m => m.Send(It.IsAny<GetCashflowQuery>(), It.IsAny<CancellationToken>()))
                     .ThrowsAsync(new Exception("DB error"));

            // Act
            var result = await _controller.GetCashflow(1);

            // Assert
            var statusResult = Assert.IsType<ObjectResult>(result.Result);
            Assert.Equal(500, statusResult.StatusCode);
        }

        // ==================== CreateCashflow ====================

        [Fact]
        public async Task CreateCashflow_ShouldReturnCreatedAtAction_WhenSuccessful()
        {
            // Arrange
            var dto = new CashflowDto { ProjectId = 1, Month = "March", TotalProjectCost = 7000m };
            var createdDto = new CashflowDto { Id = 10, ProjectId = 1, Month = "March", TotalProjectCost = 7000m };
            _mediator.Setup(m => m.Send(It.IsAny<CreateCashflowCommand>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync(createdDto);

            // Act
            var result = await _controller.CreateCashflow(1, dto);

            // Assert
            var createdResult = Assert.IsType<CreatedAtActionResult>(result.Result);
            Assert.Equal(nameof(_controller.GetCashflow), createdResult.ActionName);
        }

        [Fact]
        public async Task CreateCashflow_ShouldReturnBadRequest_WhenDtoIsNull()
        {
            // Act
            var result = await _controller.CreateCashflow(1, null);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result.Result);
        }

        [Fact]
        public async Task CreateCashflow_ShouldReturn500_WhenExceptionThrown()
        {
            // Arrange
            var dto = new CashflowDto { ProjectId = 1, Month = "March" };
            _mediator.Setup(m => m.Send(It.IsAny<CreateCashflowCommand>(), It.IsAny<CancellationToken>()))
                     .ThrowsAsync(new Exception("DB error"));

            // Act
            var result = await _controller.CreateCashflow(1, dto);

            // Assert
            var statusResult = Assert.IsType<ObjectResult>(result.Result);
            Assert.Equal(500, statusResult.StatusCode);
        }

        // ==================== UpdateCashflow ====================

        [Fact]
        public async Task UpdateCashflow_ShouldReturnOk_WhenSuccessful()
        {
            // Arrange
            var dto = new CashflowDto { Id = 5, ProjectId = 1, Month = "April", TotalProjectCost = 8000m };
            _mediator.Setup(m => m.Send<CashflowDto>(It.IsAny<UpdateCashflowCommand>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync(dto);

            // Act
            var result = await _controller.UpdateCashflow(1, 5, dto);

            // Assert
            Assert.IsType<OkObjectResult>(result.Result);
        }

        [Fact]
        public async Task UpdateCashflow_ShouldReturnBadRequest_WhenDtoIsNull()
        {
            // Act
            var result = await _controller.UpdateCashflow(1, 5, null);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result.Result);
        }

        [Fact]
        public async Task UpdateCashflow_ShouldReturnBadRequest_WhenIdMismatch()
        {
            // Arrange
            var dto = new CashflowDto { Id = 99, ProjectId = 1 };

            // Act
            var result = await _controller.UpdateCashflow(1, 5, dto);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result.Result);
        }

        [Fact]
        public async Task UpdateCashflow_ShouldReturnNotFound_WhenKeyNotFound()
        {
            // Arrange
            var dto = new CashflowDto { Id = 5, ProjectId = 1 };
            _mediator.Setup(m => m.Send(It.IsAny<UpdateCashflowCommand>(), It.IsAny<CancellationToken>()))
                     .ThrowsAsync(new KeyNotFoundException("Not found"));

            // Act
            var result = await _controller.UpdateCashflow(1, 5, dto);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result.Result);
        }

        [Fact]
        public async Task UpdateCashflow_ShouldReturn500_WhenExceptionThrown()
        {
            // Arrange
            var dto = new CashflowDto { Id = 5, ProjectId = 1 };
            _mediator.Setup(m => m.Send(It.IsAny<UpdateCashflowCommand>(), It.IsAny<CancellationToken>()))
                     .ThrowsAsync(new Exception("DB error"));

            // Act
            var result = await _controller.UpdateCashflow(1, 5, dto);

            // Assert
            var statusResult = Assert.IsType<ObjectResult>(result.Result);
            Assert.Equal(500, statusResult.StatusCode);
        }

        // ==================== DeleteCashflow ====================

        [Fact]
        public async Task DeleteCashflow_ShouldReturnNoContent_WhenSuccessful()
        {
            // Arrange
            _mediator.Setup(m => m.Send<Unit>(It.IsAny<DeleteCashflowCommand>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync(Unit.Value);

            // Act
            var result = await _controller.DeleteCashflow(1);

            // Assert
            Assert.IsType<NoContentResult>(result);
        }

        [Fact]
        public async Task DeleteCashflow_ShouldReturn500_WhenExceptionThrown()
        {
            // Arrange
            _mediator.Setup(m => m.Send(It.IsAny<DeleteCashflowCommand>(), It.IsAny<CancellationToken>()))
                     .ThrowsAsync(new Exception("DB error"));

            // Act
            var result = await _controller.DeleteCashflow(1);

            // Assert
            var statusResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, statusResult.StatusCode);
        }
    }
}
