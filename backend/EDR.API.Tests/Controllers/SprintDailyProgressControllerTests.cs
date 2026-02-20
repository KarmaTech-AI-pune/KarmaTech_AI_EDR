using MediatR;
using Microsoft.AspNetCore.Mvc;
using Moq;
using NJS.Application.CQRS.SprintDailyProgresses.Commands;
using NJS.Application.CQRS.SprintDailyProgresses.Queries;
using NJS.Application.Dtos;
using NJS.API.Controllers;

namespace NJS.API.Tests.Controllers
{
    public class SprintDailyProgressControllerTests
    {
        private readonly Mock<IMediator> _mediator;
        private readonly SprintDailyProgressController _controller;

        public SprintDailyProgressControllerTests()
        {
            _mediator = new Mock<IMediator>();
            _controller = new SprintDailyProgressController(_mediator.Object);
        }

        // ===================== CreateSprintDailyProgress =====================

        [Fact]
        public async Task CreateSprintDailyProgress_ShouldReturnCreatedAtAction_WhenSuccessful()
        {
            // Arrange
            var command = new CreateSprintDailyProgressCommand
            {
                TenantId = 1,
                SprintPlanId = 10,
                Date = DateTime.UtcNow,
                PlannedStoryPoints = 20,
                CompletedStoryPoints = 5,
                RemainingStoryPoints = 15,
                AddedStoryPoints = 0,
                IdealRemainingPoints = 14,
                CreatedBy = "user@test.com"
            };

            var expectedDto = new SprintDailyProgressDto
            {
                DailyProgressId = 1,
                TenantId = 1,
                SprintPlanId = 10,
                PlannedStoryPoints = 20,
                CompletedStoryPoints = 5
            };

            _mediator.Setup(m => m.Send(It.IsAny<CreateSprintDailyProgressCommand>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync(expectedDto);

            // Act
            var result = await _controller.CreateSprintDailyProgress(command);

            // Assert
            var createdResult = Assert.IsType<CreatedAtActionResult>(result.Result);
            var returnValue = Assert.IsType<SprintDailyProgressDto>(createdResult.Value);
            Assert.Equal(1, returnValue.DailyProgressId);
            Assert.Equal(10, returnValue.SprintPlanId);
        }

        [Fact]
        public async Task CreateSprintDailyProgress_ShouldReturnNotFound_WhenKeyNotFoundExceptionThrown()
        {
            // Arrange
            var command = new CreateSprintDailyProgressCommand { SprintPlanId = 999 };

            _mediator.Setup(m => m.Send(It.IsAny<CreateSprintDailyProgressCommand>(), It.IsAny<CancellationToken>()))
                     .ThrowsAsync(new KeyNotFoundException("SprintPlan not found."));

            // Act
            var result = await _controller.CreateSprintDailyProgress(command);

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result.Result);
            Assert.Equal("SprintPlan not found.", notFoundResult.Value);
        }

        [Fact]
        public async Task CreateSprintDailyProgress_ShouldReturnStatusCode500_WhenExceptionThrown()
        {
            // Arrange
            var command = new CreateSprintDailyProgressCommand { SprintPlanId = 10 };

            _mediator.Setup(m => m.Send(It.IsAny<CreateSprintDailyProgressCommand>(), It.IsAny<CancellationToken>()))
                     .ThrowsAsync(new Exception("Database error"));

            // Act
            var result = await _controller.CreateSprintDailyProgress(command);

            // Assert
            var statusCodeResult = Assert.IsType<ObjectResult>(result.Result);
            Assert.Equal(500, statusCodeResult.StatusCode);
        }

        // ===================== UpdateSprintDailyProgress =====================

        [Fact]
        public async Task UpdateSprintDailyProgress_ShouldReturnOk_WhenSuccessful()
        {
            // Arrange
            var dailyProgressId = 1;
            var command = new UpdateSprintDailyProgressCommand
            {
                DailyProgressId = dailyProgressId,
                TenantId = 1,
                SprintPlanId = 10,
                Date = DateTime.UtcNow,
                CompletedStoryPoints = 10,
                RemainingStoryPoints = 10,
                UpdatedBy = "user@test.com"
            };

            var expectedDto = new SprintDailyProgressDto
            {
                DailyProgressId = dailyProgressId,
                CompletedStoryPoints = 10,
                RemainingStoryPoints = 10
            };

            _mediator.Setup(m => m.Send(It.IsAny<UpdateSprintDailyProgressCommand>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync(expectedDto);

            // Act
            var result = await _controller.UpdateSprintDailyProgress(dailyProgressId, command);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnValue = Assert.IsType<SprintDailyProgressDto>(okResult.Value);
            Assert.Equal(dailyProgressId, returnValue.DailyProgressId);
            Assert.Equal(10, returnValue.CompletedStoryPoints);
        }

        [Fact]
        public async Task UpdateSprintDailyProgress_ShouldReturnBadRequest_WhenIdMismatch()
        {
            // Arrange
            var dailyProgressId = 1;
            var command = new UpdateSprintDailyProgressCommand { DailyProgressId = 999 };

            // Act
            var result = await _controller.UpdateSprintDailyProgress(dailyProgressId, command);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
            Assert.Equal("DailyProgressId in URL and body do not match.", badRequestResult.Value);
        }

        [Fact]
        public async Task UpdateSprintDailyProgress_ShouldReturnNotFound_WhenKeyNotFoundExceptionThrown()
        {
            // Arrange
            var dailyProgressId = 1;
            var command = new UpdateSprintDailyProgressCommand { DailyProgressId = dailyProgressId };

            _mediator.Setup(m => m.Send(It.IsAny<UpdateSprintDailyProgressCommand>(), It.IsAny<CancellationToken>()))
                     .ThrowsAsync(new KeyNotFoundException("Daily progress not found."));

            // Act
            var result = await _controller.UpdateSprintDailyProgress(dailyProgressId, command);

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result.Result);
            Assert.Equal("Daily progress not found.", notFoundResult.Value);
        }

        [Fact]
        public async Task UpdateSprintDailyProgress_ShouldReturnStatusCode500_WhenExceptionThrown()
        {
            // Arrange
            var dailyProgressId = 1;
            var command = new UpdateSprintDailyProgressCommand { DailyProgressId = dailyProgressId };

            _mediator.Setup(m => m.Send(It.IsAny<UpdateSprintDailyProgressCommand>(), It.IsAny<CancellationToken>()))
                     .ThrowsAsync(new Exception("Database error"));

            // Act
            var result = await _controller.UpdateSprintDailyProgress(dailyProgressId, command);

            // Assert
            var statusCodeResult = Assert.IsType<ObjectResult>(result.Result);
            Assert.Equal(500, statusCodeResult.StatusCode);
        }

        // ===================== GetSprintDailyProgressBySprintPlanId =====================

        [Fact]
        public async Task GetSprintDailyProgressBySprintPlanId_ShouldReturnOk_WithProgressList()
        {
            // Arrange
            var sprintPlanId = 10;
            var mockProgress = new List<SprintDailyProgressDto>
            {
                new SprintDailyProgressDto { DailyProgressId = 1, SprintPlanId = sprintPlanId, CompletedStoryPoints = 5 },
                new SprintDailyProgressDto { DailyProgressId = 2, SprintPlanId = sprintPlanId, CompletedStoryPoints = 10 }
            };

            _mediator.Setup(m => m.Send(It.Is<GetSprintDailyProgressBySprintPlanIdQuery>(q => q.SprintPlanId == sprintPlanId), It.IsAny<CancellationToken>()))
                     .ReturnsAsync(mockProgress);

            // Act
            var result = await _controller.GetSprintDailyProgressBySprintPlanId(sprintPlanId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnValue = Assert.IsAssignableFrom<IEnumerable<SprintDailyProgressDto>>(okResult.Value);
            Assert.Equal(2, returnValue.Count());
        }

        [Fact]
        public async Task GetSprintDailyProgressBySprintPlanId_ShouldReturnNotFound_WhenKeyNotFoundExceptionThrown()
        {
            // Arrange
            var sprintPlanId = 999;

            _mediator.Setup(m => m.Send(It.IsAny<GetSprintDailyProgressBySprintPlanIdQuery>(), It.IsAny<CancellationToken>()))
                     .ThrowsAsync(new KeyNotFoundException("SprintPlan not found."));

            // Act
            var result = await _controller.GetSprintDailyProgressBySprintPlanId(sprintPlanId);

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result.Result);
            Assert.Equal("SprintPlan not found.", notFoundResult.Value);
        }

        [Fact]
        public async Task GetSprintDailyProgressBySprintPlanId_ShouldReturnStatusCode500_WhenExceptionThrown()
        {
            // Arrange
            var sprintPlanId = 10;

            _mediator.Setup(m => m.Send(It.IsAny<GetSprintDailyProgressBySprintPlanIdQuery>(), It.IsAny<CancellationToken>()))
                     .ThrowsAsync(new Exception("Database error"));

            // Act
            var result = await _controller.GetSprintDailyProgressBySprintPlanId(sprintPlanId);

            // Assert
            var statusCodeResult = Assert.IsType<ObjectResult>(result.Result);
            Assert.Equal(500, statusCodeResult.StatusCode);
        }

        [Fact]
        public async Task GetSprintDailyProgressBySprintPlanId_ShouldVerifyMediatorCalledWithCorrectId()
        {
            // Arrange
            var sprintPlanId = 42;
            var mockProgress = new List<SprintDailyProgressDto>();

            _mediator.Setup(m => m.Send(It.IsAny<GetSprintDailyProgressBySprintPlanIdQuery>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync(mockProgress);

            // Act
            await _controller.GetSprintDailyProgressBySprintPlanId(sprintPlanId);

            // Assert
            _mediator.Verify(m => m.Send(It.Is<GetSprintDailyProgressBySprintPlanIdQuery>(q => q.SprintPlanId == sprintPlanId), It.IsAny<CancellationToken>()), Times.Once);
        }
    }
}
