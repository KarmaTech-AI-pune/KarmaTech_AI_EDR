using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;
using EDR.API.Controllers;
using EDR.Application.CQRS.MeasurementUnit.Commands;
using EDR.Application.CQRS.MeasurementUnit.Queries;
using EDR.Application.DTOs;
using EDR.Domain.Entities;

namespace EDR.API.Tests.Controllers
{
    public class MeasurementUnitsControllerTests
    {
        private readonly Mock<IMediator> _mediatorMock;
        private readonly MeasurementUnitsController _controller;

        public MeasurementUnitsControllerTests()
        {
            _mediatorMock = new Mock<IMediator>();
            _controller = new MeasurementUnitsController(_mediatorMock.Object);
        }

        [Fact]
        public async Task GetAll_ReturnsOkResult()
        {
            _mediatorMock.Setup(m => m.Send(It.IsAny<GetAllMeasurementUnitsQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new List<MeasurementUnitDto> { new MeasurementUnitDto { Id = 1 } });

            var result = await _controller.GetAll(FormType.Manpower);

            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var list = Assert.IsAssignableFrom<IEnumerable<MeasurementUnitDto>>(okResult.Value);
            Assert.Single(list);
        }

        [Fact]
        public async Task GetById_ReturnsOk_WhenFound()
        {
            _mediatorMock.Setup(m => m.Send(It.IsAny<GetMeasurementUnitByIdQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new MeasurementUnitDto { Id = 1 });

            var result = await _controller.GetById(1, FormType.Manpower);

            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var dto = Assert.IsType<MeasurementUnitDto>(okResult.Value);
            Assert.Equal(1, dto.Id);
        }

        [Fact]
        public async Task GetById_ReturnsNotFound_WhenNull()
        {
            _mediatorMock.Setup(m => m.Send(It.IsAny<GetMeasurementUnitByIdQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((MeasurementUnitDto)null);

            var result = await _controller.GetById(1, FormType.Manpower);

            Assert.IsType<NotFoundResult>(result.Result);
        }

        [Fact]
        public async Task Create_ReturnsCreatedAtAction()
        {
            var command = new CreateMeasurementUnitCommand { FormType = FormType.Manpower };
            _mediatorMock.Setup(m => m.Send(It.IsAny<CreateMeasurementUnitCommand>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new MeasurementUnitDto { Id = 1 });

            var result = await _controller.Create(command);

            var createdResult = Assert.IsType<CreatedAtActionResult>(result.Result);
            Assert.Equal("GetById", createdResult.ActionName);
        }

        [Fact]
        public async Task Update_ReturnsOk_WhenFound()
        {
            var command = new UpdateMeasurementUnitCommand { Id = 1 };
            _mediatorMock.Setup(m => m.Send(It.IsAny<UpdateMeasurementUnitCommand>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new MeasurementUnitDto { Id = 1 });

            var result = await _controller.Update(1, FormType.Manpower, command);

            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            Assert.NotNull(okResult.Value);
        }

        [Fact]
        public async Task Update_ReturnsBadRequest_OnIdMismatch()
        {
            var command = new UpdateMeasurementUnitCommand { Id = 2 };

            var result = await _controller.Update(1, FormType.Manpower, command);

            Assert.IsType<BadRequestResult>(result.Result);
        }

        [Fact]
        public async Task Update_ReturnsNotFound_WhenResultIsNull()
        {
            var command = new UpdateMeasurementUnitCommand { Id = 1 };
            _mediatorMock.Setup(m => m.Send(It.IsAny<UpdateMeasurementUnitCommand>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((MeasurementUnitDto)null);

            var result = await _controller.Update(1, FormType.Manpower, command);

            Assert.IsType<NotFoundResult>(result.Result);
        }

        [Fact]
        public async Task Delete_ReturnsNoContent()
        {
            // DeleteMeasurementUnitCommand : IRequest (void) - use Send without return
            _mediatorMock.Setup(m => m.Send(It.IsAny<DeleteMeasurementUnitCommand>(), It.IsAny<CancellationToken>()))
                .Returns(Task.FromResult(MediatR.Unit.Value));

            var result = await _controller.Delete(1, FormType.Manpower);

            Assert.IsType<NoContentResult>(result);
        }
    }
}
