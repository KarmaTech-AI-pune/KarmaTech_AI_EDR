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
using EDR.Application.CQRS.Feature.Commands;
using EDR.Application.CQRS.Feature.Queries;
using EDR.Application.DTOs;

namespace EDR.API.Tests.Controllers
{
    public class FeatureControllerTests
    {
        private readonly Mock<IMediator> _mediatorMock;
        private readonly Mock<ILogger<FeatureController>> _loggerMock;
        private readonly FeatureController _controller;

        public FeatureControllerTests()
        {
            _mediatorMock = new Mock<IMediator>();
            _loggerMock = new Mock<ILogger<FeatureController>>();
            _controller = new FeatureController(_mediatorMock.Object, _loggerMock.Object);
        }

        [Fact]
        public async Task CreateFeature_ReturnsCreatedAtAction_WhenSuccessful()
        {
            var command = new CreateFeatureCommand { Name = "Test" };
            var feature = new FeatureDto { Id = 1, Name = "Test" };
            _mediatorMock.Setup(m => m.Send(It.IsAny<CreateFeatureCommand>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(feature);

            var result = await _controller.CreateFeature(command);

            var createdResult = Assert.IsType<CreatedAtActionResult>(result);
            Assert.Equal("GetAllFeatures", createdResult.ActionName);
        }

        [Fact]
        public async Task CreateFeature_ReturnsBadRequest_WhenFeatureIsNull()
        {
            var command = new CreateFeatureCommand { Name = "Test" };
            _mediatorMock.Setup(m => m.Send(It.IsAny<CreateFeatureCommand>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((FeatureDto)null);

            var result = await _controller.CreateFeature(command);

            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.NotNull(badRequestResult.Value);
        }

        [Fact]
        public async Task CreateFeature_Returns500_OnException()
        {
            var command = new CreateFeatureCommand { Name = "Test" };
            _mediatorMock.Setup(m => m.Send(It.IsAny<CreateFeatureCommand>(), It.IsAny<CancellationToken>()))
                .ThrowsAsync(new Exception("DB Error"));

            var result = await _controller.CreateFeature(command);

            var statusCodeResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, statusCodeResult.StatusCode);
        }

        [Fact]
        public async Task GetAllFeatures_ReturnsOk_WithData()
        {
            var features = new List<FeatureDto> { new FeatureDto { Id = 1 } };
            _mediatorMock.Setup(m => m.Send(It.IsAny<GetAllFeaturesQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(features);

            var result = await _controller.GetAllFeatures();

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Same(features, okResult.Value);
        }

        [Fact]
        public async Task GetAllFeatures_Returns500_OnException()
        {
            _mediatorMock.Setup(m => m.Send(It.IsAny<GetAllFeaturesQuery>(), It.IsAny<CancellationToken>()))
                .ThrowsAsync(new Exception("DB Error"));

            var result = await _controller.GetAllFeatures();

            var statusCodeResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, statusCodeResult.StatusCode);
        }

        [Fact]
        public async Task GetFeatureById_ReturnsOk_WhenFound()
        {
            var feature = new FeatureDto { Id = 1 };
            _mediatorMock.Setup(m => m.Send(It.IsAny<GetFeatureByIdQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(feature);

            var result = await _controller.GetFeatureById(1);

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Same(feature, okResult.Value);
        }

        [Fact]
        public async Task GetFeatureById_ReturnsNotFound_WhenNull()
        {
            _mediatorMock.Setup(m => m.Send(It.IsAny<GetFeatureByIdQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((FeatureDto)null);

            var result = await _controller.GetFeatureById(1);

            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public async Task GetFeatureById_Returns500_OnException()
        {
            _mediatorMock.Setup(m => m.Send(It.IsAny<GetFeatureByIdQuery>(), It.IsAny<CancellationToken>()))
                .ThrowsAsync(new Exception("DB Error"));

            var result = await _controller.GetFeatureById(1);

            var statusCodeResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, statusCodeResult.StatusCode);
        }

        [Fact]
        public async Task UpdateFeature_ReturnsOk_WhenSuccessful()
        {
            var command = new UpdateFeatureCommand { Id = 1, Name = "Updated" };
            var feature = new FeatureDto { Id = 1, Name = "Updated" };
            _mediatorMock.Setup(m => m.Send(It.IsAny<UpdateFeatureCommand>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(feature);

            var result = await _controller.UpdateFeature(1, command);

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Same(feature, okResult.Value);
        }

        [Fact]
        public async Task UpdateFeature_ReturnsBadRequest_OnIdMismatch()
        {
            var command = new UpdateFeatureCommand { Id = 2, Name = "Updated" };

            var result = await _controller.UpdateFeature(1, command);

            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.NotNull(badRequestResult.Value);
        }

        [Fact]
        public async Task UpdateFeature_ReturnsNotFound_WhenResultIsNull()
        {
            var command = new UpdateFeatureCommand { Id = 1, Name = "Updated" };
            _mediatorMock.Setup(m => m.Send(It.IsAny<UpdateFeatureCommand>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((FeatureDto)null);

            var result = await _controller.UpdateFeature(1, command);

            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public async Task UpdateFeature_Returns500_OnException()
        {
            var command = new UpdateFeatureCommand { Id = 1, Name = "Updated" };
            _mediatorMock.Setup(m => m.Send(It.IsAny<UpdateFeatureCommand>(), It.IsAny<CancellationToken>()))
                .ThrowsAsync(new Exception("DB Error"));

            var result = await _controller.UpdateFeature(1, command);

            var statusCodeResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, statusCodeResult.StatusCode);
        }

        [Fact]
        public async Task DeleteFeature_ReturnsNoContent_WhenSuccessful()
        {
            _mediatorMock.Setup(m => m.Send(It.IsAny<DeleteFeatureCommand>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);

            var result = await _controller.DeleteFeature(1);

            Assert.IsType<NoContentResult>(result);
        }

        [Fact]
        public async Task DeleteFeature_ReturnsNotFound_WhenResultIsFalse()
        {
            _mediatorMock.Setup(m => m.Send(It.IsAny<DeleteFeatureCommand>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(false);

            var result = await _controller.DeleteFeature(1);

            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public async Task DeleteFeature_Returns500_OnException()
        {
            _mediatorMock.Setup(m => m.Send(It.IsAny<DeleteFeatureCommand>(), It.IsAny<CancellationToken>()))
                .ThrowsAsync(new Exception("DB Error"));

            var result = await _controller.DeleteFeature(1);

            var statusCodeResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, statusCodeResult.StatusCode);
        }
    }
}
