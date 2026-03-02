using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using EDR.Application.CQRS.InputRegister.Commands;
using EDR.Application.CQRS.InputRegister.Queries;
using EDR.Application.DTOs;
using EDR.API.Controllers;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace EDR.API.Tests.Controllers
{
    public class InputRegisterControllerTests
    {
        private readonly Mock<IMediator> _mockMediator;
        private readonly Mock<ILogger<InputRegisterController>> _mockLogger;
        private readonly InputRegisterController _controller;

        public InputRegisterControllerTests()
        {
            _mockMediator = new Mock<IMediator>();
            _mockLogger = new Mock<ILogger<InputRegisterController>>();
            _controller = new InputRegisterController(_mockMediator.Object, _mockLogger.Object);
        }

        [Fact]
        public void Constructor_NullMediator_ThrowsArgumentNullException()
        {
            // Act & Assert
            Assert.Throws<ArgumentNullException>(() => new InputRegisterController(null, _mockLogger.Object));
        }

        [Fact]
        public void Constructor_NullLogger_ThrowsArgumentNullException()
        {
            // Act & Assert
            Assert.Throws<ArgumentNullException>(() => new InputRegisterController(_mockMediator.Object, null));
        }

        [Fact]
        public async Task GetAll_ReturnsOkResultWithInputRegisters()
        {
            // Arrange
            var inputRegisters = new List<InputRegisterDto>
            {
                new InputRegisterDto { Id = 1, DataReceived = "Data 1" },
                new InputRegisterDto { Id = 2, DataReceived = "Data 2" }
            };

            _mockMediator.Setup(m => m.Send(It.IsAny<GetAllInputRegistersQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(inputRegisters);

            // Act
            var result = await _controller.GetAll();

            // Assert
            var actionResult = Assert.IsType<ActionResult<IEnumerable<InputRegisterDto>>>(result);
            var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
            var returnValue = Assert.IsAssignableFrom<IEnumerable<InputRegisterDto>>(okResult.Value);
            Assert.Equal(2, ((List<InputRegisterDto>)returnValue).Count);
        }

        [Fact]
        public async Task GetAll_MediatorThrowsException_Returns500()
        {
            // Arrange
            _mockMediator.Setup(m => m.Send(It.IsAny<GetAllInputRegistersQuery>(), It.IsAny<CancellationToken>()))
                .ThrowsAsync(new Exception("Test exception"));

            // Act
            var result = await _controller.GetAll();

            // Assert
            var actionResult = Assert.IsType<ActionResult<IEnumerable<InputRegisterDto>>>(result);
            var statusCodeResult = Assert.IsType<ObjectResult>(actionResult.Result);
            Assert.Equal(500, statusCodeResult.StatusCode);
            var anonymousObj = statusCodeResult.Value;
            var messageProperty = anonymousObj.GetType().GetProperty("message");
            Assert.NotNull(messageProperty);
            var message = messageProperty.GetValue(anonymousObj);
            Assert.Equal("An error occurred while retrieving input registers", message);
        }

        [Fact]
        public async Task GetById_ExistingId_ReturnsOkResultWithInputRegister()
        {
            // Arrange
            var id = 1;
            var inputRegister = new InputRegisterDto
            {
                Id = id,
                DataReceived = "Test Data",
                ReceiptDate = DateTime.Now,
                ReceivedFrom = "Test User"
            };

            _mockMediator.Setup(m => m.Send(It.Is<GetInputRegisterByIdQuery>(q => q.Id == id), It.IsAny<CancellationToken>()))
                .ReturnsAsync(inputRegister);

            // Act
            var result = await _controller.GetById(id);

            // Assert
            var actionResult = Assert.IsType<ActionResult<InputRegisterDto>>(result);
            var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
            var returnValue = Assert.IsType<InputRegisterDto>(okResult.Value);
            Assert.Equal(id, returnValue.Id);
        }

        [Fact]
        public async Task GetById_NonExistingId_ReturnsNotFound()
        {
            // Arrange
            var id = 999;

            _mockMediator.Setup(m => m.Send(It.Is<GetInputRegisterByIdQuery>(q => q.Id == id), It.IsAny<CancellationToken>()))
                .ReturnsAsync((InputRegisterDto)null);

            // Act
            var result = await _controller.GetById(id);

            // Assert
            var actionResult = Assert.IsType<ActionResult<InputRegisterDto>>(result);
            Assert.IsType<NotFoundObjectResult>(actionResult.Result);
        }

        [Fact]
        public async Task GetById_MediatorThrowsException_Returns500()
        {
            // Arrange
            var id = 1;

            _mockMediator.Setup(m => m.Send(It.Is<GetInputRegisterByIdQuery>(q => q.Id == id), It.IsAny<CancellationToken>()))
                .ThrowsAsync(new Exception("Test exception"));

            // Act
            var result = await _controller.GetById(id);

            // Assert
            var actionResult = Assert.IsType<ActionResult<InputRegisterDto>>(result);
            var statusCodeResult = Assert.IsType<ObjectResult>(actionResult.Result);
            Assert.Equal(500, statusCodeResult.StatusCode);
            var anonymousObj = statusCodeResult.Value;
            var messageProperty = anonymousObj.GetType().GetProperty("message");
            Assert.NotNull(messageProperty);
            var message = messageProperty.GetValue(anonymousObj);
            Assert.Equal("An error occurred while retrieving the input register", message);
        }

        [Fact]
        public async Task GetByProject_ExistingProjectId_ReturnsOkResultWithInputRegisters()
        {
            // Arrange
            var projectId = 1;
            var inputRegisters = new List<InputRegisterDto>
            {
                new InputRegisterDto { Id = 1, ProjectId = projectId, DataReceived = "Data 1" },
                new InputRegisterDto { Id = 2, ProjectId = projectId, DataReceived = "Data 2" }
            };

            _mockMediator.Setup(m => m.Send(It.Is<GetInputRegistersByProjectQuery>(q => q.ProjectId == projectId), It.IsAny<CancellationToken>()))
                .ReturnsAsync(inputRegisters);

            // Act
            var result = await _controller.GetByProject(projectId);

            // Assert
            var actionResult = Assert.IsType<ActionResult<IEnumerable<InputRegisterDto>>>(result);
            var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
            var returnValue = Assert.IsAssignableFrom<IEnumerable<InputRegisterDto>>(okResult.Value);
            Assert.Equal(2, ((List<InputRegisterDto>)returnValue).Count);
        }

        [Fact]
        public async Task GetByProject_MediatorThrowsException_Returns500()
        {
            // Arrange
            var projectId = 1;

            _mockMediator.Setup(m => m.Send(It.Is<GetInputRegistersByProjectQuery>(q => q.ProjectId == projectId), It.IsAny<CancellationToken>()))
                .ThrowsAsync(new Exception("Test exception"));

            // Act
            var result = await _controller.GetByProject(projectId);

            // Assert
            var actionResult = Assert.IsType<ActionResult<IEnumerable<InputRegisterDto>>>(result);
            var statusCodeResult = Assert.IsType<ObjectResult>(actionResult.Result);
            Assert.Equal(500, statusCodeResult.StatusCode);
            var anonymousObj = statusCodeResult.Value;
            var messageProperty = anonymousObj.GetType().GetProperty("message");
            Assert.NotNull(messageProperty);
            var message = messageProperty.GetValue(anonymousObj);
            Assert.Equal("An error occurred while retrieving input registers for the project", message);
        }

        [Fact]
        public async Task Create_ValidCommand_ReturnsCreatedAtActionResult()
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

            _mockMediator.Setup(m => m.Send(command, It.IsAny<CancellationToken>()))
                .ReturnsAsync(createdInputRegister);

            // Act
            var result = await _controller.Create(command);

            // Assert
            var actionResult = Assert.IsType<ActionResult<InputRegisterDto>>(result);
            var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(actionResult.Result);
            Assert.Equal("GetById", createdAtActionResult.ActionName);
            Assert.Equal(createdInputRegister.Id, createdAtActionResult.RouteValues["id"]);
            var returnValue = Assert.IsType<InputRegisterDto>(createdAtActionResult.Value);
            Assert.Equal(createdInputRegister.Id, returnValue.Id);
        }

        [Fact]
        public async Task Create_InvalidModelState_ReturnsBadRequest()
        {
            // Arrange
            var command = new CreateInputRegisterCommand();
            _controller.ModelState.AddModelError("DataReceived", "Required");

            // Act
            var result = await _controller.Create(command);

            // Assert
            var actionResult = Assert.IsType<ActionResult<InputRegisterDto>>(result);
            Assert.IsType<BadRequestObjectResult>(actionResult.Result);
        }

        [Fact]
        public async Task Create_MediatorThrowsException_Returns500()
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

            _mockMediator.Setup(m => m.Send(command, It.IsAny<CancellationToken>()))
                .ThrowsAsync(new Exception("Test exception"));

            // Act
            var result = await _controller.Create(command);

            // Assert
            var actionResult = Assert.IsType<ActionResult<InputRegisterDto>>(result);
            var statusCodeResult = Assert.IsType<ObjectResult>(actionResult.Result);
            Assert.Equal(500, statusCodeResult.StatusCode);
            var anonymousObj = statusCodeResult.Value;
            var messageProperty = anonymousObj.GetType().GetProperty("message");
            Assert.NotNull(messageProperty);
            var message = messageProperty.GetValue(anonymousObj);
            Assert.Equal("Test exception", message);
        }

        [Fact]
        public async Task Update_ValidCommand_ReturnsOkResultWithUpdatedInputRegister()
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
                FilesFormat = "DOCX",
                NoOfFiles = 2,
                FitForPurpose = false,
                Check = false
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

            _mockMediator.Setup(m => m.Send(command, It.IsAny<CancellationToken>()))
                .ReturnsAsync(updatedInputRegister);

            // Act
            var result = await _controller.Update(id, command);

            // Assert
            var actionResult = Assert.IsType<ActionResult<InputRegisterDto>>(result);
            var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
            var returnValue = Assert.IsType<InputRegisterDto>(okResult.Value);
            Assert.Equal(id, returnValue.Id);
            Assert.Equal(command.DataReceived, returnValue.DataReceived);
        }

        [Fact]
        public async Task Update_IdMismatch_ReturnsBadRequest()
        {
            // Arrange
            var id = 1;
            var command = new UpdateInputRegisterCommand { Id = 2 };

            // Act
            var result = await _controller.Update(id, command);

            // Assert
            var actionResult = Assert.IsType<ActionResult<InputRegisterDto>>(result);
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(actionResult.Result);
            var anonymousObj = badRequestResult.Value;
            var messageProperty = anonymousObj.GetType().GetProperty("message");
            Assert.NotNull(messageProperty);
            var message = messageProperty.GetValue(anonymousObj);
            Assert.Equal("ID mismatch", message);
        }

        [Fact]
        public async Task Update_InvalidModelState_ReturnsBadRequest()
        {
            // Arrange
            var id = 1;
            var command = new UpdateInputRegisterCommand { Id = id };
            _controller.ModelState.AddModelError("DataReceived", "Required");

            // Act
            var result = await _controller.Update(id, command);

            // Assert
            var actionResult = Assert.IsType<ActionResult<InputRegisterDto>>(result);
            Assert.IsType<BadRequestObjectResult>(actionResult.Result);
        }

        [Fact]
        public async Task Update_MediatorThrowsException_Returns500()
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
                FilesFormat = "DOCX",
                NoOfFiles = 2,
                FitForPurpose = false,
                Check = false
            };

            _mockMediator.Setup(m => m.Send(command, It.IsAny<CancellationToken>()))
                .ThrowsAsync(new Exception("Test exception"));

            // Act
            var result = await _controller.Update(id, command);

            // Assert
            var actionResult = Assert.IsType<ActionResult<InputRegisterDto>>(result);
            var statusCodeResult = Assert.IsType<ObjectResult>(actionResult.Result);
            Assert.Equal(500, statusCodeResult.StatusCode);
            var anonymousObj = statusCodeResult.Value;
            var messageProperty = anonymousObj.GetType().GetProperty("message");
            Assert.NotNull(messageProperty);
            var message = messageProperty.GetValue(anonymousObj);
            Assert.Equal("An error occurred while updating the input register", message);
        }

        [Fact]
        public async Task Delete_ExistingId_ReturnsNoContent()
        {
            // Arrange
            var id = 1;

            _mockMediator.Setup(m => m.Send(It.Is<DeleteInputRegisterCommand>(c => c.Id == id), It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);

            // Act
            var result = await _controller.Delete(id);

            // Assert
            Assert.IsType<NoContentResult>(result);
        }

        [Fact]
        public async Task Delete_NonExistingId_ReturnsNotFound()
        {
            // Arrange
            var id = 999;

            _mockMediator.Setup(m => m.Send(It.Is<DeleteInputRegisterCommand>(c => c.Id == id), It.IsAny<CancellationToken>()))
                .ReturnsAsync(false);

            // Act
            var result = await _controller.Delete(id);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        [Fact]
        public async Task Delete_MediatorThrowsException_Returns500()
        {
            // Arrange
            var id = 1;

            _mockMediator.Setup(m => m.Send(It.Is<DeleteInputRegisterCommand>(c => c.Id == id), It.IsAny<CancellationToken>()))
                .ThrowsAsync(new Exception("Test exception"));

            // Act
            var result = await _controller.Delete(id);

            // Assert
            var statusCodeResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, statusCodeResult.StatusCode);
            var anonymousObj = statusCodeResult.Value;
            var messageProperty = anonymousObj.GetType().GetProperty("message");
            Assert.NotNull(messageProperty);
            var message = messageProperty.GetValue(anonymousObj);
            Assert.Equal("An error occurred while deleting the input register", message);
        }
    }
}

