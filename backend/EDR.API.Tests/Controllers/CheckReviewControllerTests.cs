using MediatR;
using Microsoft.AspNetCore.Mvc;
using Moq;
using EDR.Application.DTOs;
using EDR.Application.CQRS.CheckReview.Commands;
using EDR.Application.CQRS.CheckReview.Queries;
using EDR.Application.Services.IContract;
using EDR.API.Controllers;

namespace EDR.API.Tests.Controllers
{
    /// <summary>
    /// Unit tests for CheckReviewController: GetAll, GetById, GetByProject, Create, Update, Delete.
    /// </summary>
    public class CheckReviewControllerTests
    {
        private readonly Mock<IMediator> _mediator;
        private readonly Mock<ICurrentUserService> _currentUserService;
        private readonly CheckReviewController _controller;

        public CheckReviewControllerTests()
        {
            _mediator = new Mock<IMediator>();
            _currentUserService = new Mock<ICurrentUserService>();
            _currentUserService.Setup(s => s.IsAuthenticated).Returns(true);
            _currentUserService.Setup(s => s.UserName).Returns("testuser@test.com");
            _controller = new CheckReviewController(_mediator.Object, _currentUserService.Object);
        }

        private CheckReviewDto BuildDto(int id = 1, int projectId = 1) => new()
        {
            Id = id,
            ProjectId = projectId,
            ActivityNo = "A1",
            ActivityName = "Design Review",
            DocumentNumber = "DOC-001",
            DocumentName = "Design Document",
            Objective = "Review design quality",
            CheckedBy = "user1",
            ApprovedBy = "manager1"
        };

        // ==================== GetAll ====================

        [Fact]
        public async Task GetAll_ShouldReturnOk_Always()
        {
            // Act
            var result = await _controller.GetAll();

            // Assert
            Assert.IsType<OkObjectResult>(result.Result);
        }

        // ==================== GetById ====================

