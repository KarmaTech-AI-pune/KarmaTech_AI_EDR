using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
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
    public class WBSVersionControllerTests
    {
        private readonly Mock<IMediator> _mediatorMock;
        private readonly Mock<ILogger<WBSVersionController>> _loggerMock;
        private readonly WBSVersionController _controller;

        public WBSVersionControllerTests()
        {
            _mediatorMock = new Mock<IMediator>();
            _loggerMock = new Mock<ILogger<WBSVersionController>>();
            _controller = new WBSVersionController(_mediatorMock.Object, _loggerMock.Object);
        }

        [Fact]
        public async Task GetWBSVersions_ReturnsOkResult()
        {
            // Arrange
            var projectId = 1;
            var wbsVersions = new List<WBSVersionDto> { new WBSVersionDto { Id = 1, Version = "1.0" } };
            _mediatorMock.Setup(m => m.Send(It.IsAny<GetWBSVersionsQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(wbsVersions);

            // Act
            var result = await _controller.GetWBSVersions(projectId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            Assert.Equal(wbsVersions, okResult.Value);
        }

        [Fact]
        public async Task GetLatestWBSVersion_ReturnsOkResult_WhenVersionExists()
        {
            // Arrange
            var projectId = 1;
            var wbsVersionDetails = new WBSVersionDetailsDto { Id = 1, Version = "1.0" };
            _mediatorMock.Setup(m => m.Send(It.IsAny<GetLatestWBSVersionQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(wbsVersionDetails);

            // Act
            var result = await _controller.GetLatestWBSVersion(projectId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            Assert.Equal(wbsVersionDetails, okResult.Value);
        }

        [Fact]
        public async Task GetLatestWBSVersion_ReturnsNotFound_WhenVersionDoesNotExist()
        {
            // Arrange
            var projectId = 1;
            _mediatorMock.Setup(m => m.Send(It.IsAny<GetLatestWBSVersionQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((WBSVersionDetailsDto)null);

            // Act
            var result = await _controller.GetLatestWBSVersion(projectId);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result.Result);
        }

        [Fact]
        public async Task GetWBSVersion_ReturnsOkResult_WhenVersionExists()
        {
            // Arrange
            var projectId = 1;
            var version = "1.0";
            var wbsVersionDetails = new WBSVersionDetailsDto { Id = 1, Version = "1.0" };
            _mediatorMock.Setup(m => m.Send(It.IsAny<GetWBSVersionQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(wbsVersionDetails);

            // Act
            var result = await _controller.GetWBSVersion(projectId, version);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            Assert.Equal(wbsVersionDetails, okResult.Value);
        }

        [Fact]
        public async Task CreateWBSVersion_ReturnsOkResult()
        {
            // Arrange
            var projectId = 1;
            var request = new CreateWBSVersionRequest { Tasks = new List<WBSTaskDto>(), Comments = "Test" };
            var newVersion = "2.0";
            _mediatorMock.Setup(m => m.Send(It.IsAny<CreateWBSVersionCommand>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(newVersion);

            // Act
            var result = await _controller.CreateWBSVersion(projectId, request);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            Assert.Equal(newVersion, okResult.Value);
        }

        [Fact]
        public async Task ActivateWBSVersion_ReturnsOkResult()
        {
            // Arrange
            var projectId = 1;
            var version = "2.0";
            _mediatorMock.Setup(m => m.Send(It.IsAny<ActivateWBSVersionCommand>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(Unit.Value);

            // Act
            var result = await _controller.ActivateWBSVersion(projectId, version);

            // Assert
            Assert.IsType<OkResult>(result);
        }

        [Fact]
        public async Task DeleteWBSVersion_ReturnsOkResult()
        {
            // Arrange
            var projectId = 1;
            var version = "1.0";
            _mediatorMock.Setup(m => m.Send(It.IsAny<DeleteWBSVersionCommand>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(Unit.Value);

            // Act
            var result = await _controller.DeleteWBSVersion(projectId, version);

            // Assert
            Assert.IsType<OkResult>(result);
        }

        [Fact]
        public async Task GetWBSVersionWorkflowHistory_ReturnsOkResult()
        {
            // Arrange
            var projectId = 1;
            var version = "1.0";
            var versionDetails = new WBSVersionDetailsDto { Id = 10, Version = "1.0" };
            var historyList = new List<WBSVersionWorkflowHistoryDto> { new WBSVersionWorkflowHistoryDto { Id = 1 } };
            
            _mediatorMock.Setup(m => m.Send(It.IsAny<GetWBSVersionQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(versionDetails);
            _mediatorMock.Setup(m => m.Send(It.IsAny<GetWBSVersionWorkflowHistoryQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(historyList);

            // Act
            var result = await _controller.GetWBSVersionWorkflowHistory(projectId, version);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            Assert.Equal(historyList, okResult.Value);
        }
    }
}
