using MediatR;
using Microsoft.AspNetCore.Identity;
using Moq;
using EDR.Application.CQRS.Email.Notifications;
using EDR.Application.CQRS.OpportunityTracking.Commands;
using EDR.Application.CQRS.OpportunityTracking.Handlers;
using EDR.Application.Services.IContract;
using EDR.Domain.Entities;
using EDR.Domain.Enums;
using EDR.Domain.GenericRepository;
using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace EDR.API.Tests.CQRS.OpportunityTracking
{
    public class OpportunitySentToReviewHandlerTests
    {
        private readonly Mock<IOpportunityHistoryService> _opportunityHistoryServiceMock;
        private readonly Mock<IUserContext> _userContextMock;
        private readonly Mock<UserManager<User>> _userManagerMock;
        private readonly Mock<IRepository<Domain.Entities.OpportunityTracking>> _opportunityRepositoryMock;
        private readonly Mock<IMediator> _mediatorMock;
        private readonly OpportunitySentToReviewHandler _handler;

        public OpportunitySentToReviewHandlerTests()
        {
            _opportunityHistoryServiceMock = new Mock<IOpportunityHistoryService>();
            _userContextMock = new Mock<IUserContext>();
            _opportunityRepositoryMock = new Mock<IRepository<Domain.Entities.OpportunityTracking>>();
            _mediatorMock = new Mock<IMediator>();

            var userStoreMock = new Mock<IUserStore<User>>();
            _userManagerMock = new Mock<UserManager<User>>(
                userStoreMock.Object, null, null, null, null, null, null, null, null);

            _handler = new OpportunitySentToReviewHandler(
                _opportunityHistoryServiceMock.Object,
                _userContextMock.Object,
                _userManagerMock.Object,
                _opportunityRepositoryMock.Object,
                _mediatorMock.Object);
        }

        [Fact]
        public async Task Handle_ValidRequest_UpdatesOpportunityAndSendsEmail()
        {
            // Arrange
            var rmId = "rm-1";
            var command = new SendToReviewCommand { OpportunityId = 1, AssignedToId = rmId, Comments = "Sending for review" };
            var opportunity = new Domain.Entities.OpportunityTracking { Id = 1 };
            var assignedManager = new User { Id = rmId, Email = "rm@test.com" };

            _userContextMock.Setup(x => x.GetCurrentUserId()).Returns("user-1");
            _userContextMock.Setup(x => x.GetCurrentUserName()).Returns("User One");

            _opportunityRepositoryMock.Setup(x => x.GetByIdAsync(1))
                .ReturnsAsync(opportunity);

            _userManagerMock.Setup(x => x.FindByIdAsync(rmId))
                .ReturnsAsync(assignedManager);
            _userManagerMock.Setup(x => x.IsInRoleAsync(assignedManager, "Regional Manager"))
                .ReturnsAsync(true);

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(rmId, opportunity.ReviewManagerId);
            Assert.Equal(OpportunityTrackingStatus.BID_SUBMITTED, opportunity.Status);
            _opportunityRepositoryMock.Verify(x => x.UpdateAsync(opportunity), Times.Once);
            _opportunityHistoryServiceMock.Verify(x => x.AddHistoryAsync(It.IsAny<OpportunityHistory>()), Times.Once);
            _mediatorMock.Verify(x => x.Publish(It.IsAny<OpportunityStatusEmailNotification>(), It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task Handle_ManagerNotInRole_ThrowsException()
        {
            // Arrange
            var rmId = "invalid-rm-1";
            var command = new SendToReviewCommand { OpportunityId = 1, AssignedToId = rmId };
            var opportunity = new Domain.Entities.OpportunityTracking { Id = 1 };
            var assignedManager = new User { Id = rmId };

            _opportunityRepositoryMock.Setup(x => x.GetByIdAsync(1))
                .ReturnsAsync(opportunity);

            _userManagerMock.Setup(x => x.FindByIdAsync(rmId))
                .ReturnsAsync(assignedManager);
            _userManagerMock.Setup(x => x.IsInRoleAsync(assignedManager, "Regional Manager"))
                .ReturnsAsync(false);

            // Act & Assert
            await Assert.ThrowsAsync<InvalidOperationException>(() => _handler.Handle(command, CancellationToken.None));
        }
    }
}
