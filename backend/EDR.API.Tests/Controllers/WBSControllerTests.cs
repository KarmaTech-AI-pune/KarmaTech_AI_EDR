using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using EDR.API.Controllers;
using EDR.Application.Dtos;
using EDR.Application.CQRS.WorkBreakdownStructures.Commands;
using EDR.Application.CQRS.WorkBreakdownStructures.Queries;

namespace EDR.API.Tests.Controllers
{
    public class WBSControllerTests
    {
        private readonly Mock<IMediator> _mediatorMock;
        private readonly Mock<ILogger<WBSController>> _loggerMock;
        private readonly WBSController _controller;

        public WBSControllerTests()
        {
            _mediatorMock = new Mock<IMediator>();
            _loggerMock = new Mock<ILogger<WBSController>>();
            _controller = new WBSController(_mediatorMock.Object, _loggerMock.Object);
        }

        [Fact]
        public async Task GetWBS_ReturnsOkResult()
        {
            // Arrange
            var projectId = 1;
            var wbsMasterDto = new WBSMasterDto { WbsHeaderId = 1 };
            _mediatorMock.Setup(m => m.Send(It.IsAny<GetWBSByProjectIdQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(wbsMasterDto);

            // Act
            var result = await _controller.GetWBS(projectId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            Assert.Equal(wbsMasterDto, okResult.Value);
        }

        [Fact]
        public async Task SetWBS_ReturnsCreatedResult()
        {
            // Arrange
            var projectId = 1;
            var wbsMasterDto = new WBSMasterDto 
            { 
                WbsHeaderId = 1, 
                WorkBreakdownStructures = new List<WBSStructureMasterDto>
                {
                    new WBSStructureMasterDto { WorkBreakdownStructureId = 1 }
                }
            };
            _mediatorMock.Setup(m => m.Send(It.IsAny<SetWBSCommand>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(wbsMasterDto);

            // Act
            var result = await _controller.SetWBS(projectId, wbsMasterDto);

            // Assert
            var createdResult = Assert.IsType<ObjectResult>(result.Result);
            Assert.Equal(StatusCodes.Status201Created, createdResult.StatusCode);
            Assert.Equal(wbsMasterDto, createdResult.Value);
        }

        [Fact]
        public async Task SetWBS_ReturnsBadRequest_WhenNull()
        {
            // Act
            var result = await _controller.SetWBS(1, null);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result.Result);
        }

        [Fact]
        public async Task AddTask_ReturnsCreatedResult()
        {
            // Arrange
            var projectId = 1;
            var wbsMasterDto = new WBSMasterDto { WbsHeaderId = 1 };
            _mediatorMock.Setup(m => m.Send(It.IsAny<AddWBSTaskCommand>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(wbsMasterDto);

            // Act
            var result = await _controller.AddTask(projectId, wbsMasterDto);

            // Assert
            var createdResult = Assert.IsType<ObjectResult>(result.Result);
            Assert.Equal(StatusCodes.Status201Created, createdResult.StatusCode);
            Assert.Equal(wbsMasterDto, createdResult.Value);
        }

        [Fact]
        public async Task UpdateTask_ReturnsOkResult()
        {
            // Arrange
            var projectId = 1;
            var wbsMasterDto = new WBSMasterDto { WbsHeaderId = 1 };
            _mediatorMock.Setup(m => m.Send(It.IsAny<UpdateWBSTaskCommand>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(wbsMasterDto);

            // Act
            var result = await _controller.UpdateTask(projectId, wbsMasterDto);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            Assert.Equal(wbsMasterDto, okResult.Value);
        }

        [Fact]
        public async Task DeleteTask_ReturnsOkResult_OnSuccess()
        {
            // Arrange
            var projectId = 1;
            var taskId = 100;
            _mediatorMock.Setup(m => m.Send(It.IsAny<DeleteWBSTaskCommand>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);

            // Act
            var result = await _controller.DeleteTask(projectId, taskId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            Assert.True((bool)okResult.Value);
        }

        [Fact]
        public async Task DeleteTask_ReturnsNotFound_OnFailure()
        {
            // Arrange
            var projectId = 1;
            var taskId = 100;
            _mediatorMock.Setup(m => m.Send(It.IsAny<DeleteWBSTaskCommand>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(false);

            // Act
            var result = await _controller.DeleteTask(projectId, taskId);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result.Result);
        }

        [Fact]
        public async Task GetApprovedWBS_ReturnsOkResult()
        {
            // Arrange
            var projectId = 1;
            var wbsList = new List<WBSDetailsDto> { new WBSDetailsDto { Id = 1 } };
            _mediatorMock.Setup(m => m.Send(It.IsAny<GetApprovedWBSQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(wbsList);

            // Act
            var result = await _controller.GetApprovedWBS(projectId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(wbsList, okResult.Value);
        }
    }
}
