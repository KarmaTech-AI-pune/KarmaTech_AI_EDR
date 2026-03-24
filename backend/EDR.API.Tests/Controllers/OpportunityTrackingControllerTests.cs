using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;
using EDR.API.Controllers;
using EDR.Application.CQRS.OpportunityTracking.Commands;
using EDR.Application.CQRS.OpportunityTracking.Queries;
using EDR.Application.Dtos;

namespace EDR.API.Tests.Controllers
{
    public class OpportunityTrackingControllerTests
    {
        private readonly Mock<IMediator> _mediatorMock;
        private readonly OpportunityTrackingController _controller;

        public OpportunityTrackingControllerTests()
        {
            _mediatorMock = new Mock<IMediator>();
            _controller = new OpportunityTrackingController(_mediatorMock.Object);
        }

        [Fact]
        public async Task GetOpportunityTrackings_ReturnsOk()
        {
            _mediatorMock.Setup(m => m.Send(It.IsAny<GetAllOpportunityTrackingsQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new List<OpportunityTrackingDto>());

            var result = await _controller.GetOpportunityTrackings();

            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task GetOpportunityTracking_ReturnsOk_WhenFound()
        {
            _mediatorMock.Setup(m => m.Send(It.IsAny<GetOpportunityTrackingByIdQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new OpportunityTrackingDto { Id = 1 });

            var result = await _controller.GetOpportunityTracking(1);

            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task GetOpportunityTracking_ReturnsNotFound_WhenNull()
        {
            _mediatorMock.Setup(m => m.Send(It.IsAny<GetOpportunityTrackingByIdQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((OpportunityTrackingDto)null);

            var result = await _controller.GetOpportunityTracking(1);

            Assert.IsType<NotFoundObjectResult>(result);
        }

        [Fact]
        public async Task CreateOpportunityTracking_ReturnsCreatedAtAction()
        {
            var command = new CreateOpportunityTrackingCommand();
            _mediatorMock.Setup(m => m.Send(It.IsAny<CreateOpportunityTrackingCommand>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new OpportunityTrackingDto { Id = 1 });

            var result = await _controller.CreateOpportunityTracking(command);

            Assert.IsType<CreatedAtActionResult>(result);
        }

        [Fact]
        public async Task UpdateOpportunityTracking_ReturnsOk()
        {
            var command = new UpdateOpportunityTrackingCommand { Id = 1 };
            _mediatorMock.Setup(m => m.Send(It.IsAny<UpdateOpportunityTrackingCommand>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new OpportunityTrackingDto { Id = 1 });

            var result = await _controller.UpdateOpportunityTracking(1, command);

            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task UpdateOpportunityTracking_ReturnsBadRequest_OnIdMismatch()
        {
            var command = new UpdateOpportunityTrackingCommand { Id = 2 };

            var result = await _controller.UpdateOpportunityTracking(1, command);

            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task DeleteOpportunityTracking_ReturnsNoContent()
        {
            _mediatorMock.Setup(m => m.Send(It.IsAny<DeleteOpportunityTrackingCommand>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);

            var result = await _controller.DeleteOpportunityTracking(1);

            Assert.IsType<NoContentResult>(result);
        }

        [Fact]
        public async Task DeleteOpportunityTracking_ReturnsNotFound()
        {
            _mediatorMock.Setup(m => m.Send(It.IsAny<DeleteOpportunityTrackingCommand>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(false);

            var result = await _controller.DeleteOpportunityTracking(1);

            Assert.IsType<NotFoundObjectResult>(result);
        }

        [Fact]
        public async Task SendToReview_ReturnsOk()
        {
            // SendToReviewCommand returns OpportunityTrackingDto
            _mediatorMock.Setup(m => m.Send(It.IsAny<SendToReviewCommand>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new OpportunityTrackingDto { Id = 1 });

            var command = new SendToReviewCommand();
            var result = await _controller.SendToReview(command);

            Assert.IsType<OkObjectResult>(result);
        }
    }
}
