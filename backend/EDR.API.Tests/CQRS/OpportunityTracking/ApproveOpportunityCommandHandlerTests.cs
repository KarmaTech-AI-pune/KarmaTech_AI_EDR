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
    public class ApproveOpportunityCommandHandlerTests
    {
        private readonly Mock<IRepository<Domain.Entities.OpportunityTracking>> _opportunityRepositoryMock;
        private readonly Mock<IRepository<OpportunityHistory>> _historyRepositoryMock;
        private readonly Mock<IUserContext> _userContextMock;
        private readonly Mock<IMediator> _mediatorMock;
        private readonly Mock<UserManager<User>> _userManagerMock;
        private readonly ApproveOpportunityCommandHandler _handler;

        public ApproveOpportunityCommandHandlerTests()
        {
            _opportunityRepositoryMock = new Mock<IRepository<Domain.Entities.OpportunityTracking>>();
            _historyRepositoryMock = new Mock<IRepository<OpportunityHistory>>();
            _userContextMock = new Mock<IUserContext>();
            _mediatorMock = new Mock<IMediator>();

            var userStoreMock = new Mock<IUserStore<User>>();
            _userManagerMock = new Mock<UserManager<User>>(
                userStoreMock.Object, null, null, null, null, null, null, null, null);

            _handler = new ApproveOpportunityCommandHandler(
                _opportunityRepositoryMock.Object,
                _historyRepositoryMock.Object,
                _userContextMock.Object,
                _mediatorMock.Object,
                _userManagerMock.Object);
        }

        [Fact]
        public async Task Handle_ApproveAction_UpdatesOpportunityAndSendsEmail()
        {
            // Arrange
            var command = new SendToApproveCommand { OpportunityId = 1, Action = "Approve", Comments = "Approved" };
            var opportunity = new Domain.Entities.OpportunityTracking { Id = 1, BidManagerId = "bid-mgr-1" };
            
            _userContextMock.Setup(x => x.GetCurrentUserId()).Returns("user-1");
            _userContextMock.Setup(x => x.GetCurrentUserName()).Returns("User One");
            
            _opportunityRepositoryMock.Setup(x => x.GetByIdAsync(1))
                .ReturnsAsync(opportunity);

            _userManagerMock.Setup(x => x.FindByIdAsync("bid-mgr-1"))
                .ReturnsAsync(new User { Id = "bid-mgr-1", Email = "bidmgr@test.com" });

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(OpportunityTrackingStatus.BID_ACCEPTED, opportunity.Status);
            _opportunityRepositoryMock.Verify(x => x.UpdateAsync(opportunity), Times.Once);
            _historyRepositoryMock.Verify(x => x.AddAsync(It.IsAny<OpportunityHistory>()), Times.Once);
            _historyRepositoryMock.Verify(x => x.SaveChangesAsync(), Times.Once);
            _mediatorMock.Verify(x => x.Publish(It.IsAny<OpportunityStatusEmailNotification>(), It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task Handle_RejectAction_UpdatesOpportunityAndSendsEmail()
        {
            // Arrange
            var command = new SendToApproveCommand { OpportunityId = 1, Action = "Reject", Comments = "Rejected" };
            var opportunity = new Domain.Entities.OpportunityTracking { Id = 1, ReviewManagerId = "rm-1" };
            
            _userContextMock.Setup(x => x.GetCurrentUserId()).Returns("user-1");
            _userContextMock.Setup(x => x.GetCurrentUserName()).Returns("User One");
            
            _opportunityRepositoryMock.Setup(x => x.GetByIdAsync(1))
                .ReturnsAsync(opportunity);

            _userManagerMock.Setup(x => x.FindByIdAsync("rm-1"))
                .ReturnsAsync(new User { Id = "rm-1", Email = "rm@test.com" });

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(OpportunityTrackingStatus.BID_REJECTED, opportunity.Status);
            _opportunityRepositoryMock.Verify(x => x.UpdateAsync(opportunity), Times.Once);
            _historyRepositoryMock.Verify(x => x.AddAsync(It.IsAny<OpportunityHistory>()), Times.Once);
            _historyRepositoryMock.Verify(x => x.SaveChangesAsync(), Times.Once);
            _mediatorMock.Verify(x => x.Publish(It.IsAny<OpportunityStatusEmailNotification>(), It.IsAny<CancellationToken>()), Times.Once);
        }
    }
}
