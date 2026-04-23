using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using EDR.API.Controllers;
using EDR.Application.CQRS.ProjectClosure.Commands;
using EDR.Application.CQRS.ProjectClosure.Queries;
using EDR.Application.CQRS.Projects.Queries;
using EDR.Application.Dtos;
using EDR.Domain.Entities;

namespace EDR.API.Tests.Controllers
{
    public class ProjectClosureControllerTests
    {
        private readonly Mock<IMediator> _mediatorMock;
        private readonly Mock<ILogger<ProjectClosureController>> _loggerMock;
        private readonly ProjectClosureController _controller;

        public ProjectClosureControllerTests()
        {
            _mediatorMock = new Mock<IMediator>();
            _loggerMock = new Mock<ILogger<ProjectClosureController>>();
            
            _controller = new ProjectClosureController(_mediatorMock.Object, _loggerMock.Object);
            
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext()
            };
        }

        [Fact]
        public async Task GetAll_ReturnsOkResult()
        {
            _mediatorMock.Setup(m => m.Send(It.IsAny<GetAllProjectClosuresQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new List<ProjectClosureDto>());

            var result = await _controller.GetAll();

            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task GetById_ReturnsOk_WhenFound()
        {
            _mediatorMock.Setup(m => m.Send(It.IsAny<GetProjectClosureByIdQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new ProjectClosureDto { Id = 1 });

            var result = await _controller.GetById(1);

            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task GetById_ReturnsNotFound_WhenNull()
        {
            _mediatorMock.Setup(m => m.Send(It.IsAny<GetProjectClosureByIdQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((ProjectClosureDto)null);

            var result = await _controller.GetById(1);

            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public async Task GetByProjectId_ReturnsOk_WhenFound()
        {
            _mediatorMock.Setup(m => m.Send(It.IsAny<GetProjectClosureByProjectIdQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new ProjectClosureDto { ProjectId = 1 });

            var result = await _controller.GetByProjectId(1);

            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task GetByProjectId_ReturnsNotFound_WhenNull()
        {
            _mediatorMock.Setup(m => m.Send(It.IsAny<GetProjectClosureByProjectIdQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((ProjectClosureDto)null);

            var result = await _controller.GetByProjectId(1);

            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public async Task Create_ReturnsOk_WhenSuccessful()
        {
            var reqData = new { ProjectId = 1, CreatedBy = "test", comments = new List<object>() };
            
            // GetProjectByIdQuery returns Project entity
            _mediatorMock.Setup(m => m.Send(It.IsAny<GetProjectByIdQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new Project { Id = 1, Name = "Proj" });
                
            _mediatorMock.Setup(m => m.Send(It.IsAny<GetProjectClosureByProjectIdQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((ProjectClosureDto)null);

            _mediatorMock.Setup(m => m.Send(It.IsAny<CreateProjectClosureCommand>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(1);

            var jsonString = JsonSerializer.Serialize(reqData);
            var doc = JsonDocument.Parse(jsonString).RootElement;

            var result = await _controller.Create(doc);

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(okResult.Value);
        }

        [Fact]
        public async Task Update_ReturnsOk_WhenSuccessful()
        {
            var reqData = new { Id = 1, ProjectId = 1, CreatedBy = "test", comments = new List<object>() };
            
            _mediatorMock.Setup(m => m.Send(It.IsAny<GetProjectByIdQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new Project { Id = 1, Name = "Proj" });

            _mediatorMock.Setup(m => m.Send(It.IsAny<UpdateProjectClosureCommand>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);

            var jsonString = JsonSerializer.Serialize(reqData);
            var doc = JsonDocument.Parse(jsonString).RootElement;

            var result = await _controller.Update(1, doc);

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(okResult.Value);
        }

        [Fact]
        public async Task Delete_ReturnsOk_WhenSuccessful()
        {
            _mediatorMock.Setup(m => m.Send(It.IsAny<DeleteProjectClosureCommand>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);

            var result = await _controller.Delete(1);

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(okResult.Value);
        }

        [Fact]
        public async Task Delete_ReturnsNotFound_WhenNull()
        {
            _mediatorMock.Setup(m => m.Send(It.IsAny<DeleteProjectClosureCommand>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(false);

            var result = await _controller.Delete(1);

            Assert.IsType<NotFoundObjectResult>(result);
        }

        [Fact]
        public async Task GetAvailableProjects_ReturnsOk_WithData()
        {
            // GetAllProjectsQuery returns IEnumerable<Project>
            _mediatorMock.Setup(m => m.Send(It.IsAny<GetAllProjectsQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new List<Project> { new Project { Id = 1, Name = "Proj" } });

            var result = await _controller.GetAvailableProjects();

            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task GetAllByProjectId_ReturnsOk_WithData()
        {
            _mediatorMock.Setup(m => m.Send(It.IsAny<GetProjectClosuresByProjectIdQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new List<ProjectClosureDto>());

            var result = await _controller.GetAllByProjectId(1);

            Assert.IsType<OkObjectResult>(result);
        }
    }
}
