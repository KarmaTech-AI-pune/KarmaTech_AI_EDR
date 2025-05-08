using MediatR;
using Microsoft.AspNetCore.Mvc;
using Moq;
using NJS.Application.Services.IContract;
using NJS.Domain.Entities;
using NJS.Domain.Repositories;
using NJSAPI.Controllers;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;

namespace NJS.API.Tests.Controllers
{
    public class GoNoGoDecisionControllerTests
    {
        private readonly Mock<IGoNoGoDecisionRepository> _repositoryMock;
        private readonly Mock<IGoNoGoDecisionService> _serviceMock;
        private readonly Mock<IMediator> _mediatorMock;
        private readonly GoNoGoDecisionController _controller;

        public GoNoGoDecisionControllerTests()
        {
            _repositoryMock = new Mock<IGoNoGoDecisionRepository>();
            _serviceMock = new Mock<IGoNoGoDecisionService>();
            _mediatorMock = new Mock<IMediator>();
            _controller = new GoNoGoDecisionController(_repositoryMock.Object, _mediatorMock.Object, _serviceMock.Object);
        }

        [Fact]
        public void GetAll_ReturnsOkResultWithDecisions()
        {
            // Arrange
            var decisions = new List<GoNoGoDecision>
            {
                new GoNoGoDecision { Id = 1, ProjectName = "Project 1" },
                new GoNoGoDecision { Id = 2, ProjectName = "Project 2" }
            };

            _repositoryMock.Setup(r => r.GetAll())
                .Returns(decisions);

            // Act
            var result = _controller.GetAll();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnValue = Assert.IsAssignableFrom<IEnumerable<GoNoGoDecision>>(okResult.Value);
            Assert.Equal(2, ((List<GoNoGoDecision>)returnValue).Count);
        }

        [Fact]
        public void GetAll_ThrowsException_ReturnsStatusCode500()
        {
            // Arrange
            _repositoryMock.Setup(r => r.GetAll())
                .Throws(new Exception("Test exception"));

            // Act
            var result = _controller.GetAll();

            // Assert
            var statusCodeResult = Assert.IsType<ObjectResult>(result.Result);
            Assert.Equal(500, statusCodeResult.StatusCode);
            Assert.Contains("Internal server error", statusCodeResult.Value.ToString());
        }

        [Fact]
        public async Task GetById_WithValidId_ReturnsOkResultWithDecision()
        {
            // Arrange
            var decisionId = 1;
            var decision = new GoNoGoDecision { Id = decisionId, ProjectName = "Project 1" };

            _repositoryMock.Setup(r => r.GetById(decisionId))
                .ReturnsAsync(decision);

            // Act
            var result = await _controller.GetById(decisionId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnValue = Assert.IsType<GoNoGoDecision>(okResult.Value);
            Assert.Equal(decisionId, returnValue.Id);
        }

        [Fact]
        public async Task GetById_WithInvalidId_ReturnsNotFound()
        {
            // Arrange
            var decisionId = 999;

            _repositoryMock.Setup(r => r.GetById(decisionId))
                .ReturnsAsync((GoNoGoDecision)null);

            // Act
            var result = await _controller.GetById(decisionId);

            // Assert
            Assert.IsType<NotFoundResult>(result.Result);
        }

        [Fact]
        public async Task GetById_ThrowsException_ReturnsStatusCode500()
        {
            // Arrange
            var decisionId = 1;

            _repositoryMock.Setup(r => r.GetById(decisionId))
                .ThrowsAsync(new Exception("Test exception"));

            // Act
            var result = await _controller.GetById(decisionId);

            // Assert
            var statusCodeResult = Assert.IsType<ObjectResult>(result.Result);
            Assert.Equal(500, statusCodeResult.StatusCode);
            Assert.Contains("Internal server error", statusCodeResult.Value.ToString());
        }

        [Fact]
        public async Task Create_WithValidData_ReturnsCreatedAtActionResult()
        {
            // Arrange
            var decision = new GoNoGoDecision { ProjectName = "New Project" };
            var createdDecisionId = 1;

            _repositoryMock.Setup(r => r.Create(It.IsAny<GoNoGoDecision>()))
                .ReturnsAsync(createdDecisionId);

            var createdDecision = new GoNoGoDecision { Id = createdDecisionId, ProjectName = decision.ProjectName };

            _repositoryMock.Setup(r => r.GetById(createdDecisionId))
                .ReturnsAsync(createdDecision);

            // Act
            var result = await _controller.Create(decision);

            // Assert
            var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(result.Result);
            Assert.Equal(nameof(_controller.GetById), createdAtActionResult.ActionName);
            Assert.Equal(createdDecisionId, createdAtActionResult.RouteValues["id"]);
            var returnValue = Assert.IsType<GoNoGoDecision>(createdAtActionResult.Value);
            Assert.Equal(createdDecisionId, returnValue.Id);
        }

        [Fact]
        public async Task Create_ThrowsException_ReturnsStatusCode500()
        {
            // Arrange
            var decision = new GoNoGoDecision { ProjectName = "New Project" };

            _repositoryMock.Setup(r => r.Create(It.IsAny<GoNoGoDecision>()))
                .ThrowsAsync(new Exception("Test exception"));

            // Act
            var result = await _controller.Create(decision);

            // Assert
            var statusCodeResult = Assert.IsType<ObjectResult>(result.Result);
            Assert.Equal(500, statusCodeResult.StatusCode);
            Assert.Contains("Internal server error", statusCodeResult.Value.ToString());
        }

        [Fact]
        public async Task Update_WithValidData_ReturnsOkResult()
        {
            // Arrange
            var decisionId = 1;
            var decision = new GoNoGoDecision { Id = decisionId, ProjectName = "Updated Project" };

            _repositoryMock.Setup(r => r.Update(It.IsAny<GoNoGoDecision>()))
                .ReturnsAsync(true);

            _repositoryMock.Setup(r => r.GetById(decisionId))
                .ReturnsAsync(decision);

            // Act
            var result = await _controller.Update(decisionId, decision);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnValue = Assert.IsType<GoNoGoDecision>(okResult.Value);
            Assert.Equal(decisionId, returnValue.Id);
        }

        [Fact]
        public async Task Update_WithMismatchedId_ReturnsBadRequest()
        {
            // Arrange
            var decisionId = 1;
            var decision = new GoNoGoDecision { Id = 2, ProjectName = "Updated Project" };

            // Act
            var result = await _controller.Update(decisionId, decision);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result.Result);
        }

