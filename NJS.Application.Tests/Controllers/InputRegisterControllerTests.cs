using MediatR;
using Microsoft.AspNetCore.Mvc;
using Moq;
using NJS.Application.Tests.CQRS.InputRegister.Commands;
using NJS.Application.Tests.CQRS.InputRegister.Queries;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace NJS.Application.Tests.Controllers
{
    public class InputRegisterControllerTests
    {
        private readonly Mock<IMediator> _mediator;
        private readonly InputRegisterController _controller;

        public InputRegisterControllerTests()
        {
            _mediator = new Mock<IMediator>();
            _controller = new InputRegisterController(_mediator.Object);
        }

        #region GetAll Tests

        [Fact]
        public async Task GetAll_ReturnsOkResult_WithListOfInputRegisters()
        {
            // Arrange
            var inputRegisters = new List<InputRegisterDto>
            {
                new InputRegisterDto { Id = 1, DataReceived = "Test Data 1" },
                new InputRegisterDto { Id = 2, DataReceived = "Test Data 2" }
            };

            _mediator.Setup(m => m.Send(It.IsAny<GetAllInputRegistersQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(inputRegisters);

            // Act
            var result = await _controller.GetAll();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsAssignableFrom<IEnumerable<InputRegisterDto>>(okResult.Value);
            Assert.Equal(2, returnValue.Count());
        }

        [Fact]
        public async Task GetAll_ReturnsBadRequest_WhenExceptionOccurs()
        {
            // Arrange
            _mediator.Setup(m => m.Send(It.IsAny<GetAllInputRegistersQuery>(), It.IsAny<CancellationToken>()))
                .ThrowsAsync(new Exception("Test exception"));

            // Act
            var result = await _controller.GetAll();

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Contains("Test exception", badRequestResult.Value.ToString());
        }

        #endregion

        #region GetById Tests

        [Fact]
        public async Task GetById_ReturnsOkResult_WithInputRegister_WhenIdExists()
        {
            // Arrange
            var id = 1;
            var inputRegister = new InputRegisterDto { Id = id, DataReceived = "Test Data" };

            _mediator.Setup(m => m.Send(It.Is<GetInputRegisterByIdQuery>(q => q.Id == id), It.IsAny<CancellationToken>()))
                .ReturnsAsync(inputRegister);

            // Act
            var result = await _controller.GetById(id);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsType<InputRegisterDto>(okResult.Value);
            Assert.Equal(id, returnValue.Id);
        }

        [Fact]
        public async Task GetById_ReturnsNotFound_WhenIdDoesNotExist()
        {
            // Arrange
            var id = 999;

            _mediator.Setup(m => m.Send(It.Is<GetInputRegisterByIdQuery>(q => q.Id == id), It.IsAny<CancellationToken>()))
                .ReturnsAsync((InputRegisterDto)null);

            // Act
            var result = await _controller.GetById(id);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        [Fact]
        public async Task GetById_ReturnsBadRequest_WhenExceptionOccurs()
        {
            // Arrange
            var id = 1;

            _mediator.Setup(m => m.Send(It.Is<GetInputRegisterByIdQuery>(q => q.Id == id), It.IsAny<CancellationToken>()))
                .ThrowsAsync(new Exception("Test exception"));

            // Act
            var result = await _controller.GetById(id);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Contains("Test exception", badRequestResult.Value.ToString());
        }

        #endregion

        #region GetByProject Tests

        [Fact]
        public async Task GetByProject_ReturnsOkResult_WithListOfInputRegisters()
        {
            // Arrange
            var projectId = 1;
            var inputRegisters = new List<InputRegisterDto>
            {
                new InputRegisterDto { Id = 1, ProjectId = projectId, DataReceived = "Test Data 1" },
                new InputRegisterDto { Id = 2, ProjectId = projectId, DataReceived = "Test Data 2" }
            };

            _mediator.Setup(m => m.Send(It.Is<GetInputRegistersByProjectQuery>(q => q.ProjectId == projectId), It.IsAny<CancellationToken>()))
                .ReturnsAsync(inputRegisters);

            // Act
            var result = await _controller.GetByProject(projectId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsAssignableFrom<IEnumerable<InputRegisterDto>>(okResult.Value);
            Assert.Equal(2, returnValue.Count());
        }

        [Fact]
        public async Task GetByProject_ReturnsOkResult_WithEmptyList_WhenProjectHasNoInputRegisters()
        {
            // Arrange
            var projectId = 999;
            var inputRegisters = new List<InputRegisterDto>();

            _mediator.Setup(m => m.Send(It.Is<GetInputRegistersByProjectQuery>(q => q.ProjectId == projectId), It.IsAny<CancellationToken>()))
                .ReturnsAsync(inputRegisters);

            // Act
            var result = await _controller.GetByProject(projectId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsAssignableFrom<IEnumerable<InputRegisterDto>>(okResult.Value);
            Assert.Empty(returnValue);
        }

        [Fact]
        public async Task GetByProject_ReturnsBadRequest_WhenExceptionOccurs()
        {
            // Arrange
            var projectId = 1;

            _mediator.Setup(m => m.Send(It.Is<GetInputRegistersByProjectQuery>(q => q.ProjectId == projectId), It.IsAny<CancellationToken>()))
                .ThrowsAsync(new Exception("Test exception"));

            // Act
            var result = await _controller.GetByProject(projectId);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Contains("Test exception", badRequestResult.Value.ToString());
        }

        #endregion

        #region Create Tests

        [Fact]
        public async Task Create_ReturnsCreatedAtActionResult_WithNewInputRegister()
        {
            // Arrange
            var command = new CreateInputRegisterCommand
            {
                ProjectId = 1,
                DataReceived = "Test Data",
                ReceiptDate = DateTime.Now,
                ReceivedFrom = "Test User",
                FilesFormat = "PDF",
                NoOfFiles = 1,
                FitForPurpose = true,
                Check = true
            };

            var createdInputRegister = new InputRegisterDto
            {
                Id = 1,
                ProjectId = command.ProjectId,
                DataReceived = command.DataReceived,
                ReceiptDate = command.ReceiptDate,
                ReceivedFrom = command.ReceivedFrom,
                FilesFormat = command.FilesFormat,
                NoOfFiles = command.NoOfFiles,
                FitForPurpose = command.FitForPurpose,
                Check = command.Check
            };

            _mediator.Setup(m => m.Send(command, It.IsAny<CancellationToken>()))
                .ReturnsAsync(createdInputRegister);

            // Act
            var result = await _controller.Create(command);

            // Assert
            var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(result);
            Assert.Equal(nameof(InputRegisterController.GetById), createdAtActionResult.ActionName);
            Assert.Equal(createdInputRegister.Id, createdAtActionResult.RouteValues["id"]);
            var returnValue = Assert.IsType<InputRegisterDto>(createdAtActionResult.Value);
            Assert.Equal(createdInputRegister.Id, returnValue.Id);
        }

        [Fact]
        public async Task Create_ReturnsBadRequest_WhenModelStateIsInvalid()
        {
            // Arrange
            var command = new CreateInputRegisterCommand(); // Invalid command with missing required fields
            _controller.ModelState.AddModelError("DataReceived", "Required");

            // Act
            var result = await _controller.Create(command);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task Create_ReturnsBadRequest_WhenExceptionOccurs()
        {
            // Arrange
            var command = new CreateInputRegisterCommand
            {
                ProjectId = 1,
                DataReceived = "Test Data",
                ReceiptDate = DateTime.Now,
                ReceivedFrom = "Test User",
                FilesFormat = "PDF",
                NoOfFiles = 1,
                FitForPurpose = true,
                Check = true
            };

            _mediator.Setup(m => m.Send(command, It.IsAny<CancellationToken>()))
                .ThrowsAsync(new Exception("Test exception"));

            // Act
            var result = await _controller.Create(command);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Contains("Test exception", badRequestResult.Value.ToString());
        }

        #endregion

        #region Update Tests

        [Fact]
        public async Task Update_ReturnsOkResult_WithUpdatedInputRegister()
        {
            // Arrange
            var id = 1;
            var command = new UpdateInputRegisterCommand
            {
                Id = id,
                ProjectId = 1,
                DataReceived = "Updated Data",
                ReceiptDate = DateTime.Now,
                ReceivedFrom = "Updated User",
                FilesFormat = "PDF",
                NoOfFiles = 1,
                FitForPurpose = true,
                Check = true
            };

            var updatedInputRegister = new InputRegisterDto
            {
                Id = id,
                ProjectId = command.ProjectId,
                DataReceived = command.DataReceived,
                ReceiptDate = command.ReceiptDate,
                ReceivedFrom = command.ReceivedFrom,
                FilesFormat = command.FilesFormat,
                NoOfFiles = command.NoOfFiles,
                FitForPurpose = command.FitForPurpose,
                Check = command.Check
            };

            _mediator.Setup(m => m.Send(command, It.IsAny<CancellationToken>()))
                .ReturnsAsync(updatedInputRegister);

            // Act
            var result = await _controller.Update(id, command);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsType<InputRegisterDto>(okResult.Value);
            Assert.Equal(id, returnValue.Id);
            Assert.Equal(command.DataReceived, returnValue.DataReceived);
        }

        [Fact]
        public async Task Update_ReturnsBadRequest_WhenIdMismatch()
        {
            // Arrange
            var id = 1;
            var command = new UpdateInputRegisterCommand { Id = 2 }; // ID mismatch

            // Act
            var result = await _controller.Update(id, command);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Contains("ID mismatch", badRequestResult.Value.ToString());
        }

        [Fact]
        public async Task Update_ReturnsBadRequest_WhenModelStateIsInvalid()
        {
            // Arrange
            var id = 1;
            var command = new UpdateInputRegisterCommand { Id = id }; // Invalid command with missing required fields
            _controller.ModelState.AddModelError("DataReceived", "Required");

            // Act
            var result = await _controller.Update(id, command);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task Update_ReturnsNotFound_WhenEntityDoesNotExist()
        {
            // Arrange
            var id = 999;
            var command = new UpdateInputRegisterCommand
            {
                Id = id,
                ProjectId = 1,
                DataReceived = "Updated Data",
                ReceiptDate = DateTime.Now,
                ReceivedFrom = "Updated User",
                FilesFormat = "PDF",
                NoOfFiles = 1,
                FitForPurpose = true,
                Check = true
            };

            _mediator.Setup(m => m.Send(command, It.IsAny<CancellationToken>()))
                .ThrowsAsync(new Exception("InputRegister with ID 999 not found"));

            // Act
            var result = await _controller.Update(id, command);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        [Fact]
        public async Task Update_ReturnsBadRequest_WhenExceptionOccurs()
        {
            // Arrange
            var id = 1;
            var command = new UpdateInputRegisterCommand
            {
                Id = id,
                ProjectId = 1,
                DataReceived = "Updated Data",
                ReceiptDate = DateTime.Now,
                ReceivedFrom = "Updated User",
                FilesFormat = "PDF",
                NoOfFiles = 1,
                FitForPurpose = true,
                Check = true
            };

            _mediator.Setup(m => m.Send(command, It.IsAny<CancellationToken>()))
                .ThrowsAsync(new Exception("Test exception"));

            // Act
            var result = await _controller.Update(id, command);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Contains("Test exception", badRequestResult.Value.ToString());
        }

        #endregion

        #region Delete Tests

        [Fact]
        public async Task Delete_ReturnsNoContent_WhenSuccessful()
        {
            // Arrange
            var id = 1;

            _mediator.Setup(m => m.Send(It.Is<DeleteInputRegisterCommand>(c => c.Id == id), It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);

            // Act
            var result = await _controller.Delete(id);

            // Assert
            Assert.IsType<NoContentResult>(result);
        }

        [Fact]
        public async Task Delete_ReturnsNotFound_WhenEntityDoesNotExist()
        {
            // Arrange
            var id = 999;

            _mediator.Setup(m => m.Send(It.Is<DeleteInputRegisterCommand>(c => c.Id == id), It.IsAny<CancellationToken>()))
                .ReturnsAsync(false);

            // Act
            var result = await _controller.Delete(id);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        [Fact]
        public async Task Delete_ReturnsBadRequest_WhenExceptionOccurs()
        {
            // Arrange
            var id = 1;

            _mediator.Setup(m => m.Send(It.Is<DeleteInputRegisterCommand>(c => c.Id == id), It.IsAny<CancellationToken>()))
                .ThrowsAsync(new Exception("Test exception"));

            // Act
            var result = await _controller.Delete(id);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Contains("Test exception", badRequestResult.Value.ToString());
        }

        #endregion
    }
}