        [Fact]
        public async Task GetById_ShouldReturnOk_WhenFound()
        {
            // Arrange
            var dto = BuildDto();
            _mediator.Setup(m => m.Send(It.IsAny<GetCheckReviewByIdQuery>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync(dto);

            // Act
            var result = await _controller.GetById(1);

            // Assert
            var ok = Assert.IsType<OkObjectResult>(result.Result);
            Assert.IsType<CheckReviewDto>(ok.Value);
        }

        [Fact]
        public async Task GetById_ShouldReturnNotFound_WhenNull()
        {
            // Arrange
            _mediator.Setup(m => m.Send(It.IsAny<GetCheckReviewByIdQuery>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync((CheckReviewDto)null);

            // Act
            var result = await _controller.GetById(999);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result.Result);
        }

        [Fact]
        public async Task GetById_ShouldReturn500_WhenExceptionThrown()
        {
            // Arrange
            _mediator.Setup(m => m.Send(It.IsAny<GetCheckReviewByIdQuery>(), It.IsAny<CancellationToken>()))
                     .ThrowsAsync(new Exception("DB error"));

            // Act
            var result = await _controller.GetById(1);

            // Assert
            var statusResult = Assert.IsType<ObjectResult>(result.Result);
            Assert.Equal(500, statusResult.StatusCode);
        }

        // ==================== GetByProject ====================

        [Fact]
        public async Task GetByProject_ShouldReturnOk_WhenFound()
        {
            // Arrange
            var list = new List<CheckReviewDto> { BuildDto(1), BuildDto(2) };
            _mediator.Setup(m => m.Send(It.IsAny<GetCheckReviewsByProjectQuery>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync(list);

            // Act
            var result = await _controller.GetByProject(1);

            // Assert
            Assert.IsType<OkObjectResult>(result.Result);
        }

        [Fact]
        public async Task GetByProject_ShouldReturn500_WhenExceptionThrown()
        {
            // Arrange
            _mediator.Setup(m => m.Send(It.IsAny<GetCheckReviewsByProjectQuery>(), It.IsAny<CancellationToken>()))
                     .ThrowsAsync(new Exception("DB error"));

            // Act
            var result = await _controller.GetByProject(1);

            // Assert
            var statusResult = Assert.IsType<ObjectResult>(result.Result);
            Assert.Equal(500, statusResult.StatusCode);
        }

        // ==================== Create ====================

        [Fact]
        public async Task Create_ShouldReturnCreated_WhenSuccessful()
        {
            // Arrange
            var command = new CreateCheckReviewCommand
            {
                ProjectId = 1,
                ActivityNo = "A1",
                ActivityName = "Design Review"
            };
            var createdDto = BuildDto(10);
            _mediator.Setup(m => m.Send(It.IsAny<CreateCheckReviewCommand>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync(createdDto);

            // Act
            var result = await _controller.Create(command);

            // Assert
            Assert.IsType<CreatedAtActionResult>(result.Result);
        }

        [Fact]
        public async Task Create_ShouldReturnBadRequest_WhenCommandIsNull()
        {
            // Act
            var result = await _controller.Create(null);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result.Result);
        }

        [Fact]
        public async Task Create_ShouldReturn500_WhenExceptionThrown()
        {
            // Arrange
            var command = new CreateCheckReviewCommand { ProjectId = 1 };
            _mediator.Setup(m => m.Send(It.IsAny<CreateCheckReviewCommand>(), It.IsAny<CancellationToken>()))
                     .ThrowsAsync(new Exception("DB error"));

            // Act
            var result = await _controller.Create(command);

            // Assert
            var statusResult = Assert.IsType<ObjectResult>(result.Result);
            Assert.Equal(500, statusResult.StatusCode);
        }

        // ==================== Update ====================

        [Fact]
        public async Task Update_ShouldReturnOk_WhenSuccessful()
        {
            // Arrange
            var command = new UpdateCheckReviewCommand { Id = 5, ProjectId = 1, ActivityName = "Updated" };
            var updatedDto = BuildDto(5);
            _mediator.Setup(m => m.Send(It.IsAny<UpdateCheckReviewCommand>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync(updatedDto);

            // Act
            var result = await _controller.Update(5, command);

            // Assert
            Assert.IsType<OkObjectResult>(result.Result);
        }

        [Fact]
        public async Task Update_ShouldReturnBadRequest_WhenCommandIsNull()
        {
            // Act
            var result = await _controller.Update(5, null);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result.Result);
        }

        [Fact]
        public async Task Update_ShouldReturnBadRequest_WhenIdMismatch()
        {
            // Arrange
            var command = new UpdateCheckReviewCommand { Id = 99 };

            // Act
            var result = await _controller.Update(5, command);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result.Result);
        }

        [Fact]
        public async Task Update_ShouldReturnNotFound_WhenKeyNotFound()
        {
            // Arrange
            var command = new UpdateCheckReviewCommand { Id = 5, ProjectId = 1 };
            _mediator.Setup(m => m.Send(It.IsAny<UpdateCheckReviewCommand>(), It.IsAny<CancellationToken>()))
                     .ThrowsAsync(new KeyNotFoundException("Not found"));

            // Act
            var result = await _controller.Update(5, command);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result.Result);
        }

        [Fact]
        public async Task Update_ShouldReturn500_WhenExceptionThrown()
        {
            // Arrange
            var command = new UpdateCheckReviewCommand { Id = 5, ProjectId = 1 };
            _mediator.Setup(m => m.Send(It.IsAny<UpdateCheckReviewCommand>(), It.IsAny<CancellationToken>()))
                     .ThrowsAsync(new Exception("DB error"));

            // Act
            var result = await _controller.Update(5, command);

            // Assert
            var statusResult = Assert.IsType<ObjectResult>(result.Result);
            Assert.Equal(500, statusResult.StatusCode);
        }

        // ==================== Delete ====================

        [Fact]
        public async Task Delete_ShouldReturnNoContent_WhenSuccessful()
        {
            // Arrange
            _mediator.Setup(m => m.Send(It.IsAny<DeleteCheckReviewCommand>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync(true);

            // Act
            var result = await _controller.Delete(1);

            // Assert
            Assert.IsType<NoContentResult>(result);
        }

        [Fact]
        public async Task Delete_ShouldReturnNotFound_WhenNotFound()
        {
            // Arrange
            _mediator.Setup(m => m.Send(It.IsAny<DeleteCheckReviewCommand>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync(false);

            // Act
            var result = await _controller.Delete(999);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        [Fact]
        public async Task Delete_ShouldReturn500_WhenExceptionThrown()
        {
            // Arrange
            _mediator.Setup(m => m.Send(It.IsAny<DeleteCheckReviewCommand>(), It.IsAny<CancellationToken>()))
                     .ThrowsAsync(new Exception("DB error"));

            // Act
            var result = await _controller.Delete(1);

            // Assert
            var statusResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, statusResult.StatusCode);
        }
    }
}
