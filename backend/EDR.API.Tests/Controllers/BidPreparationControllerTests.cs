using System.Collections.Generic;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;
using EDR.API.Controllers;
using EDR.Application.CQRS.Commands.BidPreparation;
using EDR.Application.CQRS.Queries.BidPreparation;
using EDR.Application.Dtos;

namespace EDR.API.Tests.Controllers
{
    public class BidPreparationControllerTests
    {
        private readonly Mock<IMediator> _mediatorMock;
        private readonly BidPreparationController _controller;

        public BidPreparationControllerTests()
        {
            _mediatorMock = new Mock<IMediator>();
            _controller = new BidPreparationController(_mediatorMock.Object);

            var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.NameIdentifier, "user1"),
                new Claim(ClaimTypes.Name, "TestUser"),
                new Claim(ClaimTypes.Role, "Regional Manager")
            }, "mock"));

            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = user }
            };
        }

        [Fact]
        public async Task Get_ValidId_ReturnsOkResult()
        {
            // Arrange
            var dto = new BidPreparationDto { OpportunityId = 1, DocumentCategoriesJson = "{}" };
            _mediatorMock.Setup(m => m.Send(It.IsAny<GetBidPreparationQuery>(), CancellationToken.None))
                .ReturnsAsync(dto);

            // Act
            var result = await _controller.Get(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnValue = Assert.IsType<BidPreparationDto>(okResult.Value);
            Assert.Equal(1, returnValue.OpportunityId);
        }

        [Fact]
        public async Task Get_InvalidId_ReturnsNotFound()
        {
            // Arrange
            _mediatorMock.Setup(m => m.Send(It.IsAny<GetBidPreparationQuery>(), CancellationToken.None))
                .ReturnsAsync((BidPreparationDto)null);

            // Act
            var result = await _controller.Get(999);

            // Assert
            Assert.IsType<NotFoundResult>(result.Result);
        }

        [Fact]
        public async Task GetVersionHistory_ReturnsOkResult()
        {
            // Arrange
            var list = new List<BidVersionHistoryDto> { new BidVersionHistoryDto { Version = 1 } };
            _mediatorMock.Setup(m => m.Send(It.IsAny<GetBidVersionHistoryQuery>(), CancellationToken.None))
                .ReturnsAsync(list);

            // Act
            var result = await _controller.GetVersionHistory(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnValue = Assert.IsType<List<BidVersionHistoryDto>>(okResult.Value);
            Assert.Single(returnValue);
        }

        [Fact]
        public async Task Update_ValidData_ReturnsCreatedAtAction()
        {
            // Arrange
            var updateDto = new BidPreparationUpdateDto { OpportunityId = 1, Comments = "Test" };
            _mediatorMock.Setup(m => m.Send(It.IsAny<UpdateBidPreparationCommand>(), CancellationToken.None))
                .ReturnsAsync(true);

            // Act
            var result = await _controller.Update(updateDto);

            // Assert
            var createdResult = Assert.IsType<CreatedAtActionResult>(result.Result);
            Assert.Equal("Get", createdResult.ActionName);
        }
        
        [Fact]
        public async Task Update_Failure_ReturnsBadRequest()
        {
            // Arrange
            var updateDto = new BidPreparationUpdateDto { OpportunityId = 1, Comments = "Test" };
            _mediatorMock.Setup(m => m.Send(It.IsAny<UpdateBidPreparationCommand>(), CancellationToken.None))
                .ReturnsAsync(false);

            // Act
            var result = await _controller.Update(updateDto);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result.Result);
        }

        [Fact]
        public async Task SubmitForApproval_Success_ReturnsOk()
        {
            // Arrange
            _mediatorMock.Setup(m => m.Send(It.IsAny<SubmitBidPreparationCommand>(), CancellationToken.None))
                .ReturnsAsync(true);

            // Act
            var result = await _controller.SubmitForApproval(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            Assert.True((bool)okResult.Value);
        }

        [Fact]
        public async Task ApproveOrReject_Success_ReturnsOk()
        {
            // Arrange
            var approvalDto = new BidPreparationApprovalDto { IsApproved = true, Comments = "Good" };
            _mediatorMock.Setup(m => m.Send(It.IsAny<ApproveBidPreparationCommand>(), CancellationToken.None))
                .ReturnsAsync(true);

            // Act
            var result = await _controller.ApproveOrReject(1, approvalDto);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            Assert.True((bool)okResult.Value);
        }
    }
}
