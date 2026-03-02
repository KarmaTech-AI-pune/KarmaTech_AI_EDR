using MediatR;
using Microsoft.AspNetCore.Mvc;
using Moq;
using EDR.Application.CQRS.SprintWbsPlans.Commands;
using EDR.Application.CQRS.SprintWbsPlans.Queries;
using EDR.Application.Dtos;
using EDR.Domain.Entities;
using EDR.API.Controllers;

namespace EDR.API.Tests.Controllers
{
    public class ProgramSprintControllerTests
    {
        private readonly Mock<IMediator> _mediator;
        private readonly ProgramSprintController _controller;

        public ProgramSprintControllerTests()
        {
            _mediator = new Mock<IMediator>();
            _controller = new ProgramSprintController(_mediator.Object);
        }

        // ===================== BulkCreate =====================

        [Fact]
        public async Task BulkCreate_ShouldReturnOk_WithListOfIds()
        {
            // Arrange
            var items = new List<CreateSprintWbsPlanDto>
            {
                new CreateSprintWbsPlanDto { ProjectId = 1, WBSTaskName = "Task A", MonthYear = "Jan-2026", SprintNumber = 1 },
                new CreateSprintWbsPlanDto { ProjectId = 1, WBSTaskName = "Task B", MonthYear = "Jan-2026", SprintNumber = 1 }
            };
            var expectedIds = new List<int> { 101, 102 };

            _mediator.Setup(m => m.Send(It.IsAny<BulkCreateSprintWbsPlanCommand>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync(expectedIds);

            // Act
            var result = await _controller.BulkCreate(items);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsType<List<int>>(okResult.Value);
            Assert.Equal(2, returnValue.Count);
            Assert.Equal(101, returnValue[0]);
            Assert.Equal(102, returnValue[1]);
        }

        [Fact]
        public async Task BulkCreate_ShouldReturnOk_WithEmptyList_WhenNoItems()
        {
            // Arrange
            var items = new List<CreateSprintWbsPlanDto>();
            var expectedIds = new List<int>();

            _mediator.Setup(m => m.Send(It.IsAny<BulkCreateSprintWbsPlanCommand>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync(expectedIds);

            // Act
            var result = await _controller.BulkCreate(items);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsType<List<int>>(okResult.Value);
            Assert.Empty(returnValue);
        }

        // ===================== Get (by ProjectId) =====================

        [Fact]
        public async Task Get_ShouldReturnOk_WithSprintWbsPlans()
        {
            // Arrange
            var projectId = 1;
            var mockPlans = new List<SprintWbsPlan>
            {
                new SprintWbsPlan { SprintWbsPlanId = 1, ProjectId = projectId },
                new SprintWbsPlan { SprintWbsPlanId = 2, ProjectId = projectId }
            };

            _mediator.Setup(m => m.Send(It.Is<GetSprintWbsPlansByProjectQuery>(q => q.ProjectId == projectId), It.IsAny<CancellationToken>()))
                     .ReturnsAsync(mockPlans);

            // Act
            var result = await _controller.Get(projectId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnValue = Assert.IsType<List<SprintWbsPlan>>(okResult.Value);
            Assert.Equal(2, returnValue.Count);
        }

        [Fact]
        public async Task Get_ShouldReturnOk_WithEmptyList_WhenNoPlansExist()
        {
            // Arrange
            var projectId = 999;
            var mockPlans = new List<SprintWbsPlan>();

            _mediator.Setup(m => m.Send(It.Is<GetSprintWbsPlansByProjectQuery>(q => q.ProjectId == projectId), It.IsAny<CancellationToken>()))
                     .ReturnsAsync(mockPlans);

            // Act
            var result = await _controller.Get(projectId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnValue = Assert.IsType<List<SprintWbsPlan>>(okResult.Value);
            Assert.Empty(returnValue);
        }

        // ===================== GetCurrent =====================

        [Fact]
        public async Task GetCurrent_ShouldReturnOk_WhenCurrentSprintExists()
        {
            // Arrange
            var projectId = 1;
            var mockResponse = new CurrentSprintWbsPlanResponseDto
            {
                Project = new WbsProjectDto { ProjectId = projectId, ProjectName = "Test Project" },
                Sprint = new WbsSprintContextDto { MonthYear = "Jan-2026", SprintNumber = 1 },
                WbsPlans = new List<WbsPlanDto>
                {
                    new WbsPlanDto { SprintWbsPlanId = 1, WbsTaskName = "Task A", PlannedHours = 40 }
                }
            };

            _mediator.Setup(m => m.Send(It.Is<GetCurrentSprintWbsPlanQuery>(q => q.ProjectId == projectId), It.IsAny<CancellationToken>()))
                     .ReturnsAsync(mockResponse);

            // Act
            var result = await _controller.GetCurrent(projectId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnValue = Assert.IsType<CurrentSprintWbsPlanResponseDto>(okResult.Value);
            Assert.Equal(projectId, returnValue.Project.ProjectId);
            Assert.Single(returnValue.WbsPlans);
        }

        [Fact]
        public async Task GetCurrent_ShouldReturnNoContent_WhenNoCurrentSprintExists()
        {
            // Arrange
            var projectId = 999;
            CurrentSprintWbsPlanResponseDto nullResponse = null;

            _mediator.Setup(m => m.Send(It.Is<GetCurrentSprintWbsPlanQuery>(q => q.ProjectId == projectId), It.IsAny<CancellationToken>()))
                     .ReturnsAsync(nullResponse);

            // Act
            var result = await _controller.GetCurrent(projectId);

            // Assert
            Assert.IsType<NoContentResult>(result.Result);
        }

        [Fact]
        public async Task GetCurrent_ShouldVerifyMediatorCalled_WithCorrectProjectId()
        {
            // Arrange
            var projectId = 42;
            var mockResponse = new CurrentSprintWbsPlanResponseDto
            {
                Project = new WbsProjectDto { ProjectId = projectId },
                Sprint = new WbsSprintContextDto { MonthYear = "Feb-2026", SprintNumber = 2 },
                WbsPlans = new List<WbsPlanDto>()
            };

            _mediator.Setup(m => m.Send(It.IsAny<GetCurrentSprintWbsPlanQuery>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync(mockResponse);

            // Act
            await _controller.GetCurrent(projectId);

            // Assert
            _mediator.Verify(m => m.Send(It.Is<GetCurrentSprintWbsPlanQuery>(q => q.ProjectId == projectId), It.IsAny<CancellationToken>()), Times.Once);
        }
    }
}