        [Fact]
        public async Task Update_WithNonExistentId_ReturnsNotFound()
        {
            // Arrange
            var decisionId = 999;
            var decision = new GoNoGoDecision { Id = decisionId, ProjectName = "Updated Project" };

            _repositoryMock.Setup(r => r.Update(It.IsAny<GoNoGoDecision>()))
                .ReturnsAsync(false);

            // Act
            var result = await _controller.Update(decisionId, decision);

            // Assert
            Assert.IsType<NotFoundResult>(result.Result);
        }

        [Fact]
        public async Task Update_ThrowsException_ReturnsStatusCode500()
        {
            // Arrange
            var decisionId = 1;
            var decision = new GoNoGoDecision { Id = decisionId, ProjectName = "Updated Project" };

            _repositoryMock.Setup(r => r.Update(It.IsAny<GoNoGoDecision>()))
                .ThrowsAsync(new Exception("Test exception"));

            // Act
            var result = await _controller.Update(decisionId, decision);

            // Assert
            var statusCodeResult = Assert.IsType<ObjectResult>(result.Result);
            Assert.Equal(500, statusCodeResult.StatusCode);
            Assert.Contains("Internal server error", statusCodeResult.Value.ToString());
        }

        [Fact]
        public async Task Delete_WithValidId_ReturnsNoContent()
        {
            // Arrange
            var decisionId = 1;

            _repositoryMock.Setup(r => r.Delete(decisionId))
                .ReturnsAsync(true);

            // Act
            var result = await _controller.Delete(decisionId);

            // Assert
            Assert.IsType<NoContentResult>(result);
        }

        [Fact]
        public async Task Delete_WithInvalidId_ReturnsNotFound()
        {
            // Arrange
            var decisionId = 999;

            _repositoryMock.Setup(r => r.Delete(decisionId))
                .ReturnsAsync(false);

            // Act
            var result = await _controller.Delete(decisionId);

            // Assert
            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public async Task Delete_ThrowsException_ReturnsStatusCode500()
        {
            // Arrange
            var decisionId = 1;

            _repositoryMock.Setup(r => r.Delete(decisionId))
                .ThrowsAsync(new Exception("Test exception"));

            // Act
            var result = await _controller.Delete(decisionId);

            // Assert
            var statusCodeResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, statusCodeResult.StatusCode);
            Assert.Contains("Internal server error", statusCodeResult.Value.ToString());
        }
    }
}
