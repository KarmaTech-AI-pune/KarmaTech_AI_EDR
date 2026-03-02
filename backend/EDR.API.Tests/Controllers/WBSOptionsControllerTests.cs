using MediatR;
using Microsoft.AspNetCore.Mvc;
using Moq;
using EDR.Application.CQRS.WorkBreakdownStructures.Queries;
using EDR.Application.CQRS.WorkBreakdownStructures.Commands;
using EDR.Application.Dtos;
using EDR.Domain.Entities;
using EDR.API.Controllers;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace EDR.API.Tests.Controllers
{
    public class WBSOptionsControllerTests
    {
        private readonly Mock<IMediator> _mediatorMock;
        private readonly WBSOptionsController _controller;

        public WBSOptionsControllerTests()
        {
            _mediatorMock = new Mock<IMediator>();
            _controller = new WBSOptionsController(_mediatorMock.Object);
        }

        [Fact]
        public async Task GetWBSOptions_ReturnsOkResultWithOptions()
        {
            // Arrange
            var wbsOptions = new WBSLevelOptionsDto
            {
                Level1 = new List<WBSOptionDto>
                {
                    new WBSOptionDto { Id = 1, Value = "V1", Label = "L1", Level = 1 }
                },
                Level2 = new List<WBSOptionDto>
                {
                    new WBSOptionDto { Id = 2, Value = "V2", Label = "L2", Level = 2, ParentId = 1 }
                },
                Level3 = new Dictionary<string, List<WBSOptionDto>>
                {
                    ["2"] = new List<WBSOptionDto> { new WBSOptionDto { Id = 3, Value = "V3", Label = "L3", Level = 3, ParentId = 2 } }
                }
            };

            _mediatorMock.Setup(m => m.Send(It.IsAny<GetWBSOptionsQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(wbsOptions);

            // Act
            var result = await _controller.GetWBSOptions(null);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnValue = Assert.IsType<WBSLevelOptionsDto>(okResult.Value);
            Assert.Single(returnValue.Level1);
            Assert.Single(returnValue.Level2);
            Assert.Single(returnValue.Level3);
        }

        [Fact]
        public async Task GetLevel1Options_ReturnsOkResult()
        {
            // Arrange
            var options = new List<WBSOptionDto> { new WBSOptionDto { Id = 1, Level = 1 } };
            _mediatorMock.Setup(m => m.Send(It.IsAny<GetWBSLevel1OptionsQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(options);

            // Act
            var result = await _controller.GetLevel1Options(null);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            Assert.Equal(options, okResult.Value);
        }

        [Fact]
        public async Task GetLevel2Options_ReturnsOkResult()
        {
            // Arrange
            var options = new List<WBSOptionDto> { new WBSOptionDto { Id = 2, Level = 2, ParentId = 1 } };
            _mediatorMock.Setup(m => m.Send(It.IsAny<GetWBSLevel2OptionsQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(options);

            // Act
            var result = await _controller.GetLevel2Options(1, null);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            Assert.Equal(options, okResult.Value);
        }

        [Fact]
        public async Task GetLevel3Options_ReturnsOkResult()
        {
            // Arrange
            var options = new List<WBSOptionDto> { new WBSOptionDto { Id = 3, Level = 3, ParentId = 2 } };
            _mediatorMock.Setup(m => m.Send(It.IsAny<GetWBSLevel3OptionsQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(options);

            // Act
            var result = await _controller.GetLevel3Options(2, null);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            Assert.Equal(options, okResult.Value);
        }

        [Fact]
        public async Task CreateWBSOption_ReturnsOkResult()
        {
            // Arrange
            var requests = new List<WBSOptionDto> { new WBSOptionDto { Value = "V", Label = "L" } };
            _mediatorMock.Setup(m => m.Send(It.IsAny<CreateWBSOptionCommand>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(requests);

            // Act
            var result = await _controller.CreateWBSOption(requests);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            Assert.Equal(requests, okResult.Value);
        }

        [Fact]
        public async Task UpdateWBSOptions_ReturnsOkResult()
        {
            // Arrange
            var requests = new List<WBSOptionDto> { new WBSOptionDto { Id = 1, Value = "V", Label = "L" } };
            _mediatorMock.Setup(m => m.Send(It.IsAny<UpdateWBSOptionCommand>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(requests);

            // Act
            var result = await _controller.UpdateWBSOptions(requests);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            Assert.Equal(requests, okResult.Value);
        }

        [Fact]
        public async Task DeleteWBSOption_ReturnsNoContent_OnSuccess()
        {
            // Arrange
            _mediatorMock.Setup(m => m.Send(It.IsAny<DeleteWBSOptionCommand>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);

            // Act
            var result = await _controller.DeleteWBSOption(1);

            // Assert
            Assert.IsType<NoContentResult>(result.Result);
        }

        [Fact]
        public async Task DeleteWBSOption_ReturnsNotFound_OnFailure()
        {
            // Arrange
            _mediatorMock.Setup(m => m.Send(It.IsAny<DeleteWBSOptionCommand>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(false);

            // Act
            var result = await _controller.DeleteWBSOption(1);

            // Assert
            Assert.IsType<NotFoundResult>(result.Result);
        }
    }
}
