using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using NJS.Application.CQRS.SprintPlans.Commands;
using NJS.Application.CQRS.SprintPlans.Queries;
using NJS.Application.CQRS.SprintTasks.Commands;
using NJS.Application.CQRS.SprintTasks.Queries;
using NJS.Application.CQRS.SprintSubtasks.Commands;
using NJS.Application.CQRS.SprintSubtasks.Queries;
using NJS.Application.Dtos;
using NJSAPI.Controllers;

namespace NJS.API.Tests.Controllers
{
    public class SprintTaskControllerTests
    {
        private readonly Mock<IMediator> _mediator;
        private readonly Mock<ILogger<SprintTaskController>> _logger;
        private readonly SprintTaskController _controller;

        public SprintTaskControllerTests()
        {
            _mediator = new Mock<IMediator>();
            _logger = new Mock<ILogger<SprintTaskController>>();
            _controller = new SprintTaskController(_mediator.Object, _logger.Object);
        }

        // ==================== CreateSingleSprintPlan ====================

        [Fact]
        public async Task CreateSingleSprintPlan_ShouldReturnCreatedAtAction_WhenSuccessful()
        {
            // Arrange
            var dto = new SprintPlanInputDto { ProjectId = 1, SprintName = "Sprint 1" };
            _mediator.Setup(m => m.Send(It.IsAny<CreateSingleSprintPlanCommand>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync(101);

            // Act
            var result = await _controller.CreateSingleSprintPlan(dto);

            // Assert
            var createdResult = Assert.IsType<CreatedAtActionResult>(result);
            Assert.Equal(101, createdResult.Value);
        }

        [Fact]
        public async Task CreateSingleSprintPlan_ShouldReturnBadRequest_WhenModelStateInvalid()
        {
            // Arrange
            _controller.ModelState.AddModelError("ProjectId", "Required");

            // Act
            var result = await _controller.CreateSingleSprintPlan(new SprintPlanInputDto());

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task CreateSingleSprintPlan_ShouldReturnBadRequest_WhenArgumentExceptionThrown()
        {
            // Arrange
            var dto = new SprintPlanInputDto { ProjectId = 1 };
            _mediator.Setup(m => m.Send(It.IsAny<CreateSingleSprintPlanCommand>(), It.IsAny<CancellationToken>()))
                     .ThrowsAsync(new ArgumentException("Invalid data"));

            // Act
            var result = await _controller.CreateSingleSprintPlan(dto);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task CreateSingleSprintPlan_ShouldReturn500_WhenExceptionThrown()
        {
            // Arrange
            var dto = new SprintPlanInputDto { ProjectId = 1 };
            _mediator.Setup(m => m.Send(It.IsAny<CreateSingleSprintPlanCommand>(), It.IsAny<CancellationToken>()))
                     .ThrowsAsync(new Exception("DB error"));

            // Act
            var result = await _controller.CreateSingleSprintPlan(dto);

            // Assert
            var statusResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, statusResult.StatusCode);
        }

        // ==================== GetSingleSprintPlan ====================

        [Fact]
        public async Task GetSingleSprintPlan_ShouldReturnOk_WhenFound()
        {
            // Arrange
            var dto = new SprintPlanDto { SprintId = 1, SprintName = "Sprint 1", ProjectId = 1 };
            _mediator.Setup(m => m.Send(It.IsAny<GetSingleSprintPlanQuery>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync(dto);

            // Act
            var result = await _controller.GetSingleSprintPlan(1, 1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsType<SprintPlanDto>(okResult.Value);
            Assert.Equal(1, returnValue.SprintId);
        }

        [Fact]
        public async Task GetSingleSprintPlan_ShouldReturnNotFound_WhenNull()
        {
            // Arrange
            _mediator.Setup(m => m.Send(It.IsAny<GetSingleSprintPlanQuery>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync((SprintPlanDto)null);

            // Act
            var result = await _controller.GetSingleSprintPlan(999);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        [Fact]
        public async Task GetSingleSprintPlan_ShouldReturn500_WhenExceptionThrown()
        {
            // Arrange
            _mediator.Setup(m => m.Send(It.IsAny<GetSingleSprintPlanQuery>(), It.IsAny<CancellationToken>()))
                     .ThrowsAsync(new Exception("DB error"));

            // Act
            var result = await _controller.GetSingleSprintPlan(1);

            // Assert
            var statusResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, statusResult.StatusCode);
        }

        // ==================== GetNextSprint ====================

        [Fact]
        public async Task GetNextSprint_ShouldReturnOk_WhenFound()
        {
            // Arrange
            var dto = new SprintPlanDto { SprintId = 2, SprintName = "Sprint 2" };
            _mediator.Setup(m => m.Send(It.IsAny<GetNextSprintQuery>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync(dto);

            // Act
            var result = await _controller.GetNextSprint(1, 1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.IsType<SprintPlanDto>(okResult.Value);
        }

        [Fact]
        public async Task GetNextSprint_ShouldReturnNotFound_WhenNull()
        {
            // Arrange
            _mediator.Setup(m => m.Send(It.IsAny<GetNextSprintQuery>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync((SprintPlanDto)null);

            // Act
            var result = await _controller.GetNextSprint(1, 1);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        // ==================== UpdateSingleSprintPlan ====================

        [Fact]
        public async Task UpdateSingleSprintPlan_ShouldReturnOk_WhenSuccessful()
        {
            // Arrange
            var dto = new SprintPlanInputDto { SprintId = 1, ProjectId = 1 };
            _mediator.Setup(m => m.Send(It.IsAny<UpdateSingleSprintPlanCommand>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync(true);

            // Act
            var result = await _controller.UpdateSingleSprintPlan(dto);

            // Assert
            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task UpdateSingleSprintPlan_ShouldReturnNotFound_WhenNotFound()
        {
            // Arrange
            var dto = new SprintPlanInputDto { SprintId = 999 };
            _mediator.Setup(m => m.Send(It.IsAny<UpdateSingleSprintPlanCommand>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync(false);

            // Act
            var result = await _controller.UpdateSingleSprintPlan(dto);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        [Fact]
        public async Task UpdateSingleSprintPlan_ShouldReturnBadRequest_WhenModelStateInvalid()
        {
            // Arrange
            _controller.ModelState.AddModelError("SprintId", "Required");

            // Act
            var result = await _controller.UpdateSingleSprintPlan(new SprintPlanInputDto());

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task UpdateSingleSprintPlan_ShouldReturnBadRequest_WhenArgumentExceptionThrown()
        {
            // Arrange
            var dto = new SprintPlanInputDto { SprintId = 1 };
            _mediator.Setup(m => m.Send(It.IsAny<UpdateSingleSprintPlanCommand>(), It.IsAny<CancellationToken>()))
                     .ThrowsAsync(new ArgumentException("Validation failed"));

            // Act
            var result = await _controller.UpdateSingleSprintPlan(dto);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        // ==================== CreateSingleSprintTask ====================

        [Fact]
        public async Task CreateSingleSprintTask_ShouldReturnCreatedAtAction_WhenSuccessful()
        {
            // Arrange
            var dto = new SprintTaskInputDto { TaskTitle = "New Task", SprintPlanId = 1 };
            _mediator.Setup(m => m.Send(It.IsAny<CreateSprintTaskCommand>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync(42);

            // Act
            var result = await _controller.CreateSingleSprintTask(dto);

            // Assert
            Assert.IsType<CreatedAtActionResult>(result);
        }

        [Fact]
        public async Task CreateSingleSprintTask_ShouldReturnBadRequest_WhenModelStateInvalid()
        {
            // Arrange
            _controller.ModelState.AddModelError("TaskTitle", "Required");

            // Act
            var result = await _controller.CreateSingleSprintTask(new SprintTaskInputDto());

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task CreateSingleSprintTask_ShouldReturnBadRequest_WhenArgumentExceptionThrown()
        {
            // Arrange
            var dto = new SprintTaskInputDto { TaskTitle = "Task" };
            _mediator.Setup(m => m.Send(It.IsAny<CreateSprintTaskCommand>(), It.IsAny<CancellationToken>()))
                     .ThrowsAsync(new ArgumentException("Invalid"));

            // Act
            var result = await _controller.CreateSingleSprintTask(dto);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task CreateSingleSprintTask_ShouldReturn500_WhenExceptionThrown()
        {
            // Arrange
            var dto = new SprintTaskInputDto { TaskTitle = "Task" };
            _mediator.Setup(m => m.Send(It.IsAny<CreateSprintTaskCommand>(), It.IsAny<CancellationToken>()))
                     .ThrowsAsync(new Exception("DB error"));

            // Act
            var result = await _controller.CreateSingleSprintTask(dto);

            // Assert
            var statusResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, statusResult.StatusCode);
        }

        // ==================== GetSingleSprintTask ====================

        [Fact]
        public async Task GetSingleSprintTask_ShouldReturnOk_WhenFound()
        {
            // Arrange
            var dto = new SprintTaskDto { Taskid = 1, TaskTitle = "Test Task" };
            _mediator.Setup(m => m.Send(It.IsAny<GetSingleSprintTaskQuery>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync(dto);

            // Act
            var result = await _controller.GetSingleSprintTask(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.IsType<SprintTaskDto>(okResult.Value);
        }

        [Fact]
        public async Task GetSingleSprintTask_ShouldReturnNotFound_WhenNull()
        {
            // Arrange
            _mediator.Setup(m => m.Send(It.IsAny<GetSingleSprintTaskQuery>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync((SprintTaskDto)null);

            // Act
            var result = await _controller.GetSingleSprintTask(999);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        [Fact]
        public async Task GetSingleSprintTask_ShouldReturn500_WhenExceptionThrown()
        {
            // Arrange
            _mediator.Setup(m => m.Send(It.IsAny<GetSingleSprintTaskQuery>(), It.IsAny<CancellationToken>()))
                     .ThrowsAsync(new Exception("DB error"));

            // Act
            var result = await _controller.GetSingleSprintTask(1);

            // Assert
            var statusResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, statusResult.StatusCode);
        }

        // ==================== UpdateSingleSprintTask ====================

        [Fact]
        public async Task UpdateSingleSprintTask_ShouldReturnOk_WhenSuccessful()
        {
            // Arrange
            var dto = new SprintTaskInputDto { Taskid = 1, TaskTitle = "Updated" };
            _mediator.Setup(m => m.Send(It.IsAny<UpdateSprintTaskCommand>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync(true);

            // Act
            var result = await _controller.UpdateSingleSprintTask(dto);

            // Assert
            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task UpdateSingleSprintTask_ShouldReturnNotFound_WhenNotFound()
        {
            // Arrange
            var dto = new SprintTaskInputDto { Taskid = 999 };
            _mediator.Setup(m => m.Send(It.IsAny<UpdateSprintTaskCommand>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync(false);

            // Act
            var result = await _controller.UpdateSingleSprintTask(dto);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        [Fact]
        public async Task UpdateSingleSprintTask_ShouldReturnBadRequest_WhenModelStateInvalid()
        {
            // Arrange
            _controller.ModelState.AddModelError("Taskid", "Required");

            // Act
            var result = await _controller.UpdateSingleSprintTask(new SprintTaskInputDto());

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        // ==================== GetSprintTasksByProjectId ====================

        [Fact]
        public async Task GetSprintTasksByProjectId_ShouldReturnOk_WhenTasksFound()
        {
            // Arrange
            var tasks = new List<SprintTaskSummaryDto>
            {
                new SprintTaskSummaryDto { Taskid = 1, TaskTitle = "Task 1" },
                new SprintTaskSummaryDto { Taskid = 2, TaskTitle = "Task 2" }
            };
            _mediator.Setup(m => m.Send(It.IsAny<GetSprintTasksByProjectIdQuery>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync(tasks);

            // Act
            var result = await _controller.GetSprintTasksByProjectId(1);

            // Assert
            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task GetSprintTasksByProjectId_ShouldReturnNotFound_WhenNoTasks()
        {
            // Arrange
            _mediator.Setup(m => m.Send(It.IsAny<GetSprintTasksByProjectIdQuery>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync(new List<SprintTaskSummaryDto>());

            // Act
            var result = await _controller.GetSprintTasksByProjectId(999);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        // ==================== DeleteSprintTask ====================

        [Fact]
        public async Task DeleteSprintTask_ShouldReturnOk_WhenSuccessful()
        {
            // Arrange
            _mediator.Setup(m => m.Send(It.IsAny<DeleteSprintTaskCommand>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync(true);

            // Act
            var result = await _controller.DeleteSprintTask(1);

            // Assert
            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task DeleteSprintTask_ShouldReturnBadRequest_WhenIdInvalid()
        {
            // Act
            var result = await _controller.DeleteSprintTask(0);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task DeleteSprintTask_ShouldReturnNotFound_WhenNotFound()
        {
            // Arrange
            _mediator.Setup(m => m.Send(It.IsAny<DeleteSprintTaskCommand>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync(false);

            // Act
            var result = await _controller.DeleteSprintTask(999);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        [Fact]
        public async Task DeleteSprintTask_ShouldReturnBadRequest_WhenArgumentExceptionThrown()
        {
            // Arrange
            _mediator.Setup(m => m.Send(It.IsAny<DeleteSprintTaskCommand>(), It.IsAny<CancellationToken>()))
                     .ThrowsAsync(new ArgumentException("Invalid"));

            // Act
            var result = await _controller.DeleteSprintTask(1);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task DeleteSprintTask_ShouldReturn500_WhenExceptionThrown()
        {
            // Arrange
            _mediator.Setup(m => m.Send(It.IsAny<DeleteSprintTaskCommand>(), It.IsAny<CancellationToken>()))
                     .ThrowsAsync(new Exception("DB error"));

            // Act
            var result = await _controller.DeleteSprintTask(1);

            // Assert
            var statusResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, statusResult.StatusCode);
        }

        // ==================== UpdateSprintTaskTime ====================

        [Fact]
        public async Task UpdateSprintTaskTime_ShouldReturnOk_WhenSuccessful()
        {
            // Arrange
            var cmd = new UpdateSprintTaskTimeCommand { TaskId = 1, SprintWbsPlanId = 10, ActualHours = 8 };
            _mediator.Setup(m => m.Send(It.IsAny<UpdateSprintTaskTimeCommand>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync(true);

            // Act
            var result = await _controller.UpdateSprintTaskTime(cmd);

            // Assert
            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task UpdateSprintTaskTime_ShouldReturnNotFound_WhenNotFound()
        {
            // Arrange
            var cmd = new UpdateSprintTaskTimeCommand { TaskId = 999, SprintWbsPlanId = 10, ActualHours = 8 };
            _mediator.Setup(m => m.Send(It.IsAny<UpdateSprintTaskTimeCommand>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync(false);

            // Act
            var result = await _controller.UpdateSprintTaskTime(cmd);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        [Fact]
        public async Task UpdateSprintTaskTime_ShouldReturnBadRequest_WhenModelStateInvalid()
        {
            // Arrange
            _controller.ModelState.AddModelError("TaskId", "Required");

            // Act
            var result = await _controller.UpdateSprintTaskTime(new UpdateSprintTaskTimeCommand());

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        // ==================== CreateSprintSubtask ====================

        [Fact]
        public async Task CreateSprintSubtask_ShouldReturnCreatedAtAction_WhenSuccessful()
        {
            // Arrange
            var dto = new SprintSubtaskDto { Taskid = 1, Subtasktitle = "Subtask 1" };
            _mediator.Setup(m => m.Send(It.IsAny<CreateSprintSubtaskCommand>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync(42); // Returns int (subtask ID)

            // Act
            var result = await _controller.CreateSprintSubtask(1, dto);

            // Assert
            Assert.IsType<CreatedAtActionResult>(result);
        }

        [Fact]
        public async Task CreateSprintSubtask_ShouldReturnBadRequest_WhenTaskIdMismatch()
        {
            // Arrange
            var dto = new SprintSubtaskDto { Taskid = 2, Subtasktitle = "Subtask 1" };

            // Act
            var result = await _controller.CreateSprintSubtask(1, dto);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        // ==================== UpdateSprintSubtask ====================

        [Fact]
        public async Task UpdateSprintSubtask_ShouldReturnOk_WhenSuccessful()
        {
            // Arrange
            var dto = new SprintSubtaskDto { SubtaskId = 10, Taskid = 1, Subtasktitle = "Updated" };
            _mediator.Setup(m => m.Send(It.IsAny<UpdateSprintSubtaskCommand>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync(Unit.Value);

            // Act
            var result = await _controller.UpdateSprintSubtask(10, dto);

            // Assert
            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task UpdateSprintSubtask_ShouldReturnBadRequest_WhenSubtaskIdMismatch()
        {
            // Arrange
            var dto = new SprintSubtaskDto { SubtaskId = 99, Taskid = 1 };

            // Act
            var result = await _controller.UpdateSprintSubtask(10, dto);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        // ==================== DeleteSprintSubtask ====================

        [Fact]
        public async Task DeleteSprintSubtask_ShouldReturnOk_WhenSuccessful()
        {
            // Arrange
            _mediator.Setup(m => m.Send(It.IsAny<DeleteSprintSubtaskCommand>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync(true);

            // Act
            var result = await _controller.DeleteSprintSubtask(1);

            // Assert
            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task DeleteSprintSubtask_ShouldReturnBadRequest_WhenIdInvalid()
        {
            // Act
            var result = await _controller.DeleteSprintSubtask(0);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task DeleteSprintSubtask_ShouldReturnNotFound_WhenNotFound()
        {
            // Arrange
            _mediator.Setup(m => m.Send(It.IsAny<DeleteSprintSubtaskCommand>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync(false);

            // Act
            var result = await _controller.DeleteSprintSubtask(999);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        // ==================== GetSprintSubtaskById ====================

        [Fact]
        public async Task GetSprintSubtaskById_ShouldReturnOk_WhenFound()
        {
            // Arrange
            var dto = new SprintSubtaskDto { SubtaskId = 1, Subtasktitle = "Sub 1" };
            _mediator.Setup(m => m.Send(It.IsAny<GetSprintSubtaskByIdQuery>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync(dto);

            // Act
            var result = await _controller.GetSprintSubtaskById(1);

            // Assert
            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task GetSprintSubtaskById_ShouldReturnNotFound_WhenNull()
        {
            // Arrange
            _mediator.Setup(m => m.Send(It.IsAny<GetSprintSubtaskByIdQuery>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync((SprintSubtaskDto)null);

            // Act
            var result = await _controller.GetSprintSubtaskById(999);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        // ==================== GetAllSprintSubtasksByTaskId ====================

        [Fact]
        public async Task GetAllSprintSubtasksByTaskId_ShouldReturnOk_WhenFound()
        {
            // Arrange
            var subtasks = new List<SprintSubtaskDto>
            {
                new SprintSubtaskDto { SubtaskId = 1, Taskid = 1 }
            };
            _mediator.Setup(m => m.Send(It.IsAny<GetAllSprintSubtasksByTaskIdQuery>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync(subtasks);

            // Act
            var result = await _controller.GetAllSprintSubtasksByTaskId(1);

            // Assert
            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task GetAllSprintSubtasksByTaskId_ShouldReturnNotFound_WhenEmpty()
        {
            // Arrange
            _mediator.Setup(m => m.Send(It.IsAny<GetAllSprintSubtasksByTaskIdQuery>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync(new List<SprintSubtaskDto>());

            // Act
            var result = await _controller.GetAllSprintSubtasksByTaskId(999);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        // ==================== Task Comments ====================

        [Fact]
        public async Task GetSprintTaskCommentsByTaskId_ShouldReturnOk_WhenFound()
        {
            // Arrange
            var comments = new List<SprintTaskCommentDto>
            {
                new SprintTaskCommentDto { CommentId = 1, Taskid = 1, CommentText = "Comment" }
            };
            _mediator.Setup(m => m.Send(It.IsAny<GetSprintTaskCommentsByTaskIdQuery>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync(comments);

            // Act
            var result = await _controller.GetSprintTaskCommentsByTaskId(1);

            // Assert
            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task GetSprintTaskCommentsByTaskId_ShouldReturnNotFound_WhenEmpty()
        {
            // Arrange
            _mediator.Setup(m => m.Send(It.IsAny<GetSprintTaskCommentsByTaskIdQuery>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync(new List<SprintTaskCommentDto>());

            // Act
            var result = await _controller.GetSprintTaskCommentsByTaskId(999);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        [Fact]
        public async Task GetSprintTaskCommentById_ShouldReturnOk_WhenFound()
        {
            // Arrange
            var comment = new SprintTaskCommentDto { CommentId = 1, CommentText = "Test" };
            _mediator.Setup(m => m.Send(It.IsAny<GetSprintTaskCommentByIdQuery>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync(comment);

            // Act
            var result = await _controller.GetSprintTaskCommentById(1);

            // Assert
            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task GetSprintTaskCommentById_ShouldReturnNotFound_WhenNull()
        {
            // Arrange
            _mediator.Setup(m => m.Send(It.IsAny<GetSprintTaskCommentByIdQuery>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync((SprintTaskCommentDto)null);

            // Act
            var result = await _controller.GetSprintTaskCommentById(999);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        [Fact]
        public async Task AddSprintTaskComment_ShouldReturn201_WhenSuccessful()
        {
            // Arrange
            var cmd = new AddSprintTaskCommentCommand { CommentText = "New comment", CreatedBy = "user" };
            _mediator.Setup(m => m.Send(It.IsAny<AddSprintTaskCommentCommand>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync(true);

            // Act
            var result = await _controller.AddSprintTaskComment(1, cmd);

            // Assert
            var statusResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(201, statusResult.StatusCode);
        }

        [Fact]
        public async Task AddSprintTaskComment_ShouldReturnNotFound_WhenTaskNotFound()
        {
            // Arrange
            var cmd = new AddSprintTaskCommentCommand { CommentText = "Comment", CreatedBy = "user" };
            _mediator.Setup(m => m.Send(It.IsAny<AddSprintTaskCommentCommand>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync(false);

            // Act
            var result = await _controller.AddSprintTaskComment(999, cmd);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        [Fact]
        public async Task AddSprintTaskComment_ShouldReturnBadRequest_WhenModelStateInvalid()
        {
            // Arrange
            _controller.ModelState.AddModelError("CommentText", "Required");

            // Act
            var result = await _controller.AddSprintTaskComment(1, new AddSprintTaskCommentCommand());

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task UpdateSprintTaskComment_ShouldReturnOk_WhenSuccessful()
        {
            // Arrange
            var cmd = new UpdateSprintTaskCommentCommand { CommentText = "Updated", UpdatedBy = "user" };
            _mediator.Setup(m => m.Send(It.IsAny<UpdateSprintTaskCommentCommand>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync(true);

            // Act
            var result = await _controller.UpdateSprintTaskComment(1, 1, cmd);

            // Assert
            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task UpdateSprintTaskComment_ShouldReturnNotFound_WhenNotFound()
        {
            // Arrange
            var cmd = new UpdateSprintTaskCommentCommand { CommentText = "Updated", UpdatedBy = "user" };
            _mediator.Setup(m => m.Send(It.IsAny<UpdateSprintTaskCommentCommand>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync(false);

            // Act
            var result = await _controller.UpdateSprintTaskComment(1, 999, cmd);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        [Fact]
        public async Task DeleteSprintTaskComment_ShouldReturnOk_WhenSuccessful()
        {
            // Arrange
            _mediator.Setup(m => m.Send(It.IsAny<DeleteSprintTaskCommentCommand>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync(true);

            // Act
            var result = await _controller.DeleteSprintTaskComment(1);

            // Assert
            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task DeleteSprintTaskComment_ShouldReturnBadRequest_WhenIdInvalid()
        {
            // Act
            var result = await _controller.DeleteSprintTaskComment(0);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task DeleteSprintTaskComment_ShouldReturnNotFound_WhenNotFound()
        {
            // Arrange
            _mediator.Setup(m => m.Send(It.IsAny<DeleteSprintTaskCommentCommand>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync(false);

            // Act
            var result = await _controller.DeleteSprintTaskComment(999);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        // ==================== Subtask Comments ====================

        [Fact]
        public async Task GetSprintSubtaskCommentsBySubtaskId_ShouldReturnOk_WhenFound()
        {
            // Arrange
            var comments = new List<SprintSubtaskCommentDto>
            {
                new SprintSubtaskCommentDto { SubtaskCommentId = 1, SubtaskId = 1, CommentText = "Comment" }
            };
            _mediator.Setup(m => m.Send(It.IsAny<GetSprintSubtaskCommentsBySubtaskIdQuery>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync(comments);

            // Act
            var result = await _controller.GetSprintSubtaskCommentsBySubtaskId(1, 1);

            // Assert
            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task GetSprintSubtaskCommentsBySubtaskId_ShouldReturnNotFound_WhenEmpty()
        {
            // Arrange
            _mediator.Setup(m => m.Send(It.IsAny<GetSprintSubtaskCommentsBySubtaskIdQuery>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync(new List<SprintSubtaskCommentDto>());

            // Act
            var result = await _controller.GetSprintSubtaskCommentsBySubtaskId(1, 999);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        [Fact]
        public async Task GetSprintSubtaskCommentById_ShouldReturnOk_WhenFound()
        {
            // Arrange
            var comment = new SprintSubtaskCommentDto { SubtaskCommentId = 1, CommentText = "Test" };
            _mediator.Setup(m => m.Send(It.IsAny<GetSprintSubtaskCommentByIdQuery>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync(comment);

            // Act
            var result = await _controller.GetSprintSubtaskCommentById(1);

            // Assert
            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task GetSprintSubtaskCommentById_ShouldReturnNotFound_WhenNull()
        {
            // Arrange
            _mediator.Setup(m => m.Send(It.IsAny<GetSprintSubtaskCommentByIdQuery>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync((SprintSubtaskCommentDto)null);

            // Act
            var result = await _controller.GetSprintSubtaskCommentById(999);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        [Fact]
        public async Task AddSprintSubtaskComment_ShouldReturn201_WhenSuccessful()
        {
            // Arrange
            var cmd = new AddSprintSubtaskCommentCommand { CommentText = "Comment", CreatedBy = "user" };
            _mediator.Setup(m => m.Send(It.IsAny<AddSprintSubtaskCommentCommand>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync(true);

            // Act
            var result = await _controller.AddSprintSubtaskComment(1, 1, cmd);

            // Assert
            var statusResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(201, statusResult.StatusCode);
        }

        [Fact]
        public async Task AddSprintSubtaskComment_ShouldReturnNotFound_WhenSubtaskNotFound()
        {
            // Arrange
            var cmd = new AddSprintSubtaskCommentCommand { CommentText = "Comment", CreatedBy = "user" };
            _mediator.Setup(m => m.Send(It.IsAny<AddSprintSubtaskCommentCommand>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync(false);

            // Act
            var result = await _controller.AddSprintSubtaskComment(1, 999, cmd);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        [Fact]
        public async Task UpdateSprintSubtaskComment_ShouldReturnOk_WhenSuccessful()
        {
            // Arrange
            var cmd = new UpdateSprintSubtaskCommentCommand { CommentText = "Updated", UpdatedBy = "user" };
            _mediator.Setup(m => m.Send(It.IsAny<UpdateSprintSubtaskCommentCommand>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync(true);

            // Act
            var result = await _controller.UpdateSprintSubtaskComment(1, 1, 1, cmd);

            // Assert
            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task UpdateSprintSubtaskComment_ShouldReturnNotFound_WhenNotFound()
        {
            // Arrange
            var cmd = new UpdateSprintSubtaskCommentCommand { CommentText = "Updated", UpdatedBy = "user" };
            _mediator.Setup(m => m.Send(It.IsAny<UpdateSprintSubtaskCommentCommand>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync(false);

            // Act
            var result = await _controller.UpdateSprintSubtaskComment(1, 1, 999, cmd);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        [Fact]
        public async Task DeleteSprintSubtaskComment_ShouldReturnOk_WhenSuccessful()
        {
            // Arrange
            _mediator.Setup(m => m.Send(It.IsAny<DeleteSprintSubtaskCommentCommand>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync(true);

            // Act
            var result = await _controller.DeleteSprintSubtaskComment(1);

            // Assert
            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task DeleteSprintSubtaskComment_ShouldReturnBadRequest_WhenIdInvalid()
        {
            // Act
            var result = await _controller.DeleteSprintSubtaskComment(0);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task DeleteSprintSubtaskComment_ShouldReturnNotFound_WhenNotFound()
        {
            // Arrange
            _mediator.Setup(m => m.Send(It.IsAny<DeleteSprintSubtaskCommentCommand>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync(false);

            // Act
            var result = await _controller.DeleteSprintSubtaskComment(999);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }
    }
}
