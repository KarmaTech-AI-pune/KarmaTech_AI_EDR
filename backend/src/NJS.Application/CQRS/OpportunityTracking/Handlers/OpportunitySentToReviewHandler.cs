using MediatR;
using NJS.Application.CQRS.OpportunityTracking.Commands;
using NJS.Application.Dtos;
using NJS.Application.Services.IContract;
using NJS.Domain.Entities;
using NJS.Domain.GenericRepository;

namespace NJS.Application.CQRS.OpportunityTracking.Handlers
{
    /// <summary>
    /// Action performed by BID Manager, sent to Review
    /// This handler to use for sent the opportunity to Regional Manager 
    /// </summary>
    public class OpportunitySentToReviewHandler : IRequestHandler<SendToReviewCommand, OpportunityTrackingDto>
    {
        private readonly IOpportunityHistoryService _opportunityHistoryService;
        private readonly IUserContext _userContext;
        private readonly IRepository<Domain.Entities.OpportunityTracking> _opportunityRepository;
        private readonly IRepository<OpportunityHistory> _historyRepository;
        private readonly IRepository<OpportunityStatus> _statusRepository;
        public OpportunitySentToReviewHandler(IOpportunityHistoryService opportunityHistoryService,
            IUserContext userContext)
        {
            _opportunityHistoryService = opportunityHistoryService;
            _userContext = userContext;
        }

        public async Task<OpportunityTrackingDto> Handle(SendToReviewCommand request, CancellationToken cancellationToken)
        {
            var currentUser = _userContext.GetCurrentUserId();
            var opportunity = await _opportunityRepository.GetByIdAsync(request.OpportunityId);
            if (opportunity == null)
                throw new Exception($"Opportunity with ID {request.OpportunityId} not found");

            // Update opportunity Regional Director           
            opportunity.ReviewManagerId = request.AssignedToId;
            await _opportunityRepository.UpdateAsync(opportunity);

            var entity = new OpportunityHistory
            {
                OpportunityId = request.OpportunityId,
                Action = "Sent to review",
                ActionBy = currentUser,
                StatusId = 2, // consider is a fixed Id for status, please check Db opportunityStatuses table and seed
                ActionDate = DateTime.UtcNow,
                AssignedToId = request.AssignedToId,
                Comments =request.Comments
            };

            await _opportunityHistoryService.AddHistoryAsync(entity);
            return new OpportunityTrackingDto
            {
                Id = opportunity.Id,
                Status = opportunity.Status,
                BidManagerId = opportunity.BidManagerId,
                ReviewManagerId = opportunity.ReviewManagerId,
                ApprovalManagerId = opportunity.ApprovalManagerId,
                Operation = opportunity.Operation,
                WorkName = opportunity.WorkName,
                Client = opportunity.Client,
                ClientSector = opportunity.ClientSector,
                Currency = opportunity.Currency,
                CapitalValue = opportunity.CapitalValue,
                Stage = opportunity.Stage,
                CurrentHistory = new OpportunityHistoryDto
                {
                    Action = "Sent to review",
                    Comments = request.Comments,
                    ActionBy = entity.ActionBy,
                    AssignedToId = entity.AssignedToId,
                    ActionDate = DateTime.UtcNow
                }
            };
        }
       
    }
}
