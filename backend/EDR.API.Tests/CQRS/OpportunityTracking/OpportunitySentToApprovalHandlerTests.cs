using MediatR;
using Microsoft.AspNetCore.Identity;
using Moq;
using EDR.Application.CQRS.Email.Notifications;
using EDR.Application.CQRS.OpportunityTracking.Commands;
using EDR.Application.CQRS.OpportunityTracking.Handlers;
using EDR.Application.Services.IContract;
using EDR.Domain.Entities;
using EDR.Domain.GenericRepository;
using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace EDR.API.Tests.CQRS.OpportunityTracking
{
    public class OpportunitySentToApprovalHandlerTests
    {
        private readonly Mock<IOpportunityHistoryService> _opportunityHistoryServiceMock;
        private readonly Mock<IRepository<Domain.Entities.OpportunityTracking>> _opportunityRepositoryMock;
        private readonly Mock<IUserContext> _userContextMock;
        private readonly Mock<RoleManager<Role>> _roleManagerMock;
        private readonly Mock<UserManager<User>> _userManagerMock;
        private readonly Mock<IMediator> _mediatorMock;
        private readonly OpportunitySentToApprovalHandler _handler;

        public OpportunitySentToApprovalHandlerTests()
        {
            _opportunityHistoryServiceMock = new Mock<IOpportunityHistoryService>();
            _opportunityRepositoryMock = new Mock<IRepository<Domain.Entities.OpportunityTracking>>();
            _userContextMock = new Mock<IUserContext>();
            _mediatorMock = new Mock<IMediator>();

            var roleStoreMock = new Mock<IRoleStore<Role>>();
            _roleManagerMock = new Mock<RoleManager<Role>>(roleStoreMock.Object, null, null, null, null);

            var userStoreMock = new Mock<IUserStore<User>>();
            _userManagerMock = new Mock<UserManager<User>>(
                userStoreMock.Object, null, null, null, null, null, null, null, null);

            _handler = new OpportunitySentToApprovalHandler(
                _opportunityHistoryServiceMock.Object,
                _userContextMock.Object,
                _userManagerMock.Object,
                _roleManagerMock.Object,
                _opportunityRepositoryMock.Object,
                _mediatorMock.Object);
        }

        [Fact]
        public async Task Handle_SentToApproval_UpdatesOpportunityAndSendsEmail()
        {
            // Arrange
            var dirId = "rd-1";
            var command = new SendToApprovalCommand { OpportunityId = 1, Action = "Approve", AssignedToId = dirId, Comments = "Sending for Approval" };
            var opportunity = new Domain.Entities.OpportunityTracking { Id = 1 };

            _userContextMock.Setup(x => x.GetCurrentUserId()).Returns("user-1");
            _userContextMock.Setup(x => x.GetCurrentUserName()).Returns("User One");

            _opportunityRepositoryMock.Setup(x => x.GetByIdAsync(1))
                .ReturnsAsync(opportunity);

            _userManagerMock.Setup(x => x.FindByIdAsync(dirId))
                .ReturnsAsync(new User { Id = dirId, Email = "rd@test.com" });

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(dirId, opportunity.ApprovalManagerId);
            _opportunityRepositoryMock.Verify(x => x.UpdateAsync(opportunity), Times.Once);
            _opportunityHistoryServiceMock.Verify(x => x.AddHistoryAsync(It.IsAny<OpportunityHistory>()), Times.Once);
            _mediatorMock.Verify(x => x.Publish(It.IsAny<OpportunityStatusEmailNotification>(), It.IsAny<CancellationToken>()), Times.Once);
        }
    }
}
