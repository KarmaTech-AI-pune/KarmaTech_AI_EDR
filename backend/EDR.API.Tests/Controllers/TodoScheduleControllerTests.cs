using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using EDR.API.Controllers;
using EDR.Application.CQRS.ProjectSchedules.Command;
using EDR.Application.CQRS.ProjectSchedules.Query;
using EDR.Application.Dtos;

namespace EDR.API.Tests.Controllers
{
    public class TodoScheduleControllerTests
    {
        private readonly Mock<IMediator> _mediatorMock;
        private readonly Mock<ILogger<TodoScheduleController>> _loggerMock;
        private readonly TodoScheduleController _controller;

        public TodoScheduleControllerTests()
        {
            _mediatorMock = new Mock<IMediator>();
            _loggerMock = new Mock<ILogger<TodoScheduleController>>();
            
            _controller = new TodoScheduleController(_mediatorMock.Object, _loggerMock.Object);
        }

        [Fact]
        public async Task GetTodoSchedule_ReturnsOk_WhenFound()
        {
            var schedule = new ProjectScheduleDto();
            _mediatorMock.Setup(m => m.Send(It.IsAny<GetProjectScheduleQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(schedule);

            var result = await _controller.GetTodoSchedule(1);

            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            Assert.Same(schedule, okResult.Value);
        }

        [Fact]
        public async Task GetTodoSchedule_ReturnsNotFound_WhenNull()
        {
            _mediatorMock.Setup(m => m.Send(It.IsAny<GetProjectScheduleQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((ProjectScheduleDto)null);

            var result = await _controller.GetTodoSchedule(1);

            Assert.IsType<NotFoundObjectResult>(result.Result);
        }

        [Fact]
        public async Task CreateTodoSchedule_ReturnsCreatedAtAction()
        {
            var schedule = new ProjectScheduleDto();
            _mediatorMock.Setup(m => m.Send(It.IsAny<CreateProjectScheduleCommand>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(1);

            // Mock HttpContext Request
            var httpContext = new Microsoft.AspNetCore.Http.DefaultHttpContext();
            httpContext.Request.Scheme = "https";
            httpContext.Request.Host = new Microsoft.AspNetCore.Http.HostString("localhost");
            _controller.ControllerContext = new ControllerContext { HttpContext = httpContext };

            var result = await _controller.CreateTodoSchedule(schedule);

            var createdResult = Assert.IsType<CreatedAtActionResult>(result);
            Assert.Equal("GetTodoSchedule", createdResult.ActionName);
        }
    }
}
