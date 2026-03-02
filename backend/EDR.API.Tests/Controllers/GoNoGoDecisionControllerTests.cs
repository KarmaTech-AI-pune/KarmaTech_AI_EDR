using MediatR;
using Microsoft.AspNetCore.Mvc;
using Moq;
using EDR.Application.Services.IContract;
using EDR.Domain.Entities;
using EDR.Repositories.Interfaces;
using EDR.API.Controllers;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;
using EDR.Application.Dtos;

namespace EDR.API.Tests.Controllers
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
            var decisions = new List<GoNoGoSummaryDto>
            {
                new GoNoGoSummaryDto { Id = 1, ProjectId = 1 },
                new GoNoGoSummaryDto { Id = 2, ProjectId = 2 }
            };

            _serviceMock.Setup(s => s.GetAllWithCappingInfo())
                .Returns(decisions);

            // Act
            var result = _controller.GetAll();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnValue = Assert.IsAssignableFrom<IEnumerable<GoNoGoSummaryDto>>(okResult.Value);
            Assert.Equal(2, ((List<GoNoGoSummaryDto>)returnValue).Count);
        }

        [Fact]
        public void GetAll_ThrowsException_ReturnsStatusCode500()
        {
            // Arrange
            _serviceMock.Setup(s => s.GetAllWithCappingInfo())
                .Throws(new Exception("Test exception"));

            // Act
            var result = _controller.GetAll();

            // Assert
            var statusCodeResult = Assert.IsType<ObjectResult>(result.Result);
            Assert.Equal(500, statusCodeResult.StatusCode);
            Assert.Contains("Internal server error", statusCodeResult.Value.ToString());
        }

        [Fact]
        public void GetById_WithValidId_ReturnsOkResultWithDecision()
        {
            // Arrange
            var decisionId = 1;
            var decisionDto = new GoNoGoDecisionDto { ProjectId = decisionId };

            _serviceMock.Setup(s => s.GetByIdWithCappingInfo(decisionId))
                .Returns(decisionDto);

            // Act
            var result = _controller.GetById(decisionId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnValue = Assert.IsType<GoNoGoDecisionDto>(okResult.Value);
            Assert.Equal(decisionId, returnValue.ProjectId);
        }

        [Fact]
        public void GetById_WithInvalidId_ReturnsNotFound()
        {
            // Arrange
            var decisionId = 999;

            _serviceMock.Setup(s => s.GetByIdWithCappingInfo(decisionId))
                .Returns((GoNoGoDecisionDto)null);

            // Act
            var result = _controller.GetById(decisionId);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result.Result);
        }

        [Fact]
        public void GetById_ThrowsException_ReturnsStatusCode500()
        {
            // Arrange
            var decisionId = 1;

            _serviceMock.Setup(s => s.GetByIdWithCappingInfo(decisionId))
                .Throws(new Exception("Test exception"));

            // Act
            var result = _controller.GetById(decisionId);

            // Assert
            var statusCodeResult = Assert.IsType<ObjectResult>(result.Result);
            Assert.Equal(500, statusCodeResult.StatusCode);
            Assert.Contains("Internal server error", statusCodeResult.Value.ToString());
        }

        [Fact]
        public void Update_WithValidData_ReturnsNoContent()
        {
            // Arrange
            var decisionId = 1;
            var decision = new GoNoGoDecision { Id = decisionId, ProjectId = 1 };

            _repositoryMock.Setup(r => r.GetById(decisionId))
                .Returns(decision);

            // Act
            var result = _controller.Update(decisionId, decision);

            // Assert
            Assert.IsType<NoContentResult>(result);
            _serviceMock.Verify(s => s.Update(decision), Times.Once);
        }

        [Fact]
        public void Update_WithMismatchedId_ReturnsBadRequest()
        {
            // Arrange
            var decisionId = 1;
            var decision = new GoNoGoDecision { Id = 2 };

            // Act
            var result = _controller.Update(decisionId, decision);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public void Update_WithNonExistentId_ReturnsNotFound()
        {
            // Arrange
            var decisionId = 999;
            var decision = new GoNoGoDecision { Id = decisionId };

            _repositoryMock.Setup(r => r.GetById(decisionId))
                .Returns((GoNoGoDecision)null);

            // Act
            var result = _controller.Update(decisionId, decision);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        [Fact]
        public void Update_ThrowsException_ReturnsStatusCode500()
        {
            // Arrange
            var decisionId = 1;
            var decision = new GoNoGoDecision { Id = decisionId };

            _repositoryMock.Setup(r => r.GetById(decisionId))
                .Throws(new Exception("Test exception"));

            // Act
            var result = _controller.Update(decisionId, decision);

            // Assert
            var statusCodeResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, statusCodeResult.StatusCode);
            Assert.Contains("Internal server error", statusCodeResult.Value.ToString());
        }

        [Fact]
        public void Delete_WithValidId_ReturnsNoContent()
        {
            // Arrange
            var decisionId = 1;
            var decision = new GoNoGoDecision { Id = decisionId };

            _repositoryMock.Setup(r => r.GetById(decisionId))
                .Returns(decision);

            // Act
            var result = _controller.Delete(decisionId);

            // Assert
            Assert.IsType<NoContentResult>(result);
            _repositoryMock.Verify(r => r.Delete(decisionId), Times.Once);
        }

        [Fact]
        public void Delete_WithInvalidId_ReturnsNotFound()
        {
            // Arrange
            var decisionId = 999;

            _repositoryMock.Setup(r => r.GetById(decisionId))
                .Returns((GoNoGoDecision)null);

            // Act
            var result = _controller.Delete(decisionId);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        [Fact]
        public void Delete_ThrowsException_ReturnsStatusCode500()
        {
            // Arrange
            var decisionId = 1;

            _repositoryMock.Setup(r => r.GetById(decisionId))
                .Throws(new Exception("Test exception"));

            // Act
            var result = _controller.Delete(decisionId);

            // Assert
            var statusCodeResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, statusCodeResult.StatusCode);
            Assert.Contains("Internal server error", statusCodeResult.Value.ToString());
        }
    }
}
