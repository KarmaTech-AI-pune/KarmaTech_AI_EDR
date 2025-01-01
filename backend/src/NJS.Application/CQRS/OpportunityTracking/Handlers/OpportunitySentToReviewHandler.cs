using MediatR;
using NJS.Application.CQRS.OpportunityTracking.Commands;
using NJS.Application.Dtos;
using NJS.Application.Services.IContract;
using NJS.Domain.Entities;

namespace NJS.Application.CQRS.OpportunityTracking.Handlers
{
    public class OpportunitySentToReviewHandler : IRequestHandler<OppertunityWorkflowCommand, OppertunityWorkflowDto>
    {
        private readonly IOpportunityHistoryService _opportunityHistoryService;
        private readonly IUserContext _userContext;

        public OpportunitySentToReviewHandler(IOpportunityHistoryService opportunityHistoryService,
            IUserContext userContext)
        {
            _opportunityHistoryService = opportunityHistoryService;
            _userContext = userContext;
        }

        public async Task<OppertunityWorkflowDto> Handle(OppertunityWorkflowCommand request, CancellationToken cancellationToken)
        {
            var currentUser = _userContext.GetCurrentUserId();

            var entity = new OpportunityHistory
            {
                OpportunityId = request.OppertunityId,
                Action = "Sent to review",
                ActionBy = currentUser,
                StatusId = 2, // consider is a fixed Id for status, please Db opportunityStatuses table and seed
                ActionDate = DateTime.UtcNow,
                AssignedToId = request.AssignedToId,
                Comments =request.Commnets
            };
            return new OppertunityWorkflowDto();
        }
    }
}
