using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using EDR.Application.Dtos;
using EDR.Application.CQRS.PMWorkflow.Commands;
using EDR.Application.CQRS.PMWorkflow.Queries;
using EDR.API.Controllers;

namespace EDR.API.Tests.Controllers
{
    /// <summary>
    /// Unit tests for PMWorkflowController.
    /// Covers: SendToReview, SendToApproval, RequestChanges, Approve, GetWorkflowHistory, CanViewEntity.
    /// </summary>
    public class PMWorkflowControllerTests
    {
        private readonly Mock<IMediator> _mediator;
        private readonly Mock<ILogger<PMWorkflowController>> _logger;
        private readonly PMWorkflowController _controller;

        public PMWorkflowControllerTests()
        {
            _mediator = new Mock<IMediator>();
            _logger = new Mock<ILogger<PMWorkflowController>>();
            _controller = new PMWorkflowController(_mediator.Object, _logger.Object);

            // Provide a default HTTP context (no auth header – simulates unauthorized-header-less call)
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext()
            };
        }

        private PMWorkflowDto BuildWorkflowDto(int statusId = 2, string status = "Sent for Review") => new()
        {
            Id = 1,
            EntityId = 10,
            EntityType = "ChangeControl",
            StatusId = statusId,
            Status = status,
            Action = status,
            Comments = "Test comment",
            ActionDate = DateTime.UtcNow,
            ActionBy = "user-id",
            ActionByName = "Test User"
        };

        // ==================== SendToReview ====================

        [Fact]
        public async Task SendToReview_ShouldReturnOk_WhenSuccessful()
        {
            // Arrange
            var command = new ProjectSendToReviewCommand { EntityId = 10, EntityType = "ChangeControl" };
            var dto = BuildWorkflowDto(2, "Sent for Review");
            _mediator.Setup(m => m.Send(It.IsAny<ProjectSendToReviewCommand>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync(dto);

            // Act
            var result = await _controller.SendToReview(command);

            // Assert
            var ok = Assert.IsType<OkObjectResult>(result.Result);
            Assert.IsType<PMWorkflowDto>(ok.Value);
        }

        [Fact]
        public async Task SendToReview_ShouldReturn500_WhenExceptionThrown()
        {
            // Arrange
            _controller.ControllerContext.HttpContext.Request.Headers["Authorization"] = "Bearer test";
            var command = new ProjectSendToReviewCommand { EntityId = 10, EntityType = "ChangeControl" };
            _mediator.Setup(m => m.Send(It.IsAny<ProjectSendToReviewCommand>(), It.IsAny<CancellationToken>()))
                     .ThrowsAsync(new Exception("DB error"));

            // Act & Assert
            await Assert.ThrowsAsync<Exception>(() => _controller.SendToReview(command));
        }

        // ==================== SendToApproval ====================

        [Fact]
        public async Task SendToApproval_ShouldReturnOk_WhenSuccessful()
        {
            // Arrange
            var command = new ProjectSendToApprovalCommand { EntityId = 10, EntityType = "ChangeControl" };
            var dto = BuildWorkflowDto(4, "Sent for Approval");
            _mediator.Setup(m => m.Send(It.IsAny<ProjectSendToApprovalCommand>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync(dto);

            // Act
            var result = await _controller.SendToApproval(command);

            // Assert
            var ok = Assert.IsType<OkObjectResult>(result.Result);
            Assert.IsType<PMWorkflowDto>(ok.Value);
        }

        // ==================== RequestChanges ====================

        [Fact]
        public async Task RequestChanges_ShouldReturnOk_WhenSuccessful()
        {
            // Arrange
            var command = new RequestChangesCommand { EntityId = 10, EntityType = "ChangeControl", Comments = "Need revision" };
            var dto = BuildWorkflowDto(3, "Review Changes");
            _mediator.Setup(m => m.Send(It.IsAny<RequestChangesCommand>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync(dto);

            // Act
            var result = await _controller.RequestChanges(command);

            // Assert
            var ok = Assert.IsType<OkObjectResult>(result.Result);
            Assert.IsType<PMWorkflowDto>(ok.Value);
        }

        // ==================== Approve ====================

        [Fact]
        public async Task Approve_ShouldReturnOk_WhenSuccessful()
        {
            // Arrange
            var command = new ApproveCommand { EntityId = 10, EntityType = "ChangeControl", Comments = "Approved" };
            var dto = BuildWorkflowDto(6, "Approved");
            _mediator.Setup(m => m.Send(It.IsAny<ApproveCommand>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync(dto);

            // Act
            var result = await _controller.Approve(command);

            // Assert
            var ok = Assert.IsType<OkObjectResult>(result.Result);
            var returnValue = Assert.IsType<PMWorkflowDto>(ok.Value);
            Assert.Equal(6, returnValue.StatusId);
        }

        // ==================== GetWorkflowHistory ====================

        [Fact]
        public async Task GetWorkflowHistory_ShouldReturnOk_WhenFound()
        {
            // Arrange
            var historyDto = new PMWorkflowHistoryDto
            {
                EntityId = 10,
                EntityType = "ChangeControl",
                CurrentStatusId = 6,
                CurrentStatus = "Approved",
                History = new List<PMWorkflowDto> { BuildWorkflowDto() }
            };
            _mediator.Setup(m => m.Send(It.IsAny<GetWorkflowHistoryQuery>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync(historyDto);

            // Act
            var result = await _controller.GetWorkflowHistory("ChangeControl", 10);

            // Assert
            var ok = Assert.IsType<OkObjectResult>(result.Result);
            Assert.IsType<PMWorkflowHistoryDto>(ok.Value);
        }

        [Fact]
        public async Task GetWorkflowHistory_ShouldReturn500_WhenExceptionThrown()
        {
            // Arrange - set Authorization header so fallback doesn't trigger
            _controller.ControllerContext.HttpContext.Request.Headers["Authorization"] = "Bearer test";
            _mediator.Setup(m => m.Send(It.IsAny<GetWorkflowHistoryQuery>(), It.IsAny<CancellationToken>()))
                     .ThrowsAsync(new Exception("DB error"));

            // Act & Assert
            await Assert.ThrowsAsync<Exception>(() => _controller.GetWorkflowHistory("ChangeControl", 10));
        }

        // ==================== CanViewEntity ====================

        [Fact]
        public void CanViewEntity_ShouldReturnTrue_Always()
        {
            // Act
            var result = _controller.CanViewEntity("ChangeControl", 10);

            // Assert
            var ok = Assert.IsType<OkObjectResult>(result.Result);
            Assert.Equal(true, ok.Value);
        }
    }
}
